"""
AASRA Agricultural Intelligence Engine
Source: Algorithm Logic Document (algorithm.docx)
        Extracted by team — August 2026

CRITICAL: These algorithms are DIRECTLY from the official Syngenta document.
DO NOT change thresholds or formulas without checking source document.

Covers:
1. Day-time heat stress (max temperature)
2. Night-time heat stress (min temperature)
3. Frost stress (min temperature)
4. Drought Risk Index (DI)
5. Yield Risk (YR)
6. Nitrogen Use Efficiency (NUE)
7. GDD (Growing Degree Days)
8. ROBI (Return On Biological Investment)
"""

from typing import Optional, Dict, Any, List, Tuple
import math

# ─────────────────────────────────────────────────────────────────
# CROP PARAMETERS — FROM ALGORITHM DOCUMENT (Table 1)
# ─────────────────────────────────────────────────────────────────

CROP_HEAT_DAY = {
    # (TMaxOptimum, TMaxLimit) — degrees Celsius
    "soybean": (32, 45),
    "corn":    (33, 44),
    "maize":   (33, 44),   # alias
    "cotton":  (32, 38),
    "rice":    (32, 38),
    "wheat":   (25, 32),
}

CROP_HEAT_NIGHT = {
    # (TMinOptimum, TMinLimit) — degrees Celsius
    "soybean": (22, 28),
    "corn":    (22, 28),
    "maize":   (22, 28),
    "cotton":  (20, 25),
    "rice":    (22, 28),
    "wheat":   (15, 20),
}

CROP_FROST = {
    # (TMinNoFrost, TMinFrost) — degrees Celsius
    # NA for rice and wheat (they have their own frost tolerance)
    "soybean": (4, -3),
    "corn":    (4, -3),
    "maize":   (4, -3),
    "cotton":  (4, -3),
    "rice":    None,   # NA
    "wheat":   None,   # NA
}

CROP_GDD_BASE_TEMP = {
    # Base temperature (Tbase) for GDD accumulation
    "soybean": 10.0,
    "corn":    10.0,
    "maize":   10.0,
    "cotton":  15.5,
    "rice":    10.0,
    "wheat":    0.0,
}

CROP_OPTIMAL = {
    # GDD_optimal, P_optimal_mm, pH_optimal, N_optimal_g_per_kg
    "soybean": {"gdd": (2400, 3000), "precip": (450, 700),  "ph": (6.0, 6.8), "n": (0.0, 0.026)},
    "corn":    {"gdd": (2700, 3100), "precip": (500, 800),  "ph": (6.0, 6.8), "n": (0.077, 0.154)},
    "maize":   {"gdd": (2700, 3100), "precip": (500, 800),  "ph": (6.0, 6.8), "n": (0.077, 0.154)},
    "cotton":  {"gdd": (2200, 2600), "precip": (700, 1300), "ph": (6.0, 6.5), "n": (0.051, 0.092)},
    "rice":    {"gdd": (2000, 2500), "precip": (1000, 1500), "ph": (5.5, 6.5), "n": (0.051, 0.103)},
    "wheat":   {"gdd": (2000, 2500), "precip": (1000, 1500), "ph": (5.5, 6.5), "n": (0.051, 0.103)},
}

CROP_NUE_OPTIMAL = {
    # (soil_moisture_pct_min, soil_moisture_pct_max, precip_mm_min, precip_mm_max)
    "soybean": {"sm": (50, 70), "precip": (450, 700)},
    "corn":    {"sm": (50, 70), "precip": (500, 800)},
    "maize":   {"sm": (50, 70), "precip": (500, 800)},
    "cotton":  {"sm": (50, 70), "precip": (700, 1300)},
    "rice":    {"sm": (80, 90), "precip": (1000, 1500)},
    "wheat":   {"sm": (80, 90), "precip": (1000, 1500)},
}


def _normalize_crop(crop: str) -> str:
    """Normalize crop name to lowercase."""
    return crop.lower().strip()


def _clamp(value: float, min_val: float = 0, max_val: float = 9) -> float:
    return max(min_val, min(max_val, value))


# ─────────────────────────────────────────────────────────────────
# 1. DAYTIME HEAT STRESS
# Source: Algorithm Doc §1 "Day time heat stress risk"
# ─────────────────────────────────────────────────────────────────

