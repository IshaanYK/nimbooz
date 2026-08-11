"use client";

import React, { useState } from "react";
import {
  Thermometer,
  ShieldCheck,
  TrendingUp,
  Mic,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Leaf,
  Sparkles,
  HelpCircle,
  BarChart2,
  Award,
} from "lucide-react";
import Link from "next/link";

export const WhyScienceSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"night_heat" | "syngenta" | "robi" | "voice">("night_heat");

  return (
    <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 space-y-8 font-sans">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/90 text-emerald-950 text-xs font-black border border-emerald-500/30">
          <HelpCircle className="h-4 w-4 text-emerald-600" /> Deep Science & Field Evidence
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-[#0f291e] tracking-tight">
          Why AASRA Works (आसरा क्यूँ असरदार है?)
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
          Discover the biological science, weather telemetry, and field trial data behind India's most trusted AI farming companion.
        </p>
      </div>

      {/* Interactive Tab Switcher */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-white border border-emerald-500/20 shadow-sm no-scrollbar">
        <button
          onClick={() => setActiveTab("night_heat")}
          className={`px-4 sm:px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "night_heat"
              ? "bg-emerald-600 text-white shadow-md font-black"
              : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50"
          }`}
        >
          <Thermometer className="h-4 w-4" /> 1. Night Heat Risk
        </button>

        <button
          onClick={() => setActiveTab("syngenta")}
          className={`px-4 sm:px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "syngenta"
              ? "bg-emerald-600 text-white shadow-md font-black"
              : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50"
          }`}
        >
          <Leaf className="h-4 w-4" /> 2. Syngenta Science
        </button>

        <button
          onClick={() => setActiveTab("robi")}
          className={`px-4 sm:px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "robi"
              ? "bg-emerald-600 text-white shadow-md font-black"
              : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50"
          }`}
        >
          <TrendingUp className="h-4 w-4" /> 3. ROBI Profit ROI
        </button>

        <button
          onClick={() => setActiveTab("voice")}
          className={`px-4 sm:px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "voice"
              ? "bg-emerald-600 text-white shadow-md font-black"
              : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50"
          }`}
        >
          <Mic className="h-4 w-4" /> 4. Dialect Voice AI
        </button>
      </div>

      {/* Deep Explainer Tab Content */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-emerald-500/20 shadow-xl transition-all">
        {activeTab === "night_heat" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-950 font-black text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Hidden Crop Danger
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-slate-950 leading-snug">
                Why Night Temperatures Above 22°C Destroy Crop Yield
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Most farmers only watch daytime sun, but <strong>night heat stress</strong> causes plants to burn stored sugars through dark respiration. When night temps stay above 22°C, soybean pods drop, cotton bolls shrink, and yield decreases by up to 25%.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>AASRA tracks hourly Meteoblue night heat degree-hours in real time.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Alerts you 48 hours before flower drop occurs in your field.</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/80 p-6 rounded-3xl border border-amber-300 space-y-4 font-mono-numeric">
              <div className="flex justify-between items-center text-xs font-bold text-amber-950">
                <span>Night Temperature Index</span>
                <span className="text-amber-700 font-black">CRITICAL RISK</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Daytime Max:</span>
                  <span className="font-bold text-slate-900">35.4°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Night Minimum:</span>
                  <span className="font-extrabold text-amber-700">24.8°C (High Risk)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Degree-Hours Accumulated:</span>
                  <span className="font-bold text-slate-900">6.3 / 9.0 Index</span>
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs font-sans text-amber-900">
                💡 <strong>Action Recommended:</strong> Apply Syngenta Stress Buster within 48 hours.
              </div>
            </div>
          </div>
        )}

        {activeTab === "syngenta" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 font-black text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Biological Science
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-slate-950 leading-snug">
                Why Syngenta Biologicals Protect Plant Cell Membranes
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Syngenta biostimulants supply vital osmoprotectants and amino acids directly through foliar spray. This stabilizes plant cell membranes during heat stress, keeping stomata functioning and preventing premature senescence.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Reduces leaf water evaporation loss by 32%.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Maintains pod development during dry heat spells.</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/80 p-6 rounded-3xl border border-emerald-300 space-y-4">
              <h4 className="font-black text-emerald-950 text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" /> Proven Biological Products
              </h4>
              <div className="space-y-3 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200">
                  <span className="font-extrabold text-emerald-950 block">Syngenta Stress Buster</span>
                  <span className="text-slate-600">Foliar application @ 500 ml/ha during flowering & pod set.</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200">
                  <span className="font-extrabold text-emerald-950 block">Syngenta Yield Boost Pro</span>
                  <span className="text-slate-600">Enhances seed weight and oil content in soybean & mustard.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "robi" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-950 font-black text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-teal-600" /> Proven Field ROI
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-slate-950 leading-snug">
                Why ROBI Guarantees +₹8,900 / Hectare Net Extra Profit
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                ROBI (Return on Biological Investment) calculates exact input cost vs extra yield market value. Field trials across Madhya Pradesh and Maharashtra prove an average yield gain of +250 kg/ha.
              </p>
              <div className="space-y-2 pt-2 font-mono-numeric text-xs">
                <div className="flex justify-between bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-600">Biological Spray Cost:</span>
                  <span className="font-bold text-slate-900">₹600 / ha</span>
                </div>
                <div className="flex justify-between bg-emerald-50 p-2.5 rounded-xl text-emerald-950 font-bold">
                  <span>Gross Extra Market Value:</span>
                  <span>+₹9,500 / ha</span>
                </div>
              </div>
            </div>

            <div className="bg-teal-50/80 p-6 rounded-3xl border border-teal-300 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-3xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-lg">
                15.8:1
              </div>
              <h4 className="font-black text-teal-950 text-base">Average Field ROI Ratio</h4>
              <p className="text-xs text-slate-600">
                For every ₹1 spent on AASRA-guided biological protection, farmers gain ₹15.80 in net profit.
              </p>
            </div>
          </div>
        )}

        {activeTab === "voice" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 font-black text-xs">
                <Mic className="h-3.5 w-3.5 text-emerald-600" /> Speech Intelligence
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-slate-950 leading-snug">
                Why Authentic Indian Female Voice AI Breaks Literacy Barriers
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Many Indian farmers prefer speaking over typing. AASRA uses Sarvam AI STT & TTS models tuned to 12 Indian regional dialects with clear female voice pronunciation.
              </p>
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Supports Hindi, Marathi, Gujarati, Punjabi, Telugu, Tamil, & 6 more</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/80 p-6 rounded-3xl border border-emerald-300 text-center space-y-3">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                <Mic className="h-7 w-7 text-amber-300" />
              </div>
              <h4 className="font-black text-emerald-950 text-base">Zero Typing Needed</h4>
              <p className="text-xs text-slate-600">
                Just tap the microphone, speak your question naturally, and hear warm voice advice back immediately.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
