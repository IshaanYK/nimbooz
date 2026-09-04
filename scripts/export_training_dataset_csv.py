"""
Export Full Training Dataset for AASRA Model 1 (7-Class Climate Stress Early Warning Classifier)
Outputs:
- data/model1_climate_stress_training_dataset_50k.csv
- ps02-engine/data/model1_climate_stress_training_dataset_50k.csv
Samples: 50,000 rows
Features: 11 exact biophysical inputs + target stress_class + stress_label + regional metadata.
"""

import os
import math
import numpy as np
import pandas as pd

def generate_full_50k_training_dataset(n_samples=50000, random_seed=42):
    np.random.seed(random_seed)
    
    regions = [
        {"name": "Latur", "state": "Maharashtra, India", "code": 101, "climate": "semi_arid", "clay": 48.0, "base_ec": 0.8, "base_ph": 7.8},
        {"name": "Jalna", "state": "Maharashtra, India", "code": 102, "climate": "semi_arid", "clay": 45.0, "base_ec": 0.9, "base_ph": 8.1},
        {"name": "Kasganj", "state": "Uttar Pradesh, India", "code": 201, "climate": "sub_humid", "clay": 24.0, "base_ec": 1.2, "base_ph": 7.6},
        {"name": "Ludhiana", "state": "Punjab, India", "code": 301, "climate": "semi_arid_north", "clay": 20.0, "base_ec": 0.7, "base_ph": 7.4},
        {"name": "Kutch", "state": "Gujarat, India", "code": 501, "climate": "saline_arid", "clay": 32.0, "base_ec": 4.8, "base_ph": 8.6},
        {"name": "Patna", "state": "Bihar, India", "code": 601, "climate": "flood_plains", "clay": 42.0, "base_ec": 0.6, "base_ph": 7.3},
        {"name": "Chennai", "state": "Tamil Nadu, India", "code": 701, "climate": "tropical_wet_dry", "clay": 28.0, "base_ec": 1.5, "base_ph": 7.2},
        {"name": "Kangra", "state": "Himachal Pradesh, India", "code": 801, "climate": "temperate_montane", "clay": 18.0, "base_ec": 0.4, "base_ph": 6.2},
        {"name": "Iowa", "state": "Midwest, USA", "code": 901, "climate": "humid_continental", "clay": 26.0, "base_ec": 0.5, "base_ph": 6.8},
        {"name": "Mato Grosso", "state": "Cerrado, Brazil", "code": 902, "climate": "tropical_savanna", "clay": 38.0, "base_ec": 0.4, "base_ph": 5.8}
    ]
    
    records = []
    samples_per_region = n_samples // len(regions)
    sample_counter = 1
    
    stress_labels = {
        0: "Optimal",
        1: "Heat Stress",
        2: "Drought Stress",
        3: "Compound Stress (Heat+Drought)",
        4: "Flooding / Waterlogging",
        5: "Frost / Cold Stress",
        6: "Salinity Stress"
    }
    
    for reg in regions:
        for _ in range(samples_per_region):
            # Season: 0=Kharif / Monsoon / Wet, 1=Rabi / Winter / Cool, 2=Zaid / Summer / Dry
            season_id = np.random.choice([0, 1, 2], p=[0.50, 0.35, 0.15])
            season_names = {0: "Kharif/Wet", 1: "Rabi/Winter", 2: "Zaid/Summer"}
            das = int(np.random.randint(10, 120))
            
            # Regional weather generation
            if reg["climate"] == "temperate_montane": # Himachal Pradesh
                if season_id == 1:
                    temp_max = float(np.random.normal(9.0, 4.0))
                    temp_night_min = float(temp_max - np.random.uniform(7.0, 12.0))
                    rainfall_3d = float(np.random.exponential(scale=5.0))
                else:
                    temp_max = float(np.random.normal(24.0, 4.0))
                    temp_night_min = float(temp_max - np.random.uniform(6.0, 10.0))
                    rainfall_3d = float(np.random.exponential(scale=18.0))
            elif reg["climate"] == "tropical_wet_dry": # Chennai
                if season_id == 2:
                    temp_max = float(np.random.normal(39.5, 3.0))
                    temp_night_min = float(temp_max - np.random.uniform(7.0, 10.0))
                    rainfall_3d = float(np.random.exponential(scale=4.0))
                else:
                    temp_max = float(np.random.normal(32.0, 3.5))
                    temp_night_min = float(temp_max - np.random.uniform(5.0, 8.0))
                    rainfall_3d = float(np.random.exponential(scale=28.0))
            else:
                if season_id == 1: # Winter
                    temp_max = float(np.random.normal(21.0, 5.0))
                    temp_night_min = float(temp_max - np.random.uniform(9.0, 16.0))
                    rainfall_3d = float(np.random.exponential(scale=3.0))
                elif season_id == 2: # Summer
                    temp_max = float(np.random.normal(41.0, 4.0))
                    temp_night_min = float(temp_max - np.random.uniform(8.0, 13.0))
                    rainfall_3d = float(np.random.exponential(scale=1.5))
                else: # Monsoon / Wet
                    temp_max = float(np.random.normal(32.5, 4.5))
                    temp_night_min = float(temp_max - np.random.uniform(5.0, 10.0))
                    rainfall_3d = float(np.random.exponential(scale=22.0))
                    
            temp_max = float(np.clip(temp_max, 4.0, 49.0))
            temp_night_min = float(np.clip(temp_night_min, -3.0, 32.0))
            
            # Relative humidity
            if season_id == 1:
                rh_avg = float(np.random.uniform(45.0, 95.0))
            elif season_id == 2:
                rh_avg = float(np.random.uniform(14.0, 48.0))
            else:
                rh_avg = float(np.random.uniform(58.0, 98.0))
                
            # VPD (Tetens equation)
            svp = 0.61078 * math.exp((17.27 * max(temp_max, 1.0)) / (max(temp_max, 1.0) + 237.3))
            vpd_kpa = float(np.clip(svp * (1.0 - (rh_avg / 100.0)), 0.2, 5.8))
            
            # Soil profile
            soil_clay = float(np.clip(reg["clay"] + np.random.normal(0, 3.5), 10.0, 65.0))
            soil_ec = float(np.clip(reg["base_ec"] + np.random.exponential(scale=1.0), 0.2, 11.5))
            soil_ph = float(np.clip(reg["base_ph"] + np.random.normal(0, 0.35), 5.2, 9.4))
            
            # Soil moisture
            if rainfall_3d > 75.0:
                soil_moisture = float(np.random.uniform(42.0, 56.0))
            elif rainfall_3d > 25.0:
                soil_moisture = float(np.random.uniform(32.0, 45.0))
            else:
                soil_moisture = float(np.random.beta(a=2.5, b=3.5) * 38.0 + 8.0)
            soil_moisture = float(np.clip(soil_moisture, 8.0, 58.0))
            
            # Consecutive hot days
            if temp_max > 38.0:
                consecutive_hot_days = int(np.random.geometric(p=0.25))
            elif temp_max > 35.0:
                consecutive_hot_days = int(np.random.geometric(p=0.45))
            else:
                consecutive_hot_days = 0
            consecutive_hot_days = min(consecutive_hot_days, 14)
            
            # GDD
            crop_gdd = float(das * max(0.0, ((temp_max + temp_night_min)/2.0 - 10.0)))
            crop_gdd = float(np.clip(crop_gdd, 40.0, 2500.0))
            
            # Biological continuous transition curves (soft margins)
            # 1. Thermal stress logistic response curve (T50 = 38.0 C, transition width = 0.8 C)
            p_heat_raw = 1.0 / (1.0 + math.exp(-max(-20.0, min(20.0, (temp_max - 38.0) / 0.85))))
            if temp_max >= 35.5 and temp_night_min >= 24.0 and consecutive_hot_days >= 3:
                p_night_boost = 1.0 / (1.0 + math.exp(-max(-20.0, min(20.0, (temp_night_min - 24.0) / 1.0))))
                p_heat_raw = max(p_heat_raw, 0.55 + 0.35 * p_night_boost)
            
            # 2. Moisture deficit logistic response curve (SM50 = 19.5%, transition width = 1.4%)
            p_drought_raw = 1.0 / (1.0 + math.exp(-max(-20.0, min(20.0, (19.5 - soil_moisture) / 1.4))))
            if vpd_kpa >= 2.8:
                p_vpd_boost = 1.0 / (1.0 + math.exp(-max(-20.0, min(20.0, (23.5 - soil_moisture) / 1.4))))
                p_drought_raw = max(p_drought_raw, 0.50 * p_vpd_boost + 0.40 * (vpd_kpa / 5.0))
                
            # 3. Cold / Frost stress response curve (Tmin50 = 3.5 C)
            p_frost_raw = 1.0 / (1.0 + math.exp(-max(-20.0, min(20.0, (3.5 - temp_night_min) / 0.8))))
            if temp_max <= 12.0 and temp_night_min <= 5.0:
                p_frost_raw = max(p_frost_raw, 0.75)
                
            # 4. Flooding / Waterlogging response curve
            p_flooding_raw = 0.0
            if rainfall_3d >= 60.0 and soil_moisture >= 38.0:
                p_rain = 1.0 / (1.0 + math.exp(-max(-20.0, min(20.0, (rainfall_3d - 80.0) / 12.0))))
                p_sm = 1.0 / (1.0 + math.exp(-max(-20.0, min(20.0, (soil_moisture - 42.0) / 2.5))))
                p_flooding_raw = max(p_flooding_raw, p_rain * p_sm)
            if soil_moisture >= 45.0 and soil_clay >= 38.0:
                p_clay_sat = 1.0 / (1.0 + math.exp(-max(-20.0, min(20.0, (soil_moisture - 48.0) / 1.8))))
                p_flooding_raw = max(p_flooding_raw, p_clay_sat)
                
            # 5. Salinity osmotic stress response curve (EC50 = 3.8 dS/m)
            p_salinity_raw = 1.0 / (1.0 + math.exp(-max(-20.0, min(20.0, (soil_ec - 3.8) / 0.6))))
            if soil_ec >= 2.5 and soil_ph >= 8.3:
                p_salinity_raw = max(p_salinity_raw, 0.70)
                
            # Sample stress flags according to biophysical probabilities (simulating crop varietal variance)
            is_frost = np.random.rand() < p_frost_raw
            is_flooding = np.random.rand() < p_flooding_raw
            is_salinity = np.random.rand() < p_salinity_raw
            is_heat = np.random.rand() < p_heat_raw
            is_drought = np.random.rand() < p_drought_raw
            
            # 3% biological transition stochasticity (varietal resilience / microclimate buffering)
            if np.random.rand() < 0.035:
                # Occasional varietal tolerance attenuating stress or minor unmeasured factor inducing stress
                if is_heat and np.random.rand() < 0.5:
                    is_heat = False
                if is_drought and np.random.rand() < 0.5:
                    is_drought = False
            
            # Hierarchical stress classification
            if is_frost:
                stress_class = 5
            elif is_flooding:
                stress_class = 4
            elif is_salinity and not (is_heat and is_drought):
                stress_class = 6
            elif is_heat and is_drought:
                stress_class = 3
            elif is_heat:
                stress_class = 1
            elif is_drought:
                stress_class = 2
            elif is_salinity:
                stress_class = 6
            else:
                stress_class = 0
                
            # Add realistic sensor telemetry measurement jitter (aleatoric telemetry noise)
            s_temp_max = temp_max + float(np.random.normal(0, 0.25))
            s_temp_min = temp_night_min + float(np.random.normal(0, 0.25))
            s_rh = np.clip(rh_avg + float(np.random.normal(0, 1.2)), 5.0, 100.0)
            s_sm = np.clip(soil_moisture + float(np.random.normal(0, 0.6)), 5.0, 60.0)
            s_vpd = np.clip(vpd_kpa + float(np.random.normal(0, 0.05)), 0.1, 6.5)
            s_rain = max(0.0, rainfall_3d + float(np.random.normal(0, 0.8)) if rainfall_3d > 0 else 0.0)
            s_ec = max(0.1, soil_ec + float(np.random.normal(0, 0.08)))
            s_ph = np.clip(soil_ph + float(np.random.normal(0, 0.04)), 4.5, 9.8)
            s_clay = np.clip(soil_clay + float(np.random.normal(0, 0.5)), 8.0, 70.0)
            s_gdd = max(10.0, crop_gdd + float(np.random.normal(0, 4.0)))
                
            records.append({
                "sample_id": f"AASRA-TRN-{sample_counter:06d}",
                "region": reg["name"],
                "state_country": reg["state"],
                "season": season_names[season_id],
                # 11 biophysical features (with realistic sensor precision):
                "temp_max_forecast_7d": round(s_temp_max, 2),
                "temp_night_min_7d": round(s_temp_min, 2),
                "rh_avg_forecast_7d": round(s_rh, 2),
                "vpd_kpa": round(s_vpd, 2),
                "soil_moisture_vol_pct": round(s_sm, 2),
                "consecutive_hot_days": consecutive_hot_days,
                "crop_gdd_accumulated": round(s_gdd, 1),
                "rainfall_3d_sum_mm": round(s_rain, 2),
                "soil_clay_pct": round(s_clay, 1),
                "soil_ec_ds_m": round(s_ec, 2),
                "soil_ph": round(s_ph, 2),
                # targets:
                "stress_class": stress_class,
                "stress_label": stress_labels[stress_class]
            })
            sample_counter += 1
            
    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    print("Generating 50,000-sample AASRA Model 1 Training Dataset...")
    df = generate_full_50k_training_dataset(50000, random_seed=42)
    
    out_paths = [
        "d:/Projects/DriveF-Projects/hyperion/data/model1_climate_stress_training_dataset_50k.csv",
        "d:/Projects/DriveF-Projects/hyperion/ps02-engine/data/model1_climate_stress_training_dataset_50k.csv"
    ]
    
    for path in out_paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        df.to_csv(path, index=False)
        print(f"Successfully exported {len(df):,} records to: {path}")
        print(f"File size: {os.path.getsize(path) / (1024*1024):.2f} MB")
        
    print("\nClass Distribution:")
    print(df["stress_label"].value_counts())
    print("\nRegional Distribution:")
    print(df["region"].value_counts())
