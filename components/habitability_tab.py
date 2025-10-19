import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from backend.gemini_agent import ask_gemini_dynamic


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
        # Try to find disposition column
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
    
    # Remove rows with null values in key columns
    habitable = habitable.dropna(subset=[temp_col, radius_col])
    
    # Results
    st.markdown("---")
    st.subheader(f"🎯 Results: {len(habitable)} Potentially Habitable Candidates")
    
    if len(habitable) > 0:
        # Visualization
        fig = go.Figure()
        
        # Add Earth reference point
        fig.add_trace(go.Scatter(
            x=[288],
            y=[1.0],
            mode='markers',
            marker=dict(size=15, color='lightblue', symbol='star', line=dict(width=2, color='white')),
            name='Earth',
            text=['Earth'],
            hovertemplate='<b>Earth</b><br>Temp: 288K<br>Radius: 1.0<extra></extra>'
        ))
        
        # Add habitable zone
        fig.add_trace(go.Scatter(
            x=habitable[temp_col],
            y=habitable[radius_col],
            mode='markers',
            marker=dict(size=8, color='green', opacity=0.6),
            name='Potentially Habitable',
            text=habitable.index,
            hovertemplate='<b>Index %{text}</b><br>Temp: %{x:.1f}K<br>Radius: %{y:.2f}<extra></extra>'
        ))
        
        # Add all other planets for context
        other = df[~df.index.isin(habitable.index)].dropna(subset=[temp_col, radius_col])
        if len(other) > 0:
            fig.add_trace(go.Scatter(
                x=other[temp_col],
                y=other[radius_col],
                mode='markers',
                marker=dict(size=5, color='gray', opacity=0.3),
                name='Other Planets',
                hovertemplate='Temp: %{x:.1f}K<br>Radius: %{y:.2f}<extra></extra>'
            ))
        
        fig.update_layout(
            title="Habitability Zone Analysis",
            xaxis_title=f"{temp_col} (K)",
            yaxis_title=f"{radius_col} (Earth Radii)",
            template="plotly_dark",
            hovermode='closest'
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Top candidates
        st.subheader("🏆 Top Candidates")
        
        # Calculate Earth similarity score
        habitable['earth_similarity_score'] = (
            1 / (1 + abs(habitable[temp_col] - 288) / 288) * 
            1 / (1 + abs(habitable[radius_col] - 1.0))
        )
        
        top_candidates = habitable.nlargest(10, 'earth_similarity_score')
        st.dataframe(
            top_candidates.style.background_gradient(subset=['earth_similarity_score'], cmap='Greens'),
            use_container_width=True
        )
        
        # AI Analysis
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
                
                response = ask_gemini_dynamic(analysis_query, top_candidates, include_full_sample=True)
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