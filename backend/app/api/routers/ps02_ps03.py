import logging
import math
import httpx
from datetime import datetime, date, timedelta
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)
router = APIRouter()

class PipelineRequest(BaseModel):
    crop_type: str = "soybean"
    region: str = "bhopal"
    sowingDate: str = ""
    growth_stage: str = "Vegetative"
    symptoms: str = "None"
    soil_moisture: str = "Optimal"

REGIONS_DATA = {
    "punjab": {
        "name": "Punjab / Indo-Gangetic Plain",
        "crops": ["wheat", "rice", "cotton_bt"],
        "lat": 30.9,
        "lon": 75.86,
        "soil_type": "Alluvial Loam",
        "soil_buffer": 0.50,
        "salinity_index": 0.20,
        "dominant_stresses": ["Heat Waves", "Waterlogging"]
    },
    "bhopal": {
        "name": "Bhopal / Central India",
        "crops": ["soybean", "wheat", "chickpea"],
        "lat": 23.2599,
        "lon": 77.4126,
        "soil_type": "Medium Black Clay",
        "soil_buffer": 0.65,
        "salinity_index": 0.15,
        "dominant_stresses": ["Drought", "Heat Waves"]
    },
    "maharashtra_vidarbha": {
        "name": "Vidarbha / Maharashtra",
        "crops": ["cotton_bt", "soybean", "pigeon_pea"],
        "lat": 20.93,
        "lon": 77.75,
        "soil_type": "Deep Black Clay (Vertisol)",
        "soil_buffer": 0.70,
        "salinity_index": 0.18,
        "dominant_stresses": ["Drought", "Heat Waves"]
    },
    "gujarat_saurashtra": {
        "name": "Saurashtra / Gujarat",
        "crops": ["groundnut", "cotton_bt", "sesame"],
        "lat": 21.52,
        "lon": 70.45,
        "soil_type": "Sandy Loam / Coastal",
        "soil_buffer": 0.25,
        "salinity_index": 0.45,
        "dominant_stresses": ["Severe Drought", "Soil Salinity"]
    },
    "jammu": {
        "name": "Jammu & Kashmir Valley",
        "crops": ["apple", "saffron", "mustard"],
        "lat": 34.08,
        "lon": 74.79,
        "soil_type": "Mountain Meadow / Karewa",
        "soil_buffer": 0.55,
        "salinity_index": 0.10,
        "dominant_stresses": ["Frost / Cold Snap", "Erratic Rainfall"]
    },
    "andhra_telangana": {
        "name": "Rayalaseema / Andhra Pradesh",
        "crops": ["chilli", "groundnut", "rice"],
        "lat": 14.68,
        "lon": 77.60,
        "soil_type": "Red Sandy Loam",
        "soil_buffer": 0.30,
        "salinity_index": 0.25,
        "dominant_stresses": ["Severe Drought", "High VPD Atmospheric Pull"]
    }
}

