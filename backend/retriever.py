import pandas as pd
import re

def filter_dataframe(df, query):
    """Basic rule-based filters for numeric and disposition queries."""
    query = query.lower()
    mask = pd.Series(True, index=df.index)

    synonyms = {
        "temp": "koi_teq",
        "temperature": "koi_teq",
        "radius": "koi_prad",
        "period": "koi_period"
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

    # disposition keywords
    if "confirmed" in query:
        mask &= df["koi_disposition"].str.contains("CONFIRMED", case=False)
    elif "candidate" in query:
        mask &= df["koi_disposition"].str.contains("CANDIDATE", case=False)
    elif "false" in query:
        mask &= df["koi_disposition"].str.contains("FALSE", case=False)

    subset = df[mask]
    return subset if not subset.empty else df.head(5)
