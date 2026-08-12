"""
Tier 3: Hybrid Ensemble Prediction Engine
Uses region-specific stress thresholds from crop profiles.
Decomposes stress into drought, heat, frost, waterlog, and vegetation components.
Upgraded to Moonshot level: True GDD, ML Risk Scorer, and SHAP Explainability.
"""
import math
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
import shap

class HybridEnsembleModel:
    def __init__(self, crop_profile=None):
        self.crop_profile = crop_profile or {}
        
        # Initialize a lightweight Gradient Boosting model for the ML Scorer
        self.ml_model = GradientBoostingRegressor(n_estimators=50, random_state=42)
        
        # Train it on a quick synthetic baseline so it can be used immediately (hackathon MVP)
        # Features: [heat, drought, frost, waterlog, vegetation, compound]
        X_train = np.array([
            [0.1, 0.1, 0.0, 0.0, 0.1, 0.0],  # Low stress
            [0.8, 0.2, 0.0, 0.0, 0.2, 0.0],  # High heat
            [0.2, 0.9, 0.0, 0.0, 0.4, 0.0],  # High drought
            [0.9, 0.9, 0.0, 0.0, 0.5, 0.8],  # Severe compound
            [0.0, 0.0, 0.8, 0.0, 0.2, 0.0],  # Frost
            [0.0, 0.0, 0.0, 0.9, 0.1, 0.0],  # Waterlog
        ])
        y_train = np.array([0.1, 0.75, 0.80, 0.95, 0.70, 0.65])
        self.ml_model.fit(X_train, y_train)
        
        # Initialize SHAP explainer
        self.explainer = shap.TreeExplainer(self.ml_model)

    def evaluate_day(self, day_data, full_forecast=None, day_index=0):
        """
        Evaluates stress conditions for a single day based on region-specific thresholds.
        Accepts nested day_data format from DataIngestionEngine.
        """
        thresholds = self.crop_profile.get("stress_thresholds", {
            "heat_tmax_trigger": 38,
            "frost_tmin_trigger": 4,
            "drought_spei_trigger": -1.5,
            "drought_soil_moisture_trigger": 15,
            "waterlog_precip_trigger": 50,
            "ndvi_stress_trigger": 0.35,
            "vci_stress_trigger": 35
        })
        
        phenology = self.crop_profile.get("phenology", {
            "t_base": 10,
            "gdd_flowering": 1200,
            "crop_Kc": 1.0
        })

        weather = day_data.get("weather_layer", {})
        satellite = day_data.get("satellite_layer", {})
        soil = day_data.get("soil_layer", {})

        tmax = weather.get("TMax", 30)
        tmin = weather.get("TMin", tmax - 8)
        rh = weather.get("RH_percent", 55)
        wind = weather.get("Wind_kmh", 8)
        precip = weather.get("Precipitation_mm", 0)
        spei = weather.get("SPEI", 0)
        delta_t = weather.get("Delta_T", 5)
        et_mm = weather.get("ET_mm", 4.0)

        ndvi = satellite.get("NDVI", 0.6)
        ndwi = satellite.get("NDWI", 0.3)
        vci = satellite.get("VCI", 60)

        soil_moisture = soil.get("Soil_Moisture_Pct", 35)

        # --- 1. Vapor Pressure Deficit (VPD) in kPa ---
        svp = 0.61078 * math.exp((17.27 * tmax) / (tmax + 237.3))
        vpd = svp * (1 - (rh / 100.0))
        day_data["weather_layer"]["VPD_kPa"] = round(vpd, 2)

        # --- 2. True GDD Crop Phenology ---
        # Accumulate GDD over the forecast up to this day (plus a synthetic baseline for MVP)
        accumulated_gdd = 1000  # Assume we are late in the season for the demo
        if full_forecast:
            for i in range(0, day_index + 1):
                f_tmax = full_forecast[i].get("weather_layer", {}).get("TMax", 30)
                f_tmin = full_forecast[i].get("weather_layer", {}).get("TMin", f_tmax - 8)
                daily_gdd = max(0, ((f_tmax + f_tmin) / 2.0) - phenology["t_base"])
                accumulated_gdd += daily_gdd
        
        day_data["weather_layer"]["GDD_Accumulated"] = round(accumulated_gdd, 1)

        if accumulated_gdd > phenology["gdd_flowering"]:
            growth_stage = "Flowering (High Sensitivity)"
            stage_heat_penalty = 2.0  # Crops are 2°C more sensitive during flowering
        else:
            growth_stage = "Vegetative (Moderate Sensitivity)"
            stage_heat_penalty = 0.0
            
        day_data["weather_layer"]["Growth_Stage"] = growth_stage

        # --- 3. Rolling History (Consecutive days, Precip Deficit, Temp Drop) ---
        consecutive_hot_days = 0
        rolling_precip_deficit = 0
        rate_of_temp_drop = 0
        
        if full_forecast:
            # Heatwave tracking
            for i in range(day_index, -1, -1):
                prev_tmax = full_forecast[i].get("weather_layer", {}).get("TMax", 30)
                if prev_tmax > thresholds["heat_tmax_trigger"] - stage_heat_penalty - 2:
                    consecutive_hot_days += 1
                else:
                    break
            
            # Rolling precip deficit using crop_Kc
            recent_precip = sum(full_forecast[i].get("weather_layer", {}).get("Precipitation_mm", 0) for i in range(max(0, day_index-4), day_index+1))
            recent_et = sum(full_forecast[i].get("weather_layer", {}).get("ET_mm", 4.0) for i in range(max(0, day_index-4), day_index+1))
            crop_et_demand = recent_et * phenology["crop_Kc"]
            rolling_precip_deficit = max(0, crop_et_demand - recent_precip)
            
            # Rate of temperature drop for Cold Stress
            if day_index > 0:
                yesterday_tmin = full_forecast[day_index-1].get("weather_layer", {}).get("TMin", tmin)
                rate_of_temp_drop = max(0, yesterday_tmin - tmin)

        # --- 4. Continuous Stress Scoring (Mechanistic Layer) ---
        scores = {
            "heat_score": 0.0,
            "drought_score": 0.0,
            "frost_score": 0.0,
            "waterlog_score": 0.0,
            "vegetation_score": 0.0,
            "compound_score": 0.0
        }
        
        # Heat Stress Index (HSI): TMax + VPD + Consecutive Days + TMin (Night recovery)
        heat_thresh = thresholds["heat_tmax_trigger"] - stage_heat_penalty
        if tmax > heat_thresh - 5:
            scores["heat_score"] += (tmax - (heat_thresh - 5)) * 0.1
        if vpd > 2.5:
            scores["heat_score"] += (vpd - 2.5) * 0.15
        if consecutive_hot_days >= 3:
            scores["heat_score"] += (consecutive_hot_days - 2) * 0.1
        if tmin > 24: # High night temperature prevents recovery
            scores["heat_score"] += (tmin - 24) * 0.05

        # Drought Stress Index (DSI): SPEI + Soil Moisture + crop_Kc ET Deficit
        spei_thresh = thresholds["drought_spei_trigger"]
        if spei < spei_thresh + 1.0:
            scores["drought_score"] += (spei_thresh + 1.0 - spei) * 0.15
        sm_thresh = thresholds["drought_soil_moisture_trigger"]
        if soil_moisture < sm_thresh + 10:
            scores["drought_score"] += (sm_thresh + 10 - soil_moisture) * 0.04
        if rolling_precip_deficit > 10:
            scores["drought_score"] += (rolling_precip_deficit - 10) * 0.02

        # Cold Stress Index (CSI): TMin + Rate of Temp Drop
        frost_thresh = thresholds["frost_tmin_trigger"]
        if tmin < frost_thresh + 5:
            scores["frost_score"] += (frost_thresh + 5 - tmin) * 0.15
        if rate_of_temp_drop > 5: # Sudden 5 degree drop
            scores["frost_score"] += (rate_of_temp_drop - 5) * 0.05

        # Waterlogging: excessive precipitation
        water_thresh = thresholds["waterlog_precip_trigger"]
        if precip > water_thresh * 0.5:
            scores["waterlog_score"] += (precip - (water_thresh * 0.5)) * 0.02

        # Vegetation decline: NDVI + VCI
        ndvi_thresh = thresholds["ndvi_stress_trigger"]
        if ndvi < ndvi_thresh + 0.2:
            scores["vegetation_score"] += (ndvi_thresh + 0.2 - ndvi) * 2.5
        vci_thresh = thresholds["vci_stress_trigger"]
        if vci < vci_thresh + 20:
            scores["vegetation_score"] += (vci_thresh + 20 - vci) * 0.025

        # Compound Stress Index: Simultaneous Heat + Drought
        if scores["heat_score"] > 0.4 and scores["drought_score"] > 0.4:
            scores["compound_score"] = (scores["heat_score"] * scores["drought_score"]) * 1.5

        # Cap all scores at 1.0
        for k in scores:
            scores[k] = round(min(1.0, float(scores[k])), 2)

        # --- 5. Gradient-Boosted ML Scorer & SHAP Explainability ---
        feature_names = ["Heat", "Drought", "Frost", "Waterlog", "Vegetation", "Compound"]
        feature_values = np.array([[
            scores["heat_score"],
            scores["drought_score"],
            scores["frost_score"],
            scores["waterlog_score"],
            scores["vegetation_score"],
            scores["compound_score"]
        ]])
        
        # Predict probability
        raw_prob = self.ml_model.predict(feature_values)[0]
        
        # Apply crop resilience as a dampening factor
        resilience = self.crop_profile.get("abiotic_resilience", 0.5)
        overall_prob = round(min(1.0, max(0.0, float(raw_prob * (1.0 + (1.0 - resilience))))), 2)

        # Generate SHAP explanations
        shap_values = self.explainer.shap_values(feature_values)[0]
        
        shap_explanations = []
        for i, feat in enumerate(feature_names):
            if abs(shap_values[i]) > 0.01: # Only include significant drivers
                direction = "+" if shap_values[i] > 0 else "-"
                impact = round(abs(shap_values[i]) * 100, 1)
                shap_explanations.append({
                    "factor": feat,
                    "contribution": f"{direction}{impact}%"
                })
        
        # Sort by biggest impact
        shap_explanations.sort(key=lambda x: float(x["contribution"].replace("+", "").replace("-", "").replace("%", "")), reverse=True)

        # Dominant stress type
        if any(v > 0 for v in scores.values()):
            dominant = max(scores.items(), key=lambda x: x[1])
            dominant_type = dominant[0].replace("_score", "")
        else:
            dominant_type = "Normal"

        is_stressed = overall_prob > 0.35

        # BRS (Biological Readiness Score) — Spray Safety Gate
        safe_to_spray = True
        if delta_t < 2.0 or delta_t > 8.0:
            safe_to_spray = False
        if wind > 15:
            safe_to_spray = False
        if precip > 10:
            safe_to_spray = False

        # Date handling
        date_val = day_data.get("date", "unknown")
        if hasattr(date_val, "strftime"):
            date_val = date_val.strftime("%Y-%m-%d")

        return {
            "date": date_val,
            "overall_stress_probability": overall_prob,
            "is_stressed": is_stressed,
            "safe_to_spray": safe_to_spray,
            "stress_breakdown": scores,
            "dominant_stress_type": dominant_type,
            "shap_explanations": shap_explanations,
            "raw_data": day_data
        }
