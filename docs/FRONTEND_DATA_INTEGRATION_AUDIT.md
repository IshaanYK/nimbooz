# AASRA — Frontend & Real Data Integration Audit

*Generated: August 12, 2026 | AASRA Product Architecture Audit*

---

## Executive Audit Summary

This audit evaluates the AASRA platform across existing frontend pages, backend FastAPI endpoints, live external APIs (Meteoblue & CE Hub Syngenta), AI speech services (Sarvam Saaras v3 STT, Bulbul v3 TTS, Google Gemini AI), interactive mapping, and data flow architecture.

---

## 1. Existing Frontend Pages & Components

| Page / Route | Role | Status / Action Needed |
|---|---|---|
| `/` (Landing Page) | Product Showcase | Refactor into public product story (Hero Voice, Ask-Act-Prove, Science, Impact) |
| `/dashboard` | Farmer Command Center | Connect directly to authenticated farmer profile & live backend API data |
| `/fields` & `/fields/[id]` | Field Management & Map | Replace static images with real interactive Leaflet map & Leaflet Draw polygon tool |
| `/ask` | PS-04 Multilingual AI Advisory | Upgrade to real Sarvam Saaras v3 STT + Gemini AI RAG + Bulbul v3 TTS voice flow |
| `/journal` | PS-07 Field Intervention Journal | Live user input for biological applications with verified date/dose tracking |
| `/impact` | PS-07 Outcome & ROBI | Real ROBI calculation formula: $((\text{Yield Gain} \times \text{Price}) - \text{Cost}) / \text{Cost}$, with proof cards |
| `/what-if` | Scenario Simulator | Dynamic what-if analysis based on real field baseline vs simulated scenario |
| `/onboarding` & `/signup` | Multi-step Farmer Onboarding | Step 1: Mobile/OTP/Lang, Step 2: Location/GPS, Step 3: Field & Polygon, Step 4: Preferences |
| `/login` | Phone + OTP Authentication | Retrieve authenticated farmer profile from `userStore` / backend |
| `/admin/api-status` | Technical Health Dashboard | Real-time health monitoring of Meteoblue, CE Hub, Sarvam, Gemini (hidden from farmers) |

---

## 2. Real API Architecture & Validation Audit

External API credentials are strictly stored in `backend/.env` and served via normalized FastAPI backend routes `/api/*`. Frontend NEVER exposes API keys.

```
Browser (Next.js Frontend)
    │
AASRA FastAPI Backend (/api/*)
    ├── /api/weather/current     ──> Meteoblue Dataset API + CE Hub Hydric Stress
    ├── /api/weather/historical  ──> Meteoblue ERA5 Reanalysis
    ├── /api/advisory/field      ──> CE Hub GDD + Spray Window + Planting Window + Disease Metadata
    ├── /api/chat/               ──> Gemini 2.0 / Groq / OpenRouter + RAG Context
    ├── /api/chat/speech-to-text ──> Sarvam Saaras v3 STT
    ├── /api/chat/text-to-speech ──> Sarvam Bulbul v3 TTS
    ├── /api/impact/robi         ──> AASRA Agriculture Engine (ROBI Calculation)
    └── /api/journal/            ──> Biological Intervention Store
```

### Validated & Live-Tested APIs

| Service | Endpoint / Code | Parameter / Configuration | Status |
|---|---|---|---|
| **Meteoblue** | Code 11 | `level: "2 m above gnd"`, `aggregation: "max"/"min"/"mean"` | **LIVE & WORKING** |
| **Meteoblue** | Code 61 | `level: "sfc"`, `aggregation: "sum"` (Precipitation) | **LIVE & WORKING** |
| **Meteoblue** | Code 144 | `level: "0-10 cm down"`, `aggregation: "mean"` (Soil Moisture) | **LIVE & WORKING** |
| **Meteoblue** | Code 261 | `level: "sfc"`, `aggregation: "sum"` (Evapotranspiration) | **LIVE & WORKING** |
| **Meteoblue** | Domain `ERA5` | Historical reanalysis (1940-present) for Kharif baselines | **LIVE & WORKING** |
| **CE Hub** | `/GDDRecommendation` | `latitude`, `longitude`, `startDate`, `endDate` (past/future strictly separated) | **LIVE & WORKING** |
| **CE Hub** | `/HydricStressRecommendation` | `waterAvailabilty=50` (Note: intentional API parameter typo) | **LIVE & WORKING** |
| **CE Hub** | `/SprayWindowRecommendation` | `sprayingType="Herbicide"|"Insecticide"|"Fungicide"|"Biological"` | **LIVE & WORKING** |
| **CE Hub** | `/PlantingWindowRecommendation` | `cropType="Soybean"|"Corn"` | **LIVE & WORKING** |
| **CE Hub** | `/DiseaseRisk/Metadata` | Disease model list (Anthracnose, Rust, etc.) | **LIVE & WORKING** |

