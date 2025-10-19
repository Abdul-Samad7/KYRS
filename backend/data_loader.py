import pandas as pd
import os

def load_data():
    """Load the default Kepler KOI dataset - works with or without Streamlit."""
    # Try multiple possible paths since we might run from different directories
    possible_paths = [
        os.path.join("data", "kepler_koi.csv"),           # If running from project root
        os.path.join("..", "data", "kepler_koi.csv"),     # If running from backend/
        os.path.join("../data", "kepler_koi.csv"),        # Alternative
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            try:
                df = pd.read_csv(path)
                print(f"✅ Loaded {len(df):,} rows from {path}")
                return df
            except Exception as e:
                print(f"❌ Error loading {path}: {e}")
    
    print(f"❌ Could not find kepler_koi.csv")
    print(f"Current directory: {os.getcwd()}")
    print(f"Tried paths: {possible_paths}")
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