# Complete Syngenta India Retail Product Catalog
# Source: syngenta.co.in + BigHaat + AgriBegri + Agriplex India + CIB&RC Registry
# 6D MoA Vectors: [Thermal, Hydric/Drought, Reproductive/Flower, Vegetative, Osmotic/Salinity, Grain/Yield]
SYNGENTA_PRODUCTS = {
    # ── BIOSTIMULANTS ──
    "isabion": {
        "name": "Isabion®",
        "category": "Biostimulant",
        "subcategory": "Amino Acid & Peptide Complex",
        "active_ingredient": "Free L-Amino Acids (62.5%) + Short-Chain Peptides",
        "registration": "CIB&RC Registered (Fertilizer Control Order)",
        "base_dosage": 2.0,
        "retail_price_inr": "₹400-₹1,300 (250ml-1L)",
        "moa_vector": [0.95, 0.60, 0.98, 0.70, 0.40, 0.85],
        "target": "Flower Drop Prevention & Heat Shock Protein (HSP) Activation",
        "description": "Supplies ready-made L-amino acids to bypass energy-costly biosynthesis; maintains pollen vitality under thermal stress.",
        "synergist": "+ 1% Foliar Urea (synergistic nitrogen uptake)",
        "tank_mix_safe": ["Urea (1%)", "Ampligo®", "NPK 19-19-19", "Amistar Top®"],
        "tank_mix_danger": ["Copper Fungicides", "Alkaline Sulfur Compounds", "Bordeaux Mixture"],
        "crops_recommended": ["Soybean", "Cotton", "Chilli", "Tomato", "Grape", "Mango", "Rice", "Wheat"]
    },
    "quantis": {
        "name": "Quantis®",
        "category": "Biostimulant",
        "subcategory": "Osmoprotectant & Anti-Stress Shield",
        "active_ingredient": "Yeast Extract + Potassium (K) + Calcium (Ca) + Organic Carbon",
        "registration": "CIB&RC Registered",
        "base_dosage": 2.0,
        "retail_price_inr": "₹400-₹900 (250ml-1L)",
        "moa_vector": [0.90, 0.95, 0.80, 0.65, 0.85, 0.80],
        "target": "Extreme Thermal Shock & Cell Turgor / Membrane Stabilization",
        "description": "Activates plant antioxidant defense enzymes (SOD, Catalase, APX); stabilizes cell membranes during heatwave and drought events.",
        "synergist": "+ 0.5% Potassium Nitrate (KNO3) for stomatal turgor",
        "tank_mix_safe": ["Ampligo®", "Score®", "Micronutrients (Zn, B, Fe)"],
        "tank_mix_danger": ["Strong Acids (pH<4)"],
        "crops_recommended": ["Soybean", "Cotton", "Groundnut", "Wheat", "Maize", "Sugarcane"]
    },
    # ── INSECTICIDES ──
    "ampligo": {
        "name": "Ampligo®",
        "category": "Insecticide",
        "subcategory": "Dual-Action Lepidoptera Control",
        "active_ingredient": "Chlorantraniliprole 10% + Lambda-Cyhalothrin 5% ZC",
        "registration": "CIB&RC 9(3) Registered",
        "base_dosage": 0.5,
        "retail_price_inr": "₹550-₹1,800 (80ml-250ml)",
        "moa_vector": [0.20, 0.15, 0.70, 0.60, 0.10, 0.65],
        "target": "Bollworm, Armyworm, Fruit Borer & Caterpillar Complex",
        "description": "Dual-action ZC formulation providing rapid knockdown (Lambda) + sustained ovi-larvicidal control (Chlorantraniliprole).",
        "synergist": "Can be tank-mixed with Isabion® for stress + pest dual protection",
        "tank_mix_safe": ["Isabion®", "Amistar Top®", "Foliar Fertilizers"],
        "tank_mix_danger": ["Alkaline Compounds (pH>9)"],
        "crops_recommended": ["Cotton", "Soybean", "Chickpea", "Tomato", "Chilli", "Brinjal", "Okra"]
    },
    "actara": {
        "name": "Actara®",
        "category": "Insecticide",
        "subcategory": "Systemic Neonicotinoid",
        "active_ingredient": "Thiamethoxam 25% WG",
        "registration": "CIB&RC 9(3) Registered",
        "base_dosage": 0.2,
        "retail_price_inr": "₹180-₹650 (40g-100g)",
        "moa_vector": [0.15, 0.10, 0.55, 0.65, 0.10, 0.50],
        "target": "Sucking Pests: Whitefly, Aphids, Jassids, Thrips",
        "description": "Translaminar systemic insecticide absorbed through roots and leaves; provides 14-21 day residual control of sucking pests.",
        "synergist": "Apply as soil drench or foliar spray",
        "tank_mix_safe": ["Ridomil Gold®", "Score®", "Foliar Fertilizers"],
        "tank_mix_danger": ["Highly Alkaline Mixtures"],
        "crops_recommended": ["Rice", "Cotton", "Sugarcane", "Mango", "Tea", "Wheat", "Vegetables"]
    },
    "virtako": {
        "name": "Virtako®",
        "category": "Insecticide",
        "subcategory": "Granular Stem Borer Control",
        "active_ingredient": "Thiamethoxam 40% + Chlorantraniliprole 0.5% GR",
        "registration": "CIB&RC 9(3) Registered",
        "base_dosage": 10.0,
        "retail_price_inr": "₹800-₹1,200 (4kg)",
        "moa_vector": [0.10, 0.10, 0.40, 0.50, 0.05, 0.55],
        "target": "Rice Stem Borer, Yellow Stem Borer, Leaf Folder",
        "description": "Granular application for paddy fields providing dual-mode protection against boring and foliar pests in rice.",
        "synergist": "Broadcast in standing water at transplanting or tillering",
        "tank_mix_safe": ["Not applicable (granular)"],
        "tank_mix_danger": ["Not applicable (granular)"],
        "crops_recommended": ["Rice (Paddy)"]
    },
    "minecto_xtra": {
        "name": "Minecto Xtra®",
        "category": "Insecticide",
        "subcategory": "Broad-Spectrum + Crop Enhancement",
        "active_ingredient": "Cyantraniliprole 12.6% + Thiamethoxam 12.6% SC",
        "registration": "CIB&RC Registered",
        "base_dosage": 0.3,
        "retail_price_inr": "₹700-₹1,500 (100ml-250ml)",
        "moa_vector": [0.20, 0.15, 0.60, 0.70, 0.10, 0.60],
        "target": "Broad-Spectrum Sucking + Chewing Pest Complex with Plant Health Enhancement",
        "description": "Next-generation dual-mode insecticide with documented crop enhancement / greening effect on treated plants.",
        "synergist": "Compatible with most fungicides and foliar nutrients",
        "tank_mix_safe": ["Amistar Top®", "Isabion®", "Score®"],
        "tank_mix_danger": ["Highly Alkaline Solutions"],
        "crops_recommended": ["Chilli", "Tomato", "Cotton", "Soybean", "Vegetables"]
    },
    # ── FUNGICIDES ──
    "amistar_top": {
        "name": "Amistar Top®",
        "category": "Fungicide",
        "subcategory": "Systemic Broad-Spectrum (Strobilurin + Triazole)",
        "active_ingredient": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
        "registration": "CIB&RC 9(3) Registered",
        "base_dosage": 1.0,
        "retail_price_inr": "₹500-₹1,400 (100ml-500ml)",
        "moa_vector": [0.50, 0.40, 0.70, 0.75, 0.30, 0.80],
        "target": "Anthracnose, Rust, Powdery Mildew, Leaf Spot, Early/Late Blight",
        "description": "Proven Amistar Technology: combines QoI respiratory inhibition (Azoxystrobin) with ergosterol biosynthesis block (Difenoconazole). Documented green effect on crops.",
        "synergist": "+ Isabion® for combined disease + stress management",
        "tank_mix_safe": ["Isabion®", "Ampligo®", "Actara®", "Foliar NPK"],
        "tank_mix_danger": ["Copper Oxychloride (at high concentrations)", "Strong Alkaline Solutions"],
        "crops_recommended": ["Soybean", "Chilli", "Tomato", "Grape", "Mango", "Pomegranate", "Potato", "Wheat"]
    },
    "score": {
        "name": "Score®",
        "category": "Fungicide",
        "subcategory": "Systemic Triazole",
        "active_ingredient": "Difenoconazole 25% EC",
        "registration": "CIB&RC 9(3) Registered",
        "base_dosage": 0.5,
        "retail_price_inr": "₹380-₹1,100 (100ml-500ml)",
        "moa_vector": [0.35, 0.30, 0.60, 0.65, 0.25, 0.70],
        "target": "Powdery Mildew, Rust, Scab, Alternaria, Cercospora Leaf Spot",
        "description": "Fast-acting systemic triazole with curative and protective action; rainfast within 1 hour of application.",
        "synergist": "Excellent rotation partner with Amistar Top®",
        "tank_mix_safe": ["Actara®", "Quantis®", "Foliar Fertilizers"],
        "tank_mix_danger": ["Emulsifiable Concentrate Insecticides at high volumes"],
        "crops_recommended": ["Wheat", "Rice", "Chilli", "Tomato", "Apple", "Grape", "Mango", "Vegetables"]
    },
    "ridomil_gold": {
        "name": "Ridomil Gold®",
        "category": "Fungicide",
        "subcategory": "Systemic + Contact (Oomycete Specialist)",
        "active_ingredient": "Metalaxyl-M 4% + Mancozeb 64% WP",
        "registration": "CIB&RC 9(3) Registered",
        "base_dosage": 2.5,
        "retail_price_inr": "₹350-₹1,200 (100g-500g)",
        "moa_vector": [0.30, 0.25, 0.55, 0.60, 0.20, 0.65],
        "target": "Downy Mildew, Late Blight, Damping Off (Phytophthora / Pythium)",
        "description": "Gold-standard oomycete fungicide combining acropetal systemic protection (Metalaxyl-M) with multi-site contact shield (Mancozeb).",
        "synergist": "Apply as preventive drench or foliar spray before disease onset",
        "tank_mix_safe": ["Actara®", "Most Insecticides"],
        "tank_mix_danger": ["Alkaline Compounds", "Lime Sulfur"],
        "crops_recommended": ["Grape", "Potato", "Tomato", "Onion", "Cucumber", "Watermelon", "Tobacco"]
    },
    "kavach": {
        "name": "Kavach®",
        "category": "Fungicide",
        "subcategory": "Contact Multi-Site Protectant",
        "active_ingredient": "Chlorothalonil 75% WP",
        "registration": "CIB&RC 9(3) Registered",
        "base_dosage": 2.0,
        "retail_price_inr": "₹300-₹900 (250g-1kg)",
        "moa_vector": [0.25, 0.20, 0.50, 0.55, 0.15, 0.55],
        "target": "Broad-Spectrum Multi-Site Fungal Protection (Early/Late Blight, Leaf Spot)",
        "description": "Multi-site contact fungicide with zero cross-resistance risk; excellent rotation partner for resistance management programs.",
        "synergist": "Rotate with Score® or Amistar Top® for full-season program",
        "tank_mix_safe": ["Most Insecticides", "Foliar Fertilizers"],
        "tank_mix_danger": ["Oil-Based Adjuvants"],
        "crops_recommended": ["Potato", "Tomato", "Chilli", "Groundnut", "Tea", "Apple"]
    },
    # ── HERBICIDES ──
    "calaris_xtra": {
        "name": "Calaris Xtra®",
        "category": "Herbicide",
        "subcategory": "Pre-Mix Broad-Spectrum Weed Control",
        "active_ingredient": "Mesotrione 3.36% + Atrazine 24% SC",
        "registration": "CIB&RC 9(3) Registered",
        "base_dosage": 2.25,
        "retail_price_inr": "₹600-₹1,400 (500ml-1L)",
        "moa_vector": [0.10, 0.10, 0.20, 0.40, 0.10, 0.35],
        "target": "Grass + Broadleaf Weeds in Maize / Sugarcane",
        "description": "India's first pre-mix herbicide for long-duration control of both grass and broadleaf weeds; post-emergence application.",
        "synergist": "Apply 20-25 days after sowing",
        "tank_mix_safe": ["Standalone application recommended"],
        "tank_mix_danger": ["Organophosphate Insecticides (within 7 days)"],
        "crops_recommended": ["Maize", "Sugarcane"]
    },
    "axial": {
        "name": "Axial®",
        "category": "Herbicide",
        "subcategory": "Post-Emergence Grass Weed Killer",
        "active_ingredient": "Pinoxaden 5.1% EC",
        "registration": "CIB&RC 9(3) Registered",
        "base_dosage": 0.8,
        "retail_price_inr": "₹550-₹1,100 (400ml-800ml)",
        "moa_vector": [0.10, 0.10, 0.15, 0.35, 0.10, 0.30],
        "target": "Phalaris minor (Mandusi) & Wild Oat (Javi) in Wheat",
        "description": "Premium post-emergence graminicide providing selective control of resistant Phalaris minor in wheat without crop injury.",
        "synergist": "Apply at 2-3 leaf stage of weeds",
        "tank_mix_safe": ["Broadleaf Herbicides (2,4-D, Metsulfuron)"],
        "tank_mix_danger": ["Do not mix with insecticides or fungicides"],
        "crops_recommended": ["Wheat", "Barley"]
    },
    # ── SEED TREATMENT ──
    "cruiser": {
        "name": "Cruiser® / Fortenza Duo®",
        "category": "Seed Treatment",
        "subcategory": "Systemic Seed Protectant",
        "active_ingredient": "Thiamethoxam 30% FS / Cyantraniliprole + Thiamethoxam",
        "registration": "CIB&RC Registered",
        "base_dosage": 0.004,
        "retail_price_inr": "₹400-₹800 (100ml-250ml)",
        "moa_vector": [0.15, 0.15, 0.30, 0.75, 0.10, 0.45],
        "target": "Early-Season Seedling Protection against Soil Pests & Sucking Insects",
        "description": "Seed treatment protecting emerging seedlings from soil-borne pests, aphids, and whitefly during the critical 0-30 DAE window.",
        "synergist": "Apply as seed dressing before sowing",
        "tank_mix_safe": ["Compatible with Ridomil Gold® seed treatment"],
        "tank_mix_danger": ["Not applicable (seed treatment)"],
        "crops_recommended": ["Soybean", "Cotton", "Maize", "Wheat", "Rice", "Sunflower"]
    }
}


