"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";
import {
  Sparkles,
  MapPin,
  Camera,
  CloudSun,
  Store,
  ArrowRight,
  CheckCircle2,
  Mic,
  ShieldCheck,
  TrendingUp,
  Layers,
  Zap,
  Volume2,
  Play,
  RotateCcw,
  Navigation,
  FileText,
  UserPlus,
  Compass,
  Scan,
  Activity,
  Award,
  BookOpen,
  Calendar,
  HelpCircle,
  Clock,
  ChevronDown,
  Sliders,
  DollarSign,
  Check,
  Smartphone,
  Eye,
  Crosshair,
} from "lucide-react";

interface FullModuleGuide {
  id: string;
  num: string;
  badge: string;
  badgeHi: string;
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  icon: any;
  accentColor: string;
  howToSteps: { step: string; stepHi: string; detail: string; detailHi: string }[];
  simulatedScreen: {
    title: string;
    sub: string;
    metrics: { label: string; val: string; color?: string }[];
    badge: string;
  };
  farmerOutcomeEn: string;
  farmerOutcomeHi: string;
}

const ALL_AASRA_MODULES: FullModuleGuide[] = [
  {
    id: "field-mapping",
    num: "01",
    badge: "Module 01 · GIS Setup",
    badgeHi: "मॉड्यूल 01 · खेत मैपिंग",
    titleEn: "Field Registration & GPS Polygon Mapping",
    titleHi: "खेत जोड़ना व सटीक जीपीएस सैटेलाइट मैपिंग",
    summaryEn: "Pinpoint your farm boundaries, detect soil vertisol clay buffering, and link your parcel to satellite weather telemetry.",
    summaryHi: "अपने खेत की सीमा तय करें, मिट्टी की किस्म (काली मिट्टी/दोमट) पहचानें और मौसम उपग्रह से जोड़ें।",
    icon: Navigation,
    accentColor: "from-blue-500 to-indigo-600",
    howToSteps: [
      {
        step: "1. Tap 'Add Field' on Dashboard",
        stepHi: "1. डैशबोर्ड पर 'खेत जोड़ें' दबाएं",
        detail: "Allow device GPS permission or enter your State, District, and Village name.",
        detailHi: "जीपीएस चालू करें या अपने राज्य, जिले और गांव का नाम चुनें।",
      },
      {
        step: "2. Draw or Pin Your Field Acreage",
        stepHi: "2. खेत का क्षेत्रफल व सीमा दर्ज करें",
        detail: "Select total acres (e.g., 5 Acres / 2 Ha) and your sowing date (e.g., June 15).",
        detailHi: "एकड़ (जैसे 5 एकड़) और बुवाई की तारीख चुनें।",
      },
      {
        step: "3. Choose Sown Crop & Soil",
        stepHi: "3. बोई गई फसल व मिट्टी चुनें",
        detail: "Pick your primary crop variety (e.g. JS-335 Soybean) to calibrate growth stages.",
        detailHi: "अपनी फसल की किस्म (जैसे सोयाबीन) चुनें ताकि विकास चक्र सेट हो सके।",
      },
    ],
    simulatedScreen: {
      title: "🛰️ Active Field Boundary Locked",
      sub: "Sehore & Malwa Vertisol Zone, MP (23.20°N, 77.08°E)",
      badge: "GROUNDED",
      metrics: [
        { label: "Mapped Area", val: "5.0 Acres (2.0 Ha)" },
        { label: "Soil Class", val: "Deep Black Cotton Clay" },
        { label: "Crop Linked", val: "JS-335 Soybean (Day 45)", color: "text-emerald-400" },
        { label: "Telemetry", val: "Open-Meteo High Res", color: "text-blue-400" },
      ],
    },
    farmerOutcomeEn: "Gives you customized microclimate advisories calibrated specifically for your soil water retention.",
    farmerOutcomeHi: "आपकी मिट्टी की नमी सोखने की क्षमता के अनुसार सटीक पानी और खाद की सलाह मिलती है।",
  },
  {
    id: "voice-ai",
    num: "02",
    badge: "Module 02 · Voice AI",
    badgeHi: "मॉड्यूल 02 · वॉयस सहायक",
    titleEn: "Vernacular Voice AI Agricultural Assistant",
    titleHi: "12 भारतीय भाषाओं में बोलकर पूछने वाला AI सहायक",
    summaryEn: "Ask questions naturally by speaking in Hindi, Marathi, Punjabi, Gujarati, Telugu, Tamil, and 6 other Indian dialects.",
    summaryHi: "टाइप करने की जरूरत नहीं। अपनी मातृभाषा में बोलकर फसल, कीट, मौसम या मंडी भाव पूछें।",
    icon: Mic,
    accentColor: "from-purple-500 to-indigo-600",
    howToSteps: [
      {
        step: "1. Tap the Glowing Microphone",
        stepHi: "1. माइक बटन दबाएं",
        detail: "Press the green microphone button located on the top header or mobile bar.",
        detailHi: "स्क्रीन पर दिख रहे माइक बटन पर क्लिक करें।",
      },
      {
        step: "2. Speak Your Question in Your Mother Tongue",
        stepHi: "2. अपनी भाषा में सवाल बोलें",
        detail: "Ask e.g., 'आज सीहोर मंडी में सोयाबीन का क्या भाव है?' or 'सोयाबीन में फूल झड़ने से कैसे रोकें?'",
        detailHi: "जैसे बोलें: 'आज मंडी में क्या भाव है?' या 'मेरी फसल में स्प्रे का सही समय क्या है?'",
      },
      {
        step: "3. Listen & Read the Grounded Prescription",
        stepHi: "3. आवाज में उत्तर सुनें",
        detail: "AASRA answers in clear spoken voice with verified chemical dosages and safe timings.",
        detailHi: "AASRA तुरंत बोलकर सही दवा, पानी की मात्रा और बचाव का तरीका समझाता है।",
      },
    ],
    simulatedScreen: {
      title: "🗣️ AASRA Voice Assistant Live",
      sub: "Dialect: Central Malvi / Hindi • Gemini 2.5 Audio Engine",
      badge: "VOICE ACTIVE",
      metrics: [
        { label: "Farmer Voice", val: "'फूल झड़ने पर क्या स्प्रे करें?'" },
        { label: "AI Response", val: "Quantis® @ 300ml/ac", color: "text-amber-300" },
        { label: "Optimal Time", val: "Tomorrow 6:30 AM", color: "text-emerald-400" },
        { label: "Water Ratio", val: "150 Liters / Acre", color: "text-blue-300" },
      ],
    },
    farmerOutcomeEn: "Elderly and non-typing farmers get instant expert advice without navigating complex menus.",
    farmerOutcomeHi: "बुजुर्ग व बिना लिखे-पढ़े किसान भी आसानी से केवल बोलकर सटीक वैज्ञानिक सलाह ले सकते हैं।",
  },
  {
    id: "leaf-scan",
    num: "03",
    badge: "Module 03 · AI Vision",
    badgeHi: "मॉड्यूल 03 · पत्ती स्कैनर",
    titleEn: "Instant Crop Disease Camera Diagnostic",
    titleHi: "पत्ती स्कैन व 3-सेकंड में तुरंत बीमारी पहचान",
    summaryEn: "Capture or upload photos of sick leaves, damaged stems, or pests for instant 98.6% optical classification.",
    summaryHi: "खराब पत्ती या कीट की फोटो खींचें। AI तुरंत बीमारी पहचानकर सही सिंजेंटा दवा बताता है।",
    icon: Scan,
    accentColor: "from-emerald-500 to-teal-600",
    howToSteps: [
      {
        step: "1. Open 'AI Crop Scan' Camera",
        stepHi: "1. 'AI क्रॉप स्कैन' कैमरा खोलें",
        detail: "Click the Camera icon on the dashboard or assistant tab.",
        detailHi: "डैशबोर्ड पर कैमरा बटन दबाएं।",
      },
      {
        step: "2. Point at Infected Leaf or Pest",
        stepHi: "2. प्रभावित पत्ती पर फोकस करें",
        detail: "Ensure good daylight and take a close-up photo of the yellowed or spotted leaf.",
        detailHi: "दिन की रोशनी में पत्ती के धब्बों या कीट की साफ फोटो लें।",
      },
      {
        step: "3. Review Disease Report & Dosage",
        stepHi: "3. बीमारी रिपोर्ट व इलाज देखें",
        detail: "View the optical confidence match (e.g. 98.6% Yellow Rust) and exact chemical dosage.",
        detailHi: "सटीक बीमारी का नाम और सिंजेंटा टिल्ट® या अन्य दवा की सही मात्रा देखें।",
      },
    ],
    simulatedScreen: {
      title: "📸 Multimodal Spectral Diagnostic",
      sub: "Target: Glycine Max (Soybean) • Spectral Heat-Map",
      badge: "98.6% MATCH",
      metrics: [
        { label: "Diagnosis", val: "Soybean Yellow Rust (Fungal)", color: "text-amber-300" },
        { label: "Severity Level", val: "Stage 2 (Moderate Early)" },
        { label: "Recommended", val: "Syngenta Tilt® @ 200ml/ac", color: "text-emerald-400" },
        { label: "Rainfastness", val: "2 Hours (Resistant)", color: "text-blue-300" },
      ],
    },
    farmerOutcomeEn: "Prevents wrong pesticide purchases at local shops, saving ₹1,500 to ₹3,000 per acre in wasted chemicals.",
    farmerOutcomeHi: "दुकानदार द्वारा गलत या नकली दवा बेचने से बचाव, जिससे प्रति एकड़ ₹2,000 से ₹3,000 की बचत होती है।",
  },
  {
    id: "weather-radar",
    num: "04",
    badge: "Module 04 · Micro-Weather",
    badgeHi: "मॉड्यूल 04 · मौसम रडार",
    titleEn: "14-Day Micro-Climate & Safe Spray Window",
    titleHi: "14-दिन का कृषि मौसम पूर्वानुमान व स्प्रे विंडो",
    summaryEn: "Predicts rainfall, wind drift velocity, humidity, and Delta-T to calculate the exact safest hour to spray.",
    summaryHi: "हवा की गति, बारिश का खतरा और तापमान देखकर बताता है कि स्प्रे करने का सबसे सुरक्षित घंटा कौन सा है।",
    icon: CloudSun,
    accentColor: "from-amber-500 to-yellow-600",
    howToSteps: [
      {
        step: "1. Open the 'Weather' Tab",
        stepHi: "1. 'मौसम' पेज खोलें",
        detail: "See the 14-day temperature, rainfall, and humidity forecast for your GPS coordinate.",
        detailHi: "अपने खेत के स्थान के लिए 14-दिन का तापमान और बारिश का पूर्वानुमान देखें।",
      },
      {
        step: "2. Check the Green Spray Badge",
        stepHi: "2. हरा स्प्रे इंडिकेटर देखें",
        detail: "Green = Safe to spray (Wind < 10 km/h, Rain 0%, Delta T 2-8). Red = Do not spray.",
        detailHi: "हरा = स्प्रे के लिए उत्तम समय। लाल = बारिश या तेज हवा से दवा धुलने का खतरा।",
      },
      {
        step: "3. Schedule Application",
        stepHi: "3. स्प्रे का समय तय करें",
        detail: "Apply biostimulants 24-48 hours before predicted heatwaves for maximum cellular protection.",
        detailHi: "आने वाली लू या गर्मी से 24 घंटे पहले बायोस्टिमुलेंट छिड़कें ताकि फसल पूरी तरह सुरक्षित रहे।",
      },
    ],
    simulatedScreen: {
      title: "🛰️ 14-Day Micro-Atmospheric Radar",
      sub: "Hourly Physics: Delta-T, VPD & Wash-off Risk",
      badge: "OPTIMAL WINDOW",
      metrics: [
        { label: "Ambient Temp", val: "31.2°C (Heatwave in 3d)", color: "text-amber-300" },
        { label: "Wind Velocity", val: "4.2 km/h (Low Drift)", color: "text-emerald-400" },
        { label: "Wash-off Risk", val: "0% (No Rain 48h)", color: "text-emerald-400" },
        { label: "Best Spray Hour", val: "06:00 AM - 09:30 AM", color: "text-indigo-300" },
      ],
    },
    farmerOutcomeEn: "Eliminates rain wash-off losses and chemical drift, ensuring 100% of sprayed nutrients reach the plant roots.",
    farmerOutcomeHi: "दवा बारिश में बहने या तेज हवा में उड़ने से बचती है, जिससे पूरा पोषण पौधे को मिलता है।",
  },
  {
    id: "mandi-network",
    num: "05",
    badge: "Module 05 · APMC Mandi",
    badgeHi: "मॉड्यूल 05 · मंडी नेटवर्क",
    titleEn: "140+ APMC Live Mandi Rate Discovery & Price Comparison",
    titleHi: "140+ सरकारी मंडियों के लाइव भाव व तुलना",
    summaryEn: "Direct integration with Agmarknet API updates daily arrivals, modal prices, and price trends across your district.",
    summaryHi: "सरकारी एगमार्कनेट से रोजाना लाइव भाव देखें और जानें कि किस नजदीकी मंडी में सबसे ज्यादा दाम मिल रहा है।",
    icon: Store,
    accentColor: "from-emerald-500 to-green-600",
    howToSteps: [
      {
        step: "1. Navigate to Mandi Tracker",
        stepHi: "1. 'मंडी भाव' पेज पर जाएं",
        detail: "See real-time spot prices for your primary crop across nearby regional mandis.",
        detailHi: "अपनी फसल के लिए आसपास की सभी मंडियों के आज के भाव देखें।",
      },
      {
        step: "2. Compare Price Differences (Arbitrage)",
        stepHi: "2. मंडियों के भाव की तुलना करें",
        detail: "Compare Sehore vs Bhopal vs Vidisha to discover if traveling 15km gives ₹150/qtl more.",
        detailHi: "देखें कि क्या 15 किमी दूर की मंडी में बेचने पर ₹150 प्रति क्विंटल अधिक मिल रहा है।",
      },
      {
        step: "3. Choose the Best Selling Window",
        stepHi: "3. सबसे अच्छे दाम पर फसल बेचें",
        detail: "Track 7-day price momentum (▲ / ▼) to sell when market arrivals stabilize.",
        detailHi: "7-दिन के रेट का रुझान देखकर सही समय पर उपज बेचें।",
      },
    ],
    simulatedScreen: {
      title: "💰 APMC Multi-Mandi Price Network",
      sub: "Central MP Agri Belt • Agmarknet Verified",
      badge: "LIVE RATES",
      metrics: [
        { label: "Sehore APMC", val: "₹4,850 / Qtl (▲ +₹120)", color: "text-emerald-400" },
        { label: "Bhopal Karond", val: "₹4,790 / Qtl (▼ -₹40)" },
        { label: "Vidisha Mandi", val: "₹4,910 / Qtl (▲ +₹180)", color: "text-emerald-400" },
        { label: "Arbitrage Gain", val: "+₹60/Qtl in Vidisha", color: "text-amber-300" },
      ],
    },
    farmerOutcomeEn: "Earns farmers an extra ₹10,000 to ₹25,000 per harvest by choosing the highest-paying regional APMC.",
    farmerOutcomeHi: "सही मंडी चुनकर बेचने से हर ट्रॉली पर किसान को ₹10,000 से ₹25,000 तक का सीधा अतिरिक्त लाभ होता है।",
  },
  {
    id: "robi-simulator",
    num: "06",
    badge: "Module 06 · Financial ROI",
    badgeHi: "मॉड्यूल 06 · मुनाफा सिमुलेटर",
    titleEn: "Biological Yield Protection & ROBI™ Financial Simulator",
    titleHi: "उपज सुरक्षा व शुद्ध बैंक मुनाफा सिमुलेटर",
    summaryEn: "Calculate the exact rupee return of biostimulant sprays by factoring in heat stress defense, mandi price, and acreage.",
    summaryHi: "दवा छिड़कने पर कुल कितना खर्च होगा और फसल बचने से कितने हजार रुपये का शुद्ध लाभ मिलेगा, यह खुद मापें।",
    icon: TrendingUp,
    accentColor: "from-indigo-500 to-purple-600",
    howToSteps: [
      {
        step: "1. Select Your Crop & Acreage",
        stepHi: "1. अपनी फसल व एकड़ चुनें",
        detail: "Choose from Soybean, Cotton, Wheat, Mustard, Tomato, or Gram, and slide your farm size.",
        detailHi: "सोयाबीन, गेहूं, कपास या टमाटर में से चुनें और अपने खेत का एकड़ सेट करें।",
      },
      {
        step: "2. Inspect the 3-Tile Arithmetic",
        stepHi: "2. सीधा 3-बॉक्स हिसाब देखें",
        detail: "Gross Crop Saved (₹) minus Spray Cost (₹) equals Pure Net Cash in Pocket (+₹).",
        detailHi: "बची हुई फसल का मूल्य (₹) घटाएं दवाई का खर्च (₹) = आपकी जेब का शुद्ध अतिरिक्त लाभ (+₹)।",
      },
      {
        step: "3. Verify ROBI Return Multiple",
        stepHi: "3. रिटर्न मल्टीप्लायर देखें",
        detail: "See the return ratio (e.g. 3.4x = For every ₹1,000 spent on spray, you get ₹3,400 back).",
        detailHi: "देखें कि ₹1 लगाने पर कितने रुपये का उत्पादन सुरक्षित हुआ।",
      },
    ],
    simulatedScreen: {
      title: "📊 Institutional ROBI™ Yield Modeling",
      sub: "Crop: 5.0 Acres Soybean • ICAR-IISR Multi-Center",
      badge: "3.4x ROBI",
      metrics: [
        { label: "Gross Saved", val: "₹14,550 (+3.0 Qtl)", color: "text-emerald-400" },
        { label: "Quantis® Cost", val: "₹4,250 (5 Acres)" },
        { label: "Net Cash Profit", val: "+₹10,300 in Pocket", color: "text-emerald-300" },
        { label: "Yield Lift", val: "+8.8% Protected Harvest", color: "text-blue-300" },
      ],
    },
    farmerOutcomeEn: "Gives farmers commercial certainty before spending money on inputs, guaranteeing high-return decisions.",
    farmerOutcomeHi: "पैसा खर्च करने से पहले किसान को पता होता है कि दवा से कितना मुनाफा होगा।",
  },
  {
    id: "journal-records",
    num: "07",
    badge: "Module 07 · Farm Diary",
    badgeHi: "मॉड्यूल 07 · खेत डायरी",
    titleEn: "Digital Farm Journal & Spray Lifecycle History",
    titleHi: "डिजिटल खेत डायरी व स्प्रे रिकॉर्ड्स",
    summaryEn: "Automatically archives all spray applications, fertilizer dates, and weather shocks for seamless compliance.",
    summaryHi: "कब कौन सा स्प्रे किया, कब सिंचाई की और कब खाद डाली, इसका पूरा डिजिटल रिकॉर्ड सुरक्षित रखें।",
    icon: BookOpen,
    accentColor: "from-sky-500 to-blue-600",
    howToSteps: [
      {
        step: "1. Log Field Operations",
        stepHi: "1. किए गए काम दर्ज करें",
        detail: "Tap 'Log Action' to record spray date, pesticide brand, and dose used.",
        detailHi: "'रिकॉर्ड जोड़ें' दबाकर स्प्रे की तारीख और दवा का नाम दर्ज करें।",
      },
      {
        step: "2. Set Automatic Reminders",
        stepHi: "2. अगले स्प्रे का रिमाइंडर पाएं",
        detail: "AASRA alerts you when the second spray window opens (e.g., 14 days after flowering).",
        detailHi: "14 दिन बाद दूसरे स्प्रे का अलर्ट फोन पर खुद मिल जाता है।",
      },
      {
        step: "3. Export Field Passport",
        stepHi: "3. डिजिटल किसान पासपोर्ट देखें",
        detail: "Generate a certified field audit record for crop insurance or bank loan applications.",
        detailHi: "फसल बीमा या बैंक लोन के लिए प्रमाणित खेत रिपोर्ट डाउनलोड करें।",
      },
    ],
    simulatedScreen: {
      title: "📓 Field Audit & Application Log",
      sub: "Plot: Sehore North • Cycle Kharif 2026",
      badge: "LOGGED",
      metrics: [
        { label: "Last Spray", val: "Quantis® @ Day 45", color: "text-emerald-400" },
        { label: "Next Scheduled", val: "Day 60 (Pod Filling)", color: "text-amber-300" },
        { label: "Total Inputs", val: "₹4,250 YTD" },
        { label: "Field Health", val: "94% Optimal", color: "text-emerald-400" },
      ],
    },
    farmerOutcomeEn: "Builds a verified digital farming history that increases land credit score and unlocks lower interest rates.",
    farmerOutcomeHi: "खेत का पक्का रिकॉर्ड बनता है जिससे बैंक लोन और फसल बीमा का क्लेम पाना आसान हो जाता है।",
  },
];

