# AASRA — Technical Research & Foundation Document
*HACK CORE 2026 Strategic Solution Architecture*

---

## 1. Executive Summary & Vision

**AASRA** is an AI-powered agricultural companion designed to bridge field data, biological product science, and farmer trust.

The product centers around two primary problem statements:
- **PS-04:** Farmer-Facing Intelligent Advisory & Multilingual Interaction (Voice/Text accessibility, field-aware advisory, crop stage guidance).
- **PS-07:** Measuring, Attributing, and Proving the Impact of Biological Interventions (ROBI engine, yield gain attribution, weather-adjusted evidence proof).

Supporting intelligence from **PS-02 (Stress Detection)** and **PS-03 (Biological Product Recommendation)** operates seamlessly underneath the system to feed actionable insights into PS-04 and PS-07.

---

## 2. Core Architecture Philosophy

The system executes a 6-phase operational loop:

$$\text{LISTEN} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{ADVISE} \longrightarrow \text{RECORD} \longrightarrow \text{MEASURE} \longrightarrow \text{PROVE}$$

1. **LISTEN:** Ingest live weather from Meteoblue Dataset API & agronomic indicators from Syngenta CE Hub.
2. **UNDERSTAND:** Run deterministic agricultural algorithms to assess daytime heat, night heat, frost, drought risk index (DI), GDD accumulation, and NUE.
3. **ADVISE (PS-04):** Deliver context-aware, multilingual advisory in English, Hindi, and Marathi via Gemini AI and structured decision windows.
4. **RECORD:** Track biological applications (Syngenta Stress Buster, Nutrient Booster, Yield Booster) alongside control field baseline data.
5. **MEASURE:** Compute actual yield delta, cost-benefit metrics, and Nitrogen Use Efficiency.
6. **PROVE (PS-07):** Calculate Return On Biological Investment (ROBI) and generate exportable Evidence Proof Cards.

---

## 3. Live API Research & Ground-Truth Findings

### 3.1 Meteoblue Dataset API
- **Endpoint:** `POST https://my.meteoblue.com/dataset/query?apikey={KEY}`
- **Coordinate Order:** Must be `[longitude, latitude]` (e.g. `[77.4126, 23.2599]` for Bhopal).
- **Confirmed Working Variables:**
  - Temp Max (Code 11, `2 m above gnd`, `max`)
  - Temp Min (Code 11, `2 m above gnd`, `min`)
  - Temp Mean (Code 11, `2 m above gnd`, `mean`)
  - Precipitation (Code 61, `sfc`, `sum`)
  - Soil Moisture 0-10cm (Code 144, `0-10 cm down`, `mean`)
  - Evapotranspiration (Code 261, `sfc`, `sum`)
- **Historical Reanalysis:** `ERA5` domain confirmed working for Kharif 2025 baseline computation.

### 3.2 Syngenta CE Hub API
- **Base URL:** `https://services.cehub.syngenta-ais.com`
- **Auth:** `ApiKey` HTTP Header.
- **Date Range Rule:** Cannot cross past-to-future boundary. Queries must be strictly all-past or all-future.
- **Confirmed Working Endpoints:**
  - `/api/AgronomicsDecisionRecommendation/GDDRecommendation`
  - `/api/AgronomicsDecisionRecommendation/HydricStressRecommendation` (Note API query param typo: `waterAvailabilty`)
  - `/api/AgronomicsDecisionRecommendation/SprayWindowRecommendation` (`sprayingType`: Herbicide, Insecticide, Fungicide)
  - `/api/AgronomicsDecisionRecommendation/PlantingWindowRecommendation`
  - `/api/AgronomicsDecisionRecommendation/ChillingUnitsRecommendation`
  - `/api/AgronomicsDecisionRecommendation/PollinationHoursRecommendation`
  - `/api/DiseaseRisk/Metadata`

---

## 4. Agricultural Engine Formulas

### 4.1 Daytime Heat Stress
$$\text{Stress}_{\text{day}} = \begin{cases} 
0 & T_{\text{max}} \le T_{\text{opt}} \\
9 \times \frac{T_{\text{max}} - T_{\text{opt}}}{T_{\text{limit}} - T_{\text{opt}}} & T_{\text{opt}} < T_{\text{max}} < T_{\text{limit}} \\
9 & T_{\text{max}} \ge T_{\text{limit}}
\end{cases}$$

### 4.2 Nighttime Heat Stress
$$\text{Stress}_{\text{night}} = \begin{cases} 
0 & T_{\text{min}} < T_{\text{opt}} \\
9 \times \frac{T_{\text{min}} - T_{\text{opt}}}{T_{\text{limit}} - T_{\text{opt}}} & T_{\text{opt}} \le T_{\text{min}} < T_{\text{limit}} \\
9 & T_{\text{min}} \ge T_{\text{limit}}
\end{cases}$$

### 4.3 Drought Risk Index (DI)
$$\text{DI} = (P - E) + \frac{\text{SM}}{T}$$
*Where $P$ = Cumulative Rainfall (mm), $E$ = Evapotranspiration (mm), $\text{SM}$ = Avg Soil Moisture (%), $T$ = Avg Temp (°C).*

### 4.4 Growing Degree Days (GDD)
$$\text{GDD} = \max\left(0, \frac{T_{\text{max}} + T_{\text{min}}}{2} - T_{\text{base}}\right)$$

### 4.5 Return On Biological Investment (ROBI) — PS-07 Core
$$\text{ROBI} = \frac{(Y_{\text{treated}} - Y_{\text{control}}) \times \text{Price}_{\text{crop}}}{\text{Cost}_{\text{product}} + \text{Cost}_{\text{application}}}$$

---

## 5. Security & Deployment Foundation
- All secrets isolated in `backend/.env`.
- Frontend never communicates directly with raw API keys.
- Automatic fallback to high-fidelity simulated agronomic models if network API is unreachable.
