"""
CE Hub Swagger endpoint discovery - find all available paths.
"""
import asyncio, httpx, os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent.parent / ".env")
CEHUB_KEY = os.getenv("CEHUB_API_KEY", "")
CEHUB_BASE = os.getenv("CE_HUB_BASE_URL", "https://services.cehub.syngenta-ais.com")
headers = {"ApiKey": CEHUB_KEY, "Accept": "application/json"}
BHOPAL = {"lat": 23.2599, "lon": 77.4126}

async def main():
    from datetime import datetime, timedelta
    past_end = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%dT00:00:00")
    past_start = (datetime.now() - timedelta(days=16)).strftime("%Y-%m-%dT00:00:00")

    # Try ALL known paths from Swagger docs
    paths_to_test = [
        # AgronomicsDecisionRecommendation — already confirmed working
        "/api/AgronomicsDecisionRecommendation/HydricStressRecommendation",
        "/api/AgronomicsDecisionRecommendation/SprayWindowRecommendation",
        "/api/AgronomicsDecisionRecommendation/PlantingWindowRecommendation",
        "/api/AgronomicsDecisionRecommendation/GDDRecommendation",
        "/api/AgronomicsDecisionRecommendation/PhytophagyStressRisk",
        "/api/AgronomicsDecisionRecommendation/PhytophagyFrostRisk",
        "/api/AgronomicsDecisionRecommendation/ChillingUnitsRecommendation",
        "/api/AgronomicsDecisionRecommendation/FrostDateRecommendation",
        "/api/AgronomicsDecisionRecommendation/PollinationHoursRecommendation",
        "/api/AgronomicsDecisionRecommendation/DroneFlightdays",
        # Disease Risk
        "/api/DiseaseRisk/Metadata",
        "/api/DiseaseRisk/Summary",
        "/api/DiseaseRisk",
        # QuantisV2
        "/api/QuantisV2",
        "/api/QuantisV2/Daily",
        "/api/QuantisV2/Hourly",
        "/api/QuantisV2/Historical",
        "/api/Quantis",
        "/api/Quantis/Daily",
        # SuperDTN weather
        "/api/SuperDTN",
        "/api/Forecast/ShortTermForecast",
        "/api/Forecast",
        # Other
        "/api/Biomass",
        "/api/ClimateRisk",
        "/api/ClimateRisk/Summary",
        "/api/SoilData",
        "/api/IrrigationRecommendation",
        "/api/PestAlertCriteria",
        "/api/PestAlertCriteria/Summary",
    ]

    async with httpx.AsyncClient(timeout=15.0) as client:
        for path in paths_to_test:
            # Try with minimal params 
            p = {"latitude": BHOPAL["lat"], "longitude": BHOPAL["lon"],
                 "startDate": past_start, "endDate": past_end}
            try:
                r = await client.get(f"{CEHUB_BASE}{path}", params=p, headers=headers)
                icon = "✅" if r.status_code == 200 else ("⚠️" if r.status_code == 400 else "❌")
                preview = r.text[:80].replace("\n", " ")
                print(f"  {icon} {path}: HTTP {r.status_code}: {preview}")
            except Exception as e:
                print(f"  ❌ {path}: ERROR {e}")

asyncio.run(main())
