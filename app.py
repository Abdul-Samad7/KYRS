import streamlit as st
from backend.data_loader import load_data, upload_dataset
from components import explore_tab, ask_tab, habitability_tab

st.set_page_config(page_title="ExoExplorer", layout="wide", page_icon="🪐")

st.title("🪐 ExoExplorer – Exoplanet Data Analysis & Habitability Vetting")

st.markdown("""
**A dynamic tool for scientists to explore exoplanet datasets and assess habitability.**  
Upload your own datasets or use the default Kepler KOI data.
""")

# Sidebar for dataset management
with st.sidebar:
    st.header("📂 Dataset Manager")
    
    dataset_option = st.radio(
        "Choose data source:",
        ["Use Default Dataset", "Upload Custom Dataset"]
    )
    
    if dataset_option == "Upload Custom Dataset":
        df = upload_dataset()
    else:
        df = load_data()
    
    if df is not None:
        st.success(f"✅ Dataset loaded: **{len(df):,}** rows × **{len(df.columns)}** columns")
        
        with st.expander("📊 Dataset Info"):
            st.write(f"**Columns:** {len(df.columns)}")
            st.write(f"**Rows:** {len(df):,}")
            st.write("**Column Names:**")
            for col in df.columns:
                st.text(f"  • {col}")

# Main tabs
if df is not None:
    tabs = st.tabs(["🌌 Explore Data", "💬 Ask the Data", "🌍 Habitability Analysis"])
    
    with tabs[0]:
        explore_tab.render(df)
    
    with tabs[1]:
        ask_tab.render(df)
    
    with tabs[2]:
        habitability_tab.render(df)
else:
    st.warning("⚠️ Please load a dataset to begin.")