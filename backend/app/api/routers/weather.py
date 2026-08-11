"""Weather router — real data from Meteoblue + CE Hub stress indicators."""
from fastapi import APIRouter, Query
from datetime import date, timedelta
from app.services.meteoblue.adapter import fetch_weather_daily
from app.services.cehub.adapter import get_gdd, get_hydric_stress
from app.services.agriculture.engine import assess_field_stress, calc_cumulative_gdd

router = APIRouter()


@router.get("/current")
async def get_current_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    crop: str = Query("soybean", description="Crop type"),
):
    """
    Get current weather conditions + stress assessment for a field.
    Combines Meteoblue weather data with CE Hub GDD and our agriculture engine.
    """
    today = date.today()
    start = today - timedelta(days=7)

    # Fetch weather and GDD in parallel (would use asyncio.gather in production)
    weather = await fetch_weather_daily(lat, lon, start, today)
    gdd_data = await get_gdd(lat, lon, mode="past")
    hydric = await get_hydric_stress(lat, lon, mode="past")

    # Use last record for stress assessment
    records = weather.get("records", [])
    if records:
        latest = records[-1]
        stress = assess_field_stress(
            crop=crop,
            tmax=latest.get("temperature_max", 30),
            tmin=latest.get("temperature_min", 20),
            cumulative_rainfall_mm=sum(r.get("rainfall", 0) for r in records),
            cumulative_et_mm=sum(r.get("evapotranspiration", 0) for r in records),
            avg_soil_moisture_pct=latest.get("soil_moisture", 0.3) * 100,
            avg_temperature_c=latest.get("temperature_mean", 25),
        )
        cumulative_gdd = calc_cumulative_gdd(records, crop)
    else:
        stress = {}
        cumulative_gdd = 0

    return {
        "weather": weather,
        "stress_assessment": stress,
        "cumulative_gdd_7d": cumulative_gdd,
        "hydric_stress_latest": hydric[-3:] if hydric else [],
        "cehub_gdd_latest": gdd_data[-3:] if gdd_data else [],
    }


@router.get("/historical")
async def get_historical_weather(
    lat: float = Query(...),
    lon: float = Query(...),
    start_date: date = Query(default_factory=lambda: date.today() - timedelta(days=90)),
    end_date: date = Query(default_factory=date.today),
    crop: str = Query("soybean"),
):
    """Historical weather data using ERA5 reanalysis — for ROBI baseline computation."""
    weather = await fetch_weather_daily(lat, lon, start_date, end_date, domain="ERA5")
    records = weather.get("records", [])
    cumulative_gdd = calc_cumulative_gdd(records, crop)
    total_rainfall = sum(r.get("rainfall", 0) for r in records)
    avg_temp = (sum(r.get("temperature_mean", 25) for r in records) / len(records)) if records else 0

    return {
        "period": {"start": str(start_date), "end": str(end_date)},
        "crop": crop,
        "weather": weather,
        "season_summary": {
            "cumulative_gdd": cumulative_gdd,
            "total_rainfall_mm": round(total_rainfall, 1),
            "avg_temperature_c": round(avg_temp, 1),
            "days_observed": len(records),
        }
    }
