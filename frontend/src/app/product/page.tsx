"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Ps04SpeechIntelligence } from "@/components/Ps04SpeechIntelligence";
import { WhyScienceSection } from "@/components/WhyScienceSection";
import { SyngentaDealerLocator } from "@/components/SyngentaDealerLocator";
import { getStoredProfile, isUserLoggedIn } from "@/lib/userStore";
import { Mic, ArrowRight, Sparkles, Leaf, Zap, Layers, TrendingUp, UserPlus, FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const PS_SYSTEMS = [
  {
    id: "PS-02",
    name: "14-Day Plant Stress Early Warning",
    desc: "GradientBoostingRegressor ML + Open-Meteo live streams. Predicts 14-day rolling heat, drought, waterlogging & frost stress with SHAP TreeExplainer attribution.",
    icon: "🌿",
    href: "/plant-intelligence",
    cta: "Launch Stress Engine",
    badge: "ML + SHAP",
    badgeColor: "emerald",
  },
  {
    id: "PS-03",
    name: "CropFit Biological Product Matcher",
    desc: "Personalised Syngenta product recommendations (Quantis @ 250-400ml/ac, Isabion, Amistar Top) via decision matrix matching crop growth stage and thermal index.",
    icon: "🧬",
    href: "/plant-intelligence",
    cta: "Get CropFit Advice",
    badge: "SYNGENTA RULES",
    badgeColor: "blue",
  },
  {
    id: "PS-04",
    name: "Multilingual Voice & Vision AI Companion",
    desc: "100% Google AI Stack (Google Gemini 2.5 Flash + Chirp 3 HD Speech + Gemini Vision). Supports 12 Indian languages for natural voice advisory and leaf photo diagnostics.",
    icon: "🎙️",
    href: "/assistant",
    cta: "Launch Voice & Vision AI",
    badge: "100% GOOGLE AI",
    badgeColor: "amber",
  },
  {
    id: "PS-07",
    name: "Measuring & Proving Impact (ROBI Engine)",
    desc: "Isolates biostimulant protection gains from baseline weather/soil noise. Computes exact Net INR/acre savings, calibrated ROBI %, and exports verifiable Proof Cards.",
    icon: "📊",
    href: "/impact",
    cta: "View Verified ROBI Proof",
    badge: "VERIFIED PROOF",
    badgeColor: "violet",
  },
];

function badgeClasses(color: string) {
  switch (color) {
    case "emerald": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "blue":    return "bg-indigo-50 text-[#533afd] border-indigo-200";
    case "amber":   return "bg-amber-50 text-amber-700 border-amber-200";
    case "sky":     return "bg-sky-50 text-sky-700 border-sky-200";
    case "violet":  return "bg-violet-50 text-violet-700 border-violet-200";
    default:        return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function ProductPage() {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);
  const loggedIn = isUserLoggedIn();

  return (
    <AppShell>
      <div className="space-y-12 pb-16 bg-[#f6f9fc] text-[#0d253d] font-sans min-h-screen">

        {/* Product Hero */}
        <section className="relative py-20 px-4 sm:px-8 overflow-hidden border-b border-[#e3e8ee] bg-white">
          <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-[#533afd] text-xs font-bold tracking-wider uppercase">
                <Sparkles className="h-3.5 w-3.5 text-[#533afd]" /> AASRA PLATFORM SPECIFICATION
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
                🏆 7 INTEGRATED SCIENTIFIC SYSTEMS
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold font-display text-[#0d253d] tracking-tight leading-tight">
              Biological Science <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#533afd] via-[#4434d4] to-[#0ea5e9]">
                meets Voice Intelligence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748d] max-w-2xl mx-auto leading-relaxed">
              AASRA integrates 7 precision farming systems — from satellite weather telemetry to SHAP-explained ML forecasting — to give Indian farmers actionable, proven advice in their own language.
            </p>

            <div className="pt-4 flex justify-center gap-3 flex-wrap">
              <Link
                href={loggedIn ? "/plant-intelligence" : "/signup"}
                className="px-8 py-4 rounded-2xl text-white font-bold text-xs transition-all shadow-xl flex items-center gap-2 hover:scale-105 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
              >
                <Leaf className="h-4 w-4" />
                <span>{loggedIn ? "Launch Plant Health AI" : "Start Free Farm Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-4 rounded-2xl bg-white border border-[#e3e8ee] hover:border-[#533afd]/40 hover:text-[#533afd] text-[#0d253d] font-bold text-xs transition-all shadow-xs flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-[#533afd]" />
                <span>How It Works</span>
              </Link>
            </div>
          </div>
        </section>

        {/* PS Systems Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-xs font-mono font-bold text-[#533afd] uppercase tracking-wider">
              Core Architecture
            </span>
            <h2 className="text-3xl font-bold text-[#0d253d] font-display">
              7 Integrated Agricultural Engines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PS_SYSTEMS.map((ps) => (
              <div
                key={ps.id}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e3e8ee] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{ps.icon}</span>
                    <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${badgeClasses(ps.badgeColor)}`}>
                      {ps.badge}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-[#533afd] block">{ps.id}</span>
                    <h3 className="text-lg font-bold text-[#0d253d] font-display mt-0.5">{ps.name}</h3>
                    <p className="text-xs sm:text-sm text-[#64748d] mt-2 leading-relaxed">{ps.desc}</p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100">
                  <Link
                    href={loggedIn ? ps.href : "/signup"}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#533afd] hover:text-[#4434d4] transition-colors"
                  >
                    <span>{ps.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Embedded Voice Intelligence Demo */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <Ps04SpeechIntelligence />
        </section>

        {/* Syngenta Dealer Locator */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <SyngentaDealerLocator />
        </section>

        {/* Connected Navigation Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="p-8 rounded-3xl bg-white border border-[#e3e8ee] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-[#0d253d] font-display">
                {isHindi ? "आगे बढ़ें: वास्तविक प्रभाव व केस स्टडीज देखें" : "Next Step: Explore Real Attributed Impact"}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi
                  ? "देखें कैसे भारतीय किसानों ने प्रति एकड़ ₹4,500+ का शुद्ध लाभ कमाया।"
                  : "See verified causal proof cards from farmers in Sehore, Rajkot, and Nashik."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/impact-story"
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>{isHindi ? "इम्पैक्ट स्टोरी देखें" : "View Impact Stories"}</span>
              </Link>
              <Link
                href="/architecture"
                className="px-5 py-3 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
              >
                <FileText className="h-4 w-4" />
                <span>{isHindi ? "आर्किटेक्चर देखें" : "View Architecture"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
