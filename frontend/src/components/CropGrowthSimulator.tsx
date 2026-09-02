"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Play,
  Pause,
  ChevronRight,
  AlertTriangle,
  Layers,
  Activity,
  Award,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface StageMilestone {
  day: number;
  stageNameEn: string;
  stageNameHi: string;
  temperature: number;
  stressLevel: "Low" | "Moderate" | "Extreme";
  
  // Untreated side
  untreatedHeight: number; // cm
  untreatedRoot: number;   // cm
  untreatedHealth: number; // %
  untreatedRWC: number;    // % Relative Water Content
  untreatedSPAD: number;   // Chlorophyll index
  untreatedLeafTilt: number; // drooping degrees
  untreatedStatusEn: string;
  untreatedStatusHi: string;
  untreatedYieldLossEn: string;
  untreatedYieldLossHi: string;
  
  // Protected side
  protectedHeight: number; // cm
  protectedRoot: number;   // cm
  protectedHealth: number; // %
  protectedRWC: number;    // % Relative Water Content
  protectedSPAD: number;   // Chlorophyll index
  protectedLeafTilt: number; // turgid degrees
  protectedStatusEn: string;
  protectedStatusHi: string;
  protectedBenefitEn: string;
  protectedBenefitHi: string;
}

const MILESTONES: StageMilestone[] = [
  {
    day: 5,
    stageNameEn: "Emergence & Germination",
    stageNameHi: "अंकुरण व शुरुआती बढ़वार",
    temperature: 28,
    stressLevel: "Low",
    untreatedHeight: 8,
    untreatedRoot: 12,
    untreatedHealth: 92,
    untreatedRWC: 88,
    untreatedSPAD: 34,
    untreatedLeafTilt: 0,
    untreatedStatusEn: "Seedling emerges with shallow primary radicle.",
    untreatedStatusHi: "बीज से पहला अंकुर व सामान्य प्राथमिक जड़ निकली।",
    untreatedYieldLossEn: "Baseline standard emergence",
    untreatedYieldLossHi: "सामान्य शुरुआती अंकुरण",
    protectedHeight: 14,
    protectedRoot: 22,
    protectedHealth: 99,
    protectedRWC: 95,
    protectedSPAD: 42,
    protectedLeafTilt: -8,
    protectedStatusEn: "Vibrance® Trio seed treatment builds rapid root vigor and seedling armor.",
    protectedStatusHi: "Vibrance® Trio बीज उपचार से दोगुनी गहरी जड़ें व मजबूत अंकुर।",
    protectedBenefitEn: "+45% Faster root establishment",
    protectedBenefitHi: "+45% तेज जड़ विकास",
  },
  {
    day: 30,
    stageNameEn: "Vegetative & Canopy Expansion",
    stageNameHi: "वानस्पतिक शाखा विस्तार",
    temperature: 32,
    stressLevel: "Moderate",
    untreatedHeight: 34,
    untreatedRoot: 30,
    untreatedHealth: 72,
    untreatedRWC: 68,
    untreatedSPAD: 30,
    untreatedLeafTilt: 18,
    untreatedStatusEn: "Early dry spell restricts lateral branching; pale chlorophyll.",
    untreatedStatusHi: "नमी की कमी से पत्तियों में पीलापन व कमजोर जड़ फैलाव।",
    untreatedYieldLossEn: "-12% Biomass potential lost",
    untreatedYieldLossHi: "-12% बायोमास वृद्धि का नुकसान",
    protectedHeight: 52,
    protectedRoot: 56,
    protectedHealth: 96,
    protectedRWC: 92,
    protectedSPAD: 50,
    protectedLeafTilt: -15,
    protectedStatusEn: "Isabion® amino-acids supercharge lateral root branching and dense canopy.",
    protectedStatusHi: "Isabion® अमीनो-एसिड से 2 गुना घनी शाखाएं और गहरी जड़ें।",
    protectedBenefitEn: "+60% Lateral feeder root expansion",
    protectedBenefitHi: "+60% अधिक पोषक तत्व अवशोषण",
  },
  {
    day: 55,
    stageNameEn: "Flowering & Peak Heatwave Shock",
    stageNameHi: "फूल अवस्था व तीव्र लू तनाव (>37°C)",
    temperature: 38,
    stressLevel: "Extreme",
    untreatedHeight: 46,
    untreatedRoot: 36,
    untreatedHealth: 44,
    untreatedRWC: 48,
    untreatedSPAD: 22,
    untreatedLeafTilt: 38,
    untreatedStatusEn: "Severe heatwave (>37°C) triggers 42% flower abortion & severe chlorosis.",
    untreatedStatusHi: "भीषण लू (>37°C) से 42% फूल झड़े, पत्तियां झुलसीं व पौधे मुरझाए।",
    untreatedYieldLossEn: "-28% Floral floret abortion",
    untreatedYieldLossHi: "-28% फूलों का समय से पहले गिरना",
    protectedHeight: 74,
    protectedRoot: 78,
    protectedHealth: 94,
    protectedRWC: 86,
    protectedSPAD: 54,
    protectedLeafTilt: -18,
    protectedStatusEn: "Quantis® activates cellular heat-shock proteins; 100% pollination set.",
    protectedStatusHi: "Quantis® ने ऑस्मोलाइट ढाल बनाई; फूल 100% सुरक्षित व फली सेट।",
    protectedBenefitEn: "0% Heat floret drop; full pollination",
    protectedBenefitHi: "0% फूल गिरना; पूर्ण परागण सुरक्षा",
  },
  {
    day: 80,
    stageNameEn: "Pod & Grain Filling Stage",
    stageNameHi: "दाना भराव व फली परिपक्वता",
    temperature: 33,
    stressLevel: "Moderate",
    untreatedHeight: 48,
    untreatedRoot: 38,
    untreatedHealth: 36,
    untreatedRWC: 42,
    untreatedSPAD: 18,
    untreatedLeafTilt: 45,
    untreatedStatusEn: "Early leaf senescence; shriveled flat pods and low seed test weight.",
    untreatedStatusHi: "पत्तियां सूखीं; अधूरी भरी फली व सिकुड़ा हुआ दाना।",
    untreatedYieldLossEn: "-32% Reduced 1000-grain weight",
    untreatedYieldLossHi: "-32% दाने के वजन में भारी गिरावट",
    protectedHeight: 88,
    protectedRoot: 90,
    protectedHealth: 93,
    protectedRWC: 84,
    protectedSPAD: 48,
    protectedLeafTilt: -20,
    protectedStatusEn: "Stay-green chlorophyll retention powers bold, heavy 3-seeded pods.",
    protectedStatusHi: "पत्तियां हरी रहीं; चमकदार, भारी व भरा हुआ 3-दाने का मजबूत पॉड।",
    protectedBenefitEn: "+22% Higher test seed weight",
    protectedBenefitHi: "+22% भारी व चमकदार दाना",
  },
  {
    day: 100,
    stageNameEn: "Physiological Maturity & Harvest",
    stageNameHi: "पूर्ण परिपक्वता व कटाई उपज",
    temperature: 29,
    stressLevel: "Low",
    untreatedHeight: 50,
    untreatedRoot: 40,
    untreatedHealth: 28,
    untreatedRWC: 36,
    untreatedSPAD: 14,
    untreatedLeafTilt: 50,
    untreatedStatusEn: "-35% Yield loss: Stunted architecture failed to reach deep soil moisture.",
    untreatedStatusHi: "-35% उपज हानि: कमजोर जड़ें नीचे मौजूद पानी तक नहीं पहुंच सकीं।",
    untreatedYieldLossEn: "Net Yield: 15.2 Quintals/ha (-35%)",
    untreatedYieldLossHi: "अंतिम उपज: 15.2 क्विंटल/हेक्टेयर (भारी घाटा)",
    protectedHeight: 92,
    protectedRoot: 92,
    protectedHealth: 98,
    protectedRWC: 80,
    protectedSPAD: 46,
    protectedLeafTilt: -20,
    protectedStatusEn: "+24% Yield gain: Complete genetic yield unlocked with deep aquifer access.",
    protectedStatusHi: "+24% बंपर उपज: गहरी जड़ों ने अंतिम समय तक नमी व पोषण खींचा।",
    protectedBenefitEn: "Net Yield: 27.8 Quintals/ha (+24% Net Profit)",
    protectedBenefitHi: "अंतिम उपज: 27.8 क्विंटल/हेक्टेयर (+₹28,400 शुद्ध लाभ)",
  },
];

