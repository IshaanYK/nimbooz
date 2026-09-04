"""
AASRA Model 1: Evaluation of User-Provided Test Dataset
Contains 72 test cases across Optimal, Heat, Drought, Compound, and Boundary conditions.
Outputs:
- data/user_dataset_model1_evaluation_results.csv
- ps02-engine/data/user_dataset_model1_evaluation_results.csv
"""

import os
import math
import numpy as np
import pandas as pd
import joblib

USER_CSV_DATA = """test_id,temp_max_forecast_7d,temp_night_min_7d,rh_avg_forecast_7d,vpd_kpa,soil_moisture_vol_pct,consecutive_hot_days,crop_gdd_accumulated,expected_class,scenario
OPT_01,30.19,22.72,75.97,1.03,44.07,0,1763.43,0,Optimal
OPT_02,30.09,18.7,84.65,0.65,40.86,0,856.2,0,Optimal
OPT_03,31.41,22.53,81.1,0.87,40.76,0,1131.88,0,Optimal
OPT_04,24.51,21.47,85.69,0.44,44.86,0,831.79,0,Optimal
OPT_05,31.77,22.28,87.33,0.59,37.53,0,365.71,0,Optimal
OPT_06,25.23,22.1,82.08,0.58,47.58,0,788.74,0,Optimal
OPT_07,26.96,19.04,76.74,0.83,36.69,1,640.36,0,Optimal
OPT_08,29.36,22.58,75.93,0.98,44.1,0,768.55,0,Optimal
OPT_09,30.66,20.13,85.12,0.66,38.75,0,509.63,0,Optimal
OPT_10,25.6,22.33,65.18,1.14,43.64,1,1357.75,0,Optimal
OPT_11,30.25,21.13,76.47,1.01,36.82,0,1302.6,0,Optimal
OPT_12,27.77,22.21,79.13,0.78,43.25,0,1130.37,0,Optimal
OPT_13,28.47,18.17,72.6,1.06,40.68,1,912.79,0,Optimal
OPT_14,30.83,18.32,70.85,1.3,38.66,0,740.39,0,Optimal
OPT_15,29.3,22.31,78.93,0.86,43.64,0,1521.03,0,Optimal
OPT_16,25.34,18.5,65.57,1.11,44.39,0,992.82,0,Optimal
HEAT_01,39.29,23.07,57.53,3.02,42.53,4,871.53,1,Heat
HEAT_02,40.41,24.53,60.76,2.96,31.58,4,477.01,1,Heat
HEAT_03,45.7,26.9,67.71,3.21,34.79,5,1468.13,1,Heat
HEAT_04,43.74,23.91,56.23,3.93,31.74,6,1653.9,1,Heat
HEAT_05,41.65,24.14,50.06,4.02,40.43,4,1584.92,1,Heat
HEAT_06,44.07,25.02,62.99,3.38,41.29,2,1176.15,1,Heat
HEAT_07,43.2,24.91,47.11,4.62,30.75,2,794.79,1,Heat
HEAT_08,39.16,26.11,47.59,3.7,33.07,4,1687.68,1,Heat
HEAT_09,42.65,26.14,53.67,3.93,30.41,2,1023.46,1,Heat
HEAT_10,44.26,25.41,47.07,4.88,38.83,6,1706.74,1,Heat
HEAT_11,42.57,23.87,56.84,3.65,35.97,4,958.37,1,Heat
HEAT_12,38.17,28.27,65.66,2.3,32.52,4,1131.05,1,Heat
HEAT_13,38.87,23.97,61.81,2.65,41.87,5,1452.97,1,Heat
HEAT_14,38.86,23.61,67.9,2.23,30.67,5,1132.28,1,Heat
HEAT_15,40.97,27.66,65.74,2.66,35.71,3,736.38,1,Heat
HEAT_16,42.12,28.55,51.4,4.01,32.96,6,367.37,1,Heat
DROUGHT_01,32.05,23.8,44.81,2.63,17.11,3,1640.17,2,Drought
DROUGHT_02,32.63,23.02,27.9,3.55,16.29,3,860.49,2,Drought
DROUGHT_03,29.66,19.71,38.67,2.55,18.9,3,484.14,2,Drought
DROUGHT_04,34.82,19.17,23.83,4.24,15.69,0,1611.84,2,Drought
DROUGHT_05,30.38,23.05,27.76,3.13,19.23,1,515.85,2,Drought
DROUGHT_06,29.1,18.86,25.74,2.99,16.44,2,482.75,2,Drought
DROUGHT_07,32.54,21.78,37.36,3.07,11.9,3,1373.11,2,Drought
DROUGHT_08,34.17,18.8,23.28,4.12,18.81,3,896.37,2,Drought
DROUGHT_09,31.11,22.31,32.21,3.06,19.08,2,1687.21,2,Drought
DROUGHT_10,29.17,22.12,33.88,2.68,11.01,1,510.51,2,Drought
DROUGHT_11,31.93,21.87,44.16,2.65,18.86,2,1001.07,2,Drought
DROUGHT_12,34.49,18.71,20.45,4.35,17.88,3,1495.23,2,Drought
DROUGHT_13,30.63,21.94,33.27,2.94,18.24,3,918.86,2,Drought
DROUGHT_14,31.62,22.24,30.65,3.23,18.24,2,980.85,2,Drought
DROUGHT_15,30.73,22.85,25.92,3.28,17.76,3,399.84,2,Drought
DROUGHT_16,33.16,23.36,23.65,3.87,12.95,0,515.81,2,Drought
COMPOUND_01,47.21,25.56,19.14,8.67,9.69,4,331.72,3,Compound
COMPOUND_02,38.55,23.48,19.37,5.5,14.5,2,1321.07,3,Compound
COMPOUND_03,41.94,27.54,22.95,6.3,17.63,6,365.21,3,Compound
COMPOUND_04,39.81,25.24,20.92,5.78,14.28,7,924.39,3,Compound
COMPOUND_05,38.49,27.71,24.34,5.15,9.12,2,377.94,3,Compound
COMPOUND_06,47.25,30.59,17.48,8.87,17.93,7,1769.36,3,Compound
COMPOUND_07,46.02,28.78,34.49,6.61,16.57,6,1104.1,3,Compound
COMPOUND_08,43.14,27.17,36.44,5.53,12.24,2,1259.34,3,Compound
COMPOUND_09,40.66,27.3,18.49,6.23,12.59,5,851.27,3,Compound
COMPOUND_10,41.66,26.42,23.19,6.19,15.54,3,745.31,3,Compound
COMPOUND_11,47.49,27.33,37.91,6.75,11.61,4,1572.84,3,Compound
COMPOUND_12,44.53,27.79,35.11,6.07,14.96,5,732.23,3,Compound
COMPOUND_13,45.35,29.25,20.06,7.8,17.47,7,1221.57,3,Compound
COMPOUND_14,38.95,23.76,33.14,4.66,18.3,2,506.11,3,Compound
COMPOUND_15,47.59,28.34,35.02,7.1,16.61,7,1719.04,3,Compound
COMPOUND_16,40.53,23.86,29.75,5.33,14.78,6,556.94,3,Compound
BOUND_01,35.0,24.0,50.0,20.0,0.0,1000,2.0,Drought_boundary,
BOUND_02,35.1,24.0,49.0,19.5,1.0,1000,2.0,Drought_boundary,
BOUND_03,35.0,24.0,49.0,19.4,1.0,1000,2.0,Drought_boundary,
BOUND_04,38.0,24.0,55.0,25.0,2.0,1000,1.0,Heat_boundary,
BOUND_05,38.1,24.0,54.0,25.0,2.0,1000,1.0,Heat_boundary,
BOUND_06,42.0,24.0,40.0,18.5,3.0,1000,3.0,Compound_boundary,
BOUND_07,36.0,24.0,32.0,2.7,0.0,1000,2.0,Drought_boundary,
BOUND_08,36.0,24.0,32.0,19.0,0.0,1000,2.0,Drought_boundary,
"""

