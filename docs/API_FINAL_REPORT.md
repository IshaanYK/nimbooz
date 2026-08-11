# AASRA — API Final Report
*Generated: 2026-08-11 | Live-tested with real credentials*

---

## Executive Summary

All APIs were **live-tested** with actual credentials. Results below are ground truth, not speculation.

| Service | Endpoints Confirmed Working | Endpoints Confirmed Broken |
|---|---|---|
| **Meteoblue Dataset** | Temperature, Precipitation, Soil Moisture, ET, ERA5 Historical | Solar Radiation (code 117), FAO ET0 (code 260) |
| **CE Hub** | GDD, Hydric Stress, Spray Window, Planting Window, Chilling Units, Pollination Hours, Disease Metadata | QuantisV2, Forecast, Historical, DiseaseRisk (actual data), Alert |

**Bottom line for demo:** We have **real, live data flowing** from both APIs. The working set is sufficient for AASRA's core PS-04 and PS-07 use cases.

---

## 1. Meteoblue Dataset API

**Base URL:** `https://my.meteoblue.com/dataset/query`  
**Method:** `POST` with JSON body  
**Auth:** `?apikey=KEY` query param

### Correct Request Format

```json
{
  "units": {"temperature": "C", "velocity": "m/s", "length": "metric", "energy": "watts"},
  "geometry": {
    "type": "MultiPoint",
    "coordinates": [[77.4126, 23.2599]],
    "locationNames": ["Bhopal"]
  },
  "format": "json",
  "timeIntervals": ["2026-07-28T+00:00/2026-08-04T+00:00"],
  "timeIntervalsAlignment": "none",
  "queries": [{
    "domain": "NEMSGLOBAL",
    "gapFillDomain": null,
    "timeResolution": "daily",
    "codes": [
      {"code": 11, "level": "2 m above gnd", "aggregation": "max"},
      {"code": 11, "level": "2 m above gnd", "aggregation": "min"},
      {"code": 61, "level": "sfc", "aggregation": "sum"}
    ]
  }]
}
```

> **CRITICAL:** Coordinates are `[longitude, latitude]` — NOT `[lat, lon]`.

### Confirmed Working Variable Codes

| Variable | Code | Level | Aggregation | Status |
|---|---|---|---|---|
| Temperature Max | 11 | `2 m above gnd` | `max` | WORKING |
| Temperature Min | 11 | `2 m above gnd` | `min` | WORKING |
| Temperature Mean | 11 | `2 m above gnd` | `mean` | WORKING |
| Precipitation | 61 | `sfc` | `sum` | WORKING |
| Soil Moisture 0-10cm | 144 | `0-10 cm down` | `mean` | WORKING |
| Evapotranspiration | 261 | `sfc` | `sum` | WORKING |

### Confirmed Broken Variable Codes

| Variable | Code | Error |
|---|---|---|
| Solar Radiation | 117 | `"Cannot initialize Code from invalid Int value 117"` |
| FAO Reference ET0 | 260 | `"Could not get data for FAO Reference Evapotranspiration"` |
| Relative Humidity | 52 | `"Cannot initialize Code from invalid Int value 52"` |

### Available Domains

| Domain | Use Case |
|---|---|
| `NEMSGLOBAL` | Recent + forecast (up to 10 days ahead) |
| `ERA5` | Historical reanalysis (1940-present) - WORKING for Kharif 2025 |

---

## 2. CE Hub API

**Base URL:** `https://services.cehub.syngenta-ais.com`  
**Auth:** `ApiKey: KEY` header

### Critical Date Range Constraint

> CANNOT span past-to-future in one request.  
> Use all-past OR all-future date ranges only.

Error received: *"It doesn't support requests starting in the past and ending in the future. Request can be either in the past or in the future."*

**Pattern for AASRA:**
- Historical queries: `(today - 16 days)` to `(today - 2 days)`
- Forecast queries: `(today + 1 day)` to `(today + 7 days)`

### Confirmed Working Endpoints

#### GDD Recommendation
```
GET /api/AgronomicsDecisionRecommendation/GDDRecommendation
Params: latitude, longitude, startDate, endDate, baseLimit=10.0, maxLimit=35.0, useEnhancedFormula=true
```
Sample Response:
```json
[{"requestLatitude": 23.2599, "requestLongitude": 77.4126, "date": "2026/07/26 00:00:00", "value": 17.31, "type": "GDD", "accumlatedValue": 17.31}]
```

#### Hydric Stress Recommendation
```
GET /api/AgronomicsDecisionRecommendation/HydricStressRecommendation
Params: latitude, longitude, startDate, endDate, waterAvailabilty=50
```
> API TYPO: param is `waterAvailabilty` (missing an 'i'). This is intentional in the API.

#### Spray Window Recommendation
```
GET /api/AgronomicsDecisionRecommendation/SprayWindowRecommendation
Params: latitude, longitude, startDate, endDate, sprayingType="Herbicide", top=5, format="json"
Valid sprayingType: Herbicide | Insecticide | Fungicide | Biological
```

#### Planting Window Recommendation
```
GET /api/AgronomicsDecisionRecommendation/PlantingWindowRecommendation
Params: latitude, longitude, startDate, endDate, cropType="Soybean"
```

#### Chilling Units Recommendation
```
GET /api/AgronomicsDecisionRecommendation/ChillingUnitsRecommendation
Params: latitude, longitude, startDate, endDate
```

#### Pollination Hours Recommendation
```
GET /api/AgronomicsDecisionRecommendation/PollinationHoursRecommendation
Params: latitude, longitude, startDate, endDate
```

#### Disease Risk Metadata
```
GET /api/DiseaseRisk/Metadata
No params required. Returns list of available disease models.
```

### Confirmed 404 (Unavailable with this API key)

| Endpoint | Status |
|---|---|
| `/api/QuantisV2/*` | 404 - Not provisioned |
| `/api/Quantis/*` | 404 - Not provisioned |
| `/api/Forecast/*` | 404 - Not provisioned |
| `/api/Historical/*` | 404 - Not provisioned |
| `/api/DiseaseRisk` (data) | 404 - Only Metadata available |
| `/api/Alert` | 404 |

---

## 3. AASRA Integration Strategy

### Data Flow for PS-04 (Advisory)

```
Field + Crop + GPS
    |
CE Hub GDD (past 14d) -> crop_stage_estimate
CE Hub Hydric Stress -> drought_alert
CE Hub Spray Window (next 7d) -> spray_timing
Meteoblue NEMSGLOBAL (past 14d) -> recent_conditions
Meteoblue ERA5 (Kharif baseline) -> historical_normal
    |
Agriculture Engine (stress scores, ROBI)
    |
Gemini AI (multilingual advisory)
    |
Farmer Response
```

### Data Flow for PS-07 (Attribution / ROBI)

```
Pre-season: Record baseline conditions (ERA5 historical)
Weekly: Log CE Hub GDD accumulation + Meteoblue weather
Post-harvest: Compare actual vs control yield
    |
ROBI = (Yield_gain x Price) / Product_cost
    |
Attribution confidence based on weather deviation from normal
```

---

## 4. Security

- Keys stored only in `backend/.env` — never in frontend
- `.env` in `.gitignore`
- Keys masked in all test output
- No credentials in response JSON files saved to disk
- `.env.example` committed with blank values

---

## 5. Graceful Degradation

All adapters implement fallback to demo data when:
- API key not set
- API returns error
- Network timeout (30s default)

Demo data is clearly marked with `"is_demo": true` and `"source": "demo"`.
