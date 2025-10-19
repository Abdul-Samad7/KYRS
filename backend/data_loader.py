import pandas as pd
import streamlit as st
import os

@st.cache_data
def load_data():
    """Load the default Kepler KOI dataset."""
    path = os.path.join("data", "kepler_koi.csv")
    if not os.path.exists(path):
        st.error("❌ Missing file: data/kepler_koi.csv")
        return None
    
    df = pd.read_csv(path)
    return df


def upload_dataset():
    """Allow users to upload their own CSV dataset."""
    st.subheader("Upload Your Dataset")
    
    uploaded_file = st.file_uploader(
        "Choose a CSV file",
        type=["csv"],
        help="Upload any exoplanet dataset in CSV format"
    )
    
    if uploaded_file is not None:
        try:
            df = pd.read_csv(uploaded_file)
            st.success(f"✅ Successfully loaded: {uploaded_file.name}")
            return df
        except Exception as e:
            st.error(f"❌ Error reading file: {e}")
            return None
    else:
        st.info("👆 Upload a CSV file to get started")
        return None


def detect_column_types(df):
    """
    Automatically detect what type of information each column contains.
    This helps the app work with any dataset structure.
    """
    column_types = {
        'numeric': [],
        'categorical': [],
        'identifier': [],
        'unknown': []
    }
    
    for col in df.columns:
        col_lower = col.lower()
        
        # Check if it's numeric
        if pd.api.types.is_numeric_dtype(df[col]):
            column_types['numeric'].append(col)
        
        # Check if it's likely an identifier (id, name, etc.)
        elif any(term in col_lower for term in ['id', 'name', 'identifier', 'designation']):
            column_types['identifier'].append(col)
        
        # Check if it's categorical
        elif df[col].nunique() < 50:  # Arbitrary threshold
            column_types['categorical'].append(col)
        
        else:
            column_types['unknown'].append(col)
    
    return column_types


def get_numeric_columns(df):
    """Get all numeric columns from the dataframe."""
    return df.select_dtypes(include=['number']).columns.tolist()


def get_categorical_columns(df):
    """Get all categorical/string columns from the dataframe."""
    return df.select_dtypes(include=['object', 'category']).columns.tolist()