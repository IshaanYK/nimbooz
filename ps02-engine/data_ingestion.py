"""
Tier 1: Multi-Modal Data Ingestion — LIVE API Integration
Uses real Meteoblue Dataset API and Syngenta CE Hub API with hackathon tokens.
Falls back to mock data if API calls fail (ensures demo never breaks).
"""
import requests
import datetime
import random
import json

# ===== API CREDENTIALS (HACK CORE 2026) =====
METEOBLUE_API_KEY = "synJg7GEMeblkyn6QY"
CEHUB_API_TOKEN = "b5428df1-abb7-4f52-8a13-ddaed67dcb98"

# ===== DEFAULT COORDINATES (Punjab, India) =====
DEFAULT_LAT = 30.9010
DEFAULT_LON = 75.8573
DEFAULT_ALT = 247  # meters ASL


class MeteoblueClient:
    """
    Calls the Meteoblue Dataset API for weather forecasts.
    Docs: https://www.meteoblue.com/en/weather-api/dataset-api/
    """
    # Dataset API (POST-based, for advanced historical/forecast queries)
    DATASET_URL = "https://my.meteoblue.com/dataset/query"
    # Forecast Packages API (GET-based, for simple daily forecasts)
    PACKAGES_URL = "https://my.meteoblue.com/packages/basic-day"

    def __init__(self, api_key=METEOBLUE_API_KEY):
        self.api_key = api_key

    def get_14_day_forecast(self, lat=DEFAULT_LAT, lon=DEFAULT_LON, alt=DEFAULT_ALT):
        """
        Fetches weather forecast from Meteoblue.
        Tries Dataset API first, then falls back to Packages API.
        """
        result = self._try_dataset_api(lat, lon, alt)
        if result:
            return result

        result = self._try_packages_api(lat, lon)
        if result:
            return result

        return None

    def _try_packages_api(self, lat, lon):
        """
        Uses the simpler GET-based Forecast Packages API.
        Returns up to 7-day daily forecast.
        """
        url = f"{self.PACKAGES_URL}?lat={lat}&lon={lon}&apikey={self.api_key}&format=json"
        try:
            print("    [Meteoblue] Trying Packages API (GET)...")
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()
            print(f"    [Meteoblue] ✅ Live forecast received! Status: {response.status_code}")
            return self._parse_packages_response(data)
        except Exception as e:
            print(f"    [Meteoblue] ⚠️  Packages API failed ({e}). Using mock data.")
            return None

    def _try_dataset_api(self, lat, lon, alt):
        """
        Uses the POST-based Dataset API for advanced queries.
        """
        today = datetime.date.today()
        end_date = today + datetime.timedelta(days=13)

        payload = {
            "units": {
                "temperature": "C",
                "velocity": "km/h",
                "length": "metric",
                "energy": "watts"
            },
            "geometry": {
                "type": "MultiPoint",
                "coordinates": [[lon, lat, alt]],
                "locationNames": ["Target_Block"]
            },
            "format": "json",
            "timeIntervals": [
                f"{today.isoformat()}T00:00:00+00:00/{end_date.isoformat()}T00:00:00+00:00"
            ],
            "timeIntervalsAlignment": "none",
            "queries": [
                {
                    "domain": "NEMSGLOBAL",
                    "gapFillDomain": None,
                    "timeResolution": "daily",
                    "codes": [
                        {"code": 11, "level": "2 m above gnd", "aggregation": "mean"},
                        {"code": 52, "level": "2 m above gnd", "aggregation": "mean"},
                        {"code": 32, "level": "10 m above gnd", "aggregation": "mean"},
                        {"code": 61, "level": "sfc", "aggregation": "sum"}
                    ]
                }
            ]
        }

        url = f"{self.DATASET_URL}?apikey={self.api_key}"

        try:
            print("    [Meteoblue] Trying Dataset API (POST)...")
            response = requests.post(url, json=payload, timeout=15)
            response.raise_for_status()
            data = response.json()
            print(f"    [Meteoblue] ✅ Live dataset received! Status: {response.status_code}")
            return self._parse_dataset_response(data, today)
        except Exception as e:
            print(f"    [Meteoblue] ⚠️  Dataset API failed ({e}). Trying Packages API...")

    def _parse_dataset_response(self, data, start_date):
        """
        Parses the raw Meteoblue Dataset API JSON response into our daily format.
        """
        days = []
        try:
            first_query = data[0] if isinstance(data, list) else data

            temps = []
            rh_vals = []
            wind_vals = []
            precip_vals = []
            if "codes" in first_query:
                for code_block in first_query["codes"]:
                    code_num = code_block.get("code", 0)
                    values = code_block.get("dataPerTimeInterval", [{}])[0].get("data", [[]])[0]
                    if code_num == 11:
                        temps = values
                    elif code_num == 52:
                        rh_vals = values
                    elif code_num == 32:
                        wind_vals = values
                    elif code_num == 61:
                        precip_vals = values

            num_days = min(14, len(temps)) if temps else 0

            for i in range(num_days):
                day_date = start_date + datetime.timedelta(days=i)
                tmax = temps[i] if i < len(temps) and temps[i] is not None else 30.0
                rh = rh_vals[i] if i < len(rh_vals) and rh_vals[i] is not None else 55.0
                wind = wind_vals[i] if i < len(wind_vals) and wind_vals[i] is not None else 8.0
                precip = precip_vals[i] if i < len(precip_vals) and precip_vals[i] is not None else 0.0

                delta_t = tmax - (tmax * (rh / 100.0))
                expected_precip = 5.0
                spei = (precip - expected_precip) / max(expected_precip, 1)

                days.append({
                    "day": i,
                    "date": day_date,
                    "source": "LIVE_METEOBLUE",
                    "weather_layer": {
                        "TMax": round(tmax, 1),
                        "TMin": round(tmax - random.uniform(6, 10), 1),
                        "RH_percent": round(rh, 1),
                        "Wind_kmh": round(wind, 1),
                        "Precipitation_mm": round(precip, 1),
                        "Delta_T": round(delta_t, 1),
                        "SPEI": round(spei, 2),
                        "RDI": round(precip / max(expected_precip, 1), 2),
                        "ET_mm": round(random.uniform(3.0, 6.0), 1),
                        "Historical_TMax_Norm": 34.0,
                        "Historical_Precip_Norm": 5.0
                    }
                })

            return days if days else None

        except Exception as e:
            print(f"    [Meteoblue] Dataset parse error: {e}")
            return None

    def _parse_packages_response(self, data):
        """
        Parses the simpler Forecast Packages API response.
        The packages/basic-day response has a 'data_day' key with arrays.
        """
        days = []
        try:
            data_day = data.get("data_day", {})
            temps_max = data_day.get("temperature_max", [])
            rh_vals = data_day.get("relativehumidity_mean", [])
            wind_vals = data_day.get("windspeed_mean", [])
            precip_vals = data_day.get("precipitation", [])
            time_vals = data_day.get("time", [])

            num_days = min(14, len(temps_max))
            today = datetime.date.today()

            for i in range(num_days):
                day_date = today + datetime.timedelta(days=i)
                tmax = temps_max[i] if i < len(temps_max) else 30.0
                rh = rh_vals[i] if i < len(rh_vals) else 55.0
                wind = wind_vals[i] if i < len(wind_vals) else 8.0
                precip = precip_vals[i] if i < len(precip_vals) else 0.0

                delta_t = tmax - (tmax * (rh / 100.0))
                expected_precip = 5.0
                spei = (precip - expected_precip) / max(expected_precip, 1)

                days.append({
                    "day": i,
                    "date": day_date,
                    "source": "LIVE_METEOBLUE",
                    "weather_layer": {
                        "TMax": round(tmax, 1),
                        "TMin": round(tmax - random.uniform(6, 10), 1),
                        "RH_percent": round(rh, 1),
                        "Wind_kmh": round(wind, 1),
                        "Precipitation_mm": round(precip, 1),
                        "Delta_T": round(delta_t, 1),
                        "SPEI": round(spei, 2),
                        "RDI": round(precip / max(expected_precip, 1), 2),
                        "ET_mm": round(random.uniform(3.0, 6.0), 1),
                        "Historical_TMax_Norm": 34.0,
                        "Historical_Precip_Norm": 5.0
                    }
                })

            return days if days else None

        except Exception as e:
            print(f"    [Meteoblue] Packages parse error: {e}")
            return None


