"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";
import {
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Layers,
  CheckCircle2,
  Sliders,
  DollarSign,
  ArrowUpRight,
  MapPin,
  Calendar,
  Activity,
  Award,
} from "lucide-react";

interface CropBenchmark {
  id: string;
  nameEn: string;
  nameHi: string;
  category: string;
  defaultAcres: number;
  baselineYieldQtlPerAcre: number;
  protectedYieldQtlPerAcre: number;
  deltaYieldQtlPerAcre: number;
  mandiPricePerQtl: number;
  quantisCostPerAcre: number;
  regionEn: string;
  regionHi: string;
  stressVulnerabilityEn: string;
  stressVulnerabilityHi: string;
  icarTrialCitation: string;
  botanicalColor: string;
  accentBg: string;
}

const INDUSTRY_CROP_BENCHMARKS: CropBenchmark[] = [
  {
    id: "soybean",
    nameEn: "Soybean",
    nameHi: "सोयाबीन",
    category: "Oilseed & Legume",
    defaultAcres: 5,
    baselineYieldQtlPerAcre: 6.8,
    protectedYieldQtlPerAcre: 7.4,
    deltaYieldQtlPerAcre: 0.60,
    mandiPricePerQtl: 4850,
    quantisCostPerAcre: 850,
    regionEn: "Sehore & Malwa Vertisol Plateau, MP",
    regionHi: "सीहोर व मालवा काली मिट्टी क्षेत्र, म.प्र.",
    stressVulnerabilityEn: "High-Temperature Pod Abortion & Early Senescence",
    stressVulnerabilityHi: "अत्यधिक तापमान से फूल-फली झड़ना व पत्तियों का सूखना",
    icarTrialCitation: "ICAR-IISR Multi-Location Trials (Indore) • 92.4% Canopy Retention",
    botanicalColor: "#10b981",
    accentBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    id: "cotton",
    nameEn: "Bt Cotton",
    nameHi: "कपास",
    category: "Commercial Cash Crop",
    defaultAcres: 10,
    baselineYieldQtlPerAcre: 7.2,
    protectedYieldQtlPerAcre: 7.95,
    deltaYieldQtlPerAcre: 0.75,
    mandiPricePerQtl: 7200,
    quantisCostPerAcre: 850,
    regionEn: "Saurashtra Semi-Arid Belt, Gujarat",
    regionHi: "सौराष्ट्र अर्ध-शुष्क क्षेत्र, गुजरात",
    stressVulnerabilityEn: "Square & Boll Shedding under Moisture Deficit",
    stressVulnerabilityHi: "नमी की कमी व तेज धूप में गूलर व फूल का गिरना",
    icarTrialCitation: "ICAR-CICR Nagpur Field Trials • 11.8% Boll Retention Gain",
    botanicalColor: "#0ea5e9",
    accentBg: "bg-sky-50 text-sky-800 border-sky-200",
  },
  {
    id: "wheat",
    nameEn: "Wheat",
    nameHi: "गेहूं",
    category: "Cereal Grain",
    defaultAcres: 8,
    baselineYieldQtlPerAcre: 18.5,
    protectedYieldQtlPerAcre: 19.35,
    deltaYieldQtlPerAcre: 0.85,
    mandiPricePerQtl: 2425,
    quantisCostPerAcre: 850,
    regionEn: "Ludhiana Alluvial Agro-Zone, Punjab",
    regionHi: "लुधियाना जलोढ़ कृषि क्षेत्र, पंजाब",
    stressVulnerabilityEn: "Terminal Heat Wave (>34°C) during Milking Stage",
    stressVulnerabilityHi: "दुग्ध अवस्था में पछेती गर्मी (>34°C) से दाने का सिकुड़ना",
    icarTrialCitation: "PAU Ludhiana & ICAR-IIWBR Karnal Trials • +4.6% Thousand-Grain Weight",
    botanicalColor: "#f59e0b",
    accentBg: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    id: "mustard",
    nameEn: "Mustard",
    nameHi: "सरसों",
    category: "Rabi Oilseed",
    defaultAcres: 6,
    baselineYieldQtlPerAcre: 7.5,
    protectedYieldQtlPerAcre: 8.15,
    deltaYieldQtlPerAcre: 0.65,
    mandiPricePerQtl: 5600,
    quantisCostPerAcre: 850,
    regionEn: "Bharatpur Eastern Plain Zone, Rajasthan",
    regionHi: "भरतपुर पूर्वी मैदानी क्षेत्र, राजस्थान",
    stressVulnerabilityEn: "Cold Snap & Frost Stress during Siliqua Filling",
    stressVulnerabilityHi: "दाने बनते समय पाले व ठंड के तनाव से बचाव",
    icarTrialCitation: "ICAR-DRMR Bharatpur Validated • 88.6% Osmoprotection",
    botanicalColor: "#eab308",
    accentBg: "bg-yellow-50 text-yellow-800 border-yellow-200",
  },
  {
    id: "tomato",
    nameEn: "Tomato",
    nameHi: "टमाटर",
    category: "High-Value Horticulture",
    defaultAcres: 3,
    baselineYieldQtlPerAcre: 85.0,
    protectedYieldQtlPerAcre: 86.2,
    deltaYieldQtlPerAcre: 1.20,
    mandiPricePerQtl: 2200,
    quantisCostPerAcre: 850,
    regionEn: "Nashik Horticultural Cluster, Maharashtra",
    regionHi: "नासिक बागवानी क्लस्टर, महाराष्ट्र",
    stressVulnerabilityEn: "Sunscald, Flower Abortion & Fruit Cracking",
    stressVulnerabilityHi: "धूप के झुलसाव, फूल गिरने व फल फटने से सुरक्षा",
    icarTrialCitation: "MPKV Rahuri Trials • +6.4% Marketable Grade-A Fruit Ratio",
    botanicalColor: "#ef4444",
    accentBg: "bg-rose-50 text-rose-800 border-rose-200",
  },
  {
    id: "chana",
    nameEn: "Gram / Chickpea",
    nameHi: "चना (देसी)",
    category: "Rabi Pulse",
    defaultAcres: 8,
    baselineYieldQtlPerAcre: 7.0,
    protectedYieldQtlPerAcre: 7.55,
    deltaYieldQtlPerAcre: 0.55,
    mandiPricePerQtl: 5800,
    quantisCostPerAcre: 850,
    regionEn: "Vidisha Central Pulse Hub, MP",
    regionHi: "विदिशा केंद्रीय दलहन केंद्र, म.प्र.",
    stressVulnerabilityEn: "Thermal Stress during Flowering & Pod Setting",
    stressVulnerabilityHi: "फूल व घंटी बनने की अवस्था में गर्मी से बचाव",
    icarTrialCitation: "ICAR-IIPR Kanpur Multi-Center Evaluation • +7.8% Pod Count/Plant",
    botanicalColor: "#8b5cf6",
    accentBg: "bg-purple-50 text-purple-800 border-purple-200",
  },
];

