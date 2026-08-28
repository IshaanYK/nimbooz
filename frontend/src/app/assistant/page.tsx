"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AdvisoryChat } from "@/components/AdvisoryChat";
import { DataBadge } from "@/components/DataBadge";
import { PageHelpModal } from "@/components/PageHelpModal";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { getActiveField } from "@/lib/fieldStore";
import { Mic, Thermometer, RefreshCw, AlertTriangle, Sparkles, Volume2, Camera, ShieldCheck, Zap } from "lucide-react";

export default function AssistantPage() {
  const { language, setLanguage, t } = useLanguage();
  const { weather, refetch } = useWeather();
  const activeField = getActiveField();
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[11px] font-mono font-bold text-[#10B981] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                100% GOOGLE AI AGRI-STACK
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                GEMINI 2.5 FLASH
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                GOOGLE CHIRP 3 HD
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
              {t.askAasraTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              {t.askAasraDesc}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => refetch(true)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 text-[#10B981]" />
              <span className="hidden sm:inline">Sync Live Sensors</span>
            </button>

            <PageHelpModal
              pageKey="assistant"
              title="How to Use AASRA AI Assistant"
              subtitle="AASRA's Multilingual Assistant pairs Google Gemini 2.5 Flash reasoning with Google Chirp 3 HD audio and Vision diagnostics."
              steps={[
                { number: "01", title: "Select Preferred Language", desc: "Choose any of 12 Indian languages from top header or quick pills below to switch AI responses, STT, and voice speech." },
                { number: "02", title: "Tap Microphone or Type Question", desc: "Speak directly in your regional dialect or type any query about night heat stress, spray windows, or biostimulant dosage." },
                { number: "03", title: "Upload / Take Leaf Photo", desc: "Click camera icon on mobile or desktop to snap crop leaf photos for instant multimodal thermal damage and chlorosis diagnosis." },
              ]}
            />
          </div>
        </div>

        {/* 12 Indian Languages Quick-Select Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-600 notranslate" translate="no">
              {t.quickLanguageLabel} (12 Languages Supported)
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar notranslate" translate="no">
            {[
              { code: "hi", label: "हिंदी",    name: "Hindi"    },
              { code: "mr", label: "मराठी",   name: "Marathi"  },
              { code: "pa", label: "ਪੰਜਾਬੀ",  name: "Punjabi"  },
              { code: "gu", label: "ગુજરાતી", name: "Gujarati" },
              { code: "te", label: "తెలుగు",  name: "Telugu"   },
              { code: "ta", label: "தமிழ்",  name: "Tamil"    },
              { code: "kn", label: "ಕನ್ನಡ",   name: "Kannada"  },
              { code: "ml", label: "മലയാളം", name: "Malayalam"},
              { code: "bn", label: "বাংলা",   name: "Bengali"  },
              { code: "or", label: "ଓଡ଼ିଆ",   name: "Odia"     },
              { code: "as", label: "অসমীয়া",  name: "Assamese" },
              { code: "en", label: "English",  name: "English"  },
            ].map(({ code, label, name }) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all select-none whitespace-nowrap notranslate shrink-0 ${
                  language === code
                    ? "bg-[#10B981] text-white border-emerald-600 shadow-xs ring-2 ring-emerald-200"
                    : "bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-[#10B981]"
                }`}
                translate="no"
              >
                <span className="notranslate font-bold" translate="no">{label}</span>{" "}
                <span className={`text-[10px] notranslate ${language === code ? "text-emerald-100" : "opacity-60"}`} translate="no">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="space-y-1.5">
          <span className="text-xs font-mono font-bold text-slate-500">{t.tryAskingLabel}</span>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              t.sampleQ1,
              t.sampleQ2,
              t.sampleQ3,
              t.sampleQ4,
              t.sampleQ5,
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setSelectedQuestion(q)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 cursor-pointer transition-all whitespace-nowrap shrink-0 shadow-xs text-left"
              >
                💡 {q}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Main Multilingual AI Voice Chat & Leaf Scanner (2 Cols) */}
          <div className="lg:col-span-2 stripe-card p-4 sm:p-6 flex flex-col">
            <AdvisoryChat
              currentField={activeField.name}
              crop={activeField.crop}
              externalQuery={selectedQuestion}
              onClearExternalQuery={() => setSelectedQuestion("")}
            />
          </div>

          {/* Live Telemetry & Heat Stress Sidebar (1 Col) */}
          <div className="space-y-6">
            <div className="stripe-card p-5 sm:p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 font-display flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-rose-500" />
                  {t.liveFieldTelemetry}
                </h3>
                <button onClick={() => refetch(true)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Active Field:</span>
                  <span className="font-bold text-slate-900">{activeField.name} ({activeField.crop})</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Air Temperature:</span>
                  <span className="font-bold text-rose-600">{weather.temperature}°C</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Soil Moisture:</span>
                  <span className="font-bold text-emerald-600">{weather.soilMoistureEst}% Index</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Wind Speed:</span>
                  <span className="font-bold text-slate-800">{weather.windSpeed} km/h</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Precipitation:</span>
                  <span className="font-bold text-slate-800">{weather.precipitation} mm</span>
                </div>
              </div>

              {weather.isNightHeatStress && (
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-900 text-xs font-mono space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Heat Stress Risk: {weather.heatStressPercent}%</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                    Night temp &gt; 25°C threshold during flowering stage causes dark respiration sugar loss. Syngenta Stress Buster application recommended.
                  </p>
                </div>
              )}

              {/* Google Technology Attribution Card */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs font-accent space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>Google AI Architecture</span>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 font-body">
                  <li><strong>Reasoning:</strong> Google Gemini 2.5 Flash</li>
                  <li><strong>Vision Diagnostics:</strong> Google Gemini 2.5 Flash Vision</li>
                  <li><strong>Voice Engine:</strong> Google Chirp 3 HD & Neural TTS</li>
                  <li><strong>Speech-to-Text:</strong> Google Native Web Speech</li>
                </ul>
              </div>

            </div>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
