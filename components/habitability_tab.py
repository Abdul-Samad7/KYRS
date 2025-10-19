import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from backend.gemini_agent import ask_gemini

# readable column names with units
COLUMN_LABELS = {
    "radius": "Radius (Earth radii)",
    "planet_radius_earth_radii": "Radius (Earth radii)",
    "koi_prad": "Radius (Earth radii)",
    "temperature": "Temperature (K)",
    "equilibrium_temperature_kelvin": "Temperature (K)",
    "koi_teq": "Temperature (K)",
    "koi_period": "Orbital Period (days)",
    "orbital_period_days": "Orbital Period (days)",
    "koi_insol": "Insolation Flux (× Earth flux)",
    "insolation_flux_earth_flux": "Insolation Flux (× Earth flux)",
    "stellar_effective_temperature_kelvin": "Stellar Temperature (K)",
    "stellar_radius_solar_radii": "Stellar Radius (Solar radii)",
}

def pretty_label(col):
    """Return human-friendly label with unit if available."""
    if not isinstance(col, str):
        return str(col)
    return COLUMN_LABELS.get(col.lower(), col.replace("_", " ").title())

def auto_log_axis(df, col):
    """Return 'log' if data spans multiple orders of magnitude, else 'linear'."""
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
    st.header("🌍 Habitability Analysis")
    
    st.markdown("""
    This tool helps you identify and vet potentially habitable exoplanets based on 
    scientific criteria. Configure parameters and let AI assist your analysis.
    """)
    
    # Try to auto-detect relevant columns
    temp_cols = [col for col in df.columns if 'temp' in col.lower() and df[col].dtype in ['float64', 'int64']]
    radius_cols = [col for col in df.columns if any(term in col.lower() for term in ['radius', 'rad']) and df[col].dtype in ['float64', 'int64']]
    
    if not temp_cols or not radius_cols:
        st.warning("⚠️ Could not auto-detect temperature and radius columns. Please select them manually.")
        col1, col2 = st.columns(2)
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        with col1:
            temp_col = st.selectbox("Select Temperature Column", numeric_cols)
        with col2:
            radius_col = st.selectbox("Select Radius Column", numeric_cols)
    else:
        col1, col2 = st.columns(2)
        with col1:
            temp_col = st.selectbox("Temperature Column", temp_cols, index=0)
        with col2:
            radius_col = st.selectbox("Radius Column", radius_cols, index=0)
    
    # Habitability criteria
    st.subheader("⚙️ Habitability Criteria")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("**🌡️ Temperature (Kelvin)**")
        temp_min = st.number_input("Min", value=273, step=10, key="temp_min")
        temp_max = st.number_input("Max", value=373, step=10, key="temp_max")
        st.caption("Earth: ~288K")
    
    with col2:
        st.markdown("**📏 Radius (Earth Radii)**")
        radius_min = st.number_input("Min", value=0.5, step=0.1, key="radius_min")
        radius_max = st.number_input("Max", value=2.0, step=0.1, key="radius_max")
        st.caption("Earth: 1.0")
    
    with col3:
        st.markdown("**🎯 Additional Filters**")
        disposition_cols = [col for col in df.columns if 'disposition' in col.lower() or 'status' in col.lower()]
        if disposition_cols:
            disp_col = disposition_cols[0]
            unique_dispositions = df[disp_col].dropna().unique().tolist()
            selected_disp = st.multiselect(
                "Status",
                unique_dispositions,
                default=[d for d in unique_dispositions if 'confirm' in str(d).lower()]
            )
        else:
            selected_disp = None
    
    # Apply filters
    habitable = df.copy()
    habitable = habitable[
        (habitable[temp_col] >= temp_min) &
        (habitable[temp_col] <= temp_max) &
        (habitable[radius_col] >= radius_min) &
        (habitable[radius_col] <= radius_max)
    ]
    if selected_disp and disposition_cols:
        habitable = habitable[habitable[disp_col].isin(selected_disp)]
    habitable = habitable.dropna(subset=[temp_col, radius_col])
    
    # Results
    st.markdown("---")
    st.subheader(f"🎯 Results: {len(habitable)} Potentially Habitable Candidates")
    
    if len(habitable) > 0:
        fig = go.Figure()
        
        # Earth reference
        fig.add_trace(go.Scatter(
            x=[288],
            y=[1.0],
            mode='markers',
            marker=dict(size=20, color='lightblue', symbol='star', line=dict(width=2, color='white')),
            name='Earth',
            text=['Earth'],
            hovertemplate='<b>Earth</b><br>Temp: 288K<br>Radius: 1.0<extra></extra>'
        ))
        
        # Habitable planets
        fig.add_trace(go.Scatter(
            x=habitable[temp_col],
            y=habitable[radius_col],
            mode='markers',
            marker=dict(size=12, color='green', opacity=0.75),
            name='Potentially Habitable',
            text=habitable.index,
            hovertemplate='<b>Index %{text}</b><br>Temp: %{x:.1f}K<br>Radius: %{y:.2f}<extra></extra>'
        ))
        
        # Other planets
        other = df[~df.index.isin(habitable.index)].dropna(subset=[temp_col, radius_col])
        if len(other) > 0:
            fig.add_trace(go.Scatter(
                x=other[temp_col],
                y=other[radius_col],
                mode='markers',
                marker=dict(size=7, color='gray', opacity=0.35),
                name='Other Planets',
                hovertemplate='Temp: %{x:.1f}K<br>Radius: %{y:.2f}<extra></extra>'
            ))
        
        # Auto scaling logic 🔍
        x_axis_type = auto_log_axis(df, temp_col)
        y_axis_type = auto_log_axis(df, radius_col)
        # compute sensible axis ranges (only for linear axes)
        xaxis_range = None
        yaxis_range = None
        try:
            if x_axis_type == 'linear':
                x_min = float(df[temp_col].dropna().min()) if len(df[temp_col].dropna())>0 else 0.0
                x_max = float(df[temp_col].dropna().max()) if len(df[temp_col].dropna())>0 else 0.0
                x_min = min(x_min, 288.0)
                x_max = max(x_max, 288.0)
                if x_max == x_min:
                    pad = x_max * 0.1 if x_max != 0 else 1.0
                else:
                    pad = (x_max - x_min) * 0.12
                xaxis_range = [x_min - pad, x_max + pad]

            if y_axis_type == 'linear':
                y_min = float(df[radius_col].dropna().min()) if len(df[radius_col].dropna())>0 else 0.0
                y_max = float(df[radius_col].dropna().max()) if len(df[radius_col].dropna())>0 else 0.0
                y_min = min(y_min, 1.0)
                y_max = max(y_max, 1.0)
                if y_max == y_min:
                    pad = y_max * 0.1 if y_max != 0 else 0.5
                else:
                    pad = (y_max - y_min) * 0.12
                # avoid negative lower bound for radius
                lower = max(0.0, y_min - pad)
                yaxis_range = [lower, y_max + pad]
        except Exception:
            xaxis_range = None
            yaxis_range = None

        layout_kwargs = dict(
            title="Habitability Zone Analysis",
            xaxis_title=pretty_label(temp_col),
            yaxis_title=pretty_label(radius_col),
            template="plotly_dark",
            hovermode='closest',
            xaxis_type=x_axis_type,
            yaxis_type=y_axis_type
        )
        if xaxis_range is not None:
            layout_kwargs['xaxis_range'] = xaxis_range
        if yaxis_range is not None:
            layout_kwargs['yaxis_range'] = yaxis_range

        fig.update_layout(**layout_kwargs)
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Top candidates
        st.subheader("🏆 Top Candidates")
        habitable['earth_similarity_score'] = (
            1 / (1 + abs(habitable[temp_col] - 288) / 288) * 
            1 / (1 + abs(habitable[radius_col] - 1.0))
        )
        top_candidates = habitable.nlargest(10, 'earth_similarity_score')
        st.dataframe(
            top_candidates.style.background_gradient(subset=['earth_similarity_score'], cmap='Greens'),
            use_container_width=True
        )
        
        # AI analysis
        st.markdown("---")
        st.subheader("🤖 AI-Assisted Analysis")
        if st.button("🧠 Analyze These Candidates with AI", type="primary"):
            with st.spinner("Analyzing candidates..."):
                analysis_query = f"""
                I have identified {len(habitable)} potentially habitable planet candidates 
                with temperatures between {temp_min}-{temp_max}K and radii between {radius_min}-{radius_max} Earth radii.
                
                Please analyze the top candidates and provide:
                1. Assessment of their habitability potential
                2. Which ones are most promising and why
                3. What additional data would help vet these candidates
                4. Any concerns or limitations
                """
                response = ask_gemini(analysis_query, top_candidates)
                st.markdown(response)
        
        # Export
        csv = habitable.to_csv(index=False)
        st.download_button(
            label="📥 Download Habitable Candidates",
            data=csv,
            file_name="habitable_candidates.csv",
            mime="text/csv"
        )
    
    else:
        st.warning("No planets found matching the current habitability criteria. Try adjusting the parameters.")
        st.info("💡 Tip: Earth-like conditions are ~288K temperature and ~1.0 Earth radius, but life might exist in a wider range!")
