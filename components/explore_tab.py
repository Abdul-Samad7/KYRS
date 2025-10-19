import streamlit as st
import plotly.express as px

def render(df):
    st.header("🌌 Explore Kepler Planets")

    col1, col2, col3 = st.columns(3)
    with col1:
        dispositions = st.multiselect(
            "Planet Disposition",
            options=sorted(df["koi_disposition"].dropna().unique()),
            default=["CONFIRMED"]
        )
    with col2:
        temp_range = st.slider("Equilibrium Temp (K)", 100, 1000, (250, 350))
    with col3:
        radius_range = st.slider("Radius (Earth radii)", 0.5, 4.0, (0.5, 2.0))

    filtered = df[
        (df["koi_disposition"].isin(dispositions)) &
        (df["koi_teq"].between(*temp_range)) &
        (df["koi_prad"].between(*radius_range))
    ]

    st.markdown(f"**Showing {len(filtered):,} planets**")

    fig = px.scatter(filtered, x="koi_teq", y="koi_prad",
                     color="koi_disposition", title="Temperature vs Radius",
                     template="plotly_dark")
    st.plotly_chart(fig, use_container_width=True)
    st.dataframe(filtered.head(20))