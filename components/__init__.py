import streamlit as st
from backend.retriever import filter_dataframe
from backend.gemini_agent import ask_gemini

def render(df):
    st.header("💬 Ask the Data")
    st.markdown("""
Type a question about the Kepler KOI dataset and let Gemini answer using the real data.  
Try examples like:
- "Show confirmed planets smaller than 2 Earth radii."
- "Which planets have equilibrium temperature below 300 K?"
""")

    query = st.text_input("Ask your question:")
    if st.button("Ask Gemini") and query:
        with st.spinner("Filtering and querying Gemini..."):
            subset = filter_dataframe(df, query)
            st.write(f"**Data subset used:** {len(subset)} rows")
            st.dataframe(subset.head(5))
            answer = ask_gemini(query, subset)
            st.markdown("### 🧠 Gemini’s Answer")
            st.write(answer)
