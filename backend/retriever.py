import pandas as pd
import re

def filter_dataframe(df, query):
    """Basic rule-based filters for numeric and disposition queries."""
    query = query.lower()
    mask = pd.Series(True, index=df.index)

    # Updated column name mappings
    synonyms = {
        "temp": "equilibrium_temperature_kelvin",
        "temperature": "equilibrium_temperature_kelvin",
        "radius": "planet_radius_earth_radii",
        "period": "orbital_period_days"
    }

    # numeric comparisons
    for word, col in synonyms.items():
        if word in query:
            nums = [float(n) for n in re.findall(r"[0-9]+", query)]
            if "<" in query and nums:
                mask &= df[col] < nums[0]
            elif ">" in query and nums:
                mask &= df[col] > nums[0]
            elif "between" in query and len(nums) >= 2:
                mask &= df[col].between(nums[0], nums[1])

    # disposition keywords - updated column name
    if "confirmed" in query:
        mask &= df["disposition_using_kepler_data"].str.contains("CONFIRMED", case=False)
    elif "candidate" in query:
        mask &= df["disposition_using_kepler_data"].str.contains("CANDIDATE", case=False)
    elif "false" in query:
        mask &= df["disposition_using_kepler_data"].str.contains("FALSE", case=False)

    subset = df[mask]
    return subset if not subset.empty else df.head(5)