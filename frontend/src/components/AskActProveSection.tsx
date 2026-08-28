"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Mic,
  Activity,
  CheckCircle2,
  TrendingUp,
  FileText,
  Radio,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export const AskActProveSection: React.FC = () => {
  const { language, t } = useLanguage();

  const SIX_PHASES = [
    {
      num: "01",
      name: "LISTEN",
      nameHi: "सुनना (टेलीमेट्री)",
      title: "Hyper-Local Telemetry Ingestion",
      desc: "Ingests real-time hourly temperature, night heat respiration, soil moisture (0-7cm), and wind speed via Open-Meteo & Meteoblue satellite streams.",
      icon: Radio,
      color: "sky",
      link: "/weather",
      tag: "LIVE SENSORS",
    },
    {
      num: "02",
      name: "UNDERSTAND",
      nameHi: "समझना (एल्गोरिदम)",
      title: "Biophysical Stress Evaluation",
      desc: "Evaluates 9 deterministic algorithms: Daytime Heat (HSI_day), Night Heat (HSI_night >25°C), Drought Index (DI), GDD, and BRS Spray Safety Gates.",
      icon: Activity,
      color: "emerald",
      link: "/plant-intelligence",
      tag: "9 ALGORITHMS",
    },
    {
      num: "03",
      name: "ADVISE (PS-04)",
      nameHi: "सलाह (Google AI)",
      title: "Multilingual Voice & Vision AI",
      desc: "Google Gemini 2.5 Flash + Chirp 3 HD delivers vernacular voice advisory and leaf disease diagnostics across 12 Indian languages with explainable rationales.",
      icon: Mic,
      color: "amber",
      link: "/assistant",
      tag: "PS-04 (100% GOOGLE AI)",
    },
    {
      num: "04",
      name: "RECORD",
      nameHi: "दर्ज करना (जर्नल)",
      title: "Biological Intervention Logging",
      desc: "Logs Syngenta Quantis & Stress Buster spray applications, dosages (250 ml/ac), and phenological crop growth stages alongside untreated control plots.",
      icon: FileText,
      color: "indigo",
      link: "/journal",
      tag: "FIELD LOGS",
    },
    {
      num: "05",
      name: "MEASURE",
      nameHi: "मापना (प्रभाव)",
      title: "Weather-Adjusted Attribution",
      desc: "Disentangles background environmental noise (weather, soil) from true biostimulant treatment gains using biophysical thermal sensitivity decay curves.",
      icon: Zap,
      color: "purple",
      link: "/what-if",
      tag: "SHAP ATTRIBUTION",
    },
    {
      num: "06",
      name: "PROVE (PS-07)",
      nameHi: "प्रमाण (ROBI रिटर्न)",
      title: "Return on Biological Investment",
      desc: "Calculates verifiable net financial profit (+₹25,375 for 12.5 Ac) and exports cryptographic ROBI Proof Cards for complete transparency.",
      icon: TrendingUp,
      color: "emerald",
      link: "/impact",
      tag: "PS-07 (ROBI PROOF)",
    },
  ];

  return (
    <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-20 space-y-14 font-sans">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-mono font-black tracking-widest uppercase border border-emerald-300">
          <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
          <span>{language === "hi" ? "6-चरणीय कृषि जीवनचक्र" : "THE 6-PHASE AGRONOMIC EXECUTION LOOP"}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-slate-900 tracking-tight">
          LISTEN → UNDERSTAND → ADVISE → RECORD → MEASURE → PROVE
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
          {language === "hi"
            ? "AASRA फसल प्रबंधन को 'नुकसान के बाद प्रतिक्रिया' से बदलकर 'सटीक और अग्रिम सुरक्षा' में परिवर्तित करता है — PS-04 वॉयस AI और PS-07 ROBI इंजन द्वारा संचालित।"
            : "Transforming agricultural management from reactive damage response to pre-emptive biostimulant protection, powered by PS-04 Multilingual AI and PS-07 ROBI Attribution."}
        </p>
      </div>

      {/* 6-Phase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SIX_PHASES.map((phase, idx) => {
          const IconComponent = phase.icon;
          return (
            <motion.div
              key={phase.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-white rounded-3xl border-2 border-slate-200 hover:border-emerald-500 p-6 sm:p-7 space-y-4 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                    PHASE {phase.num}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {phase.tag}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 flex items-center justify-center transition-colors shrink-0">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 font-display group-hover:text-emerald-800 transition-colors">
                      {phase.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {language === "hi" ? phase.nameHi : phase.title}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {phase.desc}
                </p>
              </div>

              <Link
                href={phase.link}
                className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-emerald-700 group-hover:text-emerald-900 transition-colors"
              >
                <span>{language === "hi" ? "विवरण देखें" : "Explore Module"}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
};
