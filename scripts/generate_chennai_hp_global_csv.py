"""
Generate and evaluate Chennai, Himachal Pradesh, and Global Agricultural Sites
Strictly using only the 11 requested features:
- temp_max_forecast_7d
- temp_night_min_7d
- rh_avg_forecast_7d
- vpd_kpa
- soil_moisture_vol_pct
- consecutive_hot_days
- crop_gdd_accumulated
- rainfall_3d_sum_mm
- soil_clay_pct
- soil_ec_ds_m
- soil_ph
"""
import joblib
import pandas as pd
import numpy as np
import os

model = joblib.load("ps02-engine/data/model1_climate_stress.joblib")

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
    0: "Optimal growth conditions sustained. No abiotic rescue required. Continue standard crop care.",
    1: "Heat Stress Alert. Elevated thermal load. Apply Syngenta Quantis @ 250ml/ac foliar spray to halt flower/pod abortion.",
    2: "Drought Stress Alert. Root-zone moisture critical. Schedule deficit irrigation and apply osmoprotectant (Quantis/Isabion).",
    3: "Compound Stress Alert (Extreme Heat + Drought). Critical canopy desiccation risk. Immediate anti-transpirant foliar spray within 48h.",
    4: "Flooding / Waterlogging Alert. Root-zone anoxia risk. Open surface field drainage ditches immediately; halt nitrogen foliar feeding.",
    5: "Frost / Cold Stress Alert. Sub-zero nocturnal freeze risk. Irrigate lightly to increase thermal inertia; apply smoke smudging or anti-frost spray.",
    6: "Salinity Stress Detected. Root-zone EC > 4.0 dS/m. Apply gypsum amendments and flush with non-saline irrigation water."
}

