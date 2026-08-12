from flask import Flask, render_template, jsonify, request
from data_ingestion import DataIngestionEngine
from plant_categorization import PlantCategorizationMatrix
from ensemble_model import HybridEnsembleModel
from alert_engine import GeminiAlertEngine
from product_matrix import get_recommendations_for_day

app = Flask(__name__)

# Global instances
categorization = PlantCategorizationMatrix()

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

@app.route('/run_pipeline', methods=['GET', 'POST'])
def run_pipeline():
    if request.method == 'POST':
        data = request.json or {}
    else:
        data = {}
    
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
    has_critical_alert = False
    
    for i, day_data in enumerate(forecast):
        result = model.evaluate_day(day_data, full_forecast=forecast, day_index=i)
        analysis_results.append(result)
        
        # 5. Product Matrix — evaluate stress scores for categorized recommendations
        scores = result.get("stress_breakdown", {})
        matrix_recs, day_is_critical = get_recommendations_for_day(scores)
        
        if day_is_critical:
            has_critical_alert = True
            
        if matrix_recs:
            shaped = []
            for rec in matrix_recs:
                shaped.append({
                    "product_key": rec.get("product_name", "").replace(" ", "_").lower(),
                    "product_name": rec.get("product_name", "Unknown"),
                    "category": rec.get("category", "Biostimulant"),
                    "dosage": "As per label",
                    "timing_advice": rec.get("timing_advice", ""),
                    "rationale": rec.get("rationale", ""),
                    "priority": 1 if rec.get("severity") == "Critical" else (2 if rec.get("severity") == "High" else 3),
                    "trigger_description": rec.get("trigger_stress", "").replace("_score", "").replace("_stress", "").title(),
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
        "has_critical_alert": has_critical_alert,
        "product_recommendations": [
            {"day": day_idx, "products": recs} 
            for day_idx, recs in product_recommendations[:5]  # Top 5 days
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, port=7001)