def fetch_open_meteo_forecast(lat: float, lon: float) -> Optional[Dict]:
    """Fetch real 14-day weather forecast from Open-Meteo (free, no API key)."""
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,relative_humidity_2m_min,wind_speed_10m_max",
            "timezone": "Asia/Kolkata",
            "forecast_days": 14
        }
        resp = httpx.get(url, params=params, timeout=8)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        logger.warning(f"Open-Meteo fetch failed: {e}")
    return None


def compute_stress_from_weather(tmax: float, tmin: float, precip: float, rh_max: float, rh_min: float, wind: float, crop: str) -> Dict:
    """Compute agronomic stress indices from real weather data using mechanistic formulas."""
    # Crop-specific thresholds (from Syngenta Algorithm Doc)
    crop_thresholds = {
        "soybean": {"tmax_opt": 32, "tmax_lim": 45, "tmin_opt": 22, "tmin_lim": 28},
        "wheat":   {"tmax_opt": 25, "tmax_lim": 32, "tmin_opt": 15, "tmin_lim": 20},
        "cotton_bt": {"tmax_opt": 32, "tmax_lim": 38, "tmin_opt": 20, "tmin_lim": 25},
        "rice":    {"tmax_opt": 32, "tmax_lim": 38, "tmin_opt": 22, "tmin_lim": 28},
        "groundnut": {"tmax_opt": 30, "tmax_lim": 40, "tmin_opt": 20, "tmin_lim": 26},
        "chickpea": {"tmax_opt": 28, "tmax_lim": 35, "tmin_opt": 15, "tmin_lim": 22},
        "chilli":  {"tmax_opt": 30, "tmax_lim": 38, "tmin_opt": 18, "tmin_lim": 24},
    }
    th = crop_thresholds.get(crop.lower(), {"tmax_opt": 32, "tmax_lim": 42, "tmin_opt": 20, "tmin_lim": 26})

    # Day-time Heat Stress Index (0-1)
    if tmax <= th["tmax_opt"]:
        hsi_day = 0.0
    elif tmax >= th["tmax_lim"]:
        hsi_day = 1.0
    else:
        hsi_day = (tmax - th["tmax_opt"]) / (th["tmax_lim"] - th["tmax_opt"])

    # Night-time Heat Stress (High Night Temperature / Dark Respiration)
    if tmin <= th["tmin_opt"]:
        hsi_night = 0.0
    elif tmin >= th["tmin_lim"]:
        hsi_night = 1.0
    else:
        hsi_night = (tmin - th["tmin_opt"]) / (th["tmin_lim"] - th["tmin_opt"])

    hsi = round(hsi_day * 0.6 + hsi_night * 0.4, 3)

    # Drought Stress from precipitation deficit (VPD proxy)
    rh_avg = (rh_max + rh_min) / 2
    es = 0.6108 * math.exp((17.27 * tmax) / (tmax + 237.3))
    ea = es * (rh_avg / 100)
    vpd = max(es - ea, 0)
    dsi = min(vpd / 4.0, 1.0)  # Normalize VPD: 4kPa = fully stressed
    if precip > 5:
        dsi *= 0.4  # Substantial rain reduces drought stress
    elif precip > 1:
        dsi *= 0.7

    # Cold stress for frost-prone regions
    cold = max(0, (4 - tmin) / 7) if tmin < 4 else 0.0

    # Compound Stress (Formula 3.2)
    cs = (hsi * 0.6 + dsi * 0.4) * (1 + hsi * dsi * 0.3)

    # Determine dominant stress
    if hsi > dsi and hsi > cold:
        dominant = "Heat Wave Stress" if hsi > 0.4 else "Moderate Thermal Load"
    elif dsi > hsi and dsi > cold:
        dominant = "Drought / VPD Deficit" if dsi > 0.4 else "Mild Moisture Stress"
    elif cold > 0.2:
        dominant = "Frost / Cold Snap"
    else:
        dominant = "Optimal Conditions"

    # Spray safety (wind, rain, temperature)
    safe_to_spray = wind < 15 and precip < 2 and tmax < 36

    return {
        "hsi": round(hsi, 3),
        "dsi": round(dsi, 3),
        "cold": round(cold, 3),
        "compound_stress": round(cs, 3),
        "vpd_kpa": round(vpd, 2),
        "dominant_stress": dominant,
        "is_stressed": cs > 0.35,
        "safe_to_spray": safe_to_spray
    }


