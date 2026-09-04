"""
Deep Inspection of Serialized Model: ps02-engine/data/model1_climate_stress.joblib
Extracts all 15 technical attributes directly from the in-memory Python object.
DO NOT MODIFY OR RETRAIN ANYTHING.
"""

import os
import joblib
import json
import xgboost as xgb
import sklearn

MODEL_PATH = "ps02-engine/data/model1_climate_stress.joblib"
assert os.path.exists(MODEL_PATH), f"File not found: {MODEL_PATH}"

model = joblib.load(MODEL_PATH)
booster = model.get_booster()

print("=" * 80)
print("INSPECTION OF SERIALIZED OBJECT: model1_climate_stress.joblib")
print("=" * 80)

# 1. Number of classes
n_classes = getattr(model, "n_classes_", None)
if n_classes is None and hasattr(model, "classes_"):
    n_classes = len(model.classes_)
print(f"1. Number of classes: {n_classes}")

# 2. Exact class labels
classes_ = getattr(model, "classes_", None)
print(f"2. Exact class labels: {list(classes_) if classes_ is not None else 'None'}")

# 3. Number of input features
n_features = getattr(model, "n_features_in_", None)
if n_features is None:
    n_features = len(booster.feature_names) if booster.feature_names else None
print(f"3. Number of input features: {n_features}")

# 4. Exact feature names and their order
feature_names = getattr(model, "feature_names_in_", None)
if feature_names is None:
    feature_names = booster.feature_names
print(f"4. Exact feature names and their order: {list(feature_names) if feature_names is not None else 'None'}")

# 5. XGBoost n_estimators
n_estimators = getattr(model, "n_estimators", None)
print(f"5. XGBoost n_estimators: {n_estimators}")

# 6. max_depth
max_depth = getattr(model, "max_depth", None)
print(f"6. max_depth: {max_depth}")

# 7. learning_rate
learning_rate = getattr(model, "learning_rate", None)
print(f"7. learning_rate: {learning_rate}")

# 8. objective
objective = getattr(model, "objective", None)
print(f"8. objective: {objective}")

# 9. booster type
booster_type = getattr(model, "booster", None)
print(f"9. booster type: {booster_type} (Actual runtime booster: {type(booster).__name__})")

# 10. number of trees/boosters actually stored
# For multi-class, XGBoost stores n_trees = num_boosted_rounds * num_classes
dump = booster.get_dump()
num_trees = len(dump)
num_rounds = booster.num_boosted_rounds()
print(f"10. Number of trees stored: {num_trees} trees across {num_rounds} boosted rounds ({num_trees // n_classes if n_classes else 'N/A'} trees per class)")

# 11. XGBoost version
xgb_version = getattr(xgb, "__version__", "Unknown")
# Check if booster config contains version
booster_config = json.loads(booster.save_config())
booster_version = booster_config.get("version", None)
print(f"11. XGBoost version: Installed={xgb_version}, BoosterConfigVersion={booster_version}")

# 12. Python/sklearn version
sklearn_version = getattr(sklearn, "__version__", "Unknown")
import sys
python_version = sys.version.split()[0]
print(f"12. Python/sklearn version: Python={python_version}, scikit-learn={sklearn_version}")

# 13. predict_proba return length
# Test on a dummy zero-array with the feature names
import pandas as pd
import numpy as np
dummy_df = pd.DataFrame(np.zeros((1, len(feature_names))), columns=feature_names)
dummy_prob = model.predict_proba(dummy_df)[0]
print(f"13. predict_proba return shape: {len(dummy_prob)} probabilities (Array: {dummy_prob.shape})")

# 14. Preprocessing pipeline check
is_pipeline = isinstance(model, sklearn.pipeline.Pipeline)
has_steps = hasattr(model, "steps")
print(f"14. Has preprocessing pipeline: {is_pipeline} (Object Type: {type(model).__name__}, has_steps={has_steps})")

# 15. Hardcoded rules outside serialized model
# Check ps02-engine/app.py or other files in ps02-engine
app_path = "ps02-engine/app.py"
has_app = os.path.exists(app_path)
print(f"15. ps02-engine/app.py exists: {has_app}")
if has_app:
    with open(app_path, "r", encoding="utf-8", errors="ignore") as f:
        app_code = f.read()
    # Check if app.py overrides predictions
    overrides_found = any(k in app_code for k in ["if is_frost", "is_heat", "is_flooding", "is_salinity"])
    print(f"    Hardcoded rule overrides inside ps02-engine/app.py: {overrides_found}")
