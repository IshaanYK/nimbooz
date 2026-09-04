"""
Generate comprehensive CSV of Model 1 20-Farmer Testing & Benchmarks
"""
import os
import datetime
import numpy as np
import pandas as pd
import joblib

AASRA_FARM_DATABASE = {
    "farmer-001-bhopal": {
        "farmer_name": "Ishaan Sen",
        "farm_title": "Main Acreage (Soybean North)",
        "district": "Bhopal",
        "state": "Madhya Pradesh",
        "latitude": 23.2599,
        "longitude": 77.4126,
        "field_area_acres": 5.0,
        "primary_crop": "Soybean",
        "crop_variety": "JS-9560 High Yield",
        "sowing_date": "2026-06-25",
        "soil_profile": {"clay_pct": 48.0, "ph": 7.6, "ec_ds_m": 0.85},
        "irrigation_type": "Rainfed + Borewell Drip"
    },
    "farmer-002-sehore": {
        "farmer_name": "Suresh Verma",
        "farm_title": "Riverbank Plot (Gram / Chana)",
        "district": "Sehore",
        "state": "Madhya Pradesh",
        "latitude": 23.2014,
        "longitude": 77.0845,
        "field_area_acres": 3.2,
        "primary_crop": "Gram / Chickpea",
        "crop_variety": "JG-11 Desi",
        "sowing_date": "2026-10-15",
        "soil_profile": {"clay_pct": 26.5, "ph": 7.2, "ec_ds_m": 0.90},
        "irrigation_type": "Canal + Sprinkler"
    },
    "farmer-003-latur": {
        "farmer_name": "Anil Jadhav",
        "farm_title": "Marathwada Drought-Prone Vertisol Field",
        "district": "Latur",
        "state": "Maharashtra",
        "latitude": 18.4088,
        "longitude": 76.5604,
        "field_area_acres": 6.5,
        "primary_crop": "Soybean",
        "crop_variety": "MAUS-71",
        "sowing_date": "2026-07-02",
        "soil_profile": {"clay_pct": 52.0, "ph": 8.1, "ec_ds_m": 1.15},
        "irrigation_type": "Rainfed"
    },
    "farmer-004-nashik": {
        "farmer_name": "Rajesh Patel",
        "farm_title": "Dindori Vineyard & Onion Acreage",
        "district": "Nashik",
        "state": "Maharashtra",
        "latitude": 19.9975,
        "longitude": 73.7898,
        "field_area_acres": 4.5,
        "primary_crop": "Onion / Soybean",
        "crop_variety": "Bhima Super",
        "sowing_date": "2026-07-10",
        "soil_profile": {"clay_pct": 38.0, "ph": 7.5, "ec_ds_m": 0.80},
        "irrigation_type": "Micro-Drip Fertigation"
    },
    "farmer-005-ludhiana": {
        "farmer_name": "Gurpreet Singh",
        "farm_title": "Canal Belt High-Yield Field",
        "district": "Ludhiana",
        "state": "Punjab",
        "latitude": 30.9010,
        "longitude": 75.8573,
        "field_area_acres": 12.0,
        "primary_crop": "Wheat / Paddy",
        "crop_variety": "HD-3086 / PR-126",
        "sowing_date": "2026-11-05",
        "soil_profile": {"clay_pct": 19.5, "ph": 7.4, "ec_ds_m": 0.70},
        "irrigation_type": "Tube-well + Canal"
    },
    "farmer-006-bhuj": {
        "farmer_name": "Bhavesh Desai",
        "farm_title": "Kutch Arid / Saline Coastal Field",
        "district": "Bhuj",
        "state": "Gujarat",
        "latitude": 23.2420,
        "longitude": 69.6669,
        "field_area_acres": 8.0,
        "primary_crop": "Bt Cotton / Groundnut",
        "crop_variety": "RCH-659 BG II",
        "sowing_date": "2026-06-20",
        "soil_profile": {"clay_pct": 31.0, "ph": 8.6, "ec_ds_m": 5.40},
        "irrigation_type": "Borewell (Saline Brackish)"
    },
    "farmer-007-patna": {
        "farmer_name": "Ramesh Kumar",
        "farm_title": "Gangetic Floodplain Rice Basin",
        "district": "Patna",
        "state": "Bihar",
        "latitude": 25.5941,
        "longitude": 85.1376,
        "field_area_acres": 4.0,
        "primary_crop": "Paddy / Rice",
        "crop_variety": "Swarna Sub-1",
        "sowing_date": "2026-07-15",
        "soil_profile": {"clay_pct": 42.0, "ph": 6.8, "ec_ds_m": 0.65},
        "irrigation_type": "Flood Inundation + Rainfed"
    },
    "farmer-008-indore": {
        "farmer_name": "Devendra Chouhan",
        "farm_title": "Sanwer High-Yield Black Soil Farm",
        "district": "Indore",
        "state": "Madhya Pradesh",
        "latitude": 22.7196,
        "longitude": 75.8577,
        "field_area_acres": 7.5,
        "primary_crop": "Soybean / Wheat",
        "crop_variety": "RVS-2001-4",
        "sowing_date": "2026-06-28",
        "soil_profile": {"clay_pct": 46.0, "ph": 7.7, "ec_ds_m": 0.82},
        "irrigation_type": "Borewell Drip"
    },
    "farmer-009-jalna": {
        "farmer_name": "Mahesh Shinde",
        "farm_title": "Marathwada Sweet Orange & Cotton Farm",
        "district": "Jalna",
        "state": "Maharashtra",
        "latitude": 19.8410,
        "longitude": 75.8864,
        "field_area_acres": 5.2,
        "primary_crop": "Cotton / Mosambi",
        "crop_variety": "Ajeet-155",
        "sowing_date": "2026-06-15",
        "soil_profile": {"clay_pct": 44.0, "ph": 8.0, "ec_ds_m": 0.95},
        "irrigation_type": "Rainfed + Deficit Drip"
    },
    "farmer-010-patiala": {
        "farmer_name": "Harpreet Kaur",
        "farm_title": "Nabha Basmati Export Farm",
        "district": "Patiala",
        "state": "Punjab",
        "latitude": 30.3398,
        "longitude": 76.3869,
        "field_area_acres": 9.0,
        "primary_crop": "Basmati Rice",
        "crop_variety": "Pusa-1121",
        "sowing_date": "2026-07-05",
        "soil_profile": {"clay_pct": 21.0, "ph": 7.5, "ec_ds_m": 0.72},
        "irrigation_type": "Canal + Tube-well"
    },
    "farmer-011-kasganj": {
        "farmer_name": "Raghvendra Yadav",
        "farm_title": "Doab Potato & Mustard Acreage",
        "district": "Kasganj",
        "state": "Uttar Pradesh",
        "latitude": 27.8083,
        "longitude": 78.6472,
        "field_area_acres": 3.8,
        "primary_crop": "Potato / Mustard",
        "crop_variety": "Kufri Bahar",
        "sowing_date": "2026-10-20",
        "soil_profile": {"clay_pct": 24.0, "ph": 7.6, "ec_ds_m": 1.20},
        "irrigation_type": "Borewell Furrow"
    },
    "farmer-012-kota": {
        "farmer_name": "Manoj Choudhary",
        "farm_title": "Hadoti Chambal Basin Vertisol Farm",
        "district": "Kota",
        "state": "Rajasthan",
        "latitude": 25.2138,
        "longitude": 75.8648,
        "field_area_acres": 6.0,
        "primary_crop": "Soybean / Mustard",
        "crop_variety": "NRC-37",
        "sowing_date": "2026-07-01",
        "soil_profile": {"clay_pct": 47.0, "ph": 7.9, "ec_ds_m": 1.10},
        "irrigation_type": "Chambal Canal Lift"
    },
    "farmer-013-anand": {
        "farmer_name": "Mukesh Trivedi",
        "farm_title": "Charotar Fertile Goradu Farm",
        "district": "Anand",
        "state": "Gujarat",
        "latitude": 22.5645,
        "longitude": 72.9289,
        "field_area_acres": 4.8,
        "primary_crop": "Groundnut / Tobacco",
        "crop_variety": "GG-20",
        "sowing_date": "2026-06-25",
        "soil_profile": {"clay_pct": 18.0, "ph": 7.4, "ec_ds_m": 0.85},
        "irrigation_type": "Tube-well Drip"
    },
    "farmer-014-hoshangabad": {
        "farmer_name": "Bhanu Pratap Singh",
        "farm_title": "Narmada Valley Alluvial Basin",
        "district": "Hoshangabad",
        "state": "Madhya Pradesh",
        "latitude": 22.7519,
        "longitude": 77.7289,
        "field_area_acres": 11.0,
        "primary_crop": "Wheat (Sharbati) / Gram",
        "crop_variety": "C-306 Sharbati",
        "sowing_date": "2026-11-10",
        "soil_profile": {"clay_pct": 49.0, "ph": 7.5, "ec_ds_m": 0.78},
        "irrigation_type": "Tawa Canal + Drip"
    },
    "farmer-015-guntur": {
        "farmer_name": "Venkata Rao",
        "farm_title": "Krishna Delta Commercial Chilli Farm",
        "district": "Guntur",
        "state": "Andhra Pradesh",
        "latitude": 16.3067,
        "longitude": 80.4365,
        "field_area_acres": 4.2,
        "primary_crop": "Chilli / Mirchi",
        "crop_variety": "Teja S17",
        "sowing_date": "2026-08-15",
        "soil_profile": {"clay_pct": 39.0, "ph": 7.8, "ec_ds_m": 1.45},
        "irrigation_type": "Drip Fertigation"
    },
    "farmer-016-dharwad": {
        "farmer_name": "Shivanand Patil",
        "farm_title": "North Karnataka Black Soil Plateau",
        "district": "Dharwad",
        "state": "Karnataka",
        "latitude": 15.4589,
        "longitude": 75.0078,
        "field_area_acres": 5.0,
        "primary_crop": "Bengal Gram / Sorghum",
        "crop_variety": "BGD-103",
        "sowing_date": "2026-10-05",
        "soil_profile": {"clay_pct": 37.0, "ph": 7.6, "ec_ds_m": 0.90},
        "irrigation_type": "Rainfed + Sprinkler"
    },
    "farmer-017-kolhapur": {
        "farmer_name": "Sunil Kamble",
        "farm_title": "Panchganga Basin High-Yield Sugarcane",
        "district": "Kolhapur",
        "state": "Maharashtra",
        "latitude": 16.7050,
        "longitude": 74.2433,
        "field_area_acres": 7.0,
        "primary_crop": "Sugarcane",
        "crop_variety": "Co-86032",
        "sowing_date": "2026-02-15",
        "soil_profile": {"clay_pct": 45.0, "ph": 7.3, "ec_ds_m": 0.80},
        "irrigation_type": "River Lift Furrow"
    },
    "farmer-018-hisar": {
        "farmer_name": "Subhash Chandra",
        "farm_title": "Semi-Arid Sandy Loam Farm",
        "district": "Hisar",
        "state": "Haryana",
        "latitude": 29.1492,
        "longitude": 75.7217,
        "field_area_acres": 6.5,
        "primary_crop": "Mustard / Pearl Millet",
        "crop_variety": "RH-725",
        "sowing_date": "2026-10-12",
        "soil_profile": {"clay_pct": 16.0, "ph": 7.8, "ec_ds_m": 1.10},
        "irrigation_type": "Borewell Sprinkler"
    },
    "farmer-019-thanjavur": {
        "farmer_name": "Kalyan Murugan",
        "farm_title": "Cauvery Delta Silt Rice Farm",
        "district": "Thanjavur",
        "state": "Tamil Nadu",
        "latitude": 10.7870,
        "longitude": 79.1378,
        "field_area_acres": 3.5,
        "primary_crop": "Paddy / Samba Rice",
        "crop_variety": "CR-1009 Sub-1",
        "sowing_date": "2026-09-01",
        "soil_profile": {"clay_pct": 41.0, "ph": 6.9, "ec_ds_m": 0.70},
        "irrigation_type": "Canal Inundation"
    },
    "farmer-020-bikaner": {
        "farmer_name": "Jagdish Prasad",
        "farm_title": "Thar Desert Arid Saline Border Farm",
        "district": "Bikaner",
        "state": "Rajasthan",
        "latitude": 28.0229,
        "longitude": 73.3119,
        "field_area_acres": 14.0,
        "primary_crop": "Guar / Moth Bean",
        "crop_variety": "RGC-936",
        "sowing_date": "2026-07-12",
        "soil_profile": {"clay_pct": 11.0, "ph": 8.5, "ec_ds_m": 4.60},
        "irrigation_type": "Indira Gandhi Canal + Rainfed"
    }
}

