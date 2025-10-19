import streamlit as st
import plotly.express as px
from backend.data_loader import get_numeric_columns, get_categorical_columns

# 🔧 Column labels with human-readable units
COLUMN_LABELS = {
    "koi_teq": "Equilibrium Temperature (K)",
    "equilibrium_temperature_kelvin": "Equilibrium Temperature (K)",
    "koi_prad": "Planet Radius (Earth radii)",
    "planet_radius_earth_radii": "Planet Radius (Earth radii)",
    "koi_period": "Orbital Period (days)",
    "orbital_period_days": "Orbital Period (days)",
    "koi_insol": "Insolation Flux (× Earth flux)",
    "insolation_flux_earth_flux": "Insolation Flux (× Earth flux)",
    "stellar_effective_temperature_kelvin": "Stellar Temperature (K)",
    "stellar_radius_solar_radii": "Stellar Radius (Solar radii)",
}

def pretty_label(col: str) -> str:
    """Return human-readable axis labels with units when known."""
    return COLUMN_LABELS.get(col, col.replace("_", " ").title())

def auto_log_scale(df, col):
    """Return 'log' if column spans several orders of magnitude."""
    try:
        vals = df[col].dropna().abs()
        if len(vals) > 0:
            ratio = vals.max() / max(vals.min(), 1e-9)
            if ratio > 1_000:
                return "log"
    except Exception:
        pass
    return "linear"


def render(df):
    st.header("🌌 Explore Your Dataset")

    # Get column types dynamically
    numeric_cols = get_numeric_columns(df)
    categorical_cols = get_categorical_columns(df)

    if not numeric_cols:
        st.warning("⚠️ No numeric columns detected in this dataset.")
        st.dataframe(df.head(20))
        return

    # -------------------- 🔍 Filtering Section --------------------
    st.subheader("🔍 Filter Data")

    filters = {}
    filter_cols = st.columns(min(3, len(categorical_cols) + 1))

    for idx, cat_col in enumerate(categorical_cols[:3]):  # Limit to 3 filters
        with filter_cols[idx]:
            unique_vals = sorted(df[cat_col].dropna().unique())
            if 0 < len(unique_vals) < 100:
                selected = st.multiselect(
                    f"{cat_col}",
                    options=unique_vals,
                    default=unique_vals[:min(3, len(unique_vals))]
                )
                if selected:
                    filters[cat_col] = selected

    filtered = df.copy()
    for col, values in filters.items():
        filtered = filtered[filtered[col].isin(values)]

    with st.expander("📊 Numeric Filters"):
        num_filter_cols = st.columns(2)
        for idx, num_col in enumerate(numeric_cols[:4]):
            with num_filter_cols[idx % 2]:
                col_min, col_max = float(df[num_col].min()), float(df[num_col].max())
                if col_min < col_max:
                    range_val = st.slider(
                        f"{num_col}",
                        col_min, col_max, (col_min, col_max),
                        key=f"slider_{num_col}"
                    )
                    filtered = filtered[filtered[num_col].between(*range_val)]

    st.markdown(f"**Showing {len(filtered):,} of {len(df):,} rows**")

    # -------------------- 📈 Visualization Section --------------------
    st.subheader("📈 Visualize")

    viz_cols = st.columns(3)
    with viz_cols[0]:
        x_axis = st.selectbox("X-axis", numeric_cols, index=0)
    with viz_cols[1]:
        y_axis = st.selectbox("Y-axis", numeric_cols, index=min(1, len(numeric_cols)-1))
    with viz_cols[2]:
        color_by = st.selectbox("Color by", ["None"] + categorical_cols, index=0)

    if len(filtered) > 0:
        x_scale = auto_log_scale(filtered, x_axis)
        y_scale = auto_log_scale(filtered, y_axis)

        fig = px.scatter(
            filtered,
            x=x_axis,
            y=y_axis,
            color=None if color_by == "None" else color_by,
            title=f"{pretty_label(y_axis)} vs {pretty_label(x_axis)}",
            template="plotly_dark",
            hover_data=numeric_cols[:5],
            log_x=(x_scale == "log"),
            log_y=(y_scale == "log")
        )

        # Update axis labels
        fig.update_layout(
            xaxis_title=pretty_label(x_axis),
            yaxis_title=pretty_label(y_axis),
            title_x=0.5
        )

        st.plotly_chart(fig, use_container_width=True)
    else:
        st.warning("No data matches the current filters.")

    # -------------------- 📋 Data Table --------------------
    st.subheader("📋 Data Table")
    st.dataframe(filtered.head(100), use_container_width=True)

    if len(filtered) > 0:
        csv = filtered.to_csv(index=False)
        st.download_button(
            label="📥 Download Filtered Data",
            data=csv,
            file_name="filtered_exoplanet_data.csv",
            mime="text/csv"
        )
