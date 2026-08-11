"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, Clock, AlertTriangle, ShieldCheck, TrendingUp, Zap, Calendar, ArrowRight, BarChart3 } from "lucide-react";
import { DataBadge } from "./DataBadge";

export const WhatIfSimulator: React.FC = () => {
  const [delayDays, setDelayDays] = useState<number>(0);

  // Dynamic simulation outcomes based on delay
  const getSimulation = (days: number) => {
    switch (days) {
      case 0:
        return {
          windowStatus: "OPTIMAL WINDOW OPEN",
          riskScore: 78,
          stressLevel: "Preventable Stress",
          expectedYield: 9.2,
          biologicalGain: 0.60,
          robiReturn: 215,
          actionMsg: "Applying biostimulant today stabilizes flowering cell membranes during heat spike.",
          color: "border-[#00A878] bg-[#DDF7EC]",
          textColor: "text-[#063B2D]",
          badgeBg: "bg-[#00A878] text-white",
        };
      case 1:
        return {
          windowStatus: "WINDOW CLOSING",
          riskScore: 82,
          stressLevel: "Moderate Flower Scorch",
          expectedYield: 9.0,
          biologicalGain: 0.45,
          robiReturn: 175,
          actionMsg: "1-day delay causes minor dark respiration sugar loss.",
          color: "border-amber-400 bg-amber-50/80",
          textColor: "text-amber-900",
          badgeBg: "bg-amber-500 text-white",
        };
      case 2:
        return {
          windowStatus: "HIGH RISK DELAY",
          riskScore: 89,
          stressLevel: "Pod Abscission Risk",
          expectedYield: 8.7,
          biologicalGain: 0.20,
          robiReturn: 110,
          actionMsg: "2-day delay causes partial flower pod drop.",
          color: "border-orange-400 bg-orange-50/80",
          textColor: "text-orange-950",
          badgeBg: "bg-orange-500 text-white",
        };
      case 3:
      default:
        return {
          windowStatus: "CRITICAL MISSED WINDOW",
          riskScore: 95,
          stressLevel: "Irreversible Respiration Damage",
          expectedYield: 8.4,
          biologicalGain: 0.05,
          robiReturn: 25,
          actionMsg: "3+ day delay results in significant pod loss. Biological efficacy drops drastically.",
          color: "border-rose-400 bg-rose-50/80",
          textColor: "text-rose-950",
          badgeBg: "bg-rose-600 text-white",
        };
    }
  };

  const sim = getSimulation(delayDays);

  return (
    <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-20 space-y-12 font-sans">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <DataBadge type="MODELLED" customText="SIMULATED SCENARIO" />
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-[#10241F] tracking-tight">
          "What if I waited three days?"
        </h2>
        <p className="text-xs sm:text-base text-slate-600 font-normal leading-relaxed">
          Drag the timeline slider to simulate how intervention delay impacts crop heat risk, yield loss, and return on investment.
        </p>
      </div>

      {/* Main Interactive Interface Container */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#063B2D]/15 shadow-2xl space-y-10">
        {/* Timeline Interactive Slider */}
        <div className="space-y-4 max-w-2xl mx-auto bg-[#F7F6EF] p-6 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-700 flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-slate-900 font-sans font-extrabold text-sm">
              <Clock className="h-4 w-4 text-[#00A878]" /> Select Application Timing:
            </span>
            <div className="flex items-center gap-2">
              <DataBadge type="MODELLED" customText="SIMULATED SCENARIO" size="sm" />
              <span className="text-[#00A878] font-black text-sm bg-white px-3 py-1 rounded-full border border-[#00A878]/30 shadow-sm">
                {delayDays === 0 ? "APPLY TODAY (Day 0)" : `+${delayDays} DAY${delayDays > 1 ? "S" : ""} DELAY`}
              </span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={delayDays}
            onChange={(e) => setDelayDays(parseInt(e.target.value))}
            className="w-full h-3.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#00A878] shadow-inner"
          />

          <div className="flex justify-between text-xs font-mono font-black text-slate-500 pt-1">
            <button onClick={() => setDelayDays(0)} className={`cursor-pointer hover:text-[#00A878] transition-colors ${delayDays === 0 ? "text-[#00A878] underline decoration-2 underline-offset-4" : ""}`}>TODAY</button>
            <button onClick={() => setDelayDays(1)} className={`cursor-pointer hover:text-amber-600 transition-colors ${delayDays === 1 ? "text-amber-600 underline decoration-2 underline-offset-4" : ""}`}>+1 DAY</button>
            <button onClick={() => setDelayDays(2)} className={`cursor-pointer hover:text-orange-600 transition-colors ${delayDays === 2 ? "text-orange-600 underline decoration-2 underline-offset-4" : ""}`}>+2 DAYS</button>
            <button onClick={() => setDelayDays(3)} className={`cursor-pointer hover:text-rose-600 transition-colors ${delayDays === 3 ? "text-rose-600 underline decoration-2 underline-offset-4" : ""}`}>+3 DAYS</button>
          </div>
        </div>

        {/* Dynamic Outcome Details */}
        <motion.div
          key={delayDays}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`p-6 sm:p-8 rounded-2xl border-2 ${sim.color} space-y-6 shadow-md`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/40 pb-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-black uppercase ${sim.badgeBg}`}>
                {sim.windowStatus}
              </span>
              <h3 className={`font-black text-base sm:text-lg font-display ${sim.textColor}`}>{sim.stressLevel}</h3>
            </div>
            <p className="text-xs font-sans text-slate-700 font-semibold bg-white/90 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              {sim.actionMsg}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">HEAT RISK INDEX</span>
              <span className="text-xl font-black text-slate-900">{sim.riskScore}%</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">ESTIMATED YIELD</span>
              <span className="text-xl font-black text-slate-900">{sim.expectedYield} <span className="text-xs font-normal">q/acre</span></span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">BIOLOGICAL GAIN</span>
              <span className="text-xl font-black text-[#00A878]">+{sim.biologicalGain.toFixed(2)} <span className="text-xs font-normal">q/acre</span></span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">ROBI RETURN</span>
              <span className="text-xl font-black text-amber-600">{sim.robiReturn}%</span>
            </div>
          </div>
        </motion.div>

        {/* Side-by-Side Comparison Graphs: APPLY NOW vs WAIT 3 DAYS */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-[#10241F] text-base font-display flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#00A878]" /> Direct Scenario Comparison: Apply Now vs Delay
            </h4>
            <DataBadge type="MODELLED" customText="SIMULATED SCENARIO" size="sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scenario A: APPLY NOW */}
            <div className="bg-[#DDF7EC]/60 border-2 border-[#00A878] p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#00A878]/30 pb-2">
                <span className="text-xs font-mono font-black text-[#063B2D] uppercase bg-[#00A878] text-white px-2.5 py-0.5 rounded-full">
                  SCENARIO A: APPLY NOW
                </span>
                <span className="text-xs font-bold text-[#00A878]">RECOMMENDED</span>
              </div>

              {/* Animated Progress Bar: Yield */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Harvest Yield:</span>
                  <span className="text-[#00A878]">9.2 q/acre</span>
                </div>
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "92%" }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-[#00A878] rounded-full"
                  />
                </div>
              </div>

              {/* Animated Progress Bar: ROBI */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Return on Investment (ROBI):</span>
                  <span className="text-amber-700 font-black">215%</span>
                </div>
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "86%" }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#063B2D] font-medium pt-1">
                ✓ Full biological biostimulant protection. Prevents cell respiration pod drop.
              </p>
            </div>

            {/* Scenario B: WAIT 3 DAYS */}
            <div className="bg-rose-50/60 border-2 border-rose-300 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-rose-300 pb-2">
                <span className="text-xs font-mono font-black text-white uppercase bg-rose-600 px-2.5 py-0.5 rounded-full">
                  SCENARIO B: WAIT 3 DAYS
                </span>
                <span className="text-xs font-bold text-rose-600">HIGH LOSS RISK</span>
              </div>

              {/* Animated Progress Bar: Yield */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Harvest Yield:</span>
                  <span className="text-rose-600">8.4 q/acre (-0.8 q/acre drop)</span>
                </div>
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-rose-500 rounded-full"
                  />
                </div>
              </div>

              {/* Animated Progress Bar: ROBI */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Return on Investment (ROBI):</span>
                  <span className="text-rose-700 font-black">25%</span>
                </div>
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "20%" }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-rose-600 rounded-full"
                  />
                </div>
              </div>

              <p className="text-[11px] text-rose-900 font-medium pt-1">
                ⚠ Irreversible flower pod abscission occurs during night heat spike.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
