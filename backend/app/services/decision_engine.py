"""
Decision Engine — Product Recommendation System

Consumes the unified input dict produced by ``input_builder.build_engine_input()``
and outputs a structured recommendation with product scores, confidence,
urgency, timing, and reasoning.

Pipeline:
  1. Load reference JSON data (products, crop stages)
  2. Compute scoring layers (ML stress, image severity, climate, hydric, stage, timing)
  3. Score each product against the input
  4. Normalise scores → 0-100
  5. Select best product
  6. Generate recommendation JSON
"""

import json
import logging
import os
from pathlib import Path
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────
# 1. Load reference JSON data
# ─────────────────────────────────────────────────────────────────

_DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "ps02-engine" / "data"

_products_cache: Optional[Dict[str, Any]] = None
_crop_stages_cache: Optional[Dict[str, Any]] = None


def _load_products() -> Dict[str, Any]:
    global _products_cache
    if _products_cache is None:
        path = _DATA_DIR / "products.json"
        try:
            with open(path, "r", encoding="utf-8") as f:
                _products_cache = json.load(f)
            logger.info("Loaded %d products from %s", len(_products_cache), path)
        except FileNotFoundError:
            logger.error("products.json not found at %s", path)
            _products_cache = {}
    return _products_cache


def _load_crop_stages() -> Dict[str, Any]:
    global _crop_stages_cache
    if _crop_stages_cache is None:
        path = _DATA_DIR / "crop_stages.json"
        try:
            with open(path, "r", encoding="utf-8") as f:
                _crop_stages_cache = json.load(f)
            logger.info("Loaded crop stages for %d crops from %s", len(_crop_stages_cache), path)
        except FileNotFoundError:
            logger.error("crop_stages.json not found at %s", path)
            _crop_stages_cache = {}
    return _crop_stages_cache


# ─────────────────────────────────────────────────────────────────
# 2. Compute scoring layers
# ─────────────────────────────────────────────────────────────────

def _ml_stress_layer(ml_stress: float) -> float:
    """Scale ML stress (0-1) → layer score (0-10)."""
    return round(min(max(ml_stress, 0.0), 1.0) * 10.0, 2)


def _image_severity_layer(image_severity: float) -> float:
    """Scale image severity (0-1) → layer score (0-10)."""
    return round(min(max(image_severity, 0.0), 1.0) * 10.0, 2)


def _climate_score(temperature: float, humidity: float, soil_moisture: float) -> float:
    """
    Compute a climate-driven stress score (0-10).

    High temperature + low soil moisture → higher stress.
    High humidity slightly mitigates heat but can signal disease risk.
    """
    # Temperature contribution: stress rises above 35°C, peaks near 45°C
    if temperature >= 45.0:
        temp_factor = 10.0
    elif temperature >= 35.0:
        temp_factor = (temperature - 35.0) / 10.0 * 10.0  # linear 0-10
    elif temperature <= 5.0:
        temp_factor = (5.0 - temperature) / 5.0 * 6.0  # cold stress
    else:
        temp_factor = 0.0

    # Soil moisture contribution: stress rises below 0.20 m³/m³
    if soil_moisture <= 0.05:
        moisture_factor = 10.0
    elif soil_moisture < 0.20:
        moisture_factor = (0.20 - soil_moisture) / 0.15 * 8.0
    else:
        moisture_factor = 0.0

    # Humidity modifier: very low humidity amplifies drought
    humidity_mod = 0.0
    if humidity < 30.0:
        humidity_mod = 2.0
    elif humidity > 85.0:
        humidity_mod = 1.5  # disease-conducive

    score = (temp_factor * 0.4) + (moisture_factor * 0.4) + (humidity_mod * 0.2)
    return round(min(score, 10.0), 2)


def _hydric_stress_layer(hydric_stress: float) -> float:
    """
    Scale CE Hub hydric-stress value → layer score (0-10).

    CE Hub values are typically 0-100 constraint indices.
    """
    if hydric_stress >= 100.0:
        return 10.0
    return round(max(hydric_stress / 10.0, 0.0), 2)


