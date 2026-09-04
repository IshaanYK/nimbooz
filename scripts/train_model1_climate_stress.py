"""
AASRA Machine Learning System — Model 1 Ultra-Precise Training Pipeline (7-Class Edition)
Model: Climate Stress Early Warning Classifier (PS-02)
Features: 11 exact biophysical inputs
Classes:
  0 = Optimal Growth
  1 = Heat Stress
  2 = Drought Stress
  3 = Compound Stress (Heat + Drought)
  4 = Flooding / Waterlogging Stress
  5 = Frost / Cold Stress
  6 = Salinity Stress
Dataset: 50,000 samples across 10 diverse domestic and international agro-climatic zones
"""

import os
import math
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import classification_report, f1_score, precision_score, recall_score, roc_auc_score, confusion_matrix, log_loss
from sklearn.utils.class_weight import compute_sample_weight
import xgboost as xgb

from export_training_dataset_csv import generate_full_50k_training_dataset

def train_and_optimize_precise_model1():
    print("=" * 90)
    print("AASRA MODEL 1: HIGH-PRECISION CLIMATE & SOIL STRESS EARLY WARNING CLASSIFIER")
    print("Optimization Target: Maximum Precision & Calibrated Probabilities Across 7 Classes")
    print("=" * 90)
    
    # 1. Ingest Full 50,000 Dataset
    dataset_path = "data/model1_climate_stress_training_dataset_50k.csv"
    if os.path.exists(dataset_path):
        print(f"\n[STEP 1] Loading existing 50,000-sample dataset from: {dataset_path}")
        df = pd.read_csv(dataset_path)
    else:
        print("\n[STEP 1] Generating fresh 50,000-sample multi-region agronomic dataset...")
        df = generate_full_50k_training_dataset(50000, random_seed=42)
        
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
    
    X = df[feature_cols]
    y = df["stress_class"]
    
    class_labels = {
        0: "Optimal Growth",
        1: "Heat Stress",
        2: "Drought Stress",
        3: "Compound Stress (Heat+Drought)",
        4: "Flooding / Waterlogging",
        5: "Frost / Cold Stress",
        6: "Salinity Stress"
    }
    
    print("\nDataset Class Distribution:")
    for c_id, name in class_labels.items():
        count = (y == c_id).sum()
        pct = (count / len(y)) * 100.0
        print(f"  Class {c_id} ({name:30s}): {count:6d} samples ({pct:5.2f}%)")
        
    # 2. Stratified Train / Validation / Test Split (70% Train, 15% Val, 15% Test)
    print("\n[STEP 2] Performing Stratified 70/15/15 Split with Class Balance Preservation...")
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )
    
    print(f"  Training Set:   {len(X_train):,d} samples")
    print(f"  Validation Set: {len(X_val):,d} samples")
    print(f"  Held-out Test:  {len(X_test):,d} samples")
    
    sample_weights_train = compute_sample_weight('balanced', y_train)
    
    # 3. Precision-Tuned XGBoost Multi-Class Architecture
    print("\n[STEP 3] Training High-Precision XGBoost Classifier (400 trees, max_depth=6, lr=0.04)...")
    champion_model = xgb.XGBClassifier(
        n_estimators=400,
        max_depth=6,
        learning_rate=0.04,
        subsample=0.85,
        colsample_bytree=0.85,
        min_child_weight=2,
        gamma=0.05,
        objective="multi:softprob",
        num_class=7,
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=-1
    )
    
    champion_model.fit(
        X_train,
        y_train,
        sample_weight=sample_weights_train,
        eval_set=[(X_val, y_val)],
        verbose=False
    )
    
    # 4. Comprehensive Evaluation on Held-Out Test Set
    print("\n[STEP 4] Evaluating Model on Unseen Held-out Test Set (7,500 samples)...")
    y_pred = champion_model.predict(X_test)
    y_prob = champion_model.predict_proba(X_test)
    
    macro_precision = precision_score(y_test, y_pred, average="macro")
    macro_recall = recall_score(y_test, y_pred, average="macro")
    macro_f1 = f1_score(y_test, y_pred, average="macro")
    test_loss = log_loss(y_test, y_prob)
    roc_auc = roc_auc_score(y_test, y_prob, multi_class="ovr", average="macro")
    
    print("=" * 90)
    print("HELD-OUT TEST SET METRICS:")
    print(f"  • Macro Precision:   {macro_precision * 100:.2f}%")
    print(f"  • Macro Recall:      {macro_recall * 100:.2f}%")
    print(f"  • Macro F1-Score:    {macro_f1 * 100:.2f}%")
    print(f"  • Multi-class AUC:   {roc_auc:.4f}")
    print(f"  • Multi-class LogLoss: {test_loss:.4f}")
    print("=" * 90)
    
    print("\nDetailed Per-Class Precision & Classification Report:")
    target_names = [class_labels[i] for i in range(7)]
    print(classification_report(y_test, y_pred, target_names=target_names, digits=4))
    
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Feature Importance Ranking
    print("\nFeature Importance (Precision Drivers):")
    importances = champion_model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    for rank, idx in enumerate(sorted_idx, 1):
        print(f"  {rank:2d}. {feature_cols[idx]:24s}: {importances[idx]*100:5.2f}%")
        
    # 5. Export Model Artifacts
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ps02-engine", "data"))
    os.makedirs(output_dir, exist_ok=True)
    
    joblib_path = os.path.join(output_dir, "model1_climate_stress.joblib")
    json_path = os.path.join(output_dir, "model1_climate_stress.json")
    
    joblib.dump(champion_model, joblib_path)
    champion_model.save_model(json_path)
    
    print(f"\n[SAVED] Champion Model (.joblib): {joblib_path}")
    print(f"[SAVED] Native Model (.json):     {json_path}")
    
    return champion_model

if __name__ == "__main__":
    train_and_optimize_precise_model1()
