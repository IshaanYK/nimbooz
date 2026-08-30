"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Volume2, Globe, CheckCircle2, Activity, Sparkles, Smartphone } from "lucide-react";

export const Ps04SpeechIntelligence: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<"hi" | "mr" | "en">("hi");

  const SAMPLES = {
    hi: {
      question: "मेरी सोयाबीन में गर्मी का असर तो नहीं है?",
      transcription: "Meri soybean me garmi ka asar to nahi hai?",
      answer: "आपकी फसल अभी flowering stage में है। अगले 3 दिनों में रात का तापमान 25.5°C रहने से Heat Stress का ख़तरा 78% है। 13-14 अगस्त के बीच Syngenta Stress Buster का छिड़काव करें।",
      confidence: "98.4%",
    },
    mr: {
      question: "माझ्या सोयाबीन पिकावर उष्णतेचा परिणाम होईल का?",
      transcription: "Mazya soybean pikavar ushnatetca parinam hoil ka?",
      answer: "तुमचे पीक सध्या फुलोरा अवस्थेत आहे. पुढील ३ दिवसांत रात्रीचे तापमान २५.५°C राहिल्याने उष्णतेचा धोका ७८% आहे. १३-१४ ऑगस्ट दरम्यान बायोस्टिमुलंटची फवारणी करा.",
      confidence: "97.8%",
    },
    en: {
      question: "Is there any heat stress risk on my soybean crop?",
      transcription: "Is there any heat stress risk on my soybean crop?",
      answer: "Your crop is currently at the flowering stage. Night temps rising to 25.5°C over the next 3 days create a 78% heat stress risk. Apply Syngenta Stress Buster between Aug 13–14.",
      confidence: "99.1%",
    },
  };

  const currentSample = SAMPLES[selectedLang];

  return (
    <section className="w-full bg-[#063B2D] text-white py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A878]/30 text-[#20C98A] text-xs font-mono font-black uppercase border border-[#20C98A]/30">
            <Mic className="h-4 w-4 text-amber-300" /> PS-04 SPEECH INTELLIGENCE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
            Talk naturally. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C98A] to-amber-300">
              AASRA understands your field.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Powered by Google Cloud Chirp 3 HD &amp; Google Gemini 2.5 Flash Voice Engine calibrated for 12 Indian regional agricultural languages.
          </p>

          {/* Language Selector */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[
              { id: "hi", label: "हिन्दी (Hindi)" },
              { id: "mr", label: "मराठी (Marathi)" },
              { id: "en", label: "English" },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedLang === lang.id
                    ? "bg-[#00A878] text-white shadow-lg shadow-[#00A878]/30 font-bold"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Large Device Mockup Container */}
        <div className="max-w-3xl mx-auto glass-panel-dark p-6 sm:p-8 rounded-3xl border border-[#20C98A]/40 shadow-2xl space-y-6">
          {/* Top Phone Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-[#20C98A]" />
              <span className="font-extrabold text-white">AASRA Voice Assistant</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-300">
              <span>Confidence: <strong className="text-amber-300">{currentSample.confidence}</strong></span>
              <span className="px-2 py-0.5 rounded bg-[#00A878]/40 border border-[#20C98A]/40 text-[10px]">GOOGLE CHIRP 3 HD · GEMINI 2.5</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-4">
            {/* Farmer Message Bubble */}
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="h-9 w-9 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-md">
                👨‍🌾
              </div>
              <div className="bg-[#00A878]/30 border border-[#20C98A]/40 p-4 rounded-2xl max-w-lg text-xs space-y-1 text-right">
                <span className="text-[10px] text-emerald-300 font-mono block">Farmer Input (Voice)</span>
                <p className="font-extrabold text-white text-sm">{currentSample.question}</p>
                <p className="text-[11px] text-slate-300 italic">"{currentSample.transcription}"</p>
              </div>
            </div>

            {/* AASRA AI Response Bubble */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-2xl bg-[#00A878] text-amber-300 font-bold flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="bg-[#10241F] border border-emerald-500/30 p-4 rounded-2xl max-w-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#20C98A] font-mono font-bold">AASRA Response (Voice + Text)</span>
                  <Volume2 className="h-4 w-4 text-amber-300 animate-pulse" />
                </div>
                <p className="font-medium text-slate-100 leading-relaxed text-xs sm:text-sm">
                  {currentSample.answer}
                </p>
              </div>
            </div>
          </div>

          {/* Voice Waveform & Pulse Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-12 w-12 rounded-full bg-[#00A878]/40 animate-ping" />
                <div className="h-10 w-10 rounded-full bg-[#00A878] text-white flex items-center justify-center shadow-lg">
                  <Mic className="h-5 w-5 text-amber-300" />
                </div>
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">Voice Engine Listening</span>
                <span className="text-[10px] text-emerald-300 font-mono">12 Indian Dialects</span>
              </div>
            </div>

            {/* Waveform Visualization */}
            <div className="flex items-end gap-1 h-6">
              <div className="w-1 bg-[#20C98A] rounded-full equalizer-bar-1" />
              <div className="w-1 bg-[#20C98A] rounded-full equalizer-bar-2" />
              <div className="w-1 bg-amber-300 rounded-full equalizer-bar-3" />
              <div className="w-1 bg-[#20C98A] rounded-full equalizer-bar-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
