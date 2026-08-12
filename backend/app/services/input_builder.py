"""
Input Builder — Unified Decision-Engine Input Assembly

Combines outputs from:
  1. Image Analysis service  (crop detection, stress, NPK)
  2. Meteoblue Weather API   (temperature, humidity, soil moisture, wind, rain)
  3. CE Hub APIs             (hydric stress, GDD, spray window)
  4. Fallback crop input     (manual override when image analysis fails)

Produces a single flat JSON dict ready for the ML / rule-based advisory engine.
All missing values are replaced with safe defaults so downstream consumers
never need to handle None for numeric fields.
"""

import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────
# Safe defaults — conservative values that won't trigger false alarms
# ─────────────────────────────────────────────────────────────────

_DEFAULTS: Dict[str, Any] = {
    "crop": "unknown",
    "stress_type": "none",
    "image_severity": 0.0,
    "ml_stress": 0.0,
    "temperature": 25.0,
    "humidity": 60.0,
    "soil_moisture": 0.30,
    "rain_forecast": False,
    "wind_speed": 2.0,
    "hydric_stress": 0.0,
    "gdd": 0.0,
    "spray_window": False,
    "npk": None,
}


# ─────────────────────────────────────────────────────────────────
# Extraction helpers  (one per data source)
# ─────────────────────────────────────────────────────────────────

def _extract_image_fields(
    image_output: Optional[Dict[str, Any]],
    fallback_crop: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Pull crop, stress_type, image_severity, and npk from the
    image-analysis service output.

    If image_output is None or empty (i.e. image analysis failed),
    fall back to ``fallback_crop`` for the crop name and use safe defaults
    for every other field.
    """
    fields: Dict[str, Any] = {}

    if image_output:
        fields["crop"] = image_output.get("crop_detected") or fallback_crop or _DEFAULTS["crop"]
        fields["stress_type"] = image_output.get("stress_type", _DEFAULTS["stress_type"])
        fields["image_severity"] = _safe_float(image_output.get("severity"), _DEFAULTS["image_severity"])
        fields["npk"] = image_output.get("npk")  # None is a valid value
    else:
        logger.info("Image analysis unavailable; using fallback crop=%s", fallback_crop)
        fields["crop"] = fallback_crop or _DEFAULTS["crop"]
        fields["stress_type"] = _DEFAULTS["stress_type"]
        fields["image_severity"] = _DEFAULTS["image_severity"]
        fields["npk"] = _DEFAULTS["npk"]

    return fields


def _extract_weather_fields(weather_output: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Pull temperature, humidity, soil_moisture, rain_forecast, and wind_speed
    from the Meteoblue adapter output.

    Uses the *latest* record in the ``records`` list (most recent observation).
    """
    fields: Dict[str, Any] = {}

    latest = _latest_record(weather_output)

    if latest:
        fields["temperature"] = _safe_float(
            latest.get("temperature_mean"), _DEFAULTS["temperature"]
        )
        fields["humidity"] = _safe_float(
            latest.get("humidity"), _DEFAULTS["humidity"]
        )
        fields["soil_moisture"] = _safe_float(
            latest.get("soil_moisture"), _DEFAULTS["soil_moisture"]
        )
        fields["rain_forecast"] = bool(latest.get("rain_forecast", _DEFAULTS["rain_forecast"]))
        fields["wind_speed"] = _safe_float(
            latest.get("wind_speed"), _DEFAULTS["wind_speed"]
        )
    else:
        logger.info("Weather data unavailable; using defaults")
        for key in ("temperature", "humidity", "soil_moisture", "rain_forecast", "wind_speed"):
            fields[key] = _DEFAULTS[key]

    return fields


def _extract_cehub_fields(
    hydric_stress_data: Optional[List[Dict[str, Any]]],
    gdd_data: Optional[List[Dict[str, Any]]],
    spray_window_data: Optional[List[Dict[str, Any]]],
) -> Dict[str, Any]:
    """
    Pull hydric_stress, gdd, and spray_window from CE Hub API responses.

    CE Hub returns lists of daily records.  We take the latest entry for
    each metric and collapse it into a single scalar.
    """
    fields: Dict[str, Any] = {}

    # --- Hydric Stress ---
    # Records contain a numeric "value" field representing stress index.
    if hydric_stress_data:
        last = hydric_stress_data[-1] if isinstance(hydric_stress_data, list) else {}
        fields["hydric_stress"] = _safe_float(last.get("value"), _DEFAULTS["hydric_stress"])
    else:
        fields["hydric_stress"] = _DEFAULTS["hydric_stress"]

    # --- GDD ---
    # Records contain "accumlatedValue" (note: CE Hub typo) and "value".
    if gdd_data:
        last = gdd_data[-1] if isinstance(gdd_data, list) else {}
        # Prefer accumulated value; fall back to single-day value.
        gdd_val = last.get("accumlatedValue") or last.get("value")
        fields["gdd"] = _safe_float(gdd_val, _DEFAULTS["gdd"])
    else:
        fields["gdd"] = _DEFAULTS["gdd"]

    # --- Spray Window ---
    # If there is at least one spray-window record, a window is available.
    if spray_window_data and isinstance(spray_window_data, list) and len(spray_window_data) > 0:
        fields["spray_window"] = True
    else:
        fields["spray_window"] = _DEFAULTS["spray_window"]

    return fields


# ─────────────────────────────────────────────────────────────────
# Utility helpers
# ─────────────────────────────────────────────────────────────────

def _safe_float(value: Any, default: float) -> float:
    """Convert *value* to float; return *default* on failure."""
    if value is None:
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _latest_record(weather_output: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Return the last record from a Meteoblue adapter response, or None."""
    if not weather_output:
        return None
    records = weather_output.get("records")
    if records and isinstance(records, list) and len(records) > 0:
        return records[-1]
    return None


# ─────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────

def build_engine_input(
    image_analysis: Optional[Dict[str, Any]] = None,
    weather: Optional[Dict[str, Any]] = None,
    hydric_stress_data: Optional[List[Dict[str, Any]]] = None,
    gdd_data: Optional[List[Dict[str, Any]]] = None,
    spray_window_data: Optional[List[Dict[str, Any]]] = None,
    fallback_crop: Optional[str] = None,
    ml_stress_score: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Assemble a unified input dict for the advisory / decision engine.

    Parameters
    ----------
    image_analysis : dict | None
        Output from ``image_analysis.analyse_crop_image()``.
    weather : dict | None
        Output from ``meteoblue.adapter.fetch_weather_daily()``.
    hydric_stress_data : list | None
        Output from ``cehub.adapter.get_hydric_stress()``.
    gdd_data : list | None
        Output from ``cehub.adapter.get_gdd()``.
    spray_window_data : list | None
        Output from ``cehub.adapter.get_spray_window()``.
    fallback_crop : str | None
        Manual crop name; used when image analysis is unavailable.
    ml_stress_score : float | None
        External ML model stress prediction (0–1), if available.

    Returns
    -------
    dict
        Flat JSON-serialisable dict with the documented schema.
    """

    result: Dict[str, Any] = dict(_DEFAULTS)  # start from safe baseline

    # Layer in each data source (later layers overwrite defaults)
    result.update(_extract_image_fields(image_analysis, fallback_crop))
    result.update(_extract_weather_fields(weather))
    result.update(_extract_cehub_fields(hydric_stress_data, gdd_data, spray_window_data))

    # ML stress score (optional external signal)
    if ml_stress_score is not None:
        result["ml_stress"] = max(0.0, min(1.0, _safe_float(ml_stress_score, 0.0)))

    logger.debug("Engine input assembled: %s", result)
    return result