champion_model = joblib.load("ps02-engine/data/model1_climate_stress.joblib")

feature_cols = [
    "temp_max_forecast_7d", "temp_night_min_7d", "rh_avg_forecast_7d",
    "vpd_kpa", "soil_moisture_vol_pct", "consecutive_hot_days",
    "crop_gdd_accumulated", "rainfall_3d_sum_mm", "soil_clay_pct",
    "soil_ec_ds_m", "soil_ph"
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
    0: "Optimal biophysical conditions sustained. No abiotic rescue required. Maintain standard nutrition and IPM scouting.",
    1: "Heat Stress Alert. High thermal load detected. Handoff to Model 2 for foliar application of Syngenta Quantis @ 250ml/ac.",
    2: "Drought Stress Alert. Root-zone moisture depleted. Apply protective osmolyte biostimulants (Quantis / Isabion) and light deficit irrigation.",
    3: "Compound Stress Alert (Extreme Heat + Drought). Critical stomatal closure risk. Immediate anti-transpirant/osmoprotectant foliar spray within 48h.",
    4: "Flooding / Waterlogging Alert. Soil saturated above field capacity. Drain standing water immediately; withhold nitrogen foliar feeding.",
    5: "Frost / Cold Stress Warning. Nocturnal freeze threshold breached. Light night irrigation to raise thermal capacity; apply anti-frost biostimulants.",
    6: "Salinity Stress Detected. Soil ECe > 4.0 dS/m. Apply gypsum amendments and flush root zone with non-saline canal water."
}

