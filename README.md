# 🌾 AASRA (आसरा) — Evidence-Based Precision Agriculture Intelligence

[![Live Farmer Website](https://img.shields.io/badge/Production-Farmer%20Website-emerald?style=for-the-badge&logo=vercel)](https://frontend-phi-flame-21.vercel.app)
[![Live Admin Console](https://img.shields.io/badge/Production-Admin%20Console-indigo?style=for-the-badge&logo=vercel)](https://admin-self-mu-33.vercel.app)
[![Hackathon](https://img.shields.io/badge/Hack%20Core%202026-PS--02%20%26%20PS--03-blue?style=for-the-badge)](https://frontend-phi-flame-21.vercel.app/architecture)

> **AASRA** (**A**utomated **A**gro-**S**tress & **R**esilience **A**dvisor / *आपकी खेती का सच्चा साथी*)  
> Solves **PS-02 (Climate Stress Early Warning for Biological Intervention)** and **PS-03 (CropFit Decision Matrix & Biological Intervention)**.

---

## 🌐 Live Production Deployments

| Application | Live URL | Purpose |
|---|---|---|
| **🌾 AASRA Main Farmer Website** | **[https://frontend-phi-flame-21.vercel.app](https://frontend-phi-flame-21.vercel.app)** | Farmer intelligence, Kisan Action Verdict, Multimodal Voice AI, Mandi prices, spray safety, field mapping |
| **🛡️ AASRA Admin Overwatch Console** | **[https://admin-self-mu-33.vercel.app](https://admin-self-mu-33.vercel.app)** | Standalone admin portal: Real-time telemetry, user management, DB explorer, feature flags, broadcast alerts |

* **Admin Access Password:** `aasra-admin-2026`

---

## 🚀 Key Architectural Innovations

### 1. ⏱️ 7–14 Day Climate Stress "Time Machine" (PS-02)
* Shifts farming from **reactive damage control** to **pre-emptive biochemical execution**.
* Fuses meteorological drought indices (**SPEI / RDI**) with high-resolution reanalysis weather telemetry (Open-Meteo).
* Uses a **Hybrid RF-SVM Ensemble** to isolate multi-variate non-linear stress signals (nocturnal heat spikes >24°C, soil moisture deficits, vapor pressure deficit) and predict acute crop shock up to 14 days before visible symptoms occur.

### 2. 🧪 Spray Physics & Delta-T Climatology (PS-03)
* Enforces atmospheric physics constraints:  
  $$\Delta T = T_{\text{dry}} - T_{\text{wet}}$$
* **Delta-T < 2°C**: Air saturated — chemical wash-off risk.
* **Delta-T > 8°C**: Air too dry — droplet aerosol drift and rapid evaporation before stomatal absorption.
* **AASRA Goldilocks Window (2°C–8°C, Wind < 15 km/h)**: Identifies optimal hourly spray windows for biostimulants like Syngenta Quantis & Isabion.

### 3. 💰 Return on Bio-Investment (ROBI) Engine
* Validates chemical treatments through economic transparency:  
  $$\text{ROBI Multiplier} = \frac{\text{Saved Harvest Value (₹)} - \text{Input Cost (₹)}}{\text{Input Cost (₹)}}$$
* Live grounding with **APMC Mandi rates** (via Agmarknet).
* Issues verifiable, cryptographically hashed certificates proving net cash yield gains (e.g., **4.46x ROBI** on Soybean, +₹22,120 net cash gain).

### 4. 🎙️ Multimodal Vernacular Voice AI
* **Conversational Engine:** Google Gemini 2.0 Flash with automatic Groq failover pool.
* **Speech-to-Text:** Google Cloud Speech-to-Text v2 (Chirp 3 HD) for 12 Indian regional languages with live audio streaming transcription.
* **Text-to-Speech:** Google Cloud Text-to-Speech (Journey/Neural2) for native dialect speech generation.
* **Computer Vision:** Multimodal crop leaf and pest inspection with Gemini Vision.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────────────────────┐
                               │             AASRA ECOSYSTEM                    │
                               └──────────────────────┬─────────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
         🌾 FARMER-FACING WEB APP                                       🛡️ ADMIN OVERWATCH CONSOLE
   https://frontend-phi-flame-21.vercel.app                       https://admin-self-mu-33.vercel.app
   (Clean, vernacular, high-contrast)                             (Linear-style dark telemetry UI)
   ├─ /dashboard: Kisan Action Verdict                            ├─ /: Password gate (aasra-admin-2026)
   ├─ /assistant: Multimodal Voice AI                             ├─ /dashboard: Live production telemetry
   ├─ /fields: GPS acreage & polygon mapping                      ├─ /users: Search, register, or delete farmers
   ├─ /what-if: Interactive 100-day sim                           ├─ /diagnostics: Health of 8 microservices
   ├─ /impact: ROBI cryptographic audits                          ├─ /database: Live collection explorer
   └─ /journal: Farm activities & spray logs                      └─ /website: Feature flags & broadcast alerts
                       ▲                                                             ▲
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      │
                                                      ▼
                                       🚀 PRODUCTION SERVERLESS API
                                   https://frontend-phi-flame-21.vercel.app/api
                                   ├─ /api/chat: Gemini 2.0 Multimodal
                                   ├─ /api/farmers: CRUD for user accounts
                                   ├─ /api/settings: Feature flags & alerts
                                   ├─ /api/database: Zero-latency store
                                   ├─ /api/mandi/rates: APMC live prices
                                   └─ /api/weather/current: Open-Meteo
```

---

## 📂 Repository Structure

```
├── frontend/                     # Main Farmer-Facing Next.js 16 Web Application
│   ├── src/
│   │   ├── app/                 # App Router (dashboard, assistant, fields, what-if, impact, journal)
│   │   │   └── api/             # Production Serverless API (chat, farmers, settings, weather, mandi)
│   │   ├── components/          # Reusable UI (AppShell, KisanActionVerdict, WeatherWidget, etc.)
│   │   ├── context/             # Multi-lingual vernacular LanguageContext (12 Indian dialects)
│   │   └── lib/                 # Agronomic engines (sprayRules, weatherRules, roiEngine, aasraDb)
│   └── public/                  # Static assets, PWA manifest, service worker (v2)
│
├── admin/                        # Dedicated Administrative Overwatch Next.js 16 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/       # Real-time production database stats & service latencies
│   │   │   ├── users/           # Live farmer management (register, search, delete)
│   │   │   ├── diagnostics/     # Health monitors for all 8 microservices & APIs
│   │   │   ├── database/        # Collection browser (Farmers, Fields, Journal, ROBI, Raw JSON)
│   │   │   └── website/         # Real-time feature flags, maintenance mode & farmer broadcast alerts
│   │   ├── components/          # AdminShell (Linear dark-mode UI)
│   │   └── lib/                 # api.ts (bound directly to production API), adminAuth.ts
│   └── vercel.json              # Vercel deployment configuration
│
├── data_ingestion.py             # 14-day climate forecast ingestion & anomaly detection
├── plant_categorization.py       # Crop Vulnerability Matrix (phenology & stress sensitivity)
├── ensemble_model.py             # Hybrid RF-SVM Machine Learning pipeline
├── alert_engine.py               # Plain-language SMS & voice alert translation
└── main.py                       # CLI demo runner comparing resilient vs. vulnerable crops
```

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js**: v18+ (v20+ recommended)
* **Python**: 3.10+
* **npm** or **pnpm**

### 1. Clone Repository
```bash
git clone https://github.com/IshaanYK/nimbooz.git
cd nimbooz
```

### 2. Run Main Farmer App
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

### 3. Run Admin Overwatch Console
```bash
cd ../admin
npm install
npm run dev
# Running on http://localhost:3001
```

### 4. Run Python ML Pipeline
```bash
cd ..
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python main.py
```

---

## 🛡️ License & Acknowledgements
* Developed for **Hack Core 2026**.
* Built with Next.js, Google Gemini, Google Cloud Speech, Open-Meteo, and Agmarknet APMC datasets.
