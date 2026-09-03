#!/usr/bin/env python3
"""
AASRA Agricultural Database Bot Client
-------------------------------------
Connects to the AASRA production database for bot automations (Telegram, Discord, WhatsApp, etc.).
Allows reading farmer profiles, farm plots, advisories, mandi rates, and saving new farmers.

Usage:
    python bot_client.py
"""

import json
import os
import sys
import urllib.request
import urllib.error

# Load configuration from config.json
CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
try:
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        CONFIG = json.load(f)
except Exception:
    CONFIG = {
        "api_base_url": "https://frontend-phi-flame-21.vercel.app",
        "database_api_key": "aasra-bot-access-2026",
        "endpoints": {
            "database": "/api/database",
            "farmers": "/api/farmers",
            "mandi": "/api/mandi/rates",
            "weather": "/api/weather/current"
        }
    }

BASE_URL = CONFIG.get("api_base_url", "https://frontend-phi-flame-21.vercel.app")
API_KEY = CONFIG.get("database_api_key", "aasra-bot-access-2026")


class AasraBotDatabase:
    """Client for bot to interact with AASRA Database."""

    def __init__(self, base_url: str = BASE_URL, api_key: str = API_KEY):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/json",
            "X-API-KEY": self.api_key,
            "User-Agent": "AasraBotClient/1.0"
        }

    def _request(self, endpoint: str, method: str = "GET", data: dict = None) -> dict:
        url = f"{self.base_url}{endpoint}"
        body = json.dumps(data).encode("utf-8") if data else None
        req = urllib.request.Request(url, data=body, headers=self.headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = response.read().decode("utf-8")
                return json.loads(res_body)
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            return {"error": True, "code": e.code, "message": err_body}
        except Exception as e:
            return {"error": True, "message": str(e)}

    def get_database(self) -> dict:
        """Fetch complete database snapshot (farmers, fields, journal, stats)."""
        return self._request(CONFIG["endpoints"].get("database", "/api/database"))

    def get_all_farmers(self) -> list:
        """Get list of all registered farmers."""
        res = self._request(CONFIG["endpoints"].get("farmers", "/api/farmers"))
        return res.get("farmers", [])

    def get_farmer_by_id(self, farmer_id: str) -> dict:
        """Get farmer details by ID (e.g., 'farmer-001')."""
        return self._request(f"{CONFIG['endpoints'].get('farmers', '/api/farmers')}?id={farmer_id}")

    def save_farmer(self, full_name: str, mobile_number: str, **kwargs) -> dict:
        """Register or update a farmer."""
        payload = {
            "fullName": full_name,
            "mobileNumber": mobile_number,
            **kwargs
        }
        return self._request(CONFIG["endpoints"].get("farmers", "/api/farmers"), method="POST", data=payload)

    def get_mandi_prices(self) -> dict:
        """Fetch live APMC mandi commodity prices."""
        return self._request(CONFIG["endpoints"].get("mandi", "/api/mandi/rates"))

    def get_weather(self, lat: float = 23.2599, lon: float = 77.4126) -> dict:
        """Fetch live weather telemetry."""
        return self._request(f"{CONFIG['endpoints'].get('weather', '/api/weather/current')}?lat={lat}&lon={lon}")


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    print("[*] AASRA Database Bot Client -- Testing Connection...")
    client = AasraBotDatabase()

    print(f"Connecting to: {client.base_url}")
    print(f"Using API Key: {client.api_key}")
    print("-" * 50)

    # 1. Test full database fetch
    db_res = client.get_database()
    if "stats" in db_res:
        stats = db_res["stats"]
        print("[+] Database Connected Successfully!")
        print(f"    - Total Farmers: {stats.get('totalFarmers', 0)}")
        print(f"    - Total Fields:  {stats.get('totalFields', 0)}")
        print(f"    - Journal Logs:  {stats.get('totalJournalLogs', 0)}")
        print(f"    - ROBI Audits:   {stats.get('totalRobiAudits', 0)}")
    else:
        print("[-] Error connecting to database:", db_res)

    # 2. Test querying a specific farmer
    farmer = client.get_farmer_by_id("farmer-001")
    if "farmer" in farmer:
        f = farmer["farmer"]
        print(f"\n[*] Sample Farmer Record:")
        print(f"    - Name:    {f.get('fullName')}")
        print(f"    - Phone:   {f.get('mobileNumber')}")
        print(f"    - Crop:    {f.get('primaryCrop')} ({f.get('cropVariety')})")
        print(f"    - Village: {f.get('village')}, {f.get('district')}")
    print("-" * 50)
    print("[+] Bot ready! You can import AasraBotDatabase in your bot script.")