rows = []
for fid, f in AASRA_FARM_DATABASE.items():
    lat, lon = f["latitude"], f["longitude"]
    soil = f["soil_profile"]
    
    # Calculate Days After Sowing (DAS)
    sow_dt = datetime.datetime.strptime(f["sowing_date"], "%Y-%m-%d").date()
    today_dt = datetime.date.today()
    das_val = max(10, (today_dt - sow_dt).days) if today_dt >= sow_dt else 45
    
    # Representative weather conditions matching local agro-climate geography
    if "bhuj" in fid or "bikaner" in fid:
        t_max = 34.0 if "bhuj" in fid else 42.5
        t_min = 23.0
        rh = 48.0 if "bhuj" in fid else 22.0
        vpd = 2.2 if "bhuj" in fid else 4.2
        sm = 28.0 if "bhuj" in fid else 14.0
        consec_hot = 0 if "bhuj" in fid else 4
        gdd = 850.0
        precip3d = 0.0
    elif "latur" in fid or "jalna" in fid:
        t_max = 33.5
        t_min = 21.5
        rh = 36.0
        vpd = 2.9
        sm = 16.5
        consec_hot = 1
        gdd = 780.0
        precip3d = 0.0
    elif "patna" in fid or "thanjavur" in fid or "kolhapur" in fid:
        t_max = 28.0
        t_min = 22.0
        rh = 92.0
        vpd = 0.45
        sm = 88.0
        consec_hot = 0
        gdd = 820.0
        precip3d = 110.0
    elif "ludhiana" in fid or "hisar" in fid or "kasganj" in fid:
        t_max = 14.5
        t_min = 1.0
        rh = 78.0
        vpd = 0.45
        sm = 44.0
        consec_hot = 0
        gdd = 420.0
        precip3d = 0.0
    elif "kota" in fid or "guntur" in fid:
        t_max = 42.0
        t_min = 28.5
        rh = 26.0
        vpd = 4.1
        sm = 31.0
        consec_hot = 5
        gdd = 980.0
        precip3d = 0.0
    else:
        t_max = 26.5
        t_min = 18.0
        rh = 65.0
        vpd = 1.2
        sm = 48.0
        consec_hot = 0
        gdd = 650.0
        precip3d = 12.0
        
    feat_dict = {
        "temp_max_forecast_7d": t_max,
        "temp_night_min_7d": t_min,
        "rh_avg_forecast_7d": rh,
        "vpd_kpa": vpd,
        "soil_moisture_vol_pct": sm,
        "consecutive_hot_days": consec_hot,
        "crop_gdd_accumulated": gdd,
        "rainfall_3d_sum_mm": precip3d,
        "soil_clay_pct": soil["clay_pct"],
        "soil_ec_ds_m": soil["ec_ds_m"],
        "soil_ph": soil["ph"]
    }
    
    df_single = pd.DataFrame([feat_dict])[feature_cols]
    pred_idx = int(champion_model.predict(df_single)[0])
    probs = champion_model.predict_proba(df_single)[0]
    conf = probs[pred_idx]
    
    rows.append({
        "farmer_id": fid,
        "farmer_name": f["farmer_name"],
        "farm_title": f["farm_title"],
        "district": f["district"],
        "state": f["state"],
        "latitude": lat,
        "longitude": lon,
        "field_area_acres": f["field_area_acres"],
        "primary_crop": f["primary_crop"],
        "crop_variety": f["crop_variety"],
        "sowing_date": f["sowing_date"],
        "days_after_sowing": das_val,
        "soil_clay_pct": soil["clay_pct"],
        "soil_ec_ds_m": soil["ec_ds_m"],
        "soil_ph": soil["ph"],
        "temp_max_forecast_7d_c": t_max,
        "temp_night_min_7d_c": t_min,
        "rh_avg_forecast_7d_pct": rh,
        "vpd_kpa": vpd,
        "soil_moisture_vol_pct": sm,
        "consecutive_hot_days": consec_hot,
        "crop_gdd_accumulated": gdd,
        "rainfall_3d_sum_mm": precip3d,
        "predicted_stress_class_id": pred_idx,
        "predicted_stress_name": classes[pred_idx],
        "confidence_pct": round(conf * 100, 2),
        "prob_optimal_pct": round(probs[0] * 100, 2),
        "prob_heat_stress_pct": round(probs[1] * 100, 2),
        "prob_drought_stress_pct": round(probs[2] * 100, 2),
        "prob_compound_stress_pct": round(probs[3] * 100, 2),
        "prob_flooding_pct": round(probs[4] * 100, 2),
        "prob_frost_stress_pct": round(probs[5] * 100, 2),
        "prob_salinity_stress_pct": round(probs[6] * 100, 2),
        "agronomic_recommendation": prescriptions[pred_idx]
    })

df_export = pd.DataFrame(rows)

# Save to data directory
csv_path_1 = os.path.join("data", "model1_farmers_benchmark_testing.csv")
csv_path_2 = os.path.join("ps02-engine", "data", "model1_farmers_benchmark_testing.csv")

os.makedirs("data", exist_ok=True)
os.makedirs(os.path.join("ps02-engine", "data"), exist_ok=True)

df_export.to_csv(csv_path_1, index=False)
df_export.to_csv(csv_path_2, index=False)

print(f"Exported benchmark CSV: {os.path.abspath(csv_path_1)} ({os.path.getsize(csv_path_1)} bytes)")
print(f"Exported engine CSV:    {os.path.abspath(csv_path_2)} ({os.path.getsize(csv_path_2)} bytes)")
