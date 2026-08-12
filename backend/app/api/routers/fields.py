"""
Fields router — Persistent Field Portfolio Store & Delete API.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import json
import os

router = APIRouter()

DB_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "data", "fields_db.json")
os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)


def _load_fields() -> dict:
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def _save_fields(data: dict):
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


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
    polygon: Optional[list] = None


@router.post("/")
async def create_field(field: FieldCreate):
    fields = _load_fields()
    field_id = f"field_{len(fields) + 1}"
    data = {**field.model_dump(), "id": field_id}
    fields[field_id] = data
    _save_fields(fields)
    return {"id": field_id, **data, "message": "Field registered successfully"}


@router.get("/")
async def list_fields():
    fields = _load_fields()
    return {"fields": list(fields.values()), "count": len(fields)}


@router.get("/{field_id}")
async def get_field(field_id: str):
    fields = _load_fields()
    if field_id not in fields:
        return {"error": "Field not found"}
    return fields[field_id]


@router.delete("/{field_id}")
async def delete_field(field_id: str):
    fields = _load_fields()
    if field_id in fields:
        del fields[field_id]
        _save_fields(fields)
        return {"status": "success", "message": f"Field {field_id} deleted"}
    return {"status": "error", "message": "Field not found"}


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
