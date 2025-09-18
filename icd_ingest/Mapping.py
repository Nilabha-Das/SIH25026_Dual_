import pandas as pd
from sentence_transformers import SentenceTransformer, util

# Load datasets
namaste_df = pd.read_csv("mock_namaste_codes_150.csv")
icd11_df = pd.read_csv("icd11_full.csv")  # contains MMS + TM2

# ✅ Prepare text fields
icd11_df["title"] = icd11_df["title"].fillna("")
namaste_df["full_text"] = (
    namaste_df["display"].fillna("") + " " + namaste_df["synonyms"].fillna("")
)

# ✅ Load a semantic model (lightweight multilingual for better medical terms)
model = SentenceTransformer("all-MiniLM-L6-v2")

# Encode ICD-11 titles
icd_embeddings = model.encode(icd11_df["title"].tolist(), convert_to_tensor=True)

mappings = []

# Iterate over each Namaste code
for _, row in namaste_df.iterrows():
    desc = row["full_text"]

    # Encode Namaste text
    desc_emb = model.encode(desc, convert_to_tensor=True)

    # Compute cosine similarity
    sims = util.cos_sim(desc_emb, icd_embeddings)[0].cpu().numpy()

    # Best match
    best_idx = sims.argmax()
    best_score = sims[best_idx]
    best_icd = icd11_df.iloc[best_idx]

    mappings.append({
        "namaste_code": row["code"],
        "namaste_display": row["display"],
        "icd_code": best_icd["code"],
        "icd_title": best_icd["title"],
        "module": best_icd["module"],   # MMS or TM2
        "confidence": round(float(best_score), 3)
    })

# Save results
mapping_df = pd.DataFrame(mappings)
mapping_df.to_csv("namaste_icd11_semantic_mapping.csv", index=False)

print("✅ Semantic mapping completed. File saved as namaste_icd11_semantic_mapping.csv")