export default function HowItWorksPage() {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  // Selected Module for Detailed Deep-Dive
  const [selectedModuleId, setSelectedModuleId] = useState<string>("field-mapping");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    setIsLoggedInUser(isUserLoggedIn());
  }, []);

  // Auto-rotate between modules
  useEffect(() => {
    if (!autoRotate) return;

    const intervalTime = 60;
    const totalDuration = 6000;
    const stepIncrement = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setSelectedModuleId((currId) => {
            const idx = ALL_AASRA_MODULES.findIndex((m) => m.id === currId);
            const nextIdx = (idx + 1) % ALL_AASRA_MODULES.length;
            return ALL_AASRA_MODULES[nextIdx].id;
          });
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoRotate]);

  const activeModule = ALL_AASRA_MODULES.find((m) => m.id === selectedModuleId) || ALL_AASRA_MODULES[0];

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f6f9fc] text-[#0d253d] font-sans pb-20 select-none relative overflow-hidden">
        
        {/* ── Atmospheric Radial Meshes ─────────────────────────────── */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-25 blur-3xl pointer-events-none rounded-full"
          style={{ background: "radial-gradient(circle, #533afd 0%, #0ea5e9 60%, transparent 80%)" }}
        />

        {/* ── 1. Header & Page Mission ──────────────────────────────── */}
        <section className="pt-12 sm:pt-20 pb-8 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#e3e8ee] shadow-2xs text-xs font-mono font-bold text-[#533afd]">
            <Sparkles className="h-3.5 w-3.5 text-[#533afd]" />
            <span>{isHindi ? "संपूर्ण उपयोगकर्ता गाइड व कार्यप्रणाली" : "Complete AASRA Operational Manual & Architecture"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-[#0d253d] tracking-tight leading-tight">
            {isHindi
              ? "AASRA का उपयोग कैसे करें: हर फीचर की विस्तृत गाइड"
              : "How to Use AASRA: The Complete Step-by-Step Guide"}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#64748d] max-w-3xl mx-auto leading-relaxed">
            {isHindi
              ? "खेत जोड़ने से लेकर वॉयस AI, पत्ती स्कैनर, मौसम रडार, लाइव मंडी भाव और मुनाफा सिमुलेटर तक — जानें हर टूल का सही उपयोग।"
              : "From satellite field mapping and voice diagnostics to micro-weather radar and live Mandi arbitrage — master every module of the agricultural operating system."}
          </p>
        </section>

        {/* ── 2. Interactive 7-Module Master Showcase ────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-6 relative z-10 space-y-6">
          
          {/* Module Selector Ribbon */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                {isHindi ? "सभी 7 कृषि मॉड्यूल (क्लिक करके देखें):" : "Explore All 7 Operating Modules (Click to inspect):"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">Auto Tour:</span>
                <div className="w-20 sm:w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#533afd] transition-all duration-75 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Horizontal Module Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {ALL_AASRA_MODULES.map((mod) => {
                const isSelected = mod.id === selectedModuleId;
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => {
                      setSelectedModuleId(mod.id);
                      setAutoRotate(false);
                      setProgress(0);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? "bg-[#0d253d] text-white border-[#0d253d] shadow-lg shadow-indigo-950/20 scale-[1.03] ring-2 ring-[#533afd]"
                        : "bg-white hover:bg-slate-50 border-[#e3e8ee] text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${isSelected ? "bg-white/10 text-indigo-200" : "bg-slate-100 text-slate-500"}`}>
                        {mod.num}
                      </span>
                      <Icon className={`h-4 w-4 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                    </div>
                    <span className="text-xs font-bold block truncate w-full">
                      {isHindi ? mod.titleHi.split(" ")[0] + " " + (mod.titleHi.split(" ")[1] || "") : mod.titleEn.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Module Full Presentation Card */}
          <div className="rounded-3xl bg-white border border-[#e3e8ee] shadow-2xl p-6 sm:p-10 space-y-8 overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Exact How-To Steps */}
              <div className="lg:col-span-6 space-y-6">
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#533afd] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 uppercase">
                      {isHindi ? activeModule.badgeHi : activeModule.badge}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0d253d] font-display tracking-tight">
                    {isHindi ? activeModule.titleHi : activeModule.titleEn}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748d] leading-relaxed">
                    {isHindi ? activeModule.summaryHi : activeModule.summaryEn}
                  </p>
                </div>

                {/* 3 Click-by-Click Steps */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block">
                    {isHindi ? "उपयोग करने का तरीका (Step-by-Step):" : "How to Use in the App:"}
                  </span>
                  
                  {activeModule.howToSteps.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-1"
                    >
                      <span className="text-xs font-bold text-[#0d253d] block flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-[#533afd] text-white text-[10px] font-mono flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{isHindi ? s.stepHi : s.step}</span>
                      </span>
                      <p className="text-[11px] text-slate-600 pl-7 leading-relaxed">
                        {isHindi ? s.detailHi : s.detail}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Key Farmer Benefit */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <Award className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-900 block">
                      {isHindi ? "किसान को सीधा लाभ (Key Outcome):" : "Direct Farmer Impact:"}
                    </span>
                    <p className="text-[11px] text-emerald-800">
                      {isHindi ? activeModule.farmerOutcomeHi : activeModule.farmerOutcomeEn}
                    </p>
                  </div>
                </div>

              </div>

              {/* Right Column: High-Tech Simulated Terminal Screen */}
              <div className="lg:col-span-6">
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeModule.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-3xl bg-gradient-to-br from-[#0d253d] via-[#112d4e] to-[#0d253d] border border-indigo-500/30 text-white p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
                  >
                    {/* Header Bar */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                        <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                        <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                        <span className="text-[10px] font-mono text-slate-400 ml-2">AASRA OS 2.5 • INTERFACE</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        {activeModule.simulatedScreen.badge}
                      </span>
                    </div>

                    {/* Title & Sub */}
                    <div className="space-y-1">
                      <h4 className="text-lg sm:text-xl font-bold font-display text-white">
                        {activeModule.simulatedScreen.title}
                      </h4>
                      <p className="text-xs text-slate-300 font-mono">
                        {activeModule.simulatedScreen.sub}
                      </p>
                    </div>

                    {/* 4 Telemetry Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      {activeModule.simulatedScreen.metrics.map((m, idx) => (
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

                    {/* Quick Live Preview Action */}
                    <div className="pt-2">
                      <Link
                        href={isLoggedInUser ? "/dashboard" : "/signup"}
                        className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                        style={{ background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)" }}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>{isLoggedInUser ? (isHindi ? "इस टूल को डैशबोर्ड में खोलें" : "Open This Tool in Dashboard") : (isHindi ? "अपने खेत पर निःशुल्क शुरू करें" : "Try This Tool on Your Land")}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                  </motion.div>
                </AnimatePresence>

              </div>

            </div>

          </div>

        </section>

        {/* ── 3. Day-in-the-Life Farmer Journey (सुबह से शाम तक) ──────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-16 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#533afd] uppercase">
              Operational Routine
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-[#0d253d] font-display">
              {isHindi ? "एक किसान की दिनचर्या: सुबह से शाम तक AASRA का उपयोग" : "A Farmer's Daily Routine with AASRA"}
            </h3>
            <p className="text-xs sm:text-sm text-[#64748d]">
              {isHindi
                ? "देखें कि कैसे AASRA किसान के हर घंटे के निर्णय को आसान और वैज्ञानिक बनाता है।"
                : "Experience how AASRA seamlessly guides precision decisions throughout the crop day."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                time: "06:00 AM",
                title: isHindi ? "1. मौसम व स्प्रे विंडो जांच" : "1. Weather Radar Check",
                desc: isHindi
                  ? "सुबह उठते ही देखें कि आज हवा की गति और बारिश का क्या रुख है और स्प्रे करना सुरक्षित है या नहीं।"
                  : "Check wind velocity, rain risk, and Delta-T to confirm whether the morning spray window is open.",
                icon: CloudSun,
                color: "text-amber-600 bg-amber-50 border-amber-200",
              },
              {
                time: "08:30 AM",
                title: isHindi ? "2. खेत का मुआयना व पत्ती स्कैन" : "2. Field Walk & Leaf Scan",
                desc: isHindi
                  ? "खेत में किसी पौधे पर पीलापन या कीट दिखने पर तुरंत फोन से फोटो खींचकर बीमारी की पहचान करें।"
                  : "Spot any discolored leaf or pest and snap a 3-second photo for instant optical AI diagnosis.",
                icon: Camera,
                color: "text-emerald-600 bg-emerald-50 border-emerald-200",
              },
              {
                time: "12:00 PM",
                title: isHindi ? "3. वॉयस AI से मंडी भाव पूछें" : "3. Voice Mandi Price Check",
                desc: isHindi
                  ? "दुपहर में बोलकर पूछें कि आज आसपास की किस मंडी में सबसे ज्यादा भाव मिल रहा है।"
                  : "Ask the voice assistant in your dialect for today's highest APMC rates across nearby districts.",
                icon: Mic,
                color: "text-purple-600 bg-purple-50 border-purple-200",
              },
              {
                time: "06:00 PM",
                title: isHindi ? "4. स्प्रे डायरी व मुनाफा रिकॉर्ड" : "4. Log Spray in Farm Journal",
                desc: isHindi
                  ? "शाम को किए गए स्प्रे का रिकॉर्ड डायरी में दर्ज करें और बची हुई उपज का मुनाफा देखें।"
                  : "Archive the spray dose in your digital journal and track your cumulative net profit.",
                icon: BookOpen,
                color: "text-blue-600 bg-blue-50 border-blue-200",
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-[#e3e8ee] shadow-sm space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#533afd] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {step.time}
                    </span>
                    <div className={`h-8 w-8 rounded-xl ${step.color} flex items-center justify-center`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-[#0d253d] font-display">{step.title}</h4>
                  <p className="text-xs text-[#64748d] leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. Frequently Asked Questions (FAQ) ──────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 my-16 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-[#533afd] uppercase">
              Frequently Asked Questions
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0d253d] font-display">
              {isHindi ? "अक्सर पूछे जाने वाले महत्वपूर्ण सवाल" : "Frequently Asked Questions"}
            </h3>
          </div>

          <div className="space-y-3">
            {[
              {
                qEn: "Is AASRA free for all farmers?",
                qHi: "क्या AASRA किसानों के लिए निःशुल्क सार्वजनिक सेवा है?",
                aEn: "Yes. AASRA is designed as a public-good agricultural platform. All weather radars, disease diagnostics, mandi price trackers, and voice assistants are completely free.",
                aHi: "हाँ, AASRA सार्वजनिक डिजिटल कृषि सेवा है। मौसम रडार, रोग पहचान, मंडी भाव और वॉयस AI की सुविधा निःशुल्क उपलब्ध है।",
              },
              {
                qEn: "Does the voice assistant work without typing?",
                qHi: "क्या वॉयस असिस्टेंट बिना कुछ लिखे काम करता है?",
                aEn: "Yes. You simply tap the green microphone and speak naturally in your local language (Hindi, Marathi, Punjabi, Gujarati, Telugu, etc.). The AI speaks the answer back to you.",
                aHi: "हाँ! बस माइक बटन दबाएं और अपनी भाषा में बोलें। AI तुरंत बोलकर ही जवाब देता है।",
              },
              {
                qEn: "How accurate is the AI leaf disease scanner?",
                qHi: "पत्ती स्कैनर कितना सटीक है?",
                aEn: "Grounded in Gemini 2.5 Vision with ICAR-AICRP pathology datasets, the scanner achieves a 98.6% classification accuracy across 40+ common Indian crop fungal, viral, and pest stresses.",
                aHi: "यह 98.6% सटीकता के साथ भारत की 40+ प्रमुख फसलों के फफूंद, वायरस और कीट रोगों की सही पहचान करता है।",
              },
              {
                qEn: "Where do the Mandi rates come from?",
                qHi: "मंडी के भाव कहाँ से आते हैं?",
                aEn: "All prices are fetched live directly from the Government of India's Agmarknet API daily across 140+ APMC mandis.",
                aHi: "सभी भाव भारत सरकार के आधिकारिक एगमार्कनेट (Agmarknet API) से रोजाना लाइव अपडेट होते हैं।",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[#e3e8ee] shadow-xs space-y-1.5"
              >
                <h4 className="text-sm font-bold text-[#0d253d] flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-[#533afd] shrink-0" />
                  <span>{isHindi ? faq.qHi : faq.qEn}</span>
                </h4>
                <p className="text-xs text-[#64748d] pl-6 leading-relaxed">
                  {isHindi ? faq.aHi : faq.aEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Bottom Connected Next Steps Bar ────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-white via-indigo-50/40 to-white border border-[#e3e8ee] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0d253d] font-display">
                {isHindi ? "तैयार हैं? अपने खेत के लिए शुरू करें" : "Ready to Modernize Your Farm?"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {isHindi
                  ? "निःशुल्क खाता बनाएं या उत्पाद की सभी 50 सिंजेंटा तकनीकों का विवरण देखें।"
                  : "Create your free farmer account or explore our full 50-product scientific capability catalog."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
              <Link
                href="/product"
                className="px-5 py-3 rounded-xl bg-white border border-[#e3e8ee] hover:border-[#533afd] text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Layers className="h-4 w-4 text-[#533afd]" />
                <span>{isHindi ? "उत्पाद कैटलॉग" : "Product Catalog"}</span>
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
