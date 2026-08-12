"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { DataBadge } from "@/components/DataBadge";
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
        
        {/* HERO SECTION — Clean Stripe Design */}
        <section className="bg-white border-b border-slate-200 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Hero Left Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                    SYNGENTA BIOLOGICALS OVERWATCH
                  </span>
                  <DataBadge type="LIVE_CEHUB" customText="OPEN-METEO TELEMETRY" />
                </div>

                <h1 className="text-4xl sm:text-6xl font-black font-display text-slate-900 tracking-tight leading-none">
                  AI Yield Protection & <br />
                  <span className="text-[#10B981]">Biological Science.</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                  AASRA monitors real-time night heat stress, delivers voice guidance in 12 Indian languages, and proves exact net profit from Syngenta biological products.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <Link
                    href="/dashboard"
                    className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Open Field Overwatch</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/assistant"
                    className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-extrabold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Mic className="h-4 w-4 text-amber-500" />
                    <span>Try Multilingual Voice AI</span>
                  </Link>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">VERIFIED ROBI</span>
                    <span className="text-lg font-bold text-slate-900">215% Net Return</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">EXTRA PROFIT</span>
                    <span className="text-lg font-bold text-[#10B981]">₹2,760 / acre</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">LANGUAGES</span>
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
                      <h3 className="text-lg font-bold text-white mt-1">Night Temp &gt; 25°C Scorch Threshold</h3>
                      <p className="text-xs text-slate-200 font-mono">Syngenta Stress Buster restores 75% yield potential</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4 CORE CAPABILITY MODULES GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold text-[#10B981] uppercase tracking-wider">CORE PLATFORM ARCHITECTURE</span>
            <h2 className="text-3xl font-black text-slate-900">Engineered for Precision Agriculture</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="stripe-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Field Map & Boundary Store</h3>
              <p className="text-xs text-slate-600">Point-and-click polygon drawing, Shoelace area calculation, and persistent database file storage.</p>
              <Link href="/fields" className="text-xs font-bold text-[#10B981] flex items-center gap-1 hover:underline pt-1">
                Explore Map <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="stripe-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Multilingual Voice & Vision AI</h3>
              <p className="text-xs text-slate-600">Google Chirp 3 HD audio streaming in 12 Indian languages + Gemini 2.0 Flash leaf scanner.</p>
              <Link href="/assistant" className="text-xs font-bold text-amber-600 flex items-center gap-1 hover:underline pt-1">
                Ask AASRA AI <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="stripe-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">ROBI Attribution Proof Engine</h3>
              <p className="text-xs text-slate-600">Disentangle weather noise from biological gains with modelled yield decomposition trees.</p>
              <Link href="/impact" className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline pt-1">
                View ROBI Proof <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="stripe-card p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">What-If Intervention Simulator</h3>
              <p className="text-xs text-slate-600">Simulate spray delay penalties (0–7 days) and forecast net profit in real time.</p>
              <Link href="/what-if" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline pt-1">
                Run Simulation <ArrowRight className="h-3.5 w-3.5" />
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
                  PS-07 BIOLOGICAL PROTECTION
                </span>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">
                  Protecting Flowering Yield Against Night Heat Stress
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  When night temperatures cross 25°C during R2 flowering, heat shock proteins degrade rapidly, causing up to 2.8% yield loss per degree-hour. Syngenta Stress Buster restores 75% of lost yield potential.
                </p>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>Calculates net yield gain: +0.60 quintals / acre extra</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>Subtracts treatment cost (₹1,280/acre) to prove net profit (₹2,760/acre)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                    <span>Generates 1-click verified ROBI attribution proof certificate</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/impact"
                    className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all inline-flex items-center gap-2"
                  >
                    <span>View ROBI Proof Card</span>
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
