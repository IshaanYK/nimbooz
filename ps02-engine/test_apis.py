import requests
import datetime
import json

METEOBLUE_API_KEY = "synJg7GEMeblkyn6QY"
CEHUB_API_TOKEN = "b5428df1-abb7-4f52-8a13-ddaed67dcb98"
DEFAULT_LAT = 30.9010
DEFAULT_LON = 75.8573
DEFAULT_ALT = 247

def test_meteoblue():
    DATASET_URL = "https://my.meteoblue.com/dataset/query"
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
            "coordinates": [[DEFAULT_LON, DEFAULT_LAT, DEFAULT_ALT]],
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
    
    response = requests.post(f"{DATASET_URL}?apikey={METEOBLUE_API_KEY}", json=payload)
    if response.status_code == 200:
        data = response.json()
        print("Meteoblue Success!")
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
        print(f"Temps: {len(temps)}")
    else:
        print(f"Meteoblue Error: {response.text}")

def test_cehub():
    url = f"https://services.cehub.syngenta-ais.com/api/Forecast/ShortRangeForecastDaily?format=json&supplier=MeteoBlue&startDate={datetime.date.today()}&endDate={datetime.date.today() + datetime.timedelta(days=13)}&measureLabel=TempAir_DailyAvg%20(C);Precip_DailySum%20(mm);HumidityRel_DailyAvg%20(pct);Soilmoisture_0to10cm_DailyAvg%20(vol%25)&latitude={DEFAULT_LAT}&longitude={DEFAULT_LON}"
    headers = {
        "ApiKey": CEHUB_API_TOKEN,
        "Accept": "application/json"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        print("CE Hub Success!")
        print(response.json()[:2])
    else:
        print(f"CE Hub Error: {response.text}")

if __name__ == '__main__':
    test_meteoblue()
    test_cehub()
