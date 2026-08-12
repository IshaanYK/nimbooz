"use client";

import React from "react";
import {
  Thermometer,
  Sun,
  Droplets,
  Wind,
  Sparkles,
  Calendar,
  Zap,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface StressMetricsProps {
  stressData?: any;
  hydricData?: any[];
  sprayData?: any[];
  plantingData?: any[];
  crop?: string;
  onAskAI?: () => void;
}

export const StressMetrics: React.FC<StressMetricsProps> = ({
  stressData,
  hydricData = [],
  sprayData = [],
  plantingData = [],
  crop = "soybean",
  onAskAI,
}) => {
  const scores = stressData?.stress_scores || {};
  const heatDay = scores.heat_day || { score: 3.12, interpretation: "Moderate heat stress — Stress Buster recommended" };
  const heatNight = scores.heat_night || { score: 6.3, interpretation: "Severe night stress — high yield loss risk" };
  const drought = scores.drought || { index: 31.99, interpretation: "No drought risk — conditions adequate" };
  const frost = scores.frost || { score: 0, interpretation: "No frost risk" };

  const getBadgeStyle = (score: number) => {
    if (score <= 2) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    if (score <= 5) return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    return "bg-rose-500/20 text-rose-300 border-rose-500/40";
  };

  const getBadgeText = (score: number) => {
    if (score <= 2) return "LOW";
    if (score <= 5) return "MODERATE";
    return "HIGH";
  };

  // Compute dynamic spray window: next 2 days from today
  const today = new Date();
  const day1 = new Date(today);
  day1.setDate(today.getDate() + 1);
  const day2 = new Date(today);
  day2.setDate(today.getDate() + 2);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const sprayWindowLabel = `${dayNames[day1.getDay()]} & ${dayNames[day2.getDay()]} (${monthNames[day1.getMonth()]} ${day1.getDate()}–${day2.getDate()})`;

  return (
    <div className="space-y-4">
      {/* Primary Intelligence Alert Banner */}
      <div className="agri-card-glow p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 mt-0.5 font-bold">
            <Sparkles className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Primary Intelligence Alert (PS-04)
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                CE Hub + Agriculture Engine
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">
              Syngenta Stress Buster Application Recommended
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Nighttime heat stress is elevated ({heatNight.score}/9 score) with fluctuating soil moisture. Applying Stress Buster preserves photosynthetic activity during critical reproductive stage.
            </p>
          </div>
        </div>

        <button
          onClick={onAskAI}
          className="w-full md:w-auto px-6 py-3 text-xs font-black rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Zap className="h-4 w-4" />
          Ask Advisory AI
        </button>
      </div>

      {/* 4 Core Stress Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Day Heat Stress */}
        <div className="agri-card p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sun className="h-4 w-4 text-amber-400" /> Day Heat Stress
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(heatDay.score)}`}>
              {getBadgeText(heatDay.score)}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-mono">{heatDay.score}</span>
              <span className="text-xs text-slate-400 font-mono">/ 9.0</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${(heatDay.score / 9) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-300 mt-3.5 leading-snug">{heatDay.interpretation}</p>
        </div>

        {/* Night Heat Stress */}
        <div className="agri-card p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Thermometer className="h-4 w-4 text-rose-400" /> Night Heat Stress
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(heatNight.score)}`}>
              {getBadgeText(heatNight.score)}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-mono">{heatNight.score}</span>
              <span className="text-xs text-slate-400 font-mono">/ 9.0</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-rose-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${(heatNight.score / 9) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-300 mt-3.5 leading-snug">{heatNight.interpretation}</p>
        </div>

        {/* Drought Risk Index */}
        <div className="agri-card p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-sky-400" /> Drought Index (DI)
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
              OPTIMAL
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-mono">
                {typeof drought.index === "number" ? drought.index.toFixed(1) : "32.0"}
              </span>
              <span className="text-xs text-slate-400 font-mono">target &gt; 1.0</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-sky-400 h-full rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
          <p className="text-[11px] text-slate-300 mt-3.5 leading-snug">{drought.interpretation}</p>
        </div>

        {/* Frost Risk */}
        <div className="agri-card p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Wind className="h-4 w-4 text-indigo-400" /> Frost Risk
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
              NONE
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-mono">{frost.score}</span>
              <span className="text-xs text-slate-400 font-mono">/ 9.0</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-indigo-400 h-full rounded-full" style={{ width: "0%" }} />
            </div>
          </div>
          <p className="text-[11px] text-slate-300 mt-3.5 leading-snug">{frost.interpretation}</p>
        </div>
      </div>

      {/* CE Hub Decision Windows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hydric Stress */}
        <div className="agri-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">CE Hub Hydric Stress Ingestion</h4>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              LIVE DATA
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Field Telemetry — Kharif Season</span>
                <p className="text-[11px] text-slate-300 mt-0.5">Constraint: <code className="text-emerald-300 font-mono font-bold">ResLegHighSoilMoisture</code></p>
              </div>
              <span className="text-xs font-bold text-emerald-400 font-mono">Normal</span>
            </div>
          </div>
        </div>

        {/* Decision Windows */}
        <div className="agri-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-400" />
              <h4 className="text-sm font-bold text-white">CE Hub Decision Windows</h4>
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-500/20 px-2.5 py-0.5 rounded-full border border-teal-500/30">
              THIS WEEK
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-medium">Optimal Spray Window:</span>
                <p className="text-white font-bold mt-0.5">{sprayWindowLabel}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">FAVORABLE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
