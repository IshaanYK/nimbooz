"""
Tier 5: Gemini XAI Alert Engine — Region-Aware, Multi-Factor
Generates plain-language alerts with specific Syngenta product recommendations
based on the detected stress type, sensor layer, and region context.
"""


class GeminiAlertEngine:
    """
    Translates ensemble model output + product advisor recommendations
    into farmer-friendly, plain-language intervention alerts.
    """

    @staticmethod
    def generate_alert(crop_profile, region_info, analysis_results, product_recommendations):
        """
        Generates a comprehensive multi-factor alert.
        
        Args:
            crop_profile: dict with crop name, thresholds, etc.
            region_info: dict with region name, soil type, dominant stresses
            analysis_results: list of daily evaluation results from ensemble model
            product_recommendations: list of (day_index, recommendations) tuples
        """
        stress_days = [res for res in analysis_results if res.get("is_stressed")]
        crop_name = crop_profile.get("name", "Unknown Crop")
        region_name = region_info.get("name", "Unknown Region") if region_info else "Unknown Region"
        soil_type = region_info.get("soil_type", "Unknown") if region_info else "Unknown"

        # --- Build sensor detail cards (always use the most relevant day) ---
        target_day = stress_days[0] if stress_days else (analysis_results[0] if analysis_results else {})
        details = []
        breakdown = target_day.get("stress_breakdown", {})
        
        # Get crop thresholds for explainability
        thresh = crop_profile.get("stress_thresholds", {})
        
        # Weather factor
        weather = target_day.get("raw_data", {}).get("weather_layer", {})
        if weather:
            tmax = weather.get('TMax', 'N/A')
            hist_tmax = weather.get('Historical_TMax_Norm')
            anomaly_str = ""
            if hist_tmax and tmax != 'N/A' and tmax > hist_tmax + 2:
                anomaly_str = f"<br><span style='color: #e53e3e; font-weight: bold;'>⚠️ HISTORICAL ANOMALY: +{round(tmax - hist_tmax, 1)}°C above 30-year normal</span>"

            weather_detail = {
                "factor": "🌡️ Weather",
                "readings": f"TMax: {tmax}°C | TMin: {weather.get('TMin', 'N/A')}°C | Precip: {weather.get('Precipitation_mm', 'N/A')}mm | ET: {weather.get('ET_mm', 'N/A')}mm<br><span style='color: #4a5568; font-size: 0.8em;'>🌱 Growth Stage: {weather.get('Growth_Stage', 'Vegetative')}</span>{anomaly_str}",
                "stress_score": round(breakdown.get("drought_score", 0) + breakdown.get("heat_score", 0) + breakdown.get("compound_score", 0), 2),
                "status": "⚠️ Stressed" if (breakdown.get("drought_score", 0) > 0.15 or breakdown.get("heat_score", 0) > 0.15) else "✅ Normal",
                "threshold_info": f"Critical if TMax > {thresh.get('heat_tmax_trigger', 38)}°C (adjusted by Growth Stage) or Precip > {thresh.get('waterlog_precip_trigger', 50)}mm"
            }
            details.append(weather_detail)

        # Satellite factor
        satellite = target_day.get("raw_data", {}).get("satellite_layer", {})
        if satellite:
            sat_detail = {
                "factor": "🛰️ Satellite",
                "readings": f"NDVI: {satellite.get('NDVI', 'N/A')} | NDWI: {satellite.get('NDWI', 'N/A')} | VCI: {satellite.get('VCI', 'N/A')}%",
                "stress_score": round(breakdown.get("vegetation_score", 0), 2),
                "status": "⚠️ Vegetation Distress" if breakdown.get("vegetation_score", 0) > 0.1 else "✅ Healthy",
                "threshold_info": f"Critical if NDVI < {thresh.get('ndvi_stress_trigger', 0.35)} or VCI < {thresh.get('vci_stress_trigger', 35)}%"
            }
            details.append(sat_detail)

        # Soil factor
        soil = target_day.get("raw_data", {}).get("soil_layer", {})
        if soil:
            soil_detail = {
                "factor": "🌱 Soil",
                "readings": f"Moisture: {soil.get('Soil_Moisture_Pct', 'N/A')}% | Type: {soil_type}",
                "stress_score": round(breakdown.get("drought_score", 0) * 0.5, 2),
                "status": "⚠️ Dry" if soil.get("Soil_Moisture_Pct", 50) < 20 else "✅ Adequate",
                "threshold_info": f"Critical if Moisture < {thresh.get('drought_soil_moisture_trigger', 15)}%"
            }
            details.append(soil_detail)

        if not stress_days:
            return {
                "severity": "clear",
                "title": "✅ ALL CLEAR",
                "summary": f"No significant climate stress detected for {crop_name} in {region_name} over the next 14 days.",
                "details": details,
                "product_cards": []
            }
        # --- Identify dominant stress ---
        first_stress = stress_days[0]
        stress_date = first_stress["date"]
        breakdown = first_stress.get("stress_breakdown", {})
        dominant = first_stress.get("dominant_stress_type", "drought")
        probability = first_stress.get("overall_stress_probability", first_stress.get("stress_probability", 0))
        
        # Forecast Uncertainty Quantification
        days_until_stress = first_stress.get("raw_data", {}).get("day", 0)
        if days_until_stress <= 2:
            confidence_level = "High Confidence (Near-term)"
            confidence_penalty = 1.0
        elif days_until_stress <= 7:
            confidence_level = "Moderate Confidence (Medium-term)"
            confidence_penalty = 0.8
        else:
            confidence_level = "Low Confidence (Seasonal)"
            confidence_penalty = 0.5
            
        probability = probability * confidence_penalty

        # Count total stress days
        num_stress_days = len(stress_days)

        # Severity classification
        if probability > 0.7:
            severity = "critical"
            severity_label = "🔴 CRITICAL"
        elif probability > 0.5:
            severity = "high"
            severity_label = "🟠 HIGH"
        else:
            severity = "moderate"
            severity_label = "🟡 MODERATE"

        # --- Stress description by type ---
        stress_descriptions = {
            "drought": f"Severe drought conditions detected. Soil moisture is critically low and SPEI indicates significant precipitation deficit.",
            "heat": f"Extreme heat stress predicted. Maximum temperatures will exceed the crop's thermal tolerance threshold.",
            "frost": f"Frost risk detected. Minimum temperatures are expected to drop below the crop's cold tolerance limit.",
            "waterlog": f"Waterlogging risk from excessive precipitation. Root oxygen deprivation may cause yield loss.",
            "vegetation_decline": f"Satellite indices show vegetation is already in distress. NDVI and VCI are below healthy thresholds."
        }

        # --- Build product cards from recommendations ---
        product_cards = []
        seen_products = set()

        for day_idx, recs in product_recommendations:
            for rec in recs:
                prod_key = rec.get("product_key", "")
                if prod_key in seen_products:
                    continue
                seen_products.add(prod_key)

                product_cards.append({
                    "product_name": rec.get("product_name", "Unknown"),
                    "category": rec.get("category", "Biostimulant"),
                    "dosage": rec.get("dosage", "N/A"),
                    "timing": rec.get("timing_advice", "Apply before stress onset"),
                    "rationale": rec.get("rationale", ""),
                    "priority": rec.get("priority", 3),
                    "trigger_description": rec.get("trigger_description", ""),
                })

        product_cards.sort(key=lambda x: x["priority"])

        # --- Find best spray window ---
        pre_stress = [r for r in analysis_results if r["date"] < stress_date]
        safe_spray = [r for r in pre_stress if r.get("safe_to_spray")]
        spray_advice = ""
        if safe_spray:
            best = safe_spray[-1]
            dt = best.get("raw_data", {}).get("weather_layer", {}).get("Delta_T", "N/A")
            spray_advice = f"Best spray window: {best['date']} (Delta-T: {dt}°C, low drift risk)"
        else:
            spray_advice = "⚠️ No ideal spray window before stress onset. Apply with caution."

        return {
            "severity": severity,
            "title": f"{severity_label} CLIMATE STRESS ALERT",
            "summary": f"{num_stress_days} stress day(s) predicted for {crop_name} in {region_name} starting {stress_date}. Forecast Reliability: {confidence_level}.",
            "dominant_stress": dominant.replace("_", " ").title(),
            "stress_description": stress_descriptions.get(dominant, "Climate stress detected."),
            "probability": round(probability, 2),
            "spray_advice": spray_advice,
            "details": details,
            "product_cards": product_cards
        }


if __name__ == "__main__":
    pass
