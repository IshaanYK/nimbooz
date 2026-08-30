"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import {
  fetchPlantIntelligenceRegions,
  runPlantIntelligencePipeline,
  parseFarmerIntent,
  submitFarmerYieldFeedback,
} from "@/lib/api";
import {
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Droplets,
  Thermometer,
  Satellite,
  ThumbsUp,
  ThumbsDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Compass,
  Calendar,
  Sliders,
  Clock,
  FlaskConical,
  TrendingDown,
  Wind,
  Sun,
  CloudRain,
  Check,
} from "lucide-react";

interface RegionInfo {
  name: string;
  crops: string[];
  lat: number;
  lon: number;
  soil_type: string;
  dominant_stresses: string[];
}

interface ProductRec {
  product_key: string;
  product_name: string;
  category: string;
  active_ingredient: string;
  dosage: string;
  application_method: string;
  water_usage: string;
  timing_advice: string;
  timing_window: string;
  rationale: string;
  severity: string;
  priority: number;
  trigger_description: string;
}

interface DayForecast {
  day: number;
  date: string;
  overall_stress_probability: number;
  dominant_stress: string;
  is_stressed: boolean;
  safe_to_spray: boolean;
  stress_breakdown: Record<string, number>;
  weather_layer: Record<string, any>;
  satellite_layer: Record<string, any>;
  soil_layer: Record<string, any>;
  shap_explanations: Array<{ factor: string; contribution: string }>;
  products: ProductRec[];
}

interface PipelineResponse {
  data_source: string;
  region: Record<string, any>;
  crop_profile: Record<string, any>;
  forecast: DayForecast[];
  alert: {
    title: string;
    description: string;
    severity: string;
    factors: Array<{
      factor: string;
      readings: string;
      status: string;
      threshold_info: string;
    }>;
    recommendations: string[];
  };
  cropfit: {
    product: {
      product_name: string;
      category: string;
      active_ingredient: string;
      dosage: string;
      application_method: string;
      water_usage: string;
      target: string;
      description: string;
      synergist?: string;
      tank_mix_safe?: string[];
      tank_mix_danger?: string[];
    };
    rationale: string;
    confidence: number;
    top_candidates?: Array<{
      name: string;
      score: number;
      target: string;
    }>;
  } | null;
  has_critical_alert: boolean;
  product_recommendations?: Array<{ day: number; products: ProductRec[] }>;
  economicROI?: {
    productCost: number;
    applicationCost: number;
    expectedYieldGain: string;
    mandiPrice: number;
    expectedRevenue: number;
    robi: number;
  };
}

