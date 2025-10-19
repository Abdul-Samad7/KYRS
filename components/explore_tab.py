import streamlit as st
import plotly.express as px
from backend.data_loader import get_numeric_columns, get_categorical_columns

def render(df):
    st.header("🌌 Explore Your Dataset")
    
    # Get column types dynamically
    numeric_cols = get_numeric_columns(df)
    categorical_cols = get_categorical_columns(df)
    
    if not numeric_cols:
        st.warning("⚠️ No numeric columns detected in this dataset.")
        st.dataframe(df.head(20))
        return
    
    # Dynamic filtering section
    st.subheader("🔍 Filter Data")
    
    filters = {}
    filter_cols = st.columns(min(3, len(categorical_cols) + 1))
    
    # Add categorical filters dynamically
    for idx, cat_col in enumerate(categorical_cols[:3]):  # Limit to 3 filters
        with filter_cols[idx]:
            unique_vals = sorted(df[cat_col].dropna().unique())
            if len(unique_vals) > 0 and len(unique_vals) < 100:  # Reasonable number of options
                selected = st.multiselect(
                    f"{cat_col}",
                    options=unique_vals,
                    default=unique_vals[:min(3, len(unique_vals))]
                )
                if selected:
                    filters[cat_col] = selected
    
    # Apply filters
    filtered = df.copy()
    for col, values in filters.items():
        filtered = filtered[filtered[col].isin(values)]
    
    # Numeric range filters
    with st.expander("📊 Numeric Filters"):
        num_filter_cols = st.columns(2)
        for idx, num_col in enumerate(numeric_cols[:4]):  # Show up to 4 numeric filters
            with num_filter_cols[idx % 2]:
                col_min = float(df[num_col].min())
                col_max = float(df[num_col].max())
                if col_min < col_max:
                    range_val = st.slider(
                        f"{num_col}",
                        col_min, col_max, (col_min, col_max),
                        key=f"slider_{num_col}"
                    )
                    filtered = filtered[filtered[num_col].between(*range_val)]
    
    st.markdown(f"**Showing {len(filtered):,} of {len(df):,} rows**")
    
    # Dynamic visualization
    st.subheader("📈 Visualize")
    
    viz_cols = st.columns(3)
    with viz_cols[0]:
        x_axis = st.selectbox("X-axis", numeric_cols, index=0)
    with viz_cols[1]:
        y_axis = st.selectbox("Y-axis", numeric_cols, index=min(1, len(numeric_cols)-1))
    with viz_cols[2]:
        color_by = st.selectbox(
            "Color by", 
            ["None"] + categorical_cols,
            index=0
        )
    
    # Create plot
    if len(filtered) > 0:
        fig = px.scatter(
            filtered,
            x=x_axis,
            y=y_axis,
            color=None if color_by == "None" else color_by,
            title=f"{y_axis} vs {x_axis}",
            template="plotly_dark",
            hover_data=numeric_cols[:5]  # Show first 5 numeric columns on hover
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.warning("No data matches the current filters.")
    
    # Data table
    st.subheader("📋 Data Table")
    st.dataframe(filtered.head(100), use_container_width=True)
    
    # Download filtered data
    if len(filtered) > 0:
        csv = filtered.to_csv(index=False)
        st.download_button(
            label="📥 Download Filtered Data",
            data=csv,
            file_name="filtered_exoplanet_data.csv",
            mime="text/csv"
        )