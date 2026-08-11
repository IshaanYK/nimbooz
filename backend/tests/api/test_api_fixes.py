"""
AASRA API Quick Fix Tests
Run after initial test suite to verify corrections.
"""
import asyncio, httpx, json, os
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent.parent / ".env")
METEOBLUE_KEY = os.getenv("METEOBLUE_API_KEY", "")
CEHUB_KEY = os.getenv("CEHUB_API_KEY", "")
CEHUB_BASE = os.getenv("CE_HUB_BASE_URL", "https://services.cehub.syngenta-ais.com")

BHOPAL = {"lat": 23.2599, "lon": 77.4126}

async def main():
    print("AASRA API CORRECTION TESTS\n")
    
    # --- METEOBLUE: Test alternative solar radiation codes ---
    print("[MB-FIX-1] Testing solar radiation alternatives (code 117 failed)...")
    endpoint = "https://my.meteoblue.com/dataset/query"
    today = datetime.now()
    end_dt = today - timedelta(days=7)
    start_dt = end_dt - timedelta(days=14)
    interval = f"{start_dt.strftime('%Y-%m-%d')}T+00:00/{end_dt.strftime('%Y-%m-%d')}T+00:00"
    
    # Try alternative solar/radiation codes
    solar_codes_to_try = [
        {"code": 45,  "level": "sfc", "aggregation": "sum", "desc": "Shortwave radiation (45)"},
        {"code": 60,  "level": "sfc", "aggregation": "sum", "desc": "Direct radiation (60)"},
        {"code": 1,   "level": "sfc", "aggregation": "sum", "desc": "Global radiation (1)"},
        {"code": 58,  "level": "2 m above gnd", "aggregation": "mean", "desc": "Relative humidity (58) — alt"},
        {"code": 71,  "level": "sfc", "aggregation": "mean", "desc": "Snowfall (71)"},
    ]
    
    async with httpx.AsyncClient(timeout=20.0) as client:
        for sc in solar_codes_to_try:
            body = {
                "units": {"temperature": "C", "velocity": "m/s", "length": "metric", "energy": "watts"},
                "geometry": {"type": "MultiPoint", "coordinates": [[BHOPAL["lon"], BHOPAL["lat"]]], "locationNames": ["Bhopal"]},
                "format": "json",
                "timeIntervals": [interval],
                "timeIntervalsAlignment": "none",
                "queries": [{"domain": "NEMSGLOBAL", "gapFillDomain": None, "timeResolution": "daily",
                              "codes": [{"code": sc["code"], "level": sc["level"], "aggregation": sc["aggregation"]}]}]
            }
            r = await client.post(endpoint, params={"apikey": METEOBLUE_KEY}, json=body)
            icon = "✅" if r.status_code == 200 else "❌"
            print(f"  {icon} {sc['desc']}: HTTP {r.status_code}")
            if r.status_code != 200:
                print(f"     Error: {r.text[:150]}")

    # --- CE HUB: GDD with all-past dates ---
    print("\n[CH-FIX-1] Testing CE Hub GDD with all-past date range...")
    headers = {"ApiKey": CEHUB_KEY, "Accept": "application/json"}
    past_end = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%dT00:00:00")
    past_start = (datetime.now() - timedelta(days=16)).strftime("%Y-%m-%dT00:00:00")
    
    async with httpx.AsyncClient(timeout=20.0) as client:
        r1 = await client.get(
            f"{CEHUB_BASE}/api/AgronomicsDecisionRecommendation/GDDRecommendation",
            params={"latitude": BHOPAL["lat"], "longitude": BHOPAL["lon"],
                    "startDate": past_start, "endDate": past_end,
                    "baseLimit": 10.0, "maxLimit": 35.0, "useEnhancedFormula": True},
            headers=headers,
        )
        icon = "✅" if r1.status_code == 200 else "❌"
        print(f"  {icon} GDD all-past: HTTP {r1.status_code}: {r1.text[:200]}")
        if r1.status_code == 200:
            with open("tests/api/responses/cehub_gdd_fixed.json", "w") as f:
                f.write(r1.text)
    
    # --- CE HUB: Future-only dates ---
    print("\n[CH-FIX-2] Testing CE Hub endpoints with future-only dates...")
    fut_start = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00")
    fut_end   = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%dT00:00:00")
    
    async with httpx.AsyncClient(timeout=20.0) as client:
        for path, params in [
            ("SprayWindowRecommendation", {"sprayingType": "Herbicide", "top": 5, "format": "json"}),
            ("PlantingWindowRecommendation", {"cropType": "Soybean"}),
            ("GDDRecommendation", {"baseLimit": 10.0, "maxLimit": 35.0, "useEnhancedFormula": True}),
        ]:
            p = {"latitude": BHOPAL["lat"], "longitude": BHOPAL["lon"],
                 "startDate": fut_start, "endDate": fut_end, **params}
            r = await client.get(f"{CEHUB_BASE}/api/AgronomicsDecisionRecommendation/{path}",
                                  params=p, headers=headers)
            icon = "✅" if r.status_code == 200 else "❌"
            print(f"  {icon} {path} (future): HTTP {r.status_code}: {r.text[:150]}")

    # --- CE HUB: Discover actual Swagger endpoints ---
    print("\n[CH-FIX-3] Scanning CE Hub for available endpoint groups...")
    async with httpx.AsyncClient(timeout=20.0) as client:
        for path in [
            "/swagger/v1/swagger.json",
            "/api/QuantisV2/Location",
            "/api/QuantisHistorical",
            "/api/QuantisHistorical/Summary",
            "/api/WeatherForecast",
            "/api/WeatherForecast/Summary",
            "/api/Historical",
            "/api/Historical/Summary",
        ]:
            r = await client.get(f"{CEHUB_BASE}{path}", headers=headers)
            icon = "✅" if r.status_code == 200 else ("⚠️" if r.status_code == 400 else "❌")
            preview = r.text[:120].replace("\n", " ")
            print(f"  {icon} {path}: HTTP {r.status_code}: {preview}")

    # --- CE Hub Disease Risk --- with proper endpoint
    print("\n[CH-FIX-4] CE Hub Disease Risk (Powdery Mildew / Septoria) for wheat/soybean...")
    async with httpx.AsyncClient(timeout=20.0) as client:
        # Use past dates (verified working)
        r2 = await client.get(
            f"{CEHUB_BASE}/api/DiseaseRisk/Summary",
            params={"latitude": BHOPAL["lat"], "longitude": BHOPAL["lon"],
                    "startDate": past_start, "endDate": past_end, "modelId": "SoybeanSDS"},
            headers=headers,
        )
        print(f"  DiseaseRisk Summary: HTTP {r2.status_code}: {r2.text[:200]}")
        
        for model_id in ["SclerotiniaWhiteMold", "SoybeanSDS", "TurcicumBlight", "Phytophthora"]:
            r3 = await client.get(
                f"{CEHUB_BASE}/api/DiseaseRisk",
                params={"latitude": BHOPAL["lat"], "longitude": BHOPAL["lon"],
                        "startDate": past_start, "endDate": past_end, "modelId": model_id},
                headers=headers,
            )
            icon = "✅" if r3.status_code == 200 else "❌"
            print(f"  {icon} DiseaseRisk/{model_id}: HTTP {r3.status_code}: {r3.text[:120]}")

asyncio.run(main())