@router.get("/regions")
def get_regions():
    return REGIONS_DATA


@router.post("/run-pipeline")
def run_pipeline(req: PipelineRequest):
    sowing = req.sowingDate or date.today().isoformat()
    try:
        sowing_date_obj = datetime.strptime(sowing, "%Y-%m-%d").date()
        days_since_sowing = max(1, (date.today() - sowing_date_obj).days)
    except:
        days_since_sowing = 35

    region_info = REGIONS_DATA.get(req.region, REGIONS_DATA["bhopal"])
    lat = region_info["lat"]
    lon = region_info["lon"]

    # 1. GDD Phenology Engine (Formula 3.1)
    gdd = days_since_sowing * 15.5
    stages = ["Germination", "Vegetative", "Flowering", "Pod Formation", "Maturity"]
    currentStage = req.growth_stage if req.growth_stage in stages else stages[min(int(gdd / 300), 4)]

    stage_weights = {
        "Germination": 0.40, "Vegetative": 0.50, "Flowering": 0.95,
        "Pod Formation": 0.85, "Maturity": 0.30
    }
    w_stage = stage_weights.get(currentStage, 0.60)

    # 2. Fetch REAL 14-day weather from Open-Meteo
    meteo = fetch_open_meteo_forecast(lat, lon)
    using_live_data = meteo is not None and "daily" in (meteo or {})

    forecast = []
    aggregate_hsi = 0
    aggregate_dsi = 0

    if using_live_data:
        daily = meteo["daily"]
        for i in range(min(14, len(daily["time"]))):
            tmax = daily["temperature_2m_max"][i]
            tmin = daily["temperature_2m_min"][i]
            precip = daily["precipitation_sum"][i]
            rh_max = daily.get("relative_humidity_2m_max", [85]*14)[i]
            rh_min = daily.get("relative_humidity_2m_min", [55]*14)[i]
            wind = daily.get("wind_speed_10m_max", [12]*14)[i]

            stress = compute_stress_from_weather(tmax, tmin, precip, rh_max, rh_min, wind, req.crop_type)
            aggregate_hsi += stress["hsi"]
            aggregate_dsi += stress["dsi"]

            # WMO weather code interpretation
            wmo = daily.get("weather_code", [0]*14)[i]
            if wmo >= 95:
                condition = "Thunderstorm"
            elif wmo >= 80:
                condition = "Rain Showers"
            elif wmo >= 61:
                condition = "Moderate Rain"
            elif wmo >= 51:
                condition = "Light Drizzle"
            elif wmo >= 3:
                condition = "Overcast"
            elif wmo >= 1:
                condition = "Partly Cloudy"
            else:
                condition = "Clear Sky"

            forecast.append({
                "day": i + 1,
                "date": daily["time"][i],
                "overall_stress_probability": round(stress["compound_stress"], 2),
                "dominant_stress": stress["dominant_stress"],
                "is_stressed": stress["is_stressed"],
                "safe_to_spray": stress["safe_to_spray"],
                "stress_breakdown": {"heat": stress["hsi"], "drought": stress["dsi"], "cold": stress["cold"]},
                "weather_layer": {
                    "TMax": round(tmax, 1),
                    "TMin": round(tmin, 1),
                    "Precipitation_mm": round(precip, 1),
                    "RH_max": rh_max,
                    "RH_min": rh_min,
                    "Wind_kmh": round(wind, 1),
                    "VPD_kPa": stress["vpd_kpa"],
                    "Condition": condition
                },
                "satellite_layer": {
                    "NDVI": round(0.72 - (0.12 * stress["compound_stress"]), 2),
                    "NDWI": round(0.38 - (0.10 * stress["dsi"]), 2),
                    "Hydric_Index": round(0.10 + (0.25 * stress["dsi"]), 2)
                },
                "soil_layer": {
                    "Soil_Moisture_Pct": round(30 - (18 * stress["dsi"]), 0),
                    "Soil_Temp_C": round(tmin + 3, 1)
                },
                "shap_explanations": _generate_shap(stress),
                "products": []  # Filled below for stressed days
            })
        aggregate_hsi /= max(len(forecast), 1)
        aggregate_dsi /= max(len(forecast), 1)
    else:
        # Fallback static forecast if Open-Meteo is unreachable
        aggregate_hsi = 0.55
        aggregate_dsi = 0.40
        for i in range(14):
            forecast.append({
                "day": i + 1,
                "date": (date.today() + timedelta(days=i)).isoformat(),
                "overall_stress_probability": 0.30,
                "dominant_stress": "Moderate Thermal Load",
                "is_stressed": False,
                "safe_to_spray": True,
                "stress_breakdown": {"heat": 0.3, "drought": 0.2, "cold": 0.0},
                "weather_layer": {"TMax": 30, "TMin": 22, "Precipitation_mm": 5, "RH_max": 80, "RH_min": 60, "Wind_kmh": 10, "VPD_kPa": 1.2, "Condition": "Partly Cloudy"},
                "satellite_layer": {"NDVI": 0.68, "NDWI": 0.34, "Hydric_Index": 0.15},
                "soil_layer": {"Soil_Moisture_Pct": 28, "Soil_Temp_C": 25},
                "shap_explanations": [],
                "products": []
            })

    # Use real weather-derived stress for product matching
    hsi = max(aggregate_hsi, 0.20)
    dsi = max(aggregate_dsi, 0.15)
    if req.soil_moisture == "Dry":
        dsi = max(dsi, 0.65)
    if req.symptoms == "Wilting":
        dsi += 0.15
    if req.symptoms == "Stunting":
        hsi += 0.10

    compoundStress = (hsi * 0.6 + dsi * 0.4) * (1 + hsi * dsi * 0.3)
    yieldRisk = min(round(compoundStress * 100, 1), 95.0)
    riskLevel = "CRITICAL" if yieldRisk > 70 else "HIGH" if yieldRisk > 50 else "MODERATE" if yieldRisk > 30 else "LOW"

    # 3. 6D Field State Tensor
    x_field = [
        min(hsi, 1.0),
        min(dsi, 1.0),
        w_stage,
        0.90 if currentStage in ["Germination", "Vegetative"] or req.symptoms == "Stunting" else 0.30,
        region_info.get("salinity_index", 0.20),
        0.95 if currentStage in ["Pod Formation", "Flowering"] else 0.40
    ]

    # 4. Vector Scoring
    def cosine_similarity(v1, v2):
        dot = sum(a * b for a, b in zip(v1, v2))
        n1 = math.sqrt(sum(a * a for a in v1))
        n2 = math.sqrt(sum(b * b for b in v2))
        return dot / (n1 * n2) if n1 > 0 and n2 > 0 else 0.0

    # Only score biostimulant products for the CropFit recommendation
    biostim_keys = ["isabion", "quantis"]
    scored_products = []
    for pkey, pdata in SYNGENTA_PRODUCTS.items():
        if pkey not in biostim_keys:
            continue
        sim = cosine_similarity(x_field, pdata["moa_vector"])
        safety = 1.0
        if currentStage in ["Flowering", "Pod Formation"] and pkey == "isabion":
            safety = 1.15
        if dsi > 0.65 and pkey == "quantis":
            safety = 1.10
        scored_products.append((round(sim * safety * 100, 1), pkey, pdata))

    scored_products.sort(key=lambda x: x[0], reverse=True)
    best_score, best_pkey, best_product = scored_products[0]

    # 5. Hill-Equation Dosage
    soil_buffer = region_info.get("soil_buffer", 0.50)
    optimized_dosage = best_product["base_dosage"] * (1.0 + 0.5 * compoundStress + 0.3 * w_stage - 0.2 * soil_buffer)
    optimized_dosage_str = f"{round(optimized_dosage, 2)} L/ha"
    water_volume = 250 if (hsi > 0.5 or dsi > 0.5) else 200

    # 6. Biological Countdown
    countdownDays = 3 if yieldRisk > 70 else 5 if yieldRisk > 45 else 8

    # Inject products into stressed forecast days
    for day in forecast:
        if day["is_stressed"]:
            day["products"] = [{
                "product_key": best_pkey,
                "product_name": best_product["name"],
                "category": best_product["category"],
                "active_ingredient": best_product["active_ingredient"],
                "dosage": optimized_dosage_str,
                "application_method": "Foliar Spray",
                "water_usage": f"{water_volume} L/ha",
                "timing_advice": f"Apply within {countdownDays} days before peak stress",
                "timing_window": "Early Morning (6:00 - 9:00 AM)",
                "rationale": f"MoA Vector Match ({best_score}%) for {currentStage} under {riskLevel} compound stress.",
                "severity": riskLevel,
                "priority": 1,
                "trigger_description": f"GDD Phenology: {currentStage} (Vulnerability: {int(w_stage * 100)}%)"
            }]

    # 7. ROBI
    mandiPrices = {
        "soybean": 4800, "wheat": 2275, "cotton_bt": 7100, "rice": 2200,
        "groundnut": 6300, "chilli": 14000, "chickpea": 5600, "apple": 8500
    }
    mandiPrice = mandiPrices.get(req.crop_type.lower(), 4800)
    expectedYieldGain = 3.6 if best_pkey == "isabion" else 2.9
    productCost = 1250
    applicationCost = 400
    totalCost = productCost + applicationCost
    expectedRevenue = expectedYieldGain * mandiPrice
    robi = round(expectedRevenue / totalCost, 1)

    # Full product catalog summary for UI (all categories)
    product_catalog_summary = []
    for pkey, pdata in SYNGENTA_PRODUCTS.items():
        product_catalog_summary.append({
            "key": pkey,
            "name": pdata["name"],
            "category": pdata["category"],
            "active_ingredient": pdata["active_ingredient"],
            "retail_price": pdata.get("retail_price_inr", "N/A"),
            "crops": pdata.get("crops_recommended", []),
            "target": pdata["target"]
        })

    return {
        "data_source": "LIVE_OPEN_METEO" if using_live_data else "FALLBACK_STATIC",
        "weather_api": "Open-Meteo (api.open-meteo.com) — Free, No API Key" if using_live_data else "Static Fallback",
        "region": region_info,
        "crop_profile": {
            "crop": req.crop_type,
            "stage": currentStage,
            "stage_vulnerability": f"{int(w_stage * 100)}%",
            "soil_type": region_info.get("soil_type")
        },
        "has_critical_alert": yieldRisk > 50,
        "alert": {
            "title": f"Compound Climate Stress Alert ({riskLevel})",
            "description": f"Thermal & hydric deviation detected for {req.crop_type} at {currentStage} stage in {region_info['name']}.",
            "severity": riskLevel,
            "factors": _build_alert_factors(forecast, hsi, dsi),
            "recommendations": [
                f"Apply {best_product['name']} ({optimized_dosage_str}) in {water_volume} L/ha water",
                f"Tank-Mix Synergist: {best_product['synergist']}",
                "Spray window: Early Morning (6:00-9:00 AM) or Evening (5:00-7:30 PM)"
            ]
        },
        "cropfit": {
            "product": {
                "product_key": best_pkey,
                "product_name": best_product["name"],
                "category": best_product["category"],
                "active_ingredient": best_product["active_ingredient"],
                "dosage": optimized_dosage_str,
                "application_method": "Foliar Spray with Boom / Knapsack Nozzle",
                "water_usage": f"{water_volume} L/ha",
                "target": best_product["target"],
                "description": best_product["description"],
                "synergist": best_product["synergist"],
                "tank_mix_safe": best_product["tank_mix_safe"],
                "tank_mix_danger": best_product["tank_mix_danger"],
                "retail_price": best_product.get("retail_price_inr", "N/A")
            },
            "rationale": f"6D Vector Matcher selected {best_product['name']} ({best_score}% MoA fit) for {req.crop_type} at {currentStage} in {region_info.get('soil_type')}.",
            "confidence": min(int(best_score), 98),
            "top_candidates": [
                {"name": p[2]["name"], "score": p[0], "target": p[2]["target"]} for p in scored_products[:3]
            ]
        },
        "forecast": forecast,
        "economicROI": {
            "productCost": productCost,
            "applicationCost": applicationCost,
            "expectedYieldGain": f"{expectedYieldGain} q/ha",
            "mandiPrice": mandiPrice,
            "expectedRevenue": expectedRevenue,
            "robi": robi
        },
        "syngenta_india_catalog": product_catalog_summary
    }


