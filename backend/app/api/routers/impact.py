"""
Impact / ROBI router — PS-07 core.
RECORD → MEASURE → PROVE
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.agriculture.engine import calc_robi, calc_nue, calc_yield_risk

router = APIRouter()


class ROBIRequest(BaseModel):
    crop: str = "soybean"
    yield_with_treatment_kg_per_ha: float
    yield_without_treatment_kg_per_ha: float
    price_per_kg: float
    product_cost_per_ha: float
    application_cost_per_ha: float = 0
    field_area_ha: Optional[float] = None
    season: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class NUERequest(BaseModel):
    crop: str = "soybean"
    projected_yield_kg_per_ha: float
    nitrogen_applied_kg_per_ha: float
    actual_rainfall_mm: float
    actual_soil_moisture_pct: float


class YieldRiskRequest(BaseModel):
    crop: str = "soybean"
    actual_gdd: float
    actual_precip_mm: float
    actual_ph: Optional[float] = None
    actual_nitrogen_g_per_kg: Optional[float] = None


@router.post("/robi")
async def calculate_robi(req: ROBIRequest):
    """
    Calculate Return On Biological Investment (ROBI).
    
    ROBI = (Yield_gain × Price) / Total_Cost
    
    This is the core PS-07 metric — proving the value of biological interventions.
    """
    result = calc_robi(
        yield_with_treatment_kg_per_ha=req.yield_with_treatment_kg_per_ha,
        yield_without_treatment_kg_per_ha=req.yield_without_treatment_kg_per_ha,
        price_per_kg=req.price_per_kg,
        product_cost_per_ha=req.product_cost_per_ha,
        application_cost_per_ha=req.application_cost_per_ha,
    )

    # Add field-level totals if area provided
    if req.field_area_ha and "error" not in result:
        total_gain = result["net_gain_value"] * req.field_area_ha
        result["field_level"] = {
            "area_ha": req.field_area_ha,
            "total_net_gain": round(total_gain, 2),
            "total_yield_gain_kg": round(result["yield_gain_kg_per_ha"] * req.field_area_ha, 1),
        }

    result["metadata"] = {
        "crop": req.crop,
        "season": req.season,
        "location": req.location,
    }
    return result


@router.post("/nue")
async def calculate_nue(req: NUERequest):
    """Calculate Nitrogen Use Efficiency."""
    return calc_nue(
        crop=req.crop,
        projected_yield_kg_per_ha=req.projected_yield_kg_per_ha,
        nitrogen_applied_kg_per_ha=req.nitrogen_applied_kg_per_ha,
        actual_rainfall_mm=req.actual_rainfall_mm,
        actual_soil_moisture_pct=req.actual_soil_moisture_pct,
    )


@router.post("/yield-risk")
async def calculate_yield_risk(req: YieldRiskRequest):
    """Calculate Yield Risk score based on actual vs optimal growing conditions."""
    return calc_yield_risk(
        crop=req.crop,
        actual_gdd=req.actual_gdd,
        actual_precip_mm=req.actual_precip_mm,
        actual_ph=req.actual_ph,
        actual_nitrogen_g_per_kg=req.actual_nitrogen_g_per_kg,
    )


@router.get("/demo-robi")
async def demo_robi():
    """Demo ROBI calculation for a soybean field in Nagpur — for hackathon presentation."""
    result = calc_robi(
        yield_with_treatment_kg_per_ha=2850,
        yield_without_treatment_kg_per_ha=2600,
        price_per_kg=38.0,
        product_cost_per_ha=450,
        application_cost_per_ha=150,
    )
    result["context"] = {
        "location": "Nagpur, Maharashtra",
        "crop": "Soybean (Kharif 2025)",
        "product": "Stress Buster",
        "treatment_period": "July 15 – October 20, 2025",
        "weather_stress_events": [
            "3 heat stress events (day temp >35°C) in August",
            "14-day drought period in September",
        ],
        "data_sources": ["Meteoblue ERA5", "CE Hub GDD + Hydric Stress", "Farm yield records"],
        "note": "Demo data — replace with actual field measurements for real attribution",
    }
    return result
