"""Fields router — field management."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# In-memory store for demo (replace with DB in production)
_fields: dict = {}


class FieldCreate(BaseModel):
    name: str
    lat: float
    lon: float
    area_ha: float
    crop: str = "soybean"
    season_start: Optional[str] = None
    farmer_name: Optional[str] = None
    village: Optional[str] = None
    language: str = "en"


@router.post("/")
async def create_field(field: FieldCreate):
    field_id = f"field_{len(_fields) + 1}"
    _fields[field_id] = {**field.model_dump(), "id": field_id}
    return {"id": field_id, **field.model_dump(), "message": "Field registered"}


@router.get("/")
async def list_fields():
    return {"fields": list(_fields.values()), "count": len(_fields)}


@router.get("/{field_id}")
async def get_field(field_id: str):
    if field_id not in _fields:
        return {"error": "Field not found"}
    return _fields[field_id]


@router.get("/demo/bhopal")
async def demo_field():
    """Demo field — Bhopal soybean farm."""
    return {
        "id": "demo_bhopal",
        "name": "Ramesh's Soybean Field",
        "lat": 23.2599,
        "lon": 77.4126,
        "area_ha": 4.2,
        "crop": "soybean",
        "season_start": "2026-06-15",
        "farmer_name": "Ramesh Patel",
        "village": "Bhopal District",
        "language": "hi",
    }
