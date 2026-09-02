"use client";

import React, { useState, useEffect } from "react";
import {
  Sprout,
  Sun,
  Droplets,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SimulationDayState {
  day: number;
  stageNameEn: string;
  stageNameHi: string;
  temperature: number;
  stressLevel: "Low" | "Moderate" | "Extreme";
  
  // Untreated side
  untreatedHeight: number;
  untreatedRoot: number;
  untreatedHealth: number;
  untreatedLeafColor: string;
  untreatedStatusEn: string;
  untreatedStatusHi: string;
  
  // Syngenta Protected side
  protectedHeight: number;
  protectedRoot: number;
  protectedHealth: number;
  protectedLeafColor: string;
  protectedStatusEn: string;
  protectedStatusHi: string;
}

const SIMULATION_TIMELINE: SimulationDayState[] = [
  {
    day: 5,
    stageNameEn: "Emergence & Germination (Day 5)",
    stageNameHi: "अंकुरण व शुरुआती बढ़वार (दिन 5)",
    temperature: 28,
    stressLevel: "Low",
    untreatedHeight: 8,
    untreatedRoot: 10,
    untreatedHealth: 90,
    untreatedLeafColor: "#4ade80",
    untreatedStatusEn: "Seedling emerges with shallow primary root.",
    untreatedStatusHi: "बीज से पहला अंकुर व सामान्य जड़ निकली।",
    protectedHeight: 12,
    protectedRoot: 16,
    protectedHealth: 98,
    protectedLeafColor: "#22c55e",
    protectedStatusEn: "Vigorous root establishment treated with Vibrance® Trio.",
    protectedStatusHi: "Vibrance® Trio उपचार से जड़ें तेजी से जमीन में स्थापित।",
  },
  {
    day: 30,
    stageNameEn: "Vegetative Canopy & Root Expansion (Day 30)",
    stageNameHi: "वानस्पतिक वृद्धि व शाखा विस्तार (दिन 30)",
    temperature: 32,
    stressLevel: "Moderate",
    untreatedHeight: 32,
    untreatedRoot: 28,
    untreatedHealth: 74,
    untreatedLeafColor: "#86efac",
    untreatedStatusEn: "Minor chlorosis & weak root branching under early dry spell.",
    untreatedStatusHi: "नमी की कमी से पत्तियों में हल्का पीलापन व कमजोर जड़ें।",
    protectedHeight: 48,
    protectedRoot: 52,
    protectedHealth: 96,
    protectedLeafColor: "#15803d",
    protectedStatusEn: "Isabion® application powers extensive lateral root branching.",
    protectedStatusHi: "Isabion® स्प्रे से मजबूत तना और 2 गुना घनी जड़ें।",
  },
  {
    day: 55,
    stageNameEn: "Flowering & Heatwave Stress Peak (Day 55)",
    stageNameHi: "फूल अवस्था व तीव्र तापमान तनाव (दिन 55)",
    temperature: 37,
    stressLevel: "Extreme",
    untreatedHeight: 45,
    untreatedRoot: 35,
    untreatedHealth: 48,
    untreatedLeafColor: "#facc15",
    untreatedStatusEn: "Severe heat shock (>36°C) causes 40% floret drop and leaf burning.",
    untreatedStatusHi: "अत्यधिक गर्मी (>36°C) से 40% फूल झड़े व पत्तियां झुलसीं।",
    protectedHeight: 70,
    protectedRoot: 78,
    protectedHealth: 94,
    protectedLeafColor: "#166534",
    protectedStatusEn: "Syngenta Quantis® activates heat-shock proteins; 0% flower abortion.",
    protectedStatusHi: "Quantis® ने तापमान सुरक्षा दी; फूल सुरक्षित व परागण पूर्ण।",
  },
  {
    day: 80,
    stageNameEn: "Grain/Pod Filling & Starch Translocation (Day 80)",
    stageNameHi: "दाना भराव व फली विकास (दिन 80)",
    temperature: 33,
    stressLevel: "Moderate",
    untreatedHeight: 48,
    untreatedRoot: 38,
    untreatedHealth: 38,
    untreatedLeafColor: "#ca8a04",
    untreatedStatusEn: "Early leaf senescence; shriveled seeds and reduced grain weight.",
    untreatedStatusHi: "पत्तियां सूखने लगीं; दाने सिकुड़े व हल्का वजन।",
    protectedHeight: 85,
    protectedRoot: 88,
    protectedHealth: 92,
    protectedLeafColor: "#15803d",
    protectedStatusEn: "Stay-green chlorophyll retention ensures bold, heavy grain filling.",
    protectedStatusHi: "पत्तियां हरी रहीं; चमकदार, भारी व भरा हुआ दाना बना।",
  },
  {
    day: 100,
    stageNameEn: "Physiological Harvest & Final Yield (Day 100)",
    stageNameHi: "पूर्ण परिपक्वता व अंतिम उपज (दिन 100)",
    temperature: 29,
    stressLevel: "Low",
    untreatedHeight: 50,
    untreatedRoot: 40,
    untreatedHealth: 30,
    untreatedLeafColor: "#a16207",
    untreatedStatusEn: "-35% Yield loss due to heat shock and poor root depth.",
    untreatedStatusHi: "गर्मी और कमजोर जड़ों के कारण 35% उपज का नुकसान।",
    protectedHeight: 90,
    protectedRoot: 90,
    protectedHealth: 98,
    protectedLeafColor: "#166534",
    protectedStatusEn: "+24% Net yield gain; full genetic potential unlocked.",
    protectedStatusHi: "+24% अतिरिक्त शुद्ध उपज; पूरा उत्पादन सुरक्षित।",
  },
];

export const CropGrowthSimulator: React.FC = () => {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  const [stepIndex, setStepIndex] = useState<number>(0);

  // Auto-playing continuous time-lapse animation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % SIMULATION_TIMELINE.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const current = SIMULATION_TIMELINE[stepIndex];
  const progressPercent = ((stepIndex + 1) / SIMULATION_TIMELINE.length) * 100;

  return (
    <div className="rounded-3xl bg-white border border-[#e3e8ee] shadow-2xl p-6 sm:p-8 space-y-6 select-none">
      
      {/* ── Header with Auto-Play Time Controller ──────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#533afd]/10 text-[#533afd] border border-[#533afd]/20 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Biophysical Crop Growth Engine</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#0d253d] font-display mt-1 tracking-tight">
            {isHindi ? "पौधे का विकास व बायोस्टिमुलेंट सुरक्षा सिमुलेशन" : "Plant Growth & Biostimulant Protection Simulation"}
          </h3>
          <p className="text-xs sm:text-sm text-[#64748d] mt-1">
            {isHindi
              ? "देखें बिना सुरक्षा के पौधा कैसे तनावग्रस्त होता है, और सिंजेंटा बायोस्टिमुलेंट कैसे जड़, तना और उपज को सुरक्षित रखते हैं।"
              : "Live side-by-side time-lapse comparing untreated baseline crops versus Syngenta biostimulant-protected crops under heat and drought stress."}
          </p>
        </div>

        {/* Automatic Day Progress Badge (No Pause Button) */}
        <div className="flex items-center gap-2.5 bg-[#f6f9fc] border border-[#e3e8ee] p-2.5 px-4 rounded-2xl shrink-0 self-start sm:self-auto">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              {isHindi ? "स्वचालित टाइम-लैप्स" : "Automatic Time-Lapse"}
            </span>
            <span className="text-sm font-black text-[#0d253d] font-mono">
              Day {current.day} / 100
            </span>
          </div>

          <button
            type="button"
            onClick={() => setStepIndex(0)}
            className="p-1.5 ml-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Restart Simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Time-Lapse Stage Progress Ribbon ───────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-[#0d253d] font-display flex items-center gap-1.5">
            <Sprout className="h-4 w-4 text-emerald-600" />
            <span>{isHindi ? current.stageNameHi : current.stageNameEn}</span>
          </span>
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
            current.stressLevel === "Extreme"
              ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
              : current.stressLevel === "Moderate"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}>
            🌡️ Ambient Temp: {current.temperature}°C ({current.stressLevel} Stress)
          </span>
        </div>

        {/* Animated Progress Track */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#533afd] via-[#0ea5e9] to-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── SIDE-BY-SIDE DUAL COMPARISON VIEWPORT ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* ── LEFT PANEL: WITHOUT SYNGENTA (Untreated Baseline) ──────── */}
        <div className="rounded-3xl border-2 border-red-200 bg-gradient-to-b from-rose-50/40 via-amber-50/30 to-amber-950/20 p-5 flex flex-col justify-between relative overflow-hidden shadow-sm">
          
          {/* Top Label */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/90 text-red-800 border border-red-300 text-xs font-bold">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
              <span>{isHindi ? "बिना सुरक्षा (असुरक्षित फसल)" : "Without Syngenta (Untreated)"}</span>
            </div>
            <span className="text-xs font-mono font-black text-rose-700 bg-white/90 px-2 py-0.5 rounded-lg border border-rose-200">
              {current.untreatedHealth}% Health
            </span>
          </div>

          {/* Plant SVG Graphic: Stunted / Heat Stressed */}
          <div className="relative w-full flex items-center justify-center my-4 z-10" style={{ height: "230px" }}>
            <svg width="220" height="230" viewBox="0 0 220 230" className="transition-all duration-700 ease-out">
              
              {/* Soil Line */}
              <line x1="10" y1="130" x2="210" y2="130" stroke="#78350f" strokeWidth="2.5" strokeDasharray="4 2" />
              <text x="15" y="142" fill="#92400e" fontSize="8" fontFamily="monospace">Ground 0cm</text>
              <text x="15" y="215" fill="#92400e" fontSize="8" fontFamily="monospace">Roots -{current.untreatedRoot}cm</text>

              {/* Underground Shallow Roots (Dry, Sparse) */}
              <g stroke="#a16207" strokeWidth="1.8" fill="none" opacity="0.8">
                <path d={`M 110 130 Q 110 ${130 + current.untreatedRoot * 0.7} 110 ${130 + current.untreatedRoot}`} />
                <path d={`M 110 135 Q 95 ${135 + current.untreatedRoot * 0.4} ${110 - current.untreatedRoot * 0.3} ${130 + current.untreatedRoot * 0.6}`} />
                <path d={`M 110 135 Q 125 ${135 + current.untreatedRoot * 0.4} ${110 + current.untreatedRoot * 0.3} ${130 + current.untreatedRoot * 0.6}`} />
              </g>

              {/* Above Ground Stem (Thinner, Drooping under heat) */}
              <g stroke="#84cc16" strokeWidth="3" fill="none">
                <path d={`M 110 130 Q ${stepIndex >= 2 ? "120" : "110"} ${130 - current.untreatedHeight * 0.5} ${stepIndex >= 2 ? "125" : "110"} ${130 - current.untreatedHeight}`} />
              </g>

              {/* Wilted Leaves with Chlorosis Yellowing */}
              <g fill={current.untreatedLeafColor} stroke="#65a30d" strokeWidth="1">
                <ellipse cx="95" cy={130 - current.untreatedHeight * 0.3} rx="14" ry="4" transform={`rotate(${stepIndex >= 2 ? "25" : "-20"} 95 ${130 - current.untreatedHeight * 0.3})`} />
                <ellipse cx="125" cy={130 - current.untreatedHeight * 0.3} rx="14" ry="4" transform={`rotate(${stepIndex >= 2 ? "45" : "20"} 125 ${130 - current.untreatedHeight * 0.3})`} />
                {stepIndex >= 1 && (
                  <>
                    <ellipse cx="90" cy={130 - current.untreatedHeight * 0.6} rx="16" ry="5" transform={`rotate(35 90 ${130 - current.untreatedHeight * 0.6})`} />
                    <ellipse cx="130" cy={130 - current.untreatedHeight * 0.6} rx="16" ry="5" transform={`rotate(55 130 ${130 - current.untreatedHeight * 0.6})`} />
                  </>
                )}
              </g>

              {/* Shriveled Flower/Pod at Heatwave (Stage 2+) */}
              {stepIndex >= 2 && (
                <g fill="#ca8a04" stroke="#854d0e" strokeWidth="1">
                  <circle cx="125" cy={130 - current.untreatedHeight * 1.05} r="5" opacity={stepIndex === 2 ? "0.6" : "0.9"} />
                  {stepIndex === 2 && (
                    <text x="135" y={130 - current.untreatedHeight * 1.05} fill="#dc2626" fontSize="8" fontWeight="bold">Flower Drop 🥀</text>
                  )}
                </g>
              )}
            </svg>
          </div>

          {/* Untreated Diagnostic Status Card */}
          <div className="rounded-2xl bg-white/95 border border-red-200 p-3.5 space-y-2 z-10 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
              <span>Height: <strong>{current.untreatedHeight} cm</strong></span>
              <span className="text-red-700">Root: <strong>{current.untreatedRoot} cm (Shallow)</strong></span>
            </div>
            <p className="text-xs text-red-950 font-medium leading-snug">
              {isHindi ? current.untreatedStatusHi : current.untreatedStatusEn}
            </p>
          </div>

        </div>

        {/* ── RIGHT PANEL: WITH SYNGENTA BIOSTIMULANTS (Protected) ───── */}
        <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-50/50 via-teal-50/30 to-amber-950/20 p-5 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-emerald-500/10">
          
          {/* Top Label */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white shadow-xs text-xs font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{isHindi ? "सिंजेंटा सुरक्षा के साथ (Quantis® + Isabion®)" : "With Syngenta (Quantis® Protected)"}</span>
            </div>
            <span className="text-xs font-mono font-black text-emerald-800 bg-white/95 px-2 py-0.5 rounded-lg border border-emerald-300">
              {current.protectedHealth}% Health
            </span>
          </div>

          {/* Plant SVG Graphic: Deep Roots & Lush Canopy */}
          <div className="relative w-full flex items-center justify-center my-4 z-10" style={{ height: "230px" }}>
            <svg width="220" height="230" viewBox="0 0 220 230" className="transition-all duration-700 ease-out">
              
              {/* Soil Line */}
              <line x1="10" y1="130" x2="210" y2="130" stroke="#78350f" strokeWidth="2.5" strokeDasharray="4 2" />
              <text x="15" y="142" fill="#92400e" fontSize="8" fontFamily="monospace">Ground 0cm</text>
              <text x="15" y="215" fill="#15803d" fontSize="8" fontFamily="monospace" fontWeight="bold">Roots -{current.protectedRoot}cm (Deep)</text>

              {/* Underground Deep Branching Taproot System */}
              <g stroke="#78350f" strokeWidth="2.4" fill="none" opacity="0.9">
                <path d={`M 110 130 Q 110 ${130 + current.protectedRoot * 0.7} 110 ${130 + current.protectedRoot}`} />
                <path d={`M 110 135 Q 90 ${135 + current.protectedRoot * 0.5} ${110 - current.protectedRoot * 0.5} ${130 + current.protectedRoot * 0.8}`} />
                <path d={`M 110 135 Q 130 ${135 + current.protectedRoot * 0.5} ${110 + current.protectedRoot * 0.5} ${130 + current.protectedRoot * 0.8}`} />
                {stepIndex >= 1 && (
                  <>
                    <path d={`M 110 150 Q 80 ${150 + current.protectedRoot * 0.4} 70 ${130 + current.protectedRoot * 0.7}`} strokeWidth="1.6" />
                    <path d={`M 110 150 Q 140 ${150 + current.protectedRoot * 0.4} 150 ${130 + current.protectedRoot * 0.7}`} strokeWidth="1.6" />
                  </>
                )}
              </g>

              {/* Sturdy Erect Stem */}
              <g stroke="#15803d" strokeWidth="4.5" fill="none">
                <path d={`M 110 130 Q 110 ${130 - current.protectedHeight * 0.5} 110 ${130 - current.protectedHeight}`} />
              </g>

              {/* Lush Vibrant Green Leaves */}
              <g fill={current.protectedLeafColor} stroke="#166534" strokeWidth="1">
                <ellipse cx="90" cy={130 - current.protectedHeight * 0.3} rx="18" ry="6" transform={`rotate(-25 90 ${130 - current.protectedHeight * 0.3})`} />
                <ellipse cx="130" cy={130 - current.protectedHeight * 0.3} rx="18" ry="6" transform={`rotate(25 130 ${130 - current.protectedHeight * 0.3})`} />
                {stepIndex >= 1 && (
                  <>
                    <ellipse cx="85" cy={130 - current.protectedHeight * 0.6} rx="20" ry="7" transform={`rotate(-35 85 ${130 - current.protectedHeight * 0.6})`} />
                    <ellipse cx="135" cy={130 - current.protectedHeight * 0.6} rx="20" ry="7" transform={`rotate(35 135 ${130 - current.protectedHeight * 0.6})`} />
                  </>
                )}
                {stepIndex >= 2 && (
                  <>
                    <ellipse cx="90" cy={130 - current.protectedHeight * 0.85} rx="16" ry="6" transform={`rotate(-20 90 ${130 - current.protectedHeight * 0.85})`} />
                    <ellipse cx="130" cy={130 - current.protectedHeight * 0.85} rx="16" ry="6" transform={`rotate(20 130 ${130 - current.protectedHeight * 0.85})`} />
                  </>
                )}
              </g>

              {/* Robust Golden Pods / Grains at Maturity */}
              {stepIndex >= 2 && (
                <g fill="#eab308" stroke="#a16207" strokeWidth="1.2">
                  <circle cx="110" cy={130 - current.protectedHeight * 1.05} r="7" fill="#fbbf24" />
                  <circle cx="104" cy={130 - current.protectedHeight * 1.08} r="5" />
                  <circle cx="116" cy={130 - current.protectedHeight * 1.08} r="5" />
                  {stepIndex >= 3 && (
                    <text x="125" y={130 - current.protectedHeight * 1.05} fill="#15803d" fontSize="8" fontWeight="bold">Protected 🌾</text>
                  )}
                </g>
              )}
            </svg>
          </div>

          {/* Protected Diagnostic Status Card */}
          <div className="rounded-2xl bg-white/95 border border-emerald-300 p-3.5 space-y-2 z-10 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
              <span>Height: <strong>{current.protectedHeight} cm</strong></span>
              <span className="text-emerald-700 font-bold">Root: <strong>{current.protectedRoot} cm (Deep Water Access)</strong></span>
            </div>
            <p className="text-xs text-emerald-950 font-semibold leading-snug">
              {isHindi ? current.protectedStatusHi : current.protectedStatusEn}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
