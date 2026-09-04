"""
AASRA Model 1: 50 Random, Inaccurate, and Multi-Location Stress Test Suite
Generates 50 distinct test cases from diverse global & domestic locations with deliberate
inaccuracies, corrupted sensors, contradictory physics, and out-of-distribution noise.
Explicitly tags each dataset row as FAKE (Corrupted/Contradictory/Noisy) vs REAL (Plausible).

Outputs:
- data/model1_50_random_inaccurate_stress_tests.csv
- ps02-engine/data/model1_50_random_inaccurate_stress_tests.csv
"""

import os
import math
import numpy as np
import pandas as pd
import joblib

def calc_tetens_vpd(temp_c, rh_pct):
    svp = 0.61078 * math.exp((17.27 * max(temp_c, 1.0)) / (max(temp_c, 1.0) + 237.3))
    return max(0.05, svp * (1.0 - (max(0.0, min(100.0, rh_pct)) / 100.0)))

def generate_and_evaluate_50_test_cases():
    print("=" * 115)
    print("AASRA MODEL 1: EVALUATION OF 50 RANDOM, INACCURATE & MULTI-LOCATION STRESS TEST CASES")
    print("Testing Model Robustness Against Sensor Corruption, Physics Contradictions & Out-of-Distribution Noise")
    print("=" * 115)
    
    # 1. Load Calibrated Champion Model
    model_path = "ps02-engine/data/model1_climate_stress.joblib"
    assert os.path.exists(model_path), f"Champion model not found at: {model_path}"
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
    
    # Define 50 diverse cases spanning 15 domestic and global locations
    # Locations:
    # 1. Jaisalmer, Rajasthan (Arid desert)
    # 2. Munnar, Kerala (Highland tea gardens)
    # 3. Leh, Ladakh (Cold high-altitude desert)
    # 4. Kaziranga, Assam (Subtropical floodplains)
    # 5. Nagpur, Maharashtra (Hot semi-arid citrus belt)
    # 6. Sunderbans, West Bengal (Coastal saline mangrove margin)
    # 7. Shimla, Himachal Pradesh (Temperate apple orchards)
    # 8. Anantapur, Andhra Pradesh (Rainshadow drought tract)
    # 9. Death Valley, California, USA (Hyper-arid extreme heat)
    # 10. Oymyakon, Siberia, Russia (Subarctic permafrost)
    # 11. Manaus, Amazon, Brazil (Equatorial rainforest)
    # 12. Al-Ahsa, Saudi Arabia (Hyper-saline desert oasis)
    # 13. Canterbury, New Zealand (Maritime temperate pasture)
    # 14. Wageningen, Netherlands (Intensive greenhouse clay)
    # 15. Punjab Wheat Belt, Ludhiana (Indo-Gangetic alluvial plains)
    
    raw_cases = [
        # --- GROUP 1: FAKE - CORRUPTED SENSORS (Physically impossible telemetry values) ---
        {
            "test_id": "TEST_01", "location": "Nagpur, Maharashtra", "country": "India",
            "authenticity_tag": "FAKE_CORRUPTED_SENSOR",
            "corruption_type": "Negative Soil Moisture & RH > 100%",
            "temp_max": 42.0, "temp_min": 26.0, "rh": 115.0, "vpd": 0.05, "sm": -4.5,
            "hot_days": 5, "gdd": 1450.0, "rain_3d": 0.0, "clay": 45.0, "ec": 1.1, "ph": 7.8
        },
        {
            "test_id": "TEST_02", "location": "Jaisalmer, Rajasthan", "country": "India",
            "authenticity_tag": "FAKE_CORRUPTED_SENSOR",
            "corruption_type": "Impossible Soil pH (pH = 14.0) & Ultra EC",
            "temp_max": 44.5, "temp_min": 28.0, "rh": 18.0, "vpd": 5.2, "sm": 11.0,
            "hot_days": 7, "gdd": 1600.0, "rain_3d": 0.0, "clay": 14.0, "ec": 38.5, "ph": 14.0
        },
        {
            "test_id": "TEST_03", "location": "Leh, Ladakh", "country": "India",
            "authenticity_tag": "FAKE_CORRUPTED_SENSOR",
            "corruption_type": "Negative Temperature Spread (Min > Max)",
            "temp_max": -5.0, "temp_min": 12.0, "rh": 35.0, "vpd": 0.4, "sm": 18.0,
            "hot_days": 0, "gdd": 40.0, "rain_3d": 0.0, "clay": 15.0, "ec": 0.4, "ph": 7.2
        },
        {
            "test_id": "TEST_04", "location": "Kaziranga, Assam", "country": "India",
            "authenticity_tag": "FAKE_CORRUPTED_SENSOR",
            "corruption_type": "Glitch Soil Moisture (180% Volumetric)",
            "temp_max": 31.0, "temp_min": 24.0, "rh": 90.0, "vpd": 0.5, "sm": 180.0,
            "hot_days": 0, "gdd": 980.0, "rain_3d": 120.0, "clay": 38.0, "ec": 0.5, "ph": 6.2
        },
        {
            "test_id": "TEST_05", "location": "Sunderbans, WB", "country": "India",
            "authenticity_tag": "FAKE_CORRUPTED_SENSOR",
            "corruption_type": "Negative Electrical Conductivity (EC = -2.8 dS/m)",
            "temp_max": 33.0, "temp_min": 25.0, "rh": 82.0, "vpd": 1.1, "sm": 36.0,
            "hot_days": 0, "gdd": 1100.0, "rain_3d": 15.0, "clay": 42.0, "ec": -2.8, "ph": 7.4
        },
        {
            "test_id": "TEST_06", "location": "Death Valley, CA", "country": "USA",
            "authenticity_tag": "FAKE_CORRUPTED_SENSOR",
            "corruption_type": "Negative VPD (-1.5 kPa) & 0% Soil Clay",
            "temp_max": 49.0, "temp_min": 32.0, "rh": 8.0, "vpd": -1.5, "sm": 6.0,
            "hot_days": 12, "gdd": 2200.0, "rain_3d": 0.0, "clay": -5.0, "ec": 4.2, "ph": 8.5
        },
        {
            "test_id": "TEST_07", "location": "Oymyakon, Siberia", "country": "Russia",
            "authenticity_tag": "FAKE_CORRUPTED_SENSOR",
            "corruption_type": "Glitch GDD = -500 & 99 Consecutive Hot Days",
            "temp_max": -15.0, "temp_min": -28.0, "rh": 65.0, "vpd": 0.1, "sm": 22.0,
            "hot_days": 99, "gdd": -500.0, "rain_3d": 0.0, "clay": 22.0, "ec": 0.3, "ph": 6.0
        },
        {
            "test_id": "TEST_08", "location": "Ludhiana, Punjab", "country": "India",
            "authenticity_tag": "FAKE_CORRUPTED_SENSOR",
            "corruption_type": "Acid Spill Glitch (pH = 0.5)",
            "temp_max": 28.0, "temp_min": 14.0, "rh": 68.0, "vpd": 1.2, "sm": 32.0,
            "hot_days": 0, "gdd": 850.0, "rain_3d": 5.0, "clay": 22.0, "ec": 0.8, "ph": 0.5
        },
        {
            "test_id": "TEST_09", "location": "Manaus, Amazon", "country": "Brazil",
            "authenticity_tag": "FAKE_CORRUPTED_SENSOR",
            "corruption_type": "Zero Rainfall but 95% Soil Moisture in Pure Sand",
            "temp_max": 32.0, "temp_min": 23.0, "rh": 88.0, "vpd": 0.6, "sm": 95.0,
            "hot_days": 0, "gdd": 1250.0, "rain_3d": -20.0, "clay": 2.0, "ec": 0.2, "ph": 4.8
        },
        {
            "test_id": "TEST_10", "location": "Shimla, HP", "country": "India",
            "authenticity_tag": "FAKE_CORRUPTED_SENSOR",
            "corruption_type": "All Zeros Telemetry Dropout",
            "temp_max": 0.0, "temp_min": 0.0, "rh": 0.0, "vpd": 0.0, "sm": 0.0,
            "hot_days": 0, "gdd": 0.0, "rain_3d": 0.0, "clay": 0.0, "ec": 0.0, "ph": 0.0
        },

        # --- GROUP 2: FAKE - CONTRADICTORY PHYSICS (Incompatible Agronomic Realities) ---
        {
            "test_id": "TEST_11", "location": "Kaziranga, Assam", "country": "India",
            "authenticity_tag": "FAKE_CONTRADICTORY_PHYSICS",
            "corruption_type": "250mm Monsoon Deluge with 7% Bone-Dry Soil",
            "temp_max": 30.0, "temp_min": 23.0, "rh": 95.0, "vpd": 0.3, "sm": 7.2,
            "hot_days": 0, "gdd": 920.0, "rain_3d": 250.0, "clay": 35.0, "ec": 0.6, "ph": 6.8
        },
        {
            "test_id": "TEST_12", "location": "Nagpur, Maharashtra", "country": "India",
            "authenticity_tag": "FAKE_CONTRADICTORY_PHYSICS",
            "corruption_type": "47°C Scorching Heat with 98% Relative Humidity",
            "temp_max": 47.0, "temp_min": 31.0, "rh": 98.0, "vpd": 0.25, "sm": 38.0,
            "hot_days": 8, "gdd": 1950.0, "rain_3d": 0.0, "clay": 48.0, "ec": 1.2, "ph": 8.0
        },
        {
            "test_id": "TEST_13", "location": "Leh, Ladakh", "country": "India",
            "authenticity_tag": "FAKE_CONTRADICTORY_PHYSICS",
            "corruption_type": "-12°C Night Frost with 6 Consecutive Hot Days",
            "temp_max": 18.0, "temp_min": -12.0, "rh": 30.0, "vpd": 1.2, "sm": 20.0,
            "hot_days": 6, "gdd": 150.0, "rain_3d": 0.0, "clay": 16.0, "ec": 0.4, "ph": 7.4
        },
        {
            "test_id": "TEST_14", "location": "Al-Ahsa, Eastern Prov", "country": "Saudi Arabia",
            "authenticity_tag": "FAKE_CONTRADICTORY_PHYSICS",
            "corruption_type": "52°C Desert Air with Sub-zero Minimum (-2°C) in Summer",
            "temp_max": 52.0, "temp_min": -2.0, "rh": 12.0, "vpd": 6.8, "sm": 8.5,
            "hot_days": 10, "gdd": 1800.0, "rain_3d": 0.0, "clay": 18.0, "ec": 6.5, "ph": 8.4
        },
        {
            "test_id": "TEST_15", "location": "Munnar, Kerala", "country": "India",
            "authenticity_tag": "FAKE_CONTRADICTORY_PHYSICS",
            "corruption_type": "High VPD (5.4 kPa) with 94% Relative Humidity",
            "temp_max": 24.0, "temp_min": 15.0, "rh": 94.0, "vpd": 5.4, "sm": 44.0,
            "hot_days": 0, "gdd": 650.0, "rain_3d": 45.0, "clay": 26.0, "ec": 0.3, "ph": 5.6
        },
        {
            "test_id": "TEST_16", "location": "Anantapur, AP", "country": "India",
            "authenticity_tag": "FAKE_CONTRADICTORY_PHYSICS",
            "corruption_type": "Flooding Clay (62% SM) in Zero Rain with Severe Saline Crust (EC=18)",
            "temp_max": 38.5, "temp_min": 25.0, "rh": 40.0, "vpd": 3.8, "sm": 62.0,
            "hot_days": 3, "gdd": 1400.0, "rain_3d": 0.0, "clay": 52.0, "ec": 18.0, "ph": 8.9
        },
        {
            "test_id": "TEST_17", "location": "Wageningen, Gelderland", "country": "Netherlands",
            "authenticity_tag": "FAKE_CONTRADICTORY_PHYSICS",
            "corruption_type": "42°C Tropical Heat in Dutch Winter with Frost GDD (50.0)",
            "temp_max": 42.0, "temp_min": 22.0, "rh": 50.0, "vpd": 3.5, "sm": 32.0,
            "hot_days": 5, "gdd": 50.0, "rain_3d": 0.0, "clay": 30.0, "ec": 0.5, "ph": 6.5
        },
        {
            "test_id": "TEST_18", "location": "Sunderbans, WB", "country": "India",
            "authenticity_tag": "FAKE_CONTRADICTORY_PHYSICS",
            "corruption_type": "Pure Marine Salinity (EC=24 dS/m) with Acidic Bog pH (pH=3.5)",
            "temp_max": 32.5, "temp_min": 24.0, "rh": 85.0, "vpd": 0.9, "sm": 45.0,
            "hot_days": 0, "gdd": 1150.0, "rain_3d": 60.0, "clay": 46.0, "ec": 24.0, "ph": 3.5
        },
        {
            "test_id": "TEST_19", "location": "Jaisalmer, Rajasthan", "country": "India",
            "authenticity_tag": "FAKE_CONTRADICTORY_PHYSICS",
            "corruption_type": "Waterlogging Deluge in Sand Dunes (SM=55% in 8% Clay)",
            "temp_max": 37.0, "temp_min": 26.0, "rh": 70.0, "vpd": 1.8, "sm": 55.0,
            "hot_days": 0, "gdd": 1500.0, "rain_3d": 140.0, "clay": 8.0, "ec": 1.5, "ph": 7.9
        },
        {
            "test_id": "TEST_20", "location": "Canterbury, South Island", "country": "New Zealand",
            "authenticity_tag": "FAKE_CONTRADICTORY_PHYSICS",
            "corruption_type": "Zero Soil Moisture (0.5%) with 92% Relative Humidity & 22°C",
            "temp_max": 22.0, "temp_min": 11.0, "rh": 92.0, "vpd": 0.3, "sm": 0.5,
            "hot_days": 0, "gdd": 550.0, "rain_3d": 0.0, "clay": 25.0, "ec": 0.4, "ph": 6.2
        },

        # --- GROUP 3: FAKE - INACCURATE TELEMETRY / HEAVY NOISE / SENSOR DRIFT ---
        {
            "test_id": "TEST_21", "location": "Nagpur, Maharashtra", "country": "India",
            "authenticity_tag": "FAKE_INACCURATE_NOISE",
            "corruption_type": "Thermistor Drift +7.5°C over True Ambient",
            "temp_max": 45.5, "temp_min": 29.5, "rh": 42.0, "vpd": 4.6, "sm": 28.0,
            "hot_days": 4, "gdd": 1650.0, "rain_3d": 0.0, "clay": 44.0, "ec": 0.9, "ph": 7.9
        },
        {
            "test_id": "TEST_22", "location": "Ludhiana, Punjab", "country": "India",
            "authenticity_tag": "FAKE_INACCURATE_NOISE",
            "corruption_type": "FDR Capacitive Probe Dry Bias (-14% SM Offset)",
            "temp_max": 31.0, "temp_min": 18.0, "rh": 65.0, "vpd": 1.4, "sm": 13.5,
            "hot_days": 0, "gdd": 890.0, "rain_3d": 15.0, "clay": 20.0, "ec": 0.7, "ph": 7.4
        },
        {
            "test_id": "TEST_23", "location": "Shimla, HP", "country": "India",
            "authenticity_tag": "FAKE_INACCURATE_NOISE",
            "corruption_type": "Night Frost Sensor Lag (Reports 2.1°C when actual is 6.5°C)",
            "temp_max": 14.5, "temp_min": 2.1, "rh": 75.0, "vpd": 0.5, "sm": 34.0,
            "hot_days": 0, "gdd": 220.0, "rain_3d": 8.0, "clay": 18.0, "ec": 0.4, "ph": 6.3
        },
        {
            "test_id": "TEST_24", "location": "Anantapur, AP", "country": "India",
            "authenticity_tag": "FAKE_INACCURATE_NOISE",
            "corruption_type": "RH Hygristor Saturation Drift (Pinned at 99%)",
            "temp_max": 36.5, "temp_min": 24.0, "rh": 99.0, "vpd": 0.1, "sm": 16.2,
            "hot_days": 2, "gdd": 1320.0, "rain_3d": 0.0, "clay": 30.0, "ec": 1.2, "ph": 8.1
        },
        {
            "test_id": "TEST_25", "location": "Munnar, Kerala", "country": "India",
            "authenticity_tag": "FAKE_INACCURATE_NOISE",
            "corruption_type": "Tipping Bucket Rain Gauge Clogged (Reports 0mm in Torrent)",
            "temp_max": 21.0, "temp_min": 14.0, "rh": 96.0, "vpd": 0.2, "sm": 52.0,
            "hot_days": 0, "gdd": 580.0, "rain_3d": 0.0, "clay": 28.0, "ec": 0.3, "ph": 5.4
        },
        {
            "test_id": "TEST_26", "location": "Sunderbans, WB", "country": "India",
            "authenticity_tag": "FAKE_INACCURATE_NOISE",
            "corruption_type": "Soil EC Probe Fouling (Reads 8.5 dS/m in Freshwater Zone)",
            "temp_max": 31.5, "temp_min": 23.5, "rh": 80.0, "vpd": 1.0, "sm": 38.0,
            "hot_days": 0, "gdd": 1050.0, "rain_3d": 25.0, "clay": 40.0, "ec": 8.5, "ph": 7.3
        },
        {
            "test_id": "TEST_27", "location": "Jaisalmer, Rajasthan", "country": "India",
            "authenticity_tag": "FAKE_INACCURATE_NOISE",
            "corruption_type": "Solar Radiation Shield Detached (+6°C Daytime Radiative Bias)",
            "temp_max": 48.0, "temp_min": 27.0, "rh": 22.0, "vpd": 5.8, "sm": 14.0,
            "hot_days": 6, "gdd": 1720.0, "rain_3d": 0.0, "clay": 12.0, "ec": 1.8, "ph": 8.2
        },
        {
            "test_id": "TEST_28", "location": "Manaus, Amazon", "country": "Brazil",
            "authenticity_tag": "FAKE_INACCURATE_NOISE",
            "corruption_type": "VPD Calculation Inversion Bug (Calculated as 0.05 when Air is Dry)",
            "temp_max": 34.0, "temp_min": 22.0, "rh": 35.0, "vpd": 0.05, "sm": 26.0,
            "hot_days": 1, "gdd": 1300.0, "rain_3d": 0.0, "clay": 32.0, "ec": 0.3, "ph": 5.2
        },
        {
            "test_id": "TEST_29", "location": "Leh, Ladakh", "country": "India",
            "authenticity_tag": "FAKE_INACCURATE_NOISE",
            "corruption_type": "Ultrasonic Snowpack Drift (SM Artificially High at 46% during Freeze)",
            "temp_max": 6.0, "temp_min": -4.0, "rh": 45.0, "vpd": 0.5, "sm": 46.0,
            "hot_days": 0, "gdd": 60.0, "rain_3d": 5.0, "clay": 14.0, "ec": 0.3, "ph": 7.6
        },
        {
            "test_id": "TEST_30", "location": "Death Valley, CA", "country": "USA",
            "authenticity_tag": "FAKE_INACCURATE_NOISE",
            "corruption_type": "GDD Accumulator Rollover Overflow Bug (GDD = 45.0 in Summer)",
            "temp_max": 46.0, "temp_min": 30.0, "rh": 14.0, "vpd": 5.2, "sm": 8.0,
            "hot_days": 8, "gdd": 45.0, "rain_3d": 0.0, "clay": 16.0, "ec": 3.5, "ph": 8.3
        },

        # --- GROUP 4: FAKE - EXTREME OUT-OF-DISTRIBUTION ANOMALIES ---
        {
            "test_id": "TEST_31", "location": "Al-Ahsa, Eastern Prov", "country": "Saudi Arabia",
            "authenticity_tag": "FAKE_OUT_OF_DISTRIBUTION_EXTREME",
            "corruption_type": "Hyper-Thermal Catastrophe (TMax = 56.5°C)",
            "temp_max": 56.5, "temp_min": 35.0, "rh": 6.0, "vpd": 7.8, "sm": 4.2,
            "hot_days": 14, "gdd": 2450.0, "rain_3d": 0.0, "clay": 15.0, "ec": 5.8, "ph": 8.6
        },
        {
            "test_id": "TEST_32", "location": "Oymyakon, Siberia", "country": "Russia",
            "authenticity_tag": "FAKE_OUT_OF_DISTRIBUTION_EXTREME",
            "corruption_type": "Deep Cryogenic Freeze (TMin = -42.0°C)",
            "temp_max": -28.0, "temp_min": -42.0, "rh": 70.0, "vpd": 0.02, "sm": 18.0,
            "hot_days": 0, "gdd": 10.0, "rain_3d": 0.0, "clay": 20.0, "ec": 0.2, "ph": 6.4
        },
        {
            "test_id": "TEST_33", "location": "Kaziranga, Assam", "country": "India",
            "authenticity_tag": "FAKE_OUT_OF_DISTRIBUTION_EXTREME",
            "corruption_type": "Megaflood Super-saturation (Rainfall 3D = 480 mm)",
            "temp_max": 28.5, "temp_min": 24.0, "rh": 98.0, "vpd": 0.15, "sm": 64.0,
            "hot_days": 0, "gdd": 950.0, "rain_3d": 480.0, "clay": 44.0, "ec": 0.5, "ph": 6.5
        },
        {
            "test_id": "TEST_34", "location": "Sunderbans, WB", "country": "India",
            "authenticity_tag": "FAKE_OUT_OF_DISTRIBUTION_EXTREME",
            "corruption_type": "Brine Inundation (Soil EC = 42.0 dS/m)",
            "temp_max": 34.0, "temp_min": 25.0, "rh": 82.0, "vpd": 1.2, "sm": 48.0,
            "hot_days": 0, "gdd": 1200.0, "rain_3d": 30.0, "clay": 48.0, "ec": 42.0, "ph": 8.4
        },
        {
            "test_id": "TEST_35", "location": "Canterbury, South Island", "country": "New Zealand",
            "authenticity_tag": "FAKE_OUT_OF_DISTRIBUTION_EXTREME",
            "corruption_type": "Extreme Alkali Flat Drift (Soil pH = 11.2)",
            "temp_max": 24.0, "temp_min": 12.0, "rh": 65.0, "vpd": 1.1, "sm": 28.0,
            "hot_days": 0, "gdd": 620.0, "rain_3d": 12.0, "clay": 24.0, "ec": 6.2, "ph": 11.2
        },

        # --- GROUP 5: REAL - PLAUSIBLE MULTI-LOCATION FIELD TELEMETRY ---
        {
            "test_id": "TEST_36", "location": "Nagpur, Maharashtra", "country": "India",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Vidarbha Summer Heatwave",
            "temp_max": 43.8, "temp_min": 27.5, "rh": 32.0, "vpd": 4.1, "sm": 24.5,
            "hot_days": 5, "gdd": 1680.0, "rain_3d": 0.0, "clay": 46.0, "ec": 0.9, "ph": 7.9
        },
        {
            "test_id": "TEST_37", "location": "Anantapur, AP", "country": "India",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Rayalaseema Prolonged Drought",
            "temp_max": 36.2, "temp_min": 23.4, "rh": 38.0, "vpd": 2.9, "sm": 14.8,
            "hot_days": 1, "gdd": 1350.0, "rain_3d": 0.0, "clay": 28.0, "ec": 1.1, "ph": 7.8
        },
        {
            "test_id": "TEST_38", "location": "Jaisalmer, Rajasthan", "country": "India",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Thar Compound Stress (Heat + Drought)",
            "temp_max": 44.2, "temp_min": 28.0, "rh": 24.0, "vpd": 4.8, "sm": 12.1,
            "hot_days": 6, "gdd": 1780.0, "rain_3d": 0.0, "clay": 15.0, "ec": 2.2, "ph": 8.3
        },
        {
            "test_id": "TEST_39", "location": "Kaziranga, Assam", "country": "India",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Brahmaputra Basin Monsoon Waterlogging",
            "temp_max": 30.5, "temp_min": 24.2, "rh": 92.0, "vpd": 0.45, "sm": 49.5,
            "hot_days": 0, "gdd": 980.0, "rain_3d": 115.0, "clay": 42.0, "ec": 0.4, "ph": 6.4
        },
        {
            "test_id": "TEST_40", "location": "Leh, Ladakh", "country": "India",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Himalayan High-Altitude Frost",
            "temp_max": 8.5, "temp_min": -2.4, "rh": 36.0, "vpd": 0.6, "sm": 21.0,
            "hot_days": 0, "gdd": 90.0, "rain_3d": 2.0, "clay": 16.0, "ec": 0.4, "ph": 7.4
        },
        {
            "test_id": "TEST_41", "location": "Sunderbans, WB", "country": "India",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Coastal Delta Salinity Stress",
            "temp_max": 33.2, "temp_min": 24.8, "rh": 78.0, "vpd": 1.25, "sm": 36.5,
            "hot_days": 0, "gdd": 1210.0, "rain_3d": 18.0, "clay": 44.0, "ec": 5.4, "ph": 8.4
        },
        {
            "test_id": "TEST_42", "location": "Munnar, Kerala", "country": "India",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Western Ghats Optimal Tea Monsoon",
            "temp_max": 24.8, "temp_min": 16.2, "rh": 84.0, "vpd": 0.75, "sm": 38.0,
            "hot_days": 0, "gdd": 780.0, "rain_3d": 28.0, "clay": 26.0, "ec": 0.3, "ph": 5.5
        },
        {
            "test_id": "TEST_43", "location": "Ludhiana, Punjab", "country": "India",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Punjab Ropa Rabi Wheat Optimal Window",
            "temp_max": 23.5, "temp_min": 11.2, "rh": 72.0, "vpd": 0.85, "sm": 35.0,
            "hot_days": 0, "gdd": 650.0, "rain_3d": 6.0, "clay": 22.0, "ec": 0.7, "ph": 7.5
        },
        {
            "test_id": "TEST_44", "location": "Shimla, HP", "country": "India",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Montane Spring Optimal Flowering",
            "temp_max": 20.4, "temp_min": 9.8, "rh": 64.0, "vpd": 0.95, "sm": 32.5,
            "hot_days": 0, "gdd": 490.0, "rain_3d": 14.0, "clay": 20.0, "ec": 0.4, "ph": 6.5
        },
        {
            "test_id": "TEST_45", "location": "Death Valley, CA", "country": "USA",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Sonoran Compound Desert Stress",
            "temp_max": 46.8, "temp_min": 31.0, "rh": 14.0, "vpd": 5.4, "sm": 9.4,
            "hot_days": 9, "gdd": 2100.0, "rain_3d": 0.0, "clay": 18.0, "ec": 3.8, "ph": 8.4
        },
        {
            "test_id": "TEST_46", "location": "Manaus, Amazon", "country": "Brazil",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Equatorial Rainforest High-Humidity Growth",
            "temp_max": 31.8, "temp_min": 23.6, "rh": 86.0, "vpd": 0.7, "sm": 41.0,
            "hot_days": 0, "gdd": 1340.0, "rain_3d": 45.0, "clay": 36.0, "ec": 0.2, "ph": 5.1
        },
        {
            "test_id": "TEST_47", "location": "Canterbury, South Island", "country": "New Zealand",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Maritime Oceanic Optimal Pasture",
            "temp_max": 21.2, "temp_min": 10.5, "rh": 76.0, "vpd": 0.65, "sm": 34.0,
            "hot_days": 0, "gdd": 520.0, "rain_3d": 16.0, "clay": 24.0, "ec": 0.4, "ph": 6.2
        },
        {
            "test_id": "TEST_48", "location": "Wageningen, Gelderland", "country": "Netherlands",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Intensive Dutch Alluvial Optimal",
            "temp_max": 22.0, "temp_min": 12.0, "rh": 74.0, "vpd": 0.72, "sm": 36.2,
            "hot_days": 0, "gdd": 580.0, "rain_3d": 12.0, "clay": 28.0, "ec": 0.6, "ph": 6.8
        },
        {
            "test_id": "TEST_49", "location": "Al-Ahsa, Eastern Prov", "country": "Saudi Arabia",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Gulf Coastal Oasis Salinity & Heat",
            "temp_max": 42.5, "temp_min": 27.0, "rh": 28.0, "vpd": 4.2, "sm": 22.0,
            "hot_days": 6, "gdd": 1750.0, "rain_3d": 0.0, "clay": 22.0, "ec": 5.8, "ph": 8.6
        },
        {
            "test_id": "TEST_50", "location": "Oymyakon, Siberia", "country": "Russia",
            "authenticity_tag": "REAL_LOCATION_PLAUSIBLE",
            "corruption_type": "Authentic Siberian Subarctic Frost Zone",
            "temp_max": -4.0, "temp_min": -18.0, "rh": 60.0, "vpd": 0.1, "sm": 20.0,
            "hot_days": 0, "gdd": 30.0, "rain_3d": 0.0, "clay": 20.0, "ec": 0.2, "ph": 6.2
        }
    ]
    
    # 2. Run Inference across all 50 Cases
    results = []
    
    for case in raw_cases:
        row_feats = [
            case["temp_max"],
            case["temp_min"],
            case["rh"],
            case["vpd"],
            case["sm"],
            case["hot_days"],
            case["gdd"],
            case["rain_3d"],
            case["clay"],
            case["ec"],
            case["ph"]
        ]
        
        df_row = pd.DataFrame([row_feats], columns=feature_cols)
        pred_c = int(model.predict(df_row)[0])
        probs = model.predict_proba(df_row)[0]
        conf = float(np.max(probs) * 100.0)
        
        # Second highest class prediction for ambiguity inspection
        sorted_indices = np.argsort(probs)[::-1]
        runner_up_c = int(sorted_indices[1])
        runner_up_conf = float(probs[runner_up_c] * 100.0)
        
        # Robustness Assessment
        is_fake = not case["authenticity_tag"].startswith("REAL")
        entropy = -sum(p * math.log(max(p, 1e-9)) for p in probs)
        
        if is_fake:
            if conf < 70.0 or entropy > 1.2:
                model_behavior = "Softened Confidence (Flagged High Uncertainty / Entropy)"
            else:
                model_behavior = f"Dominant Signal Preempted Noise ({classes[pred_c]})"
        else:
            model_behavior = f"Confident Real-world Diagnosis ({classes[pred_c]})"
            
        results.append({
            "test_id": case["test_id"],
            "location": case["location"],
            "country": case["country"],
            "authenticity_tag": case["authenticity_tag"],
            "is_dataset_fake": is_fake,
            "corruption_type": case["corruption_type"],
            # Input telemetry:
            "temp_max_forecast_7d": case["temp_max"],
            "temp_night_min_7d": case["temp_min"],
            "rh_avg_forecast_7d": case["rh"],
            "vpd_kpa": case["vpd"],
            "soil_moisture_vol_pct": case["sm"],
            "consecutive_hot_days": case["hot_days"],
            "crop_gdd_accumulated": case["gdd"],
            "rainfall_3d_sum_mm": case["rain_3d"],
            "soil_clay_pct": case["clay"],
            "soil_ec_ds_m": case["ec"],
            "soil_ph": case["ph"],
            # Predictions:
            "predicted_class_id": pred_c,
            "predicted_stress_name": classes[pred_c],
            "confidence_pct": round(conf, 2),
            "runner_up_stress_name": classes[runner_up_c],
            "runner_up_conf_pct": round(runner_up_conf, 2),
            "shannon_entropy": round(entropy, 3),
            "model_robustness_behavior": model_behavior,
            # Probability breakdown:
            "prob_optimal_pct": round(float(probs[0]) * 100.0, 2),
            "prob_heat_pct": round(float(probs[1]) * 100.0, 2),
            "prob_drought_pct": round(float(probs[2]) * 100.0, 2),
            "prob_compound_pct": round(float(probs[3]) * 100.0, 2),
            "prob_flooding_pct": round(float(probs[4]) * 100.0, 2),
            "prob_frost_pct": round(float(probs[5]) * 100.0, 2),
            "prob_salinity_pct": round(float(probs[6]) * 100.0, 2)
        })
        
    df_eval = pd.DataFrame(results)
    
    # 3. Print Executive Diagnostic Report
    print(f"\n[EVALUATION COMPLETE] Processed {len(df_eval)} Cases across {df_eval['location'].nunique()} Distinct Global/Domestic Regions\n")
    
    print("AUTHENTICITY COMPOSITION:")
    for tag, count in df_eval["authenticity_tag"].value_counts().items():
        is_f = "FAKE / SYNTHETIC NOISE" if not tag.startswith("REAL") else "REAL / PLAUSIBLE FIELD"
        print(f"  • {tag:35s}: {count:2d} cases ({count/len(df_eval)*100:5.1f}%) -> [{is_f}]")
        
    fake_mask = df_eval["is_dataset_fake"]
    print("\nCONFIDENCE COMPARISON (FAKE VS REAL):")
    print(f"  • FAKE / Corrupted / Contradictory Data (35 cases):")
    print(f"      - Mean Confidence:   {df_eval.loc[fake_mask, 'confidence_pct'].mean():.2f}%")
    print(f"      - Median Confidence: {df_eval.loc[fake_mask, 'confidence_pct'].median():.2f}%")
    print(f"      - Min Confidence:    {df_eval.loc[fake_mask, 'confidence_pct'].min():.2f}%")
    print(f"      - Mean Entropy:      {df_eval.loc[fake_mask, 'shannon_entropy'].mean():.3f}")
    print(f"  • REAL / Plausible Field Telemetry (15 cases):")
    print(f"      - Mean Confidence:   {df_eval.loc[~fake_mask, 'confidence_pct'].mean():.2f}%")
    print(f"      - Median Confidence: {df_eval.loc[~fake_mask, 'confidence_pct'].median():.2f}%")
    print(f"      - Min Confidence:    {df_eval.loc[~fake_mask, 'confidence_pct'].min():.2f}%")
    print(f"      - Mean Entropy:      {df_eval.loc[~fake_mask, 'shannon_entropy'].mean():.3f}")
    
    print("\nSAMPLE PREDICTIONS ACROSS EXTREME AND CORRUPTED TELEMETRY:")
    sample_ids = ["TEST_01", "TEST_03", "TEST_10", "TEST_11", "TEST_12", "TEST_14", "TEST_21", "TEST_31", "TEST_36", "TEST_40"]
    for sid in sample_ids:
        r = df_eval[df_eval["test_id"] == sid].iloc[0]
        f_str = "[FAKE]" if r["is_dataset_fake"] else "[REAL]"
        print(f"  {r['test_id']:7s} | {f_str:6s} {r['location']:22s} | Pred: {r['predicted_stress_name']:30s} | Conf: {r['confidence_pct']:5.2f}% | Top2: {r['runner_up_stress_name']:20s} ({r['runner_up_conf_pct']:4.1f}%) | {r['corruption_type']}")
        
    # 4. Save to CSV
    out_paths = [
        "data/model1_50_random_inaccurate_stress_tests.csv",
        "ps02-engine/data/model1_50_random_inaccurate_stress_tests.csv"
    ]
    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        df_eval.to_csv(p, index=False)
        print(f"\n[SAVED] Benchmark CSV exported to: {p}")
        
    return df_eval

if __name__ == "__main__":
    generate_and_evaluate_50_test_cases()
