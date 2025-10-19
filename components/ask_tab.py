import streamlit as st
from backend.gemini_agent import ask_gemini_dynamic


def render(df):
    st.header("💬 Ask About Your Data")
    
    st.markdown("""
Ask **any question** about your exoplanet dataset using natural language! Examples:
- 🔍 **Understanding**: "What columns are in this dataset?"
- 📊 **Statistics**: "What's the average value of [column name]?"
- 🌍 **Filtering**: "Show me planets similar to Earth"
- 🔥 **Analysis**: "What patterns do you see in the data?"
- 🎯 **Habitability**: "Which candidates look most promising for life?"
""")
    
    # Show quick dataset info
    with st.expander("ℹ️ Quick Dataset Info"):
        st.write(f"**Total Rows:** {len(df):,}")
        st.write(f"**Columns ({len(df.columns)}):**")
        cols_display = st.columns(3)
        for idx, col in enumerate(df.columns):
            with cols_display[idx % 3]:
                st.text(f"• {col}")
    
    # Query input
    query = st.text_area(
        "Your question:",
        placeholder="e.g., Which planets have temperatures similar to Earth?",
        height=100
    )
    
    col1, col2 = st.columns([1, 4])
    with col1:
        ask_button = st.button("🤔 Ask Gemini", type="primary", use_container_width=True)
    with col2:
        include_sample = st.checkbox("Include data sample in context", value=True)
    
    if ask_button and query:
        with st.spinner("🧠 Analyzing your data..."):
            answer = ask_gemini_dynamic(query, df, include_full_sample=include_sample)
            
            st.markdown("### 🎯 Answer")
            st.markdown(answer)
            
            # Show data sample
            with st.expander("📋 View data sample"):
                st.dataframe(df.head(20))
    
    # Suggested questions based on dataset
    st.markdown("---")
    st.markdown("### 💡 Suggested Questions")
    
    suggestions = generate_smart_suggestions(df)
    
    cols = st.columns(2)
    for idx, suggestion in enumerate(suggestions):
        with cols[idx % 2]:
            if st.button(suggestion, key=f"suggest_{idx}", use_container_width=True):
                st.session_state.suggested_query = suggestion
                st.rerun()


def generate_smart_suggestions(df):
    """Generate contextual question suggestions based on the dataset."""
    suggestions = [
        "What columns are in this dataset and what do they mean?",
        "Give me a statistical summary of this dataset",
    ]
    
    # Add column-specific suggestions
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    if numeric_cols:
        suggestions.append(f"What's the distribution of {numeric_cols[0]}?")
    
    if categorical_cols:
        suggestions.append(f"How many unique values are in {categorical_cols[0]}?")
    
    # Habitability-related
    temp_cols = [col for col in df.columns if 'temp' in col.lower()]
    radius_cols = [col for col in df.columns if 'radius' in col.lower() or 'rad' in col.lower()]
    
    if temp_cols and radius_cols:
        suggestions.append("Which planets might be in the habitable zone?")
    
    suggestions.append("What are the most interesting findings in this data?")
    
    return suggestions[:6]  # Return top 6 suggestions