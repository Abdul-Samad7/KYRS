from google import genai
import streamlit as st
import pandas as pd
import numpy as np

client = genai.Client(api_key=st.secrets["GEMINI_API_KEY"])

def ask_gemini(question, context_df, style="brief"):
    """Ask Gemini a question using intelligent data sampling and statistics."""
    
    # Validate input
    if context_df is None or len(context_df) == 0:
        return "⚠️ No data available to answer this question. Try adjusting your filters."
    
    # Strategy: Send statistics + relevant samples based on question
    stats_summary = generate_statistics(context_df)
    relevant_sample = get_relevant_sample(context_df, question)
    
    # Adjust instructions based on style
    if style == "brief":
        style_instructions = """
- Give CONCISE, direct answers (2-4 sentences max)
- List only top 3-5 items unless asked for more
- Use bullet points, keep them SHORT
- Skip lengthy explanations"""
        max_tokens = 500
    else:  # detailed
        style_instructions = """
- Provide thorough, informative answers
- Include relevant context and explanations
- List up to 10 items when relevant
- Explain interesting patterns or trends you notice"""
        max_tokens = 1000
    
    prompt = f"""
You are an expert astronomy assistant specializing in exoplanet research and analysis.
You're analyzing data from NASA's Kepler mission and other exoplanet surveys.

DATASET STATISTICS (based on {len(context_df)} rows):
{stats_summary}

RELEVANT DATA SAMPLE:
{relevant_sample}

INSTRUCTIONS:
{style_instructions}
- Search through the sample data carefully to find what the user is asking about
- The statistics reflect the COMPLETE filtered dataset of {len(context_df)} rows
- Use astronomical terminology appropriately (e.g., Earth radii, Kelvin, stellar flux)
- When discussing planets, mention their KOI/Kepler IDs and key characteristics
- Context: KOI = Kepler Object of Interest, dispositions can be CONFIRMED, CANDIDATE, or FALSE POSITIVE
- If you cannot find the specific object/planet they're asking about in the sample, say so clearly
- If the data doesn't contain the answer, say so clearly

QUESTION: {question}
"""
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",  # Correct model name
            contents=prompt,
            config={
                "temperature": 0.3,
                "max_output_tokens": max_tokens,
            }
        )
        return response.text
    except Exception as e:
        return f"⚠️ Gemini Error: {e}"


def generate_statistics(df):
    """Generate comprehensive statistics about ANY dataset."""
    stats_parts = []
    
    # Overall count
    stats_parts.append(f"Total rows: {len(df)}")
    stats_parts.append(f"Total columns: {len(df.columns)}")
    
    # Analyze each column
    for col in df.columns:
        dtype = df[col].dtype
        non_null_count = df[col].notna().sum()
        
        stats_parts.append(f"\n{col}:")
        stats_parts.append(f"  - Type: {dtype}")
        stats_parts.append(f"  - Non-null: {non_null_count}/{len(df)}")
        
        # Numeric columns: show statistics
        if pd.api.types.is_numeric_dtype(dtype):
            if non_null_count > 0:
                stats_parts.append(f"  - Min: {df[col].min()}")
                stats_parts.append(f"  - Max: {df[col].max()}")
                stats_parts.append(f"  - Mean: {df[col].mean():.2f}")
                stats_parts.append(f"  - Median: {df[col].median():.2f}")
        
        # Categorical/Object columns: show value counts
        elif pd.api.types.is_object_dtype(dtype) or pd.api.types.is_categorical_dtype(dtype):
            unique_count = df[col].nunique()
            stats_parts.append(f"  - Unique values: {unique_count}")
            
            # Show top values if not too many unique values
            if unique_count <= 10 and non_null_count > 0:
                top_values = df[col].value_counts().head(5)
                stats_parts.append(f"  - Top values:")
                for val, count in top_values.items():
                    stats_parts.append(f"    • {val}: {count}")
    
    return "\n".join(stats_parts)


def get_relevant_sample(df, question):
    """Get a relevant sample based on the question asked - optimized for exoplanet data."""
    question_lower = question.lower()
    
    # Adjust sample size based on dataset size and query type
    # For specific object queries, we want more data for Gemini to search through
    if len(df) <= 100:
        sample_size = len(df)  # Just send everything if small
    elif len(df) <= 300:
        sample_size = len(df)  # Send all if medium-sized (this is likely filtered data)
    else:
        sample_size = min(100, len(df))  # Larger sample for better coverage
    
    # Common exoplanet column names and their variations
    temp_cols = ['koi_teq', 'equilibrium_temp', 'teq', 'temp', 'temperature']
    radius_cols = ['koi_prad', 'radius', 'prad', 'planet_radius']
    period_cols = ['koi_period', 'period', 'orbital_period']
    insol_cols = ['koi_insol', 'insolation', 'stellar_flux']
    
    # Find which columns actually exist in the dataframe
    temp_col = next((col for col in temp_cols if col in df.columns), None)
    radius_col = next((col for col in radius_cols if col in df.columns), None)
    period_col = next((col for col in period_cols if col in df.columns), None)
    insol_col = next((col for col in insol_cols if col in df.columns), None)
    
    # Keywords that suggest sorting
    high_keywords = ['highest', 'hottest', 'largest', 'biggest', 'maximum', 'max', 'top', 'most']
    low_keywords = ['lowest', 'coldest', 'smallest', 'minimum', 'min', 'bottom', 'least']
    
    # Determine sort column and direction based on question
    sort_col = None
    ascending = True
    
    # Temperature-related queries
    if any(word in question_lower for word in ['temp', 'temperature', 'hot', 'cold', 'warm', 'cool']):
        sort_col = temp_col
        ascending = 'cold' in question_lower or 'cool' in question_lower or any(w in question_lower for w in low_keywords)
    
    # Size/radius queries
    elif any(word in question_lower for word in ['size', 'radius', 'large', 'small', 'big', 'tiny']):
        sort_col = radius_col
        ascending = 'small' in question_lower or 'tiny' in question_lower or any(w in question_lower for w in low_keywords)
    
    # Orbital period queries
    elif any(word in question_lower for word in ['period', 'orbit', 'year', 'day']):
        sort_col = period_col
        ascending = 'short' in question_lower or any(w in question_lower for w in low_keywords)
    
    # Insolation queries
    elif any(word in question_lower for word in ['insolation', 'flux', 'stellar']):
        sort_col = insol_col
        ascending = any(w in question_lower for w in low_keywords)
    
    # Create the sample
    if sort_col and sort_col in df.columns:
        # Smart sorted sample
        try:
            if ascending:
                sample_df = df.nsmallest(sample_size, sort_col)
                direction = "LOWEST"
            else:
                sample_df = df.nlargest(sample_size, sort_col)
                direction = "HIGHEST"
            
            return f"{direction} {sample_size} by {sort_col}:\n" + sample_df.to_markdown(index=False)
        except:
            # If sorting fails, fall back to default
            pass
    
    # Default: send the data we have (no specific sorting detected)
    sample_df = df.head(sample_size)
    return f"DATA SAMPLE ({len(sample_df)} of {len(df)} total rows):\n" + sample_df.to_markdown(index=False)