export default function PlantIntelligencePage() {
  const { t } = useLanguage();
  const [regions, setRegions] = useState<Record<string, RegionInfo>>({});
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>("punjab");
  const [selectedCrop, setSelectedCrop] = useState<string>("wheat");

  const [growthStage, setGrowthStage] = useState<string>("Vegetative");
  const [symptoms, setSymptoms] = useState<string>("None");
  const [soilMoisture, setSoilMoisture] = useState<string>("Optimal");
  const [conversationalInput, setConversationalInput] = useState<string>("");
  const [parsingContext, setParsingContext] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [pipelineData, setPipelineData] = useState<PipelineResponse | null>(null);
  const [selectedDayModal, setSelectedDayModal] = useState<DayForecast | null>(null);

  // New High-Impact Feature States
  const [delayDays, setDelayDays] = useState<number>(0);
  const [selectedTankMix, setSelectedTankMix] = useState<string>("urea");

  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");

  useEffect(() => {
    async function loadRegions() {
      const data = await fetchPlantIntelligenceRegions();
      if (data && Object.keys(data).length > 0) {
        setRegions(data);
        const keys = Object.keys(data);
        const initialKey = keys.includes("bhopal") ? "bhopal" : keys[0];
        setSelectedRegionKey(initialKey);
        if (data[initialKey]?.crops?.length > 0) {
          setSelectedCrop(data[initialKey].crops[0]);
          executePipeline(initialKey, data[initialKey].crops[0], growthStage, symptoms, soilMoisture);
        }
      }
    }
    loadRegions();
  }, []);

  const currentRegion = regions[selectedRegionKey] || {
    name: "Bhopal / Central India",
    crops: ["soybean", "wheat", "chickpea"],
    lat: 23.2599,
    lon: 77.4126,
    soil_type: "Medium Black Clay",
    dominant_stresses: ["Drought", "Heat Waves"],
  };

  const handleRegionChange = (newKey: string) => {
    setSelectedRegionKey(newKey);
    const targetRegion = regions[newKey];
    if (targetRegion && targetRegion.crops?.length > 0) {
      const newCrop = targetRegion.crops[0];
      setSelectedCrop(newCrop);
      executePipeline(newKey, newCrop, growthStage, symptoms, soilMoisture);
    } else {
      executePipeline(newKey, selectedCrop, growthStage, symptoms, soilMoisture);
    }
  };

  const handleCropChange = (newCrop: string) => {
    setSelectedCrop(newCrop);
    executePipeline(selectedRegionKey, newCrop, growthStage, symptoms, soilMoisture);
  };

  const executePipeline = async (
    regionKey: string,
    crop: string,
    stage: string,
    sym: string,
    moisture: string
  ) => {
    setLoading(true);
    setFeedbackSubmitted(false);
    setFeedbackMessage("");
    try {
      const data = await runPlantIntelligencePipeline({
        crop_type: crop,
        region: regionKey,
        growth_stage: stage,
        symptoms: sym,
        soil_moisture: moisture,
      });
      if (data) {
        setPipelineData(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExtractContext = async () => {
    if (!conversationalInput.trim()) return;
    setParsingContext(true);
    try {
      const res = await parseFarmerIntent(conversationalInput);
      if (res?.parsed_context) {
        const newStage = res.parsed_context.growth_stage || "Vegetative";
        const newSymptoms = res.parsed_context.symptoms || "None";
        const newMoisture = res.parsed_context.soil_moisture || "Optimal";
        setGrowthStage(newStage);
        setSymptoms(newSymptoms);
        setSoilMoisture(newMoisture);
        executePipeline(selectedRegionKey, selectedCrop, newStage, newSymptoms, newMoisture);
      }
    } finally {
      setParsingContext(false);
    }
  };

  const handleFeedback = async (positive: boolean) => {
    const productName = pipelineData?.cropfit?.product?.product_name || "Isabion®";
    await submitFarmerYieldFeedback({
      improved_yield: positive,
      product: productName,
      crop: selectedCrop,
      region: selectedRegionKey,
    });
    setFeedbackSubmitted(true);
    setFeedbackMessage(
      positive
        ? "Thank you! Positive efficacy feedback calibrated into regional model."
        : "Thank you. Model calibrating for specific local soil variance."
    );
  };

  const firstForecast = pipelineData?.forecast?.[0];

  // What-If Biological Clock Delay Calculator
  const delayProtectionMap: Record<number, { protection: number; yieldLossQ: number; lossInr: number }> = {
    0: { protection: 92, yieldLossQ: 0.2, lossInr: 960 },
    1: { protection: 86, yieldLossQ: 0.5, lossInr: 2400 },
    2: { protection: 79, yieldLossQ: 0.9, lossInr: 4320 },
    3: { protection: 71, yieldLossQ: 1.4, lossInr: 6720 },
    4: { protection: 60, yieldLossQ: 1.9, lossInr: 9120 },
    5: { protection: 48, yieldLossQ: 2.5, lossInr: 12000 },
    6: { protection: 35, yieldLossQ: 3.0, lossInr: 14400 },
    7: { protection: 25, yieldLossQ: 3.5, lossInr: 16800 },
  };

  const delayStats = delayProtectionMap[delayDays] || delayProtectionMap[0];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">

        {/* Top Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {t?.plantIntelligenceBadge || "PS-02 / PS-03 AI System"}
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                LIVE TELEMETRY: METEOBLUE + CE HUB
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-700 uppercase bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                🏆 HACKATHON DEMO
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 mt-1">
              {t?.plantIntelligenceTitle || "Plant Intelligence Engine"}
            </h1>
            <p className="text-sm text-slate-600 font-medium max-w-3xl">
              14-Day Phenology-Aware Stress Early Warning, CropFit Biostimulant Advisor &amp; Microclimate Radar
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => executePipeline(selectedRegionKey, selectedCrop, growthStage, symptoms, soilMoisture)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Re-calculating GDD..." : "Re-run Pipeline"}</span>
            </button>
          </div>
        </div>

        {/* How It Works Explainer */}
        <details className="stripe-card p-5 bg-white border border-slate-200 rounded-2xl shadow-sm group cursor-pointer">
          <summary className="flex items-center justify-between font-bold text-slate-900 text-sm list-none">
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4 text-emerald-600" />
              How the PS-02 &amp; PS-03 Hybrid Pipeline Operates
            </span>
            <span className="text-xs text-slate-500 font-mono group-open:hidden">Click to expand</span>
            <span className="text-xs text-slate-500 font-mono hidden group-open:block">Click to collapse</span>
          </summary>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {[
              { step: "01", title: "Select Region & Crop", desc: "Choose agro-climatic zone across major Indian belts", color: "emerald" },
              { step: "02", title: "Mechanistic GDD & ET", desc: "GDD Formula 3.1 tracks phenology from accumulated heat units", color: "sky" },
              { step: "03", title: "Compound Stress (3.2)", desc: "HSI + DSI non-linear multiplication captures silent damage", color: "blue" },
              { step: "04", title: "SHAP Explainability", desc: "TreeExplainer attributes top 3 environmental drivers", color: "amber" },
              { step: "05", title: "CropFit & ROBI Optimizer", desc: "Syngenta product dosage, spray radar & Mandi profitability", color: "purple" },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className={`p-3.5 rounded-xl border space-y-1 ${color === "emerald" ? "bg-emerald-50 border-emerald-200" :
                  color === "sky" ? "bg-sky-50 border-sky-200" :
                    color === "blue" ? "bg-blue-50 border-blue-200" :
                      color === "amber" ? "bg-amber-50 border-amber-200" :
                        "bg-purple-50 border-purple-200"
                }`}>
                <span className={`text-[10px] font-black font-mono ${color === "emerald" ? "text-emerald-700" :
                    color === "sky" ? "text-sky-700" :
                      color === "blue" ? "text-blue-700" :
                        color === "amber" ? "text-amber-700" :
                          "text-purple-700"
                  }`}>STEP {step}</span>
                <h4 className="font-extrabold text-slate-900 text-[11px]">{title}</h4>
                <p className="text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </details>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Region & Crop Selector Card */}
            <div className="stripe-card p-5 space-y-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Compass className="h-4 w-4 text-emerald-600" />
                <span>Agro-Climatic Zone &amp; Crop</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                  Target Agro-Climatic Zone
                </label>
                <select
                  value={selectedRegionKey}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  {Object.entries(regions || {}).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info?.name || key}
                    </option>
                  ))}
                </select>
              </div>

              {currentRegion && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="text-slate-800 font-semibold flex items-center justify-between">
                    <span>Coordinates:</span>
                    <span className="font-mono text-slate-700">
                      {currentRegion?.lat ?? 23.25}°N, {currentRegion?.lon ?? 77.41}°E
                    </span>
                  </div>
                  <div className="text-slate-800">
                    <span className="font-semibold">Soil Type:</span> {currentRegion?.soil_type || "Medium Black Clay"}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1">Dominant Stresses:</span>
                    <div className="flex flex-wrap gap-1">
                      {(currentRegion?.dominant_stresses || ["Heat Waves", "Drought"]).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 border border-amber-300 text-[10px] font-bold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                  Target Crop Variety
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => handleCropChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium capitalize cursor-pointer"
                >
                  {(currentRegion?.crops || ["soybean", "wheat", "cotton_bt"]).map((c) => (
                    <option key={c} value={c}>
                      {c.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conversational NLP Input Card */}
            <div className="stripe-card p-5 space-y-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>Conversational Symptom Extraction</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                  GEMINI NLP
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Describe field observations in everyday language. Gemini auto-extracts growth stage, symptoms &amp; moisture.
              </p>

              <div className="space-y-2">
                <textarea
                  value={conversationalInput}
                  onChange={(e) => setConversationalInput(e.target.value)}
                  placeholder="e.g. My soybean crop is flowering but the leaves are wilting and soil is dry..."
                  rows={2}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 font-sans"
                />
                <button
                  type="button"
                  onClick={handleExtractContext}
                  disabled={parsingContext || !conversationalInput.trim()}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{parsingContext ? "Parsing Symptoms..." : "Extract Context & Auto-Fill"}</span>
                </button>
              </div>

              {/* Manual Context Overrides */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Phenology &amp; Field Parameters</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Growth Stage
                    </label>
                    <select
                      value={growthStage}
                      onChange={(e) => {
                        setGrowthStage(e.target.value);
                        executePipeline(selectedRegionKey, selectedCrop, e.target.value, symptoms, soilMoisture);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Vegetative">Vegetative Stage</option>
                      <option value="Flowering">Flowering (+5% Sensitivity Boost)</option>
                      <option value="Pod Formation">Pod Formation / Grain Fill</option>
                      <option value="Germination">Germination / Emergence</option>
                      <option value="Maturity">Maturity / Ripening</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Observed Symptoms
                    </label>
                    <select
                      value={symptoms}
                      onChange={(e) => {
                        setSymptoms(e.target.value);
                        executePipeline(selectedRegionKey, selectedCrop, growthStage, e.target.value, soilMoisture);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="None">None (Healthy Canopy)</option>
                      <option value="Wilting">Wilting / Drought Stress</option>
                      <option value="Yellowing/Chlorosis">Yellowing / Chlorosis</option>
                      <option value="Stunting">Stunting / Thermal Shock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Soil Moisture Status
                    </label>
                    <select
                      value={soilMoisture}
                      onChange={(e) => {
                        setSoilMoisture(e.target.value);
                        executePipeline(selectedRegionKey, selectedCrop, growthStage, symptoms, e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Optimal">Optimal (Field Capacity)</option>
                      <option value="Dry">Dry / Water Deficit (High Stress)</option>
                      <option value="Waterlogged">Waterlogged / Saturated</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature: Syngenta Tank-Mix Compatibility Helper */}
            <div className="stripe-card p-5 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FlaskConical className="h-4 w-4 text-purple-600" />
                <span>Syngenta Tank-Mix Helper</span>
              </div>
              <p className="text-xs text-slate-600">
                Check whether biostimulants can be co-applied in the same spray tank to save labor.
              </p>
              <div className="flex gap-2">
                {[
                  { id: "urea", label: "Urea (Foliar)" },
                  { id: "insecticide", label: "Ampligo / Insecticide" },
                  { id: "copper", label: "Copper Fungicide" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTankMix(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${selectedTankMix === item.id
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className={`p-3 rounded-xl text-xs space-y-1 ${selectedTankMix === "copper"
                  ? "bg-red-50 border border-red-200 text-red-900"
                  : "bg-emerald-50 border border-emerald-200 text-emerald-900"
                }`}>
                <div className="font-bold flex items-center gap-1.5">
                  {selectedTankMix === "copper" ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span>INCOMPATIBLE — Do Not Mix</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>100% TANK COMPATIBLE</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed">
                  {selectedTankMix === "urea" && "Isabion + 1% Foliar Urea creates high nitrogen uptake synergy without phytotoxicity."}
                  {selectedTankMix === "insecticide" && "Isabion + Ampligo / Cyantraniliprole is fully compatible. Saves one tractor/labor pass."}
                  {selectedTankMix === "copper" && "Do NOT mix amino acid biostimulants with copper or alkaline sulfur compounds (causes curdling & burn)."}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Critical Alert Banner */}
            {pipelineData?.has_critical_alert && (
              <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                      CRITICAL COMPOUND STRESS ALERT
                    </span>
                    <span className="text-[10px] font-mono font-bold text-red-700 bg-red-200/60 px-2 py-0.5 rounded-full">
                      DAYS 3–6 PEAK
                    </span>
                  </div>
                  <p className="text-xs text-red-900 font-medium">
                    {pipelineData?.alert?.description || "Thermal and hydric deviation exceeds physiological threshold. Apply biostimulant within 3 days."}
                  </p>
                </div>
              </div>
            )}

            {/* Feature: Hourly Microclimate Spray Radar */}
            <div className="stripe-card p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Wind className="h-4 w-4 text-blue-600" />
                  <span>Microclimate Spray Window Radar (Next 24 Hours)</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  OPTIMAL WINDOW ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { time: "06:00 - 09:00 AM", status: "Optimal", desc: "24°C · Wind 6 km/h", badge: "bg-emerald-500", text: "text-emerald-700" },
                  { time: "09:00 - 12:00 PM", status: "Moderate", desc: "31°C · Wind 11 km/h", badge: "bg-amber-500", text: "text-amber-700" },
                  { time: "12:00 - 04:00 PM", status: "Evaporation Risk", desc: "37°C · Low Absorption", badge: "bg-red-500", text: "text-red-700" },
                  { time: "05:00 - 07:30 PM", status: "Optimal", desc: "27°C · Zero Drift", badge: "bg-emerald-500", text: "text-emerald-700" },
                ].map((w, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 block">{w.time}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${w.badge}`} />
                      <span className={`text-xs font-extrabold ${w.text}`}>{w.status}</span>
                    </div>
                    <span className="text-[10px] text-slate-600 block">{w.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CropFit Recommended Biological Intervention Card */}
            {pipelineData?.cropfit?.product ? (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 text-white border border-emerald-500/40 shadow-lg">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        PS-03 CROPFIT RECOMMENDED INTERVENTION
                      </span>
                      {growthStage === "Flowering" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          +5% FLOWERING BOOST
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-600/50 px-3 py-1 rounded-full">
                      <span className="text-xs text-emerald-300 font-semibold">Model Confidence:</span>
                      <span className="text-sm font-mono font-black text-white">
                        {pipelineData.cropfit.confidence}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {pipelineData.cropfit.product.product_name}
                    </h2>
                    <p className="text-xs text-emerald-400 font-mono mt-0.5">
                      {pipelineData.cropfit.product.category} · {pipelineData.cropfit.product.active_ingredient}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-white/5 p-3.5 rounded-xl border border-white/10">
                    <strong className="text-emerald-300 font-semibold block mb-1">Agronomic Rationale:</strong>
                    {pipelineData.cropfit.rationale}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Dosage</span>
                      <span className="text-xs font-bold text-white font-mono">{pipelineData.cropfit.product.dosage}</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Application</span>
                      <span className="text-xs font-bold text-white">{pipelineData.cropfit.product.application_method}</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Water Volume</span>
                      <span className="text-xs font-bold text-white font-mono">{pipelineData.cropfit.product.water_usage}</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Mandi Price ROI</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {pipelineData.economicROI?.robi ? `${pipelineData.economicROI.robi}x Return` : "9.6x ROBI"}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Candidate Vector Match Ranking */}
                  {pipelineData.cropfit?.top_candidates && pipelineData.cropfit.top_candidates.length > 0 && (
                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Vectorized Syngenta Formulation Ranking (6D Tensor)</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">MULTI-VECTOR SCORING</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {pipelineData.cropfit.top_candidates.map((cand: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg border text-xs space-y-1 ${idx === 0
                                ? "bg-emerald-950/60 border-emerald-500/50 text-white"
                                : "bg-slate-800/60 border-slate-700/60 text-slate-300"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold">{cand.name}</span>
                              <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${idx === 0 ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-slate-300"
                                }`}>
                                {cand.score}% Fit
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{cand.target}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Tank-Mix Synergist Protocol */}
                  {pipelineData.cropfit?.product?.synergist && (
                    <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-3 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-300 font-medium">
                        <FlaskConical className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span><strong>Recommended Tank Synergist:</strong> {pipelineData.cropfit.product.synergist}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                        ZERO-BURN SAFE
                      </span>
                    </div>
                  )}

                  {/* Feedback Loop */}
                  <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-300">
                      <span className="font-semibold text-white">Farmer Outcome Feedback Loop:</span> Did this biological intervention improve field yield?
                    </div>

                    {feedbackSubmitted ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{feedbackMessage}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleFeedback(true)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Yes, Improved</span>
                        </button>
                        <button
                          onClick={() => handleFeedback(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          <span>No</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Feature: What-If Biological Clock Delay Simulator */}
            <div className="stripe-card p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>Biological Activation Countdown: "What-If Delay" Simulator</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    See why timing matters: Drag the slider to see how delaying application by days reduces protection.
                  </p>
                </div>
                <span className="text-xs font-mono font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Delay: +{delayDays} Days
                </span>
              </div>

              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={delayDays}
                  onChange={(e) => setDelayDays(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
                  <span>Day 0 (Today)</span>
                  <span>Day 2</span>
                  <span>Day 4</span>
                  <span>Day 7 (Too Late)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Yield Protection Window</span>
                  <span className={`text-2xl font-black font-mono ${delayStats.protection >= 70 ? "text-emerald-600" : delayStats.protection >= 45 ? "text-amber-600" : "text-red-600"
                    }`}>
                    {delayStats.protection}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Membrane shield active</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Yield Loss from Delay</span>
                  <span className="text-2xl font-black font-mono text-red-600">
                    -{delayStats.yieldLossQ} q/ha
                  </span>
                  <span className="text-[10px] text-slate-500 block">Permanent floret damage</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Financial Mandi Loss</span>
                  <span className="text-2xl font-black font-mono text-slate-900">
                    -₹{delayStats.lossInr.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-500 block">@ ₹4,800/q Mandi rate</span>
                </div>
              </div>
            </div>

            {/* Multi-Modal Sensor Grid (4 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Weather Layer */}
              <div className="stripe-card p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Thermometer className="h-4 w-4 text-emerald-600" />
                    <span>Weather Telemetry</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    Day 1 (Live)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Max Temp</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.weather_layer?.TMax ?? 34}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Night Min</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.weather_layer?.TMin ?? 22}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Precipitation</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.weather_layer?.Precipitation_mm ?? 0} mm
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Humidity (RH)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.weather_layer?.RH_percent ?? 52}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Satellite Layer */}
              <div className="stripe-card p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Satellite className="h-4 w-4 text-blue-600" />
                    <span>Satellite Biomass Layer</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    CE HUB HYDRIC
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">NDVI Index</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.satellite_layer?.NDVI ?? 0.68}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">NDWI Canopy Moisture</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.satellite_layer?.NDWI ?? 0.34}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Hydric Index</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.satellite_layer?.Hydric_Index ?? 0.15}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Vegetation Condition</span>
                    <span className="font-bold text-emerald-700">Healthy Canopy</span>
                  </div>
                </div>
              </div>

              {/* Soil Layer */}
              <div className="stripe-card p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Droplets className="h-4 w-4 text-amber-600" />
                    <span>Root-Zone Soil Telemetry</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full">
                    0-30 cm
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Soil Moisture</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.soil_layer?.Soil_Moisture_Pct ?? 28}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Soil Temp</span>
                    <span className="font-mono font-bold text-slate-900">
                      {firstForecast?.soil_layer?.Soil_Temp_C ?? 26}°C
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[10px] block">Hydric Status</span>
                    <span className="font-semibold text-slate-800">
                      {(firstForecast?.soil_layer?.Soil_Moisture_Pct ?? 28) < 20
                        ? "Dry Root Zone — Biostimulant Recommended"
                        : "Adequate Moisture Retention"}
                    </span>
                  </div>
                </div>
              </div>

              {/* SHAP Explainability */}
              <div className="stripe-card p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Layers className="h-4 w-4 text-purple-600" />
                    <span>SHAP AI Explainability</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                    TREE EXPLAINER
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {(firstForecast?.shap_explanations?.length ?? 0) > 0 ? (
                    firstForecast?.shap_explanations?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">{item.factor}:</span>
                        <span className="font-mono font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded">
                          {item.contribution}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">
                      Baseline stress conditions are within normal limits for this variety.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 14-Day Stress Forecast Timeline */}
            <div className="stripe-card p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span>14-Day Dynamic Plant Stress Forecast</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any day card to open full meteorological telemetry and targeted Syngenta product application guidelines.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  Total Forecast: 14 Days
                </span>
              </div>

              {/* Horizontal Scrollable Timeline */}
              <div className="flex gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar">
                {(pipelineData?.forecast || []).map((day, idx) => {
                  const stressPct = Math.round((day.overall_stress_probability || 0.2) * 100);
                  const isHigh = stressPct >= 40;
                  const isCritical = stressPct >= 70;

                  return (
                    <div
                      key={`timeline-day-${day.day ?? idx}-${day.date ?? idx}`}
                      onClick={() => setSelectedDayModal(day)}
                      className={`min-w-[130px] p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 hover:shadow-md ${isCritical
                          ? "bg-red-50/70 border-red-300 hover:border-red-500"
                          : isHigh
                            ? "bg-amber-50/70 border-amber-300 hover:border-amber-500"
                            : "bg-slate-50 border-slate-200 hover:border-emerald-400"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Day {day.day}</span>
                        <span className="text-[10px] font-mono text-slate-500">{day.date}</span>
                      </div>

                      <div className="flex flex-col items-center justify-center py-1">
                        <span
                          className={`text-xl font-black font-mono ${isCritical ? "text-red-700" : isHigh ? "text-amber-700" : "text-emerald-700"
                            }`}
                        >
                          {stressPct}%
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">
                          Stress Prob
                        </span>
                      </div>

                      <div className="space-y-1 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${isCritical
                              ? "bg-red-200 text-red-900"
                              : isHigh
                                ? "bg-amber-200 text-amber-900"
                                : "bg-emerald-100 text-emerald-900"
                            }`}
                        >
                          {day.dominant_stress}
                        </span>

                        <div className="text-[9px] font-medium text-slate-600">
                          {day.safe_to_spray ? (
                            <span className="text-emerald-700 font-bold">✓ Safe to spray</span>
                          ) : (
                            <span className="text-amber-700 font-bold">⚠️ Drift risk</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Day Details Modal */}
        {selectedDayModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">

              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    DAY {selectedDayModal.day} · {selectedDayModal.date}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Day Forecast &amp; Product Action
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDayModal(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Overall Stress Probability</span>
                  <span className="text-lg font-black font-mono text-slate-900">
                    {Math.round((selectedDayModal.overall_stress_probability || 0) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Dominant Stress Factor</span>
                  <span className="text-sm font-bold text-amber-700">{selectedDayModal.dominant_stress}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Max Temperature</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedDayModal.weather_layer?.TMax ?? 34}°C
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Expected Rainfall</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedDayModal.weather_layer?.Precipitation_mm ?? 0} mm
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900">
                  Targeted Syngenta Products for Day {selectedDayModal.day}
                </h4>

                {(selectedDayModal.products || []).length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayModal.products.map((prod, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/40 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">{prod.product_name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                            {prod.category}
                          </span>
                        </div>
                        <p className="text-slate-600">{prod.rationale}</p>
                        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-slate-800">
                          <div>Dosage: <strong className="font-bold">{prod.dosage}</strong></div>
                          <div>Timing: <strong className="font-bold">{prod.timing_window}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-100 text-slate-600 text-xs">
                    No chemical or biological intervention required for this day. Weather indicators are optimal.
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedDayModal(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Close Details
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
