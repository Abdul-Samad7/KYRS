from google import genai
import streamlit as st
import pandas as pd

client = genai.Client(api_key=st.secrets["GEMINI_API_KEY"])


def analyze_dataset_structure(df):
    """Automatically analyze and describe the dataset structure."""
    
    analysis = {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "column_info": [],
        "numeric_columns": [],
        "categorical_columns": []
    }
    
    for col in df.columns:
        col_info = {
            "name": col,
            "type": str(df[col].dtype),
            "non_null": df[col].count(),
            "null_count": df[col].isnull().sum(),
        }
        
        if pd.api.types.is_numeric_dtype(df[col]):
            col_info["min"] = df[col].min()
            col_info["max"] = df[col].max()
            col_info["mean"] = df[col].mean()
            col_info["median"] = df[col].median()
            analysis["numeric_columns"].append(col)
        else:
            col_info["unique_values"] = df[col].nunique()
            col_info["sample_values"] = df[col].dropna().unique()[:5].tolist()
            analysis["categorical_columns"].append(col)
        
        analysis["column_info"].append(col_info)
    
    return analysis


def create_dataset_context(df, include_full_sample=True):
    """Create rich context about the dataset for the AI."""
    
    analysis = analyze_dataset_structure(df)
    
    context = f"""
**DATASET OVERVIEW:**
- Total rows: {analysis['total_rows']:,}
- Total columns: {analysis['total_columns']}

**COLUMN DETAILS:**
"""
    
    for col_info in analysis['column_info']:
        context += f"\n• **{col_info['name']}** ({col_info['type']})"
        context += f"\n  - Non-null: {col_info['non_null']:,} / Null: {col_info['null_count']:,}"
        
        if 'min' in col_info:
            context += f"\n  - Range: {col_info['min']:.4f} to {col_info['max']:.4f}"
            context += f"\n  - Mean: {col_info['mean']:.4f}, Median: {col_info['median']:.4f}"
        elif 'unique_values' in col_info:
            context += f"\n  - Unique values: {col_info['unique_values']}"
            context += f"\n  - Sample values: {', '.join(map(str, col_info['sample_values']))}"
    
    # Add data sample if requested
    if include_full_sample:
        sample_size = min(30, len(df))
        context += f"\n\n**DATA SAMPLE ({sample_size} rows):**\n"
        context += df.sample(sample_size).to_markdown(index=False)
    
    # Add statistical summary for numeric columns
    if analysis['numeric_columns']:
        context += "\n\n**STATISTICAL SUMMARY:**\n"
        context += df[analysis['numeric_columns']].describe().to_markdown()
    
    return context


def ask_gemini_dynamic(question, df, include_full_sample=True):
    """
    Dynamic AI assistant that works with ANY exoplanet dataset.
    Automatically adapts to the dataset structure.
    """
    
    # Create context about the dataset
    dataset_context = create_dataset_context(df, include_full_sample)
    
    prompt = f"""
You are an expert exoplanet scientist and data analyst helping researchers explore and understand exoplanet datasets.

{dataset_context}

**RESEARCHER'S QUESTION:** {question}

**YOUR ROLE:**
- Help scientists understand their data
- Identify potentially habitable planets
- Explain column meanings in astronomical context
- Provide statistical insights
- Suggest relevant analyses
- Be conversational but scientifically accurate

**GUIDELINES:**
- Always base answers on the actual data provided
- When discussing habitability, consider: temperature, radius, stellar properties
- If the question requires information not in the dataset, say so clearly
- Provide specific numbers and examples from the data
- Suggest follow-up analyses when relevant
- For Earth-like planets, look for: ~1 Earth radius, ~250-350K temperature

Provide a clear, helpful answer:
"""
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"⚠️ Error communicating with Gemini: {e}\n\nPlease check your API key in .streamlit/secrets.toml"


# Legacy function for backward compatibility
def ask_gemini_smart(question, df):
    """Redirect to dynamic version."""
    return ask_gemini_dynamic(question, df, include_full_sample=True)


def ask_gemini(question, context_df):
    """Legacy function for backward compatibility."""
    return ask_gemini_dynamic(question, context_df, include_full_sample=False)