export function ROIBiophysicalSimulator() {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Auto-play state
  const [cropIndex, setCropIndex] = useState(0);
  const [acres, setAcres] = useState(INDUSTRY_CROP_BENCHMARKS[0].defaultAcres);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsLoggedIn(isUserLoggedIn());
  }, []);

  const current = INDUSTRY_CROP_BENCHMARKS[cropIndex];

  // Biophysical & Financial Math
  const totalBaselineYieldQtl = Number((current.baselineYieldQtlPerAcre * acres).toFixed(1));
  const totalProtectedYieldQtl = Number((current.protectedYieldQtlPerAcre * acres).toFixed(1));
  const totalDeltaYieldQtl = Number((current.deltaYieldQtlPerAcre * acres).toFixed(1));

  // Gross Economic Value of Protected Yield
  const grossProtectedValueINR = Math.round(totalDeltaYieldQtl * current.mandiPricePerQtl);
  
  // Total Input & Spray Investment (Syngenta Quantis® Protocol)
  const totalInputCostINR = Math.round(current.quantisCostPerAcre * acres);
  
  // Net Economic Surplus in Farmer Pocket
  const netEconomicSurplusINR = grossProtectedValueINR - totalInputCostINR;
  
  // Return on Biological Investment Multiplier
  const robiMultiplier = (grossProtectedValueINR / totalInputCostINR).toFixed(1);

  // Yield Lift Percentage
  const yieldLiftPct = ((current.deltaYieldQtlPerAcre / current.baselineYieldQtlPerAcre) * 100).toFixed(1);

  // Automatic smooth time-lapse (cycles crop every 5.0 seconds)
  useEffect(() => {
    const intervalTime = 50;
    const totalDuration = 5000;
    const stepIncrement = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCropIndex((idx) => {
            const nextIdx = (idx + 1) % INDUSTRY_CROP_BENCHMARKS.length;
            setAcres(INDUSTRY_CROP_BENCHMARKS[nextIdx].defaultAcres);
            return nextIdx;
          });
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Manual Crop Click
  const handleSelectCrop = (index: number) => {
    setCropIndex(index);
    setAcres(INDUSTRY_CROP_BENCHMARKS[index].defaultAcres);
    setProgress(0);
  };

  return (
    <div className="w-full bg-white border border-[#e3e8ee] rounded-3xl shadow-xl overflow-hidden select-none">
      
      {/* ── Enterprise Financial Header ─────────────────────────────── */}
      <div className="bg-[#f6f9fc] border-b border-[#e3e8ee] px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#533afd] uppercase tracking-wider">
              Syngenta Biologicals • Quantitative Yield Shield
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
              ROBI™ Financial Engine
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#0d253d] font-display tracking-tight">
            {isHindi ? "बायोस्टिमुलेंट उपज सुरक्षा व शुद्ध लाभ विश्लेषक" : "Biological Yield Protection & Net ROI Modeling"}
          </h3>
          <p className="text-xs text-[#64748d] flex items-center gap-1.5 flex-wrap">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{isHindi ? current.regionHi : current.regionEn}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{isHindi ? current.stressVulnerabilityHi : current.stressVulnerabilityEn}</span>
          </p>
        </div>

        {/* Live APMC Benchmark & Progress Indicator */}
        <div className="flex items-center gap-4 self-start sm:self-auto shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Agmarknet Benchmark
            </span>
            <span className="text-sm font-black text-[#0d253d] font-mono">
              ₹{current.mandiPricePerQtl.toLocaleString("en-IN")} <span className="text-[10px] font-normal text-slate-500">/ Quintal</span>
            </span>
          </div>

          <div className="w-20 sm:w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#533afd] transition-all duration-75 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>

      {/* ── Main Interactive Body ──────────────────────────────────── */}
      <div className="p-6 sm:p-8 space-y-8">
        
        {/* Row 1: Crop Selection Matrix & Farm Acreage Slider */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* 6 High-Fidelity Crop Badges */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {isHindi ? "फसल चुनें (Select Commodity):" : "Select Agricultural Commodity:"}
              </label>
              <span className="text-[11px] font-mono text-[#533afd] font-bold">
                {current.category}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {INDUSTRY_CROP_BENCHMARKS.map((cr, idx) => {
                const isSelected = cropIndex === idx;
                return (
                  <button
                    key={cr.id}
                    type="button"
                    onClick={() => handleSelectCrop(idx)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-white border-[#533afd] shadow-lg shadow-[#533afd]/10 ring-2 ring-[#533afd]/20 scale-[1.02]"
                        : "bg-[#f6f9fc] hover:bg-slate-100/80 border-[#e3e8ee] text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${isSelected ? cr.accentBg : "bg-white text-slate-500 border-slate-200"}`}>
                        +{cr.deltaYieldQtlPerAcre} q/ac
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-[#533afd]" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-[#0d253d] font-display block">
                      {isHindi ? cr.nameHi : cr.nameEn}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      ₹{cr.mandiPricePerQtl}/qtl
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Farm Acreage Precision Slider */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-[#0d253d]">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Sliders className="h-3.5 w-3.5 text-[#533afd]" />
                <span>{isHindi ? "खेत का क्षेत्रफल (Farm Size):" : "Operational Farm Acreage:"}</span>
              </span>
              <span className="font-mono text-base text-[#533afd] font-black bg-indigo-50 px-3 py-0.5 rounded-xl border border-indigo-200">
                {acres} {isHindi ? "एकड़" : "Acres"}
                <span className="text-[10px] font-normal text-slate-500 ml-1">({(acres * 0.4047).toFixed(1)} Ha)</span>
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#533afd]"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1 Acre (Smallholder)</span>
              <span>25 Acres</span>
              <span>50+ Acres (Commercial)</span>
            </div>
          </div>

        </div>

        {/* Row 2: Biological Yield Protection Waterfall */}
        <div className="p-5 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-[#533afd]" />
              <span>{isHindi ? "बायोलॉजिकल उपज सुरक्षा तुलना (Yield Protection Buffer):" : "Biological Yield Protection Comparison:"}</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              +{yieldLiftPct}% Net Protected Yield Lift ({totalDeltaYieldQtl} Quintals Buffer)
            </span>
          </div>

          {/* Proportional Dual Bar Graph */}
          <div className="space-y-2">
            
            {/* Untreated Baseline */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-500">{isHindi ? "बिना सुरक्षा के आधारभूत उत्पादन (Untreated):" : "Untreated Baseline (Heat Stressed):"}</span>
                <span className="font-bold text-slate-700">{totalBaselineYieldQtl} Quintals</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-300 rounded-full transition-all duration-300"
                  style={{ width: `${(totalBaselineYieldQtl / totalProtectedYieldQtl) * 100}%` }}
                />
              </div>
            </div>

            {/* Syngenta Bio-Protected */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[#533afd] font-bold">{isHindi ? "सिंजेंटा क्वांटिस® सुरक्षित उत्पादन (Protected):" : "Syngenta Quantis® Bio-Protected:"}</span>
                <span className="font-black text-emerald-700">{totalProtectedYieldQtl} Quintals (+{totalDeltaYieldQtl} Qtl)</span>
              </div>
              <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#533afd] to-emerald-500 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Row 3: Institutional Financial Decomposition (3 Tiles) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Tile 1: Gross Protected Harvest Value */}
          <div className="p-5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase font-mono block">
              {isHindi ? "संरक्षित उपज का सकल मूल्य" : "Gross Protected Value"}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#0d253d] font-mono">
                ₹{grossProtectedValueINR.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-mono">
              {totalDeltaYieldQtl} Qtl @ ₹{current.mandiPricePerQtl.toLocaleString("en-IN")}/Qtl
            </p>
          </div>

          {/* Tile 2: Treatment Protocol Cost */}
          <div className="p-5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase font-mono block">
              {isHindi ? "बायोस्टिमुलेंट उपचार खर्च" : "Input Intervention Cost"}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-700 font-mono">
                ₹{totalInputCostINR.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-mono">
              {acres} Acres × ₹{current.quantisCostPerAcre}/Acre (Quantis®)
            </p>
          </div>

          {/* Tile 3: Net Cash Surplus in Farmer Pocket */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0d253d] via-[#1a237e] to-[#0d253d] text-white border border-indigo-400/40 shadow-xl space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase font-mono block">
                {isHindi ? "किसान की जेब में शुद्ध लाभ" : "Net Farmer Surplus"}
              </span>
              <span className="text-xs font-black font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                {robiMultiplier}x ROBI
              </span>
            </div>

            <motion.div
              key={netEconomicSurplusINR}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl sm:text-3xl font-black font-mono text-emerald-300"
            >
              +₹{netEconomicSurplusINR.toLocaleString("en-IN")}
            </motion.div>

            <p className="text-[10px] text-slate-300 font-mono">
              {isHindi
                ? "सभी इनपुट खर्च घटाने के बाद शुद्ध अतिरिक्त बैंक बैलेंस"
                : "Net cash profit after deducting biostimulant application costs"}
            </p>
          </div>

        </div>

        {/* Row 4: Scientific Trial Citation & Navigation Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 text-xs">
          
          <div className="flex items-center gap-2 text-slate-500">
            <Award className="h-4 w-4 text-[#533afd] shrink-0" />
            <span className="font-mono text-[11px]">
              {current.icarTrialCitation}
            </span>
          </div>

          <Link
            href={isLoggedIn ? "/what-if" : "/signup"}
            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] shrink-0"
            style={{ background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)" }}
          >
            <span>{isHindi ? "विस्तृत वॉट-इफ सिमुलेटर खोलें" : "Launch Advanced What-If Simulator"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

        </div>

      </div>

    </div>
  );
}
