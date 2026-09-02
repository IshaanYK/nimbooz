"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  Wind,
  Droplets,
  TrendingUp,
  Mic,
  LayoutDashboard,
  Leaf,
  BarChart2,
  ShieldCheck,
  Sparkles,
  CloudRain,
  Store,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Camera,
  RefreshCw,
  Activity,
  Zap,
  MapPin,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PhoneMockupProps {
  location?: string;
  temperature?: number;
  crop?: string;
  mandiPrice?: number;
}

const TABS: Array<"home" | "crop" | "voice" | "mandi" | "weather"> = [
  "home",
  "crop",
  "voice",
  "mandi",
  "weather",
];

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  location,
  temperature = 28,
  crop,
  mandiPrice = 2420,
}) => {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  const [activeTab, setActiveTab] = useState<"home" | "crop" | "voice" | "mandi" | "weather">("home");
  const [selectedCrop, setSelectedCrop] = useState<string>("wheat");
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);

  // ── 1. Automatic Working Phone Cycle (4.5s per scene) ─────────────────
  useEffect(() => {
    const delay = userInteracted ? 9000 : 4500;
    const timer = setTimeout(() => {
      setUserInteracted(false);
      setActiveTab((prev) => {
        const nextIdx = (TABS.indexOf(prev) + 1) % TABS.length;
        return TABS[nextIdx];
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [activeTab, userInteracted]);

  // ── 2. Real-time Clock ───────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState<string>("09:41");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── 3. Fluctuating Temperature Telemetry (28.0°C to 28.4°C) ──────────
  const [liveTemp, setLiveTemp] = useState<number>(temperature);
  useEffect(() => {
    const tempInterval = setInterval(() => {
      setLiveTemp(+(temperature + (Math.random() * 0.4 - 0.2)).toFixed(1));
    }, 3500);
    return () => clearInterval(tempInterval);
  }, [temperature]);

  // ── 4. Auto Scanner Loop on Crop tab ─────────────────────────────────
  useEffect(() => {
    if (activeTab === "crop") {
      setIsScanning(true);
      const timer = setTimeout(() => setIsScanning(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // ── 5. Auto Mandi Crop Cycle ─────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "mandi") {
      const crops = ["wheat", "soybean", "mustard", "cotton"];
      let cropIdx = 0;
      const cInterval = setInterval(() => {
        cropIdx = (cropIdx + 1) % crops.length;
        setSelectedCrop(crops[cropIdx]);
      }, 2000);
      return () => clearInterval(cInterval);
    }
  }, [activeTab]);

  // ── 6. Voice speech wave animation ───────────────────────────────────
  useEffect(() => {
    if (activeTab === "voice") {
      setIsSpeaking(true);
    } else {
      setIsSpeaking(false);
    }
  }, [activeTab]);

  const handleManualTabChange = (tab: "home" | "crop" | "voice" | "mandi" | "weather") => {
    setUserInteracted(true);
    setActiveTab(tab);
  };

  const mandiDataMap: Record<
    string,
    { name: string; nameHi: string; modal: number; min: number; max: number; delta: string }
  > = {
    wheat: { name: "Sharbati Wheat", nameHi: "शरबती गेहूं", modal: 2420, min: 2180, max: 2540, delta: "+₹65" },
    soybean: { name: "Yellow Soybean", nameHi: "पीला सोयाबीन", modal: 4650, min: 4200, max: 4850, delta: "+₹120" },
    mustard: { name: "Black Mustard", nameHi: "काली सरसों", modal: 5620, min: 5100, max: 5800, delta: "+₹85" },
    cotton: { name: "Medium Staple Cotton", nameHi: "कपास", modal: 7150, min: 6700, max: 7400, delta: "+₹150" },
  };

  const currentMandi = mandiDataMap[selectedCrop] || mandiDataMap.wheat;
  const defaultLocation = isHindi ? "सीहोर (भोपाल), मध्य प्रदेश" : "Sehore (Bhopal), Madhya Pradesh";
  const displayLocation = location || defaultLocation;

  return (
    <div className="relative mx-auto select-none flex items-center justify-center">
      
      {/* ── Atmospheric Ambient Backdrop Glow ───────────────────────── */}
      <div
        className="absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #533afd 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)" }}
      />

      {/* ── DYNAMIC 3D FLOATING POPUPS EMERGING ON TAB TRANSITIONS ──── */}
      
      {/* 1. Dashboard Active Popup (Top Right) */}
      <div
        className={`absolute -top-3 -right-8 sm:-right-14 z-30 transition-all duration-500 ease-out pointer-events-none ${
          activeTab === "home" ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-90"
        }`}
      >
        <div className="px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200/90 shadow-xl flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-bold text-emerald-950 font-mono">
            {isHindi ? "स्प्रे विंडो अनुकूल (11 km/h)" : "Safe Spray Window Active"}
          </span>
        </div>
      </div>

      {/* 2. Crop AI Active Popup (Top Left) */}
      <div
        className={`absolute top-28 -left-10 sm:-left-16 z-30 transition-all duration-500 ease-out pointer-events-none ${
          activeTab === "crop" ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-3 scale-90"
        }`}
      >
        <div className="px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-indigo-200/90 shadow-xl flex items-center gap-2">
          <span className="text-sm">🍃</span>
          <div className="text-left">
            <span className="text-[10px] font-bold text-indigo-950 block leading-tight">
              {isHindi ? "98.6% पीला रतुआ पहचान" : "98.6% Yellow Rust Match"}
            </span>
            <span className="text-[8px] text-slate-500 font-mono">Gemini 2.5 Vision</span>
          </div>
        </div>
      </div>

      {/* 3. Voice AI Active Popup (Bottom Right) */}
      <div
        className={`absolute bottom-24 -right-10 sm:-right-16 z-30 transition-all duration-500 ease-out pointer-events-none ${
          activeTab === "voice" ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-3 scale-90"
        }`}
      >
        <div className="px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-purple-200/90 shadow-xl flex items-center gap-2">
          <span className="text-sm">🎙️</span>
          <div className="text-left">
            <span className="text-[10px] font-bold text-purple-950 block leading-tight">
              {isHindi ? "12 भारतीय भाषाएं" : "12 Indian Languages"}
            </span>
            <span className="text-[8px] text-slate-500 font-mono">Chirp 3 HD Audio</span>
          </div>
        </div>
      </div>

      {/* 4. Mandi Active Popup (Top Right) */}
      <div
        className={`absolute top-36 -right-10 sm:-right-16 z-30 transition-all duration-500 ease-out pointer-events-none ${
          activeTab === "mandi" ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-3 scale-90"
        }`}
      >
        <div className="px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200/90 shadow-xl flex items-center gap-2">
          <span className="text-sm">🌾</span>
          <div className="text-left">
            <span className="text-[10px] font-bold text-amber-950 block leading-tight">
              {isHindi ? "सीहोर भाव +₹65 ▲" : "Sehore Rate +₹65 ▲"}
            </span>
            <span className="text-[8px] text-slate-500 font-mono">₹2,420 / quintal</span>
          </div>
        </div>
      </div>

      {/* 5. Weather Active Popup (Top Left) */}
      <div
        className={`absolute top-20 -left-10 sm:-left-16 z-30 transition-all duration-500 ease-out pointer-events-none ${
          activeTab === "weather" ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-3 scale-90"
        }`}
      >
        <div className="px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-sky-200/90 shadow-xl flex items-center gap-2">
          <span className="text-sm">☀️</span>
          <div className="text-left">
            <span className="text-[10px] font-bold text-sky-950 block leading-tight">
              {isHindi ? "14-दिन सूक्ष्म पूर्वानुमान" : "14-Day Micro-Radar"}
            </span>
            <span className="text-[8px] text-slate-500 font-mono">Open-Meteo Ingest</span>
          </div>
        </div>
      </div>

      {/* ── Apple iPhone 16 Pro Max Titanium Chassis ─────────────────── */}
      <div
        className="relative rounded-[3.2rem] p-2 bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950 shadow-[0_25px_60px_-15px_rgba(83,58,253,0.35),0_0_0_1px_rgba(255,255,255,0.15)]"
        style={{ width: "330px", maxWidth: "100%" }}
      >
        {/* Outer Bezel */}
        <div className="relative rounded-[2.7rem] overflow-hidden bg-slate-950 border-[3px] border-slate-800">
          
          {/* Dynamic Island Notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 bg-black/90 backdrop-blur-md border border-slate-800 rounded-full px-3 py-1 flex items-center gap-2 shadow-inner">
            <div className="h-2 w-2 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[8px] font-mono text-slate-300 font-semibold tracking-wider">
              AASRA 2.5
            </span>
          </div>

          {/* ── Screen Frame ────────────────────────────────────────────── */}
          <div className="bg-[#f8fafc] overflow-hidden relative flex flex-col justify-between" style={{ height: "560px", width: "100%" }}>
            
            {/* iOS Status Bar + Autoplay Progress Ribbon */}
            <div className="relative bg-white/90 border-b border-slate-100/80">
              <div className="flex justify-between items-center px-6 pt-3 pb-1 text-[10px] font-mono font-bold text-slate-600">
                <span>{currentTime}</span>
                <div className="flex gap-2 items-center">
                  <span className="text-[9px] text-emerald-600 font-bold">5G</span>
                  <span>●●●</span>
                  <span className="text-[9px] text-slate-700">100%</span>
                </div>
              </div>
              
              {/* Subtle Autoplay Progress Line */}
              <div className="h-0.5 bg-slate-100 w-full overflow-hidden">
                <div
                  key={activeTab}
                  className="h-full bg-gradient-to-r from-[#533afd] to-[#0ea5e9] animate-[marquee_4.5s_linear_infinite]"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            {/* ── SCREEN VIEWPORTS (Dynamic on activeTab) ────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              
              {/* ── TAB 1: HOME (Dashboard Overview) ────────────────────── */}
              {activeTab === "home" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  
                  {/* Farmer Greeting Header Card */}
                  <div className="rounded-3xl bg-gradient-to-br from-[#533afd] via-[#4434d4] to-[#372bb0] text-white p-4 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-xs font-black tracking-tight">
                          {isHindi ? "नमस्ते किसान साथी! 👋" : "Hello Farmer Partner! 👋"}
                        </p>
                        <p className="text-[10px] text-indigo-100 font-medium">
                          {isHindi ? "आपकी फसल, वैज्ञानिक सुरक्षा" : "Precision Crop Intelligence"}
                        </p>
                      </div>
                      <div className="h-9 w-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-sm shadow-inner">
                        🌾
                      </div>
                    </div>

                    <div className="mt-2.5 inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[9px] font-medium border border-white/10">
                      <MapPin className="h-2.5 w-2.5 text-emerald-400" />
                      <span className="truncate max-w-[190px]">{displayLocation}</span>
                    </div>
                  </div>

                  {/* Weather Quick Tile */}
                  <div className="rounded-2xl bg-white border border-[#e3e8ee] p-3.5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                        {isHindi ? "आज का कृषि मौसम" : "Agricultural Weather"}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {isHindi ? "स्प्रे विंडो सक्रिय ✓" : "Spray Window Active ✓"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-[#0d253d] font-mono tracking-tight">{liveTemp}°C</span>
                          <span className="text-[10px] text-slate-400 font-mono">/32° Max</span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-medium">
                          {isHindi ? "साफ धूप · हवा: 11 km/h" : "Clear & Sunny · Wind: 11 km/h"}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl shadow-inner">
                        ☀️
                      </div>
                    </div>
                  </div>

                  {/* Mandi Quick Tile */}
                  <div className="rounded-2xl bg-gradient-to-r from-amber-50/70 to-emerald-50/70 border border-amber-200/80 p-3.5 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-900 font-mono uppercase">
                        {isHindi ? "सीहोर APMC मंडी भाव" : "Sehore APMC Mandi Rate"}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-mono">
                        +₹65 ▲
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          {isHindi ? "शरबती गेहूं (Sharbati Wheat)" : "Sharbati Wheat"}
                        </span>
                        <span className="text-xl font-black text-[#0d253d] font-mono">
                          ₹{mandiPrice} <span className="text-[10px] font-normal text-slate-500">{isHindi ? "/क्विंटल" : "/quintal"}</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleManualTabChange("mandi")}
                        className="text-[10px] font-bold text-[#533afd] hover:text-[#4434d4] flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{isHindi ? "अन्य भाव" : "All Rates"}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* AI Advisory Callout */}
                  <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/90 p-3 space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[#533afd] font-bold text-[10px]">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isHindi ? "AASRA AI वैज्ञानिक सलाह" : "AASRA AI Advisory"}</span>
                    </div>
                    <p className="text-[10px] text-slate-700 leading-snug">
                      {isHindi
                        ? "गेहूं में बालियां निकलने का समय है। रात का तापमान 14°C से अधिक होने पर Quantis® @ 300ml का स्प्रे करें।"
                        : "Wheat is entering the booting stage. If night temperatures exceed 14°C, apply Quantis® @ 300ml/ac."}
                    </p>
                  </div>
                </div>
              )}

              {/* ── TAB 2: CROP (AI Disease Vision Diagnostics) ─────────── */}
              {activeTab === "crop" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0d253d]">
                      {isHindi ? "AI पत्ती रोग स्कैनर" : "AI Disease Vision Scanner"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsScanning(true);
                        setTimeout(() => setIsScanning(false), 2000);
                      }}
                      className="px-2 py-1 rounded-xl bg-indigo-50 text-[#533afd] hover:bg-indigo-100 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw className={`h-3 w-3 ${isScanning ? "animate-spin" : ""}`} />
                      <span>{isHindi ? "पुनः स्कैन" : "Rescan"}</span>
                    </button>
                  </div>

                  {/* Leaf Scan Viewfinder Simulation */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-[#533afd] h-40 flex items-center justify-center shadow-inner">
                    <div className="text-6xl select-none">🍃</div>

                    {/* Scanning Laser Line */}
                    {isScanning && (
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_14px_#ef4444] animate-[bounce_1.5s_infinite]" />
                    )}

                    {/* Bounding Box */}
                    <div className="absolute border-2 border-dashed border-emerald-400 rounded-xl w-28 h-28 pointer-events-none flex items-start justify-end p-1.5">
                      <span className="text-[7px] font-mono font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-sm shadow-xs">
                        {isScanning ? (isHindi ? "स्कैन जारी..." : "SCANNING...") : "98.6% MATCH"}
                      </span>
                    </div>
                  </div>

                  {/* Diagnosis Result Card */}
                  <div className="rounded-2xl bg-white border border-[#e3e8ee] p-3.5 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        {isHindi ? "रोग पहचाना गया" : "Pathogen Detected"}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-700 font-bold">
                        98.6% Confidence
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-[#0d253d]">
                      {isHindi ? "पीला रतुआ (Yellow Rust)" : "Yellow Rust (Puccinia striiformis)"}
                    </h4>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      {isHindi
                        ? "पत्तियों पर पीले रंग की धारियां देखी गईं। तुरंत कवकनाशक स्प्रे आवश्यक है।"
                        : "Chlorotic stripes observed on leaf blades. Immediate fungicide intervention recommended."}
                    </p>
                    <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[10px] text-emerald-950 font-medium">
                      <strong>{isHindi ? "प्रमाणित दवा: " : "Prescription: "}</strong> Syngenta Tilt® (Propiconazole 25% EC) @ 200 ml/{isHindi ? "एकड़" : "acre"}.
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: VOICE (AI Voice Assistant) ───────────────────── */}
              {activeTab === "voice" && (
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  <div className="text-center space-y-0.5">
                    <span className="text-xs font-black text-[#0d253d] block">
                      {isHindi ? "AASRA वॉयस AI सलाहकार" : "AASRA Multilingual Voice AI"}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      Google Gemini 2.5 Flash + Chirp 3 HD
                    </span>
                  </div>

                  {/* Farmer Message Bubble */}
                  <div className="bg-[#533afd] text-white p-3 rounded-2xl rounded-tr-none text-[10px] space-y-1 ml-4 shadow-xs">
                    <span className="text-[8px] opacity-75 font-mono block">
                      {isHindi ? "आप (किसान):" : "You (Farmer):"}
                    </span>
                    <p className="leading-tight font-medium">
                      {isHindi
                        ? '"सीहोर में आज गेहूं का क्या भाव है और क्या दोपहर में स्प्रे कर सकते हैं?"'
                        : '"What is the rate of wheat in Sehore today and is it safe to spray?"'}
                    </p>
                  </div>

                  {/* AASRA AI Response Bubble */}
                  <div className="bg-white border border-[#e3e8ee] text-[#0d253d] p-3 rounded-2xl rounded-tl-none text-[10px] space-y-1.5 mr-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-[#533afd] font-mono">AASRA AI:</span>
                      <span className="inline-flex items-center gap-0.5 text-[8px] text-emerald-700 bg-emerald-50 px-1.5 rounded-full font-mono">
                        <Volume2 className="h-2.5 w-2.5" /> 1.2s Audio
                      </span>
                    </div>
                    <p className="text-slate-700 leading-snug">
                      {isHindi
                        ? "नमस्ते! सीहोर मंडी में आज शरबती गेहूं ₹2,420 प्रति क्विंटल बिका है। हवा 11 km/h है, अतः दोपहर में स्प्रे करना पूर्णतः सुरक्षित है।"
                        : "Namaste! Sharbati wheat in Sehore mandi is ₹2,420/quintal. Wind speed is 11 km/h, making spray completely safe today."}
                    </p>
                  </div>

                  {/* Animated Equalizer Wave */}
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    {[35, 70, 95, 55, 85, 40, 75, 50, 90, 30].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#533afd] rounded-full animate-pulse"
                        style={{
                          height: `${h * 0.25}px`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Mic Pulse Button */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-[#533afd] to-[#4434d4] text-white shadow-lg shadow-[#533afd]/30 cursor-pointer animate-pulse hover:scale-105 transition-all">
                      <Mic className="h-6 w-6" />
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium mt-1">
                      {isHindi ? "बोलने के लिए माइक दबाएं" : "Tap microphone to speak"}
                    </p>
                  </div>
                </div>
              )}

              {/* ── TAB 4: MANDI (Live APMC Markets & Comparisons) ──────── */}
              {activeTab === "mandi" && (
                <div className="space-y-2.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0d253d]">
                      {isHindi ? "140+ मंडियों के भाव" : "140+ Mandi Network"}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Agmarknet Verified
                    </span>
                  </div>

                  {/* Crop Quick Switcher Chips */}
                  <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold">
                    {[
                      { id: "wheat", label: isHindi ? "गेहूं" : "Wheat" },
                      { id: "soybean", label: isHindi ? "सोयाबीन" : "Soybean" },
                      { id: "mustard", label: isHindi ? "सरसों" : "Mustard" },
                      { id: "cotton", label: isHindi ? "कपास" : "Cotton" },
                    ].map((cr) => (
                      <button
                        key={cr.id}
                        type="button"
                        onClick={() => setSelectedCrop(cr.id)}
                        className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedCrop === cr.id
                            ? "bg-[#533afd] text-white border-[#533afd] shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {cr.label}
                      </button>
                    ))}
                  </div>

                  {/* Selected Mandi Rate Details */}
                  <div className="rounded-2xl bg-white border border-[#e3e8ee] p-3 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-[#0d253d] block">
                          {isHindi ? currentMandi.nameHi : currentMandi.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {isHindi ? currentMandi.name : currentMandi.nameHi}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                        {currentMandi.delta}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-mono uppercase">
                          {isHindi ? "मोडल भाव" : "Modal Price"}
                        </span>
                        <span className="text-xl font-black text-[#0d253d] font-mono">
                          ₹{currentMandi.modal.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="text-right text-[9px] text-slate-500 font-mono">
                        <div>{isHindi ? "न्यूनतम:" : "Min:"} ₹{currentMandi.min.toLocaleString("en-IN")}</div>
                        <div>{isHindi ? "अधिकतम:" : "Max:"} ₹{currentMandi.max.toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                  </div>

                  {/* Nearby Regional Mandi Price Comparison List (Fills Space) */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-2.5 space-y-1.5 shadow-2xs">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">
                      {isHindi ? "निकटवर्ती मंडी तुलना" : "Regional Mandi Comparison"}
                    </span>
                    <div className="space-y-1 font-mono text-[9px]">
                      <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-700">Sehore (सीहोर)</span>
                        <span className="font-black text-emerald-700">₹2,420/q ▲</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-700">Bhopal (भोपाल)</span>
                        <span className="font-black text-slate-700">₹2,410/q</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-700">Vidisha (विदिशा)</span>
                        <span className="font-black text-slate-700">₹2,390/q</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 5: WEATHER (Micro-Weather Radar) ─────────────────── */}
              {activeTab === "weather" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0d253d]">
                      {isHindi ? "14-दिन मौसम रडार" : "14-Day Micro-Weather Radar"}
                    </span>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Open-Meteo
                    </span>
                  </div>

                  {/* Weather Big Card */}
                  <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white p-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-black font-mono tracking-tight">{liveTemp}°C</span>
                        <p className="text-[10px] text-sky-100 font-medium">
                          {isHindi ? "साफ धूप व अनुकूल स्थिति" : "Clear, Sunny & Optimal"}
                        </p>
                      </div>
                      <div className="text-3xl">☀️</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-2.5 mt-2.5 border-t border-white/20 text-[9px] text-sky-100 font-mono">
                      <div>{isHindi ? "हवा:" : "Wind:"} <strong>11 km/h</strong></div>
                      <div>{isHindi ? "नमी:" : "Moist:"} <strong>38%</strong></div>
                      <div>{isHindi ? "बारिश:" : "Rain:"} <strong>0 mm</strong></div>
                    </div>
                  </div>

                  {/* 4-Day Micro Forecast */}
                  <div className="rounded-2xl bg-white border border-[#e3e8ee] p-3 space-y-1.5 shadow-xs">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">
                      {isHindi ? "4-दिन पूर्वानुमान" : "4-Day Micro-Forecast"}
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                      <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[8px] text-slate-500 block">{isHindi ? "आज" : "Today"}</span>
                        <span className="text-xs">☀️</span>
                        <span className="text-[10px] font-bold text-slate-800 block">28°</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[8px] text-slate-500 block">{isHindi ? "कल" : "Tmrw"}</span>
                        <span className="text-xs">⛅</span>
                        <span className="text-[10px] font-bold text-slate-800 block">29°</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[8px] text-slate-500 block">{isHindi ? "परसों" : "Thu"}</span>
                        <span className="text-xs">🌤️</span>
                        <span className="text-[10px] font-bold text-slate-800 block">27°</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[8px] text-slate-500 block">{isHindi ? "शुक्र" : "Fri"}</span>
                        <span className="text-xs">☀️</span>
                        <span className="text-[10px] font-bold text-slate-800 block">28°</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* ── Apple iOS Frosted Bottom Dock ────────────────────────── */}
            <div className="bg-white/90 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex justify-around items-center shrink-0 shadow-lg">
              {[
                { id: "home", icon: <LayoutDashboard className="h-4 w-4" />, label: isHindi ? "होम" : "Home", fab: false },
                { id: "crop", icon: <Leaf className="h-4 w-4" />, label: isHindi ? "फसल AI" : "Crop AI", fab: false },
                { id: "voice", icon: <Mic className="h-4 w-4" />, label: isHindi ? "AI साथी" : "Voice AI", fab: true },
                { id: "mandi", icon: <BarChart2 className="h-4 w-4" />, label: isHindi ? "मंडी" : "Mandi", fab: false },
                { id: "weather", icon: <Sun className="h-4 w-4" />, label: isHindi ? "मौसम" : "Weather", fab: false },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleManualTabChange(tab.id as any)}
                  className={`flex flex-col items-center gap-0.5 text-[8px] font-bold transition-all cursor-pointer ${
                    tab.fab
                      ? "bg-gradient-to-r from-[#533afd] to-[#4434d4] text-white rounded-full w-9 h-9 -mt-4 shadow-md hover:scale-110 active:scale-95 flex items-center justify-center"
                      : activeTab === tab.id
                      ? "text-[#533afd] scale-105 font-black"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab.icon}
                  {!tab.fab && <span>{tab.label}</span>}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
