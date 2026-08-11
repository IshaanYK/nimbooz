"""
AASRA PS-07 Intervention Journal Router
Allows farmers to log, track, and prove biological application outcomes.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter()

class JournalEntry(BaseModel):
    id: Optional[str] = None
    farmer_name: str
    field_name: str
    crop: str
    application_date: str
    product_name: str
    dose_per_ha: str
    treated_area_ha: float
    control_area_ha: float
    baseline_yield_kg: float
    treated_yield_kg: float
    product_cost_inr: float
    market_price_inr_per_kg: float
    notes: Optional[str] = ""

# In-memory storage for intervention journal entries
JOURNAL_STORE: List[dict] = [
    {
        "id": "entry-001",
        "farmer_name": "Ramesh Patel",
        "field_name": "Bhopal Soybean Field",
        "crop": "soybean",
        "application_date": "2026-07-10",
        "product_name": "Syngenta Stress Buster",
        "dose_per_ha": "500 ml / ha",
        "treated_area_ha": 4.2,
        "control_area_ha": 1.0,
        "baseline_yield_kg": 2200.0,
        "treated_yield_kg": 2450.0,
        "product_cost_inr": 600.0,
        "market_price_inr_per_kg": 38.0,
        "net_profit_gain_inr": 8900.0,
        "robi_ratio": 15.8,
        "notes": "Foliar spray during peak night heat stress. Photosynthesis preserved.",
    }
]

@router.get("/")
def get_journal_entries():
    """Returns all logged biological intervention journal entries."""
    return {"entries": JOURNAL_STORE}

@router.post("/")
def add_journal_entry(entry: JournalEntry):
    """Logs a new biological intervention and computes exact ROBI yield attribution."""
    extra_yield = entry.treated_yield_kg - entry.baseline_yield_kg
    extra_revenue = extra_yield * entry.market_price_inr_per_kg
    net_profit = extra_revenue - entry.product_cost_inr
    robi_ratio = (extra_revenue / entry.product_cost_inr) if entry.product_cost_inr > 0 else 0.0

    new_record = entry.dict()
    new_record["id"] = f"entry-{len(JOURNAL_STORE)+1:03d}"
    new_record["extra_yield_kg_per_ha"] = round(extra_yield, 2)
    new_record["net_profit_gain_inr"] = round(net_profit, 2)
    new_record["robi_ratio"] = round(robi_ratio, 2)

    JOURNAL_STORE.append(new_record)
    return {"status": "success", "record": new_record}
