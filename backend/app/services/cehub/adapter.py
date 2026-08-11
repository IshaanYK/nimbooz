"""
AASRA CE Hub API Adapter
Source: https://services.cehub.syngenta-ais.com/swagger/index.html

VERIFIED WORKING ENDPOINTS (Live tested 2026-08-11):
1. GDDRecommendation - requires lat/lon, start/end dates (any range, past/future)
2. HydricStressRecommendation - requires waterAvailabilty (note API typo)
3. SprayWindowRecommendation - requires sprayingType: "Herbicide"|"Insecticide"|"Fungicide"
4. PlantingWindowRecommendation - requires cropType: "Soybean"|"Corn"|"Cotton" etc
5. ChillingUnitsRecommendation - lat/lon, start/end dates
6. PollinationHoursRecommendation - lat/lon, start/end dates
7. DiseaseRisk/Metadata - GET with no params required, returns list of models

ENDPOINTS NOT AVAILABLE (HTTP 404 confirmed):
- /api/DiseaseRisk - only Metadata works
- /api/QuantisV2/* - Not available on this API key
- /api/Quantis/* - Not available
- /api/Forecast/* - Not available
- /api/Historical/* - Not available
- /api/WeatherForecast/* - Not available

CRITICAL API CONSTRAINT (confirmed 2026-08-11):
- Date range CANNOT span from past to future (Error: "doesn't support requests starting in
  the past and ending in the future")
- Use EITHER all-past dates OR all-future dates
- Recommended: Use past dates for historical GDD; use future dates for spray window planning
"""

import httpx
import logging
from datetime import datetime, date, timedelta
from typing import Optional, Dict, Any, List
from cachetools import TTLCache
from app.config import settings

logger = logging.getLogger(__name__)

_cache: TTLCache = TTLCache(maxsize=50, ttl=3600)  # 1-hour cache (daily agro data)

CE_HUB_BASE = "https://services.cehub.syngenta-ais.com"

VALID_SPRAYING_TYPES = ["Herbicide", "Insecticide", "Fungicide", "Biological"]
VALID_CROP_TYPES = ["Soybean", "Corn", "Maize", "Cotton", "Wheat", "Rice", "Potato", "Sunflower"]

# Disease risk models from /api/DiseaseRisk/Metadata (tested 2026-08-11)
# Contains turf, crop, and ornamental disease models
DISEASE_METADATA_CACHED = None  # populated on first call


def _headers() -> Dict[str, str]:
    return {
        "ApiKey": settings.CEHUB_API_KEY,
        "Accept": "application/json",
    }


def _past_range(days_back: int = 14, days_end: int = 2):
    """Return a date range that is entirely in the past."""
    today = datetime.now()
    end = today - timedelta(days=days_end)
    start = end - timedelta(days=days_back)
    return start.strftime("%Y-%m-%dT00:00:00"), end.strftime("%Y-%m-%dT00:00:00")


def _future_range(days_start: int = 1, days_ahead: int = 7):
    """Return a date range that is entirely in the future."""
    today = datetime.now()
    start = today + timedelta(days=days_start)
    end = today + timedelta(days=days_ahead)
    return start.strftime("%Y-%m-%dT00:00:00"), end.strftime("%Y-%m-%dT00:00:00")


