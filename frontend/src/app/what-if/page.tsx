"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";
import { PageHelpModal } from "@/components/PageHelpModal";
import { useLanguage } from "@/context/LanguageContext";
import { Sliders } from "lucide-react";

export default function WhatIfPage() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-mono font-black text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-300 flex items-center gap-1.5 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                PS-06: Biophysical Scenario Simulator
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                12% Protection Loss / Day Delayed
              </span>
            </div>
            <h1 className="text-3xl font-black font-display text-slate-900 mt-1 flex items-center gap-2">
              <Sliders className="h-7 w-7 text-indigo-600" />
              Biophysical What-If Scenario Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              Simulate how delaying biostimulant spraying (Syngenta Quantis) reduces cellular heat shock recovery from 78% to 42%, impacting your net yield and financial earnings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PageHelpModal
              pageKey="what_if"
              title="How to Use What-If Simulator"
              subtitle="Simulate delay impacts on heat stress recovery and net profit."
              steps={[
                { number: "01", title: "Select Your Farm & Crop", desc: "Choose your active field from the dropdown or enter custom temperature/moisture values." },
                { number: "02", title: "Drag Application Delay Slider", desc: "Move the slider from Day 0 (Today) to Day 3 (+3 Days Delay) to simulate spray delay penalties." },
                { number: "03", title: "Review Net Profit & Bio-Efficacy", desc: "View how spray delay reduces biostimulant efficacy and alters your net profit per acre." },
              ]}
            />
            <span className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
              MODEL 4.2 ONLINE
            </span>
          </div>
        </div>

        {/* PS-06 Science Context Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 p-5 text-white border border-blue-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  {t.whatIfBadge}
                </span>
              </div>
              <h2 className="font-black text-white text-base leading-tight">{t.sprayDelayBannerTitle}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.sprayDelayBannerDesc}
              </p>
            </div>
            <div className="flex gap-3 text-center font-mono text-xs shrink-0">
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-3 py-2">
                <span className="text-emerald-300 block text-[10px] font-bold">Day 0</span>
                <span className="text-white font-black text-sm">100%</span>
                <span className="text-emerald-400 block text-[9px]">{t.bioEfficacy}</span>
              </div>
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl px-3 py-2">
                <span className="text-amber-300 block text-[10px] font-bold">Day +1</span>
                <span className="text-white font-black text-sm">~82%</span>
                <span className="text-amber-400 block text-[9px]">{t.bioEfficacy}</span>
              </div>
              <div className="bg-rose-500/20 border border-rose-500/30 rounded-xl px-3 py-2">
                <span className="text-rose-300 block text-[10px] font-bold">Day +3</span>
                <span className="text-white font-black text-sm">~54%</span>
                <span className="text-rose-400 block text-[9px]">{t.bioEfficacy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Simulator Card */}
        <div className="stripe-card p-6 sm:p-8">
          <WhatIfSimulator />
        </div>

        {/* Outcome Explainer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-black">✓</span>
              <span className="text-xs font-mono font-bold text-emerald-800 uppercase">{t.bestCaseLabel}</span>
            </div>
            <h4 className="font-extrabold text-emerald-900 text-sm">{t.bestCaseTitle}</h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Applying Syngenta biological at Day 0 preserves full efficacy. Expected yield: <strong>9.0 q/acre</strong>. ROBI: 215%.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-black">!</span>
              <span className="text-xs font-mono font-bold text-amber-800 uppercase">{t.currentCaseLabel}</span>
            </div>
            <h4 className="font-extrabold text-amber-900 text-sm">{t.currentCaseTitle}</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              18% efficacy penalty. Expected yield: <strong>8.7 q/acre</strong>. Net loss: ~₹460/acre vs Day 0 action.
            </p>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-rose-600 text-white flex items-center justify-center text-sm font-black">✕</span>
              <span className="text-xs font-mono font-bold text-rose-800 uppercase">{t.worstCaseLabel}</span>
            </div>
            <h4 className="font-extrabold text-rose-900 text-sm">{t.worstCaseTitle}</h4>
            <p className="text-xs text-rose-700 leading-relaxed">
              46% efficacy penalty. Expected yield: <strong>8.1 q/acre</strong>. Biological cost still incurred. Net ROBI near breakeven.
            </p>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
