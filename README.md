# HACK CORE 2026: PS-02 Hybrid Ensemble EWS Prototype

## Overview
This repository contains the ideation-phase prototype for **PS-02: Climate Stress Early Warning for Biological Intervention**. 
Our platform shifts the paradigm from "Reactive Crop Management" to **Hyper-Local Pre-emptive Biochemical Execution**.

By mathematically combining meteorological drought indices (SPEI/RDI) with physical crop vulnerability metrics, our Hybrid RF-SVM Ensemble acts as a "Time Machine", predicting stress events 7-14 days out and recommending the perfect hourly spray window for Syngenta Biostimulants.

## Architecture
1. **Sensing Layer (`data_ingestion.py`)**: Mocks ingestion of 14-day forecasts and satellite indices. Designed to integrate with ANNAM.AI 3km ground-truth stations.
2. **Categorization Layer (`plant_categorization.py`)**: The Crop Vulnerability Matrix. It proves we save farmers money by preventing "false alarms" on naturally resilient crops.
3. **Processing Layer (`ensemble_model.py`)**: The Hybrid RF-SVM engine processes non-linear weather features. It gates spray applications based on physical constraints (Delta-T between 2°C - 8°C).
4. **Action Layer (`alert_engine.py`)**: Google Gemini XAI translates the probabilistic SVM output into actionable, plain-language SMS recommendations.

## Usage
Run the main pipeline to see the difference between how the model handles a highly vulnerable crop vs. a highly resilient crop under the exact same climate stress event:
```bash
python3 main.py
```

## Research Backing
*   **Ensemble Methodology:** Based on literature proving RF-SVM architectures reduce drought-induced yield losses by 22-34%.
*   **Spray Physics:** Mathematically gates application using Delta-T to prevent chemical drift and ensure stomatal absorption.
