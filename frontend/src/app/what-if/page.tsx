"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";
import { PageHelpModal } from "@/components/PageHelpModal";
import { useLanguage } from "@/context/LanguageContext";
import { Sliders, Activity, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";

export default function WhatIfPage() {
  const { t, language } = useLanguage();

  return (
    <AppShell>
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* ─────────────────────────────────────────────────────────────────
            1. STRIPE-STYLE HERO HEADER (design-md-stripe)
           ───────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3e8ee] pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-mono font-bold text-[#533afd] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1.5 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-[#533afd] animate-ping" />
                PS-07 · BIOPHYSICAL SIMULATION & DELAY MODEL
              </span>
              <span className="text-xs font-mono font-bold text-slate-600 bg-[#f6f9fc] px-2.5 py-0.5 rounded-full border border-[#e3e8ee]">
                12-18% Protection Loss / Day Delayed
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                SHAPLEY DECOMPOSITION 4.2
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0d253d] tracking-tight flex items-center gap-2.5 mt-1">
              <Sliders className="h-7 w-7 text-[#533afd]" />
              <span>Biophysical What-If Scenario Simulator</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1.5 leading-relaxed">
              Simulate how delaying biostimulant spraying (Syngenta Quantis / Stress Buster) reduces cellular heat shock recovery from 78% to 22%, impacting your farm&apos;s net yield, pod retention, and seasonal profit.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <PageHelpModal
              pageKey="what_if"
              title="How to Use What-If Simulator"
              subtitle="Simulate delay impacts on heat stress recovery and net profit."
              steps={[
                { number: "01", title: "Select Your Farm & Crop", desc: "Choose your active field from the dropdown or enter custom temperature/moisture values." },
                { number: "02", title: "Drag Application Delay Slider", desc: "Move the slider from Day 0 (Today) to Day 5 to simulate spray delay penalties." },
                { number: "03", title: "Explore Multi-Physics Tabs", desc: "Switch between Spray Delay, Climate Heatwave Shock, Mandi Sensitivity, and Wind Drift." },
                { number: "04", title: "Review Personalized Farm Income", desc: "View how spray timing alters your net profit across your exact acreage." },
              ]}
            />
            <span className="px-3.5 py-2 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] text-[#0d253d] text-xs font-mono font-bold shadow-2xs">
              MODEL 4.2 ONLINE
            </span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            2. SCIENCE CONTEXT BANNER (AASRA ACCENT GRADIENT)
           ───────────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d253d] via-[#1c1e54] to-[#0d253d] p-6 sm:p-7 text-white border border-indigo-500/20 shadow-lg">
          {/* Ambient Glowing Orbs */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-float-gentle" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-5 justify-between">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                  BIOLOGICAL TIMING ENGINE
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Syngenta Quantis Mode
                </span>
              </div>
              <h2 className="font-extrabold text-white text-base sm:text-lg leading-snug font-display">
                Biostimulant Application Window & Thermal Decay Dynamics
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                During acute thermal stress (&gt;25°C nocturnal respiration), each 24-hour delay in applying biostimulants degrades physiological osmoprotective efficacy by 12–18%, rapidly accelerating flower drop and pod abortion.
              </p>
            </div>

            <div className="flex gap-2.5 text-center font-mono text-xs shrink-0">
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-4 py-2.5 shadow-sm">
                <span className="text-emerald-300 block text-[10px] font-bold">Day 0 (Today)</span>
                <span className="text-white font-black text-base">100%</span>
                <span className="text-emerald-400 block text-[9px] font-medium">Full Bio-Efficacy</span>
              </div>
              <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl px-4 py-2.5 shadow-sm">
                <span className="text-amber-300 block text-[10px] font-bold">Day +1 Delay</span>
                <span className="text-white font-black text-base">~76%</span>
                <span className="text-amber-400 block text-[9px] font-medium">Moderate Drop</span>
              </div>
              <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl px-4 py-2.5 shadow-sm">
                <span className="text-rose-300 block text-[10px] font-bold">Day +3 Delay</span>
                <span className="text-white font-black text-base">~22%</span>
                <span className="text-rose-400 block text-[9px] font-medium">Severe Penalty</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            3. MAIN MULTI-DIMENSIONAL WHAT-IF SIMULATOR ENGINE
           ───────────────────────────────────────────────────────────────── */}
        <WhatIfSimulator />

        {/* ─────────────────────────────────────────────────────────────────
            4. OUTCOME EXPLAINER CARDS (STRIPE ELEVATED)
           ───────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="stripe-card stripe-card-hover p-6 space-y-2.5 border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">✓</span>
              <span className="text-xs font-mono font-bold text-emerald-900 uppercase">OPTIMAL · DAY 0</span>
            </div>
            <h4 className="font-bold text-[#0d253d] text-sm">Full Cellular Protection</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applying Syngenta biological at Day 0 preserves 100% efficacy. Stabilizes chloroplast photosystems, secures pod retention, and achieves peak ROBI return (500%+).
            </p>
          </div>

          <div className="stripe-card stripe-card-hover p-6 space-y-2.5 border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-2xs">!</span>
              <span className="text-xs font-mono font-bold text-amber-900 uppercase">CAUTION · DAY +1</span>
            </div>
            <h4 className="font-bold text-[#0d253d] text-sm">Delayed Intervention</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              24% efficacy decay. Moderate respiration burn occurs. Net loss of ~₹460/acre compared to Day 0 timely application, though positive return is still maintained.
            </p>
          </div>

          <div className="stripe-card stripe-card-hover p-6 space-y-2.5 border-rose-200/80 bg-gradient-to-b from-rose-50/50 to-white">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">✕</span>
              <span className="text-xs font-mono font-bold text-rose-900 uppercase">CRITICAL · DAY +3</span>
            </div>
            <h4 className="font-bold text-[#0d253d] text-sm">Severe Efficacy Penalty</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              78% efficacy penalty. Reproductive flower abortion exceeds 40%. Biological cost is still incurred, leaving the farmer near financial breakeven with irreversible yield loss.
            </p>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