def calc_daytime_heat_stress(tmax: float, crop: str) -> Tuple[float, str]:
    """
    Calculate daytime heat stress score (0-9).
    
    0 = no stress, 9 = maximum stress.
    
    Formula (from document):
    - stress = 0 if TMAX <= TMaxOptimum
    - stress = 9 * (TMAX - TMaxOptimum) / (TMaxLimit - TMaxOptimum) if TMaxOptimum < TMAX < TMaxLimit
    - stress = 9 if TMAX >= TMaxLimit
    
    Returns: (stress_score, interpretation)
    """
    crop_key = _normalize_crop(crop)
    if crop_key not in CROP_HEAT_DAY:
        return 0.0, f"Unknown crop: {crop}"

    t_opt, t_lim = CROP_HEAT_DAY[crop_key]

    if tmax <= t_opt:
        score = 0.0
    elif tmax >= t_lim:
        score = 9.0
    else:
        score = 9.0 * (tmax - t_opt) / (t_lim - t_opt)

    score = _clamp(score)

    if score == 0:
        interp = "No heat stress"
    elif score <= 3:
        interp = "Mild heat stress — monitor"
    elif score <= 6:
        interp = "Moderate heat stress — Stress Buster recommended"
    else:
        interp = "Severe heat stress — immediate Stress Buster application"

    return round(score, 2), interp


# ─────────────────────────────────────────────────────────────────
# 2. NIGHTTIME HEAT STRESS
# Source: Algorithm Doc §2 "Nighttime heat stress risk"
# ─────────────────────────────────────────────────────────────────

def calc_nighttime_heat_stress(tmin: float, crop: str) -> Tuple[float, str]:
    """
    Calculate nighttime heat stress score (0-9).
    
    Warm nights reduce yield through accelerated respiration.
    
    Formula (from document):
    - stress = 0 if TMIN < TMinOptimum
    - stress = 9 * (TMIN - TMinOptimum) / (TMinLimit - TMinOptimum) if TMinOptimum <= TMIN < TMinLimit
    - stress = 9 if TMIN >= TMinLimit
    """
    crop_key = _normalize_crop(crop)
    if crop_key not in CROP_HEAT_NIGHT:
        return 0.0, f"Unknown crop: {crop}"

    t_opt, t_lim = CROP_HEAT_NIGHT[crop_key]

    if tmin < t_opt:
        score = 0.0
    elif tmin >= t_lim:
        score = 9.0
    else:
        score = 9.0 * (tmin - t_opt) / (t_lim - t_opt)

    score = _clamp(score)

    if score == 0:
        interp = "No nighttime heat stress"
    elif score <= 3:
        interp = "Mild night stress — respiration slightly elevated"
    elif score <= 6:
        interp = "Moderate night stress — yield impact possible, Stress Buster recommended"
    else:
        interp = "Severe night stress — high yield loss risk"

    return round(score, 2), interp


# ─────────────────────────────────────────────────────────────────
# 3. FROST STRESS
# Source: Algorithm Doc §3 "Frost stress"
# ─────────────────────────────────────────────────────────────────

def calc_frost_stress(tmin: float, crop: str) -> Tuple[float, str]:
    """
    Calculate frost stress score (0-9).
    
    Calculate when TMIN <= 4°C. If TMIN > 4°C, stress = 0.
    Rice and Wheat return NA (frost algorithms not defined for them).
    
    Formula (from document):
    - stress = 0 if TMIN >= TMinNoFrost
    - stress = 9 * ABS(TMIN - TMinNoFrost) / ABS(TminFrost - TMinNoFrost) if TMIN < TMinNoFrost
    - stress = 9 if TMIN <= TMinFrost
    """
    crop_key = _normalize_crop(crop)
    params = CROP_FROST.get(crop_key)

    if params is None:
        return 0.0, "Frost algorithm not applicable for this crop (use other indicators)"

    t_no_frost, t_frost = params

    if tmin >= t_no_frost:
        score = 0.0
    elif tmin <= t_frost:
        score = 9.0
    else:
        score = 9.0 * abs(tmin - t_no_frost) / abs(t_frost - t_no_frost)

    score = _clamp(score)

    if score == 0:
        interp = "No frost risk"
    elif score <= 3:
        interp = "Low frost risk — continue monitoring"
    elif score <= 6:
        interp = "Moderate frost risk — Stress Buster preventive application recommended"
    else:
        interp = "Severe frost risk — urgent protective measures needed"

    return round(score, 2), interp


