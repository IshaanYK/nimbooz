import os
import joblib
import pandas as pd
import numpy as np

# Multilingual Farmer-Friendly Agronomic Translations
FARMER_TRANSLATIONS = {
    "en": {
        "status_safe": "🟢 SAFE TO SPRAY",
        "status_blocked": "🔴 DO NOT SPRAY (BLOCKED)",
        "wind_drift": "Wind is too strong ({ws:.1f} km/h). Spray will blow away from your crops into neighboring land.",
        "high_evap": "Air is too hot and dry (Delta-T {dt:.1f}°C). Spray droplets will evaporate before soaking in, risking leaf burn.",
        "high_humidity": "Air is too humid (Delta-T {dt:.1f}°C). Spray droplets cannot dry and will drip off the leaves into the mud.",
        "rain_risk": "High chance of rain ({rp:.0f}%). Rain will wash expensive chemicals off the leaves.",
        "dry_soil": "Soil is too dry ({sm:.1f}%). Thirsty plants have shut their pores and cannot absorb the spray. Irrigate first.",
        "optimal": "Perfect weather for spraying! Calm wind and open leaf pores ensure maximum absorption and zero waste.",
        "suboptimal": "Weather is safe, but absorption will be low. Consider waiting for the optimal window.",
        "best_window_prefix": "Recommended Spray Window",
        "no_window": "No safe spray window today. Please wait for better conditions.",
        "waste_label": "Chemical & labor waste prevented",
        "yield_label": "Crop yield protection value"
    },
    "hi": {
        "status_safe": "🟢 छिड़काव के लिए सुरक्षित (SAFE)",
        "status_blocked": "🔴 छिड़काव न करें (BLOCKED)",
        "wind_drift": "हवा बहुत तेज चल रही है ({ws:.1f} km/h)। दवा उड़कर दूसरे के खेत में चली जाएगी।",
        "high_evap": "मौसम बहुत गर्म और सूखा है (डेल्टा-T {dt:.1f}°C)। दवा पत्तों में समाने से पहले सूख जाएगी और पत्ते जल सकते हैं।",
        "high_humidity": "हवा में नमी बहुत अधिक है (डेल्टा-T {dt:.1f}°C)। दवा पत्तों पर टिकेगी नहीं और टपक कर जमीन पर गिर जाएगी।",
        "rain_risk": "बारिश की भारी संभावना है ({rp:.0f}%)। बारिश से महंगी दवा धुल जाएगी और पैसे बर्बाद होंगे।",
        "dry_soil": "जमीन में नमी बहुत कम है ({sm:.1f}%)। प्यास के कारण पत्तों के रोमछिद्र बंद हैं, पौधे दवा नहीं सोखेंगे। पहले सिंचाई करें।",
        "optimal": "छिड़काव के लिए सर्वोत्तम समय! हवा शांत है, पौधे पूरी दवा सोख लेंगे और पूरा फायदा मिलेगा।",
        "suboptimal": "मौसम ठीक है लेकिन दवा का असर कम होगा। बेहतर समय का इंतजार करें।",
        "best_window_prefix": "छिड़काव का सबसे उत्तम समय",
        "no_window": "आज छिड़काव के लिए कोई सुरक्षित समय नहीं है। कृपया कल तक रुकें।",
        "waste_label": "बर्बाद होने से बचाई गई लागत",
        "yield_label": "सुरक्षित फसल उपज का अनुमानित मूल्य"
    },
    "te": {
        "status_safe": "🟢 మందు పిచికారీకి అనుకూలం (SAFE)",
        "status_blocked": "🔴 మందు పిచికారీ చేయవద్దు (BLOCKED)",
        "wind_drift": "గాలి చాలా వేగంగా వీస్తోంది ({ws:.1f} km/h). మందు గాలికి కొట్టుకుపోయి పక్క పొలాల్లో పడుతుంది.",
        "high_evap": "వాతావరణం చాలా వేడిగా, పొడిగా ఉంది (డెల్టా-T {dt:.1f}°C). మందు ఆకులపై పడకముందే ఆవిరై ఆకులు మాడిపోవచ్చు.",
        "high_humidity": "తేమ చాలా ఎక్కువగా ఉంది (డెల్టా-T {dt:.1f}°C). మందు ఆకులపై నిలవకుండా నేలమీద కారిపోతుంది.",
        "rain_risk": "వర్షం పడే అవకాశం ఉంది ({rp:.0f}%). వర్షానికి ఖరీదైన మందు కొట్టుకుపోయి వృథా అవుతుంది.",
        "dry_soil": "నేలలో తేమ చాలా తక్కువగా ఉంది ({sm:.1f}%). చెట్లు దాహంతో ఉన్నాయి, మందును పీల్చుకోలేవు. ముందుగా నీరు పెట్టండి.",
        "optimal": "మందు పిచికారీ చేయడానికి సరైన సమయం! గాలి నెమ్మదిగా ఉంది, మందు పంటకు బాగా పడుతుంది.",
        "suboptimal": "వాతావరణం ఫర్వాలేదు కానీ మందు తక్కువగా పడుతుంది.",
        "best_window_prefix": "పిచికారీకి అత్యుత్తమ సమయం",
        "no_window": "ఈ రోజు మందు పిచికారీకి అనుకూలమైన సమయం లేదు.",
        "waste_label": "వృథా కాకుండా కాపాడిన ఖర్చు",
        "yield_label": "రక్షించబడిన పంట విలువ"
    },
    "pa": {
        "status_safe": "🟢 ਛਿੜਕਾਅ ਲਈ ਸੁਰੱਖਿਅਤ (SAFE)",
        "status_blocked": "🔴 ਛਿੜਕਾਅ ਨਾ ਕਰੋ (BLOCKED)",
        "wind_drift": "ਹਵਾ ਬਹੁਤ ਤੇਜ਼ ਚੱਲ ਰਹੀ ਹੈ ({ws:.1f} km/h)। ਦਵਾਈ ਉੱਡ ਕੇ ਗੁਆਂਢੀ ਦੇ ਖੇਤ ਵਿੱਚ ਚਲੀ ਜਾਵੇਗੀ।",
        "high_evap": "ਮੌਸਮ ਬਹੁਤ ਗਰਮ ਅਤੇ ਖੁਸ਼ਕ ਹੈ (ਡੈਲਟਾ-T {dt:.1f}°C)। ਦਵਾਈ ਪੱਤਿਆਂ ਵਿੱਚ ਜਜ਼ਬ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਉੱਡ ਜਾਵੇਗੀ, ਪੱਤੇ ਸੜ ਸਕਦੇ ਹਨ।",
        "high_humidity": "ਹਵਾ ਵਿੱਚ ਨਮੀ ਬਹੁਤ ਜ਼ਿਆਦਾ ਹੈ (ਡੈਲਟਾ-T {dt:.1f}°C)। ਦਵਾਈ ਪੱਤਿਆਂ 'ਤੇ ਨਹੀਂ ਟਿਕੇਗੀ ਅਤੇ ਜ਼ਮੀਨ 'ਤੇ ਡਿੱਗ ਜਾਵੇਗੀ।",
        "rain_risk": "ਮੀਂਹ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ ({rp:.0f}%)। ਮੀਂਹ ਨਾਲ ਮਹਿੰਗੀ ਦਵਾਈ ਧੁਲ ਕੇ ਬਰਬਾਦ ਹੋ ਜਾਵੇਗੀ।",
        "dry_soil": "ਜ਼ਮੀਨ ਵਿੱਚ ਸਿੱਲ੍ਹ ਬਹੁਤ ਘੱਟ ਹੈ ({sm:.1f}%)। ਪੌਦੇ ਪਿਆਸੇ ਹਨ ਅਤੇ ਦਵਾਈ ਨਹੀਂ ਚੂਸ ਸਕਣਗੇ। ਪਹਿਲਾਂ ਪਾਣੀ ਲਾਓ।",
        "optimal": "ਛਿੜਕਾਅ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ! ਹਵਾ ਸ਼ਾਂਤ ਹੈ, ਦਵਾਈ ਦਾ ਪੂਰਾ ਅਸਰ ਹੋਵੇਗਾ ਅਤੇ ਪੈਸੇ ਦੀ ਬੱਚਤ ਹੋਵੇਗੀ।",
        "suboptimal": "ਮੌਸਮ ਠੀਕ ਹੈ ਪਰ ਦਵਾਈ ਦਾ ਅਸਰ ਘੱਟ ਹੋਵੇਗਾ।",
        "best_window_prefix": "ਛਿੜਕਾਅ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ",
        "no_window": "ਅੱਜ ਛਿੜਕਾਅ ਲਈ ਕੋਈ ਸੁਰੱਖਿਅਤ ਸਮਾਂ ਨਹੀਂ ਹੈ।",
        "waste_label": "ਬਰਬਾਦ ਹੋਣ ਤੋਂ ਬਚਾਇਆ ਖਰਚਾ",
        "yield_label": "ਬਚਾਈ ਗਈ ਫਸਲ ਦੀ ਕੀਮਤ"
    }
}

