"""
Advisory router — PS-04 core.
LISTEN → UNDERSTAND → ADVISE
Uses CE Hub agronomic data + agriculture engine + Gemini AI.
"""
from fastapi import APIRouter, Query
from pydantic import BaseModel
from datetime import date, timedelta
from typing import Optional
from app.services.cehub.adapter import (
    get_spray_window, get_planting_window, get_gdd, get_disease_risk_metadata
)
from app.services.meteoblue.adapter import fetch_weather_daily
from app.services.agriculture.engine import (
    assess_field_stress, calc_cumulative_gdd, calc_robi, calc_nue
)

router = APIRouter()


class AdvisoryRequest(BaseModel):
    lat: float
    lon: float
    crop: str = "soybean"
    field_area_ha: Optional[float] = None
    season_start: Optional[date] = None
    query: Optional[str] = None
    language: str = "en"  # "en", "hi", "mr"


@router.post("/field")
async def get_field_advisory(req: AdvisoryRequest):
    """
    Comprehensive field advisory combining all data sources.
    Returns weather stress, spray window, planting window, GDD stage.
    """
    today = date.today()
    start = (req.season_start or (today - timedelta(days=30)))

    # Pull data from all sources
    weather = await fetch_weather_daily(req.lat, req.lon, start, today)
    records = weather.get("records", [])

    gdd_data = await get_gdd(req.lat, req.lon, mode="past")
    spray_windows = await get_spray_window(req.lat, req.lon, mode="future")
    planting = await get_planting_window(req.lat, req.lon, req.crop, mode="future")

    # Compute stress
    stress = {}
    cumulative_gdd = 0
    if records:
        latest = records[-1]
        stress = assess_field_stress(
            crop=req.crop,
            tmax=latest.get("temperature_max", 32),
            tmin=latest.get("temperature_min", 22),
            cumulative_rainfall_mm=sum(r.get("rainfall", 0) for r in records),
            cumulative_et_mm=sum(r.get("evapotranspiration", 3) for r in records),
            avg_soil_moisture_pct=latest.get("soil_moisture", 0.3) * 100,
            avg_temperature_c=latest.get("temperature_mean", 27),
        )
        cumulative_gdd = calc_cumulative_gdd(records, req.crop)

    # GDD-based crop stage (simple model)
    crop_stage = _estimate_crop_stage(cumulative_gdd, req.crop)

    # Recommendations
    recommendations = _build_recommendations(stress, spray_windows, planting, crop_stage)

    return {
        "field": {"lat": req.lat, "lon": req.lon, "crop": req.crop},
        "weather_summary": {
            "days_observed": len(records),
            "total_rainfall_mm": round(sum(r.get("rainfall", 0) for r in records), 1),
            "avg_temp_c": round(
                sum(r.get("temperature_mean", 25) for r in records) / max(len(records), 1), 1
            ),
        },
        "cumulative_gdd": cumulative_gdd,
        "crop_stage": crop_stage,
        "stress_assessment": stress,
        "spray_windows": spray_windows[:3],
        "planting_windows": planting[:3],
        "recommendations": recommendations,
        "source": "AASRA | Meteoblue + CE Hub + Agriculture Engine",
    }


@router.get("/spray-window")
async def spray_window(
    lat: float = Query(...),
    lon: float = Query(...),
    spraying_type: str = Query("Herbicide", description="Herbicide|Insecticide|Fungicide|Biological"),
):
    """Get optimal spray windows for the next 7 days (CE Hub)."""
    windows = await get_spray_window(lat, lon, spraying_type=spraying_type, mode="future")
    return {"spray_windows": windows, "spraying_type": spraying_type}


@router.get("/planting-window")
async def planting_window(
    lat: float = Query(...),
    lon: float = Query(...),
    crop: str = Query("Soybean"),
):
    """Get optimal planting windows (CE Hub)."""
    windows = await get_planting_window(lat, lon, crop_type=crop, mode="future")
    return {"planting_windows": windows, "crop": crop}


@router.get("/disease-models")
async def disease_models():
    """List available disease risk models from CE Hub."""
    metadata = await get_disease_risk_metadata()
    return {"models": metadata, "count": len(metadata)}


