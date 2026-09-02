"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Minus,
  Equal,
  TrendingUp,
  Wallet,
  IndianRupee,
} from "lucide-react";

interface SimpleCrop {
  id: string;
  nameEn: string;
  nameHi: string;
  icon: string;
  defaultAcres: number;
  pricePerQuintal: number;
  quintalsSavedPerAcre: number;
  sprayCostPerAcre: number;
  region: string;
  benefitEn: string;
  benefitHi: string;
}

const EASY_CROPS: SimpleCrop[] = [
  {
    id: "soybean",
    nameEn: "Soybean",
    nameHi: "सोयाबीन",
    icon: "🫘",
    defaultAcres: 5,
    pricePerQuintal: 4850,
    quintalsSavedPerAcre: 0.60,
    sprayCostPerAcre: 850,
    region: "Sehore (MP)",
    benefitEn: "Stops flowers and pods from falling in extreme heat",
    benefitHi: "कड़ी धूप में फूल और फलियों को झड़ने से बचाता है",
  },
  {
    id: "cotton",
    nameEn: "Cotton",
    nameHi: "कपास",
    icon: "☁️",
    defaultAcres: 10,
    pricePerQuintal: 7200,
    quintalsSavedPerAcre: 0.75,
    sprayCostPerAcre: 850,
    region: "Rajkot (Gujarat)",
    benefitEn: "Protects cotton bolls from dropping during dry spells",
    benefitHi: "सूखे और गर्मी में कपास के गूलर झड़ने से रोकता है",
  },
  {
    id: "wheat",
    nameEn: "Wheat",
    nameHi: "गेहूं",
    icon: "🌾",
    defaultAcres: 8,
    pricePerQuintal: 2425,
    quintalsSavedPerAcre: 0.85,
    sprayCostPerAcre: 850,
    region: "Ludhiana (Punjab)",
    benefitEn: "Fills every grain plump and heavy even during late heat",
    benefitHi: "पछेती गर्मी में दानों को पिचकने से बचाकर मोटा और भारी बनाता है",
  },
  {
    id: "mustard",
    nameEn: "Mustard",
    nameHi: "सरसों",
    icon: "🌼",
    defaultAcres: 6,
    pricePerQuintal: 5600,
    quintalsSavedPerAcre: 0.65,
    sprayCostPerAcre: 850,
    region: "Bharatpur (Rajasthan)",
    benefitEn: "Shields mustard pods from sudden cold waves and frost",
    benefitHi: "अचानक पाले और ठंड से फलियों में दाने सिकुड़ने से बचाता है",
  },
  {
    id: "tomato",
    nameEn: "Tomato",
    nameHi: "टमाटर",
    icon: "🍅",
    defaultAcres: 3,
    pricePerQuintal: 2200,
    quintalsSavedPerAcre: 1.20,
    sprayCostPerAcre: 850,
    region: "Nashik (Maharashtra)",
    benefitEn: "Prevents sun burning and keeps tomatoes firm and red",
    benefitHi: "धूप से फलों को झुलसने से बचाकर चमकदार व ठोस रखता है",
  },
  {
    id: "chana",
    nameEn: "Gram / Chana",
    nameHi: "चना",
    icon: "🥣",
    defaultAcres: 8,
    pricePerQuintal: 5800,
    quintalsSavedPerAcre: 0.55,
    sprayCostPerAcre: 850,
    region: "Vidisha (MP)",
    benefitEn: "Ensures healthy pod formation without flower drop",
    benefitHi: "फूलों को गिरने से रोककर हर घंटी में मोटा दाना बनाता है",
  },
];