def _determine_stage(crop: str, gdd: float) -> str:
    """
    Map accumulated GDD to a crop growth stage using crop_stages.json.

    Returns one of: "early", "mid", "late", or "unknown".
    """
    stages = _load_crop_stages()
    crop_key = crop.lower()

    if crop_key not in stages:
        # Fallback: generic thresholds
        if gdd < 500:
            return "early"
        elif gdd < 1000:
            return "mid"
        else:
            return "late"

    crop_stages = stages[crop_key]
    for stage_name in ("late", "mid", "early"):  # check broadest range first
        bounds = crop_stages.get(stage_name)
        if bounds and len(bounds) == 2:
            if gdd >= bounds[0]:
                return stage_name
    return "early"


# ─────────────────────────────────────────────────────────────────
# 3. Product scoring
# ─────────────────────────────────────────────────────────────────

def _score_product(
    product_name: str,
    product_def: Dict[str, Any],
    inp: Dict[str, Any],
    layers: Dict[str, float],
    stage: str,
) -> float:
    """
    Score a single product against the current field situation.

    Base score starts at 5.  Bonuses and penalties are applied based
    on how well the product matches conditions.
    """
    score = 5.0

    stress_type = inp.get("stress_type", "none")
    rain_forecast = inp.get("rain_forecast", False)
    spray_window = inp.get("spray_window", False)

    targets = product_def.get("targets", [])
    ideal_stages = product_def.get("ideal_stage", [])
    rain_sensitivity = product_def.get("rain_sensitivity", "low")

    # +2 if detected stress type matches product targets
    if stress_type in targets:
        score += 2.0

    # +2 if current crop stage matches product's ideal stages
    if stage in ideal_stages:
        score += 2.0

    # Boost stress_buster when overall stress is high
    combined_stress = (layers["ml_stress"] + layers["image_severity"] + layers["climate"]) / 3.0
    if combined_stress > 5.0 and "heat" in targets or "drought" in targets:
        score += min(combined_stress / 5.0, 3.0)  # up to +3

    # -3 if rain is forecast AND product has high rain sensitivity
    if rain_forecast and rain_sensitivity == "high":
        score -= 3.0

    # +2 if spray window is available (good application conditions)
    if spray_window:
        score += 2.0

    # Minor boost from hydric stress alignment
    if layers["hydric"] > 5.0 and "drought" in targets:
        score += 1.0

    return round(score, 2)


# ─────────────────────────────────────────────────────────────────
# 4-5. Normalise & select
# ─────────────────────────────────────────────────────────────────

def _normalise_scores(raw_scores: Dict[str, float]) -> Dict[str, int]:
    """
    Normalise raw product scores to 0-100 integer range.

    Uses min-max scaling if there is variance; otherwise maps to 50.
    """
    if not raw_scores:
        return {}

    values = list(raw_scores.values())
    lo, hi = min(values), max(values)

    if hi == lo:
        return {k: 50 for k in raw_scores}

    return {
        k: int(round(((v - lo) / (hi - lo)) * 100))
        for k, v in raw_scores.items()
    }


def _compute_confidence(layers: Dict[str, float], inp: Dict[str, Any]) -> int:
    """
    Estimate overall confidence in the recommendation (0-100).

    Base = 60
    +10 if CE Hub data present
    +10 if image used
    +10 if NPK available
    +5 if crop detected via image
    Cap at 95
    """
    confidence = 60  # baseline

    # Boost if CE Hub data was available
    if inp.get("gdd", 0.0) > 0.0 or inp.get("hydric_stress", 0.0) > 0.0 or inp.get("spray_window", False):
        confidence += 10

    # Boost if image used
    # Assuming image was used if any of these fields are non-default or npk is present
    image_used = (
        inp.get("image_severity", 0.0) > 0.0 or
        inp.get("stress_type", "none") != "none" or
        inp.get("npk") is not None
    )
    if image_used:
        confidence += 10

    # Boost if NPK available
    if inp.get("npk") is not None:
        confidence += 10

    # Boost if crop detected via image (or fallback)
    if inp.get("crop", "unknown") != "unknown":
        confidence += 5

    return min(confidence, 95)


def _determine_urgency(inp: Dict[str, Any]) -> str:
    """
    Classify urgency based on ML stress score.

    Thresholds:
      > 0.7 → high
      > 0.4 → medium
      else  → low
    """
    ml_stress = inp.get("ml_stress", 0.0)

    if ml_stress > 0.7:
        return "high"
    elif ml_stress > 0.4:
        return "medium"
    else:
        return "low"


