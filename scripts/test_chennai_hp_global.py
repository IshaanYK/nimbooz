"""
Run Model 1 inference for:
1. Chennai, Tamil Nadu (India) - Primary crop: Paddy (Rice)
2. Shimla, Himachal Pradesh (India) - Primary crop: Apple
3. Des Moines, Iowa (USA) - Primary crop: Corn (Maize) / Soybean
4. Sorriso, Mato Grosso (Brazil) - Primary crop: Soybean
Using ONLY the exact 11 input features requested.
"""
import joblib
import pandas as pd
import numpy as np
import os

# Load model
model_path = "ps02-engine/data/model1_climate_stress.joblib"
champion_model = joblib.load(model_path)

# Exact 11 features requested by user
feature_cols = [
    "temp_max_forecast_7d",
    "temp_night_min_7d",
    "rh_avg_forecast_7d",
    "vpd_kpa",
    "soil_moisture_vol_pct",
    "consecutive_hot_days",
    "crop_gdd_accumulated",
    "rainfall_3d_sum_mm",
    "soil_clay_pct",
    "soil_ec_ds_m",
    "soil_ph"
]

classes = {
    0: "Optimal Growth",
    1: "Heat Stress",
    2: "Drought Stress",
    3: "Compound Stress (Heat+Drought)",
    4: "Flooding / Waterlogging",
    5: "Frost / Cold Stress",
    6: "Salinity Stress"
}

prescriptions = {
    0: "Optimal biophysical parameters. Continue scheduled nutrition and normal crop management.",
    1: "Foliar biostimulant application (Syngenta Quantis @ 250ml/ac) recommended within 48h to mitigate heat-induced floral/grain abortion.",
    2: "Root-zone soil water deficit critical (<20% moisture). Apply osmoprotectant (Quantis/Isabion) and schedule urgent deficit irrigation.",
    3: "Extreme compound thermal-hydric stress. Urgent anti-transpirant / biostimulant foliar spray to preserve cellular turgor.",
    4: "Root-zone waterlogging risk. Ensure immediate surface field drainage; withhold nitrogen fertilizer until soil aerates.",
    5: "Sub-optimal chilling/frost risk. Apply protective anti-frost biostimulant and maintain light evening surface irrigation.",
    6: "High osmotic salinity resistance. Flush with non-saline canal water; apply gypsum soil amendments."
}

# The test dataset with exact 11 features
test_data = [
    {
        "location_name": "Chennai, Tamil Nadu, India",
        "primary_crop": "Paddy (Rice)",
        "temp_max_forecast_7d": 35.2,
        "temp_night_min_7d": 26.6,
        "rh_avg_forecast_7d": 72.0,
        "vpd_kpa": 1.32,
        "soil_moisture_vol_pct": 13.9,
        "consecutive_hot_days": 0,
        "crop_gdd_accumulated": 850.0,
        "rainfall_3d_sum_mm": 6.9,
        "soil_clay_pct": 30.0,
        "soil_ec_ds_m": 1.40,
        "soil_ph": 7.20
    },
    {
        "location_name": "Shimla, Himachal Pradesh, India",
        "primary_crop": "Apple (Temperate Fruit)",
        "temp_max_forecast_7d": 21.2,
        "temp_night_min_7d": 11.9,
        "rh_avg_forecast_7d": 86.5,
        "vpd_kpa": 0.30,
        "soil_moisture_vol_pct": 29.1,
        "consecutive_hot_days": 0,
        "crop_gdd_accumulated": 520.0,
        "rainfall_3d_sum_mm": 15.4,
        "soil_clay_pct": 20.0,
        "soil_ec_ds_m": 0.40,
        "soil_ph": 6.40
    },
    {
        "location_name": "Des Moines, Iowa, USA (Corn Belt)",
        "primary_crop": "Corn (Maize) / Soybean",
        "temp_max_forecast_7d": 35.0,
        "temp_night_min_7d": 19.7,
        "rh_avg_forecast_7d": 59.2,
        "vpd_kpa": 1.68,
        "soil_moisture_vol_pct": 14.5,
        "consecutive_hot_days": 1,
        "crop_gdd_accumulated": 1100.0,
        "rainfall_3d_sum_mm": 5.8,
        "soil_clay_pct": 27.0,
        "soil_ec_ds_m": 0.50,
        "soil_ph": 6.60
    },
    {
        "location_name": "Sorriso, Mato Grosso, Brazil (Cerrado)",
        "primary_crop": "Soybean",
        "temp_max_forecast_7d": 33.4,
        "temp_night_min_7d": 22.6,
        "rh_avg_forecast_7d": 75.2,
        "vpd_kpa": 1.06,
        "soil_moisture_vol_pct": 30.2,
        "consecutive_hot_days": 0,
        "crop_gdd_accumulated": 920.0,
        "rainfall_3d_sum_mm": 15.5,
        "soil_clay_pct": 38.0,
        "soil_ec_ds_m": 0.30,
        "soil_ph": 5.80
    }
]