async def get_gdd(
    lat: float,
    lon: float,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    base_limit: float = 10.0,
    max_limit: float = 35.0,
    use_enhanced_formula: bool = True,
    mode: str = "past",  # "past" or "future"
) -> List[Dict[str, Any]]:
    """
    Fetch Growing Degree Days from CE Hub.
    
    IMPORTANT: start/end dates cannot span past-to-future boundary.
    Use mode="past" for historical accumulation or mode="future" for forecast.
    
    Returns list of: {requestLatitude, requestLongitude, date, value, type, accumlatedValue}
    """
    if not settings.CEHUB_API_KEY:
        return _demo_gdd(lat, lon)

    if start_date is None or end_date is None:
        if mode == "past":
            start_str, end_str = _past_range(14, 2)
        else:
            start_str, end_str = _future_range(1, 7)
    else:
        start_str = start_date.strftime("%Y-%m-%dT00:00:00")
        end_str = end_date.strftime("%Y-%m-%dT00:00:00")

    cache_key = f"cehub_gdd_{lat:.4f}_{lon:.4f}_{start_str}_{end_str}"
    if cache_key in _cache:
        return _cache[cache_key]

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.get(
                f"{CE_HUB_BASE}/api/AgronomicsDecisionRecommendation/GDDRecommendation",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "startDate": start_str,
                    "endDate": end_str,
                    "baseLimit": base_limit,
                    "maxLimit": max_limit,
                    "useEnhancedFormula": use_enhanced_formula,
                },
                headers=_headers(),
            )

        if r.status_code == 200:
            data = r.json()
            _cache[cache_key] = data
            return data
        else:
            logger.error(f"CE Hub GDD error {r.status_code}: {r.text[:200]}")
            return _demo_gdd(lat, lon)
    except Exception as e:
        logger.error(f"CE Hub GDD exception: {e}")
        return _demo_gdd(lat, lon)


async def get_hydric_stress(
    lat: float,
    lon: float,
    water_availability: int = 50,
    mode: str = "past",
) -> List[Dict[str, Any]]:
    """
    Fetch Hydric Stress Recommendation from CE Hub.
    
    Note: API parameter is "waterAvailabilty" (note the typo in the API — intentional spelling).
    water_availability: 0-100 (percentage of field capacity)
    
    Returns records with constraint codes and recommendations.
    """
    if not settings.CEHUB_API_KEY:
        return []

    start_str, end_str = _past_range(14, 2) if mode == "past" else _future_range(1, 7)

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.get(
                f"{CE_HUB_BASE}/api/AgronomicsDecisionRecommendation/HydricStressRecommendation",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "startDate": start_str,
                    "endDate": end_str,
                    "waterAvailabilty": water_availability,  # intentional API typo
                },
                headers=_headers(),
            )
        if r.status_code == 200:
            return r.json()
        else:
            logger.error(f"CE Hub Hydric Stress error {r.status_code}: {r.text[:200]}")
            return []
    except Exception as e:
        logger.error(f"CE Hub Hydric Stress exception: {e}")
        return []


async def get_spray_window(
    lat: float,
    lon: float,
    spraying_type: str = "Herbicide",
    mode: str = "future",
    top: int = 5,
) -> List[Dict[str, Any]]:
    """
    Fetch Spray Window Recommendation from CE Hub.
    
    spraying_type: "Herbicide" | "Insecticide" | "Fungicide" | "Biological"
    mode: "future" recommended for actionable spray planning.
    
    Returns list of optimal spray windows.
    """
    if not settings.CEHUB_API_KEY:
        return []
    if spraying_type not in VALID_SPRAYING_TYPES:
        logger.warning(f"Invalid spraying_type: {spraying_type}, using Herbicide")
        spraying_type = "Herbicide"

    start_str, end_str = _past_range(14, 2) if mode == "past" else _future_range(1, 7)

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.get(
                f"{CE_HUB_BASE}/api/AgronomicsDecisionRecommendation/SprayWindowRecommendation",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "startDate": start_str,
                    "endDate": end_str,
                    "sprayingType": spraying_type,
                    "top": top,
                    "format": "json",
                },
                headers=_headers(),
            )
        if r.status_code == 200:
            return r.json()
        else:
            logger.error(f"CE Hub Spray Window error {r.status_code}: {r.text[:200]}")
            return []
    except Exception as e:
        logger.error(f"CE Hub Spray Window exception: {e}")
        return []


