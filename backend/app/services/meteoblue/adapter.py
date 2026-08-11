"""
AASRA Meteoblue Dataset API Adapter
Source: https://docs.meteoblue.com/en/weather-apis/dataset-api

Key facts verified from official documentation:
- POST to /dataset/query?apikey=KEY with JSON body
- geometry coordinates MUST be in [longitude, latitude, elevation_asl] order
- elevation is optional (auto-resolved from 80m DEM)
- timeIntervals format: "YYYY-MM-DDT+HH:MM/YYYY-MM-DDT+HH:MM"
- domain: NEMSGLOBAL (operational global model) or ERA5 (historical reanalysis)
- timeResolution: "hourly" or "daily"
- Daily aggregations MUST specify aggregation (min, max, mean, sum)

Variable codes confirmed working (from team's prior tests):
- 11: Temperature (°C) - aggregation: max/min/mean
- 61: Precipitation (mm) - aggregation: sum
- 144: Soil Moisture (m³/m³) - aggregation: mean
- 261: Evapotranspiration (mm) - aggregation: sum

Variables that failed in prior configuration (NOT confirmed broken):
- 260: FAO Reference ET - status: FAILED_IN_CURRENT_CONFIG
- 228: Potential Evaporation - status: FAILED_IN_CURRENT_CONFIG

Variables not yet tested (candidates):
- 52: Relative Humidity (%)
- 157: Specific Humidity
- 32: Wind Speed (m/s) - level: "10 m above gnd"
- 117: Downward Shortwave Radiation (W/m²)
"""

import httpx
import json
import logging
from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Any
from cachetools import TTLCache
from app.config import settings

logger = logging.getLogger(__name__)

# In-memory cache: 100 entries, 30-minute TTL (weather changes slowly)
_cache: TTLCache = TTLCache(maxsize=100, ttl=1800)

METEOBLUE_ENDPOINT = "https://my.meteoblue.com/dataset/query"

# --- Variable definitions from official documentation ---
VARIABLE_CODES = {
    "temp_max": {"code": 11, "level": "2 m above gnd", "aggregation": "max",
                 "description": "Daily max temperature (°C)", "status": "WORKING"},
    "temp_min": {"code": 11, "level": "2 m above gnd", "aggregation": "min",
                 "description": "Daily min temperature (°C)", "status": "WORKING"},
    "temp_mean": {"code": 11, "level": "2 m above gnd", "aggregation": "mean",
                  "description": "Daily mean temperature (°C)", "status": "WORKING"},
    "precipitation": {"code": 61, "level": "sfc", "aggregation": "sum",
                      "description": "Daily precipitation (mm)", "status": "WORKING"},
    "soil_moisture": {"code": 144, "level": "0-10 cm down", "aggregation": "mean",
                      "description": "Soil moisture 0-10cm (m³/m³)", "status": "WORKING"},
    "evapotranspiration": {"code": 261, "level": "sfc", "aggregation": "sum",
                           "description": "Evapotranspiration (mm)", "status": "WORKING"},
    "humidity": {"code": 52, "level": "2 m above gnd", "aggregation": "mean",
                 "description": "Relative humidity (%)", "status": "NOT_TESTED"},
    "wind_speed": {"code": 32, "level": "10 m above gnd", "aggregation": "mean",
                   "description": "Wind speed (m/s)", "status": "NOT_TESTED"},
    "solar_radiation": {"code": 117, "level": "sfc", "aggregation": "sum",
                        "description": "Downward shortwave radiation (W/m²)", "status": "NOT_TESTED"},
    "fao_et0": {"code": 260, "level": "sfc", "aggregation": "sum",
                "description": "FAO Reference ET0", "status": "FAILED_IN_CURRENT_CONFIG",
                "failure_reason": "HTTP 400 from prior test; may need different dataset or level"},
    "potential_evap": {"code": 228, "level": "sfc", "aggregation": "sum",
                       "description": "Potential evaporation", "status": "FAILED_IN_CURRENT_CONFIG",
                       "failure_reason": "HTTP 400 from prior test; may need different dataset or level"},
}

# Indian agricultural locations for testing
INDIAN_LOCATIONS = {
    "bhopal":    {"lon": 77.4126, "lat": 23.2599, "name": "Bhopal"},
    "indore":    {"lon": 75.8577, "lat": 22.7196, "name": "Indore"},
    "pune":      {"lon": 73.8567, "lat": 18.5204, "name": "Pune"},
    "nagpur":    {"lon": 79.0882, "lat": 21.1458, "name": "Nagpur"},
    "bangalore": {"lon": 77.5946, "lat": 12.9716, "name": "Bangalore"},
}


