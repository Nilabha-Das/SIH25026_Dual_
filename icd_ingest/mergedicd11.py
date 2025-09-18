import pandas as pd

# Load datasets
mms_df = pd.read_csv("icd11_clean.csv")
tm2_df = pd.read_csv("tm2_mock_150 (1).csv")

# Add module identifiers
mms_df["module"] = "MMS"
tm2_df["module"] = "TM2"

# Align columns (make sure both have same structure)
for col in mms_df.columns:
    if col not in tm2_df.columns:
        tm2_df[col] = ""

for col in tm2_df.columns:
    if col not in mms_df.columns:
        mms_df[col] = ""

# Merge
icd_combined = pd.concat([mms_df, tm2_df], ignore_index=True)

# Save
icd_combined.to_csv("icd11_full.csv", index=False)
print("✅ Combined ICD dataset saved as icd11_full.csv")