def _generate_shap(stress: Dict) -> List[Dict]:
    """Generate SHAP-style explainability from real stress values."""
    factors = []
    total = stress["hsi"] + stress["dsi"] + stress["cold"] + 0.001
    if stress["hsi"] > 0.05:
        pct = round(stress["hsi"] / total * 100)
        factors.append({"factor": "Thermal Deviation (TMax/TNight)", "contribution": f"+{pct}%"})
    if stress["dsi"] > 0.05:
        pct = round(stress["dsi"] / total * 100)
        factors.append({"factor": f"VPD & Soil Moisture Deficit ({stress['vpd_kpa']} kPa)", "contribution": f"+{pct}%"})
    if stress["cold"] > 0.05:
        pct = round(stress["cold"] / total * 100)
        factors.append({"factor": "Cold/Frost Stress", "contribution": f"+{pct}%"})
    if not factors:
        factors.append({"factor": "All parameters within optimal range", "contribution": "0%"})
    return factors


def _build_alert_factors(forecast: List, hsi: float, dsi: float) -> List[Dict]:
    """Build alert factors from real forecast data."""
    factors = []
    if forecast:
        max_tmax = max(d["weather_layer"]["TMax"] for d in forecast)
        max_tmin = max(d["weather_layer"]["TMin"] for d in forecast)
        factors.append({
            "factor": "Peak Max Temperature",
            "readings": f"{max_tmax}°C",
            "status": "Critical" if max_tmax > 35 else "Warning" if max_tmax > 32 else "Normal",
            "threshold_info": ">35°C Protein Denaturing Limit"
        })
        factors.append({
            "factor": "Peak Night Temperature (HNT)",
            "readings": f"{max_tmin}°C",
            "status": "Warning" if max_tmin > 22 else "Normal",
            "threshold_info": ">22°C Dark Respiration Threshold"
        })
    factors.append({
        "factor": "14-Day Avg VPD Atmospheric Pull",
        "readings": f"{round(dsi * 4, 1)} kPa",
        "status": "Critical" if dsi > 0.5 else "Moderate",
        "threshold_info": ">2.5 kPa Stomatal Lock Threshold"
    })
    return factors
