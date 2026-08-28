"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Ps04SpeechIntelligence } from "@/components/Ps04SpeechIntelligence";
import { WhyScienceSection } from "@/components/WhyScienceSection";
import { SyngentaDealerLocator } from "@/components/SyngentaDealerLocator";
import { Mic, ArrowRight, Sparkles, Leaf, Zap } from "lucide-react";

const PS_SYSTEMS = [
  {
    id: "PS-02",
    name: "14-Day Plant Stress Early Warning",
    desc: "GradientBoostingRegressor ML + Meteoblue & Open-Meteo live streams. Predicts 14-day rolling heat, drought, waterlogging & frost stress with SHAP TreeExplainer attribution.",
    icon: "🌿",
    href: "/plant-intelligence",
    cta: "Launch Stress Engine",
    badge: "ML + SHAP",
    badgeColor: "emerald",
  },
  {
    id: "PS-03",
    name: "CropFit Biological Product Matcher",
    desc: "Personalised Syngenta product recommendations (Quantis @ 250ml/ac, Isabion, Amistar Top) via decision matrix matching crop growth stage, stress type, and thermal index.",
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
    case "blue":    return "bg-blue-50 text-blue-700 border-blue-200";
    case "amber":   return "bg-amber-50 text-amber-700 border-amber-200";
    case "sky":     return "bg-sky-50 text-sky-700 border-sky-200";
    case "violet":  return "bg-violet-50 text-violet-700 border-violet-200";
    default:        return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function ProductPage() {
  return (
    <AppShell>
      <div className="space-y-12 pb-16 bg-slate-50 text-slate-900 font-body">

        {/* Product Hero */}
        <section className="relative py-20 px-4 sm:px-8 overflow-hidden border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-accent font-bold tracking-wider uppercase">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> AASRA PLATFORM SPECIFICATION
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold">
                🏆 HACKATHON BUILD — 7 INTEGRATED SYSTEMS
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold font-display text-slate-900 tracking-tight leading-tight">
              Biological Science <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">
                meets Voice Intelligence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-body">
              AASRA integrates 7 precision farming systems — from satellite weather telemetry to SHAP-explained ML forecasting — to give Indian farmers actionable, proven advice in their own language.
            </p>

            <div className="pt-4 flex justify-center gap-4 font-accent flex-wrap">
              <Link
                href="/plant-intelligence"
                className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <Leaf className="h-4 w-4" />
                <span>LAUNCH PLANT AI (PS-02 &amp; PS-03)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/assistant"
                className="px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mic className="h-4 w-4 text-amber-500" />
                <span>LAUNCH VOICE AI (PS-04)</span>
              </Link>
            </div>
          </div>
        </section>

        {/* PS-01 → PS-07 System Overview Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              7 Integrated Precision Systems
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Each PS module operates independently and feeds data into the next. Click any card to explore the live feature.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {PS_SYSTEMS.map(({ id, name, desc, icon, href, cta, badge, badgeColor }) => (
              <div
                key={id}
                className="stripe-card p-5 space-y-3 rounded-2xl border border-slate-200 flex flex-col hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl leading-none">{icon}</span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeClasses(badgeColor)}`}>
                    {badge}
                  </span>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-black text-[#10B981] tracking-wider">{id}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-tight group-hover:text-[#10B981] transition-colors">{name}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
                </div>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981] hover:underline pt-1 mt-auto"
                >
                  {cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Deep-Dive Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Syngenta Authorized Dealers Directory */}
          <SyngentaDealerLocator
            district="Bhopal"
            farmerName="Ramesh Patel"
            crop="Soybean"
            fieldAcres={12.5}
            productName="Syngenta Quantis & Stress Buster"
          />

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <Ps04SpeechIntelligence />
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <WhyScienceSection />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
