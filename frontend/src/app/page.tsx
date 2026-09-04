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
  ChevronDown,
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  // 6 Unified Feature Cards (Stripe Design System: Balanced 3x2 Grid)
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
      isExternal: false,
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
      isExternal: false,
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
      isExternal: false,
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
      isExternal: false,
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
      isExternal: false,
    },
    {
      icon: <Mic className="h-6 w-6 text-[#533afd]" />,
      iconBg: "bg-indigo-50",
      topAccent: "bg-[#533afd]",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
      badgeText: isHindi ? "24/7 वॉइस व व्हाट्सएप" : "Voice & WhatsApp",
      title: isHindi ? "12 देशी भाषाओं में वॉइस व व्हाट्सएप AI" : "24/7 Voice & WhatsApp Kisan Bot",
      desc: isHindi
        ? "अपनी भाषा में बोलकर या व्हाट्सएप पर कृषि सलाह, फसल रोग पहचान व मंडी भाव तुरंत पाएं।"
        : "Speak naturally in 12 Indian languages or message on WhatsApp (+1 555-669-4548) for verified field insights.",
      cta: isHindi ? "व्हाट्सएप पर पूछें" : "Chat on WhatsApp",
      ctaCls: "text-[#533afd] hover:text-[#4434d4] bg-indigo-50 hover:bg-indigo-100",
      href: "https://wa.me/15556694548?text=Namaste",
      tag: "PS-04",
      isExternal: true,
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
                    {c.isExternal ? (
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${c.ctaCls}`}
                      >
                        <span>{c.cta}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </a>
                    ) : (
                      <Link
                        href={isLoggedIn ? c.href : "/signup"}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${c.ctaCls}`}
                      >
                        <span>{c.cta}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── 3.5 Stripe Design System: Warm Cream Interlude Band (card-cream-band) ── */}
        <section className="py-16 sm:py-20 bg-[#FBF8F3] border-b border-[#F0E6D2]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
              <span className="inline-flex items-center gap-1.5 bg-[#9b6829]/10 text-[#9b6829] border border-[#9b6829]/20 rounded-full px-3.5 py-1 text-xs font-bold font-mono uppercase tracking-wider">
                {isHindi ? "वैज्ञानिक विश्वसनीयता मानक" : "Grounded Agricultural Infrastructure"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0d253d] font-display tracking-tight">
                {isHindi ? "काल्पनिक सलाह नहीं — केवल सत्यापित वैज्ञानिक आधार" : "No Hallucinations. Only Grounded Agronomic Truth."}
              </h2>
              <p className="text-sm sm:text-base text-[#61718a] leading-relaxed">
                {isHindi
                  ? "AASRA बिना सत्यापन के कोई सुझाव नहीं देता। हमारा AI इंजन हर सलाह को उपग्रह मौसम, वास्तविक मंडी भाव और ICAR द्वारा परीक्षित 50 सुरक्षा नियमों पर परखता है।"
                  : "Every AI advisory generated by AASRA passes through strict deterministic bounds — aligning Open-Meteo micro-climate feeds, live APMC mandis, and certified ICAR chemical dosages before reaching the farmer."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: isHindi ? "शून्य भ्रम गारंटी" : "Zero-Hallucination Guardrail",
                  desc: isHindi
                    ? "जेमिनी 2.5 फ्लैश मॉडल को खेत के वास्तविक सेंसर डेटा और सिंजेंटा सुरक्षा सीमाओं में बांधा गया है।"
                    : "Strict biophysical grounding bounds Gemini 2.5 Flash to real sensor telemetry and certified thresholds.",
                  badge: "ICAR Validated",
                  badgeCls: "bg-emerald-100/80 text-emerald-800",
                },
                {
                  step: "02",
                  title: isHindi ? "लाइव मंडी संरेखण" : "Direct APMC Ingestion",
                  desc: isHindi
                    ? "140+ सरकारी कृषि मंडियों से न्यूनतम, अधिकतम व मॉडल भाव सीधे ई-नाम और सरकारी डेटाबेस से प्राप्त।"
                    : "Live streaming modal prices across 140+ APMC mandis directly indexed from government market registries.",
                  badge: "Agmarknet Verified",
                  badgeCls: "bg-blue-100/80 text-blue-800",
                },
                {
                  step: "03",
                  title: isHindi ? "सूक्ष्म मौसम टेलीमेट्री" : "Hyperlocal Weather Radar",
                  desc: isHindi
                    ? "खेत के अक्षांश-देशांतर पर आधारित 14-दिन का सटीक तापमान, नमी, हवा और सुरक्षित स्प्रे विंडो समय।"
                    : "GPS-coordinate-level agrometeorological forecasting calculating drift hazards and thermal flower-drop risks.",
                  badge: "Open-Meteo Satellite",
                  badgeCls: "bg-indigo-100/80 text-indigo-800",
                },
                {
                  step: "04",
                  title: isHindi ? "12 देशी भाषाओं में आवाज" : "Native Multilingual Voice",
                  desc: isHindi
                    ? "हिंदी, मराठी, पंजाबी, गुजराती आदि में प्राकृतिक आवाज से प्रश्न पूछें और तत्काल ऑडियो सलाह सुनें।"
                    : "Zero-latency neural TTS & STT across 12 Indian regional languages with WhatsApp and Web App parity.",
                  badge: "Google Neural Voice",
                  badgeCls: "bg-amber-100/80 text-amber-800",
                },
              ].map((pillar) => (
                <div
                  key={pillar.step}
                  className="bg-white border border-[#E9DEC8] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#9b6829] bg-[#F5E9D4] px-2.5 py-0.5 rounded-full">
                        {pillar.step}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${pillar.badgeCls}`}>
                        {pillar.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#0d253d] font-display">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#61718a] leading-relaxed">
                      {pillar.desc}
                    </p>
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

        {/* ── 5.5 Frequently Asked Questions (Stripe Design System Accordion) ── */}
        <section className="py-16 sm:py-24 bg-[#ffffff] border-b border-[#e3e8ee]">
          <div className="max-w-[880px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <span className="inline-flex items-center gap-1.5 bg-[#533afd]/10 text-[#533afd] border border-[#533afd]/20 rounded-full px-3.5 py-1 text-xs font-bold font-mono uppercase tracking-wider">
                {isHindi ? "अक्सर पूछे जाने वाले सवाल" : "Frequently Asked Questions"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0d253d] font-display tracking-tight">
                {isHindi ? "AASRA से जुड़े आपके सभी सवालों के जवाब" : "Clear Answers for Every Farmer"}
              </h2>
              <p className="text-sm sm:text-base text-[#64748d]">
                {isHindi
                  ? "यदि आपका कोई और प्रश्न है, तो आप हमारी 24/7 AI वॉइस हेल्पलाइन या व्हाट्सएप पर तुरंत पूछ सकते हैं।"
                  : "Have questions about offline field usage, APMC mandi rates, or AI safety? Explore our verified answers below."}
              </p>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  qHi: "क्या AASRA किसानों के लिए पूरी तरह निःशुल्क है?",
                  qEn: "Is AASRA 100% free for smallholder farmers?",
                  aHi: "हाँ, AASRA को सिंजेंटा बायोलॉजिकल्स और सार्वजनिक कृषि नवाचार के तहत विकसित किया गया है। 14-दिन का उपग्रह मौसम रडार, 140+ APMC मंडियों के ताजा भाव, फसल रोग पहचान व वॉइस सलाहकार सभी किसानों के लिए आजीवन 100% निःशुल्क हैं।",
                  aEn: "Yes, AASRA is developed as a public-good agricultural decision support system under the Syngenta Biologicals initiative. All 14-day satellite weather radars, 140+ APMC mandi price feeds, leaf vision diagnostics, and multilingual voice AI are 100% free forever.",
                },
                {
                  qHi: "क्या खेत में इंटरनेट कमजोर होने पर भी यह काम करता है?",
                  qEn: "Does AASRA work in remote fields with poor internet connectivity?",
                  aHi: "हाँ! AASRA एक प्रोग्रेसिव वेब ऐप (PWA) है जो फोन में ऑफलाइन डेटा स्टोर कर लेती है। साथ ही आप हमारे आधिकारिक व्हाट्सएप बॉट (+1 555-669-4548) पर 2G/3G नेटवर्क पर भी वही सटीक मौसम व मंडी भाव सीधे प्राप्त कर सकते हैं।",
                  aEn: "Yes! AASRA is engineered as an offline-first Progressive Web App (PWA) that caches recent farm telemetry. You can also chat directly with our official WhatsApp Bot (+1 555-669-4548) which performs seamlessly even on 2G and 3G mobile data.",
                },
                {
                  qHi: "AI द्वारा दी गई दवा और खुराक कितनी सुरक्षित है?",
                  qEn: "How does AASRA ensure agricultural advice and dosages are safe?",
                  aHi: "सामान्य चैटबॉट के विपरीत, AASRA कभी काल्पनिक दवाइयां नहीं बताता। Google Gemini 2.5 Flash मॉडल को ICAR द्वारा प्रमाणित 50 रासायनिक व जैविक सुरक्षा नियमों और खेत के तापमान-नमी पर परखा जाता है ताकि फसल को किसी भी स्प्रे से नुकसान न हो।",
                  aEn: "Unlike generic LLMs that hallucinate, AASRA grounds Google Gemini 2.5 Flash against deterministic biophysical models. Every spray recommendation is verified against current wind drift, temperature, and ICAR dosage limits to protect crop safety.",
                },
                {
                  qHi: "मंडी भाव कहाँ से आते हैं और कितने ताजे होते हैं?",
                  qEn: "Where do APMC mandi prices come from and how fresh are they?",
                  aHi: "हमारा मंडी इंजन हर सुबह भारत सरकार के Agmarknet और e-NAM पोर्टल से सीधे 140+ प्रमुख मंडियों (भोपाल, सीहोर, इंदौर, राजकोट, खन्ना, कोटा, लातूर आदि) के न्यूनतम, अधिकतम व मोडल भाव स्वचालित रूप से सत्यापित करता है।",
                  aEn: "Our mandi intelligence engine ingests daily morning auction records directly from government Agmarknet & e-NAM market registries across 140+ active mandis in 10 states, delivering verified min, max, and modal rates.",
                },
                {
                  qHi: "क्या मैं बोलकर अपनी क्षेत्रीय भाषा में बात कर सकता हूँ?",
                  qEn: "Can I speak naturally in my regional language?",
                  aHi: "हाँ, AASRA में 12 भारतीय भाषाओं (हिंदी, मराठी, पंजाबी, गुजराती, तेलुगु, तमिल, कन्नड़, मलयालम, बांग्ला, उड़िया, असमिया व अंग्रेजी) में लाइव आवाज पहचान और गूगल न्यूरल ऑडियो वॉइस उपलब्ध है। बस माइक बटन दबाएं और बोलें।",
                  aEn: "Yes, AASRA provides seamless voice speech-to-text and Google Neural Audio playback across 12 Indian regional languages. Simply tap the microphone button on the web app or send a voice note on WhatsApp.",
                },
              ].map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#e3e8ee] rounded-2xl overflow-hidden bg-white shadow-xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold text-[#0d253d] font-display">
                        {isHindi ? faq.qHi : faq.qEn}
                      </span>
                      <div
                        className={`p-1.5 rounded-full transition-transform duration-200 shrink-0 ${
                          isOpen
                            ? "rotate-180 bg-indigo-50 text-[#533afd]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#64748d] leading-relaxed border-t border-slate-100 pt-4 animate-in fade-in duration-150">
                        {isHindi ? faq.aHi : faq.aEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 6. Industry-Grade High-Impact CTA Showcase ──────────────────────── */}
        <section className="py-16 sm:py-24 bg-[#ffffff]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="relative rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-[#0d253d] via-[#112d4e] to-[#0d253d] border border-indigo-500/30 text-white p-8 sm:p-14 lg:p-16 shadow-2xl shadow-indigo-950/40 overflow-hidden text-center space-y-8">
              
              {/* Atmospheric Background Glows */}
              <div
                className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-30 blur-3xl pointer-events-none rounded-full"
                style={{ background: "radial-gradient(circle, #533afd 0%, #0ea5e9 60%, transparent 80%)" }}
              />
              <div
                className="absolute -bottom-24 -right-24 w-80 h-80 opacity-20 blur-3xl pointer-events-none rounded-full"
                style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
              />

              {/* Top Trust Badge */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold font-mono tracking-wide text-indigo-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isHindi ? "सार्वजनिक डिजिटल कृषि सेवा" : "Syngenta Biologicals • Public Good Agricultural Platform"}</span>
                </div>
              </div>

              {/* Main Headline & Value Proposition */}
              <div className="relative z-10 space-y-3 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight">
                  {isHindi
                    ? "अपनी फसल को दें वैज्ञानिक सुरक्षा और वास्तविक मंडी लाभ"
                    : "Empower Your Farm with Precision Agricultural Intelligence"}
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
                  {isHindi
                    ? "AASRA से जुड़ें और 14-दिन का लाइव मौसम रडार, 140+ मंडियों के सत्यापित भाव व 50 सिंजेंटा वैज्ञानिक सुरक्षा प्रोटोकॉल से अपनी पैदावार और आमदनी बढ़ाएं।"
                    : "Deploy real-time agro-meteorological telemetry, ICAR-calibrated multi-crop diagnostics, and verified APMC mandi discovery across your field in under 60 seconds."}
                </p>
              </div>

              {/* 4-Pillar Live Capability Badges */}
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2">
                {[
                  { title: isHindi ? "14-दिन मौसम रडार" : "14-Day Weather Radar", sub: isHindi ? "सटीक स्प्रे विंडो" : "Micro-Climate Telemetry", icon: CloudSun },
                  { title: isHindi ? "140+ मंडियों के भाव" : "140+ APMC Mandis", sub: isHindi ? "दैनिक सत्यापित रेट" : "Live Price Discovery", icon: Store },
                  { title: isHindi ? "50 फसल सुरक्षा मॉडल" : "50 Syngenta Protocols", sub: isHindi ? "ICAR फील्ड ट्रायल" : "ICAR Field-Validated", icon: ShieldCheck },
                  { title: isHindi ? "12 भारतीय भाषाएं" : "12 Indian Dialects", sub: isHindi ? "आवाज से सलाह" : "Native AI Voice Assistant", icon: Mic },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-left flex items-center gap-3"
                    >
                      <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-indigo-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">{item.sub}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/signup"}
                  className="px-8 py-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
                    boxShadow: "0 10px 30px rgba(83, 58, 253, 0.4)",
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isLoggedIn ? (isHindi ? "मेरा खेत डैशबोर्ड खोलें" : "Open My Farm Dashboard") : (isHindi ? "नया किसान खाता बनाएं (Free)" : "Create Free Farmer Account")}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/how-it-works"
                  className="px-7 py-4 rounded-2xl text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md font-bold text-sm transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4 text-indigo-300" />
                  <span>{isHindi ? "प्लेटफॉर्म टूर देखें" : "Explore Platform Tour"}</span>
                </Link>
              </div>

              {/* Assurance Subtext */}
              <div className="relative z-10 flex items-center justify-center gap-4 text-xs text-slate-400 pt-2 flex-wrap font-mono">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isHindi ? "निःशुल्क सार्वजनिक सेवा" : "Public Good Platform"}</span>
                </span>
                <span className="text-slate-600">•</span>
                <span>{isHindi ? "कोई क्रेडिट कार्ड आवश्यक नहीं" : "No Credit Card Required"}</span>
                <span className="text-slate-600">•</span>
                <span>{isHindi ? "सुरक्षित एवं गोपनीय डेटा" : "Encrypted Telemetry Privacy"}</span>
              </div>

            </div>

          </div>
        </section>

      </div>
    </AppShell>
  );
}
