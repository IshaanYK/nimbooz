"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sparkles,
  ArrowRight,
  Sprout,
  ShieldAlert,
  Mic,
  TrendingUp,
  Activity,
  Package,
  Layers,
  Thermometer,
  CloudRain,
  Wind,
  CheckCircle2,
  Zap,
  Sliders,
  Award,
  ChevronRight,
  BookOpen,
  Compass,
  Play,
  Volume2
} from "lucide-react";

export default function LandingPage() {
  const { language, t } = useLanguage();
  const [calcAcres, setCalcAcres] = useState<number>(12.5);
  const [calcCrop, setCalcCrop] = useState<string>("soybean");

  // Dynamic ROI calculation based on Concept Note Section 03.2 & Section 07
  const pricePerQuintal = calcCrop === "soybean" ? 4850 : calcCrop === "cotton" ? 7200 : 2350;
  const quantisCostPerAcre = 850;
  const yieldProtectedPerAcre = calcCrop === "soybean" ? 0.60 : calcCrop === "cotton" ? 0.75 : 0.85;
  const grossYieldGainINR = Math.round(yieldProtectedPerAcre * pricePerQuintal * calcAcres);
  const totalInvestmentINR = Math.round(quantisCostPerAcre * calcAcres);
  const netFarmProfitINR = grossYieldGainINR - totalInvestmentINR;
  const robiRatio = Number((grossYieldGainINR / totalInvestmentINR).toFixed(1));

  return (
    <AppShell>
      <div className="space-y-20 pb-20 bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
        
        {/* ========================================================================= */}
        {/* HERO SECTION: Atmospheric Stripe Gradient Mesh & Value Proposition */}
        {/* ========================================================================= */}
        <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white border-b border-slate-200">
          
          {/* Subtle Ambient Background Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-0">
            <div className="absolute -top-40 left-1/4 w-[600px] h-[400px] bg-emerald-100/60 rounded-full blur-3xl" />
            <div className="absolute -top-20 right-1/4 w-[500px] h-[350px] bg-sky-100/50 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/3 w-[450px] h-[300px] bg-amber-50/70 rounded-full blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
            
            {/* Top Pill Badges */}
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                TEAM-2 CONCEPT NOTE · SYNGENTA BIOLOGICALS
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
                🌾 {t.askActProve || "ASK · ACT · PROVE"}
              </span>
            </div>

            {/* Main Bold Display Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display text-slate-900 tracking-tight leading-[1.08] max-w-5xl mx-auto">
              {t.heroTitle1 || "Biological Intelligence for Indian Agriculture."} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600">
                {t.heroTitle2 || "Predict Stress. Guide Action. Prove Returns."}
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
              {t.heroSubtitle || "AASRA turns satellite weather streams, micro-climate nocturnal heat telemetry, and biophysical crop models into localized vernacular voice guidance and verifiable financial proof (ROBI)."}
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sprout className="h-5 w-5" />
                <span>{t.btnStartFarm || "Launch Farmer Command Center"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/architecture"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <span>{language === "hi" ? "कॉन्सेप्ट नोट और गणित देखें" : "Explore Concept Note & Math"}</span>
              </Link>
            </div>

            {/* Telemetry live teaser stats */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left font-mono">
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">NOCTURNAL HEAT ALERT</span>
                <span className="text-xl font-black text-rose-600">25.8°C Night</span>
                <span className="text-[10px] text-slate-500 block">+4.8°C Dark Respiration Shock</span>
              </div>
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">PREDICTIVE LEAD TIME</span>
                <span className="text-xl font-black text-sky-600">14-Day Horizon</span>
                <span className="text-[10px] text-slate-500 block">GradientBoosting + SHAP</span>
              </div>
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">MARGINAL PROTECTION</span>
                <span className="text-xl font-black text-emerald-600">+0.60 q/ac</span>
                <span className="text-[10px] text-slate-500 block">Syngenta Quantis Preservation</span>
              </div>
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">CAUSAL ATTRIBUTION</span>
                <span className="text-xl font-black text-indigo-600">3.4x ROBI</span>
                <span className="text-[10px] text-slate-500 block">Double ML / EconML Proof</span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: The 4 Core Integrated Systems (Concept Note Architecture) */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 uppercase">
              TEAM-2 HYBRID ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900">
              Four Interlocking Problem Statements
            </h2>
            <p className="text-sm text-slate-600">
              Bridging empirical biophysical science with 100% Google Gemini Multimodal AI to serve smallholder farmers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PS-02 Card */}
            <div className="stripe-card p-6 sm:p-8 space-y-5 border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-blue-50 text-blue-800 border border-blue-200">
                  PS-02 · CLIMATE STRESS WARNING
                </span>
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                14-Day Micro-Climate Early Warning &amp; SHAP Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ingests Open-Meteo and Syngenta CE Hub telemetry across 7 agrometeorological variables. Uses GradientBoostingRegressor with TreeExplainer SHAP to isolate heat, drought, waterlogging, and frost risks before cellular damage occurs.
              </p>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-xs space-y-1">
                <span className="text-slate-500 block text-[10px] font-bold">KEY FORMULA</span>
                <span className="font-bold text-slate-800">CSI = w₁·H + w₂·D + w₃·W + w₄·F + γ(H·D)</span>
              </div>
              <Link
                href="/plant-intelligence"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                <span>Launch 14-Day Stress Radar</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* PS-03 Card */}
            <div className="stripe-card p-6 sm:p-8 space-y-5 border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-purple-50 text-purple-800 border border-purple-200">
                  PS-03 · CROPFIT BIOLOGICAL ADVISOR
                </span>
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                Marginal Economic Decision Support &amp; Product Matcher
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Matches GDD phenological stage, soil water index, and thermal spikes to exact Syngenta biological interventions (Quantis @ 250ml/acre, Isabion). Delivers clear <strong>Apply vs Delay vs Skip</strong> ₹/acre comparisons.
              </p>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-xs space-y-1">
                <span className="text-slate-500 block text-[10px] font-bold">BIOLOGICAL ACTION WINDOW</span>
                <span className="font-bold text-purple-900">04:30 PM – 07:00 PM (Calm Inversion Window)</span>
              </div>
              <Link
                href="/product"
                className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 hover:text-purple-900"
              >
                <span>View CropFit Decision Matrix</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* PS-04 Card */}
            <div className="stripe-card p-6 sm:p-8 space-y-5 border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-amber-50 text-amber-800 border border-amber-200">
                  PS-04 · MULTILINGUAL AI COMPANION
                </span>
                <Mic className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                Vernacular Voice &amp; Vision Intelligence
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Powered by Google Gemini 2.5 Flash and Google Neural Speech. Indian farmers speak naturally in Hindi, Marathi, Telugu, Gujarati, and 8 other languages to get tailored dosage math and upload leaf photos for instant disease diagnostics.
              </p>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-xs space-y-1">
                <span className="text-slate-500 block text-[10px] font-bold">MULTIMODAL STACK</span>
                <span className="font-bold text-amber-900">Gemini 2.5 Flash + Neural TTS + Leaf Vision</span>
              </div>
              <Link
                href="/assistant"
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-900"
              >
                <span>Try Vernacular Voice Advisory</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* PS-07 Card */}
            <div className="stripe-card p-6 sm:p-8 space-y-5 border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                  PS-07 · MEASURING &amp; PROVING IMPACT
                </span>
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                Causal Yield Attribution (Double ML / EconML)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Eliminates farmer skepticism by disentangling background weather and soil noise from true biostimulant treatment effects. Generates verifiable Proof Cards with calibrated Return on Biological Investment (ROBI %).
              </p>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-xs space-y-1">
                <span className="text-slate-500 block text-[10px] font-bold">CONFIDENCE METRIC (3.3)</span>
                <span className="font-bold text-emerald-800">Score: 92% (High Causal Certainty)</span>
              </div>
              <Link
                href="/impact"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                <span>Inspect Verified ROBI Engine</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: Interactive Farm Profit & ROBI Protection Calculator */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden space-y-8">
            
            <div className="relative z-10 max-w-3xl space-y-2">
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700/50 uppercase">
                INTERACTIVE MARGINAL ROI SIMULATOR
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white">
                Calculate Your Farm&apos;s Protected Yield &amp; Profit
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Based on empirical field trial data across 1,000+ validated trial plots during 35°C+ summer heat events.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Sliders on Left (6 Cols) */}
              <div className="lg:col-span-6 space-y-6 bg-slate-950/80 p-6 rounded-2xl border border-white/10">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono font-bold">
                    <span className="text-slate-300">REGISTERED FARM AREA:</span>
                    <span className="text-emerald-400 text-sm">{calcAcres} Acres</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="0.5"
                    value={calcAcres}
                    onChange={(e) => setCalcAcres(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 Acre</span>
                    <span>25 Acres</span>
                    <span>50 Acres</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-slate-300 block">PRIMARY FIELD CROP:</label>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    {[
                      { id: "soybean", name: "Soybean (सोयाबीन)", rate: "₹4,850/q" },
                      { id: "cotton", name: "Cotton (कपास)", rate: "₹7,200/q" },
                      { id: "wheat", name: "Wheat (गेहूं)", rate: "₹2,350/q" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCalcCrop(c.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          calcCrop === c.id
                            ? "bg-emerald-600 text-white font-bold border-emerald-400 shadow-md"
                            : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        <span className="block font-bold">{c.name.split(" ")[0]}</span>
                        <span className="text-[9px] text-slate-400 block">{c.rate}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Biostimulant Cost (Quantis):</span>
                    <span className="font-bold text-white">₹{totalInvestmentINR.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yield Protected:</span>
                    <span className="font-bold text-emerald-400">+{Math.round(yieldProtectedPerAcre * calcAcres * 10) / 10} Quintals</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Metric Display on Right (6 Cols) */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="bg-emerald-950/60 border border-emerald-500/40 p-6 rounded-2xl space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 block uppercase">NET FARM PROFIT GAIN</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-300 block">
                    +₹{netFarmProfitINR.toLocaleString("en-IN")}
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Net cash in pocket after deducting ₹850/acre product investment.
                  </p>
                </div>

                <div className="bg-slate-950 border border-white/10 p-6 rounded-2xl space-y-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 block uppercase">CALCULATED ROBI RATIO</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white block">
                    {robiRatio} : 1
                  </span>
                  <p className="text-[11px] text-slate-400">
                    For every ₹1 invested in Syngenta Quantis, you recover ₹{robiRatio} in preserved crop value.
                  </p>
                </div>

                <div className="sm:col-span-2 bg-gradient-to-r from-blue-950/80 to-slate-950 p-5 rounded-2xl border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-left">
                    <span className="text-xs font-bold text-white block">Ready to protect your fields?</span>
                    <span className="text-[11px] text-slate-400 block">Launch the full simulator or view the live weather radar.</span>
                  </div>
                  <Link
                    href="/what-if"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shrink-0"
                  >
                    Open What-If Simulator
                  </Link>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: Ramesh Patel's End-to-End Storyline */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-200 px-3 py-1 rounded-full uppercase">
              CONCEPT NOTE USER JOURNEY
            </span>
            <h2 className="text-3xl font-extrabold font-display text-slate-900">
              Ramesh Patel&apos;s Season with AASRA
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              How a smallholder farmer in Fanda Kalan, Bhopal saved 7.5 quintals of soybean worth ₹36,375.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="stripe-card p-5 space-y-3">
              <span className="h-7 w-7 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">01</span>
              <h4 className="font-bold text-sm text-slate-900">Day 1: Night Heat Trigger</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open-Meteo detects 25.8°C nocturnal temperature during R1 flowering. AASRA flashes a critical biological warning.
              </p>
            </div>

            <div className="stripe-card p-5 space-y-3">
              <span className="h-7 w-7 rounded-lg bg-amber-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center">02</span>
              <h4 className="font-bold text-sm text-slate-900">Voice Advisory in Hindi</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ramesh speaks in Hindi. AASRA calculates 3.125 Litres Quantis in 2,187 L water for his 12.5 acres at 05:00 PM.
              </p>
            </div>

            <div className="stripe-card p-5 space-y-3">
              <span className="h-7 w-7 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">03</span>
              <h4 className="font-bold text-sm text-slate-900">Timely Application</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applied within the 36-hour biological activation window. Osmoprotectants shield chloroplasts and reduce pod drop.
              </p>
            </div>

            <div className="stripe-card p-5 space-y-3">
              <span className="h-7 w-7 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center">04</span>
              <h4 className="font-bold text-sm text-slate-900">Double ML Proof Card</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                At harvest, AASRA issues a verified Proof Card confirming +₹25,750 net gain after isolating weather variables.
              </p>
            </div>

          </div>

        </section>

        {/* ========================================================================= */}
        {/* FOOTER CTA BANNER */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 p-8 sm:p-14 text-white text-center space-y-6 shadow-2xl">
            <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight max-w-3xl mx-auto">
              Empowering Every Indian Farmer with Real Science.
            </h2>
            <p className="text-xs sm:text-base text-slate-200 max-w-2xl mx-auto">
              Explore the full interactive system, run biophysical simulations, or inspect the concept note equations.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs shadow-xl transition-all hover:scale-105"
              >
                Launch Live Platform
              </Link>
              <Link
                href="/architecture"
                className="px-8 py-4 rounded-2xl bg-emerald-700/80 hover:bg-emerald-700 text-white border border-emerald-400/40 font-extrabold text-xs transition-all"
              >
                Read Concept Note (PDF Spec)
              </Link>
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
