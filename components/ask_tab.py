import streamlit as st
from google import genai

def ask_tab(model, df):
    """
    Lets the user ask questions about the dataset using Gemini.
    """
    st.header("💬 Ask the Model")

    if df.empty:
        st.warning("No data available to analyze.")
        return

    user_query = st.text_area("Ask a question about the dataset:")

    if st.button("Ask Gemini"):
        if not user_query.strip():
            st.warning("Please enter a question first.")
            return

        with st.spinner("Thinking..."):
            prompt = f"""
            You are a data scientist analyzing NASA Kepler exoplanet data.

            Here is a small sample of the dataset:
            {df.head(10).to_csv(index=False)}

            Question: {user_query}

            Provide a concise, factual answer based on the data shown.
            """
            try:
                response = model.responses.create(
                    model="gemini-1.5-flash",
                    contents=prompt
                )
                st.success("Response:")
                st.write(response.text)
            except Exception as e:
                st.error(f"Gemini request failed: {e}")
