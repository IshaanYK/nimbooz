"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CloudRain,
  Store,
  Leaf,
  ShieldAlert,
  Play,
  ArrowRight,
  MapPin,
  Sprout,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Lock,
  Activity,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";
import { useFarm } from "@/context/FarmContext";
import { PhoneMockup } from "@/components/PhoneMockup";

const featureChips = [
  {
    icon: <CloudRain className="h-4 w-4 text-[#533afd]" />,
    label: "रियल-टाइम मौसम टेलीमेट्री",
    sublabel: "14-दिन सटीक सूक्ष्म पूर्वानुमान",
    labelEn: "Micro-Weather Radar",
    sublabelEn: "14-Day Hyperlocal Forecast",
    bg: "bg-indigo-50/70 hover:bg-indigo-50",
    border: "border-indigo-100 hover:border-indigo-300",
    text: "text-indigo-950",
    subtext: "text-indigo-700/80",
    iconBg: "bg-indigo-100/80",
    delay: "300ms",
  },
  {
    icon: <Store className="h-4 w-4 text-emerald-600" />,
    label: "सत्यापित मंडी भाव",
    sublabel: "140+ लाइव APMC सरकारी मंडियां",
    labelEn: "APMC Mandi Network",
    sublabelEn: "140+ Verified Live Markets",
    bg: "bg-emerald-50/70 hover:bg-emerald-50",
    border: "border-emerald-100 hover:border-emerald-300",
    text: "text-emerald-950",
    subtext: "text-emerald-700/80",
    iconBg: "bg-emerald-100/80",
    delay: "400ms",
  },
  {
    icon: <Leaf className="h-4 w-4 text-amber-600" />,
    label: "बहु-फसली AI सलाहकार",
    sublabel: "60+ फसलों का वैज्ञानिक मार्गदर्शन",
    labelEn: "Multi-Crop AI Advisory",
    sublabelEn: "60+ Certified Crop Protocols",
    bg: "bg-amber-50/70 hover:bg-amber-50",
    border: "border-amber-100 hover:border-amber-300",
    text: "text-amber-950",
    subtext: "text-amber-700/80",
    iconBg: "bg-amber-100/80",
    delay: "500ms",
  },
  {
    icon: <ShieldAlert className="h-4 w-4 text-violet-600" />,
    label: "AI दृष्टि रोग व कीट पहचान",
    sublabel: "पत्ती स्कैन से तुरंत सटीक समाधान",
    labelEn: "Vision Diagnostics",
    sublabelEn: "Instant Leaf Necrosis Analysis",
    bg: "bg-violet-50/70 hover:bg-violet-50",
    border: "border-violet-100 hover:border-violet-300",
    text: "text-violet-950",
    subtext: "text-violet-700/80",
    iconBg: "bg-violet-100/80",
    delay: "600ms",
  },
];