export function ROIBiophysicalSimulator() {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Auto-play state
  const [cropIndex, setCropIndex] = useState(0);
  const [acres, setAcres] = useState(EASY_CROPS[0].defaultAcres);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsLoggedIn(isUserLoggedIn());
  }, []);

  const currentCrop = EASY_CROPS[cropIndex];

  // Super Simple Clear Math:
  // 1. Total quintals saved from dying/falling in bad weather:
  const totalQuintalsSaved = Number((currentCrop.quintalsSavedPerAcre * acres).toFixed(1));
  
  // 2. Worth of this saved crop at local Mandi price:
  const cropValueSaved = Math.round(totalQuintalsSaved * currentCrop.pricePerQuintal);
  
  // 3. Money spent on medicine / spray:
  const sprayCostTotal = Math.round(currentCrop.sprayCostPerAcre * acres);
  
  // 4. Net extra cash in farmer's pocket:
  const netProfitInPocket = cropValueSaved - sprayCostTotal;
  
  // 5. Money multiplier (e.g. ₹1 spent -> ₹2.40 back):
  const returnMultiplier = (cropValueSaved / sprayCostTotal).toFixed(1);

  // Automatic smooth time-lapse (cycles crop every 4.5 seconds)
  useEffect(() => {
    const intervalTime = 50;
    const totalDuration = 4500;
    const stepIncrement = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCropIndex((idx) => {
            const nextIdx = (idx + 1) % EASY_CROPS.length;
            setAcres(EASY_CROPS[nextIdx].defaultAcres);
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
    setAcres(EASY_CROPS[index].defaultAcres);
    setProgress(0);
  };

  return (
    <div className="w-full bg-white border border-[#e3e8ee] rounded-3xl shadow-xl overflow-hidden select-none">
      
      {/* ── Top Bar: Simple Title & Auto-Switching Status ───────────── */}
      <div className="bg-[#f6f9fc] border-b border-[#e3e8ee] px-6 py-4 flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 text-xl shadow-2xs">
            💰
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0d253d] font-display">
              {isHindi ? "सीधा व सरल मुनाफा हिसाब" : "Easy Profit & Spray Calculator"}
            </h3>
            <span className="text-xs text-slate-500 block">
              {isHindi
                ? `स्थान: ${currentCrop.region} · ${currentCrop.benefitHi}`
                : `Region: ${currentCrop.region} · ${currentCrop.benefitEn}`}
            </span>
          </div>
        </div>

        {/* Smooth Autoplay Progress Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 font-mono hidden sm:inline">
            {isHindi ? "स्वचालित गणना" : "Auto-Calculating"}
          </span>
          <div className="w-24 sm:w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#533afd] transition-all duration-75 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>

      {/* ── Main Content Area ───────────────────────────────────────── */}
      <div className="p-6 sm:p-8 space-y-8">
        
        {/* Step 1: Crop Selection Buttons & Acreage Slider */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-7 space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {isHindi ? "1. अपनी फसल चुनें:" : "1. Choose Your Crop:"}
            </label>
            
            {/* 6 Friendly Crop Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {EASY_CROPS.map((cr, idx) => {
                const isSelected = cropIndex === idx;
                return (
                  <button
                    key={cr.id}
                    type="button"
                    onClick={() => handleSelectCrop(idx)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-[#533afd] text-white border-[#533afd] shadow-md shadow-[#533afd]/20 scale-[1.04]"
                        : "bg-[#f6f9fc] hover:bg-slate-100 border-[#e3e8ee] text-slate-700"
                    }`}
                  >
                    <span className="text-2xl">{cr.icon}</span>
                    <span className="text-xs font-bold block truncate w-full">
                      {isHindi ? cr.nameHi : cr.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acreage Slider */}
          <div className="lg:col-span-5 p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#0d253d]">
              <span>{isHindi ? "2. खेत का क्षेत्रफल:" : "2. Farm Size:"}</span>
              <span className="font-mono text-base text-[#533afd] font-black bg-indigo-50 px-3 py-0.5 rounded-xl border border-indigo-200">
                {acres} {isHindi ? "एकड़ खेत" : "Acres"}
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
              <span>1 Acre</span>
              <span>25 Acres</span>
              <span>50 Acres</span>
            </div>
          </div>

        </div>

        {/* ── Step 2: Ultra-Clear 3-Box Arithmetic (Old to Young Understandable) ──── */}
        <div className="rounded-3xl bg-slate-50 border border-[#e3e8ee] p-4 sm:p-6">
          
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-4 text-center sm:text-left">
            {isHindi ? "सीधा गणित: कितना खर्च हुआ और कितना अतिरिक्त रुपया मिला?" : "Simple Arithmetic: What You Spend vs What You Get in Hand"}
          </span>

          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
            
            {/* Box 1: Crop Saved From Heat/Stress */}
            <div className="md:col-span-3 p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-xs text-center space-y-1">
              <span className="text-xs font-bold text-slate-600 block">
                🌾 {isHindi ? "धूप व गर्मी से बची फसल" : "Crop Saved from Damage"}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#0d253d] font-mono block">
                ₹{cropValueSaved.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold block">
                +{totalQuintalsSaved} {isHindi ? "क्विंटल सुरक्षित (मंडी भाव)" : "Quintals Saved"}
              </span>
            </div>

            {/* Minus Sign */}
            <div className="md:col-span-1 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-rose-100 border border-rose-200 text-rose-700 font-black text-lg flex items-center justify-center shadow-2xs">
                ➖
              </div>
            </div>

            {/* Box 2: Spray / Medicine Cost */}
            <div className="md:col-span-3 p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-xs text-center space-y-1">
              <span className="text-xs font-bold text-slate-600 block">
                🧪 {isHindi ? "दवाई व स्प्रे का कुल खर्च" : "Spray & Medicine Cost"}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-700 font-mono block">
                ₹{sprayCostTotal.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-slate-400 font-bold block">
                {acres} {isHindi ? "एकड़" : "Acres"} × ₹{currentCrop.sprayCostPerAcre}
              </span>
            </div>

            {/* Equals Sign */}
            <div className="md:col-span-1 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-black text-lg flex items-center justify-center shadow-2xs">
                🟰
              </div>
            </div>

            {/* Box 3: Net Cash Profit In Farmer Pocket */}
            <div className="md:col-span-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-center shadow-lg shadow-emerald-500/20 space-y-1">
              <span className="text-xs font-bold text-emerald-100 block">
                💰 {isHindi ? "आपकी जेब में सीधा शुद्ध लाभ" : "Extra Money in Your Pocket"}
              </span>
              <motion.span
                key={netProfitInPocket}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl sm:text-3xl font-black font-mono block text-white"
              >
                +₹{netProfitInPocket.toLocaleString("en-IN")}
              </motion.span>
              <span className="text-[11px] text-emerald-100 font-bold block">
                {isHindi ? "सभी खर्चे काटकर शुद्ध अतिरिक्त रुपया" : "Pure profit after all expenses"}
              </span>
            </div>

          </div>

          {/* Simple Takeaway Pill for Anyone to Understand */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                {isHindi
                  ? `सरल नियम: स्प्रे पर ₹1 खर्च करने पर आपको ₹${returnMultiplier} वापस मिलते हैं!`
                  : `Golden Rule: For every ₹1 spent on spray, you get ₹${returnMultiplier} back in your pocket!`}
              </span>
            </div>

            <Link
              href={isLoggedIn ? "/what-if" : "/signup"}
              className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 hover:scale-105 shrink-0"
              style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
            >
              <span>{isHindi ? "पूरा वॉट-इफ सिमुलेटर खोलें" : "Try Full Simulator"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
