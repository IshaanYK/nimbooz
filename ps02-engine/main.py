from data_ingestion import DataIngestionEngine
from plant_categorization import PlantCategorizationMatrix
from ensemble_model import HybridEnsembleModel
from alert_engine import GeminiAlertEngine

def run_ps02_pipeline(crop_type="soybean", block_id="PUNJAB_BLK_42"):
    print(f"--- STARTING HACK CORE 2026 PS-02 PIPELINE ---")
    print(f"Target: Block {block_id} | Crop: {crop_type.upper()}\n")
    
    # 1. Sensing Layer
    print("[1] Ingesting 14-Day Mock Data (Meteoblue/Satellites)...")
    ingestion = DataIngestionEngine(block_id=block_id)
    forecast = ingestion.get_14_day_forecast()
    
    # 2. Categorization Layer
    print("[2] Retrieving Crop Resilience Profile...")
    categorization = PlantCategorizationMatrix()
    crop_profile = categorization.get_crop_profile(crop_type)
    print(f"    -> Profile: {crop_profile['name']} (Resilience: {crop_profile['abiotic_resilience']})")
    
    # 3. Processing Layer
    print("[3] Running Hybrid Ensemble Model (RF-SVM)...")
    model = HybridEnsembleModel(crop_profile)
    analysis_results = []
    
    for day_data in forecast:
        result = model.evaluate_day(day_data)
        analysis_results.append(result)
        
    print(f"    -> Analyzed {len(analysis_results)} days of environmental data.")
        
    # 4. Action Layer
    print("\n[4] Generating Gemini XAI Alert...")
    print("="*50)
    alert = GeminiAlertEngine.generate_alert(crop_profile, analysis_results)
    print(alert)
    print("="*50)

if __name__ == "__main__":
    # Test Scenario 1: Highly vulnerable crop (Soybean)
    run_ps02_pipeline(crop_type="soybean")
    
    print("\n\n")
    
    # Test Scenario 2: Highly resilient crop (Bt Cotton)
    run_ps02_pipeline(crop_type="cotton_bt")