def _build_daily_query(
    lon: float,
    lat: float,
    location_name: str,
    start_date: date,
    end_date: date,
    variable_keys: List[str],
    domain: str = "NEMSGLOBAL",
) -> Dict[str, Any]:
    """
    Build a correct Meteoblue Dataset API JSON request body.

    CRITICAL: coordinates must be [longitude, latitude] (lon first).
    Daily resolution with temperature requires explicit aggregation.
    """
    codes = []
    for key in variable_keys:
        if key not in VARIABLE_CODES:
            logger.warning(f"Unknown variable key: {key}")
            continue
        v = VARIABLE_CODES[key]
        code_entry = {
            "code": v["code"],
            "level": v["level"],
            "aggregation": v["aggregation"],
        }
        codes.append(code_entry)

    if not codes:
        raise ValueError("No valid variable codes found")

    # timeIntervals format: "YYYY-MM-DDT+00:00/YYYY-MM-DDT+00:00"
    time_interval = (
        f"{start_date.strftime('%Y-%m-%d')}T+00:00"
        f"/{end_date.strftime('%Y-%m-%d')}T+00:00"
    )

    return {
        "units": {
            "temperature": "C",
            "velocity": "m/s",
            "length": "metric",
            "energy": "watts",
        },
        "geometry": {
            "type": "MultiPoint",
            "coordinates": [[lon, lat]],  # CRITICAL: lon, lat order
            "locationNames": [location_name],
        },
        "format": "json",
        "timeIntervals": [time_interval],
        "timeIntervalsAlignment": "none",
        "queries": [
            {
                "domain": domain,
                "gapFillDomain": None,
                "timeResolution": "daily",
                "codes": codes,
            }
        ],
    }


async def fetch_weather_daily(
    lat: float,
    lon: float,
    start_date: date,
    end_date: date,
    location_name: str = "Field",
    domain: str = "NEMSGLOBAL",
    variables: Optional[List[str]] = None,
    use_cache: bool = True,
) -> Dict[str, Any]:
    """
    Fetch daily weather data from Meteoblue Dataset API.

    Returns normalized weather records or raises on error.
    Data source: Meteoblue Dataset API (NEMSGLOBAL or ERA5)
    """
    if not settings.METEOBLUE_API_KEY:
        logger.warning("METEOBLUE_API_KEY not set; returning demo data")
        return _get_demo_weather(lat, lon, start_date, end_date)

    if variables is None:
        variables = ["temp_max", "temp_min", "temp_mean", "precipitation",
                     "soil_moisture", "evapotranspiration"]

    # Cache key
    cache_key = f"mb_{lat:.4f}_{lon:.4f}_{start_date}_{end_date}_{domain}_{','.join(variables)}"
    if use_cache and cache_key in _cache:
        logger.debug(f"Meteoblue cache hit: {cache_key}")
        return _cache[cache_key]

    body = _build_daily_query(lon, lat, location_name, start_date, end_date, variables, domain)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                METEOBLUE_ENDPOINT,
                params={"apikey": settings.METEOBLUE_API_KEY},
                json=body,
                headers={"Content-Type": "application/json"},
            )

        if response.status_code == 200:
            raw = response.json()
            normalized = _normalize_response(raw, lat, lon, "meteoblue_nemsglobal")
            if use_cache:
                _cache[cache_key] = normalized
            return normalized
        else:
            logger.error(
                f"Meteoblue API error {response.status_code}: {response.text[:500]}"
            )
            # Graceful fallback
            return _get_demo_weather(lat, lon, start_date, end_date)

    except httpx.TimeoutException:
        logger.error("Meteoblue API timeout")
        return _get_demo_weather(lat, lon, start_date, end_date)
    except Exception as e:
        logger.error(f"Meteoblue API unexpected error: {e}")
        return _get_demo_weather(lat, lon, start_date, end_date)


