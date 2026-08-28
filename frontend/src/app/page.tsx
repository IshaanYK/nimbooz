"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { DataBadge } from "@/components/DataBadge";
import { AskActProveSection } from "@/components/AskActProveSection";
import { KisanActionVerdict } from "@/components/KisanActionVerdict";
import { MandiPriceTicker } from "@/components/MandiPriceTicker";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { getTranslation } from "@/lib/translations";
import {
  ArrowRight, ShieldCheck, MapPin, Mic, TrendingUp, Sliders, Sun, Zap, CheckCircle2, Sparkles
} from "lucide-react";

export default function LandingPage() {
  const { language } = useLanguage();
  const { weather } = useWeather();
  const t = getTranslation(language);

  return (
    <AppShell>
      <div className="space-y-16 pb-20 font-sans">
        
        {/* HERO SECTION — Stripe Clean Design */}
        <section className="bg-white border-b border-slate-200 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Hero Left Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                    {t.heroBadge}
                  </span>
                  <DataBadge type="LIVE_CEHUB" customText="OPEN-METEO TELEMETRY" />
                </div>

                <h1 className="text-4xl sm:text-6xl font-black font-display text-slate-900 tracking-tight leading-none">
                  {t.heroTitle1} <br />
                  <span className="text-[#10B981]">{t.heroTitle2}</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                  {t.heroSubtitle}
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <Link
                    href="/dashboard"
                    className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t.btnStartFarm}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/assistant"
                    className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mic className="h-4 w-4 text-amber-500" />
                    <span>{t.btnPlayVoice}</span>
                  </Link>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">{t.robiRatioLabel}</span>
                    <span className="text-lg font-bold text-slate-900">215% Net Return</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">{t.netProfitLabel}</span>
                    <span className="text-lg font-bold text-[#10B981]">₹2,760 / acre</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">LANGUAGES</span>
                    <span className="text-lg font-bold text-slate-800">12 Indian Dialects</span>
                  </div>
                </div>
              </div>

              {/* Hero Right Image & Visual Feature Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="stripe-card overflow-hidden p-2">
                  <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden">
                    <Image
                      src="/images/soybean_r2_flowering.png"
                      alt="Soybean R2 Flowering Crop"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent p-5 flex flex-col justify-end text-white">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full w-max border border-emerald-500/30">
                        Soybean R2 Stage · {weather.locationName || "Local Region"}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">{t.stressAlertTitle}</h3>
                      <p className="text-xs text-slate-200 font-mono">{t.stressAlertDesc}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* LIVE KISAN ACTION VERDICT & LIVE MANDI TICKER CONTAINER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <KisanActionVerdict />
          <MandiPriceTicker />
        </div>

        {/* ASK ACT PROVE SECTION */}
        <AskActProveSection />

        {/* PS-02 & PS-03 HACKATHON FEATURE SHOWCASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-8 sm:p-12 text-white border border-emerald-500/20 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {t.plantStressEngineBadge}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  {t.plantStressEngineTitle}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {t.plantStressEngineDesc}
                </p>
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-emerald-500/20 font-mono text-xs">
                  <div>
                    <span className="text-emerald-400 block text-[10px] font-bold">{t.forecastHorizon}</span>
                    <span className="text-white font-black text-lg">14 Days</span>
                  </div>
                  <div>
                    <span className="text-blue-400 block text-[10px] font-bold">{t.mlAccuracy}</span>
                    <span className="text-white font-black text-lg">97% CI</span>
                  </div>
                  <div>
                    <span className="text-amber-400 block text-[10px] font-bold">{t.stressTypes}</span>
                    <span className="text-white font-black text-lg">4 Modes</span>
                  </div>
                </div>
                <Link
                  href="/plant-intelligence"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg transition-all"
                >
                  <span>{t.launchPlantIntelligence}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Meteoblue NEMSGLOBAL",    desc: "7km global temperature, rainfall, evapotranspiration",    dot: "bg-sky-400"     },
                  { label: "Syngenta CE Hub API",     desc: "GDD, hydric stress, spray windows, disease risk metadata",  dot: "bg-emerald-400" },
                  { label: "GradientBoostingRegressor",desc: "14-day stress probability per day across 4 stress types",  dot: "bg-blue-400"    },
                  { label: "SHAP TreeExplainer",      desc: "Feature attribution — know WHY each stress is predicted",  dot: "bg-amber-400"   },
                  { label: "CropFit Decision Matrix", desc: "Quantis, Isabion, Amistar Top, Coucal product matching",   dot: "bg-purple-400"  },
                ].map(({ label, desc, dot }) => (
                  <div key={label} className="flex items-start gap-3 bg-white/5 rounded-xl p-3.5 border border-white/10">
                    <span className={`mt-1.5 h-2 w-2 rounded-full ${dot} shrink-0`} />
                    <div>
                      <span className="text-xs font-bold text-white block">{label}</span>
                      <span className="text-[11px] text-slate-400">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE CAPABILITY MODULES GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold text-[#10B981] uppercase tracking-wider">{t.fieldContextTitle}</span>
            <h2 className="text-3xl font-black text-slate-900">{t.mapTitle}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="stripe-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{t.navDashboard}</h3>
              <p className="text-xs text-slate-600">{t.mapDesc}</p>
              <Link href="/fields" className="text-xs font-bold text-[#10B981] flex items-center gap-1 hover:underline pt-1">
                {t.btnExploreMap} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="stripe-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{t.navAdvisory}</h3>
              <p className="text-xs text-slate-600">{t.voiceDesc}</p>
              <Link href="/assistant" className="text-xs font-bold text-amber-600 flex items-center gap-1 hover:underline pt-1">
                {t.btnPlayVoice} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="stripe-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{t.navRobi}</h3>
              <p className="text-xs text-slate-600">{t.robiDesc}</p>
              <Link href="/impact" className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline pt-1">
                {t.robiTitle} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="stripe-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{t.navWhatIf}</h3>
              <p className="text-xs text-slate-600">{t.seasonComparison}</p>
              <Link href="/what-if" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline pt-1">
                {t.navWhatIf} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="stripe-card p-6 space-y-3 border-l-4 border-l-emerald-500">
              <div className="h-10 w-10 rounded-xl bg-emerald-900 text-emerald-400 flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">PS-02/03</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{t.plantHealthAI}</h3>
              <p className="text-xs text-slate-600">{t.plantStressEngineDesc}</p>
              <Link href="/plant-intelligence" className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline pt-1">
                {t.exploreEngine} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>
        </section>

        {/* BIOSTIMULANT FEATURE HIGHLIGHT */}
        <section className="bg-white border-y border-slate-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-4">
                <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                  <Image
                    src="/images/syngenta_biological_spray.png"
                    alt="Syngenta Biostimulant Precision Spraying"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {t.recommendationTitle}
                </span>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">
                  {t.robiTitle}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t.robiDesc}
                </p>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>{t.extraYieldLabel}: +0.60 quintals / acre extra</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>{t.netProfitLabel}: ₹2,760 / acre</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>{t.exportProofCard}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/impact"
                    className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all inline-flex items-center gap-2"
                  >
                    <span>{t.exportProofCard}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
