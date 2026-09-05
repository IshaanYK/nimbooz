"""
AASRA Platform — Unified Model 1 & Model 2 Production Loader and Inference Interface
Provides clean, one-line loading and prediction for:
- Model 1: 7-Class Climate & Soil Stress Early Warning Classifier (PS-02)
- Model 2: Biological Intervention Readiness Engine (PS-02 Action Gate)
"""

import os
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from typing import Dict, List, Union, Any, Tuple

# Paths to trained model artifacts
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PS02_DATA_DIR = os.path.join(BASE_DIR, "ps02-engine", "data")

MODEL1_JOBLIB_PATH = os.path.join(PS02_DATA_DIR, "model1_climate_stress.joblib")
MODEL1_JSON_PATH = os.path.join(PS02_DATA_DIR, "model1_climate_stress.json")
MODEL2_JOBLIB_PATH = os.path.join(PS02_DATA_DIR, "model2_biological_readiness.joblib")
MODEL2_RAW_JOBLIB_PATH = os.path.join(PS02_DATA_DIR, "model2_calibrated_classifier.joblib")

# Feature Schemas & Label Mappings
MODEL1_FEATURES = [
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

MODEL1_CLASSES = {
    0: "Optimal / No Severe Stress",
    1: "Heat Stress",
    2: "Drought Stress",
    3: "Compound Heat-Drought Stress",
    4: "Flooding / Waterlogging",
    5: "Frost / Cold Shock",
    6: "Salinity / Osmotic Shock"
}

MODEL2_FEATURES = [
    "soil_moisture_pct",
    "delta_t_celsius",
    "wind_speed_kmh",
    "rain_prob_next_48h",
    "crop_stage_sensitivity"
]


class BiologicalReadinessEngine:
    """
    Production inference wrapper for AASRA Model 2.
    Combines CalibratedClassifierCV probabilities (250,000 samples) with
    strict biophysical hard gates to prevent catastrophic crop burns or drift.
    """
    def __init__(self, calibrated_model):
        self.model = calibrated_model
        
    def predict_readiness(self, X_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Evaluates biological readiness for an input DataFrame of microclimate features.
        Returns:
            list of dicts containing:
            - readiness_score (float, 0.0 to 1.0)
            - spray_window_safe (bool)
            - delta_t (float)
            - reasons (list of str)
        """
        # Ensure correct column order
        X_df = X_df[MODEL2_FEATURES]
        raw_probs = self.model.predict_proba(X_df)[:, 1]
        results = []
        
        for i, (_, row) in enumerate(X_df.iterrows()):
            prob = float(raw_probs[i])
            sm = float(row["soil_moisture_pct"])
            dt = float(row["delta_t_celsius"])
            ws = float(row["wind_speed_kmh"])
            rp = float(row["rain_prob_next_48h"])
            
            reasons = []
            is_safe = True
            
            # Hard Biophysical Gate Overrides
            if ws > 15.0:
                prob = min(prob, 0.04)
                is_safe = False
                reasons.append(f"Wind speed {ws:.1f} km/h > 15 km/h limit (spray drift hazard)")
            if dt > 8.0:
                prob = min(prob, 0.03)
                is_safe = False
                reasons.append(f"Delta-T {dt:.1f} deg C > 8.0 deg C (rapid droplet evaporation before absorption)")
            elif dt < 2.0:
                prob = min(prob, 0.08)
                is_safe = False
                reasons.append(f"Delta-T {dt:.1f} deg C < 2.0 deg C (excess humidity, spray runoff)")
            if sm < 30.0:
                prob = min(prob, 0.05)
                is_safe = False
                reasons.append(f"Soil moisture {sm:.1f}% < 30% (xylem tension collapsed, stomata shut)")
            if rp > 40.0:
                prob = min(prob, 0.10)
                is_safe = False
                reasons.append(f"Rain probability {rp:.1f}% > 40% (chemical wash-off risk)")
                
            if is_safe and prob >= 0.50:
                reasons.append("Optimal stomatal aperture and atmospheric stability verified")
            elif is_safe and prob < 0.50:
                reasons.append("Microclimate within physical bounds but sub-optimal uptake probability")
                
            results.append({
                "readiness_score": float(np.round(prob, 3)),
                "spray_window_safe": bool(is_safe and prob >= 0.50),
                "delta_t": float(np.round(dt, 2)),
                "reasons": reasons
            })
            
        return results

    def predict(self, X_df: pd.DataFrame) -> np.ndarray:
        """Returns binary 1 (Safe to Spray) or 0 (Blocked) for compatibility with scikit-learn."""
        res = self.predict_readiness(X_df)
        return np.array([1 if r["spray_window_safe"] else 0 for r in res])


def load_model1(format: str = "joblib"):
    """
    Loads trained AASRA Model 1 (7-Class Climate Stress Classifier).
    Args:
        format: 'joblib' (returns sklearn XGBClassifier) or 'json' (returns native Booster)
    """
    if format == "json":
        if not os.path.exists(MODEL1_JSON_PATH):
            raise FileNotFoundError(f"Model 1 JSON not found at: {MODEL1_JSON_PATH}")
        booster = xgb.Booster()
        booster.load_model(MODEL1_JSON_PATH)
        return booster
    else:
        if not os.path.exists(MODEL1_JOBLIB_PATH):
            raise FileNotFoundError(f"Model 1 joblib not found at: {MODEL1_JOBLIB_PATH}")
        return joblib.load(MODEL1_JOBLIB_PATH)


def load_model2(with_gates: bool = True):
    """
    Loads trained AASRA Model 2 (Biological Intervention Readiness Engine).
    Args:
        with_gates: if True, returns BiologicalReadinessEngine with safety gate overrides.
                    if False, returns raw calibrated scikit-learn CalibratedClassifierCV.
    """
    if not os.path.exists(MODEL2_RAW_JOBLIB_PATH):
        raise FileNotFoundError(f"Model 2 raw weights not found at: {MODEL2_RAW_JOBLIB_PATH}")
    
    raw_calibrated = joblib.load(MODEL2_RAW_JOBLIB_PATH)
    if with_gates:
        return BiologicalReadinessEngine(raw_calibrated)
    return raw_calibrated


def predict_model1(data: Union[pd.DataFrame, Dict[str, Any], np.ndarray]) -> Dict[str, Any]:
    """
    Convenience inference helper for Model 1.
    Accepts single dict, DataFrame, or numpy array.
    """
    model = load_model1(format="joblib")
    if isinstance(data, dict):
        df = pd.DataFrame([data])[MODEL1_FEATURES]
    elif isinstance(data, pd.DataFrame):
        df = data[MODEL1_FEATURES]
    else:
        df = pd.DataFrame(data, columns=MODEL1_FEATURES)
        
    preds = model.predict(df)
    probs = model.predict_proba(df)
    
    output = []
    for pred, prob_dist in zip(preds, probs):
        output.append({
            "predicted_class_id": int(pred),
            "predicted_class_label": MODEL1_CLASSES[int(pred)],
            "confidence": float(np.round(np.max(prob_dist), 4)),
            "all_probabilities": {MODEL1_CLASSES[i]: float(np.round(p, 4)) for i, p in enumerate(prob_dist)}
        })
    return output[0] if isinstance(data, dict) else output


def predict_model2(data: Union[pd.DataFrame, Dict[str, Any], np.ndarray], with_gates: bool = True):
    """
    Convenience inference helper for Model 2.
    Accepts single dict, DataFrame, or numpy array.
    """
    engine = load_model2(with_gates=with_gates)
    if isinstance(data, dict):
        df = pd.DataFrame([data])[MODEL2_FEATURES]
    elif isinstance(data, pd.DataFrame):
        df = data[MODEL2_FEATURES]
    else:
        df = pd.DataFrame(data, columns=MODEL2_FEATURES)
        
    if with_gates:
        results = engine.predict_readiness(df)
        return results[0] if isinstance(data, dict) else results
    else:
        probs = engine.predict_proba(df)[:, 1]
        preds = (probs >= 0.50).astype(int)
        results = [{"spray_safe": int(p), "probability": float(np.round(prob, 4))} for p, prob in zip(preds, probs)]
        return results[0] if isinstance(data, dict) else results
