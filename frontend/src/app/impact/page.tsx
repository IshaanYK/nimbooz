"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Ps07ProofAttribution } from "@/components/Ps07ProofAttribution";
import { ROBICalculator } from "@/components/ROBICalculator";
import { ExportProofCardModal } from "@/components/ExportProofCardModal";
import { Award, Download, BarChart2, CheckCircle2, TrendingUp, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { getStoredProfile } from "@/lib/userStore";
import { calculateYieldAttribution } from "@/lib/attributionEngine";

export default function ImpactPage() {
  const [showExportModal, setShowExportModal] = useState(false);
  const { t } = useLanguage();
  const { weather } = useWeather();
  const profile = getStoredProfile();

  const farmerAcres = profile.fieldAreaAcres || 12.5;
  const farmerCrop = profile.primaryCrop || "Soybean";
  const realNightTemp = weather.nightTemperature || weather.temperature || 28.5;
  const realSoilMoisture = weather.soilMoistureEst || 45;

  const attribution = calculateYieldAttribution(farmerCrop, realNightTemp, realSoilMoisture, farmerAcres);
  const netGainAcre = Math.round(attribution.biologicalGainQAc * 4600 - 1280);
  const totalFarmExtraGain = Math.round(netGainAcre * farmerAcres);
  const robiPercent = Math.round(((attribution.biologicalGainQAc * 4600) / 1280) * 100);

  return (
    <AppShell>
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                PS-07 · CAUSAL ATTRIBUTION & ROBI ENGINE
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 uppercase bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {profile.fullName ? `${profile.fullName} · ` : ""}{farmerAcres} Acres ({farmerCrop})
              </span>
            </div>
            <h1 className="text-3xl font-extrabold font-display text-[#111827] mt-1 flex items-center gap-2 tracking-tight">
              <Award className="h-7 w-7 text-indigo-600" />
              Verified Return on Biological Investment (ROBI)
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-3xl mt-1">
              Disentangling background environmental noise (weather, soil) from true biostimulant treatment gains to provide verifiable financial proof of investment returns.
            </p>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="h-4 w-4" />
            <span>{t.exportVerifiedProofCard}</span>
          </button>
        </div>

        {/* Dynamically Calibrated Stat Counter Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: `${robiPercent}%`, label: t.verifiedNetRobi, sub: t.returnOnBioInvestment, border: "border-t-violet-500", text: "text-violet-700" },
            { value: `₹${totalFarmExtraGain.toLocaleString("en-IN")}`, label: `Total Net Farm Gain (${farmerAcres} Ac)`, sub: `+₹${netGainAcre}/acre vs untreated`, border: "border-t-emerald-500", text: "text-emerald-700" },
            { value: `+${attribution.biologicalGainQAc} q/ac`, label: t.yieldUpliftProven, sub: t.synBioVsControl, border: "border-t-blue-500", text: "text-blue-700" },
            { value: "75%", label: t.podRecoveryRate, sub: `At ${realNightTemp}°C Night Temp`, border: "border-t-amber-500", text: "text-amber-700" },
          ].map(({ value, label, sub, border, text }) => (
            <div key={label} className={`bg-white p-5 space-y-1.5 border border-slate-200/80 border-t-4 ${border} rounded-2xl shadow-xs hover:shadow-sm transition-all`}>
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${text}`}>{value}</span>
              <p className="text-xs font-bold text-slate-900">{label}</p>
              <p className="text-[10px] text-slate-500 leading-tight">{sub}</p>
            </div>
          ))}
        </div>

        {/* Core PS-07 Proof Section */}
        <Ps07ProofAttribution />

        {/* Interactive ROBI Calculator Engine */}
        <ROBICalculator />

        {/* Season Comparison & Attribution Details */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-indigo-600" />
              {t.seasonComparisonRegional}
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">2026 vs Regional Control</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
            <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{t.regionalUntreatedControl}</span>
              <span className="text-2xl font-bold text-slate-900">8.4 q/acre</span>
              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                Untreated neighboring fields experienced 14% flower pod drop during the night heat wave.
              </p>
            </div>

            <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-200/80 space-y-2">
              <span className="text-emerald-800 block text-[10px] uppercase font-bold">{t.aasraProtectedField}</span>
              <span className="text-2xl font-extrabold text-emerald-800">9.0 q/acre</span>
              <p className="text-[11px] text-emerald-950 font-sans leading-relaxed">
                Syngenta Stress Buster application within 48h preserved 75% of heat-damaged pod capacity.
              </p>
            </div>

            <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{t.verifiedRobiReturn}</span>
              <span className="text-2xl font-bold text-violet-700">215% Net ROI</span>
              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                ₹2,760 gross extra income minus ₹1,280 biostimulant cost = ₹1,480 net profit/acre.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Export */}
        {showExportModal && (
          <ExportProofCardModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
        )}

      </div>
    </AppShell>
  );
}