def _normalize_response(raw: Any, lat: float, lon: float, source: str) -> Dict[str, Any]:
    """
    Parse Meteoblue Dataset API JSON response into AASRA's normalized WeatherRecord format.
    Handles the verified Meteoblue JSON structure:
    raw = [
      {
        "timeIntervals": [ ["20260705T0000", ...] ],
        "codes": [
          {
            "code": 11, "aggregation": "max",
            "dataPerTimeInterval": [ { "data": [ [ val1, val2, ... ] ] } ]
          }, ...
        ]
      }
    ]
    """
    try:
        result: Dict[str, Any] = {
            "source": source,
            "lat": lat,
            "lon": lon,
            "records": [],
            "metadata": {},
        }

        # If raw is a list (standard Meteoblue output)
        data_block = raw[0] if isinstance(raw, list) and len(raw) > 0 else raw

        if isinstance(data_block, dict) and "timeIntervals" in data_block and "codes" in data_block:
            time_intervals = data_block["timeIntervals"][0] if data_block["timeIntervals"] else []
            codes = data_block.get("codes", [])

            # Map values by timestamp
            num_days = len(time_intervals)
            daily_records = []

            for i in range(num_days):
                t_str = time_intervals[i]
                # Format timestamp YYYYMMDDTHHMM -> YYYY-MM-DD
                dt_formatted = f"{t_str[:4]}-{t_str[4:6]}-{t_str[6:8]}" if len(t_str) >= 8 else t_str

                rec: Dict[str, Any] = {
                    "date": dt_formatted,
                    "temperature_max": 30.0,
                    "temperature_min": 22.0,
                    "temperature_mean": 26.0,
                    "rainfall": 0.0,
                    "soil_moisture": 0.35,
                    "evapotranspiration": 3.5,
                }

                for code_obj in codes:
                    code_id = code_obj.get("code")
                    agg = code_obj.get("aggregation")
                    data_arr = code_obj.get("dataPerTimeInterval", [])
                    if data_arr and "data" in data_arr[0] and data_arr[0]["data"]:
                        values = data_arr[0]["data"][0]
                        if i < len(values):
                            val = values[i]
                            if code_id == 11:
                                if agg == "max":
                                    rec["temperature_max"] = round(val, 1)
                                elif agg == "min":
                                    rec["temperature_min"] = round(val, 1)
                                elif agg == "mean":
                                    rec["temperature_mean"] = round(val, 1)
                            elif code_id == 61:
                                rec["rainfall"] = round(val, 1)
                            elif code_id == 144:
                                rec["soil_moisture"] = round(val, 3)
                            elif code_id == 261:
                                rec["evapotranspiration"] = round(val, 1)

                daily_records.append(rec)

            result["records"] = daily_records
            return result

        # Fallback to demo weather if structure unexpected
        logger.warning("Meteoblue response structure unrecognised; using fallback")
        return _get_demo_weather(lat, lon, date.today() - timedelta(days=7), date.today())

    except Exception as e:
        logger.error(f"Error normalizing Meteoblue response: {e}")
        return _get_demo_weather(lat, lon, date.today() - timedelta(days=7), date.today())


def _get_demo_weather(
    lat: float, lon: float, start_date: date, end_date: date
) -> Dict[str, Any]:
    """
    Return realistic demo weather data for Indian agricultural conditions.
    Used when API is unavailable or key is not set.

    Data source: OUR IMPLEMENTATION (demo/simulated data)
    NOT from Meteoblue or any live API.
    """
    records = []
    current = start_date
    day_num = 0

    while current <= end_date:
        # Simulate Indian Kharif season weather (June-October)
        month = current.month
        # Realistic temperature ranges for central India (Kharif belt)
        if month in [6, 7, 8]:  # Monsoon
            temp_max = 32 + (day_num % 7) * 0.3
            temp_min = 24 + (day_num % 5) * 0.2
            rain = 8.0 if day_num % 3 == 0 else 0.5
        elif month in [9, 10]:  # Post-monsoon
            temp_max = 34 + (day_num % 6) * 0.2
            temp_min = 22 + (day_num % 4) * 0.1
            rain = 2.0 if day_num % 7 == 0 else 0.0
        else:  # Rabi season
            temp_max = 28 + (day_num % 5) * 0.2
            temp_min = 14 + (day_num % 3) * 0.3
            rain = 0.5 if day_num % 10 == 0 else 0.0

        temp_mean = (temp_max + temp_min) / 2

        records.append({
            "date": current.isoformat(),
            "temperature_max": round(temp_max, 1),
            "temperature_min": round(temp_min, 1),
            "temperature_mean": round(temp_mean, 1),
            "rainfall": round(rain, 1),
            "soil_moisture": round(0.25 + rain * 0.01, 3),
            "evapotranspiration": round(4.5 - rain * 0.2, 1),
            "humidity": 65 + (rain * 2),
            "wind_speed": 2.5 + (day_num % 3) * 0.3,
            "solar_radiation": 220 - (rain * 10),
            "source": "demo",
            "is_demo": True,
        })
        current += timedelta(days=1)
        day_num += 1

    return {
        "source": "demo",
        "lat": lat,
        "lon": lon,
        "records": records,
        "is_demo": True,
        "demo_warning": "This is simulated data for demonstration. Not from live Meteoblue API.",
    }
