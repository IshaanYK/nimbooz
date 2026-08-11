# 🌾 PS-02 Engine — Climate Stress Early Warning System

**AgroShield: Pre-Emptive Biological Intervention via Multi-Modal Sensor Fusion**

## Quick Start

```bash
cd ps02-engine
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Then open **http://127.0.0.1:7000** in your browser.

## Architecture (5-Layer Pipeline)

```
Layer 1: data_ingestion.py    → Live Meteoblue + CE Hub API calls
Layer 2: plant_categorization.py → Region-specific crop thresholds
Layer 3: ensemble_model.py    → Hybrid ML Stress Engine (HSI, DSI, CSI, Compound)
Layer 4: product_advisor.py   → Syngenta Biological product recommendations
Layer 5: alert_engine.py      → Explainable alerts + Forecast Uncertainty
```

## Key Features

- **Live API Integration**: Meteoblue Dataset API + Syngenta CE Hub
- **6 Stress Indices**: Heat (HSI), Drought (DSI), Cold (CSI), Waterlog, Vegetation, Compound
- **Agronomic Intelligence**: VPD, Growth Stage Phenology, Consecutive Hot Days, Rolling ET Deficit
- **Historical Anomaly Detection**: 30-year climate normal comparison
- **Forecast Uncertainty Quantification**: Confidence degrades from High → Moderate → Low
- **BRS Spray Safety Gate**: Delta-T + Wind + Precipitation checks
- **Region-Aware**: Punjab, Maharashtra, Tamil Nadu, Rajasthan, Karnataka profiles

## Environment Variables

Create a `.env` file in this directory:

```
METEOBLUE_API_KEY=your_key_here
CEHUB_API_TOKEN=your_token_here
```
