# gemini_agent.py
from google import genai
import os
import pandas as pd
import numpy as np
import time

# -----------------------------------------------------------------------------
# Optional Streamlit integration (does not change behavior if Streamlit absent)
# -----------------------------------------------------------------------------
try:
    import streamlit as st
    API_KEY = st.secrets.get("GEMINI_API_KEY")
    HAS_STREAMLIT = True
except (ImportError, FileNotFoundError, KeyError):
    API_KEY = os.getenv("GEMINI_API_KEY")
    HAS_STREAMLIT = False

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Set it in Streamlit secrets or as environment variable")

client = genai.Client(api_key=API_KEY)


# -----------------------------------------------------------------------------
# Helpers (defined BEFORE ask_gemini to avoid NameError)
# -----------------------------------------------------------------------------
def _truncate(text: str, label: str, section_cap: int = 5000) -> str:
    """Hard truncate a block of text to avoid model input overflow."""
    if not isinstance(text, str):
        text = str(text)
    if len(text) > section_cap:
        print(f"[WARN] {label} truncated from {len(text):,} → {section_cap:,} chars")
        return text[:section_cap] + "\n[...truncated...]"
    return text


def generate_statistics(df: pd.DataFrame) -> str:
    """Token-safe, schema-agnostic stats for first N columns."""
    if df is None or len(df) == 0:
        return "No rows."
    out = [f"Total rows: {len(df)}", f"Total columns: {len(df.columns)}"]
    # Limit to avoid huge prompts
    for col in list(df.columns)[:10]:
        s = df[col]
        dtype = s.dtype
        non_null = int(s.notna().sum())
        out.append(f"\n{col} ({dtype}; non-null={non_null})")
        # Numeric summary
        if pd.api.types.is_numeric_dtype(dtype) and non_null > 0:
            try:
                out.append(f"  min={s.min()}, max={s.max()}, mean={s.mean():.3f}, median={s.median():.3f}")
            except Exception:
                pass
        # Categorical/low-cardinality preview
        try:
            nunique = int(s.nunique(dropna=True))
            if nunique <= 10 and non_null > 0:
                top = s.value_counts(dropna=True).head(3).to_dict()
                out.append(f"  top values: {top}")
        except Exception:
            pass
    return "\n".join(out)


def get_relevant_sample(df: pd.DataFrame, question: str) -> str:
    """Return a compact summary/table suited for LLM input (no schema assumptions)."""
    if df is None or len(df) == 0:
        return "No sample."
    q = (question or "").lower()

    # Adaptive sample size to keep prompt small
    if len(df) <= 300:
        sample_n = len(df)
    elif len(df) <= 1000:
        sample_n = 120
    else:
        sample_n = 60

    # Try to detect a plausible numeric sort column if user asks for extremes
    wants_extremes = any(w in q for w in ["highest", "hottest", "largest", "max", "top", "most",
                                          "lowest", "coldest", "smallest", "min", "least", "shortest", "longest"])
    sort_col = None
    ascending = any(w in q for w in ["lowest", "coldest", "smallest", "minimum", "min", "least", "shortest"])

    if wants_extremes:
        # Heuristics: prefer columns with numeric dtype and reasonable cardinality
        numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
        # Light preference ordering by variance (more informative)
        try:
            ranked = sorted(
                ((c, float(df[c].var(skipna=True))) for c in numeric_cols),
                key=lambda t: (np.isnan(t[1]), t[1]),  # NaN variances last
            )
            # Pick the *most* variant (last) unless ascending (still okay; we just choose a col)
            if ranked:
                sort_col = ranked[-1][0]
        except Exception:
            if numeric_cols:
                sort_col = numeric_cols[0]

    # Build compact representation
    try:
        if sort_col and sort_col in df.columns and pd.api.types.is_numeric_dtype(df[sort_col]):
            sub = (df.nsmallest(sample_n, sort_col) if ascending else df.nlargest(sample_n, sort_col)).copy()
            desc = sub.describe(include="all").round(3)
            direction = "lowest" if ascending else "highest"
            text = f"{direction.capitalize()} {min(sample_n, len(df))} by `{sort_col}`:\n{desc.to_markdown()}"
            return text
    except Exception:
        pass

    # Default: random sample summary only (compact)
    sampled = df.sample(min(sample_n, len(df)), random_state=42)
    desc = sampled.describe(include="all").round(3)
    return f"Sample summary ({len(sampled)} rows):\n{desc.to_markdown()}"


# -----------------------------------------------------------------------------
# Main entry
# -----------------------------------------------------------------------------
def ask_gemini(question: str, context_df: pd.DataFrame, style: str = "brief") -> str:
    """Ask Gemini with size-guarded prompt. No fallback; returns neutral message if empty."""
    if context_df is None or len(context_df) == 0:
        return "No data available to analyze."

    stats_summary = generate_statistics(context_df)
    relevant_sample = get_relevant_sample(context_df, question)

    # Section & total caps (character-based; conservative)
    MAX_SECTION_LEN = 5000
    MAX_PROMPT_LEN = 20000

    stats_summary = _truncate(stats_summary, "stats_summary", MAX_SECTION_LEN)
    relevant_sample = _truncate(relevant_sample, "relevant_sample", MAX_SECTION_LEN)

    if style == "brief":
        style_instructions = (
            "- Give concise, direct answers (2–4 sentences max)\n"
            "- List only top 3–5 items unless asked for more\n"
            "- Use short bullet points; avoid long explanations"
        )
        max_tokens = 500
    else:
        style_instructions = (
            "- Provide informative, well-structured answers\n"
            "- Include relevant context and explanations\n"
            "- List up to 10 items when relevant"
        )
        max_tokens = 1000

    prompt = (
        f"You are an expert astronomy analyst specializing in exoplanet data.\n\n"
        f"DATASET OVERVIEW (rows={len(context_df)}):\n{stats_summary}\n\n"
        f"SAMPLED DATA SUMMARY:\n{relevant_sample}\n\n"
        f"INSTRUCTIONS:\n{style_instructions}\n\n"
        f"QUESTION: {question}\n"
    )

    if len(prompt) > MAX_PROMPT_LEN:
        print(f"[WARN] Total prompt too long ({len(prompt):,}), truncating globally")
        prompt = prompt[:MAX_PROMPT_LEN] + "\n[...prompt truncated for safety...]"

    print(f"[INFO] Prompt length: {len(prompt):,} chars")

    # Minimal retry: transient errors only; no user-facing failure text
    for attempt in range(3):
        try:
            resp = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"temperature": 0.3, "max_output_tokens": max_tokens},
            )
            if resp and getattr(resp, "text", None):
                return resp.text.strip()
            time.sleep(0.6)
        except Exception as e:
            # Log but don't surface internal details to end user
            print(f"[ERROR] attempt {attempt+1}: {e}")
            time.sleep(1.0)

    # Neutral message (per your request: no mention of Gemini/fallback)
    return "No response produced. Try a shorter or more specific question."