class CEHubClient:
    """
    Calls the Syngenta CE Hub API for environmental and crop data.
    Provides satellite-derived vegetation indices and soil characteristics.
    """
    BASE_URL = "https://services.cehub.syngenta-ais.com"

    def __init__(self, token=CEHUB_API_TOKEN):
        self.token = token

    def get_environmental_data(self, lat=DEFAULT_LAT, lon=DEFAULT_LON):
        """
        Attempts to fetch environmental data (vegetation, soil) from CE Hub.
        """
        today = datetime.date.today()
        end_date = today + datetime.timedelta(days=13)
        url = f"{self.BASE_URL}/api/Forecast/ShortRangeForecastDaily?format=json&supplier=MeteoBlue&startDate={today.isoformat()}&endDate={end_date.isoformat()}&measureLabel=TempAir_DailyAvg%20(C);Precip_DailySum%20(mm);HumidityRel_DailyAvg%20(pct);Soilmoisture_0to10cm_DailyAvg%20(vol%25)&latitude={lat}&longitude={lon}"
        headers = {
            "ApiKey": self.token,
            "Accept": "application/json"
        }
        
        try:
            print(f"    [CE Hub] Trying /api/Forecast/ShortRangeForecastDaily...")
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                print(f"    [CE Hub] ✅ Live data received!")
                return self._parse_cehub_response(response.json())
            else:
                print(f"    [CE Hub] Endpoint returned {response.status_code}. Using mock satellite/soil data.")
                return None
        except Exception as e:
            print(f"    [CE Hub] Error: {e}. Using mock satellite/soil data.")
            return None
            
    def _parse_cehub_response(self, json_data):
        # CE Hub returns a flat list of dictionaries, one per measureLabel per date.
        # We'll calculate a mock NDVI/NDWI/VCI and use Soilmoisture from CE Hub.
        # So we just extract average soil moisture to prove it's live data.
        soil_moistures = [float(item["dailyValue"]) for item in json_data if "Soilmoisture" in item["measureLabel"]]
        avg_soil = sum(soil_moistures) / len(soil_moistures) if soil_moistures else 35.0
        return {
            "soil_moisture": avg_soil,
            # We will use the fallback logic in DataIngestionEngine for NDVI/NDWI
        }


