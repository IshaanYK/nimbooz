"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mic, ArrowRight, Sparkles, Volume2, ShieldCheck, HeartHandshake, Play, Activity } from "lucide-react";

export const HeroVoiceCard: React.FC = () => {
  const [isListening, setIsListening] = useState(true);

  return (
    <section className="relative w-full min-h-[640px] flex flex-col justify-center items-center overflow-hidden bg-[#063B2D] text-white py-20 px-4 sm:px-6">
      {/* Background Cinematic Agricultural Image with Dark Forest Gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/aasra_hero_farm.png"
          alt="Lush green agricultural farm at sunrise"
          fill
          priority
          className="object-cover object-center brightness-75 scale-105"
        />
        {/* Dark-to-transparent forest-green gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#063B2D]/95 via-[#063B2D]/85 to-[#063B2D]" />
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Hero Copy & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="lg:col-span-7 space-y-6 text-center lg:text-left"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A878]/30 border border-[#20C98A]/40 text-[#20C98A] text-xs font-black tracking-widest uppercase font-mono shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#20C98A] animate-ping" />
            <span>AASRA · AI FOR EVERY FIELD</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white leading-[1.1]">
            Ask your field. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C98A] via-[#00A878] to-amber-300">
              Act with confidence.
            </span> <br />
            Prove the impact.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
            AASRA listens to farmers, understands field conditions, gives practical guidance in their language, and helps measure whether the intervention created real value.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              href="/assistant"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#00A878] hover:bg-[#20C98A] text-white font-black text-sm transition-all shadow-xl shadow-[#00A878]/30 flex items-center justify-center gap-3 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Mic className="h-5 w-5 text-amber-300 animate-pulse" />
              <span>Talk to AASRA</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/impact-story"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-[#20C98A]" />
              <span>Explore Impact</span>
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Floating Voice Interaction Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-5 flex justify-center"
        >
          <div className="relative w-full max-w-md glass-panel-dark p-6 sm:p-7 rounded-3xl border border-[#20C98A]/40 shadow-2xl space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-[#00A878] flex items-center justify-center text-amber-300 font-bold shadow-md">
                  <Mic className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm font-display">Ask AASRA</h3>
                  <span className="text-[10px] text-emerald-300 font-mono">Hindi Dialect Voice AI</span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#20C98A]/20 text-[#20C98A] text-[10px] font-mono font-bold border border-[#20C98A]/30">
                SARVAM AI SPEECH
              </span>
            </div>

            {/* Hindi Question Quote Box */}
            <div className="bg-[#10241F]/80 p-4.5 rounded-2xl border border-white/10 text-xs text-emerald-100 font-semibold leading-relaxed relative">
              <span className="text-2xl text-[#20C98A] absolute top-2 left-3 font-serif">“</span>
              <p className="pl-4 pt-1">
                मेरी सोयाबीन की फसल के लिए अगले कुछ दिनों में क्या सावधानी रखनी चाहिए?
              </p>
              <span className="text-[11px] text-slate-400 block mt-2 pt-2 border-t border-white/10 font-normal">
                (Translation: What precautions should I take for my soybean crop in the coming days?)
              </span>
            </div>

            {/* Listening Indicator with Waveform */}
            <div className="flex flex-col items-center justify-center gap-3 py-2">
              <div className="relative flex items-center justify-center">
                {/* Animated Pulsing Sound Rings */}
                <div className="absolute h-20 w-20 rounded-full bg-[#00A878]/30 animate-ping" />
                <div className="absolute h-16 w-16 rounded-full bg-[#20C98A]/40 animate-pulse" />
                <button
                  onClick={() => setIsListening(!isListening)}
                  className="relative z-10 h-14 w-14 rounded-full bg-[#00A878] hover:bg-[#20C98A] text-white flex items-center justify-center shadow-xl border-2 border-white/60 transition-transform cursor-pointer hover:scale-110 active:scale-95"
                >
                  <Mic className="h-7 w-7 text-amber-300" />
                </button>
              </div>

              {/* Soundwave Bars */}
              <div className="flex items-end gap-1.5 h-7">
                <div className="w-1.5 bg-[#20C98A] rounded-full equalizer-bar-1" />
                <div className="w-1.5 bg-[#20C98A] rounded-full equalizer-bar-2" />
                <div className="w-1.5 bg-amber-300 rounded-full equalizer-bar-3" />
                <div className="w-1.5 bg-[#20C98A] rounded-full equalizer-bar-4" />
                <div className="w-1.5 bg-[#20C98A] rounded-full equalizer-bar-1" style={{ animationDelay: "0.3s" }} />
              </div>

              <span className="text-xs font-mono font-bold text-emerald-300">
                [ AASRA is listening in Hindi... ]
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
