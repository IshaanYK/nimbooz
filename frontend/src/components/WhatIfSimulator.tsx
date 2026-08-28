"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Clock,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Zap,
  Calendar,
  ArrowRight,
  BarChart3,
  Sprout,
  CheckCircle2,
  RotateCcw,
  Thermometer,
  Droplets,
  DollarSign,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  Leaf,
  Activity,
  Flame,
} from "lucide-react";
import { DataBadge } from "./DataBadge";
import { getSavedFields, getActiveField, setActiveField, FieldRecord } from "@/lib/fieldStore";
import { calculateYieldAttribution, YieldDecompositionResult } from "@/lib/attributionEngine";
import { useWeather } from "@/context/WeatherContext";
import { useLanguage } from "@/context/LanguageContext";
import { getStoredProfile, FarmerProfile } from "@/lib/userStore";
import { BiologicalSimulationAnimation } from "./BiologicalSimulationAnimation";

export const WhatIfSimulator: React.FC = () => {
  const { weather } = useWeather();
  const { language, t } = useLanguage();

  const [profile, setProfile] = useState<FarmerProfile>(getStoredProfile());
  const [savedFields, setSavedFields] = useState<FieldRecord[]>(getSavedFields());
  const [selectedField, setSelectedFieldState] = useState<FieldRecord>(getActiveField());

  // Interactive Scenario State Inputs
  const [delayDays, setDelayDays] = useState<number>(0);
  const [nightTemp, setNightTemp] = useState<number>(weather.temperature > 0 ? weather.temperature : 28.5);
  const [soilMoisture, setSoilMoisture] = useState<number>(weather.soilMoistureEst > 0 ? weather.soilMoistureEst : 45);
  const [marketPrice, setMarketPrice] = useState<number>(4600); // ₹/quintal
  const [sprayCost, setSprayCost] = useState<number>(1280); // ₹/acre
  const [fieldArea, setFieldArea] = useState<number>(profile.fieldAreaAcres || 12.5);

  const [activeTab, setActiveTab] = useState<"visualizer" | "curve" | "comparison">("visualizer");

  useEffect(() => {
    const list = getSavedFields();
    setSavedFields(list);
    setSelectedFieldState(getActiveField());
    const stored = getStoredProfile();
    setProfile(stored);
    if (stored.fieldAreaAcres) {
      setFieldArea(stored.fieldAreaAcres);
    }
    if (weather.temperature > 0 && !weather.isLoading) {
      setNightTemp(weather.nightTemperature || weather.temperature);
      setSoilMoisture(weather.soilMoistureEst);
    }
  }, [weather.temperature, weather.nightTemperature, weather.soilMoistureEst, weather.isLoading]);

  const handleFieldChange = (fieldId: string) => {
    setActiveField(fieldId);
    const match = savedFields.find((f) => f.id === fieldId);
    if (match) {
      setSelectedFieldState(match);
      setFieldArea(match.areaAcres);
    }
  };

  // Run Biophysical Yield Attribution Engine
  const baseAttribution: YieldDecompositionResult = calculateYieldAttribution(
    selectedField.crop,
    nightTemp,
    soilMoisture,
    fieldArea
  );

  // Calculate dynamic delay decay
  // Day 0: 100%, Day 1: 75%, Day 2: 45%, Day 3: 20%, Day 5: 8%, Day 7: 0%
  const getDecayFactor = (days: number) => {
    if (days === 0) return 1.0;
    if (days === 1) return 0.76;
    if (days === 2) return 0.45;
    if (days === 3) return 0.22;
    if (days <= 5) return 0.08;
    return 0.02;
  };

  const decayFactor = getDecayFactor(delayDays);
  const bioGainQAc = Math.round(baseAttribution.biologicalGainQAc * decayFactor * 100) / 100;
  const expectedYieldQAc = Math.round(
    (baseAttribution.baselineYieldQAc +
      baseAttribution.thermalDeltaQAc +
      baseAttribution.soilMoistureDeltaQAc +
      baseAttribution.managementDeltaQAc +
      bioGainQAc) *
      100
  ) / 100;

  // Financial Computations
  const grossReturnPerAcre = Math.round(bioGainQAc * marketPrice);
  const netProfitPerAcre = Math.max(0, grossReturnPerAcre - sprayCost);
  const totalFarmExtraIncome = Math.round(netProfitPerAcre * fieldArea);
  const robiPercent = Math.round((grossReturnPerAcre / (sprayCost || 1)) * 100);

  // Without intervention (Unmanaged yield under current thermal stress)
  const unmanagedYieldQAc = Math.round(
    (baseAttribution.baselineYieldQAc +
      baseAttribution.thermalDeltaQAc +
      baseAttribution.soilMoistureDeltaQAc +
      baseAttribution.managementDeltaQAc) *
      100
  ) / 100;

  const resetToLive = () => {
    setDelayDays(0);
    setNightTemp(weather.temperature > 0 ? weather.temperature : 28.5);
    setSoilMoisture(weather.soilMoistureEst > 0 ? weather.soilMoistureEst : 45);
    setMarketPrice(4600);
    setSprayCost(1280);
    setFieldArea(profile.fieldAreaAcres || 12.5);
  };

  return (
    <section className="max-w-6xl w-full mx-auto space-y-8 font-sans text-slate-900">
      
      {/* Personalized Farmer Scenario Strip */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-[#063B2D] text-white p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-[#10B981]/20 text-[#20C98A] border border-[#20C98A]/30 uppercase tracking-wider">
                PERSONALIZED BIOPHYSICAL SCENARIO
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                FARMER: {profile.fullName || "Ramesh Patel"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white mt-1.5 flex items-center gap-2">
              <Sprout className="h-6 w-6 text-[#20C98A]" />
              <span>
                {profile.fullName || "Ramesh Patel"}&apos;s Farm Simulator ({fieldArea} Acres {selectedField.crop})
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium leading-relaxed">
              Adjust live field parameters below to simulate thermal degradation, flower abortion risks, and delayed biostimulant intervention economics.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={resetToLive}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Live Sensors</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Knobs & Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono relative z-10">
          
          {/* Active Field Picker */}
          <div className="bg-[#10241F] p-3.5 rounded-2xl border border-white/10 space-y-1.5">
            <label className="text-slate-400 block text-[11px] font-bold">🌾 Target Farm Field</label>
            <select
              value={selectedField.id}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="w-full bg-[#081512] text-emerald-300 border border-slate-700 rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-[#20C98A] cursor-pointer"
            >
              {savedFields.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                  {f.name} ({f.crop})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 block">Acreage: {fieldArea} Acres</span>
          </div>

          {/* Night Temperature Slider */}
          <div className="bg-[#10241F] p-3.5 rounded-2xl border border-white/10 space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-slate-400 block text-[11px] font-bold">🌡️ Night Temperature</label>
              <span className={`font-bold text-xs ${nightTemp > 25 ? "text-rose-400" : "text-emerald-400"}`}>
                {nightTemp.toFixed(1)}°C
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={36}
              step={0.5}
              value={nightTemp}
              onChange={(e) => setNightTemp(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#20C98A]"
            />
            <span className="text-[10px] text-slate-400 block">
              {nightTemp > 25 ? "⚠️ Heat Stress Active (>25°C)" : "✅ Optimal Night Temperature"}
            </span>
          </div>

          {/* Soil Moisture Slider */}
          <div className="bg-[#10241F] p-3.5 rounded-2xl border border-white/10 space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-slate-400 block text-[11px] font-bold">💧 Soil Moisture Index</label>
              <span className="font-bold text-xs text-sky-400">{soilMoisture}%</span>
            </div>
            <input
              type="range"
              min={15}
              max={80}
              step={1}
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <span className="text-[10px] text-slate-400 block">
              {soilMoisture < 35 ? "Dry Stress" : soilMoisture > 65 ? "Saturated" : "Optimal Root Moisture"}
            </span>
          </div>

          {/* Field Area (Acres) */}
          <div className="bg-[#10241F] p-3.5 rounded-2xl border border-white/10 space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-slate-400 block text-[11px] font-bold">📐 Total Farm Size</label>
              <span className="font-bold text-xs text-amber-300">{fieldArea} Acres</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={0.5}
              value={fieldArea}
              onChange={(e) => setFieldArea(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <span className="text-[10px] text-slate-400 block">
              Crop: {selectedField.crop.toUpperCase()}
            </span>
          </div>

        </div>
      </div>

      {/* Main Interactive Delay Slider Bar (Core Simulation Controller) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              PRIMARY VARIABLE: INTERVENTION TIMING
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1 flex items-center gap-2">
              <Clock className="h-6 w-6 text-emerald-600" />
              <span>Biostimulant Spray Delay Simulation</span>
            </h3>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-2 rounded-2xl font-mono font-black text-xs uppercase tracking-wider border shadow-xs transition-all ${
                delayDays === 0
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                  : delayDays === 1
                  ? "bg-amber-50 text-amber-900 border-amber-300"
                  : delayDays === 2
                  ? "bg-orange-50 text-orange-950 border-orange-300"
                  : "bg-rose-50 text-rose-950 border-rose-300"
              }`}
            >
              {delayDays === 0 ? "⚡ DAY 0: OPTIMAL SPRAY" : `⚠️ +${delayDays} DAY${delayDays > 1 ? "S" : ""} DELAY`}
            </span>
          </div>
        </div>

        {/* Large Tactile Slider */}
        <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-700">
            <span className="text-slate-600">Application Delay:</span>
            <span className="text-emerald-700 font-extrabold text-sm bg-white px-3.5 py-1 rounded-xl border border-slate-200 shadow-xs">
              {delayDays === 0 ? "Day 0 (Today - Maximum Protection)" : `+${delayDays} Day${delayDays > 1 ? "s" : ""} Delayed`}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={delayDays}
            onChange={(e) => setDelayDays(Number(e.target.value))}
            className="w-full h-3.5 bg-slate-200 rounded-xl appearance-none cursor-pointer accent-[#10B981]"
          />

          <div className="grid grid-cols-6 text-center text-[10px] sm:text-xs font-mono font-bold text-slate-500 pt-1">
            <span className={delayDays === 0 ? "text-emerald-600 font-black" : ""}>Day 0 (100%)</span>
            <span className={delayDays === 1 ? "text-amber-600 font-black" : ""}>+1 Day (76%)</span>
            <span className={delayDays === 2 ? "text-orange-600 font-black" : ""}>+2 Days (45%)</span>
            <span className={delayDays === 3 ? "text-rose-600 font-black" : ""}>+3 Days (22%)</span>
            <span className={delayDays === 4 ? "text-rose-700 font-black" : ""}>+4 Days (12%)</span>
            <span className={delayDays === 5 ? "text-rose-900 font-black" : ""}>+5 Days (8%)</span>
          </div>
        </div>

        {/* Dynamic High-Impact Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          
          {/* Expected Yield */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1 shadow-xs">
            <span className="text-[11px] text-slate-500 font-mono font-bold block">EXPECTED YIELD</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
              {expectedYieldQAc} <span className="text-xs text-slate-500 font-normal">q/ac</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              Baseline: {baseAttribution.baselineYieldQAc} q/ac
            </span>
          </div>

          {/* Bio Yield Recovery Gain */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1 shadow-xs">
            <span className="text-[11px] text-slate-500 font-mono font-bold block">RECOVERED YIELD GAIN</span>
            <div className={`text-3xl sm:text-4xl font-black font-mono ${bioGainQAc > 0.3 ? "text-[#10B981]" : "text-rose-600"}`}>
              +{bioGainQAc} <span className="text-xs font-normal">q/ac</span>
            </div>
            <span className="text-[10px] text-slate-500 block font-mono font-bold">
              Protection Efficacy: {Math.round(decayFactor * 100)}%
            </span>
          </div>

          {/* Net Profit Per Acre */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1 shadow-xs">
            <span className="text-[11px] text-slate-500 font-mono font-bold block">NET PROFIT / ACRE</span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#10B981]">
              ₹{netProfitPerAcre.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              After ₹{sprayCost} product cost
            </span>
          </div>

          {/* TOTAL FARM NET GAIN (PERSONALIZED) */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 p-5 rounded-2xl border border-emerald-300 space-y-1 shadow-xs">
            <span className="text-[11px] text-emerald-800 font-mono font-bold block">
              TOTAL FARM PROFIT ({fieldArea} ACRES)
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-900">
              ₹{totalFarmExtraIncome.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-emerald-700 block font-mono font-bold">
              ROBI Return: {robiPercent}%
            </span>
          </div>

        </div>

        {/* Action Summary Alert Banner */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            delayDays === 0
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : delayDays <= 2
              ? "bg-amber-50 border-amber-300 text-amber-950"
              : "bg-rose-50 border-rose-300 text-rose-950"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider font-mono">
                {delayDays === 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                )}
                <span>
                  {delayDays === 0
                    ? "Maximum Yield Preservation Window"
                    : `Yield Loss Alert (${delayDays} Days Delay)`}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                {delayDays === 0
                  ? `Applying Syngenta Stress Buster today across your ${fieldArea} acres secures +${(
                      bioGainQAc * fieldArea
                    ).toFixed(1)} quintals total yield recovery and a net return of ₹${totalFarmExtraIncome.toLocaleString(
                      "en-IN"
                    )}.`
                  : `Each day of spray delay leads to cellular heat respiration losses. Delaying by ${delayDays} days reduces protection efficacy by ${Math.round(
                      (1 - decayFactor) * 100
                    )}%, leaving ₹${Math.round(
                      ((baseAttribution.biologicalGainQAc - bioGainQAc) * marketPrice * fieldArea)
                    ).toLocaleString("en-IN")} in lost yield potential.`}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs Selector: 2D Live Simulation Canvas vs Yield Curve vs Comparison */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("visualizer")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "visualizer"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            🎨 2D Live Plant Bio-Animation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("comparison")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "comparison"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            ⚖️ Before vs After Intervention
          </button>
        </div>

        {/* Tab 1: 2D Biological Simulation Animation */}
        {activeTab === "visualizer" && (
          <div className="stripe-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 font-display flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Cellular Plant Stress & Osmoprotection Simulation</span>
              </h3>
              <DataBadge type="MODELLED" customText="LIVE CANVAS PARTICLE ENGINE" />
            </div>
            <BiologicalSimulationAnimation crop={selectedField.crop} />
          </div>
        )}

        {/* Tab 2: Comparison Cards */}
        {activeTab === "comparison" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Unmanaged Heat Shock */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full uppercase">
                  Scenario A: No Biological Spray
                </span>
                <Flame className="h-5 w-5 text-rose-600" />
              </div>
              <h4 className="text-lg font-black text-slate-900 font-display">
                Unmanaged Night Heat Stress
              </h4>
              <ul className="text-xs space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Night Respiration Loss:</strong> Accelerated sugar oxidation (&gt;25°C).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Flower Abortion:</strong> High reproductive organ drop rate (28%-42%).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Final Realized Yield:</strong> {unmanagedYieldQAc} q/acre.</span>
                </li>
              </ul>
              <div className="pt-3 border-t border-rose-200 text-xs font-mono font-bold text-rose-900 flex justify-between">
                <span>Net Farm Revenue:</span>
                <span>₹{Math.round(unmanagedYieldQAc * marketPrice * fieldArea).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Managed Day 0 Biological Protection */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase">
                  Scenario B: Day 0 Syngenta Stress Buster
                </span>
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <h4 className="text-lg font-black text-slate-900 font-display">
                Protected with Biostimulant @ 250ml/ac
              </h4>
              <ul className="text-xs space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Cellular Osmoprotection:</strong> Stabilizes chloroplasts & membrane integrity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Pod Retention:</strong> Preserves +0.60 q/ac extra grain filling.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Protected Final Yield:</strong> {expectedYieldQAc} q/acre.</span>
                </li>
              </ul>
              <div className="pt-3 border-t border-emerald-200 text-xs font-mono font-bold text-emerald-900 flex justify-between">
                <span>Net Farm Revenue:</span>
                <span className="text-emerald-700 font-black">
                  ₹{Math.round((expectedYieldQAc * marketPrice - sprayCost) * fieldArea).toLocaleString("en-IN")} (+₹{totalFarmExtraIncome.toLocaleString("en-IN")})
                </span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Shapley Biophysical Yield Attribution Tree */}
      <div className="bg-[#063B2D] text-white p-6 sm:p-8 rounded-3xl space-y-5 border border-[#20C98A]/30 shadow-xl">
        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-white/10 pb-4">
          <h4 className="font-extrabold text-base font-display text-emerald-300 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#20C98A]" />
            <span>Biophysical Decomposition Tree ({selectedField.crop.toUpperCase()})</span>
          </h4>
          <span className="text-xs font-mono text-slate-400">
            Area: {fieldArea} Acres | Delay: Day {delayDays}
          </span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          <div className="flex justify-between bg-[#10241F] p-3.5 rounded-xl border border-white/10">
            <span className="text-slate-300">Baseline Genetic Yield Potential:</span>
            <span className="font-bold text-white">{baseAttribution.baselineYieldQAc} q/acre</span>
          </div>

          <div className="flex justify-between bg-white/5 p-3 rounded-xl text-slate-300">
            <span>├── Night Heat Thermal Respiration Penalty ({nightTemp.toFixed(1)}°C):</span>
            <span className="font-bold text-rose-300">{baseAttribution.thermalDeltaQAc} q/acre</span>
          </div>

          <div className="flex justify-between bg-white/5 p-3 rounded-xl text-slate-300">
            <span>├── Soil Root-Zone Moisture Contribution ({soilMoisture}%):</span>
            <span className="font-bold text-emerald-300">+{baseAttribution.soilMoistureDeltaQAc} q/acre</span>
          </div>

          <div className="flex justify-between bg-white/5 p-3 rounded-xl text-slate-300">
            <span>├── Agronomic Management & Row Spacing Factor:</span>
            <span className="font-bold text-emerald-300">+{baseAttribution.managementDeltaQAc} q/acre</span>
          </div>

          <div className="flex justify-between bg-[#00A878]/30 p-3.5 rounded-xl border border-[#20C98A]/40 text-[#20C98A] font-bold text-sm">
            <span>└── Syngenta Biological Intervention Recovery (Day {delayDays}):</span>
            <span className="text-amber-300 font-mono">+{bioGainQAc} q/acre</span>
          </div>
        </div>
      </div>

    </section>
  );
};
