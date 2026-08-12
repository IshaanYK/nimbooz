class PlantCategorizationMatrix:
    REGION_DATABASE = {
        "punjab": {
            "name": "Indo-Gangetic Plain",
            "lat": 30.9,
            "lon": 75.86,
            "major_crops": ["rice", "wheat", "cotton_bt"],
            "dominant_stresses": ["waterlogging", "heat_stress"],
            "soil_type": "Alluvial, high fertility",
            "avg_annual_precip_mm": 650
        },
        "jammu": {
            "name": "Northern Hills",
            "lat": 32.73,
            "lon": 74.87,
            "major_crops": ["rice", "apple", "saffron", "maize"],
            "dominant_stresses": ["frost", "cold_stress", "hailstorms"],
            "soil_type": "Mountain/Forest soil, moderate fertility",
            "avg_annual_precip_mm": 1100
        },
        "gujarat_saurashtra": {
            "name": "Semi-Arid",
            "lat": 21.52,
            "lon": 70.46,
            "major_crops": ["cotton_bt", "groundnut", "castor"],
            "dominant_stresses": ["drought", "heat_waves", "erratic_monsoon"],
            "soil_type": "Black cotton soil (Vertisol), low moisture retention",
            "avg_annual_precip_mm": 450
        },
        "maharashtra_vidarbha": {
            "name": "Deccan Plateau",
            "lat": 20.93,
            "lon": 77.78,
            "major_crops": ["soybean", "cotton_bt", "pigeon_pea"],
            "dominant_stresses": ["unseasonal_rain", "dry_spells", "heat"],
            "soil_type": "Black soil (Regur), moderate",
            "avg_annual_precip_mm": 900
        },
        "andhra_telangana": {
            "name": "Southern Plateau",
            "lat": 17.39,
            "lon": 78.49,
            "major_crops": ["rice", "cotton_bt", "chilli", "maize"],
            "dominant_stresses": ["cyclone_related_rain", "drought_rayalaseema"],
            "soil_type": "Red and black mixed",
            "avg_annual_precip_mm": 750
        }
    }

    CROP_DATABASE = {
        "rice": {
            "abiotic_resilience": 0.35,
            "biotic_resilience": 0.4,
            "key_vulnerability": "drought at flowering stage",
            "phenology": {
                "t_base": 10,  # Base temp for Rice GDD
                "gdd_flowering": 1200,
                "crop_Kc": 1.15  # High water demand
            },
            "base_stress_thresholds": {
                "heat_tmax_trigger": 38,
                "frost_tmin_trigger": 4,
                "drought_spei_trigger": -1.5,
                "drought_soil_moisture_trigger": 15,
                "waterlog_precip_trigger": 50,
                "ndvi_stress_trigger": 0.35,
                "vci_stress_trigger": 35
            },
            "region_overrides": {
                "punjab": {
                    "waterlog_precip_trigger": 80,
                    "heat_tmax_trigger": 36
                }
            }
        },
        "wheat": {
            "abiotic_resilience": 0.5,
            "biotic_resilience": 0.35,
            "key_vulnerability": "terminal heat stress",
            "phenology": {
                "t_base": 5,  # Base temp for Wheat GDD
                "gdd_flowering": 900,
                "crop_Kc": 1.05
            },
            "base_stress_thresholds": {
                "heat_tmax_trigger": 35,
                "frost_tmin_trigger": 2,
                "drought_spei_trigger": -1.5,
                "drought_soil_moisture_trigger": 15,
                "waterlog_precip_trigger": 40,
                "ndvi_stress_trigger": 0.4,
                "vci_stress_trigger": 40
            },
            "region_overrides": {}
        },
        "cotton_bt": {
            "abiotic_resilience": 0.65,
            "biotic_resilience": 0.7,
            "key_vulnerability": "pink bollworm, whitefly",
            "phenology": {
                "t_base": 15,  # Base temp for Cotton GDD
                "gdd_flowering": 1500,
                "crop_Kc": 1.10
            },
            "base_stress_thresholds": {
                "heat_tmax_trigger": 38,
                "frost_tmin_trigger": 5,
                "drought_spei_trigger": -1.5,
                "drought_soil_moisture_trigger": 15,
                "waterlog_precip_trigger": 30,
                "ndvi_stress_trigger": 0.3,
                "vci_stress_trigger": 30
            },
            "region_overrides": {
                "gujarat_saurashtra": {
                    "heat_tmax_trigger": 40,
                    "drought_soil_moisture_trigger": 12
                }
            }
        },
        "soybean": {
            "abiotic_resilience": 0.3,
            "biotic_resilience": 0.45,
            "key_vulnerability": "drought sensitivity, YMV",
            "base_stress_thresholds": {
                "heat_tmax_trigger": 36,
                "frost_tmin_trigger": 5,
                "drought_spei_trigger": -1.2,
                "drought_soil_moisture_trigger": 20,
                "waterlog_precip_trigger": 45,
                "ndvi_stress_trigger": 0.35,
                "vci_stress_trigger": 35
            },
            "region_overrides": {}
        },
        "groundnut": {
            "abiotic_resilience": 0.4,
            "biotic_resilience": 0.5,
            "key_vulnerability": "terminal drought",
            "base_stress_thresholds": {
                "heat_tmax_trigger": 37,
                "frost_tmin_trigger": 10,
                "drought_spei_trigger": -1.5,
                "drought_soil_moisture_trigger": 12,
                "waterlog_precip_trigger": 35,
                "ndvi_stress_trigger": 0.3,
                "vci_stress_trigger": 30
            },
            "region_overrides": {}
        },
        "maize": {
            "abiotic_resilience": 0.55,
            "biotic_resilience": 0.5,
            "key_vulnerability": "fall armyworm",
            "base_stress_thresholds": {
                "heat_tmax_trigger": 38,
                "frost_tmin_trigger": 5,
                "drought_spei_trigger": -1.5,
                "drought_soil_moisture_trigger": 15,
                "waterlog_precip_trigger": 40,
                "ndvi_stress_trigger": 0.35,
                "vci_stress_trigger": 35
            },
            "region_overrides": {}
        },
        "apple": {
            "abiotic_resilience": 0.3,
            "biotic_resilience": 0.4,
            "key_vulnerability": "frost during flowering, scab",
            "base_stress_thresholds": {
                "heat_tmax_trigger": 30,
                "frost_tmin_trigger": -2,
                "drought_spei_trigger": -1.0,
                "drought_soil_moisture_trigger": 25,
                "waterlog_precip_trigger": 50,
                "ndvi_stress_trigger": 0.4,
                "vci_stress_trigger": 40
            },
            "region_overrides": {}
        },
        "chilli": {
            "abiotic_resilience": 0.35,
            "biotic_resilience": 0.3,
            "key_vulnerability": "moisture stress",
            "base_stress_thresholds": {
                "heat_tmax_trigger": 35,
                "frost_tmin_trigger": 5,
                "drought_spei_trigger": -1.2,
                "drought_soil_moisture_trigger": 18,
                "waterlog_precip_trigger": 40,
                "ndvi_stress_trigger": 0.35,
                "vci_stress_trigger": 35
            },
            "region_overrides": {}
        }
    }

    def get_crop_profile(self, crop_key, region_key='punjab'):
        """Merges crop base profile with region-specific overrides."""
        if crop_key not in self.CROP_DATABASE:
            return {
                "name": crop_key.replace("_", " ").title(),
                "crop_key": crop_key,
                "region_key": region_key,
                "abiotic_resilience": 0.5,
                "biotic_resilience": 0.5,
                "key_vulnerability": "unknown",
                "stress_thresholds": {
                    "heat_tmax_trigger": 38, "frost_tmin_trigger": 4,
                    "drought_spei_trigger": -1.5, "drought_soil_moisture_trigger": 15,
                    "waterlog_precip_trigger": 50, "ndvi_stress_trigger": 0.35, "vci_stress_trigger": 35
                }
            }
        
        base_profile = self.CROP_DATABASE[crop_key].copy()
        thresholds = base_profile.get("base_stress_thresholds", {}).copy()
        
        overrides = base_profile.get("region_overrides", {}).get(region_key, {})
        thresholds.update(overrides)
        
        crop_names = {
            "rice": "Rice (Paddy)", "wheat": "Wheat", "cotton_bt": "Bt Cotton",
            "soybean": "Soybean", "groundnut": "Groundnut", "maize": "Maize",
            "apple": "Apple", "chilli": "Chilli", "castor": "Castor",
            "saffron": "Saffron", "pigeon_pea": "Pigeon Pea"
        }
        region_names = {k: v["name"] for k, v in self.REGION_DATABASE.items()}
        
        return {
            "name": crop_names.get(crop_key, crop_key.title()),
            "crop_key": crop_key,
            "region_key": region_key,
            "region_name": region_names.get(region_key, region_key),
            "abiotic_resilience": base_profile.get("abiotic_resilience", 0.5),
            "biotic_resilience": base_profile.get("biotic_resilience", 0.5),
            "key_vulnerability": base_profile.get("key_vulnerability", ""),
            "stress_thresholds": thresholds
        }

    def get_region_info(self, region_key):
        """Returns region metadata."""
        return self.REGION_DATABASE.get(region_key)

    def get_available_crops_for_region(self, region_key):
        """Returns relevant crops for a given region."""
        region_info = self.get_region_info(region_key)
        if region_info:
            return region_info.get("major_crops", [])
        return []

if __name__ == "__main__":
    matrix = PlantCategorizationMatrix()
    print("Punjab crops:", matrix.get_available_crops_for_region("punjab"))
    print("Cotton in Gujarat profile:", matrix.get_crop_profile("cotton_bt", "gujarat_saurashtra"))