export const CropGrowthSimulator: React.FC = () => {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  const [currentDay, setCurrentDay] = useState<number>(55); // Default to peak comparison stage (Day 55 Heatwave)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Smooth continuous day interpolation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const loop = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = (time - lastTimeRef.current) / 1000;
        // 1 full 100-day cycle takes ~14 seconds at 1x
        const dayIncrement = (100 / 14) * delta * playbackSpeed;
        setCurrentDay((prev) => {
          const next = prev + dayIncrement;
          if (next >= 100) return 5; // Loop back smoothly
          return next;
        });
      }
      lastTimeRef.current = time;
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Interpolate botanical attributes based on exact currentDay
  const interpolated = useMemo(() => {
    const clampedDay = Math.min(100, Math.max(5, currentDay));
    let lower = MILESTONES[0];
    let upper = MILESTONES[MILESTONES.length - 1];

    for (let i = 0; i < MILESTONES.length - 1; i++) {
      if (clampedDay >= MILESTONES[i].day && clampedDay <= MILESTONES[i + 1].day) {
        lower = MILESTONES[i];
        upper = MILESTONES[i + 1];
        break;
      }
    }

    const span = upper.day - lower.day;
    const factor = span === 0 ? 0 : (clampedDay - lower.day) / span;

    const lerp = (a: number, b: number) => a + (b - a) * factor;

    // Closest milestone for discrete texts
    const activeMilestone = factor < 0.5 ? lower : upper;

    return {
      day: Math.round(clampedDay),
      milestone: activeMilestone,
      temp: Math.round(lerp(lower.temperature, upper.temperature)),
      
      // Untreated botanical stats
      uHeight: lerp(lower.untreatedHeight, upper.untreatedHeight),
      uRoot: lerp(lower.untreatedRoot, upper.untreatedRoot),
      uHealth: Math.round(lerp(lower.untreatedHealth, upper.untreatedHealth)),
      uRWC: Math.round(lerp(lower.untreatedRWC, upper.untreatedRWC)),
      uSPAD: Math.round(lerp(lower.untreatedSPAD, upper.untreatedSPAD)),
      uTilt: lerp(lower.untreatedLeafTilt, upper.untreatedLeafTilt),

      // Protected botanical stats
      pHeight: lerp(lower.protectedHeight, upper.protectedHeight),
      pRoot: lerp(lower.protectedRoot, upper.protectedRoot),
      pHealth: Math.round(lerp(lower.protectedHealth, upper.protectedHealth)),
      pRWC: Math.round(lerp(lower.protectedRWC, upper.protectedRWC)),
      pSPAD: Math.round(lerp(lower.protectedSPAD, upper.protectedSPAD)),
      pTilt: lerp(lower.protectedLeafTilt, upper.protectedLeafTilt),
    };
  }, [currentDay]);

  // Scaled coordinates for SVG rendering
  // Ground level is at Y = 185
  const GROUND_Y = 185;
  const STEM_BASE_X = 160;

  // Untreated plant coordinates
  const uStemHeightPx = (interpolated.uHeight / 100) * 130;
  const uStemApexY = GROUND_Y - uStemHeightPx;
  const uRootDepthPx = (interpolated.uRoot / 100) * 140;
  const uRootTipY = GROUND_Y + uRootDepthPx;

  // Protected plant coordinates
  const pStemHeightPx = (interpolated.pHeight / 100) * 145;
  const pStemApexY = GROUND_Y - pStemHeightPx;
  const pRootDepthPx = (interpolated.pRoot / 100) * 165;
  const pRootTipY = GROUND_Y + pRootDepthPx;

  return (
    <div className="rounded-3xl bg-white border border-[#e3e8ee] shadow-2xl p-4 sm:p-7 space-y-6 select-none font-sans">
      
      {/* ── 1. Header with Live Status & Time-Lapse Controls ────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-[#533afd] border border-indigo-200/80 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-[#533afd]" />
              <span>Biophysical Phenology Engine · 60 FPS</span>
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              interpolated.temp >= 36
                ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                : interpolated.temp >= 32
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              <Thermometer className="h-3.5 w-3.5" />
              <span>{interpolated.temp}°C {interpolated.temp >= 36 ? (isHindi ? "तीव्र लू तनाव" : "Severe Heatwave") : (isHindi ? "तापमान" : "Ambient")}</span>
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0d253d] font-display tracking-tight">
            {isHindi ? "पौधे का वास्तविक विकास व बायोस्टिमुलेंट रक्षा सिमुलेशन" : "Realistic Crop Growth & Biostimulant Protection Simulation"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {isHindi
              ? "देखें कि कैसे सिंजेंटा बायोस्टिमुलेंट (Quantis® + Isabion®) लू के दौरान कोशिकाओं में पानी बनाए रखते हैं और गहरी जड़ों द्वारा 90cm नीचे के भूजल तक पहुंचते हैं।"
              : "Botanically grounded time-lapse comparing untreated drought-shocked soybean against Syngenta biostimulant-protected crops with deep aquifer root access."}
          </p>
        </div>

        {/* Interactive Playback Toolbar */}
        <div className="flex items-center gap-2.5 bg-[#f6f9fc] border border-[#e3e8ee] p-2 sm:p-2.5 px-3.5 rounded-2xl shrink-0 self-start lg:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active-press shadow-xs ${
              isPlaying
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-[#533afd] hover:bg-[#4434d4] text-white"
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
            <span>{isPlaying ? (isHindi ? "रोकें" : "Pause") : (isHindi ? "चलाएं" : "Play")}</span>
          </button>

          <button
            type="button"
            onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
            className="px-2.5 py-2 rounded-xl bg-white border border-[#e3e8ee] hover:bg-slate-100 text-slate-700 font-mono font-bold text-xs cursor-pointer transition-all active-press"
            title="Toggle Simulation Speed"
          >
            {playbackSpeed}x Speed
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentDay(5);
              setIsPlaying(true);
            }}
            className="p-2 rounded-xl bg-white border border-[#e3e8ee] hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer active-press"
            title="Reset Simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <div className="h-6 w-[1px] bg-slate-200 mx-1" />

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">
              {isHindi ? "वर्तमान अवस्था" : "Current Day"}
            </span>
            <span className="text-sm font-black text-[#0d253d] font-mono">
              Day {interpolated.day} / 100
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Fluid Interactive Timeline Scrubber & Stage Jump Buttons ─────── */}
      <div className="space-y-2.5 bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-700">
          <span className="flex items-center gap-2">
            <Sprout className="h-4 w-4 text-emerald-600" />
            <span className="text-slate-900 font-display">
              {isHindi ? interpolated.milestone.stageNameHi : interpolated.milestone.stageNameEn}
            </span>
          </span>
          <span className="text-xs font-mono text-slate-500">
            Drag slider to scrub through any day: <strong className="text-[#533afd] font-bold">Day {interpolated.day}</strong>
          </span>
        </div>

        {/* Continuous Scrubbing Range Slider */}
        <input
          type="range"
          min={5}
          max={100}
          step={1}
          value={Math.round(currentDay)}
          onChange={(e) => {
            setCurrentDay(Number(e.target.value));
            setIsPlaying(false); // Pause on manual user drag
          }}
          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#533afd] focus:outline-none"
        />

        {/* 5 Quick-Jump Stage Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
          {MILESTONES.map((m) => {
            const isActive = Math.abs(currentDay - m.day) <= 12;
            return (
              <button
                key={m.day}
                type="button"
                onClick={() => {
                  setCurrentDay(m.day);
                  setIsPlaying(false);
                }}
                className={`py-1.5 px-2 rounded-xl text-left transition-all cursor-pointer border text-[11px] font-bold ${
                  isActive
                    ? "bg-[#533afd] text-white border-[#533afd] shadow-sm scale-[1.02]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="font-mono block text-[10px] opacity-80">Day {m.day}</span>
                <span className="truncate block font-display">
                  {m.day === 5 ? "Emergence" : m.day === 30 ? "Vegetative" : m.day === 55 ? "Heat Peak ☀️" : m.day === 80 ? "Grain Fill" : "Harvest 🌾"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Photorealistic Side-by-Side Plant Canvas ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ── LEFT: Untreated Baseline Crop (Heat Shocked & Drought Parched) ── */}
        <div className="rounded-3xl border-2 border-rose-200 bg-gradient-to-b from-rose-50/50 via-amber-50/20 to-amber-950/25 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden shadow-sm">
          
          {/* Top Pill & Diagnostic Indicator */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              <span>{isHindi ? "बिना सुरक्षा (पारंपरिक असुरक्षित फसल)" : "Without Syngenta (Untreated)"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Health:</span>
              <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg border ${
                interpolated.uHealth < 40 ? "bg-red-500 text-white border-red-600 animate-pulse" : "bg-white text-rose-700 border-rose-200"
              }`}>
                {interpolated.uHealth}%
              </span>
            </div>
          </div>

          {/* SVG Botanical Visualizer */}
          <div className="relative w-full flex items-center justify-center my-3 z-10" style={{ height: "360px" }}>
            <svg width="320" height="360" viewBox="0 0 320 360" className="overflow-visible">
              <defs>
                {/* Soil Stratum Gradients */}
                <linearGradient id="dryTopsoilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#92400e" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#78350f" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#451a03" stopOpacity="1" />
                </linearGradient>

                <linearGradient id="dryAquiferGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#451a03" />
                  <stop offset="100%" stopColor="#1c1917" />
                </linearGradient>

                {/* Untreated Sickly Stem Gradient */}
                <linearGradient id="sickStemGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ca8a04" />
                  <stop offset="70%" stopColor="#84cc16" />
                  <stop offset="100%" stopColor="#65a30d" />
                </linearGradient>

                {/* Chlorosis Wilted Leaf Gradient */}
                <linearGradient id="chlorosisLeafGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#78350f" />
                  <stop offset="40%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#84cc16" />
                </linearGradient>

                {/* Heat Distort Glow Filter */}
                <filter id="heatWaveFilter">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04 0.95" numOctaves="1" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>

              {/* ── Subsurface Soil Layers ─────────────────────────────── */}
              {/* Layer 1: Topsoil A-Horizon (0 - 35cm) */}
              <rect x="0" y={GROUND_Y} width="320" height="70" fill="url(#dryTopsoilGrad)" />
              {/* Layer 2: Deep Subsoil & Aquifer (35 - 100cm) */}
              <rect x="0" y={GROUND_Y + 70} width="320" height="105" fill="url(#dryAquiferGrad)" />

              {/* Parched drought cracks in topsoil under heat */}
              {interpolated.temp >= 32 && (
                <g stroke="#451a03" strokeWidth="1.2" opacity="0.6" fill="none">
                  <path d="M 30 188 L 45 200 L 40 215 L 55 225" />
                  <path d="M 120 186 L 130 198 L 125 210" />
                  <path d="M 230 187 L 245 195 L 240 212 L 255 220" />
                </g>
              )}

              {/* Ground Boundary Line with Measurements */}
              <line x1="0" y1={GROUND_Y} x2="320" y2={GROUND_Y} stroke="#b45309" strokeWidth="2.5" strokeDasharray="5 3" />
              <text x="10" y={GROUND_Y - 5} fill="#92400e" fontSize="9" fontFamily="monospace" fontWeight="bold">Surface 0cm</text>
              <text x="10" y={GROUND_Y + 65} fill="#a8a29e" fontSize="8" fontFamily="monospace">Hardpan -35cm</text>
              <text x="10" y={GROUND_Y + 160} fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">Roots -{Math.round(interpolated.uRoot)}cm (Shallow)</text>

              {/* ── Untreated Stunted Roots (Fails to penetrate deep soil) ── */}
              <g stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9">
                {/* Main stunted taproot */}
                <path d={`M ${STEM_BASE_X} ${GROUND_Y} Q ${STEM_BASE_X + 4} ${GROUND_Y + uRootDepthPx * 0.5} ${STEM_BASE_X} ${uRootTipY}`} />
                {/* Shallow lateral root branches (withered & dry) */}
                <path d={`M ${STEM_BASE_X} ${GROUND_Y + 15} Q ${STEM_BASE_X - 25} ${GROUND_Y + 30} ${STEM_BASE_X - 45} ${GROUND_Y + uRootDepthPx * 0.7}`} strokeWidth="1.6" />
                <path d={`M ${STEM_BASE_X} ${GROUND_Y + 20} Q ${STEM_BASE_X + 25} ${GROUND_Y + 35} ${STEM_BASE_X + 40} ${GROUND_Y + uRootDepthPx * 0.7}`} strokeWidth="1.6" />
                <path d={`M ${STEM_BASE_X} ${GROUND_Y + 35} Q ${STEM_BASE_X - 15} ${GROUND_Y + 50} ${STEM_BASE_X - 25} ${uRootTipY - 5}`} strokeWidth="1.2" />
                <path d={`M ${STEM_BASE_X} ${GROUND_Y + 40} Q ${STEM_BASE_X + 18} ${GROUND_Y + 55} ${STEM_BASE_X + 30} ${uRootTipY - 5}`} strokeWidth="1.2" />
              </g>

              {/* Heat Distortion Waves Above Canopy during Heatwave */}
              {interpolated.temp >= 36 && (
                <g opacity="0.4" stroke="#f59e0b" strokeWidth="1.5" fill="none">
                  <path d="M 120 40 Q 140 25 160 40 T 200 40" filter="url(#heatWaveFilter)" />
                  <path d="M 130 60 Q 150 45 170 60 T 210 60" filter="url(#heatWaveFilter)" />
                  <text x="185" y="35" fill="#dc2626" fontSize="9" fontWeight="bold" fontFamily="monospace">38°C HEAT STRESS ☀️</text>
                </g>
              )}

              {/* ── Above Ground: Stunted, Drooping Stem ────────────────── */}
              <g stroke="url(#sickStemGrad)" fill="none" strokeLinecap="round">
                {/* Stem curves sideways/droops under heat turgor loss */}
                <path
                  d={`M ${STEM_BASE_X} ${GROUND_Y} Q ${STEM_BASE_X + (interpolated.temp >= 32 ? 14 : 2)} ${GROUND_Y - uStemHeightPx * 0.5} ${STEM_BASE_X + (interpolated.temp >= 32 ? 22 : 0)} ${uStemApexY}`}
                  strokeWidth={interpolated.day > 40 ? "4" : "3"}
                />
              </g>

              {/* ── Realistic Foliage: Drooping Chlorosis Leaves ──────────── */}
              <g>
                {/* Node 1 Leaves (Lower Canopy) */}
                {interpolated.day >= 15 && (
                  <g transform={`translate(${STEM_BASE_X + 5}, ${GROUND_Y - uStemHeightPx * 0.3})`}>
                    {/* Left Drooping Leaf */}
                    <g transform={`rotate(${35 + interpolated.uTilt})`}>
                      <path
                        d="M 0 0 C -12 -8, -24 -6, -34 0 C -24 10, -12 8, 0 0 Z"
                        fill="url(#chlorosisLeafGrad)"
                        stroke="#78350f"
                        strokeWidth="0.8"
                      />
                      <line x1="0" y1="0" x2="-32" y2="0" stroke="#713f12" strokeWidth="0.6" opacity="0.7" />
                    </g>
                    {/* Right Drooping Leaf */}
                    <g transform={`rotate(${-20 + interpolated.uTilt * 0.8})`}>
                      <path
                        d="M 0 0 C 12 -8, 24 -6, 34 0 C 24 10, 12 8, 0 0 Z"
                        fill="url(#chlorosisLeafGrad)"
                        stroke="#78350f"
                        strokeWidth="0.8"
                      />
                      <line x1="0" y1="0" x2="32" y2="0" stroke="#713f12" strokeWidth="0.6" opacity="0.7" />
                    </g>
                  </g>
                )}

                {/* Node 2 Leaves (Mid Canopy) */}
                {interpolated.day >= 30 && (
                  <g transform={`translate(${STEM_BASE_X + 12}, ${GROUND_Y - uStemHeightPx * 0.6})`}>
                    <g transform={`rotate(${40 + interpolated.uTilt})`}>
                      <path
                        d="M 0 0 C -14 -9, -28 -7, -38 0 C -28 12, -14 9, 0 0 Z"
                        fill="url(#chlorosisLeafGrad)"
                        stroke="#78350f"
                        strokeWidth="0.8"
                      />
                      <line x1="0" y1="0" x2="-36" y2="0" stroke="#713f12" strokeWidth="0.6" opacity="0.7" />
                    </g>
                    <g transform={`rotate(${-15 + interpolated.uTilt})`}>
                      <path
                        d="M 0 0 C 14 -9, 28 -7, 38 0 C 28 12, 14 9, 0 0 Z"
                        fill="url(#chlorosisLeafGrad)"
                        stroke="#78350f"
                        strokeWidth="0.8"
                      />
                      <line x1="0" y1="0" x2="36" y2="0" stroke="#713f12" strokeWidth="0.6" opacity="0.7" />
                    </g>
                  </g>
                )}

                {/* Node 3 Leaves (Upper Canopy) */}
                {interpolated.day >= 50 && (
                  <g transform={`translate(${STEM_BASE_X + 18}, ${GROUND_Y - uStemHeightPx * 0.85})`}>
                    <g transform={`rotate(${30 + interpolated.uTilt * 0.7})`}>
                      <path
                        d="M 0 0 C -10 -7, -22 -5, -30 0 C -22 9, -10 7, 0 0 Z"
                        fill="url(#chlorosisLeafGrad)"
                        stroke="#78350f"
                        strokeWidth="0.8"
                      />
                    </g>
                    <g transform={`rotate(${-25 + interpolated.uTilt * 0.7})`}>
                      <path
                        d="M 0 0 C 10 -7, 22 -5, 30 0 C 22 9, 10 7, 0 0 Z"
                        fill="url(#chlorosisLeafGrad)"
                        stroke="#78350f"
                        strokeWidth="0.8"
                      />
                    </g>
                  </g>
                )}
              </g>

              {/* Heat Stress: Aborted Flowers dropping to ground */}
              {interpolated.day >= 45 && interpolated.day <= 75 && (
                <g>
                  <circle cx={STEM_BASE_X + 22} cy={GROUND_Y - uStemHeightPx * 0.75} r="3.5" fill="#f43f5e" opacity="0.5" />
                  {/* Dropped withered floret on ground */}
                  <circle cx={STEM_BASE_X - 25} cy={GROUND_Y - 4} r="3" fill="#881337" opacity="0.8" />
                  <circle cx={STEM_BASE_X + 35} cy={GROUND_Y - 3} r="2.5" fill="#881337" opacity="0.8" />
                  <text x={STEM_BASE_X + 28} y={GROUND_Y - 12} fill="#ef4444" fontSize="8" fontWeight="bold">Flower Drop 🥀</text>
                </g>
              )}

              {/* Shrivelled Pods at maturity */}
              {interpolated.day >= 75 && (
                <g fill="#ca8a04" stroke="#78350f" strokeWidth="0.8">
                  <path d={`M ${STEM_BASE_X + 18} ${GROUND_Y - uStemHeightPx * 0.7} Q ${STEM_BASE_X + 30} ${GROUND_Y - uStemHeightPx * 0.65} ${STEM_BASE_X + 28} ${GROUND_Y - uStemHeightPx * 0.55}`} strokeWidth="3" fill="none" stroke="#ca8a04" />
                  <text x={STEM_BASE_X + 32} y={GROUND_Y - uStemHeightPx * 0.6} fill="#b45309" fontSize="8" fontWeight="bold">Flat Pods</text>
                </g>
              )}
            </svg>
          </div>

          {/* Untreated Live Diagnostic Readouts */}
          <div className="rounded-2xl bg-white/95 border border-rose-200 p-3.5 space-y-2 z-10 shadow-xs">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-rose-50/70 p-1.5 rounded-xl border border-rose-100">
                <span className="text-[10px] text-slate-500 block">CANOPY</span>
                <strong className="text-slate-800">{Math.round(interpolated.uHeight)} cm</strong>
              </div>
              <div className="bg-rose-50/70 p-1.5 rounded-xl border border-rose-100">
                <span className="text-[10px] text-slate-500 block">ROOT DEPTH</span>
                <strong className="text-rose-700">{Math.round(interpolated.uRoot)} cm</strong>
              </div>
              <div className="bg-rose-50/70 p-1.5 rounded-xl border border-rose-100">
                <span className="text-[10px] text-slate-500 block">CHLOROPHYLL</span>
                <strong className="text-amber-700">{interpolated.uSPAD} SPAD</strong>
              </div>
            </div>

            <div className="pt-1 text-xs text-rose-950 font-medium">
              <span className="font-bold text-rose-800 block">
                {isHindi ? interpolated.milestone.untreatedYieldLossHi : interpolated.milestone.untreatedYieldLossEn}
              </span>
              <span className="text-slate-600 text-[11px] leading-tight block mt-0.5">
                {isHindi ? interpolated.milestone.untreatedStatusHi : interpolated.milestone.untreatedStatusEn}
              </span>
            </div>
          </div>

        </div>

        {/* ── RIGHT: Syngenta Biostimulant Protected Crop (Lush & Deep Roots) ── */}
        <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-50/60 via-teal-50/30 to-amber-950/25 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-emerald-500/10">
          
          {/* Top Pill & Diagnostic Indicator */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white shadow-xs text-xs font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{isHindi ? "सिंजेंटा सुरक्षा (Quantis® + Isabion®)" : "With Syngenta (Quantis® Protected)"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Health:</span>
              <span className="text-xs font-mono font-black text-emerald-800 bg-white/95 px-2.5 py-0.5 rounded-lg border border-emerald-300 shadow-2xs">
                {interpolated.pHealth}% Optimal
              </span>
            </div>
          </div>

          {/* SVG Botanical Visualizer */}
          <div className="relative w-full flex items-center justify-center my-3 z-10" style={{ height: "360px" }}>
            <svg width="320" height="360" viewBox="0 0 320 360" className="overflow-visible">
              <defs>
                {/* Lush Healthy Stem Gradient */}
                <linearGradient id="healthyStemGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#15803d" />
                  <stop offset="50%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#14532d" />
                </linearGradient>

                {/* Lush Chlorophyll Rich Leaf Gradient */}
                <linearGradient id="healthyLeafGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#047857" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>

                {/* Subterranean Moist Aquifer Gradient (Deep Blue-Green Table) */}
                <linearGradient id="richAquiferGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b200b" />
                  <stop offset="40%" stopColor="#1e3a8a" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
                </linearGradient>

                {/* Quantis Cellular Protection Osmolyte Glow */}
                <radialGradient id="quantisGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#059669" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* ── Subsurface Soil Layers ─────────────────────────────── */}
              {/* Layer 1: Topsoil A-Horizon (0 - 35cm) */}
              <rect x="0" y={GROUND_Y} width="320" height="70" fill="url(#dryTopsoilGrad)" />
              {/* Layer 2: Deep Capillary Fringe & Aquifer (35 - 100cm) */}
              <rect x="0" y={GROUND_Y + 70} width="320" height="105" fill="url(#richAquiferGrad)" />

              {/* Ground Boundary Line with Measurements */}
              <line x1="0" y1={GROUND_Y} x2="320" y2={GROUND_Y} stroke="#15803d" strokeWidth="2.5" strokeDasharray="5 3" />
              <text x="10" y={GROUND_Y - 5} fill="#14532d" fontSize="9" fontFamily="monospace" fontWeight="bold">Surface 0cm</text>
              <text x="10" y={GROUND_Y + 65} fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">Capillary Aquifer -40cm 💧</text>
              <text x="10" y={GROUND_Y + 160} fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="bold">Roots -{Math.round(interpolated.pRoot)}cm (Deep Aquifer)</text>

              {/* Quantis Cellular Osmoprotectant Shield Halo around canopy */}
              <ellipse
                cx={STEM_BASE_X}
                cy={pStemApexY + pStemHeightPx * 0.45}
                rx="85"
                ry={pStemHeightPx * 0.55 + 15}
                fill="url(#quantisGlow)"
                className="animate-pulse"
              />

              {/* Floating Osmolyte Shield Molecules (Proline & Glycine Betaine) */}
              {interpolated.temp >= 32 && (
                <g>
                  <circle cx={STEM_BASE_X - 55} cy={pStemApexY + 20} r="3" fill="#6ee7b7" opacity="0.85" />
                  <circle cx={STEM_BASE_X + 55} cy={pStemApexY + 40} r="3" fill="#6ee7b7" opacity="0.85" />
                  <circle cx={STEM_BASE_X - 35} cy={pStemApexY + 65} r="2.5" fill="#a7f3d0" opacity="0.75" />
                  <circle cx={STEM_BASE_X + 40} cy={pStemApexY + 80} r="2.5" fill="#a7f3d0" opacity="0.75" />
                  <text x={STEM_BASE_X - 75} y={pStemApexY - 8} fill="#047857" fontSize="8" fontWeight="bold" fontFamily="monospace">
                    Quantis® Shield (Active) 🛡️
                  </text>
                </g>
              )}

              {/* ── Protected Deep Fibrous Taproot System ───────────────── */}
              {/* Driven down deep into the blue water table! */}
              <g stroke="#78350f" strokeLinecap="round" fill="none">
                {/* Thick Primary Taproot */}
                <path
                  d={`M ${STEM_BASE_X} ${GROUND_Y} Q ${STEM_BASE_X - 2} ${GROUND_Y + pRootDepthPx * 0.5} ${STEM_BASE_X} ${pRootTipY}`}
                  strokeWidth="3.2"
                />

                {/* Dense Lateral Feeder Roots drinking from the Aquifer */}
                <path d={`M ${STEM_BASE_X} ${GROUND_Y + 18} Q ${STEM_BASE_X - 35} ${GROUND_Y + 40} ${STEM_BASE_X - 60} ${GROUND_Y + pRootDepthPx * 0.6}`} strokeWidth="2" stroke="#854d0e" />
                <path d={`M ${STEM_BASE_X} ${GROUND_Y + 25} Q ${STEM_BASE_X + 35} ${GROUND_Y + 45} ${STEM_BASE_X + 65} ${GROUND_Y + pRootDepthPx * 0.6}`} strokeWidth="2" stroke="#854d0e" />
                <path d={`M ${STEM_BASE_X} ${GROUND_Y + 45} Q ${STEM_BASE_X - 45} ${GROUND_Y + 85} ${STEM_BASE_X - 55} ${pRootTipY - 15}`} strokeWidth="1.8" stroke="#a16207" />
                <path d={`M ${STEM_BASE_X} ${GROUND_Y + 55} Q ${STEM_BASE_X + 45} ${GROUND_Y + 95} ${STEM_BASE_X + 58} ${pRootTipY - 15}`} strokeWidth="1.8" stroke="#a16207" />
                
                {/* Deep water intake roots piercing -90cm blue layer */}
                {interpolated.day >= 30 && (
                  <>
                    <path d={`M ${STEM_BASE_X} ${GROUND_Y + 90} Q ${STEM_BASE_X - 25} ${pRootTipY - 10} ${STEM_BASE_X - 35} ${pRootTipY}`} strokeWidth="1.5" stroke="#38bdf8" />
                    <path d={`M ${STEM_BASE_X} ${GROUND_Y + 95} Q ${STEM_BASE_X + 25} ${pRootTipY - 10} ${STEM_BASE_X + 35} ${pRootTipY}`} strokeWidth="1.5" stroke="#38bdf8" />
                    
                    {/* Animated water flow intake particles along root */}
                    <circle cx={STEM_BASE_X - 30} cy={pRootTipY - 5} r="2" fill="#38bdf8" className="animate-ping" />
                    <circle cx={STEM_BASE_X + 30} cy={pRootTipY - 5} r="2" fill="#38bdf8" className="animate-ping" />
                  </>
                )}
              </g>

              {/* ── Above Ground: Sturdy Upright Stem ───────────────────── */}
              <g stroke="url(#healthyStemGrad)" fill="none" strokeLinecap="round">
                <path
                  d={`M ${STEM_BASE_X} ${GROUND_Y} Q ${STEM_BASE_X} ${GROUND_Y - pStemHeightPx * 0.5} ${STEM_BASE_X} ${pStemApexY}`}
                  strokeWidth={interpolated.day > 40 ? "5.5" : "4"}
                />
              </g>

              {/* ── Realistic Trifoliate Lush Canopy ─────────────────────── */}
              <g>
                {/* Tier 1 Leaves (Lower Canopy) */}
                {interpolated.day >= 12 && (
                  <g transform={`translate(${STEM_BASE_X}, ${GROUND_Y - pStemHeightPx * 0.28})`}>
                    <g transform={`rotate(${-28 + interpolated.pTilt * 0.5})`}>
                      <path
                        d="M 0 0 C -14 -12, -28 -10, -42 0 C -28 14, -14 12, 0 0 Z"
                        fill="url(#healthyLeafGrad)"
                        stroke="#064e3b"
                        strokeWidth="1"
                      />
                      <line x1="0" y1="0" x2="-40" y2="0" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.6" />
                    </g>
                    <g transform={`rotate(${28 - interpolated.pTilt * 0.5})`}>
                      <path
                        d="M 0 0 C 14 -12, 28 -10, 42 0 C 28 14, 14 12, 0 0 Z"
                        fill="url(#healthyLeafGrad)"
                        stroke="#064e3b"
                        strokeWidth="1"
                      />
                      <line x1="0" y1="0" x2="40" y2="0" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.6" />
                    </g>
                  </g>
                )}

                {/* Tier 2 Leaves (Mid Canopy) */}
                {interpolated.day >= 25 && (
                  <g transform={`translate(${STEM_BASE_X}, ${GROUND_Y - pStemHeightPx * 0.55})`}>
                    <g transform={`rotate(${-35 + interpolated.pTilt * 0.5})`}>
                      <path
                        d="M 0 0 C -16 -14, -32 -12, -48 0 C -32 16, -16 14, 0 0 Z"
                        fill="url(#healthyLeafGrad)"
                        stroke="#064e3b"
                        strokeWidth="1"
                      />
                      <line x1="0" y1="0" x2="-46" y2="0" stroke="#a7f3d0" strokeWidth="0.9" opacity="0.6" />
                    </g>
                    <g transform={`rotate(${35 - interpolated.pTilt * 0.5})`}>
                      <path
                        d="M 0 0 C 16 -14, 32 -12, 48 0 C 32 16, 16 14, 0 0 Z"
                        fill="url(#healthyLeafGrad)"
                        stroke="#064e3b"
                        strokeWidth="1"
                      />
                      <line x1="0" y1="0" x2="46" y2="0" stroke="#a7f3d0" strokeWidth="0.9" opacity="0.6" />
                    </g>
                  </g>
                )}

                {/* Tier 3 Leaves (Upper Canopy) */}
                {interpolated.day >= 45 && (
                  <g transform={`translate(${STEM_BASE_X}, ${GROUND_Y - pStemHeightPx * 0.8})`}>
                    <g transform={`rotate(${-25 + interpolated.pTilt * 0.4})`}>
                      <path
                        d="M 0 0 C -12 -10, -26 -8, -38 0 C -26 12, -12 10, 0 0 Z"
                        fill="url(#healthyLeafGrad)"
                        stroke="#064e3b"
                        strokeWidth="1"
                      />
                      <line x1="0" y1="0" x2="-36" y2="0" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.6" />
                    </g>
                    <g transform={`rotate(${25 - interpolated.pTilt * 0.4})`}>
                      <path
                        d="M 0 0 C 12 -10, 26 -8, 38 0 C 26 12, 12 10, 0 0 Z"
                        fill="url(#healthyLeafGrad)"
                        stroke="#064e3b"
                        strokeWidth="1"
                      />
                      <line x1="0" y1="0" x2="36" y2="0" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.6" />
                    </g>
                    {/* Central Terminal Leaflet */}
                    <g transform="rotate(-90)">
                      <path
                        d="M 0 0 C -10 -9, -20 -7, -32 0 C -20 10, -10 9, 0 0 Z"
                        fill="url(#healthyLeafGrad)"
                        stroke="#064e3b"
                        strokeWidth="1"
                      />
                    </g>
                  </g>
                )}
              </g>

              {/* Blooming Protected Flowers at Day 55 */}
              {interpolated.day >= 45 && interpolated.day <= 70 && (
                <g fill="#c084fc" stroke="#7e22ce" strokeWidth="0.8">
                  <circle cx={STEM_BASE_X - 10} cy={GROUND_Y - pStemHeightPx * 0.65} r="4.5" fill="#e879f9" />
                  <circle cx={STEM_BASE_X + 10} cy={GROUND_Y - pStemHeightPx * 0.65} r="4.5" fill="#e879f9" />
                  <circle cx={STEM_BASE_X - 6} cy={GROUND_Y - pStemHeightPx * 0.85} r="4" fill="#fae8ff" />
                  <circle cx={STEM_BASE_X + 6} cy={GROUND_Y - pStemHeightPx * 0.85} r="4" fill="#fae8ff" />
                  <text x={STEM_BASE_X + 16} y={GROUND_Y - pStemHeightPx * 0.65} fill="#15803d" fontSize="8" fontWeight="bold">100% Set 🌸</text>
                </g>
              )}

              {/* Plump Heavy 3-Seeded Pods at Maturity */}
              {interpolated.day >= 70 && (
                <g fill="#fbbf24" stroke="#a16207" strokeWidth="1">
                  {/* Pod Cluster 1 */}
                  <path d={`M ${STEM_BASE_X - 8} ${GROUND_Y - pStemHeightPx * 0.6} Q ${STEM_BASE_X - 28} ${GROUND_Y - pStemHeightPx * 0.55} ${STEM_BASE_X - 22} ${GROUND_Y - pStemHeightPx * 0.45}`} strokeWidth="4.5" fill="none" stroke="#fbbf24" strokeLinecap="round" />
                  {/* Pod Cluster 2 */}
                  <path d={`M ${STEM_BASE_X + 8} ${GROUND_Y - pStemHeightPx * 0.6} Q ${STEM_BASE_X + 28} ${GROUND_Y - pStemHeightPx * 0.55} ${STEM_BASE_X + 22} ${GROUND_Y - pStemHeightPx * 0.45}`} strokeWidth="4.5" fill="none" stroke="#fbbf24" strokeLinecap="round" />
                  {/* Pod Cluster 3 (Upper) */}
                  <path d={`M ${STEM_BASE_X - 6} ${GROUND_Y - pStemHeightPx * 0.75} Q ${STEM_BASE_X - 24} ${GROUND_Y - pStemHeightPx * 0.72} ${STEM_BASE_X - 18} ${GROUND_Y - pStemHeightPx * 0.65}`} strokeWidth="4.5" fill="none" stroke="#fbbf24" strokeLinecap="round" />
                  
                  <text x={STEM_BASE_X + 26} y={GROUND_Y - pStemHeightPx * 0.52} fill="#15803d" fontSize="8" fontWeight="bold">Bold 3-Seed Pods 🌾</text>
                </g>
              )}
            </svg>
          </div>

          {/* Protected Live Diagnostic Readouts */}
          <div className="rounded-2xl bg-white/95 border border-emerald-300 p-3.5 space-y-2 z-10 shadow-xs">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">CANOPY</span>
                <strong className="text-emerald-950 font-bold">{Math.round(interpolated.pHeight)} cm</strong>
              </div>
              <div className="bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">ROOT DEPTH</span>
                <strong className="text-emerald-700 font-bold">{Math.round(interpolated.pRoot)} cm (Aquifer)</strong>
              </div>
              <div className="bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">CHLOROPHYLL</span>
                <strong className="text-emerald-700 font-bold">{interpolated.pSPAD} SPAD</strong>
              </div>
            </div>

            <div className="pt-1 text-xs text-emerald-950 font-medium">
              <span className="font-bold text-emerald-800 block">
                {isHindi ? interpolated.milestone.protectedBenefitHi : interpolated.milestone.protectedBenefitEn}
              </span>
              <span className="text-slate-600 text-[11px] leading-tight block mt-0.5">
                {isHindi ? interpolated.milestone.protectedStatusHi : interpolated.milestone.protectedStatusEn}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ── 4. Biophysical Agronomic Breakdown Card ─────────────────────────── */}
      <div className="bg-[#f8fafc] border border-[#e3e8ee] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#533afd]" />
            <span className="text-xs font-bold text-[#0d253d] uppercase font-mono">
              {isHindi ? "सिंजेंटा बायोस्टिमुलेंट क्रियाविधि (Mode of Action)" : "Syngenta Biostimulant Mode of Action"}
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            {isHindi
              ? "Quantis® पौधे की कोशिकाओं में ऑस्मोलाइट (प्रोलाइन व पोटैशियम) का स्तर बढ़ाकर 38°C तक गर्मी में रूबिस्को एंजाइम को सक्रिय रखता है। वहीं Vibrance® Trio और Isabion® जड़ों का पृष्ठीय क्षेत्रफल 180% बढ़ाते हैं जिससे पौधा 90 सेमी गहरे भूजल तक पहुंचता है।"
              : "Quantis® up-regulates heat-shock proteins (HSPs) and cellular osmolytes, sustaining rubisco photosynthesis under 38°C heatwaves. Concurrently, Vibrance® Trio and Isabion® increase root absorptive surface area by 180%, tapping deep subsoil aquifers."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
              {isHindi ? "शुद्ध उपज लाभ" : "ROBI Yield Benefit"}
            </span>
            <span className="text-base font-black text-emerald-600 font-mono">
              +24% Net Harvest
            </span>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-xs">
            🌾
          </div>
        </div>
      </div>

    </div>
  );
};