# ─────────────────────────────────────────────────────────────────
# 4. DROUGHT RISK INDEX
# Source: Algorithm Doc §4 "Drought risk"
# ─────────────────────────────────────────────────────────────────

def calc_drought_index(
    cumulative_rainfall_mm: float,     # P
    cumulative_et_mm: float,           # E (evapotranspiration)
    avg_soil_moisture_pct: float,      # SM (as %)
    avg_temperature_c: float,          # T (average)
) -> Tuple[float, str]:
    """
    Calculate Drought Index (DI).
    
    Formula (from document): DI = (P - E) + SM / T
    
    Interpretation (from document):
    - DI > 1: No risk
    - DI = 1: Medium risk
    - DI < 1: Medium risk (note: doc says both 1 and <1 are medium)
    
    Note: DI > 1 is the target. Values well below 1 indicate drought.
    """
    if avg_temperature_c <= 0:
        return 0.0, "Temperature too low for drought index calculation"

    di = (cumulative_rainfall_mm - cumulative_et_mm) + (avg_soil_moisture_pct / avg_temperature_c)

    if di > 1:
        interp = "No drought risk — conditions adequate"
    elif di >= 0:
        interp = "Medium drought risk — Stress Buster recommended"
    else:
        interp = "High drought risk — urgent irrigation and Stress Buster application"

    return round(di, 3), interp


# ─────────────────────────────────────────────────────────────────
# 5. YIELD RISK
# Source: Algorithm Doc §5 "Yield risk"
# ─────────────────────────────────────────────────────────────────

def calc_yield_risk(
    crop: str,
    actual_gdd: float,
    actual_precip_mm: float,
    actual_ph: Optional[float] = None,
    actual_nitrogen_g_per_kg: Optional[float] = None,
    w1: float = 0.3,   # GDD weight
    w2: float = 0.3,   # Precipitation weight
    w3: float = 0.2,   # pH weight
    w4: float = 0.2,   # Nitrogen weight
) -> Dict[str, Any]:
    """
    Calculate Yield Risk (YR).
    
    Formula (from document):
    YR = w1*(GDD - GDD_opt)^2 + w2*(P - P_opt)^2 + w3*(pH - pH_opt)^2 + w4*(N - N_opt)^2
    
    Weights default from document: w1=0.3, w2=0.3, w3=0.2, w4=0.2
    """
    crop_key = _normalize_crop(crop)
    if crop_key not in CROP_OPTIMAL:
        return {"error": f"Unknown crop: {crop}"}

    opt = CROP_OPTIMAL[crop_key]
    gdd_opt = sum(opt["gdd"]) / 2     # midpoint
    p_opt   = sum(opt["precip"]) / 2  # midpoint

    yr = w1 * (actual_gdd - gdd_opt) ** 2 + w2 * (actual_precip_mm - p_opt) ** 2

    if actual_ph is not None:
        ph_opt = sum(opt["ph"]) / 2
        yr += w3 * (actual_ph - ph_opt) ** 2
    else:
        yr += 0  # skip pH component

    if actual_nitrogen_g_per_kg is not None:
        n_opt = sum(opt["n"]) / 2
        yr += w4 * (actual_nitrogen_g_per_kg - n_opt) ** 2
    else:
        yr += 0  # skip N component

    # Normalize to 0-100 risk score for interpretability
    # High YR raw value = high deviation from optimal = high risk
    # Map using a sigmoid-like function
    normalized = min(100, yr / 100)

    if normalized < 20:
        interpretation = "Low yield risk — conditions near optimal"
        recommendation = None
    elif normalized < 50:
        interpretation = "Moderate yield risk — Yield Booster recommended"
        recommendation = "Yield Booster"
    else:
        interpretation = "High yield risk — strong Yield Booster application recommended"
        recommendation = "Yield Booster (high dose)"

    return {
        "yield_risk_raw": round(yr, 2),
        "yield_risk_score": round(normalized, 1),
        "interpretation": interpretation,
        "recommendation": recommendation,
        "inputs": {
            "crop": crop,
            "actual_gdd": actual_gdd,
            "optimal_gdd": gdd_opt,
            "actual_precip_mm": actual_precip_mm,
            "optimal_precip_mm": p_opt,
            "actual_ph": actual_ph,
            "actual_n_g_per_kg": actual_nitrogen_g_per_kg,
        }
    }