class BiologicalReadinessEngine:
    """
    AASRA Model 2: Biological Intervention Readiness Engine
    Production-ready hybrid inference engine combining calibrated ML with 
    agronomic guardrails, 24-hour diurnal window ranking, Rupee ROI, and Multilingual Farmer Guidance.
    """
    def __init__(self, model_path_or_estimator):
        if isinstance(model_path_or_estimator, str):
            self.model = joblib.load(model_path_or_estimator)
        else:
            self.model = model_path_or_estimator

    @staticmethod
    def calculate_delta_t(temp_c, rh_pct):
        """
        Calculates Delta-T (Wet-Bulb Depression = T_dry - T_wet) in Celsius
        using Stull's psychrometric equation.
        """
        tw = (
            temp_c * np.arctan(0.151977 * np.sqrt(rh_pct + 8.313659))
            + np.arctan(temp_c + rh_pct)
            - np.arctan(rh_pct - 1.676331)
            + 0.00391838 * (rh_pct ** 1.5) * np.arctan(0.023101 * rh_pct)
            - 4.686035
        )
        return float(np.clip(temp_c - tw, 0.0, 18.0))

    def predict_readiness(self, X_df, lang="en"):
        """
        Inference on an input DataFrame.
        lang: 'en' (English), 'hi' (Hindi), 'te' (Telugu), 'pa' (Punjabi)
        """
        tr = FARMER_TRANSLATIONS.get(lang, FARMER_TRANSLATIONS["en"])
        
        feature_cols = [
            "soil_moisture_pct",
            "delta_t_celsius",
            "wind_speed_kmh",
            "rain_prob_next_48h",
            "crop_stage_sensitivity"
        ]
        X = X_df[feature_cols].copy()
        raw_probs = self.model.predict_proba(X)[:, 1]
        
        results = []
        for i, (_, row) in enumerate(X.iterrows()):
            prob = float(raw_probs[i])
            sm = float(row["soil_moisture_pct"])
            dt = float(row["delta_t_celsius"])
            ws = float(row["wind_speed_kmh"])
            rp = float(row["rain_prob_next_48h"])
            stage = float(row.get("crop_stage_sensitivity", 0.35))

            is_safe = True
            farmer_reasons = []

            # 1. Wind Speed Guardrail (> 15 km/h causes drift off-target)
            if ws > 15.0:
                prob = min(prob, 0.04)
                is_safe = False
                farmer_reasons.append(tr["wind_drift"].format(ws=ws))

            # 2. Delta-T Evaporation & Run-off Guardrails (Optimal 2°C - 8°C)
            if dt > 8.0:
                prob = min(prob, 0.03)
                is_safe = False
                farmer_reasons.append(tr["high_evap"].format(dt=dt))
            elif dt < 2.0:
                prob = min(prob, 0.06)
                is_safe = False
                farmer_reasons.append(tr["high_humidity"].format(dt=dt))

            # 3. Rain Probability Guardrail (> 40% causes chemical wash-off)
            if rp > 40.0:
                prob = min(prob, 0.08)
                is_safe = False
                farmer_reasons.append(tr["rain_risk"].format(rp=rp))

            # 4. Soil Moisture Guardrail (< 30% indicates severe drought stress)
            if sm < 30.0:
                prob = min(prob, 0.05)
                is_safe = False
                farmer_reasons.append(tr["dry_soil"].format(sm=sm))

            if is_safe and prob >= 0.45:
                farmer_reasons.append(tr["optimal"])
            elif is_safe and prob < 0.45:
                farmer_reasons.append(tr["suboptimal"])

            # Economic calculations
            cost_waste_inr = round(2200.0 + (stage * 800.0), 2) if not is_safe else 0.0
            avg_rev = float(row.get("avg_yield_rev_inr", 55000.0))
            yield_loss_protected_inr = round(avg_rev * (0.06 + 0.16 * stage), 2) if (is_safe and prob >= 0.45) else 0.0

            results.append({
                "readiness_score": round(prob, 3),
                "spray_window_safe": bool(is_safe and prob >= 0.45),
                "status_badge": tr["status_safe"] if (is_safe and prob >= 0.45) else tr["status_blocked"],
                "farmer_message": farmer_reasons[0],
                "delta_t": round(dt, 2),
                "wind_speed": round(ws, 2),
                "soil_moisture": round(sm, 2),
                "rain_prob": round(rp, 2),
                "cost_waste_inr": cost_waste_inr,
                "yield_loss_protected_inr": yield_loss_protected_inr,
                "economic_summary": f"{tr['waste_label']}: ₹{cost_waste_inr:,} / acre" if not is_safe else f"{tr['yield_label']}: ₹{yield_loss_protected_inr:,} / acre"
            })

        return results

    def recommend_daily_window(self, hourly_forecast_df, lang="en"):
        """
        Accepts 24 hours of forecast data and produces a simple farmer-friendly advisory.
        lang: 'en' (English), 'hi' (Hindi), 'te' (Telugu), 'pa' (Punjabi)
        """
        tr = FARMER_TRANSLATIONS.get(lang, FARMER_TRANSLATIONS["en"])
        df = hourly_forecast_df.copy().reset_index(drop=True)
        if "hour" not in df.columns:
            df["hour"] = pd.to_datetime(df["date"]).dt.hour

        preds = self.predict_readiness(df, lang=lang)
        df["readiness_score"] = [p["readiness_score"] for p in preds]
        df["spray_safe"] = [p["spray_window_safe"] for p in preds]
        df["farmer_message"] = [p["farmer_message"] for p in preds]
        df["status_badge"] = [p["status_badge"] for p in preds]

        safe_hours = df[df["spray_safe"] == True]
        best_window = tr["no_window"]
        recommended_hours = []

        if len(safe_hours) > 0:
            best_hour = safe_hours.sort_values("readiness_score", ascending=False).iloc[0]["hour"]
            start_h = max(0, int(best_hour) - 1)
            end_h = min(23, int(best_hour) + 1)
            
            consec = [h for h in range(start_h, end_h + 1) if df.loc[df['hour'] == h, 'spray_safe'].values[0]]
            recommended_hours = consec
            best_window = f"{tr['best_window_prefix']}: {min(consec):02d}:00 - {max(consec)+1:02d}:00"

        return {
            "best_time_window": best_window,
            "recommended_hours": recommended_hours,
            "overall_status": tr["status_safe"] if len(safe_hours) > 0 else tr["status_blocked"],
            "peak_readiness_score": round(df["readiness_score"].max(), 3),
            "safe_hours_count": int(len(safe_hours)),
            "hourly_timeline": df[["hour", "delta_t_celsius", "wind_speed_kmh", "status_badge", "farmer_message"]]
        }

