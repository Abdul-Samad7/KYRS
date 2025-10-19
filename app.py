import streamlit as st
from backend.data_loader import load_data
from components import explore_tab, ask_tab

st.set_page_config(page_title="ExoExplorer", layout="wide")

st.title("🪐 ExoExplorer – Iteration 2: Ask the Data")

st.markdown("""
Now you can **ask questions** about NASA's Kepler KOI dataset  
using natural language — powered by **Gemini 1.5 Flash**.
""")

df = load_data()

tabs = st.tabs(["🌌 Explore Data", "💬 Ask the Data"])
with tabs[0]:
    explore_tab.render(df)
with tabs[1]:
    ask_tab.render(df)