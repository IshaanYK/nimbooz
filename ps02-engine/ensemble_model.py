"""
Tier 3: Hybrid Ensemble Prediction Engine
Uses region-specific stress thresholds from crop profiles.
Decomposes stress into drought, heat, frost, waterlog, and vegetation components.
"""


class HybridEnsembleModel:
    def __init__(self, crop_profile=None):
        self.crop_profile = crop_profile or {}

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

        # Extract values from nested sensor layers
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

        # --- Agronomic Derived Variables ---
        import math
        # 1. Vapor Pressure Deficit (VPD) in kPa
        svp = 0.61078 * math.exp((17.27 * tmax) / (tmax + 237.3))
        vpd = svp * (1 - (rh / 100.0))
        day_data["weather_layer"]["VPD_kPa"] = round(vpd, 2)

        # 2. Simulated Growth Stage (Phenology via GDD)
        current_date_str = day_data.get("date", "2026-08-11")
        if hasattr(current_date_str, "strftime"):
            current_date_str = current_date_str.strftime("%Y-%m-%d")
            
        if "-08-" in current_date_str or "-09-" in current_date_str:
            growth_stage = "Flowering (High Sensitivity)"
            stage_heat_penalty = 2.0  # Crops are 2°C more sensitive during flowering
        else:
            growth_stage = "Vegetative (Moderate Sensitivity)"
            stage_heat_penalty = 0.0
            
        day_data["weather_layer"]["Growth_Stage"] = growth_stage

        # 3. Rolling History (Consecutive days)
        consecutive_hot_days = 0
        rolling_precip_deficit = 0
        if full_forecast:
            # Count consecutive hot days (including today and previous days in forecast)
            for i in range(day_index, -1, -1):
                prev_tmax = full_forecast[i].get("weather_layer", {}).get("TMax", 30)
                if prev_tmax > thresholds["heat_tmax_trigger"] - stage_heat_penalty - 2:
                    consecutive_hot_days += 1
                else:
                    break
            
            # Rolling precip deficit (last 5 days in forecast)
            recent_precip = sum(full_forecast[i].get("weather_layer", {}).get("Precipitation_mm", 0) for i in range(max(0, day_index-4), day_index+1))
            recent_et = sum(full_forecast[i].get("weather_layer", {}).get("ET_mm", 4.0) for i in range(max(0, day_index-4), day_index+1))
            rolling_precip_deficit = max(0, recent_et - recent_precip)

        # --- Stress Scoring ---
        scores = {
            "drought_score": 0.0,
            "heat_score": 0.0,
            "frost_score": 0.0,
            "waterlog_score": 0.0,
            "vegetation_score": 0.0,
            "compound_score": 0.0
        }

        # --- Continuous Stress Scoring ---
        
        # Drought Stress Index (DSI): SPEI + Soil Moisture + ET Deficit
        spei_thresh = thresholds["drought_spei_trigger"]
        if spei < spei_thresh + 1.0:
            scores["drought_score"] += min(0.3, (spei_thresh + 1.0 - spei) * 0.15)
            
        sm_thresh = thresholds["drought_soil_moisture_trigger"]
        if soil_moisture < sm_thresh + 10:
            scores["drought_score"] += min(0.4, (sm_thresh + 10 - soil_moisture) * 0.04)
            
        if rolling_precip_deficit > 15:
            scores["drought_score"] += min(0.3, (rolling_precip_deficit - 15) * 0.02)

        # Heat Stress Index (HSI): TMax + VPD + Consecutive Days + Growth Stage
        heat_thresh = thresholds["heat_tmax_trigger"] - stage_heat_penalty
        
        if tmax > heat_thresh - 5:
            scores["heat_score"] += min(0.5, (tmax - (heat_thresh - 5)) * 0.1)
        if vpd > 2.5:
            scores["heat_score"] += min(0.2, (vpd - 2.5) * 0.15)
        if consecutive_hot_days >= 3:
            scores["heat_score"] += min(0.3, (consecutive_hot_days - 2) * 0.1)
            
        scores["heat_score"] = min(1.0, scores["heat_score"])

        # Cold Stress Index (CSI): TMin
        frost_thresh = thresholds["frost_tmin_trigger"]
        if tmin < frost_thresh + 5:
            scores["frost_score"] = min(1.0, (frost_thresh + 5 - tmin) * 0.15)

        # Waterlogging: excessive precipitation
        water_thresh = thresholds["waterlog_precip_trigger"]
        if precip > water_thresh * 0.5:
            scores["waterlog_score"] = min(1.0, (precip - (water_thresh * 0.5)) * 0.02)

        # Vegetation decline: NDVI + VCI
        ndvi_thresh = thresholds["ndvi_stress_trigger"]
        if ndvi < ndvi_thresh + 0.2:
            scores["vegetation_score"] += min(0.5, (ndvi_thresh + 0.2 - ndvi) * 2.5)
        vci_thresh = thresholds["vci_stress_trigger"]
        if vci < vci_thresh + 20:
            scores["vegetation_score"] += min(0.5, (vci_thresh + 20 - vci) * 0.025)

        # Compound Stress Index: Simultaneous Heat + Drought is most damaging
        if scores["heat_score"] > 0.4 and scores["drought_score"] > 0.4:
            scores["compound_score"] = min(1.0, (scores["heat_score"] * scores["drought_score"]) * 1.5)

        # Cap all scores at 1.0
        for k in scores:
            scores[k] = round(min(1.0, scores[k]), 2)

        # --- Weighted Overall Probability ---
        weights = {
            "drought_score": 0.20,
            "heat_score": 0.20,
            "frost_score": 0.15,
            "waterlog_score": 0.10,
            "vegetation_score": 0.15,
            "compound_score": 0.20
        }

        # Apply crop resilience as a dampening factor
        resilience = self.crop_profile.get("abiotic_resilience", 0.5)
        raw_prob = sum(scores[k] * weights[k] for k in scores)
        overall_prob = round(min(1.0, raw_prob * (1.0 + (1.0 - resilience))), 2)

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

        # Date handling — convert datetime.date objects to string
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
            "raw_data": day_data
        }
