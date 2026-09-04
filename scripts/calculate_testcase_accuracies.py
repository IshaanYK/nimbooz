import os
import pandas as pd
import numpy as np
import joblib

# 1. 50-Case Stress Suite
df_50 = pd.read_csv('data/model1_50_random_inaccurate_stress_tests.csv')

# Ground truth mapping for the 50 cases based on intended dominant physical signal
expected_50 = {
    'TEST_01': 3, 'TEST_02': 3, 'TEST_03': 2, 'TEST_04': 4, 'TEST_05': 0,
    'TEST_06': 3, 'TEST_07': 5, 'TEST_08': 0, 'TEST_09': 0, 'TEST_10': 5,
    'TEST_11': 2, 'TEST_12': 1, 'TEST_13': 5, 'TEST_14': 3, 'TEST_15': 0,
    'TEST_16': 6, 'TEST_17': 1, 'TEST_18': 6, 'TEST_19': 4, 'TEST_20': 2,
    'TEST_21': 1, 'TEST_22': 2, 'TEST_23': 5, 'TEST_24': 2, 'TEST_25': 0,
    'TEST_26': 6, 'TEST_27': 1, 'TEST_28': 0, 'TEST_29': 5, 'TEST_30': 3,
    'TEST_31': 3, 'TEST_32': 5, 'TEST_33': 4, 'TEST_34': 6, 'TEST_35': 6,
    'TEST_36': 1, 'TEST_37': 2, 'TEST_38': 3, 'TEST_39': 4, 'TEST_40': 5,
    'TEST_41': 6, 'TEST_42': 0, 'TEST_43': 0, 'TEST_44': 0, 'TEST_45': 3,
    'TEST_46': 0, 'TEST_47': 0, 'TEST_48': 0, 'TEST_49': 6, 'TEST_50': 5
}

df_50['expected_class_id'] = df_50['test_id'].map(expected_50)
df_50['is_correct'] = df_50['predicted_class_id'] == df_50['expected_class_id']

real_50 = df_50[~df_50['is_dataset_fake']]
fake_50 = df_50[df_50['is_dataset_fake']]

print("=" * 80)
print("ACCURACY ON 50-SAMPLE RANDOM & INACCURATE STRESS SUITE")
print("=" * 80)
print(f"Real Plausible Telemetry Cases (15 cases):")
print(f"  -> Predicted True: {real_50['is_correct'].sum()} / {len(real_50)} ({real_50['is_correct'].mean()*100:.2f}%)")
print(f"Fake / Corrupted / Contradictory Cases (35 cases):")
print(f"  -> Predicted True to Dominant Signal: {fake_50['is_correct'].sum()} / {len(fake_50)} ({fake_50['is_correct'].mean()*100:.2f}%)")
print(f"Overall 50 Cases:")
print(f"  -> Total Predicted True: {df_50['is_correct'].sum()} / {len(df_50)} ({df_50['is_correct'].mean()*100:.2f}%)")

# List any mismatches in the 50 cases
mismatches_50 = df_50[~df_50['is_correct']]
if len(mismatches_50) > 0:
    print("\nSpecific Mismatches / Ambiguities in 50 Cases:")
    for _, r in mismatches_50.iterrows():
        print(f"  • {r['test_id']}: Exp Class {r['expected_class_id']}, Got Class {r['predicted_class_id']} ({r['predicted_stress_name']}) | Conf: {r['confidence_pct']}% | Reason: {r['corruption_type']}")
else:
    print("\nAll 50 cases correctly matched their expected dominant physical stress!")

# 2. User 72-Row Benchmark Dataset
print("\n" + "=" * 80)
print("ACCURACY ON USER 72-ROW BENCHMARK DATASET")
print("=" * 80)
df_user = pd.read_csv('data/user_dataset_model1_evaluation_results.csv')
print(f"Total Test Cases:   {len(df_user)}")
print(f"Predicted True:     {df_user['is_correct_match'].sum()} / {len(df_user)} ({df_user['is_correct_match'].mean()*100:.2f}%)")

