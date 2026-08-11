"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  ChevronRight,
  MessageSquare,
  Mic,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { speakIndianFemaleVoice } from "@/lib/voiceUtils";

export const AiWelcomeAssistant: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesisAvailable, setSpeechSynthesisAvailable] = useState(false);
  const [activeMessage, setActiveMessage] = useState(
    "Namaste! 🙏 Welcome to AASRA — Your Field's Intelligent AI Companion. I am here to help you protect your crop from night heat stress and maximize your farm yield."
  );

  const QUICK_PROMPTS = [
    {
      title: "What is AASRA?",
      answer:
        "AASRA (आसरा) is India's most caring AI companion for farmers. It connects live weather telemetry from Meteoblue with Syngenta biological crop protection to protect seeds, prevent heat stress, and guarantee extra farm income.",
      audio: "AASRA is India's most caring AI companion for farmers, protecting crop yield and providing expert advice in 12 Indian languages.",
    },
    {
      title: "How weather protection works?",
      answer:
        "AASRA automatically measures soil moisture, ambient temperature, and night heat degree-hours. When heat risk is sensed, it recommends Syngenta Stress Buster sprays before yield loss happens.",
      audio: "AASRA monitors soil moisture and temperature degree hours automatically, warning you before heat damages your crop.",
    },
    {
      title: "How to Sign Up?",
      answer:
        "Click the green 'Sign Up' button on the top header or click 'Start My Farm Setup'. It takes less than 1 minute to select your crop, district, and field size!",
      audio: "Signing up takes less than 1 minute. Select your language, crop, and location to activate personalized weather alerts.",
    },
    {
      title: "Check ROBI Yield ROI",
      answer:
        "Our ROBI engine proves an average net profit increase of +₹8,900 per hectare (15.8:1 ROI) for soybean, cotton, and paddy crops.",
      audio: "Our ROBI engine proves an extra profit of over 8 thousand 9 hundred rupees per hectare for Indian farmers.",
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSynthesisAvailable(true);
    }

    const timer = setTimeout(() => {
      const visited = sessionStorage.getItem("aasra_welcome_shown");
      if (!visited) {
        setIsOpen(true);
        sessionStorage.setItem("aasra_welcome_shown", "true");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    speakIndianFemaleVoice(
      text,
      "hi",
      () => setIsPlaying(true),
      () => setIsPlaying(false)
    );
  };

  const handlePromptClick = (prompt: (typeof QUICK_PROMPTS)[0]) => {
    setActiveMessage(prompt.answer);
    if (speechSynthesisAvailable) {
      speakText(prompt.audio);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      speakText(activeMessage);
    }
  };

  return (
    <>
      {/* Floating AI Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-500 text-white shadow-2xl hover:scale-110 transition-all flex items-center gap-2.5 cursor-pointer group border-2 border-white/50"
      >
        <div className="relative">
          <Bot className="h-6 w-6 text-amber-300 animate-bounce" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 animate-ping" />
        </div>
        <span className="hidden sm:inline font-black text-xs pr-1">AASRA AI Guide</span>
      </button>

      {/* Interactive AI Assistant Modal / Popup */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[80vh] bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col font-sans animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0f291e] to-emerald-950 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 p-1 flex items-center justify-center">
                <Bot className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5 font-display">
                  AASRA AI Assistant <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                </h3>
                <p className="text-[10px] text-emerald-400 font-mono">12 Languages • Voice Enabled</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleAudio}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 transition-all cursor-pointer"
                title={isPlaying ? "Mute Speech" : "Listen to Voice"}
              >
                {isPlaying ? <Volume2 className="h-4 w-4 text-amber-400 animate-pulse" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Assistant Chat Body */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* AI Speech Bubble */}
            <div className="bg-emerald-50/90 p-4 rounded-2xl border border-emerald-500/30 text-slate-800 leading-relaxed relative">
              <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>AASRA Intelligence Response:</span>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed">{activeMessage}</p>

              {isPlaying && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-700 font-mono font-bold">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Speaking voice guidance...</span>
                </div>
              )}
            </div>

            {/* Quick Interactive Prompt Chips */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">
                Tap to Ask AASRA:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.title}
                    onClick={() => handlePromptClick(prompt)}
                    className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-500/20 hover:border-emerald-500/50 text-left font-bold text-slate-800 transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <span className="text-xs group-hover:text-emerald-800">{prompt.title}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* Sign Up CTA Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3.5 rounded-2xl text-white space-y-2 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-amber-300" /> Ready to protect your farm?
                </span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/onboarding");
                }}
                className="w-full py-2 px-3 rounded-xl bg-white text-emerald-950 font-black text-xs flex items-center justify-center gap-1.5 shadow hover:bg-emerald-50 transition-all cursor-pointer"
              >
                Sign Up Now — It's Free <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
