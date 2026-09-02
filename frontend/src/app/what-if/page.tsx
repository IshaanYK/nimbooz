"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";
import { PageHelpModal } from "@/components/PageHelpModal";
import { useLanguage } from "@/context/LanguageContext";
import { Sliders, Activity, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function WhatIfPage() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-mono font-bold text-orange-800 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 flex items-center gap-1.5 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                PS-07 · BIOPHYSICAL SIMULATION & DELAY MODEL
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                12% Protection Loss / Day Delayed
              </span>
            </div>
            <h1 className="text-3xl font-extrabold font-display text-[#111827] mt-1 flex items-center gap-2 tracking-tight">
              <Sliders className="h-7 w-7 text-indigo-600" />
              Biophysical What-If Scenario Simulator
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-3xl mt-1">
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
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
              MODEL 4.2 ONLINE
            </span>
          </div>
        </div>

        {/* PS-06 Science Context Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] p-5 sm:p-6 text-white border border-indigo-500/30 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                  {t.whatIfBadge}
                </span>
              </div>
              <h2 className="font-extrabold text-white text-base leading-tight font-display">{t.sprayDelayBannerTitle}</h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {t.sprayDelayBannerDesc}
              </p>
            </div>
            <div className="flex gap-2.5 text-center font-mono text-xs shrink-0">
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-3.5 py-2">
                <span className="text-emerald-300 block text-[10px] font-bold">Day 0</span>
                <span className="text-white font-black text-sm">100%</span>
                <span className="text-emerald-400 block text-[9px]">{t.bioEfficacy}</span>
              </div>
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl px-3.5 py-2">
                <span className="text-amber-300 block text-[10px] font-bold">Day +1</span>
                <span className="text-white font-black text-sm">~82%</span>
                <span className="text-amber-400 block text-[9px]">{t.bioEfficacy}</span>
              </div>
              <div className="bg-rose-500/20 border border-rose-500/30 rounded-xl px-3.5 py-2">
                <span className="text-rose-300 block text-[10px] font-bold">Day +3</span>
                <span className="text-white font-black text-sm">~54%</span>
                <span className="text-rose-400 block text-[9px]">{t.bioEfficacy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Simulator Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          <WhatIfSimulator />
        </div>

        {/* Outcome Explainer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">✓</span>
              <span className="text-xs font-mono font-bold text-emerald-800 uppercase">{t.bestCaseLabel}</span>
            </div>
            <h4 className="font-bold text-emerald-950 text-sm">{t.bestCaseTitle}</h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Applying Syngenta biological at Day 0 preserves full efficacy. Expected yield: <strong>9.0 q/acre</strong>. ROBI: 215%.
            </p>
          </div>
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-2xs">!</span>
              <span className="text-xs font-mono font-bold text-amber-900 uppercase">{t.currentCaseLabel}</span>
            </div>
            <h4 className="font-bold text-amber-950 text-sm">{t.currentCaseTitle}</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              18% efficacy penalty. Expected yield: <strong>8.7 q/acre</strong>. Net loss: ~₹460/acre vs Day 0 action.
            </p>
          </div>
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">✕</span>
              <span className="text-xs font-mono font-bold text-rose-900 uppercase">{t.worstCaseLabel}</span>
            </div>
            <h4 className="font-bold text-rose-950 text-sm">{t.worstCaseTitle}</h4>
            <p className="text-xs text-rose-800 leading-relaxed">
              46% efficacy penalty. Expected yield: <strong>8.1 q/acre</strong>. Biological cost still incurred. Net ROBI near breakeven.
            </p>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