def calc_tetens_vpd(t_max, rh):
    svp = 0.61078 * math.exp((17.27 * max(t_max, 1.0)) / (max(t_max, 1.0) + 237.3))
    return max(0.1, svp * (1.0 - (rh / 100.0)))

def parse_and_run_evaluation():
    print("=" * 115)
    print("AASRA MODEL 1: EVALUATION ON USER-PROVIDED 72-ROW BENCHMARK DATASET")
    print("=" * 115)
    
    # 1. Load Champion Model
    model_path = "ps02-engine/data/model1_climate_stress.joblib"
    assert os.path.exists(model_path), f"Model not found at: {model_path}"
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
    
    # 2. Parse Lines
    lines = [l.strip() for l in USER_CSV_DATA.strip().split("\n") if l.strip()]
    header = lines[0].split(",")
    rows = []
    
    for line in lines[1:]:
        parts = [p.strip() for p in line.split(",") if p.strip() != ""]
        if not parts:
            continue
            
        test_id = parts[0]
        
        if test_id.startswith("BOUND"):
            # Format: BOUND_01, temp_max, temp_min, rh, sm/vpd, hot_days, gdd, expected_class, scenario
            # Let's inspect parts:
            t_max = float(parts[1])
            t_min = float(parts[2])
            rh = float(parts[3])
            
            # If 8 numbers provided:
            # e.g. BOUND_01, 35.0, 24.0, 50.0, 20.0, 0.0, 1000, 2.0, Drought_boundary
            val4 = float(parts[4])
            hot_days = int(float(parts[5]))
            gdd = float(parts[6])
            exp_c = int(float(parts[7]))
            scen = parts[8] if len(parts) > 8 else "Boundary"
            
            # In BOUND_01-06, 08: val4 is soil_moisture (e.g. 20.0, 19.5, 19.4, 25.0, 18.5, 19.0)
            # In BOUND_07: 2.7 could be VPD or SM? At T=36, RH=32: VPD is ~4.0 kPa.
            # If val4 is SM:
            sm = val4
            vpd = round(calc_tetens_vpd(t_max, rh), 2)
        else:
            # Normal row: test_id, temp_max, temp_min, rh, vpd, sm, hot_days, gdd, exp_c, scen
            t_max = float(parts[1])
            t_min = float(parts[2])
            rh = float(parts[3])
            vpd = float(parts[4])
            sm = float(parts[5])
            hot_days = int(float(parts[6]))
            gdd = float(parts[7])
            exp_c = int(float(parts[8]))
            scen = parts[9]
            
        # Baseline soil & rain (well-drained benign agricultural vertisol / alluvial)
        rain = 0.0
        clay = 30.0
        ec = 0.8
        ph = 7.2
        
        feat_dict = {
            "temp_max_forecast_7d": t_max,
            "temp_night_min_7d": t_min,
            "rh_avg_forecast_7d": rh,
            "vpd_kpa": vpd,
            "soil_moisture_vol_pct": sm,
            "consecutive_hot_days": hot_days,
            "crop_gdd_accumulated": gdd,
            "rainfall_3d_sum_mm": rain,
            "soil_clay_pct": clay,
            "soil_ec_ds_m": ec,
            "soil_ph": ph
        }
        
        # 3. Model Inference
        df_row = pd.DataFrame([[feat_dict[c] for c in feature_cols]], columns=feature_cols)
        pred_c = int(model.predict(df_row)[0])
        probs = model.predict_proba(df_row)[0]
        conf = float(np.max(probs) * 100.0)
        
        is_match = (pred_c == exp_c)
        
        rows.append({
            "test_id": test_id,
            "scenario": scen,
            "expected_class_id": exp_c,
            "expected_stress_name": classes[exp_c],
            "predicted_class_id": pred_c,
            "predicted_stress_name": classes[pred_c],
            "confidence_pct": round(conf, 2),
            "is_correct_match": is_match,
            "prob_optimal_pct": round(float(probs[0]) * 100.0, 2),
            "prob_heat_pct": round(float(probs[1]) * 100.0, 2),
            "prob_drought_pct": round(float(probs[2]) * 100.0, 2),
            "prob_compound_pct": round(float(probs[3]) * 100.0, 2),
            "prob_flooding_pct": round(float(probs[4]) * 100.0, 2),
            "prob_frost_pct": round(float(probs[5]) * 100.0, 2),
            "prob_salinity_pct": round(float(probs[6]) * 100.0, 2),
            # inputs
            "temp_max_forecast_7d": t_max,
            "temp_night_min_7d": t_min,
            "rh_avg_forecast_7d": rh,
            "vpd_kpa": vpd,
            "soil_moisture_vol_pct": sm,
            "consecutive_hot_days": hot_days,
            "crop_gdd_accumulated": gdd
        })
        
    df_eval = pd.DataFrame(rows)
    
    total = len(df_eval)
    correct = df_eval["is_correct_match"].sum()
    accuracy = (correct / total) * 100.0
    
    print(f"\nEVALUATION OVERVIEW:")
    print(f"  • Total Test Samples: {total}")
    print(f"  • Correct Predictions: {correct} / {total}")
    print(f"  • Accuracy on User Dataset: {accuracy:.2f}%\n")
    
    print("SCENARIO BREAKDOWN:")
    for scen, g in df_eval.groupby("scenario"):
        scen_corr = g['is_correct_match'].sum()
        scen_tot = len(g)
        avg_conf = g['confidence_pct'].mean()
        print(f"  • {scen:18s}: {scen_corr:2d} / {scen_tot:2d} matches ({scen_corr/scen_tot*100:5.1f}%) | Mean Confidence: {avg_conf:.2f}%")
        
    print("\nSAMPLE DETAILED PREDICTIONS:")
    sample_show = pd.concat([
        df_eval[df_eval["test_id"].str.startswith("OPT")].head(2),
        df_eval[df_eval["test_id"].str.startswith("HEAT")].head(2),
        df_eval[df_eval["test_id"].str.startswith("DROUGHT")].head(2),
        df_eval[df_eval["test_id"].str.startswith("COMPOUND")].head(2),
        df_eval[df_eval["test_id"].str.startswith("BOUND")].head(4)
    ])
    
    for _, r in sample_show.iterrows():
        status = "[MATCH]" if r["is_correct_match"] else "[MISMATCH]"
        print(f"  {r['test_id']:10s} | Exp: {r['expected_stress_name']:28s} | Pred: {r['predicted_stress_name']:28s} | Conf: {r['confidence_pct']:5.2f}% | {status}")

    # Check any mismatches (especially in boundary cases)
    mismatches = df_eval[~df_eval["is_correct_match"]]
    if len(mismatches) > 0:
        print(f"\nANALYSIS OF BOUNDARY TRANSITIONS ({len(mismatches)} rows):")
        for _, r in mismatches.iterrows():
            print(f"  Row {r['test_id']} ({r['scenario']}): Expected Class {r['expected_class_id']} ({r['expected_stress_name']}), but Model predicted Class {r['predicted_class_id']} ({r['predicted_stress_name']}) with {r['confidence_pct']:.2f}% confidence.")
            print(f"     Inputs: TMax={r['temp_max_forecast_7d']}°C, SM={r['soil_moisture_vol_pct']}%, HotDays={r['consecutive_hot_days']}, VPD={r['vpd_kpa']} kPa")
            print(f"     Distribution: Opt={r['prob_optimal_pct']}%, Heat={r['prob_heat_pct']}%, Drought={r['prob_drought_pct']}%, Compound={r['prob_compound_pct']}%")

    out_paths = [
        "d:/Projects/DriveF-Projects/hyperion/data/user_dataset_model1_evaluation_results.csv",
        "d:/Projects/DriveF-Projects/hyperion/ps02-engine/data/user_dataset_model1_evaluation_results.csv"
    ]
    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        df_eval.to_csv(p, index=False)
        print(f"\nSaved detailed evaluation CSV to: {p}")
        
    return df_eval

if __name__ == "__main__":
    parse_and_run_evaluation()
