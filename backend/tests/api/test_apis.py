"""
AASRA API Live Test Script
Tests Meteoblue and CE Hub APIs with real credentials.

SECURITY: Reads credentials from .env only. Never prints keys.
Run from: F:\hyperion\backend\
Command: python tests/api/test_apis.py
"""

import asyncio
import httpx
import json
import os
import sys
import pytest
from datetime import date, datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory
load_dotenv(Path(__file__).parent.parent.parent / ".env")

METEOBLUE_KEY = os.getenv("METEOBLUE_API_KEY", "")
CEHUB_KEY = os.getenv("CEHUB_API_KEY", "")
CEHUB_BASE = os.getenv("CE_HUB_BASE_URL", "https://services.cehub.syngenta-ais.com")
METEOBLUE_BASE = os.getenv("METEOBLUE_BASE_URL", "https://my.meteoblue.com")

# Test locations — Indian agricultural belt
BHOPAL = {"lat": 23.2599, "lon": 77.4126, "name": "Bhopal"}
PUNE   = {"lat": 18.5204, "lon": 73.8567, "name": "Pune"}
NAGPUR = {"lat": 21.1458, "lon": 79.0882, "name": "Nagpur"}

results = {}


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def log(label, status, detail=""):
    icon = "✅" if status == "WORKING" else ("⚠️" if status == "PARTIAL" else "❌")
    print(f"  {icon} {label}: {status}", f"— {detail}" if detail else "")
    results[label] = {"status": status, "detail": detail}


def safe_truncate(data, n=200):
    s = json.dumps(data) if not isinstance(data, str) else data
    return s[:n] + "..." if len(s) > n else s


# ─────────────────────────────────────────────
# METEOBLUE TESTS
# ─────────────────────────────────────────────

