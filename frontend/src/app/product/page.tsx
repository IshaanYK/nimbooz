"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";
import { syngentaProducts, SyngentaProduct } from "@/lib/syngentaProductsDB";
import { SyngentaDealerLocator } from "@/components/SyngentaDealerLocator";
import {
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Layers,
  Leaf,
  CloudSun,
  Store,
  TrendingUp,
  Mic,
  Camera,
  Navigation,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sliders,
  DollarSign,
  Activity,
  Clock,
  Compass,
  UserPlus,
  BookOpen,
  Droplets,
  Scale,
} from "lucide-react";

interface PSEngine {
  id: string;
  code: string;
  nameEn: string;
  nameHi: string;
  tagEn: string;
  tagHi: string;
  descEn: string;
  descHi: string;
  techStack: string;
  href: string;
  icon: any;
  accentColor: string;
  badgeBg: string;
  simulatedData: {
    title: string;
    sub: string;
    metrics: { label: string; val: string; color?: string }[];
    statusBadge: string;
  };
}

const PS_ENGINES: PSEngine[] = [
  {
    id: "ps-01",
    code: "PS-01",
    nameEn: "Zero-Touch Voice & Satellite Intake",
    nameHi: "जीरो-टच वॉयस व सैटेलाइट फील्ड इंटेक",
    tagEn: "GIS + Vernacular STT",
    tagHi: "जीपीएस + 12 भाषाएं",
    descEn: "Automatically identifies farm polygon coordinates, detects soil vertisol clay buffering, and records sowing dates from vernacular voice in 12 Indian dialects.",
    descHi: "बोलकर या 1-क्लिक जीपीएस से खेत की सीमाएं, काली मिट्टी की नमी क्षमता व बुवाई की तारीख दर्ज करता है।",
    techStack: "Google STT · Open-Meteo GIS · Turf.js Polygon Spatial Analysis",
    href: "/onboarding",
    icon: Navigation,
    accentColor: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    simulatedData: {
      title: "📍 Satellite Parcel Polygon Locked",
      sub: "Sehore & Malwa Vertisol Plateau (23.20°N, 77.08°E)",
      statusBadge: "GROUNDED",
      metrics: [
        { label: "Farm Size", val: "5.0 Acres (2.0 Ha)" },
        { label: "Soil Class", val: "Deep Black Cotton Clay" },
        { label: "Crop Linked", val: "JS-335 Soybean", color: "text-emerald-400" },
        { label: "Precision", val: "±15m Spatial Boundary", color: "text-blue-400" },
      ],
    },
  },
  {
    id: "ps-02",
    code: "PS-02",
    nameEn: "14-Day Biophysical Multi-Stress Forecasting",
    nameHi: "14-दिन का जैविक तनाव पूर्वानुमान इंजन",
    tagEn: "ML + SHAP Explainability",
    tagHi: "मशीन लर्निंग + SHAP",
    descEn: "GradientBoostingRegressor models predict rolling 14-day heat stress, terminal drought, and waterlogging risks 72 hours before visible crop damage.",
    descHi: "फसल खराब होने से 72 घंटे पहले आने वाली भीषण गर्मी, लू या सूखे का पूर्वानुमान लगाकर अलर्ट जारी करता है।",
    techStack: "Scikit-Learn · GradientBoosting · SHAP TreeExplainer · Open-Meteo",
    href: "/plant-intelligence",
    icon: Activity,
    accentColor: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    simulatedData: {
      title: "🌡️ Biophysical Stress Prediction Active",
      sub: "Thermal Shock Wave (>36°C) Predicted in 72h",
      statusBadge: "EARLY ALERT",
      metrics: [
        { label: "Heat Stress (HSI)", val: "0.82 (High Risk)", color: "text-rose-400" },
        { label: "Drought Index", val: "0.64 (Moderate)" },
        { label: "Top Driver", val: "VPD Spike (+1.8 kPa)", color: "text-amber-300" },
        { label: "Lead Time", val: "3.5 Days Advance Notice", color: "text-emerald-400" },
      ],
    },
  },
  {
    id: "ps-03",
    code: "PS-03",
    nameEn: "CropFit 3-Layer Biological Recommendation",
    nameHi: "क्रॉप-फिट 3-स्तरीय दवा व बायोस्टिमुलेंट चयन",
    tagEn: "50 Syngenta Formulations",
    tagHi: "50 सिंजेंटा उत्पाद",
    descEn: "Deterministic 3-layer hybrid engine: Filter illegal/banned mixes ➔ Rank by ICAR trial efficacy & cost ➔ Generate farmer-friendly voice explanations.",
    descHi: "3 स्तरों पर जांच: अनुपयुक्त दवाओं को हटाना ➔ ICAR रिसर्च व मंडी भाव के अनुसार टॉप दवा चुनना ➔ बोलकर समझाना।",
    techStack: "Deterministic Rule Matrix · ICAR-AICRP Weighted Scoring · Syngenta DB",
    href: "/plant-intelligence",
    icon: Leaf,
    accentColor: "from-purple-500 to-indigo-600",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    simulatedData: {
      title: "🧬 CropFit Multi-Criteria Selection",
      sub: "Best Fit Protocol: Quantis® Osmoprotectant",
      statusBadge: "ICAR VALIDATED",
      metrics: [
        { label: "Recommended", val: "Quantis® @ 300ml/ac", color: "text-amber-300" },
        { label: "Efficacy Gain", val: "91.4% Canopy Retention", color: "text-emerald-400" },
        { label: "Spray Cost", val: "₹850 / Acre" },
        { label: "Rainfastness", val: "2.0 Hours", color: "text-blue-300" },
      ],
    },
  },
  {
    id: "ps-04",
    code: "PS-04",
    nameEn: "Multilingual Voice & Vision AI Companion",
    nameHi: "12 भाषाओं में वॉयस व पत्ती स्कैनर AI",
    tagEn: "Google Gemini AI Stack",
    tagHi: "गूगल जेमिनी 2.5 AI",
    descEn: "Gemini 2.5 Flash + Chirp 3 HD audio engine allows seamless voice conversations in 12 languages. Gemini Vision provides 98.6% leaf pathology scans.",
    descHi: "गूगल जेमिनी 2.5 AI से बोलकर बात करें और खराब पत्ती का फोटो खींचकर 3 सेकंड में सही बीमारी पहचानें।",
    techStack: "Google Gemini 2.5 Flash · Gemini 2.5 Vision · Chirp 3 HD TTS · Web Speech API",
    href: "/assistant",
    icon: Mic,
    accentColor: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    simulatedData: {
      title: "🎙️ Gemini Multimodal Diagnostics",
      sub: "Central Malvi Speech & Spectral Leaf Analysis",
      statusBadge: "98.6% ACCURACY",
      metrics: [
        { label: "Voice Query", val: "'पीली पत्ती पर क्या डालें?'" },
        { label: "Vision Match", val: "Yellow Rust Stage 2", color: "text-amber-300" },
        { label: "Spoken Output", val: "Tilt® 200ml/ac Hindi Voice", color: "text-emerald-400" },
        { label: "Latency", val: "850ms Instant Reply", color: "text-blue-300" },
      ],
    },
  },
  {
    id: "ps-05",
    code: "PS-05",
    nameEn: "APMC Live Mandi Rate Discovery & Price Arbitrage",
    nameHi: "140+ एपीएमसी लाइव मंडी भाव व मुनाफा तुलना",
    tagEn: "Agmarknet Direct API",
    tagHi: "सरकारी एगमार्कनेट",
    descEn: "Real-time spot price telemetry from 140+ APMC mandis across India. Compares nearby regional markets so farmers sell at peak modal prices.",
    descHi: "140+ सरकारी मंडियों के रोजाना लाइव रेट देखें और जानें कि आसपास की किस मंडी में सबसे ज्यादा भाव मिल रहा है।",
    techStack: "Govt. of India Agmarknet API · Spatial Mandi Haversine Distance · Price Trends",
    href: "/mandi/rates",
    icon: Store,
    accentColor: "from-emerald-500 to-green-600",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    simulatedData: {
      title: "💰 APMC Mandi Price Network",
      sub: "Sehore vs Bhopal vs Vidisha Arbitrage",
      statusBadge: "LIVE SPOT RATES",
      metrics: [
        { label: "Sehore APMC", val: "₹4,850 / Qtl (▲ +₹120)", color: "text-emerald-400" },
        { label: "Vidisha Mandi", val: "₹4,910 / Qtl (▲ +₹180)", color: "text-emerald-400" },
        { label: "Regional Delta", val: "+₹60/Qtl Advantage", color: "text-amber-300" },
        { label: "Update Frequency", val: "Daily 09:00 AM", color: "text-blue-300" },
      ],
    },
  },
  {
    id: "ps-06",
    code: "PS-06",
    nameEn: "14-Day Micro-Meteorological Spray Window",
    nameHi: "14-दिन का मौसम रडार व स्प्रे विंडो",
    tagEn: "Delta-T & VPD Physics",
    tagHi: "डेल्टा-टी व हवा की गति",
    descEn: "Physics-based spray window calculator tracking Delta-T (2.0 to 8.0 optimal), wind drift velocity, and rain probability to prevent chemical wash-off.",
    descHi: "हवा की गति, तापमान और बारिश का खतरा मापकर बताता है कि छिड़काव करने का सबसे असरदार समय कौन सा है।",
    techStack: "Open-Meteo High Resolution · Delta-T Psychrometric Model · VPD Calculations",
    href: "/weather",
    icon: CloudSun,
    accentColor: "from-sky-500 to-blue-600",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
    simulatedData: {
      title: "🛰️ Hourly Spray Physics Telemetry",
      sub: "Safe Window: Tomorrow 06:00 AM - 09:30 AM",
      statusBadge: "SAFE WINDOW ●",
      metrics: [
        { label: "Wind Velocity", val: "4.2 km/h (Low Drift)", color: "text-emerald-400" },
        { label: "Delta-T Index", val: "4.8 (Optimal Absorption)", color: "text-emerald-400" },
        { label: "Rain 48h Risk", val: "0% (Zero Wash-off)", color: "text-emerald-400" },
        { label: "VPD Range", val: "1.4 kPa (Safe)", color: "text-blue-300" },
      ],
    },
  },
  {
    id: "ps-07",
    code: "PS-07",
    nameEn: "Causal Yield Attribution & ROBI™ Financial Engine",
    nameHi: "शुद्ध उपज सुरक्षा व ROBI™ बैंक लाभ मॉडल",
    tagEn: "Synthetic Controls + AICRP",
    tagHi: "शुद्ध बैंक मुनाफा",
    descEn: "Isolates biological protection gains from weather noise using counterfactual synthetic controls. Computes net rupees in farmer pocket after input costs.",
    descHi: "दवाई का कुल खर्च घटाकर किसान की जेब में आने वाले शुद्ध अतिरिक्त बैंक बैलेंस की सटीक गणना करता है।",
    techStack: "Causal Synthetic Controls · ICAR-AICRP Yield Trial Constants · Agmarknet Pricing",
    href: "/robi",
    icon: TrendingUp,
    accentColor: "from-indigo-600 to-violet-600",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    simulatedData: {
      title: "📊 Institutional ROBI™ Yield Ledger",
      sub: "Crop: 5.0 Acres Soybean • Net Financial Surplus",
      statusBadge: "3.4x ROBI MULTIPLE",
      metrics: [
        { label: "Gross Saved", val: "₹14,550 (+3.0 Qtl)", color: "text-emerald-400" },
        { label: "Intervention Cost", val: "₹4,250 (Quantis®)" },
        { label: "Net Cash Profit", val: "+₹10,300 in Pocket", color: "text-emerald-300" },
        { label: "Yield Gain", val: "+8.8% Protected Harvest", color: "text-blue-300" },
      ],
    },
  },
];