# 3. 20-Farmers Platform Benchmark
print("\n" + "=" * 80)
print("ACCURACY ON 20-FARMER BENCHMARK DATASET")
print("=" * 80)
model = joblib.load('ps02-engine/data/model1_climate_stress.joblib')
df_farmers = pd.read_csv('data/model1_farmers_benchmark_testing.csv')
std_features = [
    'temp_max_forecast_7d', 'temp_night_min_7d', 'rh_avg_forecast_7d', 'vpd_kpa',
    'soil_moisture_vol_pct', 'consecutive_hot_days', 'crop_gdd_accumulated',
    'rainfall_3d_sum_mm', 'soil_clay_pct', 'soil_ec_ds_m', 'soil_ph'
]
farmers_correct = 0
for _, r in df_farmers.iterrows():
    row_vals = [
        r['temp_max_forecast_7d_c'],
        r['temp_night_min_7d_c'],
        r['rh_avg_forecast_7d_pct'],
        r['vpd_kpa'],
        r['soil_moisture_vol_pct'],
        r['consecutive_hot_days'],
        r['crop_gdd_accumulated'],
        r['rainfall_3d_sum_mm'],
        r['soil_clay_pct'],
        r['soil_ec_ds_m'],
        r['soil_ph']
    ]
    row_df = pd.DataFrame([row_vals], columns=std_features)
    pred_c = int(model.predict(row_df)[0])
    exp_c = int(r['predicted_stress_class_id'])
    if pred_c == exp_c:
        farmers_correct += 1
print(f"Total Farmer Cases: {len(df_farmers)}")
print(f"Predicted True:     {farmers_correct} / {len(df_farmers)} ({(farmers_correct / len(df_farmers))*100:.2f}%)")

# 4. Chennai, Himachal & Global Benchmark
print("\n" + "=" * 80)
print("ACCURACY ON CHENNAI, HIMACHAL & GLOBAL BENCHMARK")
print("=" * 80)
df_ch = pd.read_csv('data/model1_chennai_hp_global_testing.csv')
ch_correct = 0
for _, r in df_ch.iterrows():
    row_df = pd.DataFrame([[r[c] for c in std_features]], columns=std_features)
    pred_c = int(model.predict(row_df)[0])
    exp_c = int(r['predicted_stress_class_id'])
    if pred_c == exp_c:
        ch_correct += 1
print(f"Total Regional Cases: {len(df_ch)}")
print(f"Predicted True:       {ch_correct} / {len(df_ch)} ({(ch_correct / len(df_ch))*100:.2f}%)")

# 5. Held-out 7,500 Test Set
print("\n" + "=" * 80)
print("ACCURACY ON 7,500 HELD-OUT VALIDATION TEST SET")
print("=" * 80)
df_50k = pd.read_csv('data/model1_climate_stress_training_dataset_50k.csv')
from sklearn.model_selection import train_test_split
X = df_50k[std_features]
y = df_50k['stress_class']
X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.30, random_state=42, stratify=y)
X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp)
test_preds = model.predict(X_test)
test_acc = (test_preds == y_test).mean() * 100.0
test_correct = (test_preds == y_test).sum()
print(f"Total Held-out Samples: {len(y_test):,d}")
print(f"Predicted True:         {test_correct:,d} / {len(y_test):,d} ({test_acc:.2f}%)")

# 6. Grand Total Across All External Benchmarks
total_bench = len(df_50) + len(df_user) + len(df_farmers) + len(df_ch)
total_bench_correct = df_50['is_correct'].sum() + df_user['is_correct_match'].sum() + farmers_correct + ch_correct
print("\n" + "=" * 80)
print("GRAND TOTAL SUMMARY ACROSS ALL CURATED BENCHMARKS (Excluding held-out training data)")
print("=" * 80)
print(f"Total Benchmark Cases: {total_bench}")
print(f"Predicted True:        {total_bench_correct} / {total_bench} ({(total_bench_correct / total_bench)*100:.2f}%)")
