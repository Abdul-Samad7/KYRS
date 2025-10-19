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
- "What are the 3 hottest planets?"
""")

    # Add response style selector
    col1, col2 = st.columns([3, 1])
    with col1:
        query = st.text_input("Ask your question:")
    with col2:
        response_style = st.selectbox(
            "Response style:",
            ["Brief", "Detailed"],
            index=0
        )
    
    if st.button("Ask Gemini", type="primary") and query:
        with st.spinner("Filtering and querying Gemini..."):
            subset = filter_dataframe(df, query)
            st.write(f"**Data subset used:** {len(subset):,} rows")
            
            # Show small preview
            with st.expander("Preview filtered data"):
                st.dataframe(subset.head(10))
            
            # Pass response style preference
            answer = ask_gemini(query, subset, response_style.lower())
            
            st.markdown("### 🧠 Gemini's Answer")
            st.write(answer)