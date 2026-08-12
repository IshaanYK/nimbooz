"use client";

import React, { useState, useEffect } from "react";
import { Sliders, Clock, AlertTriangle, ShieldCheck, TrendingUp, Zap, Calendar, ArrowRight, BarChart3, Sprout, CheckCircle2, RotateCcw } from "lucide-react";
import { DataBadge } from "./DataBadge";
import { getSavedFields, getActiveField, setActiveField, FieldRecord } from "@/lib/fieldStore";
import { calculateYieldAttribution, YieldDecompositionResult } from "@/lib/attributionEngine";
import { useWeather } from "@/context/WeatherContext";
import { BiologicalSimulationAnimation } from "./BiologicalSimulationAnimation";

export const WhatIfSimulator: React.FC = () => {
  const { weather } = useWeather();
  const [savedFields, setSavedFields] = useState<FieldRecord[]>(getSavedFields());
  const [selectedField, setSelectedFieldState] = useState<FieldRecord>(getActiveField());

  // Interactive Scenario Inputs (Light text placeholders for custom scenario simulation)
  const [customTempStr, setCustomTempStr] = useState<string>("");
  const [customSoilStr, setCustomSoilStr] = useState<string>("");
  const [customAreaStr, setCustomAreaStr] = useState<string>("");
  const [customCostStr, setCustomCostStr] = useState<string>("");

  const [delayDays, setDelayDays] = useState<number>(0);

  useEffect(() => {
    const list = getSavedFields();
    setSavedFields(list);
    setSelectedFieldState(getActiveField());
  }, []);

  const handleFieldChange = (fieldId: string) => {
    setActiveField(fieldId);
    const match = savedFields.find((f) => f.id === fieldId);
    if (match) setSelectedFieldState(match);
  };

  // Derive active inputs with fallback to live telemetry / field record
  const activeTemp = customTempStr !== "" && !isNaN(Number(customTempStr)) ? Number(customTempStr) : weather.temperature;
  const activeSoil = customSoilStr !== "" && !isNaN(Number(customSoilStr)) ? Number(customSoilStr) : weather.soilMoistureEst;
  const activeArea = customAreaStr !== "" && !isNaN(Number(customAreaStr)) ? Number(customAreaStr) : selectedField.areaAcres;
  const activeCost = customCostStr !== "" && !isNaN(Number(customCostStr)) ? Number(customCostStr) : 1280;

  // Run Gold-Standard Shapley Biophysical Yield Attribution Engine on custom or telemetry inputs
  const baseAttribution: YieldDecompositionResult = calculateYieldAttribution(
    selectedField.crop,
    activeTemp,
    activeSoil,
    activeArea
  );

  // Calculate delay impact on biological efficacy and yield gain
  const getDelaySimulation = (days: number) => {
    const decayFactor = days === 0 ? 1.0 : days === 1 ? 0.75 : days === 2 ? 0.35 : 0.08;
    const bioGain = Math.round(baseAttribution.biologicalGainQAc * decayFactor * 100) / 100;
    const expectedYield = Math.round((baseAttribution.baselineYieldQAc + baseAttribution.thermalDeltaQAc + baseAttribution.soilMoistureDeltaQAc + baseAttribution.managementDeltaQAc + bioGain) * 100) / 100;
    
    // Custom financial ROBI calculation based on active cost input
    const grossReturnAc = Math.round(bioGain * 6720);
    const costAc = activeCost;
    const netProfitAc = Math.max(0, grossReturnAc - costAc);
    const robi = Math.round((grossReturnAc / (costAc || 1)) * 100);

    let windowStatus = "OPTIMAL SPRAY WINDOW OPEN";
    let color = "border-[#00A878] bg-[#DDF7EC]";
    let textColor = "text-[#063B2D]";
    let actionMsg = `Applying Syngenta Stress Buster today for ${selectedField.crop} protects ${Math.round(decayFactor * 100)}% of heat-susceptible yield. Net profit: ₹${netProfitAc.toLocaleString('en-IN')}/acre.`;

    if (days === 1) {
      windowStatus = "WINDOW CLOSING (+1 DAY DELAY)";
      color = "border-amber-400 bg-amber-50/80";
      textColor = "text-amber-900";
      actionMsg = `1-day delay in ${selectedField.crop} spray causes respiration sugar loss. Bio-gain drops to +${bioGain} q/ac.`;
    } else if (days === 2) {
      windowStatus = "HIGH RISK DELAY (+2 DAYS DELAY)";
      color = "border-orange-400 bg-orange-50/80";
      textColor = "text-orange-950";
      actionMsg = `2-day delay causes partial flower abortion in ${selectedField.crop}. Bio-efficacy drops to ${Math.round(decayFactor * 100)}%.`;
    } else if (days >= 3) {
      windowStatus = "CRITICAL MISSED WINDOW (+3+ DAYS DELAY)";
      color = "border-rose-400 bg-rose-50/80";
      textColor = "text-rose-950";
      actionMsg = `3+ day delay results in severe yield loss in ${selectedField.crop}. Biological product efficacy drops drastically to ${Math.round(decayFactor * 100)}%.`;
    }

    return {
      windowStatus,
      decayFactor,
      bioGain,
      expectedYield,
      robi,
      netProfitAc,
      color,
      textColor,
      actionMsg,
    };
  };

  const sim = getDelaySimulation(delayDays);

  const resetCustomInputs = () => {
    setCustomTempStr("");
    setCustomSoilStr("");
    setCustomAreaStr("");
    setCustomCostStr("");
    setDelayDays(0);
  };

  return (
    <section className="max-w-6xl w-full mx-auto space-y-8 font-sans">
      
      {/* Dynamic Scenario Input Form Bar */}
      <div className="bg-[#063B2D] text-white p-6 sm:p-8 rounded-3xl border border-[#20C98A]/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-[#20C98A]" />
              <h3 className="font-extrabold text-base font-display text-white">Dynamic What-If Scenario Inputs</h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Enter custom weather or field values below or use live Open-Meteo telemetry placeholders.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetCustomInputs}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset to Live
            </button>
            <DataBadge type="MODELLED" customText="SHAPLEY BIOPHYSICAL ENGINE" />
          </div>
        </div>

        {/* 4 Interactive Input Fields with Light Text Examples */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          
          <div className="space-y-1">
            <label className="text-slate-300 block text-[11px]">Select Active Farm:</label>
            <select
              value={selectedField.id}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="w-full bg-[#10241F] text-emerald-300 border border-slate-700 rounded-xl px-3.5 py-3 font-bold focus:outline-none focus:border-[#20C98A]"
            >
              {savedFields.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900">
                  🌾 {f.name} ({f.crop})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 block text-[11px]">Night / Day Temp (°C):</label>
            <input
              type="number"
              value={customTempStr}
              onChange={(e) => setCustomTempStr(e.target.value)}
              placeholder={`e.g. ${weather.temperature}°C`}
              className="w-full bg-[#10241F] text-white border border-slate-700 rounded-xl px-3.5 py-3 font-bold placeholder:text-slate-500 focus:outline-none focus:border-[#20C98A]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 block text-[11px]">Soil Moisture Index (%):</label>
            <input
              type="number"
              value={customSoilStr}
              onChange={(e) => setCustomSoilStr(e.target.value)}
              placeholder={`e.g. ${weather.soilMoistureEst}%`}
              className="w-full bg-[#10241F] text-white border border-slate-700 rounded-xl px-3.5 py-3 font-bold placeholder:text-slate-500 focus:outline-none focus:border-[#20C98A]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 block text-[11px]">Biostimulant Cost (₹/ac):</label>
            <input
              type="number"
              value={customCostStr}
              onChange={(e) => setCustomCostStr(e.target.value)}
              placeholder="e.g. 1280"
              className="w-full bg-[#10241F] text-white border border-slate-700 rounded-xl px-3.5 py-3 font-bold placeholder:text-slate-500 focus:outline-none focus:border-[#20C98A]"
            />
          </div>

        </div>
      </div>

      {/* Simulator Headline */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-4xl font-black font-display text-[#10241F] tracking-tight">
          What if spray is delayed for {selectedField.name}?
        </h2>
        <p className="text-xs sm:text-base text-slate-600 font-normal leading-relaxed">
          Simulating <strong>{selectedField.crop}</strong> at {activeTemp}°C temperature and {activeSoil}% soil moisture index.
        </p>
      </div>

      {/* 2D Live Canvas Simulation Animation */}
      <BiologicalSimulationAnimation crop={selectedField.crop} />

      {/* Interactive Interface Box */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-10">
        
        {/* Delay Slider */}
        <div className="space-y-4 max-w-2xl mx-auto bg-[#F7F6EF] p-6 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-700 flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-slate-900 font-sans font-extrabold text-sm">
              <Clock className="h-4 w-4 text-[#00A878]" /> Application Delay:
            </span>
            <span className="text-[#00A878] font-black text-sm bg-white px-3 py-1 rounded-full border border-[#00A878]/30 shadow-sm">
              {delayDays === 0 ? "APPLY TODAY (Day 0)" : `+${delayDays} DAY${delayDays > 1 ? "S" : ""} DELAY`}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={delayDays}
            onChange={(e) => setDelayDays(Number(e.target.value))}
            className="w-full h-3 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#00A878]"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
            <span>Day 0 (Optimal)</span>
            <span>+1 Day</span>
            <span>+2 Days</span>
            <span>+3 Days (Missed)</span>
          </div>
        </div>

        {/* Dynamic Simulation Outcome Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-mono block">EXPECTED YIELD</span>
            <span className="text-3xl font-black text-slate-900 font-mono">{sim.expectedYield} <span className="text-xs text-slate-500 font-normal">q/ac</span></span>
            <span className="text-[10px] text-slate-400 block font-mono">Baseline: {baseAttribution.baselineYieldQAc} q/ac</span>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-mono block">BIOLOGICAL YIELD GAIN</span>
            <span className={`text-3xl font-black font-mono ${sim.bioGain > 0.3 ? "text-[#00A878]" : "text-rose-600"}`}>
              +{sim.bioGain} <span className="text-xs font-normal">q/ac</span>
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">Efficacy: {Math.round(sim.decayFactor * 100)}%</span>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-mono block">NET PROFIT / ACRE</span>
            <span className="text-3xl font-black font-mono text-[#00A878]">₹{sim.netProfitAc.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 block font-mono">Cost: ₹{activeCost}/acre</span>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-mono block">ROBI INDEX RETURN</span>
            <span className={`text-3xl font-black font-mono ${sim.robi > 100 ? "text-[#00A878]" : "text-rose-600"}`}>{sim.robi}%</span>
            <span className="text-[10px] text-emerald-600 block font-mono">Return on Bio-Investment</span>
          </div>
        </div>

        {/* Scenario Status Banner */}
        <div className={`p-6 rounded-2xl border ${sim.color} space-y-2`}>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className={`font-black text-xs uppercase tracking-wider font-mono px-3 py-1 rounded-full bg-white/70 shadow-sm ${sim.textColor}`}>
              {sim.windowStatus}
            </span>
            <span className="text-xs font-mono font-bold text-slate-700">
              Crop: {selectedField.crop} ({activeArea} Acres)
            </span>
          </div>
          <p className={`text-sm font-semibold leading-relaxed ${sim.textColor}`}>
            {sim.actionMsg}
          </p>
        </div>

        {/* Shapley Biophysical Attribution Breakdown */}
        <div className="bg-[#063B2D] text-white p-6 rounded-2xl space-y-4">
          <h4 className="font-extrabold text-sm font-display text-emerald-300 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#20C98A]" />
            Shapley Biophysical Yield Attribution Breakdown ({selectedField.crop})
          </h4>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between bg-[#10241F] p-3 rounded-xl border border-white/10">
              <span className="text-slate-300">Baseline Expected Yield ({selectedField.crop}):</span>
              <span className="font-bold text-white">{baseAttribution.baselineYieldQAc} q/acre</span>
            </div>
            <div className="flex justify-between bg-white/5 p-2.5 rounded-xl text-slate-300">
              <span>├── Thermal Stress Impact ({activeTemp}°C):</span>
              <span className="font-bold text-rose-300">{baseAttribution.thermalDeltaQAc} q/acre</span>
            </div>
            <div className="flex justify-between bg-white/5 p-2.5 rounded-xl text-slate-300">
              <span>├── Soil Moisture Factor ({activeSoil}% Index):</span>
              <span className="font-bold text-emerald-300">+{baseAttribution.soilMoistureDeltaQAc} q/acre</span>
            </div>
            <div className="flex justify-between bg-white/5 p-2.5 rounded-xl text-slate-300">
              <span>├── Field Management Baseline:</span>
              <span className="font-bold text-emerald-300">+{baseAttribution.managementDeltaQAc} q/acre</span>
            </div>
            <div className="flex justify-between bg-[#00A878]/30 p-3 rounded-xl border border-[#20C98A]/40 text-[#20C98A] font-bold">
              <span>└── Modelled Syngenta Bio-Gain (Day {delayDays} Delay):</span>
              <span className="text-amber-300">+{sim.bioGain} q/acre</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
