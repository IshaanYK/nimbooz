"use client";

import React, { useState } from "react";
import {
  Cpu,
  Layers,
  Sparkles,
  GitBranch,
  BarChart3,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Scale,
  Mic,
  Eye,
  FileText,
  User,
  Users,
  ExternalLink,
  Code2,
  Calculator,
  ShieldCheck,
  Zap,
  Globe,
  Sliders,
  ChevronDown,
  Clock
} from "lucide-react";
import Link from "next/link";
import { BiologicalActivationCountdown } from "./BiologicalActivationCountdown";
import { CropFitEconomicMatrix } from "./CropFitEconomicMatrix";
import { CausalAttributionInspector } from "./CausalAttributionInspector";
import { GeminiVisionGrowthEstimator } from "./GeminiVisionGrowthEstimator";

export const ConceptNoteExplorer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    "hybrid_pipeline" | "formulas" | "model_eval" | "datasets" | "ramesh_story" | "team"
  >("hybrid_pipeline");

  const [activePipelinePhase, setActivePipelinePhase] = useState<number>(1);

  // Interactive formula state
  const [tMax, setTMax] = useState<number>(36);
  const [tMin, setTMin] = useState<number>(24);
  const [tBase, setTBase] = useState<number>(10);
  const [hsi, setHsi] = useState<number>(0.85);
  const [dsi, setDsi] = useState<number>(0.70);
  const [synergy, setSynergy] = useState<number>(1.25);
  const [fcstScore, setFcstScore] = useState<number>(90);
  const [matchScore, setMatchScore] = useState<number>(88);
  const [evidScore, setEvidScore] = useState<number>(95);

  // Calculated formulas
  const calculatedGDD = Math.max(0, Math.round(((tMax + tMin) / 2 - tBase) * 10) / 10);
  const calculatedCompoundStress = +(hsi * dsi * synergy).toFixed(3);
  const calculatedConfidence = Math.round(0.40 * fcstScore + 0.35 * matchScore + 0.25 * evidScore);

  const pipelinePhases = [
    {
      step: 1,
      title: "1. Zero-Touch Onboarding",
      component: "Gemini 1.5 Pro + Speech-to-Text",
      role: "Converts vernacular farmer voice in 5 languages into structured twin inputs (Crop, Sowing Date, GPS Location).",
      tags: ["Vernacular Audio", "Intent Extraction", "Multimodal Fallback"],
      tech: "Google Cloud STT + Gemini 1.5 Pro",
    },
    {
      step: 2,
      title: "2. Data Ingestion (API Layer)",
      component: "Meteoblue, Syngenta CE Hub, Agmarknet, ANNAM.AI",
      role: "Streams live weather forecasts, soil parameters (pH, moisture, texture), and local Mandi commodity pricing.",
      tags: ["Open-Meteo", "CE Hub Telemetry", "Agmarknet APMC"],
      tech: "FastAPI + Meteoblue + CE Hub",
    },
    {
      step: 3,
      title: "3. Mechanistic Layer",
      component: "GDD Phenology + FAO Penman-Monteith ET / VPD",
      role: "Converts raw environmental telemetry into biologically meaningful growth stages and atmospheric drying stress.",
      tags: ["Formula 3.1", "Physics Engine", "VPD Deficit"],
      tech: "Deterministic Agronomic Physics",
    },
    {
      step: 4,
      title: "4. ML & Causal Layer",
      component: "XGBoost Synergy + Double ML (EconML)",
      role: "Models non-linear compound heat+drought risk and estimates unconfounded counterfactual baseline yield.",
      tags: ["Formula 3.2", "RMSLE 0.16", "Treatment Effect"],
      tech: "XGBoost + EconML + Scikit-Learn",
    },
    {
      step: 5,
      title: "5. Decision Layer",
      component: "CropFit Expert Matrix + Marginal Economic Optimizer",
      role: "Applies agronomic safety constraints and maximizes farmer net ₹/acre profit across Apply vs Delay vs Skip.",
      tags: ["Formula 3.3", "Live Mandi ROI", "Dosage Calibrator"],
      tech: "Mathematical Optimization",
    },
    {
      step: 6,
      title: "6. Multimodal Output",
      component: "Google Cloud TTS + WhatsApp UI",
      role: "Delivers crisp, jargon-free audio advisories in farmer's mother tongue with WhatsApp-style lightweight UX.",
      tags: ["Google Neural Audio", "Bilingual Card", "WhatsApp Sim"],
      tech: "Google Cloud TTS + Next.js App Router",
    },
  ];

  const rmsleComparisonData = [
    { model: "Ridge Reg.", rmsle: 0.41, note: "Linear baseline, misses non-linear interactions", color: "bg-slate-700" },
    { model: "SVR", rmsle: 0.35, note: "High compute latency, moderate fit", color: "bg-slate-600" },
    { model: "DNN", rmsle: 0.28, note: "Overfits on small tabular sample size", color: "bg-slate-500" },
    { model: "Random Forest", rmsle: 0.22, note: "Good ensemble, lacks gradient refinement", color: "bg-amber-600" },
    { model: "GBR (Our MVP)", rmsle: 0.18, note: "Fast baseline gradient boosting", color: "bg-emerald-600" },
    { model: "XGBoost (Chosen)", rmsle: 0.16, note: "Best RMSLE accuracy + feature interpretability", color: "bg-emerald-400" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12 font-sans text-slate-100">
      
      {/* Top Header & Concept Note Banner */}
      <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                TEAM-2 CONCEPT NOTE & ARCHITECTURE SPECIFICATION
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                HACK CORE 2026
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
              AASRA Hybrid AI/ML Intelligence Platform
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
              Mechanistic agricultural models, machine learning, causal inference, and economic decision logic unified into a voice-first climate resilience platform for Indian smallholders.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://github.com/23f2003927/hyperion"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
            >
              <Code2 className="h-4 w-4 text-emerald-400" />
              <span>GitHub Repo</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* 4 Problem Statements Summary Grid (PS-02, PS-03, PS-07, PS-04) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
              PS-02 : Climate Stress Warning
            </span>
            <h4 className="text-sm font-bold text-white">Phenology & Activation Clock</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              GDD growth-stage modeling gives 3–14 days advance warning with a Day 1 vs Day 3 biological activation countdown.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              PS-03 : CropFit Product Advisor
            </span>
            <h4 className="text-sm font-bold text-white">Personalised Biological Match</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Matches field soil, crop stage, and stress with precise dosage, timing, confidence scoring, and Apply/Delay/Skip economics.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              PS-07 : Yield Impact Predictor
            </span>
            <h4 className="text-sm font-bold text-white">Double ML Causal Proof</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Separates seasonal weather noise from biological treatment effects to prove verifiable yield gains and ROBI (₹/acre).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
              PS-04 : Multilingual Chatbot
            </span>
            <h4 className="text-sm font-bold text-white">Voice-First Low-Literacy AI</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Google STT/TTS in Hindi, Marathi, Tamil, Telugu with Gemini Vision growth-stage fallback and WhatsApp-style simplicity.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg no-scrollbar">
        <button
          onClick={() => setActiveSection("hybrid_pipeline")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSection === "hybrid_pipeline" ? "bg-emerald-600 text-white shadow-md font-black" : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Layers className="h-4 w-4" /> 1. Hybrid AI/ML Pipeline
        </button>

        <button
          onClick={() => setActiveSection("formulas")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSection === "formulas" ? "bg-emerald-600 text-white shadow-md font-black" : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Calculator className="h-4 w-4" /> 2. Core Mathematical Engines
        </button>

        <button
          onClick={() => setActiveSection("model_eval")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSection === "model_eval" ? "bg-emerald-600 text-white shadow-md font-black" : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <BarChart3 className="h-4 w-4" /> 3. Model Benchmarks & RMSLE
        </button>

        <button
          onClick={() => setActiveSection("datasets")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSection === "datasets" ? "bg-emerald-600 text-white shadow-md font-black" : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Database className="h-4 w-4" /> 4. Datasets & Resources
        </button>

        <button
          onClick={() => setActiveSection("ramesh_story")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSection === "ramesh_story" ? "bg-emerald-600 text-white shadow-md font-black" : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <User className="h-4 w-4" /> 5. Ramesh Farmer Storyline
        </button>

        <button
          onClick={() => setActiveSection("team")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSection === "team" ? "bg-emerald-600 text-white shadow-md font-black" : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Users className="h-4 w-4" /> 6. Team-2 Credits
        </button>
      </div>

      {/* 1. Hybrid Pipeline Section */}
      {activeSection === "hybrid_pipeline" && (
        <div className="space-y-8 animate-fade-in">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                Section 03.1: Hybrid AI/ML Pipeline
              </span>
              <h3 className="text-2xl font-black text-white">
                Raw Inputs → Biological Features → Risk & Efficacy → Economic Decision → Farmer Advisory
              </h3>
              <p className="text-sm text-slate-400 font-normal">
                Instead of a single black-box LLM, AASRA decouples agronomic physics, non-linear ML stress modeling, and causal inference.
              </p>
            </div>

            {/* 6-Phase Interactive Stepper Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pipelinePhases.map((phase) => {
                const isSelected = activePipelinePhase === phase.step;
                return (
                  <button
                    key={phase.step}
                    onClick={() => setActivePipelinePhase(phase.step)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? "bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-emerald-400">
                        PHASE {phase.step}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {phase.tech}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{phase.title}</h4>
                    <p className="text-xs text-slate-400 font-normal leading-relaxed">{phase.role}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {phase.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Embedded Biological Activation Countdown & Decision Widgets */}
          <div className="space-y-6">
            <BiologicalActivationCountdown cropName="Soybean (JS 335)" stressType="Heatwave & Moisture Deficit (V4 Flowering Stage)" />
            <CropFitEconomicMatrix cropName="Soybean" fieldAcres={12.5} mandiPricePerQuintal={4920} />
            <CausalAttributionInspector cropName="Soybean (JS 335)" season="Kharif 2025-26" district="Sehore, MP" />
            <GeminiVisionGrowthEstimator />
          </div>
        </div>
      )}

      {/* 2. Core Mathematical Engines Section */}
      {activeSection === "formulas" && (
        <div className="space-y-8 animate-fade-in">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-8">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                Section 03.2: Core Intelligence Mathematical Formulas
              </span>
              <h3 className="text-2xl font-black text-white">
                Interactive Mechanistic & Decision Formula Calibrators
              </h3>
              <p className="text-sm text-slate-400 font-normal">
                Test the three core governing equations defined in the Concept Note with live interactive parameters.
              </p>
            </div>

            {/* Formula 3.1: GDD Phenology Engine */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">Formula 3.1 : Mechanistic Phenology</span>
                  <h4 className="text-lg font-bold text-white">Growing Degree Days (GDD) Accumulator</h4>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 font-bold">
                  GDD = max(0, (T_max + T_min) / 2 - T_base)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">T_max (Peak Day Temp): {tMax}°C</label>
                  <input
                    type="range"
                    min={20}
                    max={48}
                    value={tMax}
                    onChange={(e) => setTMax(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">T_min (Night Min Temp): {tMin}°C</label>
                  <input
                    type="range"
                    min={10}
                    max={32}
                    value={tMin}
                    onChange={(e) => setTMin(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">T_base (Base Temp for Soybean): {tBase}°C</label>
                  <input
                    type="range"
                    min={5}
                    max={15}
                    value={tBase}
                    onChange={(e) => setTBase(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Daily Heat Units Accumulated (GDD):</span>
                <span className="font-mono text-xl font-black text-amber-400">{calculatedGDD} °C-days / day</span>
              </div>
            </div>

            {/* Formula 3.2: Compound Stress Engine */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Formula 3.2 : Compound Stress Model</span>
                  <h4 className="text-lg font-bold text-white">Heat Stress Index (HSI) & Drought Stress Index (DSI)</h4>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 font-bold">
                  Compound Stress = HSI × DSI × Synergy
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">HSI (Heat Stress Index): {hsi}</label>
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={hsi}
                    onChange={(e) => setHsi(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">DSI (Drought Stress Index): {dsi}</label>
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={dsi}
                    onChange={(e) => setDsi(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Synergy Factor (Flowering Vulnerability): {synergy}x</label>
                  <input
                    type="range"
                    min={1.0}
                    max={2.0}
                    step={0.05}
                    value={synergy}
                    onChange={(e) => setSynergy(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Compound Crop Stress Index:</span>
                <span className="font-mono text-xl font-black text-emerald-400">{calculatedCompoundStress} / 1.000</span>
              </div>
            </div>

            {/* Formula 3.3: Confidence Scoring */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Formula 3.3 : Decision Confidence Scoring</span>
                  <h4 className="text-lg font-bold text-white">Transparent Confidence Decomposition</h4>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 font-bold">
                  Score = 0.40(Forecast) + 0.35(Match) + 0.25(Evidence)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Forecast Reliability: {fcstScore}%</label>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={fcstScore}
                    onChange={(e) => setFcstScore(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Product-Condition Match: {matchScore}%</label>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={matchScore}
                    onChange={(e) => setMatchScore(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Field Trial Evidence: {evidScore}%</label>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={evidScore}
                    onChange={(e) => setEvidScore(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Composite Recommendation Confidence:</span>
                <span className="font-mono text-xl font-black text-cyan-400">{calculatedConfidence}% Confidence</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Model Benchmarks & RMSLE Section */}
      {activeSection === "model_eval" && (
        <div className="space-y-8 animate-fade-in">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-8">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                Section 03.4: Architectural Model Selection & RMSLE Evaluation
              </span>
              <h3 className="text-2xl font-black text-white">
                Figure 2 RMSLE Benchmark Comparison (Lower is Better)
              </h3>
              <p className="text-sm text-slate-400 font-normal">
                Comparison across 20 candidate architectures across 4 core engines to ensure MVP feasibility, interpretability, and safety.
              </p>
            </div>

            {/* Visual RMSLE Bar Chart */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="space-y-3">
                {rmsleComparisonData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{item.model}</span>
                      <span className="font-mono font-black text-emerald-400">RMSLE: {item.rmsle}</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${(item.rmsle / 0.5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 block">{item.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Selection Decision Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase bg-slate-900/60">
                    <th className="p-3.5">Engine</th>
                    <th className="p-3.5">Selected Approach</th>
                    <th className="p-3.5">Alternatives Considered</th>
                    <th className="p-3.5">Why We Selected It</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-bold text-white">Stress Prediction</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">Gradient Boosting / XGBoost</td>
                    <td className="p-3.5 text-slate-400">Ridge, SVR, Random Forest, DNN</td>
                    <td className="p-3.5 text-slate-300">Captures non-linear weather interactions on tabular data while retaining feature interpretability.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-bold text-white">Growth Stage</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">GDD Phenology</td>
                    <td className="p-3.5 text-slate-400">Random Forest, CNN, LSTM, YOLO, HMM</td>
                    <td className="p-3.5 text-slate-300">Uses accumulated heat units directly, requiring zero large labelled image datasets.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-bold text-white">Product Recommendation</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">CropFit Expert Matrix</td>
                    <td className="p-3.5 text-slate-400">KNN, LLM, Decision Tree, Collaborative Filtering, RL</td>
                    <td className="p-3.5 text-slate-300">Known agronomic safety constraints (e.g. soil pH, moisture limits) enforced deterministically.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-bold text-white">Dosage Optimisation</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">Marginal Economic Optimisation</td>
                    <td className="p-3.5 text-slate-400">DQN, MLP, Genetic Algorithm, Bayesian Optimisation</td>
                    <td className="p-3.5 text-slate-300">1D convex economic profit optimization makes direct mathematical derivative solution reliable and fast.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Datasets & Resources Section */}
      {activeSection === "datasets" && (
        <div className="space-y-8 animate-fade-in">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                Section 04: Use of Datasets & Resources
              </span>
              <h3 className="text-2xl font-black text-white">
                Primary Organizer APIs & Supplementary Open Repositories
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Organizer Resources */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  04.1 Primary Organizer Resources
                </span>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-white block">Meteoblue Dataset API:</strong> Historical + forecast weather, soil moisture, ET0 and vegetation indices.
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-white block">Syngenta CE Hub APIs:</strong> Cross-checks derived crop stress indicators and provides field ground-truth.
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-white block">ANNAM.AI Climate Datasets:</strong> Micro-climate validation and regional monsoon anomaly testing.
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-white block">Syngenta Product-Efficacy Data:</strong> Biological modes of action, application windows, and dosage curves.
                  </li>
                </ul>
              </div>

              {/* Supplementary Open Resources */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  04.2 Supplementary Open Resources
                </span>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-white block">data.gov.in:</strong> District-level historical crop yields for PS-07 Double ML counterfactual baseline modeling.
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-white block">ICRISAT VDSA:</strong> Semi-arid rainfed crop context and regional management practices.
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-white block">Agmarknet Mandi Prices:</strong> Real-time APMC wholesale price feeds for PS-03 economic profit calculations.
                  </li>
                  <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-white block">FAO & ICRISAT Literature:</strong> Base temperatures (T_base), GDD thresholds, and crop water coefficients (Kc).
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Ramesh Farmer Storyline Section */}
      {activeSection === "ramesh_story" && (
        <div className="space-y-8 animate-fade-in">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                Section 06.1 & 07: End-to-End Persona Walkthrough
              </span>
              <h3 className="text-2xl font-black text-white">
                Ramesh's Field Journey: From Heatwave Threat to Proven Harvest Profit
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-mono font-black">
                  1
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="text-sm font-bold text-white">Day -3: Advance Heat Stress Alert via Vernacular Voice</h4>
                  <p className="text-slate-400">
                    Ramesh receives a Hindi WhatsApp voice note from AASRA: "रामेश जी, अगले 4 दिनों में तापमान 38°C तक पहुँचेगा। आपके सोयाबीन के फूलने के चरण में नुकसान हो सकता है।"
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-mono font-black">
                  2
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="text-sm font-bold text-white">Day 1: Biological Activation Clock & Economic Decision</h4>
                  <p className="text-slate-400">
                    AASRA shows Ramesh that applying Syngenta Quantis on Day 1 preserves 94% yield (₹2,450/ac gain), whereas waiting until Day 3 drops protection to 38%. Ramesh applies 250ml/acre immediately.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 font-mono font-black">
                  3
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="text-sm font-bold text-white">Post-Harvest: Double ML Proof & Verified ₹6,810/acre Return</h4>
                  <p className="text-slate-400">
                    At harvest, AASRA's causal engine proves Ramesh harvested 8.4 q/acre vs 6.9 q/acre counterfactual neighbor baseline, securing +₹6,810/acre net gain and confirming a 12.9x ROBI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Team-2 Credits Section */}
      {activeSection === "team" && (
        <div className="space-y-8 animate-fade-in">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                Section 08: Team-2 Contributions
              </span>
              <h3 className="text-2xl font-black text-white">
                Core Engineering & Agronomic Architecture Team
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Team Lead</span>
                <h4 className="text-base font-black text-white">Divyansh Sharma</h4>
                <p className="text-xs text-slate-400">System Design & ML Architecture</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Agronomy Lead</span>
                <h4 className="text-base font-black text-white">Ritvik Malhotra</h4>
                <p className="text-xs text-slate-400">Agronomic Intelligence & Decision Logic</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Frontend / UX</span>
                <h4 className="text-base font-black text-white">Ishaan Sen</h4>
                <p className="text-xs text-slate-400">Full Stack Developer & Multimodal UI</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Backend & Cloud</span>
                <h4 className="text-base font-black text-white">Sameer Mishra</h4>
                <p className="text-xs text-slate-400">Backend Engineering & API Integration</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Data & Causal ML</span>
                <h4 className="text-base font-black text-white">Rishabh Barthwal</h4>
                <p className="text-xs text-slate-400">Machine Learning & Data Analytics</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