# ─────────────────────────────────────────────────────────────────
# 6. GROWING DEGREE DAYS
# Source: Algorithm Doc §5
# ─────────────────────────────────────────────────────────────────

def calc_gdd_single_day(tmax: float, tmin: float, crop: str) -> float:
    """
    Calculate Growing Degree Days for a single day.
    
    Formula (from document):
    GDD = [(Tmax + Tmin) / 2] - Tbase
    
    If result is negative, GDD = 0 (no development below base temp).
    """
    crop_key = _normalize_crop(crop)
    tbase = CROP_GDD_BASE_TEMP.get(crop_key, 10.0)
    gdd = (tmax + tmin) / 2 - tbase
    return max(0.0, round(gdd, 2))


def calc_cumulative_gdd(
    weather_records: List[Dict[str, float]],
    crop: str,
) -> float:
    """
    Cumulate GDD over a list of weather records.
    Each record must have 'temperature_max' and 'temperature_min' keys.
    """
    total = 0.0
    for rec in weather_records:
        tmax = rec.get("temperature_max", 0)
        tmin = rec.get("temperature_min", 0)
        total += calc_gdd_single_day(tmax, tmin, crop)
    return round(total, 2)


# ─────────────────────────────────────────────────────────────────
# 7. NITROGEN USE EFFICIENCY
# Source: Algorithm Doc §6
# ─────────────────────────────────────────────────────────────────

def calc_nue(
    crop: str,
    projected_yield_kg_per_ha: float,
    nitrogen_applied_kg_per_ha: float,
    actual_rainfall_mm: float,
    actual_soil_moisture_pct: float,
) -> Dict[str, Any]:
    """
    Calculate Nitrogen Use Efficiency (NUE).
    
    Formula (from document):
    NUE = (Crop_yield / N_applied) * RF * SMF
    
    Where:
    - RF = rainfall factor (actual / optimal, capped at 1.5)
    - SMF = soil moisture factor (actual / optimal, capped at 1.5)
    
    Categories:
    - High NUE: > 40 kg yield / kg N applied
    - Moderate NUE: 20-40
    - Low NUE: < 20
    
    For Moderate and Low NUE: recommend biosimulant.
    """
    crop_key = _normalize_crop(crop)
    if nitrogen_applied_kg_per_ha <= 0:
        return {"error": "Nitrogen applied must be > 0"}

    opt = CROP_NUE_OPTIMAL.get(crop_key, {"sm": (50, 70), "precip": (450, 700)})
    optimal_precip = sum(opt["precip"]) / 2
    optimal_sm = sum(opt["sm"]) / 2

    rf = actual_rainfall_mm / optimal_precip if optimal_precip > 0 else 1.0
    rf = min(rf, 1.5)  # cap at 1.5

    smf = actual_soil_moisture_pct / optimal_sm if optimal_sm > 0 else 1.0
    smf = min(smf, 1.5)

    nue = (projected_yield_kg_per_ha / nitrogen_applied_kg_per_ha) * rf * smf

    if nue > 40:
        category = "High"
        recommendation = None
        interp = "Efficient nitrogen use — no biosimulant needed"
    elif nue >= 20:
        category = "Moderate"
        recommendation = "Nutrient Booster"
        interp = "Moderate NUE — Nutrient Booster recommended to improve efficiency"
    else:
        category = "Low"
        recommendation = "Nutrient Booster (priority)"
        interp = "Low NUE — Nutrient Booster strongly recommended"

    return {
        "nue": round(nue, 2),
        "nue_category": category,
        "interpretation": interp,
        "recommendation": recommendation,
        "rainfall_factor": round(rf, 3),
        "soil_moisture_factor": round(smf, 3),
    }


