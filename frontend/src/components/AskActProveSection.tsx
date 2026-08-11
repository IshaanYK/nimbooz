"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mic, ArrowRight, CheckCircle2, TrendingUp, ShieldAlert, Sparkles, Activity, Calendar } from "lucide-react";

export const AskActProveSection: React.FC = () => {
  return (
    <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-20 space-y-16 font-sans">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DDF7EC] text-[#063B2D] text-xs font-mono font-black tracking-widest uppercase border border-[#00A878]/20">
          <Sparkles className="h-3.5 w-3.5 text-[#00A878]" /> Core Intelligence Journey
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-[#10241F] tracking-tight">
          ASK → ACT → PROVE
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
          From natural voice inquiry to confident field action and scientific outcome measurement.
        </p>
      </div>

      {/* 3-Part Flow System connected with SVG animated flow line */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* SVG Flowing Line (Desktop Only) */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2 z-0 pointer-events-none px-16">
          <svg className="w-full h-12" viewBox="0 0 800 40" fill="none">
            <motion.path
              d="M 50 20 Q 200 0, 400 20 T 750 20"
              stroke="#00A878"
              strokeWidth="4"
              strokeDasharray="10 8"
              initial={{ pathLength: 0, opacity: 0.2 }}
              whileInView={{ pathLength: 1, opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* STEP 1: ASK (Large Microphone Visualization) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 bg-white p-7 sm:p-8 rounded-3xl border border-[#063B2D]/10 shadow-xl flex flex-col justify-between space-y-6 hover:border-[#00A878] hover:shadow-2xl transition-all group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-[#063B2D] bg-[#DDF7EC] px-3.5 py-1 rounded-full border border-[#00A878]/30">
                STEP 01
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-400">INPUT</span>
            </div>
            <h3 className="text-2xl font-black font-display text-[#10241F] group-hover:text-[#00A878] transition-colors">
              ASK
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Farmers speak naturally in Hindi or regional dialects. Voice recognition processes local dialect nuances with zero typing required.
            </p>
          </div>

          {/* Large Mic Visual */}
          <div className="py-7 flex flex-col items-center justify-center bg-[#F7F6EF] rounded-2xl border border-emerald-500/10">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-20 w-20 rounded-full bg-[#00A878]/20 animate-ping" />
              <div className="h-16 w-16 rounded-full bg-[#063B2D] text-amber-300 flex items-center justify-center shadow-xl">
                <Mic className="h-8 w-8" />
              </div>
            </div>
            <span className="text-xs text-[#063B2D] font-extrabold mt-4 font-mono text-center px-4">
              "मेरी फसल में गर्मी का असर तो नहीं है?"
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-semibold border-t border-slate-100 pt-3 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#00A878]" />
            <span>Multilingual Dialect Processing</span>
          </div>
        </motion.div>

        {/* STEP 2: ACT (Interactive Recommendation Timeline) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 bg-white p-7 sm:p-8 rounded-3xl border border-[#063B2D]/10 shadow-xl flex flex-col justify-between space-y-6 hover:border-[#00A878] hover:shadow-2xl transition-all group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-[#063B2D] bg-[#DDF7EC] px-3.5 py-1 rounded-full border border-[#00A878]/30">
                STEP 02
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-400">ACTION</span>
            </div>
            <h3 className="text-2xl font-black font-display text-[#10241F] group-hover:text-[#00A878] transition-colors">
              ACT
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Field intelligence combines night temperature forecasts and crop stage data to output precise action timing and biostimulant guidance.
            </p>
          </div>

          {/* Recommendation Timeline Card */}
          <div className="p-4 bg-[#F7F6EF] rounded-2xl border border-emerald-500/10 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-[#063B2D] font-bold">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-[#00A878]" /> Optimal Spray Window:</span>
              <span className="text-[#00A878] font-black">Aug 13–14</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-sans leading-relaxed">
              Apply foliar biostimulant (500 ml/ha) before temperature spike to protect flower pods.
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-semibold border-t border-slate-100 pt-3 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#00A878]" />
            <span>Weather-Informed Guidance</span>
          </div>
        </motion.div>

        {/* STEP 3: PROVE (Yield / ROBI Visualization) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10 bg-[#063B2D] text-white p-7 sm:p-8 rounded-3xl border border-[#20C98A]/30 shadow-2xl flex flex-col justify-between space-y-6 group hover:border-[#20C98A] transition-all"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-white bg-[#00A878] px-3.5 py-1 rounded-full">
                STEP 03
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-300">OUTCOME</span>
            </div>
            <h3 className="text-2xl font-black font-display text-white group-hover:text-[#20C98A] transition-colors">
              PROVE
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              PS-07 engine calculates actual harvest outcome vs baseline and proves the exact biological return on biostimulant investment.
            </p>
          </div>

          {/* ROBI Outcome Gauge */}
          <div className="p-4 bg-[#10241F] rounded-2xl border border-emerald-500/30 space-y-2.5 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span>Biological Gain:</span>
              <span className="font-extrabold text-[#20C98A]">+0.5–0.8 q/acre</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Model Confidence:</span>
              <span className="font-extrabold text-amber-300">71%</span>
            </div>
            <div className="flex justify-between text-slate-200 border-t border-white/10 pt-2">
              <span>ROBI Index:</span>
              <span className="font-black text-[#20C98A] text-sm">215% Return</span>
            </div>
          </div>

          <div className="text-[11px] text-emerald-300 font-semibold border-t border-white/10 pt-3 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#20C98A]" />
            <span>Modelled Outcome Attribution</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
