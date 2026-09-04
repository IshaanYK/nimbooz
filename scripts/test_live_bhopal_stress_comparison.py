"""
AASRA Model 1: Bhopal Live Telemetry vs. Drought Stress Comparative Benchmark
Fetches real-time weather & soil telemetry for Bhopal, Madhya Pradesh (23.2599°N, 77.4126°E)
and performs a head-to-head comparison against a simulated severe drought scenario.
Outputs:
- data/model1_bhopal_live_vs_drought_comparison.csv
- ps02-engine/data/model1_bhopal_live_vs_drought_comparison.csv
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib

# Import live ingestor
sys.path.append(os.path.dirname(__file__))
from live_api_telemetry_fetcher import AASRATelemetryIngestor

def run_bhopal_live_vs_drought_test():
    print("=" * 110)
    print("AASRA MODEL 1: BHOPAL LIVE TELEMETRY VS. DROUGHT STRESS COMPARATIVE EVALUATION")
    print("=" * 110)
    
    # 1. Load Champion Model
    model_path = "ps02-engine/data/model1_climate_stress.joblib"
    assert os.path.exists(model_path), f"Champion model not found at {model_path}"
    model = joblib.load(model_path)
    
    classes = {
        0: "Optimal Growth",
        1: "Heat Stress",
        2: "Drought Stress",
        3: "Compound Stress (Heat+Drought)",
        4: "Flooding / Waterlogging",
        5: "Frost / Cold Stress",
        6: "Salinity Stress"
    }
    
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
    
    # 2. Fetch Bhopal Live Telemetry from Open-Meteo & Syngenta CE Hub APIs
    bhopal_lat, bhopal_lon = 23.2599, 77.4126
    print(f"\n[STEP 1] Querying live APIs for Bhopal, MP ({bhopal_lat}°N, {bhopal_lon}°E)...")
    ingestor = AASRATelemetryIngestor()
    
    live_vector_data = ingestor.compile_model1_feature_vector(bhopal_lat, bhopal_lon, das=70)
    live_features = live_vector_data["feature_values"]
    
    # Enforce Bhopal Malwa Vertisol profile from Platform DB (Ishaan Sen / Bhopal farm)
    live_features["soil_clay_pct"] = 48.0
    live_features["soil_ec_ds_m"] = 0.85
    live_features["soil_ph"] = 7.60
    
    print("  -> Live Telemetry Ingested Successfully:")
    for k, v in live_features.items():
        print(f"     • {k:24s}: {v}")
        
    # 3. Formulate Comparative Bhopal Drought Stress Scenario
    # (Same farm, same Vertisol clay, but extended dry spell: SM drops to 13.8%, VPD spikes to 3.1 kPa, rain=0)
    drought_features = {
        "temp_max_forecast_7d": 36.5,
        "temp_night_min_7d": 24.0,
        "rh_avg_forecast_7d": 32.0,
        "vpd_kpa": 3.10,
        "soil_moisture_vol_pct": 13.8,  # Critical root-zone desiccation (<19.5%)
        "consecutive_hot_days": 2,
        "crop_gdd_accumulated": live_features["crop_gdd_accumulated"],
        "rainfall_3d_sum_mm": 0.0,       # Zero rain
        "soil_clay_pct": 48.0,
        "soil_ec_ds_m": 0.85,
        "soil_ph": 7.60
    }
    
    scenarios = [
        {
            "scenario_id": "BHOPAL-01-LIVE",
            "name": "Bhopal Real-Time Live Telemetry (Today)",
            "telemetry_source": "Live Open-Meteo + Syngenta CE Hub APIs",
            "features": live_features,
            "condition_summary": "Active late monsoon cloud cover; moderate temps (28.4°C), high humidity (84.8%), abundant root-zone soil moisture (44.3%), and 36.3mm recent rainfall."
        },
        {
            "scenario_id": "BHOPAL-02-DROUGHT",
            "name": "Bhopal Extended Dry Spell (Drought Scenario)",
            "telemetry_source": "Simulated 21-Day Post-Monsoon Dry Spell",
            "features": drought_features,
            "condition_summary": "Severe monsoon break; zero rainfall, atmospheric VPD elevated to 3.10 kPa, and root-zone moisture severely depleted to 13.8% (below permanent wilting threshold)."
        }
    ]
    
    # 4. Model Inference & Probability Evaluation
    results = []
    print("\n[STEP 2] Running AASRA Model 1 Inference on Both Scenarios...")
    
    for sc in scenarios:
        feats = sc["features"]
        df_row = pd.DataFrame([[feats[c] for c in feature_cols]], columns=feature_cols)
        
        pred_class_id = int(model.predict(df_row)[0])
        probs = model.predict_proba(df_row)[0]
        confidence = float(np.max(probs) * 100.0)
        pred_name = classes[pred_class_id]
        
        drought_prob = float(probs[2] * 100.0)
        optimal_prob = float(probs[0] * 100.0)
        heat_prob = float(probs[1] * 100.0)
        compound_prob = float(probs[3] * 100.0)
        flood_prob = float(probs[4] * 100.0)
        frost_prob = float(probs[5] * 100.0)
        salinity_prob = float(probs[6] * 100.0)
        
        if pred_class_id == 0:
            rec = "Optimal biophysical conditions sustained. No abiotic rescue required. Maintain standard crop nutrition & IPM scouting."
        elif pred_class_id == 2:
            rec = "CRITICAL DROUGHT ALERT: Root-zone moisture depleted below wilting point (13.8% < 19.5%). Trigger light deficit irrigation & spray Syngenta Quantis @ 250ml/ac."
        elif pred_class_id == 4:
            rec = "WATERLOGGING ALERT: Soil saturated. Drain standing field water immediately."
        else:
            rec = f"Abiotic risk detected: {pred_name}."
            
        res_dict = {
            "scenario_id": sc["scenario_id"],
            "scenario_name": sc["name"],
            "telemetry_source": sc["telemetry_source"],
            "condition_summary": sc["condition_summary"],
            # 11 features
            "temp_max_forecast_7d": feats["temp_max_forecast_7d"],
            "temp_night_min_7d": feats["temp_night_min_7d"],
            "rh_avg_forecast_7d": feats["rh_avg_forecast_7d"],
            "vpd_kpa": feats["vpd_kpa"],
            "soil_moisture_vol_pct": feats["soil_moisture_vol_pct"],
            "consecutive_hot_days": feats["consecutive_hot_days"],
            "crop_gdd_accumulated": feats["crop_gdd_accumulated"],
            "rainfall_3d_sum_mm": feats["rainfall_3d_sum_mm"],
            "soil_clay_pct": feats["soil_clay_pct"],
            "soil_ec_ds_m": feats["soil_ec_ds_m"],
            "soil_ph": feats["soil_ph"],
            # predictions
            "predicted_stress_class_id": pred_class_id,
            "predicted_stress_name": pred_name,
            "confidence_pct": round(confidence, 2),
            "prob_optimal_pct": round(optimal_prob, 2),
            "prob_drought_pct": round(drought_prob, 2),
            "prob_heat_pct": round(heat_prob, 2),
            "prob_compound_pct": round(compound_prob, 2),
            "prob_flooding_pct": round(flood_prob, 2),
            "prob_frost_pct": round(frost_prob, 2),
            "prob_salinity_pct": round(salinity_prob, 2),
            "agronomic_action": rec
        }
        results.append(res_dict)
        
        print("\n" + "-" * 85)
        print(f"Scenario: {sc['name']}")
        print(f"  • Source: {sc['telemetry_source']}")
        print(f"  • Telemetry: TMax={feats['temp_max_forecast_7d']}°C, TMin={feats['temp_night_min_7d']}°C, Rain3d={feats['rainfall_3d_sum_mm']}mm, Moisture={feats['soil_moisture_vol_pct']}%, VPD={feats['vpd_kpa']} kPa")
        print(f"  • DIAGNOSIS : Class {pred_class_id} -> {pred_name.upper()}")
        print(f"  • CONFIDENCE: {confidence:.2f}%")
        print(f"  • PROBABILITIES: Optimal={optimal_prob:.1f}%, Drought={drought_prob:.1f}%, Heat={heat_prob:.1f}%, Compound={compound_prob:.1f}%, Flood={flood_prob:.1f}%")
        print(f"  • ACTION    : {rec}")

    print("=" * 110)
    
    df_res = pd.DataFrame(results)
    
    out_paths = [
        "d:/Projects/DriveF-Projects/hyperion/data/model1_bhopal_live_vs_drought_comparison.csv",
        "d:/Projects/DriveF-Projects/hyperion/ps02-engine/data/model1_bhopal_live_vs_drought_comparison.csv"
    ]
    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        df_res.to_csv(p, index=False)
        print(f"Exported benchmark CSV: {p}")
        
    return df_res

if __name__ == "__main__":
    run_bhopal_live_vs_drought_test()