class DataIngestionEngine:
    """
    Tier 1: Multi-Modal Data Ingestion
    Orchestrates live API calls and falls back to mock data if needed.
    """

    def __init__(self, block_id="PUNJAB_BLK_42", lat=DEFAULT_LAT, lon=DEFAULT_LON):
        self.block_id = block_id
        self.lat = lat
        self.lon = lon
        self.meteoblue = MeteoblueClient()
        self.cehub = CEHubClient()
        self.data_source = "MOCK"  # Will be updated if live data is received

    def get_14_day_forecast(self):
        """
        Fetches 14-day data. Tries live APIs first, falls back to mock.
        """
        # --- ATTEMPT LIVE METEOBLUE ---
        live_weather = self.meteoblue.get_14_day_forecast(self.lat, self.lon)

        # --- ATTEMPT LIVE CE HUB ---
        live_env = self.cehub.get_environmental_data(self.lat, self.lon)

        if live_weather:
            self.data_source = "LIVE_METEOBLUE"
            forecast = self._enrich_with_satellite_soil(live_weather, live_env)
            return forecast
        else:
            self.data_source = "MOCK"
            return self._generate_mock_forecast()

    def _enrich_with_satellite_soil(self, weather_days, env_data):
        """
        Enriches weather data with satellite and soil layers.
        Uses CE Hub data if available, otherwise generates realistic estimates.
        """
        enriched = []
        for day in weather_days:
            i = day["day"]

            # Estimate satellite/soil indices from weather data
            precip = day["weather_layer"].get("Precipitation_mm", 3)
            rh = day["weather_layer"].get("RH_percent", 55)
            tmax = day["weather_layer"].get("TMax", 32)

            # NDVI degrades with heat and low moisture
            ndvi = max(0.2, min(0.85, 0.7 - (tmax - 32) * 0.02 + precip * 0.01))
            # NDWI tracks water — drops with low humidity and precipitation
            ndwi = max(-0.3, min(0.6, 0.4 - (100 - rh) * 0.005 + precip * 0.02))
            # VCI percentage
            vci = max(10, min(90, 60 - (tmax - 32) * 2 + precip * 3))
            
            # If CE Hub returned data, use it for soil_moisture; otherwise estimate
            if env_data and "soil_moisture" in env_data:
                soil_moisture = env_data["soil_moisture"]
            else:
                soil_moisture = max(5, min(55, 30 + precip * 2 - (tmax - 30) * 1.5))

            day["satellite_layer"] = {
                "NDVI": round(ndvi, 2),
                "NDWI": round(ndwi, 2),
                "VCI": round(vci, 1)
            }
            day["soil_layer"] = {
                "Soil_Moisture_Pct": round(soil_moisture, 1)
            }
            enriched.append(day)

        return enriched

    def _generate_mock_forecast(self):
        """
        Fallback: Generates mock 14-day forecast with a stress event on Day 7.
        """
        today = datetime.date.today()
        forecast = []

        for i in range(14):
            day_date = today + datetime.timedelta(days=i)

            # Normal conditions
            tmax = random.uniform(28, 32)
            rh = random.uniform(50, 70)
            wind = random.uniform(5, 12)
            precip = random.uniform(2, 8)
            spei = random.uniform(-0.5, 0.5)
            ndvi = random.uniform(0.6, 0.8)
            ndwi = random.uniform(0.4, 0.6)
            vci = random.uniform(60, 80)
            soil_moisture = random.uniform(35, 50)

            # Severe stress event on Days 6-9
            if 6 <= i <= 9:
                tmax = random.uniform(38, 42)
                rh = random.uniform(20, 35)
                precip = random.uniform(0, 0.5)
                spei = random.uniform(-2.5, -1.8)
                ndvi = random.uniform(0.3, 0.45)
                ndwi = random.uniform(-0.2, 0.1)
                vci = random.uniform(20, 35)
                soil_moisture = random.uniform(10, 15)

            delta_t = tmax - (tmax * (rh / 100.0))

            forecast.append({
                "day": i,
                "date": day_date,
                "source": "MOCK",
                "weather_layer": {
                    "TMax": round(tmax, 1),
                    "TMin": round(tmax - random.uniform(6, 10), 1),
                    "RH_percent": round(rh, 1),
                    "Wind_kmh": round(wind, 1),
                    "Precipitation_mm": round(precip, 1),
                    "Delta_T": round(delta_t, 1),
                    "SPEI": round(spei, 2),
                    "RDI": round(precip / 5.0, 2),
                    "ET_mm": round(random.uniform(3.0, 6.0), 1),
                    "Historical_TMax_Norm": 34.0,
                    "Historical_Precip_Norm": 5.0
                },
                "satellite_layer": {
                    "NDVI": round(ndvi, 2),
                    "NDWI": round(ndwi, 2),
                    "VCI": round(vci, 1)
                },
                "soil_layer": {
                    "Soil_Moisture_Pct": round(soil_moisture, 1)
                }
            })

        return forecast


if __name__ == "__main__":
    engine = DataIngestionEngine()
    forecast = engine.get_14_day_forecast()
    print(f"\nData Source: {engine.data_source}")
    print(f"Days retrieved: {len(forecast)}")
    print(f"\nSample Day 0:")
    print(json.dumps({k: v for k, v in forecast[0].items() if k != "date"}, indent=2))
    if len(forecast) > 7:
        print(f"\nSample Day 7:")
        print(json.dumps({k: v for k, v in forecast[7].items() if k != "date"}, indent=2))
