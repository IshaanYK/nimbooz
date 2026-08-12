"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mic, ArrowRight, Sparkles, Heart, Sun, Flame, Leaf, Globe, Activity, Compass, ShieldCheck } from "lucide-react";

export const HeroVoiceCard: React.FC = () => {
  const [isListening, setIsListening] = useState(true);

  return (
    <section className="relative w-full min-h-[720px] flex flex-col justify-center items-center overflow-hidden bg-slate-50 text-slate-900 py-20 px-4 sm:px-8 border-b border-slate-200">
      {/* Subtle Background Graphic & Soft Gradient */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(5,150,105,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(2,132,199,0.08),transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Stripe Style Clean Headline & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="lg:col-span-7 space-y-8 text-center lg:text-left"
        >
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-accent font-bold tracking-wider uppercase shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>AASRA PLATFORM · AI CROP ADVISORY</span>
          </motion.div>

          {/* Clean Modern Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-slate-900 leading-[1.08]">
            Ask your field. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600">
              Grow with science.
            </span> <br />
            Measure return.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0 font-body">
            AASRA speaks your native language, analyzes live satellite weather telemetry, and protects crop yields against abiotic heat stress.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              href="/assistant"
              className="w-full sm:w-auto px-8 py-4 btn-warm-gold text-white font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer font-accent hover:scale-105"
            >
              <Mic className="h-5 w-5 text-white animate-pulse" />
              <span>TALK TO AASRA VOICE AI</span>
              <ArrowRight className="h-4 w-4 text-white" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 btn-warm-glass text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 font-accent hover:scale-105"
            >
              <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
              <span>EXPLORE FARM OVERWATCH</span>
            </Link>
          </div>

          {/* Indicators */}
          <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 font-accent text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 font-display">01</span>
              <div className="w-10 h-[1px] bg-slate-300" />
              <span>04</span>
            </div>

            <div className="flex items-center gap-2 font-bold text-emerald-700">
              <Leaf className="h-4 w-4 text-emerald-600" />
              <span>SOYBEAN & WHEAT BIOLOGICAL TELEMETRY</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Clean White Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-5 flex justify-center"
        >
          <div className="relative w-full max-w-md bg-white p-7 sm:p-8 space-y-6 shadow-xl rounded-3xl border border-slate-200">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shadow-sm">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">Voice Assistant</h3>
                  <span className="text-xs text-slate-500 font-accent">12 Indian Languages</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-accent font-bold border border-emerald-200">
                ACTIVE AI VOICE
              </span>
            </div>

            {/* Hindi Question Quote Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-sm text-slate-800 font-body leading-relaxed relative">
              <p className="font-medium">
                “मेरी सोयाबीन की फसल के लिए अगले कुछ दिनों में क्या सावधानी रखनी चाहिए?”
              </p>
              <span className="text-xs text-slate-500 block mt-2.5 pt-2 border-t border-slate-200 font-accent">
                (Translation: What precautions for my soybean crop in coming days?)
              </span>
            </div>

            {/* Stat Indicators */}
            <div className="grid grid-cols-3 gap-2.5 text-center font-accent">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="text-base font-bold text-emerald-700">R2</div>
                <div className="text-[10px] text-slate-500 uppercase mt-0.5">Flowering</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="text-base font-bold text-amber-600">78%</div>
                <div className="text-[10px] text-slate-500 uppercase mt-0.5">Heat Risk</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="text-base font-bold text-sky-600">+0.60</div>
                <div className="text-[10px] text-slate-500 uppercase mt-0.5">q/ac Gain</div>
              </div>
            </div>

            {/* Listening Waveform Animation */}
            <div className="flex flex-col items-center justify-center gap-3 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-16 w-16 rounded-full bg-emerald-400/25 animate-ping" />
                <button
                  onClick={() => setIsListening(!isListening)}
                  className="relative z-10 h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl border-2 border-white cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                  <Mic className="h-6 w-6 text-white" />
                </button>
              </div>
              <span className="text-xs font-accent font-bold text-emerald-700">
                [ Listening in Hindi... ]
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
