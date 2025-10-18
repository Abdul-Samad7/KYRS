import pandas as pd
import streamlit as st
import os

@st.cache_data
def load_data():
    path = os.path.join("data", "kepler_koi.csv")
    if not os.path.exists(path):
        st.error("❌ Missing file: data/kepler_koi.csv")
        st.stop()
    df = pd.read_csv(path)
    df = df.dropna(subset=["koi_teq", "koi_prad"])
    st.success(f"✅ Loaded {len(df):,} rows from Kepler KOI dataset.")
    return df