# ─────────────────────────────────────────────────────────────────
# 8. COMPOSITE STRESS ASSESSMENT
# ─────────────────────────────────────────────────────────────────

def assess_field_stress(
    crop: str,
    tmax: float,
    tmin: float,
    cumulative_rainfall_mm: float,
    cumulative_et_mm: float,
    avg_soil_moisture_pct: float,
    avg_temperature_c: float,
) -> Dict[str, Any]:
    """
    Comprehensive stress assessment for a field.
    Returns all stress scores and a unified recommendation.
    """
    heat_day_score, heat_day_interp = calc_daytime_heat_stress(tmax, crop)
    heat_night_score, heat_night_interp = calc_nighttime_heat_stress(tmin, crop)
    frost_score, frost_interp = calc_frost_stress(tmin, crop)
    drought_di, drought_interp = calc_drought_index(
        cumulative_rainfall_mm, cumulative_et_mm, avg_soil_moisture_pct, avg_temperature_c
    )

    # Determine priority recommendation
    max_heat = max(heat_day_score, heat_night_score)
    recommendations = []

    if max_heat >= 4 or frost_score >= 4:
        recommendations.append("Stress Buster")
    if drought_di < 1:
        recommendations.append("Stress Buster (drought)")

    primary_rec = recommendations[0] if recommendations else None

    return {
        "crop": crop,
        "stress_scores": {
            "heat_day": {"score": heat_day_score, "interpretation": heat_day_interp},
            "heat_night": {"score": heat_night_score, "interpretation": heat_night_interp},
            "frost": {"score": frost_score, "interpretation": frost_interp},
            "drought": {"index": drought_di, "interpretation": drought_interp},
        },
        "max_heat_stress": max_heat,
        "primary_recommendation": primary_rec,
        "intervention_needed": primary_rec is not None,
    }


# ─────────────────────────────────────────────────────────────────
# 9. ROBI — Return On Biological Investment
# Source: PS-07 strategic document
# ─────────────────────────────────────────────────────────────────

def calc_robi(
    yield_with_treatment_kg_per_ha: float,
    yield_without_treatment_kg_per_ha: float,
    price_per_kg: float,       # crop price
    product_cost_per_ha: float, # biosimulant cost
    application_cost_per_ha: float = 0,
) -> Dict[str, Any]:
    """
    Calculate ROBI (Return On Biological Investment).
    
    ROBI = [(Yield_with - Yield_without) * price - (product_cost + application_cost)] 
           / (product_cost + application_cost)
    
    Interpretation:
    - ROBI > 3:1 = Excellent — strong positive case
    - ROBI 2-3:1 = Good — recommend
    - ROBI 1-2:1 = Moderate — context-dependent
    - ROBI < 1:1 = Poor — re-evaluate
    """
    total_cost = product_cost_per_ha + application_cost_per_ha
    if total_cost <= 0:
        return {"error": "Total cost must be > 0"}

    yield_gain_kg = yield_with_treatment_kg_per_ha - yield_without_treatment_kg_per_ha
    gross_gain = yield_gain_kg * price_per_kg
    net_gain = gross_gain - total_cost
    robi = gross_gain / total_cost

    if robi >= 3:
        category = "Excellent"
        interpretation = f"ROBI {robi:.1f}:1 — exceptional return, strongly justify biosimulant"
    elif robi >= 2:
        category = "Good"
        interpretation = f"ROBI {robi:.1f}:1 — good return, recommend continued use"
    elif robi >= 1:
        category = "Moderate"
        interpretation = f"ROBI {robi:.1f}:1 — positive but modest return"
    else:
        category = "Poor"
        interpretation = f"ROBI {robi:.1f}:1 — investment not recovered, review application"

    confidence = "HIGH" if abs(yield_gain_kg) > 50 else "MEDIUM" if abs(yield_gain_kg) > 10 else "LOW"

    return {
        "robi_ratio": round(robi, 2),
        "robi_category": category,
        "yield_gain_kg_per_ha": round(yield_gain_kg, 1),
        "gross_gain_value": round(gross_gain, 2),
        "net_gain_value": round(net_gain, 2),
        "total_cost": round(total_cost, 2),
        "interpretation": interpretation,
        "attribution_confidence": confidence,
        "currency_note": "Values in same currency as price_per_kg input",
    }