export default function ProductPage() {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  // Active Architecture Tab
  const [selectedEngineId, setSelectedEngineId] = useState<string>("ps-01");

  // Product Catalog Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCrop, setSelectedCrop] = useState<string>("all");

  React.useEffect(() => {
    setIsLoggedInUser(isUserLoggedIn());
  }, []);

  const activeEngine = PS_ENGINES.find((e) => e.id === selectedEngineId) || PS_ENGINES[0];

  // Filtered Syngenta Products
  const filteredProducts = useMemo(() => {
    return syngentaProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.targetPests.some((pest) => pest.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      const matchesCrop =
        selectedCrop === "all" ||
        p.approvedCrops.some((c) => c.toLowerCase().includes(selectedCrop.toLowerCase()));

      return matchesSearch && matchesCategory && matchesCrop;
    });
  }, [searchQuery, selectedCategory, selectedCrop]);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f6f9fc] text-[#0d253d] font-sans pb-24 select-none relative overflow-hidden">
        
        {/* ── Atmospheric Background Radiant Glows ─────────────────── */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] opacity-25 blur-3xl pointer-events-none rounded-full"
          style={{ background: "radial-gradient(circle, #533afd 0%, #0ea5e9 60%, transparent 80%)" }}
        />

        {/* ── 1. Hero Title & Capability Banner ─────────────────────── */}
        <section className="pt-12 sm:pt-20 pb-8 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#e3e8ee] shadow-2xs text-xs font-mono font-bold text-[#533afd]">
            <Sparkles className="h-3.5 w-3.5 text-[#533afd]" />
            <span>AASRA AGRICULTURAL OPERATING SYSTEM · COMPLETE SPECIFICATION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-[#0d253d] tracking-tight leading-tight">
            {isHindi
              ? "वैज्ञानिक फसल सुरक्षा व बुद्धिमत्ता का संपूर्ण प्लेटफॉर्म"
              : "Biological Science Meets Voice Intelligence"}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#64748d] max-w-3xl mx-auto leading-relaxed">
            {isHindi
              ? "7 एकीकृत वैज्ञानिक इंजन, 50 सिंजेंटा प्रमाणित उत्पाद, 140+ मंडियों के लाइव भाव और 12 भारतीय भाषाओं में वॉयस AI — भारतीय किसानों के लिए तैयार।"
              : "7 integrated scientific systems delivering 14-day plant stress forecasting, 50 Syngenta crop protection protocols, 12-dialect voice AI, and verified APMC price discovery."}
          </p>

          {/* Telemetry Stat Badges */}
          <div className="pt-2 flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap text-xs font-mono font-bold">
            <span className="px-3 py-1 rounded-full bg-white border border-[#e3e8ee] shadow-2xs text-indigo-700">
              ⚡ 50 Syngenta Formulations
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-[#e3e8ee] shadow-2xs text-emerald-700">
              🛰️ 140+ APMC Mandis Live
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-[#e3e8ee] shadow-2xs text-blue-700">
              🌾 6 Primary Indian Crop Engines
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-[#e3e8ee] shadow-2xs text-purple-700">
              🛡️ ICAR-AICRP Validated
            </span>
          </div>
        </section>

        {/* ── 2. Interactive 7-Engine Architecture Matrix ────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10 relative z-10 space-y-6">
          <div className="text-center space-y-1.5 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#533afd] uppercase">
              Core Technical Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0d253d] font-display">
              {isHindi ? "AASRA के 7 एकीकृत वैज्ञानिक इंजन" : "7 Integrated Agricultural Engines"}
            </h2>
          </div>

          {/* Engine Selector Tab Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {PS_ENGINES.map((eng) => {
              const isSelected = eng.id === selectedEngineId;
              const Icon = eng.icon;
              return (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => setSelectedEngineId(eng.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? "bg-[#0d253d] text-white border-[#0d253d] shadow-lg shadow-indigo-950/20 scale-[1.03] ring-2 ring-[#533afd]"
                      : "bg-white hover:bg-slate-50 border-[#e3e8ee] text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${isSelected ? "bg-white/10 text-indigo-200" : "bg-slate-100 text-slate-500"}`}>
                      {eng.code}
                    </span>
                    <Icon className={`h-4 w-4 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                  </div>
                  <span className="text-xs font-bold block truncate w-full">
                    {isHindi ? eng.nameHi.split(" ")[0] + " " + (eng.nameHi.split(" ")[1] || "") : eng.nameEn.split(" ").slice(0, 2).join(" ")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Engine Full Showcase Container */}
          <div className="rounded-3xl bg-white border border-[#e3e8ee] shadow-2xl p-6 sm:p-10 space-y-8 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Engine Specification & Capabilities */}
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${activeEngine.badgeBg}`}>
                      {activeEngine.code} · {isHindi ? activeEngine.tagHi : activeEngine.tagEn}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#0d253d] font-display">
                    {isHindi ? activeEngine.nameHi : activeEngine.nameEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748d] leading-relaxed">
                    {isHindi ? activeEngine.descHi : activeEngine.descEn}
                  </p>
                </div>

                {/* Tech Stack Footprint */}
                <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                    Underlying Engineering Stack:
                  </span>
                  <span className="text-xs font-mono font-bold text-[#533afd] block">
                    {activeEngine.techStack}
                  </span>
                </div>

                {/* Launch CTA */}
                <div className="pt-2">
                  <Link
                    href={isLoggedInUser ? activeEngine.href : "/signup"}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-xs shadow-md transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)" }}
                  >
                    <span>{isLoggedInUser ? `Launch ${activeEngine.code} Tool` : "Start Free Farm Account"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Simulated High-Tech Telemetry Terminal */}
              <div className="lg:col-span-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeEngine.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-3xl bg-gradient-to-br from-[#0d253d] via-[#112d4e] to-[#0d253d] border border-indigo-500/30 text-white p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
                  >
                    {/* Top Console Bar */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                        <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                        <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                        <span className="text-[10px] font-mono text-slate-400 ml-2">{activeEngine.code} ENGINE • ONLINE</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        {activeEngine.simulatedData.statusBadge}
                      </span>
                    </div>

                    {/* Title & Sub */}
                    <div className="space-y-1">
                      <h4 className="text-lg sm:text-xl font-bold font-display text-white">
                        {activeEngine.simulatedData.title}
                      </h4>
                      <p className="text-xs text-slate-300 font-mono">
                        {activeEngine.simulatedData.sub}
                      </p>
                    </div>

                    {/* 4 Telemetry Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      {activeEngine.simulatedData.metrics.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1"
                        >
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">
                            {m.label}
                          </span>
                          <span className={`text-xs sm:text-sm font-bold block ${m.color || "text-white"}`}>
                            {m.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Console Status */}
                    <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between text-[11px] font-mono text-indigo-200">
                      <span>Telemetry Feed: Active Stream (200 OK)</span>
                      <span className="text-emerald-400 font-bold">VERIFIED FEED</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        </section>

        {/* ── 3. Interactive 50-Product Syngenta Biologicals & Protection Catalog ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-16 space-y-8 relative z-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#533afd] uppercase">
              Syngenta Scientific Knowledge Base
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0d253d] font-display">
              {isHindi ? "50 सिंजेंटा प्रमाणित कृषि उत्पाद कैटलॉग" : "50 Syngenta Validated Products Catalog"}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748d]">
              {isHindi
                ? "ICAR व स्टेट एग्रीकल्चर यूनिवर्सिटी ट्रायल द्वारा प्रमाणित कीटनाशक, फफूंदनाशक व बायोस्टिमुलेंट।"
                : "Search and filter verified formulations with exact dosages, ICAR trial control percentages, and rainfastness."}
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#e3e8ee] shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Search Bar */}
              <div className="md:col-span-5 relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isHindi ? "दवा का नाम, सक्रिय तत्व या कीट खोजें..." : "Search by product name, active ingredient, or pest..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-medium focus:outline-none focus:border-[#533afd]"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="md:col-span-7 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "all", label: "All (50)" },
                  { id: "biostimulant", label: "Biostimulants & Osmoprotectants" },
                  { id: "fungicide", label: "Fungicides" },
                  { id: "insecticide", label: "Insecticides" },
                  { id: "herbicide", label: "Herbicides" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-[#533afd] text-white shadow-xs"
                        : "bg-[#f6f9fc] hover:bg-slate-100 text-slate-600 border border-[#e3e8ee]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Crop Specific Secondary Filter */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto text-xs">
              <span className="text-[11px] font-mono text-slate-400 font-bold shrink-0">Filter Crop:</span>
              {[
                { id: "all", label: "All Crops" },
                { id: "Soybean", label: "Soybean" },
                { id: "Cotton", label: "Cotton" },
                { id: "Wheat", label: "Wheat" },
                { id: "Mustard", label: "Mustard" },
                { id: "Tomato", label: "Tomato" },
                { id: "Gram", label: "Gram / Chickpea" },
                { id: "Rice", label: "Paddy / Rice" },
                { id: "Maize", label: "Maize" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCrop(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                    selectedCrop === c.id
                      ? "bg-[#0d253d] text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid (Showing Top 12 or Filtered Matches) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.slice(0, 15).map((prod) => (
              <div
                key={prod.key}
                className="p-6 rounded-3xl bg-white border border-[#e3e8ee] shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#533afd] border border-indigo-200">
                      {prod.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {prod.trialEfficacyPct}% Efficacy
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-[#0d253d] font-display">{prod.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 line-clamp-1">
                      {prod.activeIngredient}
                    </p>
                  </div>

                  {/* Target Pests & Crops */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-1 text-slate-600">
                      <span className="font-bold shrink-0">Targets:</span>
                      <span className="truncate">{prod.targetPests.slice(0, 3).join(", ")}</span>
                    </div>
                    <div className="flex items-start gap-1 text-slate-600">
                      <span className="font-bold shrink-0">Crops:</span>
                      <span className="truncate">{prod.approvedCrops.slice(0, 3).join(", ")}</span>
                    </div>
                  </div>

                  {/* Dosage & Application Window */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                    <div className="p-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
                      <span className="text-slate-400 block">Dosage:</span>
                      <span className="font-bold text-slate-800">{prod.dosagePerAcre}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
                      <span className="text-slate-400 block">Cost/Acre:</span>
                      <span className="font-bold text-slate-800">₹{prod.costPerAcre}</span>
                    </div>
                  </div>
                </div>

                {/* Trial Citation & Rainfastness */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="truncate max-w-[180px]">{prod.trialCitation}</span>
                  <span className="font-bold text-indigo-600 shrink-0">
                    {prod.cropwiseStandard.rainfastnessHours}h Rainfast
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#e3e8ee] space-y-2">
              <Search className="h-8 w-8 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-[#0d253d]">No matching products found</h4>
              <p className="text-xs text-slate-500">Try searching for &quot;Quantis&quot;, &quot;Tilt&quot;, &quot;Soybean&quot;, or &quot;Rust&quot;.</p>
            </div>
          )}

        </section>

        {/* ── 4. Tank-Mix Safety & Chemical Antagonism Protocol Matrix ─ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-16 space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#533afd] uppercase">
              Cropwise Application Safety
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0d253d] font-display">
              {isHindi ? "टैंक-मिक्स कम्पैटिबिलिटी व सुरक्षा गाइड" : "Tank-Mix Compatibility & Antagonism Rules"}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748d]">
              {isHindi
                ? "बायोस्टिमुलेंट व अन्य दवाओं को एक साथ मिलाते समय रासायनिक रिएक्शन से बचाव के नियम।"
                : "Deterministic rules preventing chemical precipitation, nozzle clogging, or phytotoxic leaf scorch."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: isHindi ? "✓ सुरक्षित टैंक-मिक्स (Safe Mixes)" : "✓ Verified Safe Combinations",
                desc: isHindi
                  ? "Quantis® को Amistar Top®, Tilt® व सामान्य एजाडिरेक्टिन कीटनाशकों के साथ बिना किसी रिएक्शन के मिलाया जा सकता है।"
                  : "Quantis® can be safely co-applied with Amistar Top®, Tilt®, and standard pyrethroids without phytotoxicity.",
                icon: CheckCircle2,
                color: "text-emerald-700 bg-emerald-50 border-emerald-200",
              },
              {
                title: isHindi ? "⚠ निषेध व खतरनाक मिश्रण (Forbidden Mixes)" : "⚠ Strictly Prohibited Mixes",
                desc: isHindi
                  ? "बायोस्टिमुलेंट्स को कॉपर ऑक्सीक्लोराइड (COC) या अत्यधिक क्षारीय घोल (pH > 8.0) के साथ कभी न मिलाएं।"
                  : "Never tank-mix biostimulants with Copper Oxychloride (COC), Bordeaux mixture, or sulfur formulations.",
                icon: AlertTriangle,
                color: "text-rose-700 bg-rose-50 border-rose-200",
              },
              {
                title: isHindi ? "🧪 जार टेस्ट व पानी की मात्रा (Jar Test Protocol)" : "🧪 Standard Jar Test Protocol",
                desc: isHindi
                  ? "बड़े टैंक में घोलने से पहले 1 लीटर पानी में थोड़ा सा मिलाकर 5 मिनट देखें कि दही की तरह थक्का तो नहीं बन रहा।"
                  : "Conduct a 5-minute glass jar test in 1 liter of local water before filling the 200L spray tank.",
                icon: Droplets,
                color: "text-blue-700 bg-blue-50 border-blue-200",
              },
            ].map((rule, idx) => {
              const Icon = rule.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-[#e3e8ee] shadow-sm space-y-3"
                >
                  <div className={`h-10 w-10 rounded-2xl ${rule.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-[#0d253d] font-display">{rule.title}</h4>
                  <p className="text-xs text-[#64748d] leading-relaxed">{rule.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 5. Syngenta Dealer & Field Trial Locator ──────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-16">
          <SyngentaDealerLocator />
        </section>

        {/* ── 6. Bottom Connected Next Steps Bar ────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-white via-indigo-50/40 to-white border border-[#e3e8ee] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0d253d] font-display">
                {isHindi ? "AASRA से अपनी खेती को सशक्त बनाएं" : "Deploy AASRA on Your Acreage Today"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {isHindi
                  ? "सार्वजनिक डिजिटल कृषि सेवा · 30 सेकंड में खाता बनाएं और सटीक टेलीमेट्री शुरू करें।"
                  : "Public Good Agricultural Platform · Create your farm account in 30 seconds."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
              <Link
                href="/how-it-works"
                className="px-5 py-3 rounded-xl bg-white border border-[#e3e8ee] hover:border-[#533afd] text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="h-4 w-4 text-[#533afd]" />
                <span>{isHindi ? "कार्यप्रणाली गाइड देखें" : "How It Works"}</span>
              </Link>
              
              <Link
                href={isLoggedInUser ? "/dashboard" : "/signup"}
                className="px-6 py-3.5 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)" }}
              >
                <UserPlus className="h-4 w-4" />
                <span>{isLoggedInUser ? (isHindi ? "मेरा डैशबोर्ड" : "Open Dashboard") : (isHindi ? "निःशुल्क शुरू करें" : "Sign Up Free")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