@pytest.mark.asyncio
async def test_meteoblue():
    print("\n" + "="*60)
    print("METEOBLUE DATASET API TESTS")
    print("="*60)

    if not METEOBLUE_KEY:
        print("  ❌ METEOBLUE_API_KEY not set in .env")
        return

    print(f"  Key loaded: {'*' * (len(METEOBLUE_KEY) - 4)}{METEOBLUE_KEY[-4:]}")

    endpoint = f"{METEOBLUE_BASE}/dataset/query"

    loc = BHOPAL
    # Historical: 30 days ago to 7 days ago (safely in the past)
    end_dt = date.today() - timedelta(days=7)
    start_dt = end_dt - timedelta(days=30)

    time_interval = (
        f"{start_dt.strftime('%Y-%m-%d')}T+00:00"
        f"/{end_dt.strftime('%Y-%m-%d')}T+00:00"
    )

    # Test 1: Confirmed working variables (from prior team tests)
    print("\n  [TEST 1] Confirmed variables: Temperature + Precipitation + Soil Moisture")
    body = {
        "units": {"temperature": "C", "velocity": "m/s", "length": "metric", "energy": "watts"},
        "geometry": {
            "type": "MultiPoint",
            "coordinates": [[loc["lon"], loc["lat"]]],  # lon, lat order
            "locationNames": [loc["name"]],
        },
        "format": "json",
        "timeIntervals": [time_interval],
        "timeIntervalsAlignment": "none",
        "queries": [{
            "domain": "NEMSGLOBAL",
            "gapFillDomain": None,
            "timeResolution": "daily",
            "codes": [
                {"code": 11, "level": "2 m above gnd", "aggregation": "max"},    # Temp max
                {"code": 11, "level": "2 m above gnd", "aggregation": "min"},    # Temp min
                {"code": 11, "level": "2 m above gnd", "aggregation": "mean"},   # Temp mean
                {"code": 61, "level": "sfc", "aggregation": "sum"},               # Precipitation
                {"code": 144, "level": "0-10 cm down", "aggregation": "mean"},   # Soil moisture
            ]
        }]
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            endpoint,
            params={"apikey": METEOBLUE_KEY},
            json=body,
            headers={"Content-Type": "application/json"},
        )

    if resp.status_code == 200:
        data = resp.json()
        # Save response (no keys in output)
        Path("tests/api/responses").mkdir(parents=True, exist_ok=True)
        with open("tests/api/responses/meteoblue_test1.json", "w") as f:
            json.dump(data, f, indent=2)
        keys = list(data.keys()) if isinstance(data, dict) else "array"
        log("MB-T1: Temp+Precip+SoilMoisture", "WORKING", f"Response keys: {keys}")
    else:
        log("MB-T1: Temp+Precip+SoilMoisture", "FAILED", f"HTTP {resp.status_code}: {resp.text[:300]}")

    # Test 2: Evapotranspiration (code 261)
    print("\n  [TEST 2] Evapotranspiration (code 261)")
    body2 = {
        "units": {"temperature": "C", "velocity": "m/s", "length": "metric", "energy": "watts"},
        "geometry": {
            "type": "MultiPoint",
            "coordinates": [[loc["lon"], loc["lat"]]],
            "locationNames": [loc["name"]],
        },
        "format": "json",
        "timeIntervals": [time_interval],
        "timeIntervalsAlignment": "none",
        "queries": [{
            "domain": "NEMSGLOBAL",
            "gapFillDomain": None,
            "timeResolution": "daily",
            "codes": [
                {"code": 261, "level": "sfc", "aggregation": "sum"},
            ]
        }]
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp2 = await client.post(endpoint, params={"apikey": METEOBLUE_KEY}, json=body2)
    if resp2.status_code == 200:
        log("MB-T2: Evapotranspiration", "WORKING", f"HTTP 200")
        with open("tests/api/responses/meteoblue_et.json", "w") as f:
            json.dump(resp2.json(), f, indent=2)
    else:
        log("MB-T2: Evapotranspiration", "FAILED", f"HTTP {resp2.status_code}: {resp2.text[:200]}")

    # Test 3: Humidity + Wind + Solar Radiation
    print("\n  [TEST 3] Humidity (52) + Wind (32) + Solar Radiation (117)")
    body3 = {
        "units": {"temperature": "C", "velocity": "m/s", "length": "metric", "energy": "watts"},
        "geometry": {
            "type": "MultiPoint",
            "coordinates": [[loc["lon"], loc["lat"]]],
            "locationNames": [loc["name"]],
        },
        "format": "json",
        "timeIntervals": [time_interval],
        "timeIntervalsAlignment": "none",
        "queries": [{
            "domain": "NEMSGLOBAL",
            "gapFillDomain": None,
            "timeResolution": "daily",
            "codes": [
                {"code": 52,  "level": "2 m above gnd", "aggregation": "mean"},
                {"code": 32,  "level": "10 m above gnd", "aggregation": "mean"},
                {"code": 117, "level": "sfc", "aggregation": "sum"},
            ]
        }]
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp3 = await client.post(endpoint, params={"apikey": METEOBLUE_KEY}, json=body3)
    if resp3.status_code == 200:
        log("MB-T3: Humidity+Wind+Solar", "WORKING", "HTTP 200")
        with open("tests/api/responses/meteoblue_humidity_wind_solar.json", "w") as f:
            json.dump(resp3.json(), f, indent=2)
    else:
        log("MB-T3: Humidity+Wind+Solar", "FAILED", f"HTTP {resp3.status_code}: {resp3.text[:200]}")

    # Test 4: FAO ET0 (code 260) — previously failed
    print("\n  [TEST 4] FAO Reference ET0 (code 260) — previously reported failed")
    body4 = {
        "units": {"temperature": "C", "velocity": "m/s", "length": "metric", "energy": "watts"},
        "geometry": {
            "type": "MultiPoint",
            "coordinates": [[loc["lon"], loc["lat"]]],
            "locationNames": [loc["name"]],
        },
        "format": "json",
        "timeIntervals": [time_interval],
        "timeIntervalsAlignment": "none",
        "queries": [{
            "domain": "NEMSGLOBAL",
            "gapFillDomain": None,
            "timeResolution": "daily",
            "codes": [{"code": 260, "level": "sfc", "aggregation": "sum"}]
        }]
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp4 = await client.post(endpoint, params={"apikey": METEOBLUE_KEY}, json=body4)
    if resp4.status_code == 200:
        log("MB-T4: FAO ET0 (260)", "WORKING", "Now working!")
    else:
        log("MB-T4: FAO ET0 (260)", "FAILED_CONFIRMED", f"HTTP {resp4.status_code}: {resp4.text[:200]}")

    # Test 5: ERA5 historical (confirmed reliable)
    print("\n  [TEST 5] ERA5 historical reanalysis — Nagpur soybean region")
    loc2 = NAGPUR
    era5_start = date(2025, 6, 1)
    era5_end   = date(2025, 10, 31)
    body5 = {
        "units": {"temperature": "C", "velocity": "m/s", "length": "metric", "energy": "watts"},
        "geometry": {
            "type": "MultiPoint",
            "coordinates": [[loc2["lon"], loc2["lat"]]],
            "locationNames": [loc2["name"]],
        },
        "format": "json",
        "timeIntervals": [f"{era5_start}T+00:00/{era5_end}T+00:00"],
        "timeIntervalsAlignment": "none",
        "queries": [{
            "domain": "ERA5",
            "gapFillDomain": None,
            "timeResolution": "daily",
            "codes": [
                {"code": 11,  "level": "2 m above gnd", "aggregation": "max"},
                {"code": 11,  "level": "2 m above gnd", "aggregation": "min"},
                {"code": 61,  "level": "sfc", "aggregation": "sum"},
            ]
        }]
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp5 = await client.post(endpoint, params={"apikey": METEOBLUE_KEY}, json=body5)
    if resp5.status_code == 200:
        data5 = resp5.json()
        log("MB-T5: ERA5 Historical Nagpur", "WORKING", f"Keys: {list(data5.keys()) if isinstance(data5, dict) else 'list'}")
        with open("tests/api/responses/meteoblue_era5_nagpur.json", "w") as f:
            json.dump(data5, f, indent=2)
    else:
        log("MB-T5: ERA5 Historical Nagpur", "FAILED", f"HTTP {resp5.status_code}: {resp5.text[:300]}")


# ─────────────────────────────────────────────
# CE HUB TESTS
# ─────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cehub():
    print("\n" + "="*60)
    print("CE HUB API TESTS")
    print("="*60)

    if not CEHUB_KEY:
        print("  ❌ CEHUB_API_KEY not set in .env")
        return

    print(f"  Key loaded: {'*' * (len(CEHUB_KEY) - 8)}{CEHUB_KEY[-8:]}")

    headers = {
        "ApiKey": CEHUB_KEY,
        "Accept": "application/json",
    }
    loc = BHOPAL
    today = datetime.now()
    start_dt = (today - timedelta(days=14)).strftime("%Y-%m-%dT00:00:00")
    end_dt   = today.strftime("%Y-%m-%dT00:00:00")
    future_end = (today + timedelta(days=7)).strftime("%Y-%m-%dT00:00:00")

    Path("tests/api/responses").mkdir(parents=True, exist_ok=True)

    async with httpx.AsyncClient(timeout=30.0) as client:

        # Test 1: GDD Recommendation — lat/lon, no WKT
        print("\n  [TEST 1] GDD Recommendation (lat/lon, no WKT)")
        r1 = await client.get(
            f"{CEHUB_BASE}/api/AgronomicsDecisionRecommendation/GDDRecommendation",
            params={
                "latitude": loc["lat"],
                "longitude": loc["lon"],
                "startDate": start_dt,
                "endDate": end_dt,
                "baseLimit": 10.0,
                "maxLimit": 35.0,
                "useEnhancedFormula": True,
            },
            headers=headers,
        )
        if r1.status_code == 200:
            log("CH-T1: GDD Recommendation", "WORKING", safe_truncate(r1.text))
            with open("tests/api/responses/cehub_gdd.json", "w") as f:
                f.write(r1.text)
        else:
            log("CH-T1: GDD Recommendation", "FAILED", f"HTTP {r1.status_code}: {r1.text[:300]}")

        # Test 2: Hydric Stress — lat/lon, waterAvailability required
        print("\n  [TEST 2] Hydric Stress (lat/lon)")
        r2 = await client.get(
            f"{CEHUB_BASE}/api/AgronomicsDecisionRecommendation/HydricStressRecommendation",
            params={
                "latitude": loc["lat"],
                "longitude": loc["lon"],
                "startDate": start_dt,
                "endDate": end_dt,
                "waterAvailabilty": 50,  # note: API has typo "Availabilty"
            },
            headers=headers,
        )
        if r2.status_code == 200:
            log("CH-T2: Hydric Stress", "WORKING", safe_truncate(r2.text))
            with open("tests/api/responses/cehub_hydric_stress.json", "w") as f:
                f.write(r2.text)
        else:
            log("CH-T2: Hydric Stress", "FAILED", f"HTTP {r2.status_code}: {r2.text[:300]}")

        # Test 3: Spray Window Recommendation — lat/lon
        print("\n  [TEST 3] Spray Window (lat/lon, sprayingType required)")
        r3 = await client.get(
            f"{CEHUB_BASE}/api/AgronomicsDecisionRecommendation/SprayWindowRecommendation",
            params={
                "latitude": loc["lat"],
                "longitude": loc["lon"],
                "startDate": start_dt,
                "endDate": end_dt,
                "sprayingType": "Herbicide",
                "top": 10,
                "format": "json",
            },
            headers=headers,
        )
        if r3.status_code == 200:
            log("CH-T3: Spray Window", "WORKING", safe_truncate(r3.text))
            with open("tests/api/responses/cehub_spray_window.json", "w") as f:
                f.write(r3.text)
        else:
            log("CH-T3: Spray Window", "FAILED", f"HTTP {r3.status_code}: {r3.text[:300]}")

        # Test 4: Planting Window Recommendation
        print("\n  [TEST 4] Planting Window (lat/lon, cropType required)")
        r4 = await client.get(
            f"{CEHUB_BASE}/api/AgronomicsDecisionRecommendation/PlantingWindowRecommendation",
            params={
                "latitude": loc["lat"],
                "longitude": loc["lon"],
                "startDate": start_dt,
                "endDate": end_dt,
                "cropType": "Soybean",
            },
            headers=headers,
        )
        if r4.status_code == 200:
            log("CH-T4: Planting Window", "WORKING", safe_truncate(r4.text))
            with open("tests/api/responses/cehub_planting_window.json", "w") as f:
                f.write(r4.text)
        else:
            log("CH-T4: Planting Window", "FAILED", f"HTTP {r4.status_code}: {r4.text[:300]}")

        # Test 5: Disease Risk Metadata — get supported models first
        print("\n  [TEST 5] Disease Risk Metadata")
        r5 = await client.get(
            f"{CEHUB_BASE}/api/DiseaseRisk/Metadata",
            headers=headers,
        )
        if r5.status_code == 200:
            meta = r5.json() if r5.headers.get("content-type", "").startswith("application/json") else r5.text
            log("CH-T5: Disease Risk Metadata", "WORKING", safe_truncate(meta))
            with open("tests/api/responses/cehub_disease_metadata.json", "w") as f:
                f.write(r5.text)
        else:
            log("CH-T5: Disease Risk Metadata", "FAILED", f"HTTP {r5.status_code}: {r5.text[:300]}")

        # Test 6: Forecast
        print("\n  [TEST 6] Forecast endpoint")
        # Try common forecast paths
        for forecast_path in ["/api/Forecast/ShortTermForecast", "/api/Forecast/DailyForecast", "/api/Forecast"]:
            r6 = await client.get(
                f"{CEHUB_BASE}{forecast_path}",
                params={"latitude": loc["lat"], "longitude": loc["lon"]},
                headers=headers,
            )
            if r6.status_code == 200:
                log(f"CH-T6: Forecast ({forecast_path})", "WORKING", safe_truncate(r6.text))
                with open("tests/api/responses/cehub_forecast.json", "w") as f:
                    f.write(r6.text)
                break
            elif r6.status_code == 404:
                log(f"CH-T6: Forecast ({forecast_path})", "NOT_FOUND", "404")
            else:
                log(f"CH-T6: Forecast ({forecast_path})", "FAILED", f"HTTP {r6.status_code}: {r6.text[:200]}")

        # Test 7: Location Search
        print("\n  [TEST 7] Location Search")
        for loc_path in ["/api/LocationSearch", "/api/Common/LocationSearch"]:
            r7 = await client.get(
                f"{CEHUB_BASE}{loc_path}",
                params={"latitude": loc["lat"], "longitude": loc["lon"]},
                headers=headers,
            )
            if r7.status_code == 200:
                log(f"CH-T7: Location Search ({loc_path})", "WORKING", safe_truncate(r7.text))
                with open("tests/api/responses/cehub_location.json", "w") as f:
                    f.write(r7.text)
                break
            elif r7.status_code == 404:
                log(f"CH-T7: Location Search ({loc_path})", "NOT_FOUND", "404")
            else:
                log(f"CH-T7: Location Search ({loc_path})", "FAILED", f"HTTP {r7.status_code}: {r7.text[:200]}")

        # Test 8: Quantis V2 — check what endpoint format it needs
        print("\n  [TEST 8] QuantisV2 metadata")
        for q_path in ["/api/QuantisV2", "/api/QuantisV2/Metadata", "/api/Quantis"]:
            r8 = await client.get(f"{CEHUB_BASE}{q_path}", headers=headers)
            if r8.status_code in [200, 400]:
                log(f"CH-T8: QuantisV2 ({q_path})", "REACHABLE", f"HTTP {r8.status_code}: {r8.text[:200]}")
                with open("tests/api/responses/cehub_quantis_probe.json", "w") as f:
                    f.write(r8.text)
                break
            elif r8.status_code == 404:
                log(f"CH-T8: QuantisV2 ({q_path})", "NOT_FOUND", "404")
            else:
                log(f"CH-T8: QuantisV2 ({q_path})", "FAILED", f"HTTP {r8.status_code}: {r8.text[:200]}")

        # Test 9: Alert endpoint
        print("\n  [TEST 9] Alert endpoint")
        r9 = await client.get(
            f"{CEHUB_BASE}/api/Alert",
            params={"latitude": loc["lat"], "longitude": loc["lon"]},
            headers=headers,
        )
        if r9.status_code == 200:
            log("CH-T9: Alert", "WORKING", safe_truncate(r9.text))
        else:
            log("CH-T9: Alert", "FAILED", f"HTTP {r9.status_code}: {r9.text[:200]}")

        # Test 10: Generic Recommendation
        print("\n  [TEST 10] Generic Recommendation")
        r10 = await client.get(
            f"{CEHUB_BASE}/api/GenericRecommendation",
            params={
                "latitude": loc["lat"],
                "longitude": loc["lon"],
                "startDate": start_dt,
                "endDate": end_dt,
            },
            headers=headers,
        )
        if r10.status_code == 200:
            log("CH-T10: Generic Recommendation", "WORKING", safe_truncate(r10.text))
        else:
            log("CH-T10: Generic Recommendation", "FAILED", f"HTTP {r10.status_code}: {r10.text[:200]}")


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

async def main():
    print("\n" + "█"*60)
    print("  AASRA API LIVE TEST SUITE")
    print(f"  Run at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("█"*60)

    await test_meteoblue()
    await test_cehub()

    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    working = [k for k, v in results.items() if v["status"] == "WORKING"]
    failed  = [k for k, v in results.items() if "FAIL" in v["status"]]
    partial = [k for k, v in results.items() if v["status"] not in ("WORKING",) and "FAIL" not in v["status"]]

    print(f"\n  ✅ Working ({len(working)}): {', '.join(working) or 'none'}")
    print(f"  ❌ Failed ({len(failed)}): {', '.join(failed) or 'none'}")
    print(f"  ⚠️  Other ({len(partial)}): {', '.join(partial) or 'none'}")
    print(f"\n  Responses saved to: tests/api/responses/")
    print("  (No credentials stored in response files)\n")

    # Write machine-readable status
    with open("tests/api/api_test_results.json", "w") as f:
        json.dump({
            "run_at": datetime.now().isoformat(),
            "results": results,
        }, f, indent=2)
    print("  Full results: tests/api/api_test_results.json")


if __name__ == "__main__":
    asyncio.run(main())