df = pd.DataFrame(test_data)
# Filter strictly to the 11 features
X_test = df[feature_cols]

predictions = champion_model.predict(X_test)
probabilities = champion_model.predict_proba(X_test)

results = []
for i, row in df.iterrows():
    p_id = int(predictions[i])
    p_name = classes[p_id]
    p_conf = round(float(probabilities[i][p_id]) * 100, 2)
    
    res_entry = {
        "location": row["location_name"],
        "primary_crop": row["primary_crop"],
        "temp_max_forecast_7d": row["temp_max_forecast_7d"],
        "temp_night_min_7d": row["temp_night_min_7d"],
        "rh_avg_forecast_7d": row["rh_avg_forecast_7d"],
        "vpd_kpa": row["vpd_kpa"],
        "soil_moisture_vol_pct": row["soil_moisture_vol_pct"],
        "consecutive_hot_days": row["consecutive_hot_days"],
        "crop_gdd_accumulated": row["crop_gdd_accumulated"],
        "rainfall_3d_sum_mm": row["rainfall_3d_sum_mm"],
        "soil_clay_pct": row["soil_clay_pct"],
        "soil_ec_ds_m": row["soil_ec_ds_m"],
        "soil_ph": row["soil_ph"],
        "predicted_stress_class_id": p_id,
        "predicted_stress_name": p_name,
        "confidence_pct": p_conf,
        "prob_optimal_pct": round(float(probabilities[i][0]) * 100, 2),
        "prob_heat_stress_pct": round(float(probabilities[i][1]) * 100, 2),
        "prob_drought_stress_pct": round(float(probabilities[i][2]) * 100, 2),
        "prob_compound_stress_pct": round(float(probabilities[i][3]) * 100, 2),
        "prob_flooding_pct": round(float(probabilities[i][4]) * 100, 2),
        "prob_frost_stress_pct": round(float(probabilities[i][5]) * 100, 2),
        "prob_salinity_stress_pct": round(float(probabilities[i][6]) * 100, 2),
        "agronomic_recommendation": prescriptions[p_id]
    }
    results.append(res_entry)

res_df = pd.DataFrame(results)

# Export to CSV
csv_out = "data/model1_chennai_hp_global_testing.csv"
res_df.to_csv(csv_out, index=False)
print(f"[SUCCESS] Exported CSV to: {os.path.abspath(csv_out)}")

# Display summary table
display_cols = ["location", "primary_crop", "temp_max_forecast_7d", "soil_moisture_vol_pct", "soil_ec_ds_m", "predicted_stress_name", "confidence_pct"]
print("\n" + "=" * 115)
print("AASRA MODEL 1 EVALUATION: CHENNAI, HIMACHAL PRADESH & GLOBAL SITES")
print("=" * 115)
print(res_df[display_cols].to_string(index=False))
print("=" * 115)
