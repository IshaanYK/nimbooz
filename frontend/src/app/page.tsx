"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";
import {
  ArrowRight,
  Sprout,
  Mic,
  TrendingUp,
  Activity,
  Package,
  Layers,
  ChevronRight,
  CloudSun,
  Store,
  Leaf,
  ShieldAlert,
  Sliders,
  Camera,
  BarChart3,
  CheckCircle2,
  Cpu,
  Clock,
  Sparkles,
  Lock,
  UserPlus,
  ShieldCheck,
  Zap,
  Globe,
  HelpCircle,
  FileText,
} from "lucide-react";

import { DynamicHeroHeadline } from "@/components/DynamicHeroHeadline";
import { CropGrowthSimulator } from "@/components/CropGrowthSimulator";
import { ROIBiophysicalSimulator } from "@/components/ROIBiophysicalSimulator";

// Safe scroll reveal hook
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { threshold }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, [threshold]);
  return { ref, visible };
}

// Count-up hook
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(target);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function LandingPage() {
  const { language } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    setIsLoggedIn(isUserLoggedIn());
  }, []);

  // Scroll reveal references
  const statsReveal = useScrollReveal();
  const cardsReveal = useScrollReveal();
  const simReveal = useScrollReveal();
  const roiReveal = useScrollReveal();
  const cropsReveal = useScrollReveal();

  // Animated count-up statistics
  const mandis = useCountUp(140, 1000);
  const crops = useCountUp(60, 900);
  const accuracy = useCountUp(100, 800);

  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  // 5 Unified Feature Cards (Stripe Design System)
  const featureCards = [
    {
      icon: <CloudSun className="h-6 w-6 text-[#533afd]" />,
      iconBg: "bg-indigo-50",
      topAccent: "bg-[#533afd]",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
      badgeText: isHindi ? "मौसम टेलीमेट्री" : "Weather Telemetry",
      title: isHindi ? "सूक्ष्म जलवायु और मौसम रडार" : "Hyperlocal Weather Radar",
      desc: isHindi
        ? "14-दिन का सटीक कृषि मौसम पूर्वानुमान, हवा की गति, मिट्टी की नमी और सुरक्षित स्प्रे विंडो।"
        : "14-day agrometeorological forecast, humidity, wind velocity, and safe spray timing.",
      cta: isHindi ? "मौसम देखें" : "Explore Weather",
      ctaCls: "text-[#533afd] hover:text-[#4434d4] bg-indigo-50 hover:bg-indigo-100",
      href: "/plant-intelligence",
      tag: "PS-02",
    },
    {
      icon: <Store className="h-6 w-6 text-emerald-600" />,
      iconBg: "bg-emerald-50",
      topAccent: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      badgeText: isHindi ? "सरकारी मंडी भाव" : "Mandi Network",
      title: isHindi ? "लाइव APMC मंडी भाव नेटवर्क" : "140+ APMC Mandi Network",
      desc: isHindi
        ? "140+ मंडियों से न्यूनतम, अधिकतम व मोडल भाव वास्तविक समय में सीधे सरकारी पोर्टल से सत्यापित।"
        : "Live verified rates across 140+ APMC mandis with min, max, and modal price trends.",
      cta: isHindi ? "मंडी भाव देखें" : "View Mandi Rates",
      ctaCls: "text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100",
      href: "/dashboard",
      tag: "APMC",
    },
    {
      icon: <Leaf className="h-6 w-6 text-amber-600" />,
      iconBg: "bg-amber-50",
      topAccent: "bg-amber-500",
      badge: "bg-amber-50 text-amber-700 border-amber-200/80",
      badgeText: isHindi ? "बहु-फसली AI" : "Multi-Crop AI",
      title: isHindi ? "60+ फसलों की वैज्ञानिक सलाह" : "Certified Agronomic Protocols",
      desc: isHindi
        ? "फसल की वृद्धि अवस्था, तापमान और नमी के अनुसार सही दवा, खुराक और पानी का अनुपात।"
        : "Phenological stage matching for biological sprays and optimal intervention windows.",
      cta: isHindi ? "AI से पूछें" : "Ask AI Advisor",
      ctaCls: "text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100",
      href: "/assistant",
      tag: "PS-03",
    },
    {
      icon: <ShieldAlert className="h-6 w-6 text-violet-600" />,
      iconBg: "bg-violet-50",
      topAccent: "bg-violet-500",
      badge: "bg-violet-50 text-violet-700 border-violet-200/80",
      badgeText: isHindi ? "रोग पहचान" : "Disease Vision",
      title: isHindi ? "AI दृष्टि रोग व कीट पहचान" : "Multimodal Vision Diagnostics",
      desc: isHindi
        ? "पत्ती की फोटो अपलोड कर तुरंत बीमारी का नाम, क्षति स्तर और सही रासायनिक उपचार जानें।"
        : "Upload leaf photos to get instant disease classification and curative dosage.",
      cta: isHindi ? "पत्ती स्कैन करें" : "Scan Leaf",
      ctaCls: "text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100",
      href: "/plant-intelligence",
      tag: "PS-01",
    },
    {
      icon: <Sliders className="h-6 w-6 text-sky-600" />,
      iconBg: "bg-sky-50",
      topAccent: "bg-sky-500",
      badge: "bg-sky-50 text-sky-700 border-sky-200/80",
      badgeText: isHindi ? "ROBI सिमुलेटर" : "ROBI Simulator",
      title: isHindi ? "ROBI लाभ व उपज कैलकुलेटर" : "What-If Profit Matrix",
      desc: isHindi
        ? "स्प्रे के खर्च बनाम उपज सुरक्षा का सटीक गणित देखकर अपने खेत का शुद्ध मुनाफा बढ़ाएं।"
        : "Simulate spray dosage against yield protection to maximize net farm profits.",
      cta: isHindi ? "गणना करें" : "Simulate Profit",
      ctaCls: "text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100",
      href: "/what-if",
      tag: "PS-06",
    },
  ];

  return (
    <AppShell>
      <div className="bg-[#ffffff] text-[#0d253d] min-h-screen">
        
        {/* Dynamic Hero Section (Stripe Aesthetic) with Phone Mockup */}
        <DynamicHeroHeadline />

        {/* ── 1. Institutional Validation & Live Metric Band ─────────────────────── */}
        <section
          ref={statsReveal.ref}
          className="border-y border-[#e3e8ee] bg-[#f6f9fc] py-10 transition-all duration-700"
          style={{
            opacity: statsReveal.visible ? 1 : 0,
            transform: statsReveal.visible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              
              <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-xs">
                <p className="text-3xl sm:text-4xl font-black text-[#533afd] font-mono tracking-tight">
                  {mandis}+
                </p>
                <p className="text-xs font-bold text-[#0d253d] mt-1">
                  {isHindi ? "लाइव APMC मंडियां" : "Live APMC Mandis"}
                </p>
                <p className="text-[11px] text-[#64748d]">
                  {isHindi ? "10 प्रमुख कृषि राज्य" : "Covering 10 Major States"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-xs">
                <p className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono tracking-tight">
                  {crops}+
                </p>
                <p className="text-xs font-bold text-[#0d253d] mt-1">
                  {isHindi ? "समर्थित फसलें" : "Crops Supported"}
                </p>
                <p className="text-[11px] text-[#64748d]">
                  {isHindi ? "अनाज, दलहन, तिलहन व बागवानी" : "Cereals, Pulses, Cash & Veg"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-xs">
                <p className="text-3xl sm:text-4xl font-black text-amber-600 font-mono tracking-tight">
                  12+
                </p>
                <p className="text-xs font-bold text-[#0d253d] mt-1">
                  {isHindi ? "भारतीय भाषाएं" : "Indian Languages"}
                </p>
                <p className="text-[11px] text-[#64748d]">
                  {isHindi ? "आवाज व टेक्स्ट दोनों में" : "Voice STT & TTS Audio"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-xs">
                <p className="text-3xl sm:text-4xl font-black text-violet-600 font-mono tracking-tight">
                  {accuracy}%
                </p>
                <p className="text-xs font-bold text-[#0d253d] mt-1">
                  {isHindi ? "सरकारी डेटा संरेखण" : "Grounded Telemetry"}
                </p>
                <p className="text-[11px] text-[#64748d]">
                  {isHindi ? "Open-Meteo व Agmarknet" : "Zero-Hallucination Engine"}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. Interactive Crop Growth & Phenology Simulation Section ──────────── */}
        <section
          ref={simReveal.ref}
          className="py-16 sm:py-20 border-b border-[#e3e8ee] bg-[#ffffff]"
          style={{
            opacity: simReveal.visible ? 1 : 0,
            transform: simReveal.visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
              <span className="inline-flex items-center gap-1.5 bg-[#533afd]/10 text-[#533afd] border border-[#533afd]/20 rounded-full px-3.5 py-1 text-xs font-bold font-mono uppercase tracking-wider">
                Agronomic Simulation Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0d253d] font-display tracking-tight">
                {isHindi ? "फसल वृद्धि और जैविक सुरक्षा सिमुलेशन" : "Interactive Crop Phenology & Growth Simulation"}
              </h2>
              <p className="text-sm sm:text-base text-[#64748d]">
                {isHindi
                  ? "अंकुरण से लेकर कटाई तक, हर अवस्था में पौधे की जड़, तना, पानी की मांग और तापमान संवेदनशीलता को लाइव मापें।"
                  : "Explore dynamic physiological milestones, degree days (GDD), evapotranspiration, and certified protective actions."}
              </p>
            </div>

            {/* Interactive Crop Growth Simulator */}
            <CropGrowthSimulator />
          </div>
        </section>

        {/* ── 3. Unified Feature Grid (5 Tools) ────────────────────────────────── */}
        <section
          ref={cardsReveal.ref}
          className="py-16 sm:py-20 border-b border-[#e3e8ee] bg-[#f6f9fc]"
          style={{
            opacity: cardsReveal.visible ? 1 : 0,
            transform: cardsReveal.visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="inline-flex items-center gap-1.5 bg-[#533afd]/10 text-[#533afd] border border-[#533afd]/20 rounded-full px-3.5 py-1 text-xs font-bold font-mono uppercase tracking-wider">
                Platform Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0d253d] font-display tracking-tight">
                {isHindi ? "एक ही जगह संपूर्ण कृषि नियंत्रण" : "A Unified Operating System for Farming"}
              </h2>
              <p className="text-sm sm:text-base text-[#64748d]">
                {isHindi
                  ? "सेंसर्स, उपग्रह, मंडी डेटा और आधुनिक AI मिलकर किसान को हर कदम पर सही निर्णय लेने की शक्ति देते हैं।"
                  : "Satellite telemetry, mandi intelligence, and multi-crop biological models integrated into one interface."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureCards.map((c, i) => (
                <div
                  key={c.tag}
                  className="group relative bg-white border border-[#e3e8ee] rounded-3xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`h-12 w-12 rounded-2xl ${c.iconBg} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                        {c.icon}
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${c.badge}`}>
                        {c.badgeText}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-[#0d253d] font-display">
                        {c.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#64748d] leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100">
                    <Link
                      href={isLoggedIn ? c.href : "/signup"}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${c.ctaCls}`}
                    >
                      <span>{c.cta}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── 4. Interactive ROBI & ROI Calculator ─────────────────────────────── */}
        <section
          ref={roiReveal.ref}
          className="py-16 sm:py-20 bg-[#ffffff] border-b border-[#e3e8ee]"
          style={{
            opacity: roiReveal.visible ? 1 : 0,
            transform: roiReveal.visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <ROIBiophysicalSimulator />
          </div>
        </section>

        {/* ── 5. Connected Navigation Directory Section ─────────────────────────── */}
        <section className="py-16 sm:py-20 bg-[#f6f9fc] border-b border-[#e3e8ee]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0d253d] font-display">
                {isHindi ? "AASRA प्लेटफ़ॉर्म की सभी शाखाएँ" : "Explore All Platform Modules"}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748d]">
                {isHindi ? "सभी पृष्ठ एक दूसरे से जुड़े हैं, किसी भी टूल को तुरंत शुरू करें:" : "Seamlessly navigate through any module of the AASRA agricultural operating system:"}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { href: "/how-it-works", label: isHindi ? "हाउ इट वर्क्स" : "How It Works", desc: isHindi ? "प्लेटफॉर्म कार्यप्रणाली" : "Step-by-step tour", icon: Sparkles, color: "text-[#533afd] bg-indigo-50" },
                { href: "/product", label: isHindi ? "उत्पाद विशेषताएँ" : "Product & Features", desc: isHindi ? "संपूर्ण तकनीकी फीचर्स" : "Full capability spec", icon: Layers, color: "text-blue-600 bg-blue-50" },
                { href: "/impact-story", label: isHindi ? "सफलता की कहानियाँ" : "Impact Stories", desc: isHindi ? "किसानों के अनुभव" : "Attributed farmer ROI", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
                { href: "/architecture", label: isHindi ? "आर्किटेक्चर" : "Architecture", desc: isHindi ? "PS-01 से PS-07 विवरण" : "Technical system notes", icon: FileText, color: "text-purple-600 bg-purple-50" },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="p-5 rounded-2xl bg-white border border-[#e3e8ee] hover:border-[#533afd]/40 shadow-xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className={`h-10 w-10 rounded-xl ${m.color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-bold text-[#0d253d] group-hover:text-[#533afd] transition-colors">
                        {m.label}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {m.desc}
                      </p>
                    </div>
                    <div className="pt-3 mt-2 flex items-center gap-1 text-[11px] font-bold text-[#533afd]">
                      <span>{isHindi ? "देखें" : "Explore"}</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 6. Bottom High-Converting Sign Up CTA Banner ──────────────────────── */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-indigo-50/50">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 text-center space-y-6">
            
            <div className="h-16 w-16 mx-auto rounded-3xl bg-[#533afd] text-white flex items-center justify-center shadow-xl shadow-[#533afd]/25">
              <Sprout className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-5xl font-bold text-[#0d253d] font-display tracking-tight">
                {isHindi ? "आज ही अपनी खेती को स्मार्ट बनाएं" : "Ready to Modernize Your Farm Operations?"}
              </h2>
              <p className="text-sm sm:text-base text-[#64748d] max-w-xl mx-auto">
                {isHindi
                  ? "AASRA से जुड़ें और लाइव मौसम, 140+ मंडियों के भाव व AI सुरक्षा सलाह से अपनी फसल का उत्पादन और आमदनी बढ़ाएं।"
                  : "Join thousands of farmers leveraging grounded telemetry, verified APMC prices, and precision AI advisory."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href={isLoggedIn ? "/dashboard" : "/signup"}
                className="px-8 py-4 rounded-xl text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
                  boxShadow: "0 8px 25px rgba(83, 58, 253, 0.35)",
                }}
              >
                <UserPlus className="h-4 w-4" />
                <span>{isLoggedIn ? (isHindi ? "मेरा डैशबोर्ड खोलें" : "Open Dashboard") : (isHindi ? "नया किसान खाता बनाएं (Free)" : "Create Free Farmer Account")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/how-it-works"
                className="px-6 py-4 rounded-xl text-[#0d253d] bg-white border border-[#e3e8ee] hover:border-[#533afd]/40 hover:text-[#533afd] font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-[#533afd]" />
                <span>{isHindi ? "हाउ इट वर्क्स देखें" : "Explore How It Works"}</span>
              </Link>
            </div>

            <p className="text-xs text-slate-400 pt-2">
              {isHindi ? "✓ बिना किसी क्रेडिट कार्ड के · 100% मुफ्त किसान सेवा" : "✓ No payment required · 100% Free Public Good for Farmers"}
            </p>

          </div>
        </section>

      </div>
    </AppShell>
  );
}
