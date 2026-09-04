"""
AASRA Model 1: Chennai Frost & Stochastic Stress Benchmark Testing Suite
Evaluates:
1. Chennai Frost Anomalies (Nocturnal Freeze in a Tropical Coastal Zone)
2. Chennai All-Class Stress Coverage (Optimal, Heat, Drought, Compound, Flooding, Salinity)
3. Stochastic Boundary & Random Test Cases to verify confidence calibration
Outputs:
- data/model1_chennai_frost_and_random_tests.csv
- ps02-engine/data/model1_chennai_frost_and_random_tests.csv
"""

import os
import joblib
import numpy as np
import pandas as pd

def run_chennai_frost_and_stress_tests():
    model_path = "ps02-engine/data/model1_climate_stress.joblib"
    assert os.path.exists(model_path), f"Model not found at: {model_path}"
    model = joblib.load(model_path)
    
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
    
    test_cases = [
        # =========================================================================
        # 1. CHENNAI FROST ANOMALIES (Tropical Zone 13°N with nocturnal freezing)
        # =========================================================================
        {
            "test_id": "TC-CHN-FROST-01",
            "scenario_group": "Chennai Frost Anomaly",
            "location": "Chennai, Tamil Nadu",
            "description": "Extreme Nocturnal Freeze in Chennai (0.5°C night temp)",
            "rationale": "Verifies biophysical ground truth over geographical bias: even in tropical Chennai, sub-3.5°C night temp MUST trigger Frost Stress with ultra-high confidence.",
            "inputs": {
                "temp_max_forecast_7d": 13.5,
                "temp_night_min_7d": 0.5,
                "rh_avg_forecast_7d": 82.0,
                "vpd_kpa": 0.35,
                "soil_moisture_vol_pct": 36.0,
                "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 250.0,
                "rainfall_3d_sum_mm": 0.0,
                "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 1.5,
                "soil_ph": 7.2
            }
        },
        {
            "test_id": "TC-CHN-FROST-02",
            "scenario_group": "Chennai Frost Anomaly",
            "location": "Chennai, Tamil Nadu",
            "description": "Moderate Night Frost in Chennai (2.2°C night temp)",
            "rationale": "Clear frost breach (2.2°C < 3.5°C threshold) with standard daytime temp (16°C). Tests model sensitivity to night chilling.",
            "inputs": {
                "temp_max_forecast_7d": 16.0,
                "temp_night_min_7d": 2.2,
                "rh_avg_forecast_7d": 78.0,
                "vpd_kpa": 0.45,
                "soil_moisture_vol_pct": 32.0,
                "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 310.0,
                "rainfall_3d_sum_mm": 0.0,
                "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 1.5,
                "soil_ph": 7.2
            }
        },
        {
            "test_id": "TC-CHN-FROST-03",
            "scenario_group": "Chennai Frost Anomaly",
            "location": "Chennai, Tamil Nadu",
            "description": "Borderline Frost Threshold in Chennai (3.4°C night temp)",
            "rationale": "Operates at the razor-edge decision boundary (3.4°C vs 3.5°C manual cutoff). Verifies whether softmax probability reflects boundary proximity.",
            "inputs": {
                "temp_max_forecast_7d": 17.5,
                "temp_night_min_7d": 3.4,
                "rh_avg_forecast_7d": 72.0,
                "vpd_kpa": 0.58,
                "soil_moisture_vol_pct": 30.0,
                "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 360.0,
                "rainfall_3d_sum_mm": 0.0,
                "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 1.5,
                "soil_ph": 7.2
            }
        },
        {
            "test_id": "TC-CHN-FROST-04",
            "scenario_group": "Chennai Frost Anomaly",
            "location": "Chennai, Tamil Nadu",
            "description": "Near-Frost Non-Breach in Chennai (3.8°C night temp)",
            "rationale": "Just above frost threshold (3.8°C > 3.5°C). Verifies that model does NOT falsely diagnose frost when threshold is not breached.",
            "inputs": {
                "temp_max_forecast_7d": 19.5,
                "temp_night_min_7d": 3.8,
                "rh_avg_forecast_7d": 68.0,
                "vpd_kpa": 0.72,
                "soil_moisture_vol_pct": 32.0,
                "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 420.0,
                "rainfall_3d_sum_mm": 0.0,
                "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 1.5,
                "soil_ph": 7.2
            }
        },
        {
            "test_id": "TC-CHN-FROST-05",
            "scenario_group": "Chennai Frost Anomaly",
            "location": "Chennai, Tamil Nadu",
            "description": "Chennai Severe Frost + High Soil Salinity Conflict",
            "rationale": "Simultaneous Frost (1.8°C) and Salinity (EC 5.2 dS/m). Tests biological priority rule: acute freeze mortality precedes osmotic root injury.",
            "inputs": {
                "temp_max_forecast_7d": 14.0,
                "temp_night_min_7d": 1.8,
                "rh_avg_forecast_7d": 75.0,
                "vpd_kpa": 0.42,
                "soil_moisture_vol_pct": 34.0,
                "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 280.0,
                "rainfall_3d_sum_mm": 0.0,
                "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 5.2,
                "soil_ph": 8.5
            }
        },
        {
            "test_id": "TC-CHN-FROST-06",
            "scenario_group": "Chennai Frost Anomaly",
            "location": "Chennai, Tamil Nadu",
            "description": "Catastrophic Sub-Zero Frost in Chennai (-1.8°C)",
            "rationale": "Extreme catastrophic freeze testing. Confidence must reach >= 99.8% for Frost Stress.",
            "inputs": {
                "temp_max_forecast_7d": 8.5,
                "temp_night_min_7d": -1.8,
                "rh_avg_forecast_7d": 85.0,
                "vpd_kpa": 0.22,
                "soil_moisture_vol_pct": 42.0,
                "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 120.0,
                "rainfall_3d_sum_mm": 0.0,
                "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 1.5,
                "soil_ph": 7.2
            }
        },

        # =========================================================================
        # 2. CHENNAI FULL-SPECTRUM STRESS BASELINES (For Comparative Calibration)
        # =========================================================================
        {
            "test_id": "TC-CHN-OPT-01",
            "scenario_group": "Chennai Baseline Stress",
            "location": "Chennai, Tamil Nadu",
            "description": "Standard Chennai Optimal Growing Season (Paddy)",
            "rationale": "Benchmark normal Chennai winter/monsoon optimal regime (30°C max, 23°C min, 65% RH, 38% moisture).",
            "inputs": {
                "temp_max_forecast_7d": 30.5,
                "temp_night_min_7d": 23.0,
                "rh_avg_forecast_7d": 68.0,
                "vpd_kpa": 1.35,
                "soil_moisture_vol_pct": 44.0,
                "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 620.0,
                "rainfall_3d_sum_mm": 15.0,
                "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 1.2,
                "soil_ph": 7.2
            }
        },
        {
            "test_id": "TC-CHN-HEAT-01",
            "scenario_group": "Chennai Baseline Stress",
            "location": "Chennai, Tamil Nadu",
            "description": "Chennai Agni Nakshatram Peak Heatwave (43°C, 5 hot days)",
            "rationale": "High temperature extreme in late May with adequate soil moisture, diagnosing pure Heat Stress.",
            "inputs": {
                "temp_max_forecast_7d": 43.0,
                "temp_night_min_7d": 29.5,
                "rh_avg_forecast_7d": 42.0,
                "vpd_kpa": 3.75,
                "soil_moisture_vol_pct": 32.0,
                "consecutive_hot_days": 5,
                "crop_gdd_accumulated": 1050.0,
                "rainfall_3d_sum_mm": 0.0,
                "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 1.2,
                "soil_ph": 7.2
            }
        },
        {
            "test_id": "TC-CHN-DROUGHT-01",
            "scenario_group": "Chennai Baseline Stress",
            "location": "Chennai, Tamil Nadu",
            "description": "Chennai Severe Drought (Monsoon Failure, 13.5% soil moisture)",
            "rationale": "Dry sandy-clay root zone with elevated atmospheric evaporative demand (VPD 2.95 kPa).",
            "inputs": {
                "temp_max_forecast_7d": 35.5,
                "temp_night_min_7d": 24.5,
                "rh_avg_forecast_7d": 38.0,
                "vpd_kpa": 2.95,
                "soil_moisture_vol_pct": 13.5,
                "consecutive_hot_days": 1,
                "crop_gdd_accumulated": 750.0,
                "rainfall_3d_sum_mm": 0.0,
                "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 1.3,
                "soil_ph": 7.3
            }
        },
        {
            "test_id": "TC-CHN-COMPOUND-01",
            "scenario_group": "Chennai Baseline Stress",
            "location": "Chennai, Tamil Nadu",
            "description": "Chennai Extreme Compound Stress (41.5°C + 14.5% Moisture)",
            "rationale": "Simultaneous stomatal closure triggers (high heat + root-zone desiccated).",
            "inputs": {
                "temp_max_forecast_7d": 41.5,
                "temp_night_min_7d": 28.0,
                "rh_avg_forecast_7d": 32.0,
                "vpd_kpa": 3.80,
                "soil_moisture_vol_pct": 14.5,
                "consecutive_hot_days": 4,
                "crop_gdd_accumulated": 980.0,
                "rainfall_3d_sum_mm": 0.0,
                "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 1.4,
                "soil_ph": 7.3
            }
        },
        {
            "test_id": "TC-CHN-FLOOD-01",
            "scenario_group": "Chennai Baseline Stress",
            "location": "Chennai, Tamil Nadu",
            "description": "Chennai Cyclone Monsoon Flooding (180mm rain, 55% moisture)",
            "rationale": "Severe coastal rain inundation causing hypoxia in root zone.",
            "inputs": {
                "temp_max_forecast_7d": 26.5,
                "temp_night_min_7d": 22.5,
                "rh_avg_forecast_7d": 94.0,
                "vpd_kpa": 0.35,
                "soil_moisture_vol_pct": 55.0,
                "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 580.0,
                "rainfall_3d_sum_mm": 180.0,
                "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 1.1,
                "soil_ph": 7.1
            }
        },
        {
            "test_id": "TC-CHN-SALINITY-01",
            "scenario_group": "Chennai Baseline Stress",
            "location": "Chennai, Tamil Nadu",
            "description": "Chennai Coastal Seawater Intrusion (Soil EC 5.8 dS/m)",
            "rationale": "Saline water ingress raising electrical conductivity above 3.8 dS/m threshold.",
            "inputs": {
                "temp_max_forecast_7d": 32.0,
                "temp_night_min_7d": 24.0,
                "rh_avg_forecast_7d": 62.0,
                "vpd_kpa": 1.65,
                "soil_moisture_vol_pct": 34.0,
                "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 690.0,
                "rainfall_3d_sum_mm": 5.0,
                "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 5.8,
                "soil_ph": 8.4
            }
        }
    ]

    # =========================================================================
    # 3. RANDOM STOCHASTIC TEST CASES (Testing Confidence Spread & Robustness)
    # =========================================================================
    np.random.seed(101)
    for i in range(1, 15):
        # Generate varied biophysical points
        category = np.random.choice(["Near-Heat", "Near-Drought", "Near-Frost", "Wet-Borderline", "Saline-Borderline", "Benign"])
        
        if category == "Near-Heat":
            t_max = float(np.random.uniform(36.5, 38.5))
            t_min = float(np.random.uniform(23.0, 26.0))
            sm = float(np.random.uniform(25.0, 38.0))
            rain = float(np.random.exponential(scale=2.0))
            hot_days = int(np.random.choice([0, 1, 2, 3]))
            ec = float(np.random.uniform(0.6, 1.4))
            ph = float(np.random.uniform(6.8, 7.6))
            desc = f"Random Case #{i:02d}: Thermal threshold zone (TMax {t_max:.1f}°C, {hot_days} hot days)"
            rat = "Tests softmax transition across 38.0°C heat threshold."
        elif category == "Near-Drought":
            t_max = float(np.random.uniform(30.0, 35.0))
            t_min = float(np.random.uniform(19.0, 23.0))
            sm = float(np.random.uniform(18.0, 22.5)) # around 19.5% threshold
            rain = 0.0
            hot_days = 0
            ec = float(np.random.uniform(0.5, 1.5))
            ph = float(np.random.uniform(7.0, 7.8))
            desc = f"Random Case #{i:02d}: Root moisture boundary zone ({sm:.1f}% soil moisture)"
            rat = "Tests whether confidence distributes between Drought and Optimal near 19.5% SM."
        elif category == "Near-Frost":
            t_max = float(np.random.uniform(12.0, 17.0))
            t_min = float(np.random.uniform(2.5, 4.5)) # around 3.5°C threshold
            sm = float(np.random.uniform(28.0, 42.0))
            rain = 0.0
            hot_days = 0
            ec = float(np.random.uniform(0.4, 1.1))
            ph = float(np.random.uniform(6.5, 7.5))
            desc = f"Random Case #{i:02d}: Chilling threshold zone (TMin {t_min:.1f}°C)"
            rat = "Tests whether model smoothly distributes probabilities across the 3.5°C frost boundary."
        elif category == "Wet-Borderline":
            t_max = float(np.random.uniform(26.0, 30.0))
            t_min = float(np.random.uniform(21.0, 24.0))
            sm = float(np.random.uniform(40.0, 48.0))
            rain = float(np.random.uniform(65.0, 95.0)) # around 80mm threshold
            hot_days = 0
            ec = float(np.random.uniform(0.4, 0.9))
            ph = float(np.random.uniform(6.5, 7.4))
            desc = f"Random Case #{i:02d}: Monsoon saturation boundary ({rain:.1f}mm rain, {sm:.1f}% SM)"
            rat = "Tests sensitivity to waterlogging trigger (80mm rain + 42% SM)."
        elif category == "Saline-Borderline":
            t_max = float(np.random.uniform(28.0, 34.0))
            t_min = float(np.random.uniform(20.0, 24.0))
            sm = float(np.random.uniform(26.0, 38.0))
            rain = float(np.random.exponential(scale=3.0))
            hot_days = 0
            ec = float(np.random.uniform(3.4, 4.4)) # around 3.8 dS/m threshold
            ph = float(np.random.uniform(7.8, 8.6))
            desc = f"Random Case #{i:02d}: Soil salinity boundary (EC {ec:.2f} dS/m, pH {ph:.1f})"
            rat = "Tests confidence distribution around the 3.8 dS/m EC boundary."
        else: # Benign
            t_max = float(np.random.uniform(25.0, 29.5))
            t_min = float(np.random.uniform(17.0, 21.0))
            sm = float(np.random.uniform(36.0, 48.0))
            rain = float(np.random.uniform(5.0, 25.0))
            hot_days = 0
            ec = float(np.random.uniform(0.6, 1.3))
            ph = float(np.random.uniform(6.7, 7.5))
            desc = f"Random Case #{i:02d}: Benign agro-climatic profile"
            rat = "Tests stability of Optimal diagnosis under moderate random fluctuations."

        rh = float(np.clip(np.random.uniform(45.0, 85.0), 30.0, 95.0))
        # Tetens VPD
        svp = 0.61078 * np.exp((17.27 * max(t_max, 1.0)) / (max(t_max, 1.0) + 237.3))
        vpd = float(np.clip(svp * (1.0 - (rh / 100.0)), 0.3, 4.5))
        clay = float(np.clip(np.random.normal(30.0, 6.0), 15.0, 55.0))
        gdd = float(np.random.uniform(400.0, 1100.0))

        test_cases.append({
            "test_id": f"TC-RND-{i:02d}",
            "scenario_group": "Random Stochastic Validation",
            "location": "Simulated Field",
            "description": desc,
            "rationale": rat,
            "inputs": {
                "temp_max_forecast_7d": round(t_max, 2),
                "temp_night_min_7d": round(t_min, 2),
                "rh_avg_forecast_7d": round(rh, 2),
                "vpd_kpa": round(vpd, 2),
                "soil_moisture_vol_pct": round(sm, 2),
                "consecutive_hot_days": hot_days,
                "crop_gdd_accumulated": round(gdd, 1),
                "rainfall_3d_sum_mm": round(rain, 2),
                "soil_clay_pct": round(clay, 1),
                "soil_ec_ds_m": round(ec, 2),
                "soil_ph": round(ph, 2)
            }
        })

    # =========================================================================
    # 4. EXECUTE MODEL INFERENCE & RECORD DETAILED CONFIDENCE
    # =========================================================================
    results = []
    
    print("=" * 115)
    print("AASRA MODEL 1: CHENNAI FROST ANOMALY & STOCHASTIC BENCHMARK TEST SUITE")
    print("=" * 115)
    
    for tc in test_cases:
        inp = tc["inputs"]
        row_feat = [inp[col] for col in feature_cols]
        X_test = pd.DataFrame([row_feat], columns=feature_cols)
        
        pred_class_id = int(model.predict(X_test)[0])
        probs = model.predict_proba(X_test)[0]
        confidence = float(np.max(probs) * 100.0)
        pred_name = classes[pred_class_id]
        
        record = {
            "test_id": tc["test_id"],
            "scenario_group": tc["scenario_group"],
            "location": tc["location"],
            "description": tc["description"],
            "why_dataset_taken": tc["rationale"],
            # 11 biophysical features
            "temp_max_forecast_7d": inp["temp_max_forecast_7d"],
            "temp_night_min_7d": inp["temp_night_min_7d"],
            "rh_avg_forecast_7d": inp["rh_avg_forecast_7d"],
            "vpd_kpa": inp["vpd_kpa"],
            "soil_moisture_vol_pct": inp["soil_moisture_vol_pct"],
            "consecutive_hot_days": inp["consecutive_hot_days"],
            "crop_gdd_accumulated": inp["crop_gdd_accumulated"],
            "rainfall_3d_sum_mm": inp["rainfall_3d_sum_mm"],
            "soil_clay_pct": inp["soil_clay_pct"],
            "soil_ec_ds_m": inp["soil_ec_ds_m"],
            "soil_ph": inp["soil_ph"],
            # predictions & confidence
            "predicted_class_id": pred_class_id,
            "predicted_stress_name": pred_name,
            "confidence_pct": round(confidence, 2),
            "prob_optimal_pct": round(float(probs[0]) * 100.0, 2),
            "prob_heat_pct": round(float(probs[1]) * 100.0, 2),
            "prob_drought_pct": round(float(probs[2]) * 100.0, 2),
            "prob_compound_pct": round(float(probs[3]) * 100.0, 2),
            "prob_flooding_pct": round(float(probs[4]) * 100.0, 2),
            "prob_frost_pct": round(float(probs[5]) * 100.0, 2),
            "prob_salinity_pct": round(float(probs[6]) * 100.0, 2)
        }
        results.append(record)
        
        print(f"[{tc['test_id']}] {tc['description']}")
        print(f"   -> Inputs: TMax={inp['temp_max_forecast_7d']}°C, TMin={inp['temp_night_min_7d']}°C, SM={inp['soil_moisture_vol_pct']}%, Rain={inp['rainfall_3d_sum_mm']}mm, EC={inp['soil_ec_ds_m']} dS/m")
        print(f"   -> PREDICTION: Class {pred_class_id} ({pred_name}) | CONFIDENCE: {confidence:.2f}%")
        print(f"   -> PROBABILITIES: Opt={probs[0]*100:.1f}%, Heat={probs[1]*100:.1f}%, Drought={probs[2]*100:.1f}%, Compound={probs[3]*100:.1f}%, Flood={probs[4]*100:.1f}%, Frost={probs[5]*100:.1f}%, Sal={probs[6]*100:.1f}%")
        print("-" * 115)
        
    df_results = pd.DataFrame(results)
    
    out_paths = [
        "d:/Projects/DriveF-Projects/hyperion/data/model1_chennai_frost_and_random_tests.csv",
        "d:/Projects/DriveF-Projects/hyperion/ps02-engine/data/model1_chennai_frost_and_random_tests.csv"
    ]
    
    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        df_results.to_csv(p, index=False)
        print(f"\nSaved benchmark results to: {p}")
        
    return df_results

if __name__ == "__main__":
    run_chennai_frost_and_stress_tests()