async def get_planting_window(
    lat: float,
    lon: float,
    crop_type: str = "Soybean",
    mode: str = "future",
) -> List[Dict[str, Any]]:
    """
    Fetch Planting Window Recommendation from CE Hub.
    """
    if not settings.CEHUB_API_KEY:
        return []
    crop_type = crop_type.capitalize()
    if crop_type not in VALID_CROP_TYPES:
        logger.warning(f"Unrecognized crop_type: {crop_type}")

    start_str, end_str = _past_range(14, 2) if mode == "past" else _future_range(1, 14)

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.get(
                f"{CE_HUB_BASE}/api/AgronomicsDecisionRecommendation/PlantingWindowRecommendation",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "startDate": start_str,
                    "endDate": end_str,
                    "cropType": crop_type,
                },
                headers=_headers(),
            )
        if r.status_code == 200:
            return r.json()
        else:
            logger.error(f"CE Hub Planting Window error {r.status_code}: {r.text[:200]}")
            return []
    except Exception as e:
        logger.error(f"CE Hub Planting Window exception: {e}")
        return []


async def get_chilling_units(lat: float, lon: float, mode: str = "past") -> List[Dict]:
    """Fetch Chilling Units Recommendation from CE Hub."""
    if not settings.CEHUB_API_KEY:
        return []
    start_str, end_str = _past_range(30, 2) if mode == "past" else _future_range(1, 14)
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.get(
                f"{CE_HUB_BASE}/api/AgronomicsDecisionRecommendation/ChillingUnitsRecommendation",
                params={"latitude": lat, "longitude": lon, "startDate": start_str, "endDate": end_str},
                headers=_headers(),
            )
        return r.json() if r.status_code == 200 else []
    except Exception as e:
        logger.error(f"CE Hub Chilling Units exception: {e}")
        return []


async def get_disease_risk_metadata() -> List[Dict[str, Any]]:
    """
    Fetch Disease Risk Model Metadata from CE Hub.
    Returns list of available disease models with ModelID, ModelName, ModelDomain.
    
    NOTE: Only /api/DiseaseRisk/Metadata is available. Other DiseaseRisk endpoints return 404.
    """
    global DISEASE_METADATA_CACHED
    if DISEASE_METADATA_CACHED is not None:
        return DISEASE_METADATA_CACHED

    if not settings.CEHUB_API_KEY:
        return []

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.get(f"{CE_HUB_BASE}/api/DiseaseRisk/Metadata", headers=_headers())
        if r.status_code == 200:
            DISEASE_METADATA_CACHED = r.json()
            return DISEASE_METADATA_CACHED
        else:
            logger.error(f"CE Hub DiseaseRisk/Metadata error {r.status_code}: {r.text[:200]}")
            return []
    except Exception as e:
        logger.error(f"CE Hub Disease Metadata exception: {e}")
        return []


async def get_pollination_hours(lat: float, lon: float, mode: str = "future") -> List[Dict]:
    """Fetch Pollination Hours Recommendation from CE Hub."""
    if not settings.CEHUB_API_KEY:
        return []
    start_str, end_str = _past_range(7, 2) if mode == "past" else _future_range(1, 7)
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.get(
                f"{CE_HUB_BASE}/api/AgronomicsDecisionRecommendation/PollinationHoursRecommendation",
                params={"latitude": lat, "longitude": lon, "startDate": start_str, "endDate": end_str},
                headers=_headers(),
            )
        return r.json() if r.status_code == 200 else []
    except Exception as e:
        logger.error(f"CE Hub Pollination Hours exception: {e}")
        return []


def _demo_gdd(lat: float, lon: float) -> List[Dict[str, Any]]:
    """Demo GDD data when API is not available."""
    return [
        {"requestLatitude": lat, "requestLongitude": lon,
         "date": "2026/08/10 00:00:00", "value": 17.3, "type": "GDD",
         "accumlatedValue": 17.3, "is_demo": True},
    ]