### Unavailable / Unprovisioned APIs

| Service | Code / Endpoint | API Behavior | UI Fallback Requirement |
|---|---|---|---|
| **Meteoblue** | Code 117 (Solar) | Returns HTTP 400 (`invalid Int value 117`) | Label as "Not available for this configuration" |
| **Meteoblue** | Code 260 (FAO ET0) | Returns HTTP 400 (`Could not get data`) | Use Code 261 (Evapotranspiration) |
| **CE Hub** | `/QuantisV2` | Returns HTTP 404 (Not provisioned on key) | Graceful fallback to AASRA Agriculture Engine |
| **CE Hub** | `/Forecast` | Returns HTTP 404 (Not provisioned on key) | Use Meteoblue 7-day NEMSGLOBAL forecast |
| **CE Hub** | `/Alert` | Returns HTTP 404 | Generate alerts via AASRA Stress Engine |

---

## 3. Sarvam AI Voice Pipeline (PS-04)

1. **Speech-to-Text (STT):** Sarvam Saaras v3 model (`saaras:v3`) accepts WebM/WAV audio blobs from farmer microphone in Hindi, Marathi, and English.
2. **Context & RAG:** Real field location, crop stage, Meteoblue weather, and CE Hub stress are injected into prompt context.
3. **AI Reasoning:** Gemini 2.0 Flash / Groq Llama-3.3-70B synthesizes agricultural advisory.
4. **Text-to-Speech (TTS):** Sarvam Bulbul v3 model (`bulbul:v3`) generates authentic Indian acoustic audio output (`meera` speaker voice).

---

## 4. Real Interactive Map & Polygon Drawing Architecture

- **Map Engine:** Leaflet.js with dynamic tile layers (OpenStreetMap, Esri World Imagery Satellite, Terrain).
- **Field Polygon:** Real latitude/longitude polygon bounds stored in user field record.
- **Polygon Drawing:** Leaflet Draw tool allowing farmers to tap/click points on map during onboarding to define their actual field boundaries.
- **Dynamic Weather Overlays:** Layer controls for Soil Moisture, Temperature, Precipitation, and Heat Stress powered by live Meteoblue & CE Hub API data.

---

## 5. Data Badge Transparency System

All values rendered across the AASRA platform MUST carry a visible data provenance badge:

| Badge | Meaning |
|---|---|
| `LIVE  Meteoblue` | Fetched live from Meteoblue Dataset API |
| `LIVE  CE Hub` | Fetched live from Syngenta CE Hub API |
| `AI GENERATED` | Generated by Gemini / Sarvam AI |
| `MODELLED  AASRA` | Calculated by AASRA Agronomic Engine |
| `USER PROVIDED` | Directly entered by authenticated farmer |
| `DEMO` | Demo dataset for hackathon presentation |

---

## 6. Action Plan & What Must Be Replaced

1. **REPLACE static unlabelled values:** All numbers must carry a Data Badge or user attribution.
2. **REPLACE fake maps:** Use real Leaflet instance with Leaflet Draw, ESRI Satellite tiles, and fly-to animations.
3. **REPLACE fake voice:** Connect microphone input to WebRTC/audio recorder blob -> Saaras v3 STT -> AASRA RAG -> Bulbul v3 TTS player.
4. **REPLACE static forms:** Use 4-step onboarding with map picker and field drawing.
5. **REPLACE fake ROI:** Implement real input journal + biological attribution formula + ROBI proof cards.
