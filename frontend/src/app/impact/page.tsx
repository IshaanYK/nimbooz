"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Ps07ProofAttribution } from "@/components/Ps07ProofAttribution";
import { ROBICalculator } from "@/components/ROBICalculator";
import { ExportProofCardModal } from "@/components/ExportProofCardModal";
import { Award, Download, BarChart2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ImpactPage() {
  const [showExportModal, setShowExportModal] = useState(false);
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {t.yieldAttributionBadge}
              </span>
            </div>
            <h1 className="text-3xl font-black font-display text-slate-900 mt-1 flex items-center gap-2">
              <Award className="h-7 w-7 text-emerald-600" />
              {t.robiAttributionTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {t.robiAttributionDesc}
            </p>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs transition-all shadow flex items-center gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{t.exportVerifiedProofCard}</span>
          </button>
        </div>

        {/* Animated Stat Counter Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: "215%",       label: t.verifiedNetRobi,   sub: t.returnOnBioInvestment, color: "emerald" },
            { value: "\u20b92,760", label: t.extraIncomeAcre,   sub: t.vsUntreatedControl,   color: "emerald" },
            { value: "0.6 q/acre", label: t.yieldUpliftProven, sub: t.synBioVsControl,       color: "blue"    },
            { value: "75%",        label: t.podRecoveryRate,    sub: t.duringR2HeatEvent,     color: "amber"   },
          ].map(({ value, label, sub, color }) => (
            <div key={label} className={`stripe-card p-5 space-y-1.5 border-l-4 border-l-${
              color === "emerald" ? "emerald-500" : color === "blue" ? "blue-500" : "amber-500"
            } rounded-2xl`}>
              <span className={`text-2xl sm:text-3xl font-black font-mono ${
                color === "emerald" ? "text-emerald-700" : color === "blue" ? "text-blue-700" : "text-amber-700"
              }`}>{value}</span>
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
        <div className="stripe-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-[#10B981]" />
              {t.seasonComparisonRegional}
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">2026 vs Regional Control</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{t.regionalUntreatedControl}</span>
              <span className="text-2xl font-bold text-slate-900">8.4 q/acre</span>
              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                Untreated neighboring fields experienced 14% flower pod drop during the night heat wave.
              </p>
            </div>

            <div className="bg-emerald-50/60 p-5 rounded-xl border border-emerald-200 space-y-2">
              <span className="text-emerald-700 block text-[10px] uppercase font-bold">{t.aasraProtectedField}</span>
              <span className="text-2xl font-black text-emerald-800">9.0 q/acre</span>
              <p className="text-[11px] text-emerald-900 font-sans leading-relaxed">
                Syngenta Stress Buster application within 48h preserved 75% of heat-damaged pod capacity.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{t.verifiedRobiReturn}</span>
              <span className="text-2xl font-bold text-slate-900">215% Net ROI</span>
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
