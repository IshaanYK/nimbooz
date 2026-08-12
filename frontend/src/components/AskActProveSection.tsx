"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mic, ArrowRight, CheckCircle2, TrendingUp, ShieldAlert, Sparkles, Activity, Calendar } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const AskActProveSection: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-20 space-y-16 font-sans">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DDF7EC] text-[#063B2D] text-xs font-mono font-black tracking-widest uppercase border border-[#00A878]/20">
          <Sparkles className="h-3.5 w-3.5 text-[#00A878]" /> {language === "hi" ? "इंटेलिजेंस यात्रा" : "CORE INTELLIGENCE JOURNEY"}
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-[#10241F] tracking-tight">
          {language === "hi" ? "पूछें → कार्रवाई → प्रमाण" : "ASK → ACT → PROVE"}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
          {t.voiceDesc}
        </p>
      </div>

      {/* 3-Part Flow System connected with SVG animated flow line */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* SVG Flowing Line (Desktop Only) */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2 z-0 pointer-events-none px-16">
          <svg className="w-full h-12" viewBox="0 0 800 40" fill="none">
            <motion.path
              d="M 50 20 Q 200 0, 400 20 T 750 20"
              stroke="#00A878"
              strokeWidth="4"
              strokeDasharray="10 8"
              initial={{ pathLength: 0, opacity: 0.2 }}
              whileInView={{ pathLength: 1, opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* STEP 1: ASK */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 bg-white p-7 sm:p-8 rounded-3xl border border-[#063B2D]/10 shadow-xl flex flex-col justify-between space-y-6 hover:border-[#00A878] hover:shadow-2xl transition-all group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-[#063B2D] bg-[#DDF7EC] px-3.5 py-1 rounded-full border border-[#00A878]/30">
                STEP 01
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-400">ASK</span>
            </div>
            <h3 className="text-2xl font-black font-display text-[#10241F] group-hover:text-[#00A878] transition-colors">
              {t.navAdvisory}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.voiceDesc}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00A878]">
            <span>{t.listenLabel}</span>
            <Mic className="h-4 w-4" />
          </div>
        </motion.div>

        {/* STEP 2: ACT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative z-10 bg-white p-7 sm:p-8 rounded-3xl border border-[#063B2D]/10 shadow-xl flex flex-col justify-between space-y-6 hover:border-[#00A878] hover:shadow-2xl transition-all group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-[#063B2D] bg-[#DDF7EC] px-3.5 py-1 rounded-full border border-[#00A878]/30">
                STEP 02
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-400">ACT</span>
            </div>
            <h3 className="text-2xl font-black font-display text-[#10241F] group-hover:text-[#00A878] transition-colors">
              {t.recommendationTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.stressAlertDesc}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00A878]">
            <span>{t.recentActionLabel}</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </motion.div>

        {/* STEP 3: PROVE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10 bg-white p-7 sm:p-8 rounded-3xl border border-[#063B2D]/10 shadow-xl flex flex-col justify-between space-y-6 hover:border-[#00A878] hover:shadow-2xl transition-all group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-[#063B2D] bg-[#DDF7EC] px-3.5 py-1 rounded-full border border-[#00A878]/30">
                STEP 03
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-400">PROVE</span>
            </div>
            <h3 className="text-2xl font-black font-display text-[#10241F] group-hover:text-[#00A878] transition-colors">
              {t.robiTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.robiDesc}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00A878]">
            <span>{t.exportProofCard}</span>
            <TrendingUp className="h-4 w-4" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
