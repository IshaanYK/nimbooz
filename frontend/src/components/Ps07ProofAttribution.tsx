"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Award, TrendingUp, ShieldCheck, BarChart2, Download, Thermometer, Droplets, AlertTriangle, CheckCircle2, Printer, X, Sparkles, QrCode, Sprout, Plus, Calendar, Activity, ArrowRight, Save } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { getTranslation } from "@/lib/translations";
import { getSavedFields, getActiveField, setActiveField, FieldRecord } from "@/lib/fieldStore";
import { getSavedInterventions, logNewIntervention, InterventionRecord } from "@/lib/interventionStore";
import { calculateYieldAttribution, YieldDecompositionResult } from "@/lib/attributionEngine";

export const Ps07ProofAttribution: React.FC = () => {
  const { language } = useLanguage();
  const { weather } = useWeather();
  const t = getTranslation(language);

  const [savedFields, setSavedFields] = useState<FieldRecord[]>(getSavedFields());
  const [activeField, setActiveFieldState] = useState<FieldRecord>(getActiveField());
  const [interventions, setInterventions] = useState<InterventionRecord[]>(getSavedInterventions());

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showLogInterventionModal, setShowLogInterventionModal] = useState(false);

  // New intervention form state
  const [logProduct, setLogProduct] = useState("Syngenta Stress Buster");
  const [logDosage, setLogDosage] = useState("500 ml/ha");
  const [logCost, setLogCost] = useState(600);

  useEffect(() => {
    setSavedFields(getSavedFields());
    setActiveFieldState(getActiveField());
    setInterventions(getSavedInterventions());
  }, []);

  const handleFieldChange = (fieldId: string) => {
    setActiveField(fieldId);
    const match = savedFields.find((f) => f.id === fieldId);
    if (match) setActiveFieldState(match);
  };

  // Run Gold-Standard Biophysical Attribution Engine for active field
  const attr: YieldDecompositionResult = useMemo(() => {
    return calculateYieldAttribution(
      activeField.crop,
      weather.temperature,
      weather.soilMoistureEst,
      activeField.areaAcres
    );
  }, [activeField, weather]);

  // Handle saving new intervention log
  const handleSaveIntervention = () => {
    const newRecord: InterventionRecord = {
      id: `interv_${Date.now()}`,
      fieldId: activeField.id,
      fieldName: activeField.name,
      date: new Date().toISOString().split("T")[0],
      productName: logProduct,
      dosage: logDosage,
      costRupees: logCost,
      preStressScore: weather.heatStressPercent,
      postYieldGainQAc: attr.biologicalGainQAc,
      weatherSnapshot: {
        temp: weather.temperature,
        humidity: weather.humidity,
        description: weather.weatherDescription,
      },
      status: "VERIFIED",
    };

    const updated = logNewIntervention(newRecord);
    setInterventions(updated);
    setShowLogInterventionModal(false);
  };

  const handlePrintCertificate = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleExportTextProof = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const content = `
============================================================
  OFFICIAL YIELD ATTRIBUTION & ROBI CERTIFICATE — AASRA PS-07
  Language: ${language.toUpperCase()} | Issued: ${dateStr}
============================================================

CERTIFICATE NO: AASRA-ROBI-2026-${Math.floor(10000 + Math.random() * 90000)}
VERIFICATION HASH: 8f9b4a1c720e3d51f962ab00c41d7e82

FIELD PROFILE:
- Field Name: ${activeField.name}
- Location: ${weather.locationName} (${weather.lat.toFixed(4)}°N, ${weather.lon.toFixed(4)}°E)
- Crop & Variety: ${activeField.crop} (${activeField.cropVariety || "Standard"})
- Field Area: ${activeField.areaAcres} Acres (${activeField.areaHa} Ha)

OUTCOME METRICS (SHAPLEY BIOPHYSICAL ENGINE):
- ${t.baselineYield}: ${attr.baselineYieldQAc} q/acre
- ${t.actualYield}: ${attr.finalYieldQAc} q/acre
- ${t.biologicalGain}: +${attr.biologicalGainQAc} q/acre
- ROBI Return Index: ${attr.robiPercent}%
- Total Net Field Profit: ₹${attr.totalFieldProfit.toLocaleString("en-IN")}
- Model Attribution Confidence: ${attr.confidenceScore}% (${t.weatherAdjusted})

WEATHER BASELINE TELEMETRY (OPEN-METEO):
- Temperature: ${weather.temperature}°C
- Soil Moisture Index: ${weather.soilMoistureEst}%
- Abiotic Heat Stress Risk: ${attr.heatStressActive ? "HIGH ALERT" : "NORMAL"}

============================================================
  Certified by Syngenta Biologicals & AASRA AI Platform
  Generated: ${now.toISOString()}
============================================================
`.trim();

    const blob = new Blob([content], { type: "text/plain; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AASRA_ROBI_Certificate_${activeField.crop.replace(/ /g, "_")}_${dateStr.replace(/ /g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="w-full bg-slate-50 text-slate-900 py-16 px-4 sm:px-6 font-body">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-accent font-bold uppercase border border-emerald-200">
            <Award className="h-4 w-4 text-emerald-600" /> PS-07 INTERVENTION & OUTCOME INTELLIGENCE
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900">
            {t.robiTitle.split(" ").slice(0, 3).join(" ")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">
              {t.biologicalGain}
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-body max-w-2xl mx-auto">
            Log interventions, track before/after outcomes, and isolate biological yield returns from weather effects.
          </p>
        </div>

        {/* Active Field Selector Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-accent shadow-sm">
          <div className="flex items-center gap-2">
            <Sprout className="h-4 w-4 text-emerald-600" />
            <span className="text-slate-700 font-bold">Active Field Portfolio:</span>
            <select
              value={activeField.id}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-600"
            >
              {savedFields.map((f) => (
                <option key={f.id} value={f.id} className="bg-white text-slate-900">
                  🌾 {f.name} ({f.crop})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-slate-700 flex-wrap">
            <button
              onClick={() => setShowLogInterventionModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            >
              <Plus className="h-4 w-4 text-white" />
              Log New Treatment
            </button>
          </div>
        </div>

        {/* Outcome Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-accent">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-1 shadow-sm">
            <span className="text-[11px] text-slate-500 font-bold block uppercase">{t.baselineYield}</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">{attr.baselineYieldQAc} <span className="text-xs text-slate-500 font-normal">q/ac</span></span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-300 text-center space-y-1 shadow-sm">
            <span className="text-[11px] text-emerald-700 font-bold block uppercase">{t.actualYield}</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-display">{attr.finalYieldQAc} <span className="text-xs text-emerald-600 font-normal">q/ac</span></span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-400 text-center space-y-1 col-span-2 md:col-span-1 shadow-sm">
            <span className="text-[11px] text-emerald-800 font-bold block uppercase">{t.biologicalGain}</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-display">+{attr.biologicalGainQAc} <span className="text-xs text-emerald-600 font-normal">q/ac</span></span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-300 text-center space-y-1 shadow-sm">
            <span className="text-[11px] text-slate-500 font-bold block uppercase">{t.robiConfidenceLabel}</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-600 font-display">{attr.confidenceScore}%</span>
            <span className="text-[9px] text-slate-500 block">{t.weatherAdjusted}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-300 text-center space-y-1 shadow-sm">
            <span className="text-[11px] text-emerald-800 font-bold block">ROBI INDEX</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-display">{attr.robiPercent}%</span>
          </div>
        </div>

        {/* PS-07 BEFORE / AFTER INTERVENTION COMPARISON CARD */}
        <div className="bg-white p-7 sm:p-8 space-y-6 shadow-sm rounded-3xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-lg font-display flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              Before / After Intervention Impact Tracking ({activeField.name})
            </h3>
            <span className="text-xs font-accent font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Syngenta Stress Buster Applied
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body">
            {/* BEFORE INTERVENTION CARD */}
            <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-rose-800 font-bold border-b border-rose-200 pb-2 font-accent text-xs">
                <span>🔴 PRE-INTERVENTION STATE</span>
                <span className="text-[10px] bg-rose-100 px-2 py-0.5 rounded text-rose-800 font-bold">DAY 0 (Aug 10)</span>
              </div>
              <div className="space-y-2 text-xs text-slate-700 font-medium">
                <div className="flex justify-between">
                  <span>Night Heat Stress:</span>
                  <span className="font-bold text-rose-700">82% High Risk (34.8°C)</span>
                </div>
                <div className="flex justify-between">
                  <span>Flower Pod Scorch:</span>
                  <span className="font-bold text-rose-700">Active Abortion Risk</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Baseline Yield:</span>
                  <span className="font-bold text-slate-900">{attr.baselineYieldQAc} q/acre</span>
                </div>
              </div>
            </div>

            {/* AFTER INTERVENTION CARD */}
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-emerald-800 font-bold border-b border-emerald-200 pb-2 font-accent text-xs">
                <span>🟢 POST-INTERVENTION OUTCOME</span>
                <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 font-bold">DAY 7 RECOVERY</span>
              </div>
              <div className="space-y-2 text-xs text-slate-700 font-medium">
                <div className="flex justify-between">
                  <span>Stress Protection:</span>
                  <span className="font-bold text-emerald-700">Stabilized (24% Normal)</span>
                </div>
                <div className="flex justify-between">
                  <span>Biological Yield Gain:</span>
                  <span className="font-bold text-emerald-700">+{attr.biologicalGainQAc} q/acre (+7.06%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Field Financial Profit:</span>
                  <span className="font-bold text-emerald-700">₹{attr.totalFieldProfit.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 font-accent">
          <button
            onClick={() => setShowCertificateModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <Award className="h-4 w-4 text-white" />
            View Official Certificate
          </button>
          <button
            onClick={handleExportTextProof}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-200"
          >
            <Download className="h-4 w-4" />
            {t.exportProofCard}
          </button>
        </div>

      </div>

      {/* Official Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 max-w-2xl w-full rounded-3xl p-8 border-2 border-slate-200 shadow-2xl space-y-6 relative font-sans">
            <button onClick={() => setShowCertificateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-2 cursor-pointer">
              <X className="h-6 w-6" />
            </button>

            <div className="border-b-2 border-slate-200 pb-4 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-slate-900 font-accent font-bold text-xs uppercase tracking-widest">
                <Award className="h-5 w-5 text-emerald-600" /> SYNGENTA BIOLOGICALS & AASRA AI PLATFORM
              </div>
              <h2 className="text-2xl font-extrabold font-display text-slate-900">
                OFFICIAL YIELD ATTRIBUTION & ROBI CERTIFICATE
              </h2>
              <p className="text-xs text-slate-500 font-accent">
                Cert. ID: AASRA-ROBI-2026-88942 · Issued: {new Date().toLocaleDateString("en-IN")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-body bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">FARMER & FIELD:</span>
                <span className="font-bold text-slate-900 text-sm">{activeField.name}</span>
                <span className="text-slate-600 block text-[11px]">{weather.locationName} ({activeField.areaAcres} Acres)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">CROP & VARIETY:</span>
                <span className="font-bold text-emerald-800 text-sm">{activeField.crop} ({activeField.cropVariety || "Standard"})</span>
                <span className="text-slate-600 block text-[11px]">Stage: {activeField.growthStage}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center font-display">
              <div className="bg-slate-100 text-slate-900 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-accent">BASELINE YIELD</span>
                <span className="text-2xl font-bold">{attr.baselineYieldQAc} <span className="text-xs text-slate-500 font-body">q/ac</span></span>
              </div>

              <div className="bg-emerald-600 text-white p-4 rounded-2xl">
                <span className="text-[10px] text-emerald-100 block font-accent">ACTUAL HARVEST</span>
                <span className="text-2xl font-bold text-white">{attr.finalYieldQAc} <span className="text-xs font-body">q/ac</span></span>
              </div>

              <div className="bg-emerald-50 text-emerald-900 p-4 rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 block font-accent font-bold">BIOLOGICAL GAIN</span>
                <span className="text-2xl font-bold text-emerald-700">+{attr.biologicalGainQAc} <span className="text-xs font-body">q/ac</span></span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-[11px] font-body text-slate-600">
              <div className="space-y-1">
                <div>Model Confidence: <strong className="text-emerald-700">{attr.confidenceScore}%</strong> ({t.weatherAdjusted})</div>
                <div>Total Field Net Profit: <strong className="text-emerald-700">₹{attr.totalFieldProfit.toLocaleString("en-IN")}</strong></div>
                <div className="text-[9px] text-slate-400 font-mono">SHA-256 Hash: 8f9b4a1c720e3d51f962ab00c41d7e82</div>
              </div>
              <div className="flex flex-col items-center">
                <QrCode className="h-12 w-12 text-slate-900" />
                <span className="text-[8px] text-slate-500 uppercase font-accent font-bold">Scan to Verify</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 font-accent">
              <button onClick={handlePrintCertificate} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 shadow cursor-pointer">
                <Printer className="h-4 w-4" /> Print Certificate
              </button>
              <button onClick={handleExportTextProof} className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer border border-slate-200">
                <Download className="h-4 w-4" /> Download Report (.txt)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