def _estimate_crop_stage(cumulative_gdd: float, crop: str) -> dict:
    """Estimate crop growth stage from GDD accumulation."""
    crop = crop.lower()
    stages = {
        "soybean": [
            (0,   200,  "VE-V1", "Emergence to first trifoliate"),
            (200, 500,  "V2-V4", "Vegetative growth — rapid leaf development"),
            (500, 900,  "V5-R1", "Pre-flowering — critical nutrition window"),
            (900, 1400, "R1-R3", "Flowering to pod set — heat/drought sensitive"),
            (1400, 2000, "R4-R5", "Seed fill — yield-determining stage"),
            (2000, 3000, "R6-R7", "Maturation to harvest"),
        ],
        "corn": [
            (0, 150, "VE-V3", "Emergence to 3-leaf"),
            (150, 500, "V4-V6", "Rapid vegetative"),
            (500, 900, "V6-V10", "Stalk and ear development"),
            (900, 1300, "VT-R1", "Tasseling and silking — critical"),
            (1300, 1900, "R2-R4", "Blister to dough — grain fill"),
            (1900, 3100, "R5-R6", "Dent to black layer maturity"),
        ],
    }
    crop_stages = stages.get(crop, stages["soybean"])
    for gdd_min, gdd_max, stage_code, stage_desc in crop_stages:
        if gdd_min <= cumulative_gdd < gdd_max:
            return {
                "stage_code": stage_code,
                "description": stage_desc,
                "gdd_accumulated": round(cumulative_gdd, 1),
                "gdd_range": f"{gdd_min}–{gdd_max}",
                "pct_season_complete": round(cumulative_gdd / gdd_max * 100, 1),
            }
    if cumulative_gdd >= crop_stages[-1][1]:
        return {"stage_code": "R7+", "description": "Mature/harvest", "gdd_accumulated": round(cumulative_gdd, 1)}
    return {"stage_code": "Pre-emergence", "description": "Seed not yet germinated", "gdd_accumulated": 0}


def _build_recommendations(stress, spray_windows, planting, crop_stage) -> list:
    """Build prioritized recommendation list from all data sources."""
    recs = []

    if stress:
        scores = stress.get("stress_scores", {})
        heat_day = scores.get("heat_day", {})
        heat_night = scores.get("heat_night", {})
        frost = scores.get("frost", {})
        drought = scores.get("drought", {})

        if heat_day.get("score", 0) >= 4 or heat_night.get("score", 0) >= 4:
            recs.append({
                "priority": "HIGH",
                "product": "Stress Buster",
                "reason": f"Heat stress detected (day: {heat_day.get('score',0)}/9, night: {heat_night.get('score',0)}/9)",
                "action": "Apply Stress Buster within 48 hours to protect yield",
            })

        drought_di = drought.get("index", 99)
        if isinstance(drought_di, (int, float)) and drought_di < 1:
            recs.append({
                "priority": "HIGH",
                "product": "Stress Buster",
                "reason": f"Drought index {drought_di:.2f} — below threshold",
                "action": "Irrigate and apply Stress Buster to reduce drought impact",
            })

        stage = crop_stage.get("stage_code", "")
        if stage in ("V5-R1", "R1-R3"):
            recs.append({
                "priority": "MEDIUM",
                "product": "Nutrient Booster",
                "reason": f"Critical stage {stage} — high nutrient demand",
                "action": "Apply Nutrient Booster at recommended rate",
            })

        if stage in ("R4-R5", "R2-R4"):
            recs.append({
                "priority": "MEDIUM",
                "product": "Yield Booster",
                "reason": f"Grain/seed fill stage {stage} — yield formation active",
                "action": "Apply Yield Booster to maximize seed fill efficiency",
            })

    if spray_windows:
        next_window = spray_windows[0]
        recs.append({
            "priority": "INFO",
            "product": "Spray Window",
            "reason": "Optimal spray conditions identified by CE Hub",
            "action": f"Best spray window: {next_window.get('date', 'See spray_windows')}",
        })

    if not recs:
        recs.append({
            "priority": "LOW",
            "product": None,
            "reason": "Conditions are currently within normal range",
            "action": "Continue monitoring — check again in 3-5 days",
        })

    return recs
