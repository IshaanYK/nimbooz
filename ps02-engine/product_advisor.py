class SyngentaProductAdvisor:
    PRODUCT_CATALOG = {
        "stress_buster": {
            "brand_name": "Syngenta Stress Buster",
            "active_ingredient": "MEGAFOL® Biostimulant",
            "category": "Biostimulant",
            "target_stress": "abiotic",
            "applicable_crops": ["rice", "wheat", "cotton_bt", "soybean", "maize", "groundnut", "chilli"],
            "dosage_ml_per_acre": 400,
            "application_method": "Foliar Spray",
            "description": "Enhances crop tolerance to drought, heat, and salinity stress by boosting osmotic regulation and antioxidant defense."
        },
        "yield_booster": {
            "brand_name": "Syngenta Yield Booster",
            "active_ingredient": "YieldOn® Technology",
            "category": "Biostimulant",
            "target_stress": "productivity",
            "applicable_crops": ["rice", "wheat", "cotton_bt", "soybean", "maize"],
            "dosage_ml_per_acre": 300,
            "application_method": "Foliar Spray at Flowering",
            "description": "Maximizes grain filling and pod setting during reproductive stage for higher yields."
        },
        "nutrient_booster": {
            "brand_name": "Syngenta Nutrient Booster",
            "active_ingredient": "VIVA® Bioactivator",
            "category": "Biostimulant",
            "target_stress": "nutrient_deficiency",
            "applicable_crops": ["rice", "wheat", "cotton_bt", "soybean", "groundnut", "maize", "chilli"],
            "dosage_ml_per_acre": 500,
            "application_method": "Soil Drench or Foliar",
            "description": "Enhances root development and nutrient uptake efficiency, especially N and P."
        },
        "taegro": {
            "brand_name": "TAEGRO®",
            "active_ingredient": "Bacillus amyloliquefaciens FZB24",
            "category": "Biocontrol",
            "target_stress": "biotic_fungal",
            "applicable_crops": ["soybean", "wheat", "cotton_bt", "chilli"],
            "dosage_g_per_acre": 100,
            "application_method": "Foliar Spray",
            "description": "Controls foliar and soilborne fungal diseases including rust, powdery mildew, and root rot."
        },
        "arvatico": {
            "brand_name": "ARVATICO®",
            "active_ingredient": "Purpureocillium lilacinum strain PL11",
            "category": "Biocontrol",
            "target_stress": "biotic_nematode",
            "applicable_crops": ["cotton_bt", "soybean", "groundnut", "chilli"],
            "dosage_ml_per_acre": 1000,
            "application_method": "Seed Treatment / Soil Application",
            "description": "Targets parasitic nematodes that damage root systems, improving root health and nutrient uptake."
        }
    }

    CONDITION_RULES = [
        {
            "rule_id": "r1",
            "stress_type": "drought",
            "trigger": lambda d: d.get("spei", 0) < -1.5 and d.get("soil_moisture", 100) < 15,
            "recommended_product": "stress_buster",
            "priority": 1,
            "timing_advice": "Apply immediately as foliar spray.",
            "rationale": "Severe drought detected via SPEI and low soil moisture. Stress Buster helps with osmotic regulation."
        },
        {
            "rule_id": "r2",
            "stress_type": "drought",
            "trigger": lambda d: d.get("spei", 0) < -1.0 and d.get("ndvi_declining", False),
            "recommended_product": "stress_buster",
            "priority": 2,
            "timing_advice": "Apply as early warning foliar spray.",
            "rationale": "Moderate drought with vegetation decline detected. Proactive spray prevents severe damage."
        },
        {
            "rule_id": "r3",
            "stress_type": "heat",
            "trigger": lambda d: d.get("tmax", 0) > 38 and d.get("humidity", 100) < 30,
            "recommended_product": "stress_buster",
            "priority": 1,
            "timing_advice": "Apply early morning or late evening.",
            "rationale": "High temperature and low humidity cause severe heat stress. Enhances antioxidant defense."
        },
        {
            "rule_id": "r4",
            "stress_type": "frost",
            "trigger": lambda d: d.get("tmin", 10) < 4,
            "recommended_product": "stress_buster",
            "priority": 1,
            "timing_advice": "Apply 24-48 hours before predicted frost.",
            "rationale": "Frost risk imminent. Application helps build frost tolerance."
        },
        {
            "rule_id": "r5",
            "stress_type": "waterlog",
            "trigger": lambda d: d.get("precip", 0) > 50 and d.get("soil_moisture", 0) > 45,
            "recommended_product": "nutrient_booster",
            "priority": 2,
            "timing_advice": "Apply post-drainage.",
            "rationale": "Waterlogging damages roots. Nutrient Booster aids in root regeneration and nutrient uptake."
        },
        {
            "rule_id": "r6",
            "stress_type": "vegetation_decline",
            "trigger": lambda d: d.get("ndvi", 1) < 0.35 and d.get("vci", 100) < 35,
            "recommended_product": "stress_buster",
            "priority": 2,
            "timing_advice": "Apply immediately to halt vegetation decline.",
            "rationale": "Vegetation indices show significant distress. Requires immediate biostimulant support."
        },
        {
            "rule_id": "r7",
            "stress_type": "drought",
            "trigger": lambda d: d.get("soil_moisture", 100) < 20 and d.get("ndwi", 1) < 0.1,
            "recommended_product": "stress_buster",
            "priority": 2,
            "timing_advice": "Apply immediately to manage water deficit.",
            "rationale": "Canopy water deficit detected alongside low soil moisture."
        },
        {
            "rule_id": "r8",
            "stress_type": "yield_plateau",
            "trigger": lambda d: d.get("vci", 0) > 60 and d.get("ndvi", 0) > 0.65 and d.get("flowering_stage", False),
            "recommended_product": "yield_booster",
            "priority": 3,
            "timing_advice": "Apply at flowering or grain filling stage.",
            "rationale": "Good vegetation but risk of yield plateau. Maximize reproductive growth."
        },
        {
            "rule_id": "r9",
            "stress_type": "nutrient_deficiency",
            "trigger": lambda d: d.get("post_stress_recovery", False),
            "recommended_product": "nutrient_booster",
            "priority": 3,
            "timing_advice": "Apply 3-5 days after stress period ends.",
            "rationale": "Crop needs to rebuild roots and resume growth after stress period."
        },
        {
            "rule_id": "r10",
            "stress_type": "nutrient_deficiency",
            "trigger": lambda d: 20 <= d.get("soil_moisture", 0) <= 30 and d.get("ndvi_declining", False),
            "recommended_product": "nutrient_booster",
            "priority": 3,
            "timing_advice": "Apply immediately.",
            "rationale": "Moderate moisture but declining vigor suggests nutrient deficiency or poor root activity."
        },
        {
            "rule_id": "r11",
            "stress_type": "amplification",
            "trigger": lambda d: d.get("wind_speed", 10) < 5 and 2 < d.get("delta_t", 0) < 8 and d.get("any_stress", False),
            "recommended_product": "stress_buster", # General amplification note
            "priority": 4,
            "timing_advice": "Optimal spray conditions.",
            "rationale": "Low wind and optimal Delta-T amplify spray effectiveness. Great time for any application."
        },
        {
            "rule_id": "r12",
            "stress_type": "compound_stress",
            "trigger": lambda d: (d.get("spei", 0) < -1.0 or d.get("soil_moisture", 100) < 20) and d.get("tmax", 0) > 36,
            "recommended_product": "stress_buster",
            "priority": 1,
            "timing_advice": "Apply immediately (double dose).",
            "rationale": "Simultaneous heat and drought stress detected. High risk of severe crop damage."
        }
    ]

    def evaluate_conditions(self, day_data, crop_profile, region_info):
        """Evaluates day data against conditions and returns sorted recommendations."""
        triggered_recommendations = []
        
        for rule in self.CONDITION_RULES:
            if rule["trigger"](day_data):
                product_info = self.get_product_info(rule["recommended_product"])
                
                # Check if product is applicable to the crop
                crop_key = crop_profile.get("crop_key")
                if crop_key and crop_key not in product_info.get("applicable_crops", []):
                    continue
                
                rec = {
                    "rule_id": rule["rule_id"],
                    "stress_type": rule["stress_type"],
                    "product": product_info,
                    "priority": rule["priority"],
                    "timing_advice": rule["timing_advice"],
                    "rationale": rule["rationale"],
                    "triggered_by_data": day_data
                }
                triggered_recommendations.append(rec)
                
        # Sort by priority (1 is highest)
        return sorted(triggered_recommendations, key=lambda x: x["priority"])

    def get_product_info(self, product_key):
        return self.PRODUCT_CATALOG.get(product_key, {})

if __name__ == "__main__":
    advisor = SyngentaProductAdvisor()
    test_data = {"spei": -1.6, "soil_moisture": 10, "tmax": 39, "humidity": 25, "crop_key": "wheat"}
    recs = advisor.evaluate_conditions(test_data, {"crop_key": "wheat"}, {})
    print(f"Found {len(recs)} recommendations.")
