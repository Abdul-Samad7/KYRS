# ask_tab.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from data_loader import df
from gemini_agent import run_gemini  # Ensure this function exists
import pandas as pd

router = APIRouter()

# ---------- Request / Response Models ----------

class AskRequest(BaseModel):
    question: str
    style: str = "brief"

class AskResponse(BaseModel):
    answer: str
    records_analyzed: int


# ---------- Helper Functions ----------

def compute_comparison(question: str):
    """
    Detects comparative queries (like 'compare temperature distributions') 
    and computes statistical summaries before sending them to Gemini.
    """
    q = question.lower()

    if "compare" in q and "temperature" in q:
        try:
            confirmed = df[df["disposition_using_kepler_data"] == "CONFIRMED"]["equilibrium_temperature_kelvin"].dropna()
            candidate = df[df["disposition_using_kepler_data"] == "CANDIDATE"]["equilibrium_temperature_kelvin"].dropna()

            stats = {
                "confirmed_mean": confirmed.mean(),
                "confirmed_std": confirmed.std(),
                "candidate_mean": candidate.mean(),
                "candidate_std": candidate.std(),
                "confirmed_count": len(confirmed),
                "candidate_count": len(candidate),
            }

            summary = (
                f"CONFIRMED planets (n={stats['confirmed_count']}) "
                f"have an average equilibrium temperature of {stats['confirmed_mean']:.1f} K (σ={stats['confirmed_std']:.1f}), "
                f"while CANDIDATE planets (n={stats['candidate_count']}) "
                f"average {stats['candidate_mean']:.1f} K (σ={stats['candidate_std']:.1f})."
            )

            # Optionally polish the phrasing via Gemini
            try:
                refined = run_gemini(f"Rephrase this in a {('concise' if 'brief' else 'detailed')} scientific summary: {summary}")
            except Exception:
                refined = summary  # Fallback if Gemini call fails

            return AskResponse(answer=refined, records_analyzed=len(confirmed) + len(candidate))

        except Exception as e:
            return AskResponse(answer=f"Error during comparison: {e}", records_analyzed=0)

    # Not a comparative question
    return None


# ---------- Main Endpoint ----------

@router.post("/ask", response_model=AskResponse)
async def ask_question(req: AskRequest):
    """
    Endpoint that handles natural-language questions about the dataset.
    - Detects simple comparative queries and computes summaries locally.
    - Otherwise defers to the Gemini agent.
    """
    try:
        # First: check if this is a known comparison request
        computed = compute_comparison(req.question)
        if computed:
            return computed

        # Otherwise, pass directly to Gemini agent
        schema_context = """
        Columns include: planet_name, equilibrium_temperature_kelvin, planet_radius_earth_radii,
        orbital_period_days, disposition_using_kepler_data (CONFIRMED / CANDIDATE / FALSE POSITIVE), etc.
        """

        prompt = f"{schema_context}\n\nUser query: {req.question}\nResponse style: {req.style}"
        response_text = run_gemini(prompt)

        # You may also calculate how many rows match the query if needed
        records = len(df)

        return AskResponse(answer=response_text, records_analyzed=records)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
