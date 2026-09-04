"""
AASRA Model 1: Hypothesis Query & Contrarian Verification Engine
Enables querying arbitrary stress hypotheses against ground telemetry.
Example: Severe drought is occurring in reality, but the user explicitly queries: "What is the confidence for Frost?"
Outputs:
- data/model1_hypothesis_query_testing.csv
- ps02-engine/data/model1_hypothesis_query_testing.csv
"""

import os
import joblib
import numpy as np
import pandas as pd

class AASRAHypothesisQueryEngine:
    def __init__(self, model_path="ps02-engine/data/model1_climate_stress.joblib"):
        assert os.path.exists(model_path), f"Model not found at: {model_path}"
        self.model = joblib.load(model_path)
        
        self.classes = {
            0: "Optimal Growth",
            1: "Heat Stress",
            2: "Drought Stress",
            3: "Compound Stress (Heat+Drought)",
            4: "Flooding / Waterlogging",
            5: "Frost / Cold Stress",
            6: "Salinity Stress"
        }
        
        self.class_lookup = {
            "optimal": 0, "optimal growth": 0, "healthy": 0,
            "heat": 1, "heat stress": 1,
            "drought": 2, "drought stress": 2, "water deficit": 2,
            "compound": 3, "compound stress": 3, "heat+drought": 3,
            "flooding": 4, "flooding / waterlogging": 4, "waterlogging": 4, "flood": 4,
            "frost": 5, "frost / cold stress": 5, "cold": 5, "freeze": 5,
            "salinity": 6, "salinity stress": 6, "saline": 6
        }
        
        self.feature_cols = [
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

    def query_hypothesis(self, features: dict, asked_stress: str) -> dict:
        """
        Evaluates telemetry and extracts the exact confidence score for the ASKED stress,
        alongside the true dominant stress and biological reason.
        """
        asked_lower = asked_stress.lower().strip()
        if asked_lower not in self.class_lookup:
            raise ValueError(f"Unknown asked stress '{asked_stress}'. Choose from: {list(self.classes.values())}")
            
        target_class_id = self.class_lookup[asked_lower]
        target_class_name = self.classes[target_class_id]
        
        row_feat = [features[col] for col in self.feature_cols]
        X_test = pd.DataFrame([row_feat], columns=self.feature_cols)
        
        probs = self.model.predict_proba(X_test)[0]
        actual_class_id = int(np.argmax(probs))
        actual_class_name = self.classes[actual_class_id]
        actual_confidence = float(probs[actual_class_id] * 100.0)
        
        asked_confidence = float(probs[target_class_id] * 100.0)
        is_confirmed = (target_class_id == actual_class_id)
        
        # Agronomic Threshold Analysis for Explanation
        t_max = features["temp_max_forecast_7d"]
        t_min = features["temp_night_min_7d"]
        sm = features["soil_moisture_vol_pct"]
        rain = features["rainfall_3d_sum_mm"]
        ec = features["soil_ec_ds_m"]
        vpd = features["vpd_kpa"]
        
        reasons = []
        if target_class_id == 5: # Asked for Frost
            if t_min > 3.5:
                reasons.append(f"Nocturnal minimum ({t_min}°C) is {t_min - 3.5:.1f}°C above the 3.5°C frost threshold.")
            else:
                reasons.append(f"Nocturnal minimum ({t_min}°C) breaches the 3.5°C freezing threshold.")
        elif target_class_id == 2: # Asked for Drought
            if sm > 19.5:
                reasons.append(f"Root-zone soil moisture ({sm}%) is above the 19.5% drought wilting threshold.")
            else:
                reasons.append(f"Root-zone soil moisture ({sm}%) depleted below the 19.5% critical threshold.")
        elif target_class_id == 1: # Asked for Heat
            if t_max < 38.0:
                reasons.append(f"Daytime max ({t_max}°C) is below the 38.0°C acute heat threshold.")
            else:
                reasons.append(f"Daytime max ({t_max}°C) exceeds the 38.0°C heat damage threshold.")
        elif target_class_id == 4: # Asked for Flooding
            if rain < 80.0 and sm < 48.0:
                reasons.append(f"3-day rain ({rain}mm) and soil moisture ({sm}%) are below saturation thresholds (80mm / 48%).")
            else:
                reasons.append(f"Severe precipitation ({rain}mm) and saturated soil ({sm}%) induce hypoxia.")
        elif target_class_id == 6: # Asked for Salinity
            if ec < 3.8:
                reasons.append(f"Soil ECe ({ec} dS/m) is below the 3.8 dS/m salinity hazard threshold.")
            else:
                reasons.append(f"Soil ECe ({ec} dS/m) exceeds the 3.8 dS/m osmotic toxicity threshold.")
        elif target_class_id == 3: # Asked for Compound
            if not (t_max >= 38.0 and sm <= 19.5):
                reasons.append(f"Does not simultaneously meet both TMax >= 38°C and SM <= 19.5% (TMax={t_max}°C, SM={sm}%).")
            else:
                reasons.append("Both acute thermal stress and root-zone water depletion are active.")
                
        if not is_confirmed:
            explanation = (
                f"REJECTED ({asked_confidence:.2f}% confidence). "
                + " ".join(reasons)
                + f" Actual dominant condition is '{actual_class_name}' with {actual_confidence:.2f}% confidence."
            )
        else:
            explanation = (
                f"CONFIRMED ({asked_confidence:.2f}% confidence). "
                + " ".join(reasons)
                + f" Matches primary biophysical stress diagnosis."
            )
            
        return {
            "asked_stress_name": target_class_name,
            "asked_stress_class_id": target_class_id,
            "asked_confidence_pct": round(asked_confidence, 2),
            "is_confirmed": is_confirmed,
            "actual_dominant_stress": actual_class_name,
            "actual_dominant_class_id": actual_class_id,
            "actual_confidence_pct": round(actual_confidence, 2),
            "explanation": explanation,
            "probabilities": {self.classes[i]: round(float(probs[i])*100.0, 2) for i in range(7)}
        }

def run_hypothesis_benchmark_suite():
    engine = AASRAHypothesisQueryEngine()
    
    test_cases = [
        # 1. Drought occurring -> User asks for Frost
        {
            "test_id": "HQ-01",
            "scenario": "Severe Drought in Latur (Maharashtra)",
            "asked_stress": "Frost",
            "inputs": {
                "temp_max_forecast_7d": 35.0, "temp_night_min_7d": 23.5, "rh_avg_forecast_7d": 32.0,
                "vpd_kpa": 3.20, "soil_moisture_vol_pct": 13.5, "consecutive_hot_days": 1,
                "crop_gdd_accumulated": 780.0, "rainfall_3d_sum_mm": 0.0, "soil_clay_pct": 48.0,
                "soil_ec_ds_m": 0.9, "soil_ph": 7.8
            }
        },
        # 2. Winter Frost occurring -> User asks for Drought
        {
            "test_id": "HQ-02",
            "scenario": "Severe Winter Frost in Ludhiana (Punjab)",
            "asked_stress": "Drought",
            "inputs": {
                "temp_max_forecast_7d": 13.0, "temp_night_min_7d": 0.8, "rh_avg_forecast_7d": 80.0,
                "vpd_kpa": 0.40, "soil_moisture_vol_pct": 36.0, "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 320.0, "rainfall_3d_sum_mm": 0.0, "soil_clay_pct": 20.0,
                "soil_ec_ds_m": 0.7, "soil_ph": 7.4
            }
        },
        # 3. Monsoon Flooding occurring -> User asks for Drought
        {
            "test_id": "HQ-03",
            "scenario": "Severe Monsoon Inundation in Patna (Bihar)",
            "asked_stress": "Drought",
            "inputs": {
                "temp_max_forecast_7d": 27.5, "temp_night_min_7d": 22.0, "rh_avg_forecast_7d": 95.0,
                "vpd_kpa": 0.35, "soil_moisture_vol_pct": 54.0, "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 620.0, "rainfall_3d_sum_mm": 160.0, "soil_clay_pct": 42.0,
                "soil_ec_ds_m": 0.6, "soil_ph": 7.2
            }
        },
        # 4. Extreme Heatwave occurring -> User asks for Frost
        {
            "test_id": "HQ-04",
            "scenario": "Severe Summer Heatwave in Kota (Rajasthan)",
            "asked_stress": "Frost",
            "inputs": {
                "temp_max_forecast_7d": 43.5, "temp_night_min_7d": 29.0, "rh_avg_forecast_7d": 28.0,
                "vpd_kpa": 3.90, "soil_moisture_vol_pct": 28.0, "consecutive_hot_days": 6,
                "crop_gdd_accumulated": 1100.0, "rainfall_3d_sum_mm": 0.0, "soil_clay_pct": 46.0,
                "soil_ec_ds_m": 1.0, "soil_ph": 7.8
            }
        },
        # 5. High Salinity occurring -> User asks for Heat Stress
        {
            "test_id": "HQ-05",
            "scenario": "Severe Coastal Salinity in Kutch (Gujarat)",
            "asked_stress": "Heat",
            "inputs": {
                "temp_max_forecast_7d": 32.0, "temp_night_min_7d": 22.5, "rh_avg_forecast_7d": 58.0,
                "vpd_kpa": 1.50, "soil_moisture_vol_pct": 34.0, "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 700.0, "rainfall_3d_sum_mm": 0.0, "soil_clay_pct": 32.0,
                "soil_ec_ds_m": 6.2, "soil_ph": 8.7
            }
        },
        # 6. Chennai Nocturnal Freezing Anomaly -> User asks for Frost (Affirmative Test)
        {
            "test_id": "HQ-06",
            "scenario": "Tropical Anomaly Frost in Chennai (Tamil Nadu)",
            "asked_stress": "Frost",
            "inputs": {
                "temp_max_forecast_7d": 14.0, "temp_night_min_7d": 1.2, "rh_avg_forecast_7d": 78.0,
                "vpd_kpa": 0.42, "soil_moisture_vol_pct": 35.0, "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 280.0, "rainfall_3d_sum_mm": 0.0, "soil_clay_pct": 28.0,
                "soil_ec_ds_m": 1.4, "soil_ph": 7.2
            }
        },
        # 7. Cold & Dry Boundary Tension -> User asks for Frost Stress
        {
            "test_id": "HQ-07",
            "scenario": "Dry Winter Night with Boundary Cold (TMin 3.54°C, Moisture 17.5%)",
            "asked_stress": "Frost",
            "inputs": {
                "temp_max_forecast_7d": 16.0, "temp_night_min_7d": 3.54, "rh_avg_forecast_7d": 62.0,
                "vpd_kpa": 0.75, "soil_moisture_vol_pct": 17.5, "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 380.0, "rainfall_3d_sum_mm": 0.0, "soil_clay_pct": 24.0,
                "soil_ec_ds_m": 0.8, "soil_ph": 7.3
            }
        },
        # 8. Benign Optimal Growth -> User asks for Drought Stress
        {
            "test_id": "HQ-08",
            "scenario": "Healthy Growing Field in Bhopal (Madhya Pradesh)",
            "asked_stress": "Drought",
            "inputs": {
                "temp_max_forecast_7d": 27.0, "temp_night_min_7d": 18.0, "rh_avg_forecast_7d": 65.0,
                "vpd_kpa": 1.20, "soil_moisture_vol_pct": 45.0, "consecutive_hot_days": 0,
                "crop_gdd_accumulated": 650.0, "rainfall_3d_sum_mm": 12.0, "soil_clay_pct": 48.0,
                "soil_ec_ds_m": 0.8, "soil_ph": 7.5
            }
        }
    ]
    
    rows = []
    print("=" * 115)
    print("AASRA MODEL 1: CONTRARIAN HYPOTHESIS TESTING (Asking for Condition X when Y is occurring)")
    print("=" * 115)
    
    for tc in test_cases:
        res = engine.query_hypothesis(tc["inputs"], tc["asked_stress"])
        
        row = {
            "test_id": tc["test_id"],
            "scenario": tc["scenario"],
            "asked_hypothesis": res["asked_stress_name"],
            "asked_confidence_pct": res["asked_confidence_pct"],
            "is_hypothesis_confirmed": res["is_confirmed"],
            "actual_dominant_condition": res["actual_dominant_stress"],
            "actual_confidence_pct": res["actual_confidence_pct"],
            "scientific_explanation": res["explanation"],
            # inputs
            "temp_max_forecast_7d": tc["inputs"]["temp_max_forecast_7d"],
            "temp_night_min_7d": tc["inputs"]["temp_night_min_7d"],
            "soil_moisture_vol_pct": tc["inputs"]["soil_moisture_vol_pct"],
            "rainfall_3d_sum_mm": tc["inputs"]["rainfall_3d_sum_mm"],
            "soil_ec_ds_m": tc["inputs"]["soil_ec_ds_m"]
        }
        rows.append(row)
        
        print(f"[{tc['test_id']}] Scenario: {tc['scenario']}")
        print(f"   [?] USER ASKED FOR : '{res['asked_stress_name']}'")
        print(f"   [*] CONFIDENCE GIVEN: {res['asked_confidence_pct']:.2f}% (Status: {'CONFIRMED' if res['is_confirmed'] else 'REJECTED'})")
        print(f"   [!] ACTUAL DOMINANT: '{res['actual_dominant_stress']}' with {res['actual_confidence_pct']:.2f}% confidence")
        print(f"   [i] REASONING      : {res['explanation']}")
        print("-" * 115)
        
    df_out = pd.DataFrame(rows)
    out_paths = [
        "d:/Projects/DriveF-Projects/hyperion/data/model1_hypothesis_query_testing.csv",
        "d:/Projects/DriveF-Projects/hyperion/ps02-engine/data/model1_hypothesis_query_testing.csv"
    ]
    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        df_out.to_csv(p, index=False)
        print(f"Saved results to: {p}")
        
    return df_out

if __name__ == "__main__":
    run_hypothesis_benchmark_suite()