test_scenarios = [
    # 1. Chennai, Tamil Nadu (India) - Current Real-Time Live Telemetry
    {
        "test_id": "LOC-01-CHN-LIVE",
        "location": "Chennai, Tamil Nadu, India",
        "region_type": "India (Coastal South)",
        "most_grown_crop": "Paddy (Rice - Samba Season)",
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
    # 2. Chennai, Tamil Nadu (India) - Northeast Monsoon Inundation Scenario
    {
        "test_id": "LOC-02-CHN-MONSOON",
        "location": "Chennai Coastal Lowlands, Tamil Nadu, India",
        "region_type": "India (Coastal South)",
        "most_grown_crop": "Paddy (Rice)",
        "temp_max_forecast_7d": 27.5,
        "temp_night_min_7d": 23.0,
        "rh_avg_forecast_7d": 94.0,
        "vpd_kpa": 0.35,
        "soil_moisture_vol_pct": 91.5,
        "consecutive_hot_days": 0,
        "crop_gdd_accumulated": 780.0,
        "rainfall_3d_sum_mm": 142.0,
        "soil_clay_pct": 36.0,
        "soil_ec_ds_m": 1.10,
        "soil_ph": 7.00
    },
    # 3. Shimla / Kullu, Himachal Pradesh (India) - Current Real-Time Live Telemetry
    {
        "test_id": "LOC-03-HP-LIVE",
        "location": "Shimla, Himachal Pradesh, India",
        "region_type": "India (Himalayan North)",
        "most_grown_crop": "Apple (Malus domestica)",
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
    # 4. Kullu Valley, Himachal Pradesh (India) - Winter Freeze / Frost Scenario
    {
        "test_id": "LOC-04-HP-FROST",
        "location": "Kullu Valley, Himachal Pradesh, India",
        "region_type": "India (Himalayan North)",
        "most_grown_crop": "Apple Orchard (Dormant / Bloom)",
        "temp_max_forecast_7d": 11.5,
        "temp_night_min_7d": -2.2,
        "rh_avg_forecast_7d": 80.0,
        "vpd_kpa": 0.35,
        "soil_moisture_vol_pct": 42.0,
        "consecutive_hot_days": 0,
        "crop_gdd_accumulated": 180.0,
        "rainfall_3d_sum_mm": 0.0,
        "soil_clay_pct": 22.0,
        "soil_ec_ds_m": 0.35,
        "soil_ph": 6.50
    },
    # 5. Des Moines, Iowa (USA) - Current Real-Time Live Telemetry
    {
        "test_id": "LOC-05-USA-IOWA-LIVE",
        "location": "Des Moines, Iowa, USA (US Corn Belt)",
        "region_type": "Out of India (North America)",
        "most_grown_crop": "Corn (Maize) / Soybean",
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
    # 6. Sorriso, Mato Grosso (Brazil) - Current Real-Time Live Telemetry
    {
        "test_id": "LOC-06-BRAZIL-LIVE",
        "location": "Sorriso, Mato Grosso, Brazil (Cerrado Mega-Belt)",
        "region_type": "Out of India (South America)",
        "most_grown_crop": "Soybean (Tropical)",
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
    },
    # 7. Fresno, California (USA) - Central Valley Salinity Challenge
    {
        "test_id": "LOC-07-USA-CALIF-SALINE",
        "location": "San Joaquin Valley, California, USA",
        "region_type": "Out of India (North America)",
        "most_grown_crop": "Almonds / Tomatoes",
        "temp_max_forecast_7d": 34.5,
        "temp_night_min_7d": 18.0,
        "rh_avg_forecast_7d": 35.0,
        "vpd_kpa": 2.40,
        "soil_moisture_vol_pct": 28.0,
        "consecutive_hot_days": 0,
        "crop_gdd_accumulated": 1250.0,
        "rainfall_3d_sum_mm": 0.0,
        "soil_clay_pct": 31.0,
        "soil_ec_ds_m": 5.60,
        "soil_ph": 8.40
    },
    # 8. Kyiv Oblast (Ukraine) - Eurasian Grain Steppe (Optimal Spring/Summer)
    {
        "test_id": "LOC-08-UKRAINE-STEPPE",
        "location": "Chernozem Belt, Ukraine",
        "region_type": "Out of India (Eastern Europe)",
        "most_grown_crop": "Winter Wheat / Sunflower",
        "temp_max_forecast_7d": 25.0,
        "temp_night_min_7d": 15.5,
        "rh_avg_forecast_7d": 64.0,
        "vpd_kpa": 1.15,
        "soil_moisture_vol_pct": 42.0,
        "consecutive_hot_days": 0,
        "crop_gdd_accumulated": 750.0,
        "rainfall_3d_sum_mm": 18.0,
        "soil_clay_pct": 29.0,
        "soil_ec_ds_m": 0.45,
        "soil_ph": 6.80
    }
]

df = pd.DataFrame(test_scenarios)
X = df[feature_cols]

preds = model.predict(X)
probs = model.predict_proba(X)

records = []
for i, row in df.iterrows():
    p_id = int(preds[i])
    p_name = classes[p_id]
    p_conf = round(float(probs[i][p_id]) * 100, 2)
    
    rec = {
        "test_id": row["test_id"],
        "location": row["location"],
        "region_type": row["region_type"],
        "most_grown_crop": row["most_grown_crop"],
        # The 11 exact input features
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
        # Model predictions
        "predicted_stress_class_id": p_id,
        "predicted_stress_name": p_name,
        "confidence_pct": p_conf,
        # Probabilities across all 7 classes
        "prob_optimal_pct": round(float(probs[i][0]) * 100, 2),
        "prob_heat_stress_pct": round(float(probs[i][1]) * 100, 2),
        "prob_drought_stress_pct": round(float(probs[i][2]) * 100, 2),
        "prob_compound_stress_pct": round(float(probs[i][3]) * 100, 2),
        "prob_flooding_pct": round(float(probs[i][4]) * 100, 2),
        "prob_frost_stress_pct": round(float(probs[i][5]) * 100, 2),
        "prob_salinity_stress_pct": round(float(probs[i][6]) * 100, 2),
        "agronomic_recommendation": prescriptions[p_id]
    }
    records.append(rec)

res_df = pd.DataFrame(records)

# Export to both locations
path1 = "data/model1_chennai_hp_global_testing.csv"
path2 = "ps02-engine/data/model1_chennai_hp_global_testing.csv"

os.makedirs("data", exist_ok=True)
os.makedirs("ps02-engine/data", exist_ok=True)

res_df.to_csv(path1, index=False)
res_df.to_csv(path2, index=False)

print(f"[SUCCESS] CSV Exported: {os.path.abspath(path1)} ({os.path.getsize(path1)} bytes)")
print(f"[SUCCESS] CSV Exported: {os.path.abspath(path2)} ({os.path.getsize(path2)} bytes)")

# Print formatted summary table
summary_cols = ["test_id", "location", "most_grown_crop", "temp_max_forecast_7d", "soil_moisture_vol_pct", "soil_ec_ds_m", "predicted_stress_name", "confidence_pct"]
print("\n" + "=" * 135)
print("AASRA MODEL 1 EVALUATION: CHENNAI, HIMACHAL PRADESH & GLOBAL REGIONS")
print("=" * 135)
print(res_df[summary_cols].to_string(index=False))
print("=" * 135)