def _determine_timing(inp: Dict[str, Any], urgency: str) -> Tuple[str, str]:
    """
    Determine application window and duration based on spray window
    availability and urgency level.

    Returns (when_to_apply, duration).
    """
    spray_window = inp.get("spray_window", False)

    # When to apply
    if spray_window:
        when = "Within 24 hours"
    else:
        when = "Next spray window"

    # Duration based on urgency
    if urgency == "high":
        duration = "2\u20133 applications, 5\u20137 day gap"
    elif urgency == "medium":
        duration = "Single application"
    else:
        duration = "Monitor only"

    return when, duration


def _build_reasoning(
    best_product: str,
    inp: Dict[str, Any],
    layers: Dict[str, float],
    stage: str,
    urgency: str,
) -> str:
    """Generate a concise human-readable reasoning string."""
    parts = []

    crop = inp.get("crop", "unknown")
    stress = inp.get("stress_type", "none")

    parts.append(f"Crop: {crop} ({stage} stage)")

    if stress != "none":
        sev = inp.get("image_severity", 0.0)
        parts.append(f"Detected {stress} stress (severity {sev:.1f}/1.0)")

    if layers["climate"] > 3.0:
        parts.append(
            f"Climate stress elevated (temp {inp.get('temperature', 0):.1f}°C, "
            f"soil moisture {inp.get('soil_moisture', 0):.2f})"
        )

    if layers["hydric"] > 3.0:
        parts.append("Hydric stress detected from CE Hub")

    if inp.get("rain_forecast"):
        parts.append("Rain forecast in next 2-3 days")

    if inp.get("spray_window"):
        parts.append("Spray window available")

    parts.append(f"Recommended: {best_product} (urgency: {urgency})")

    return ". ".join(parts) + "."


# ─────────────────────────────────────────────────────────────────
# 6. Public API
# ─────────────────────────────────────────────────────────────────

def recommend(inp: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run the full decision pipeline on a unified input dict.

    Parameters
    ----------
    inp : dict
        Output from ``input_builder.build_engine_input()``.

    Returns
    -------
    dict
        Structured recommendation with scores, confidence, urgency,
        timing, duration, and reasoning.
    """

    # --- Step 1: Load reference data ---
    products = _load_products()
    if not products:
        logger.warning("No products loaded; returning empty recommendation")
        return _empty_recommendation("No product catalogue available")

    # --- Step 2: Compute scoring layers ---
    layers = {
        "ml_stress": _ml_stress_layer(inp.get("ml_stress", 0.0)),
        "image_severity": _image_severity_layer(inp.get("image_severity", 0.0)),
        "climate": _climate_score(
            inp.get("temperature", 25.0),
            inp.get("humidity", 60.0),
            inp.get("soil_moisture", 0.30),
        ),
        "hydric": _hydric_stress_layer(inp.get("hydric_stress", 0.0)),
    }

    stage = _determine_stage(inp.get("crop", "unknown"), inp.get("gdd", 0.0))

    logger.debug(
        "Layers: %s | Stage: %s | Spray window: %s",
        layers, stage, inp.get("spray_window"),
    )

    # --- Step 3: Score each product ---
    raw_scores: Dict[str, float] = {}
    for product_name, product_def in products.items():
        raw_scores[product_name] = _score_product(
            product_name, product_def, inp, layers, stage,
        )

    # --- Step 4: Normalise scores ---
    norm_scores = _normalise_scores(raw_scores)

    # --- Step 5: Select best product ---
    best_product = max(raw_scores, key=raw_scores.get)

    # --- Step 6: Generate recommendation ---
    confidence = _compute_confidence(layers, inp)
    urgency = _determine_urgency(inp)
    when_to_apply, duration = _determine_timing(inp, urgency)
    reasoning = _build_reasoning(best_product, inp, layers, stage, urgency)

    return {
        "recommended_product": best_product,
        "scores": norm_scores,
        "confidence": confidence,
        "urgency": urgency,
        "when_to_apply": when_to_apply,
        "duration": duration,
        "reasoning": reasoning,
    }


def _empty_recommendation(reason: str) -> Dict[str, Any]:
    """Return a safe empty recommendation when the engine cannot run."""
    return {
        "recommended_product": None,
        "scores": {},
        "confidence": 0,
        "urgency": "low",
        "when_to_apply": "Unable to determine",
        "duration": "Unable to determine",
        "reasoning": reason,
    }
