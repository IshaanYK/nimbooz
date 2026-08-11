from flask import Flask, render_template, jsonify, request
from data_ingestion import DataIngestionEngine
from plant_categorization import PlantCategorizationMatrix
from ensemble_model import HybridEnsembleModel
from alert_engine import GeminiAlertEngine
from product_advisor import SyngentaProductAdvisor

app = Flask(__name__)

# Global instances
categorization = PlantCategorizationMatrix()
product_advisor = SyngentaProductAdvisor()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_regions', methods=['GET'])
def get_regions():
    """Returns all available regions with their crops."""
    regions = {}
    for key, info in categorization.REGION_DATABASE.items():
        regions[key] = {
            "name": info["name"],
            "crops": info.get("major_crops", []),
            "lat": info["lat"],
            "lon": info["lon"],
            "soil_type": info.get("soil_type", "Unknown"),
            "dominant_stresses": info.get("dominant_stresses", [])
        }
    return jsonify(regions)

@app.route('/run_pipeline', methods=['POST'])
def run_pipeline():
    data = request.json
    crop_type = data.get('crop_type', 'soybean')
    region_key = data.get('region', 'punjab')
    
    # 1. Get region info and coordinates
    region_info = categorization.get_region_info(region_key)
    lat = region_info.get("lat", 30.9) if region_info else 30.9
    lon = region_info.get("lon", 75.86) if region_info else 75.86
    
    # 2. Ingestion — use region's coordinates
    ingestion = DataIngestionEngine(block_id=f"{region_key.upper()}_BLK", lat=lat, lon=lon)
    forecast = ingestion.get_14_day_forecast()
    
    # 3. Categorization — region-aware
    crop_profile = categorization.get_crop_profile(crop_type, region_key)
    
    # 4. Ensemble evaluation
    model = HybridEnsembleModel(crop_profile)
    analysis_results = []
    product_recommendations = []
    
    for i, day_data in enumerate(forecast):
        result = model.evaluate_day(day_data, full_forecast=forecast, day_index=i)
        analysis_results.append(result)
        
        # 5. Product Advisor — flatten sensor data for rule evaluation
        flat = {
            "spei": day_data.get("weather_layer", {}).get("SPEI", 0),
            "tmax": day_data.get("weather_layer", {}).get("TMax", 30),
            "humidity": day_data.get("weather_layer", {}).get("RH_percent", 55),
            "wind_speed": day_data.get("weather_layer", {}).get("Wind_kmh", 8),
            "precipitation": day_data.get("weather_layer", {}).get("Precipitation_mm", 0),
            "delta_t": day_data.get("weather_layer", {}).get("Delta_T", 5),
            "soil_moisture": day_data.get("soil_layer", {}).get("Soil_Moisture_Pct", 35),
            "ndvi": day_data.get("satellite_layer", {}).get("NDVI", 0.6),
            "ndwi": day_data.get("satellite_layer", {}).get("NDWI", 0.3),
            "vci": day_data.get("satellite_layer", {}).get("VCI", 60),
            "any_stress": result.get("is_stressed", False),
            "ndvi_declining": day_data.get("satellite_layer", {}).get("NDVI", 0.6) < 0.45,
        }
        raw_recs = product_advisor.evaluate_conditions(flat, crop_profile, region_info)
        if raw_recs:
            # Reshape for alert engine consumption
            shaped = []
            for rec in raw_recs:
                prod = rec.get("product", {})
                dosage_str = f"{prod.get('dosage_ml_per_acre', prod.get('dosage_g_per_acre', 'N/A'))} {'ml' if 'dosage_ml_per_acre' in prod else 'g'}/acre"
                shaped.append({
                    "product_key": rec.get("rule_id", ""),
                    "product_name": prod.get("brand_name", "Unknown"),
                    "category": prod.get("category", "Biostimulant"),
                    "dosage": dosage_str,
                    "timing_advice": rec.get("timing_advice", ""),
                    "rationale": rec.get("rationale", ""),
                    "priority": rec.get("priority", 3),
                    "trigger_description": rec.get("stress_type", "").replace("_", " ").title(),
                })
            product_recommendations.append((day_data["day"], shaped))
    
    # 6. Alert Generation — region-aware, multi-factor
    alert = GeminiAlertEngine.generate_alert(
        crop_profile, region_info, analysis_results, product_recommendations
    )
    
    return jsonify({
        "data_source": ingestion.data_source,
        "region": region_info,
        "crop_profile": crop_profile,
        "forecast": analysis_results,
        "alert": alert,
        "product_recommendations": [
            {"day": day_idx, "products": recs} 
            for day_idx, recs in product_recommendations[:5]  # Top 5 days
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, port=7000)
