from google import genai
import streamlit as st

# Use consistent API key path
client = genai.Client(api_key=st.secrets["GEMINI_API_KEY"])

def ask_gemini(question, context_df):
    """Ask Gemini a question using the filtered data as context."""
    context = context_df.head(10).to_markdown(index=False)
    prompt = f"""
You are an astronomy assistant.
Use only this data table to answer.
If the data does not contain the answer, say so.

DATA:
{context}

QUESTION: {question}
"""
    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"⚠️ Gemini Error: {e}"