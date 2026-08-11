"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, TrendingUp, ShieldCheck, CheckCircle2, BarChart2, Activity } from "lucide-react";

export const Ps07ProofAttribution: React.FC = () => {
  return (
    <section className="w-full bg-[#10241F] text-white py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A878]/30 text-[#20C98A] text-xs font-mono font-black uppercase border border-[#20C98A]/30">
            <Award className="h-4 w-4 text-amber-300" /> PS-07 OUTCOME MEASUREMENT
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
            Advice is useful. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C98A] via-[#00A878] to-amber-300">
              Proof builds trust.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            AASRA calculates modelled outcome attribution and isolates biological contribution from weather and soil baseline effects.
          </p>
        </div>

        {/* Outcome Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#063B2D] p-5 rounded-2xl border border-white/10 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">EXPECTED YIELD</span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">8.5 <span className="text-xs text-slate-400 font-normal">q/acre</span></span>
          </div>

          <div className="bg-[#063B2D] p-5 rounded-2xl border border-[#20C98A]/40 text-center space-y-1">
            <span className="text-[11px] text-emerald-300 font-medium block">ACTUAL HARVEST</span>
            <span className="text-2xl sm:text-3xl font-black text-[#20C98A] font-mono">9.2 <span className="text-xs text-emerald-400 font-normal">q/acre</span></span>
          </div>

          <div className="bg-[#063B2D] p-5 rounded-2xl border border-white/10 text-center space-y-1 col-span-2 md:col-span-1">
            <span className="text-[11px] text-slate-400 font-medium block">BIOLOGICAL GAIN</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">+0.5–0.8 <span className="text-xs text-amber-400 font-normal">q/acre</span></span>
          </div>

          <div className="bg-[#063B2D] p-5 rounded-2xl border border-white/10 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">CONFIDENCE</span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">71%</span>
          </div>

          <div className="bg-[#063B2D] p-5 rounded-2xl border border-[#20C98A]/40 text-center space-y-1">
            <span className="text-[11px] text-emerald-300 font-medium block">ROBI INDEX</span>
            <span className="text-2xl sm:text-3xl font-black text-[#20C98A] font-mono">215%</span>
          </div>
        </div>

        {/* Animated Decomposition Visual Tree */}
        <div className="glass-panel-dark p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <h3 className="font-extrabold text-white text-base font-display flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-[#20C98A]" /> Modelled Yield Decomposition Tree
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center bg-[#063B2D] p-3.5 rounded-xl border border-white/10">
              <span className="text-slate-300">Baseline Expected Yield</span>
              <span className="font-bold text-white">8.50 q/acre</span>
            </div>

            <div className="pl-4 border-l-2 border-[#00A878]/40 space-y-2">
              <div className="flex justify-between items-center text-slate-300 bg-white/5 p-2.5 rounded-lg">
                <span>├── Weather & Thermal Effect:</span>
                <span className="font-bold text-rose-300">-0.25 q/acre (Heat Stress)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 bg-white/5 p-2.5 rounded-lg">
                <span>├── Soil Moisture Contribution:</span>
                <span className="font-bold text-emerald-300">+0.15 q/acre</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 bg-white/5 p-2.5 rounded-lg">
                <span>├── Field Management:</span>
                <span className="font-bold text-emerald-300">+0.20 q/acre</span>
              </div>
              <div className="flex justify-between items-center bg-[#00A878]/30 p-2.5 rounded-lg border border-[#20C98A]/40 text-[#20C98A] font-bold">
                <span>└── Modelled Biological Spray Effect:</span>
                <span>+0.60 q/acre</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#00A878] text-white p-4 rounded-xl font-bold text-sm shadow-lg">
              <span>Final Actual Measured Yield Outcome</span>
              <span className="font-black text-amber-300">9.20 q/acre</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
