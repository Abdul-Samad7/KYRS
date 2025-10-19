import streamlit as st
import plotly.express as px

def render(df):
    st.header("🌌 Explore Kepler Planets")

    col1, col2, col3 = st.columns(3)
    with col1:
        dispositions = st.multiselect(
            "Planet Disposition",
            # Updated column name
            options=sorted(df["disposition_using_kepler_data"].dropna().unique()),
            default=["CONFIRMED"]
        )
    with col2:
        temp_range = st.slider("Equilibrium Temp (K)", 100, 1000, (250, 350))
    with col3:
        radius_range = st.slider("Radius (Earth radii)", 0.5, 4.0, (0.5, 2.0))

    # Updated all column names
    filtered = df[
        (df["disposition_using_kepler_data"].isin(dispositions)) &
        (df["equilibrium_temperature_kelvin"].between(*temp_range)) &
        (df["planet_radius_earth_radii"].between(*radius_range))
    ]

    st.markdown(f"**Showing {len(filtered):,} planets**")

    # Updated column names in plot
    fig = px.scatter(
        filtered, 
        x="equilibrium_temperature_kelvin", 
        y="planet_radius_earth_radii",
        color="disposition_using_kepler_data", 
        title="Temperature vs Radius",
        labels={
            "equilibrium_temperature_kelvin": "Equilibrium Temperature (K)",
            "planet_radius_earth_radii": "Planet Radius (Earth Radii)",
            "disposition_using_kepler_data": "Disposition"
        },
        template="plotly_dark"
    )
    st.plotly_chart(fig, use_container_width=True)
    st.dataframe(filtered.head(20))