export const DynamicHeroHeadline: React.FC = () => {
  const { language } = useLanguage();
  const { activeFarm } = useFarm();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(isUserLoggedIn());
  }, []);

  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  const headline1 = isHindi ? "डेटा से समझदारी," : "Data-Driven Decisions,";
  const headline2 = isHindi ? "समझदारी से" : "Engineered for";
  const highlight = isHindi ? "समृद्धि।" : "Agricultural Growth.";
  const subtext = isHindi
    ? "AASRA का अत्याधुनिक AI प्लेटफॉर्म भारत के किसानों को लाइव मौसम टेलीमेट्री, सत्यापित APMC मंडी भाव, 60+ फसलों की व्यक्तिगत सलाह और AI रोग पहचान प्रदान करता है।"
    : "AASRA delivers hyper-local satellite telemetry, certified APMC mandi prices, multi-crop agronomic advisory, and computer-vision disease diagnosis tailored for Indian agriculture.";
  const ctaPrimary = isLoggedIn
    ? (isHindi ? "मेरा खेत खोलें" : "Go to Dashboard")
    : (isHindi ? "अपनी खेती शुरू करें (निःशुल्क)" : "Start Free Farm Account");
  const ctaSecondary = isHindi ? "प्लेटफॉर्म कैसे काम करता है" : "How It Works";
  const ctaNote = isHindi ? "30 सेकंड में साइन अप करें · 100% निःशुल्क किसान सेवा" : "Sign up in 30 seconds · 100% Free for Farmers";

  return (
    <section
      className="relative overflow-hidden border-b border-[#e3e8ee]"
      style={{
        background: "radial-gradient(120% 120% at 50% 0%, #FFFFFF 0%, #F8FAFC 45%, #EEF2FF 100%)",
        minHeight: "calc(100vh - 68px)",
      }}
    >
      {/* Atmospheric Stripe-style gradient mesh */}
      <div
        className="absolute top-[-140px] left-[5%] w-[640px] h-[640px] rounded-full opacity-25 pointer-events-none blur-3xl"
        style={{ background: "radial-gradient(circle, #533afd 0%, #665efd 35%, #b9b9f9 70%, transparent 85%)" }}
      />
      <div
        className="absolute top-[-60px] right-[10%] w-[520px] h-[520px] rounded-full opacity-20 pointer-events-none blur-3xl"
        style={{ background: "radial-gradient(circle, #f5e9d4 0%, #f96bee 40%, #533afd 75%, transparent 90%)" }}
      />
      <div
        className="absolute top-[28%] left-[30%] w-[480px] h-[480px] rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: "radial-gradient(circle, #0ea5e9 0%, #10b981 50%, transparent 80%)" }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[calc(100vh-68px)] py-10 lg:py-16">

          {/* ── LEFT COLUMN: Headline, Chips, CTAs (Span 7) ─────────────────── */}
          <div className="lg:col-span-7 space-y-6 lg:pr-4">
            
            {/* 1. Trust badge */}
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 400ms ease 100ms, transform 400ms ease 100ms",
              }}
            >
              <div className="inline-flex items-center gap-2 bg-white border border-[#e3e8ee] rounded-full px-3.5 py-1.5 text-xs font-bold text-[#0d253d] shadow-xs hover:border-[#533afd]/40 transition-colors">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#533afd] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#533afd]"></span>
                </span>
                <span className="text-[#0d253d] font-semibold">Google Gemini 2.5 Flash</span>
                <span className="text-slate-300">·</span>
                <span className="text-[#533afd] font-mono font-semibold">Open-Meteo Telemetry</span>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-700 font-mono font-semibold">140+ APMC Mandis</span>
              </div>
            </div>

            {/* 2. Headline */}
            <div
              className="space-y-1"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 500ms ease 200ms, transform 500ms ease 200ms",
              }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-bold text-[#0d253d] leading-[1.08] tracking-tight font-display">
                {headline1}
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-bold text-[#0d253d] leading-[1.08] tracking-tight font-display">
                <span>{headline2} </span>
                <span
                  className="bg-gradient-to-r from-[#533afd] via-[#4434d4] to-[#0ea5e9] bg-clip-text text-transparent font-black"
                >
                  {highlight}
                </span>
              </h1>
            </div>

            {/* 3. Description */}
            <p
              className="text-sm sm:text-base text-[#64748d] leading-relaxed max-w-xl font-normal"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(14px)",
                transition: "opacity 500ms ease 350ms, transform 500ms ease 350ms",
              }}
            >
              {subtext}
            </p>

            {/* 4. Feature chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg pt-1">
              {featureChips.map((chip) => (
                <div
                  key={chip.label}
                  className={`group flex items-center gap-3 ${chip.bg} border ${chip.border} rounded-xl px-3.5 py-3 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer`}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(14px)",
                    transition: `opacity 450ms ease ${chip.delay}, transform 450ms cubic-bezier(0.16, 1, 0.3, 1) ${chip.delay}`,
                  }}
                >
                  <div className={`${chip.iconBg} rounded-lg p-2 shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                    {chip.icon}
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-xs font-bold ${chip.text} leading-tight`}>
                      {isHindi ? chip.label : chip.labelEn}
                    </p>
                    <p className={`text-[11px] ${chip.subtext} leading-tight`}>
                      {isHindi ? chip.sublabel : chip.sublabelEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 5. CTA buttons & Trust Note */}
            <div
              className="space-y-3 pt-2"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(14px)",
                transition: "opacity 500ms ease 650ms, transform 500ms ease 650ms",
              }}
            >
              <div className="flex flex-wrap items-center gap-3.5">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/signup"}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
                    boxShadow: "0 6px 20px rgba(83, 58, 253, 0.28)",
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{ctaPrimary}</span>
                  <ArrowRight className="h-4 w-4 ml-0.5" />
                </Link>

                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-[#0d253d] bg-white border border-[#e3e8ee] hover:border-[#533afd]/40 hover:text-[#533afd] shadow-xs hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-[#533afd]" />
                  <span>{ctaSecondary}</span>
                </Link>
              </div>

              {/* Dynamic location pill + trust note */}
              <div className="flex items-center gap-2.5 text-xs text-slate-500 pt-1">
                {mounted && activeFarm?.district ? (
                  <span className="inline-flex items-center gap-1 bg-white border border-[#e3e8ee] rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs">
                    <MapPin className="h-3 w-3 text-[#533afd]" />
                    <span>{activeFarm.district}{activeFarm.state ? `, ${activeFarm.state}` : ""}</span>
                  </span>
                ) : null}
                <span className="text-[11px] text-slate-500 font-medium">✓ {ctaNote}</span>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: Interactive Smartphone Web App Mockup (Span 5) ───────────── */}
          <div
            className="lg:col-span-5 relative flex items-center justify-center py-4"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 600ms ease 300ms, transform 600ms ease 300ms",
            }}
          >
            <PhoneMockup
              location={mounted && activeFarm?.district ? `${activeFarm.district}, ${activeFarm.state || "Madhya Pradesh"}` : undefined}
              temperature={28}
              crop="गेहूं (Wheat)"
              mandiPrice={2420}
            />
          </div>

        </div>
      </div>
    </section>
  );
};