if __name__ == "__main__":
    # Self-test demonstrating multilingual farmer output
    model_file = os.path.join(os.path.dirname(__file__), "export", "model2_biological_readiness.joblib")
    if os.path.exists(model_file):
        engine = BiologicalReadinessEngine(model_file)
        
        # Test Sample 1: Safe morning conditions
        sample_safe = pd.DataFrame([{
            'soil_moisture_pct': 52.5,
            'delta_t_celsius': 4.2,
            'wind_speed_kmh': 8.5,
            'rain_prob_next_48h': 10.0,
            'crop_stage_sensitivity': 0.35
        }])
        
        # Test Sample 2: Midday heat & evaporation
        sample_hot = pd.DataFrame([{
            'soil_moisture_pct': 48.0,
            'delta_t_celsius': 9.4,
            'wind_speed_kmh': 9.0,
            'rain_prob_next_48h': 5.0,
            'crop_stage_sensitivity': 0.35
        }])

        print("--- ENGLISH (en) ---")
        print(engine.predict_readiness(sample_safe, lang="en")[0]["farmer_message"])
        print(engine.predict_readiness(sample_hot, lang="en")[0]["farmer_message"])
        
        print("\n--- HINDI (hi) ---")
        print(engine.predict_readiness(sample_safe, lang="hi")[0]["farmer_message"])
        print(engine.predict_readiness(sample_hot, lang="hi")[0]["farmer_message"])
        
        print("\n--- TELUGU (te) ---")
        print(engine.predict_readiness(sample_safe, lang="te")[0]["farmer_message"])
        print(engine.predict_readiness(sample_hot, lang="te")[0]["farmer_message"])
