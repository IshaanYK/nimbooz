"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AdvisoryChat } from "@/components/AdvisoryChat";
import { PageHelpModal } from "@/components/PageHelpModal";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { useFarm } from "@/context/FarmContext";
import { resolveCropThresholds } from "@/lib/cropRegistry";
import { getCropAdvisoryProfile } from "@/lib/agriculture/cropAdvisoryMatrix";
import {
  Thermometer,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Droplets,
  Wind,
  ShieldCheck,
  Sprout,
  Compass,
  Cpu,
  Layers,
} from "lucide-react";

export default function AssistantPage() {
  const { language, setLanguage, t } = useLanguage();
  const { weather, refetch } = useWeather();
  const { activeFarm, activeField } = useFarm();
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [activeCropId, setActiveCropId] = useState<string>(
    (activeField?.crop || activeFarm?.primaryCrop || "wheat").toLowerCase()
  );

  const cropInfo = resolveCropThresholds(activeCropId);
  const cropProfile = getCropAdvisoryProfile(activeCropId);

  return (
    <AppShell>
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 font-sans">
        
        {/* ─────────────────────────────────────────────────────────────
            1. HEADER SECTION (LINEAR-INSPIRED SLEEK HERO)
           ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[11px] font-mono font-bold text-[#5e6ad2] bg-[#5e6ad2]/10 px-2.5 py-0.5 rounded-full border border-[#5e6ad2]/30 uppercase tracking-wide">
                PS-04 · PRECISION MULTI-CROP AGRI-STACK
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                50+ CROPS
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                GEMINI 2.5 FLASH
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                GOOGLE CHIRP 3 HD
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-[#111827] tracking-tight">
              {t.askAasraTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1">
              Hyper-local, zero-hallucination agricultural intelligence grounded in live Open-Meteo telemetry & APMC Agmarknet prices.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => refetch(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#5e6ad2]" />
              <span>Sync Live Sensors</span>
            </button>

            <PageHelpModal
              pageKey="assistant"
              title="How to Use AASRA Multi-Crop AI Assistant"
              subtitle="AASRA's Multilingual Assistant pairs Google Gemini 2.5 Flash reasoning with Open-Meteo micro-climatic telemetry, 50+ crop knowledge base, and APMC Mandi prices."
              steps={[
                { number: "01", title: "Select Preferred Language & Crop", desc: "Choose any of 12 Indian languages and switch between 50+ crops using the top bar to tailor agronomic advice." },
                { number: "02", title: "Speak or Type Your Query", desc: "Speak directly in your regional dialect or type questions about disease diagnosis, chemical dosages, spray timing, or mandi rates." },
                { number: "03", title: "Instant Leaf Photo Inspection", desc: "Click the camera icon to upload or snap a leaf photo for instant multimodal thermal damage, rust, and chlorosis diagnosis." },
              ]}
            />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. 12 INDIAN LANGUAGES SELECTOR RIBBON
           ───────────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-600 notranslate" translate="no">
              {t.quickLanguageLabel} (12 Regional Languages)
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
                    ? "bg-[#5e6ad2] text-white border-[#5e6ad2] shadow-xs ring-2 ring-[#5e6ad2]/20"
                    : "bg-white border-slate-200 text-slate-700 hover:border-[#5e6ad2]/50 hover:text-[#5e6ad2]"
                }`}
                translate="no"
              >
                <span className="notranslate font-bold" translate="no">{label}</span>{" "}
                <span className={`text-[10px] notranslate ${language === code ? "text-indigo-100" : "opacity-60"}`} translate="no">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. SUGGESTED CROP-AWARE QUESTION CHIPS
           ───────────────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <span className="text-xs font-mono font-bold text-slate-500">{t.tryAskingLabel}</span>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              language === "hi" ? `${cropInfo.nameHi} का आज का ताजा मंडी भाव क्या है?` : `What is today's ${cropInfo.name} mandi price?`,
              language === "hi" ? `क्या आज मेरी फसल में स्प्रे करने का सही समय है?` : `When is the safest spray window today?`,
              language === "hi" ? `${cropInfo.nameHi} में कीट व फफूंद रोग की रोकथाम के उपाय बताएं` : `How to control pests & diseases in ${cropInfo.name}?`,
              language === "hi" ? `तापमान तनाव से फसल को बचाने के उपाय` : `How to protect crops against heat stress?`,
              language === "hi" ? `दवा छिड़काव की सही मात्रा (Dosage) प्रति एकड़ बताएं` : `Recommended product dosage per acre`,
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedQuestion(q)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-indigo-50/70 border border-slate-200/90 hover:border-[#5e6ad2]/50 text-slate-700 hover:text-[#5e6ad2] cursor-pointer transition-all whitespace-nowrap shrink-0 shadow-2xs text-left"
              >
                💡 {q}
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. MAIN GRID LAYOUT (AI ADVISORY + TELEMETRY SIDEBAR)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Main Multilingual AI Voice Chat & Leaf Scanner (2 Cols) */}
          <div className="lg:col-span-2">
            <AdvisoryChat
              currentField={activeField?.name || "Field 1"}
              crop={activeCropId}
              onCropChange={(cId) => setActiveCropId(cId)}
              externalQuery={selectedQuestion}
              onClearExternalQuery={() => setSelectedQuestion("")}
            />
          </div>

          {/* Live Telemetry, Crop Biology & Safety Sidebar (1 Col) */}
          <div className="space-y-6">
            
            {/* Live Telemetry Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 font-display flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-[#5e6ad2]" />
                  <span>{t.liveFieldTelemetry}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => refetch(true)}
                  className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500">Active Crop:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sprout className="h-3.5 w-3.5 text-[#5e6ad2]" />
                    <span>{language === "hi" ? cropInfo.nameHi : cropInfo.name}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500">Air Temperature:</span>
                  <span className="font-bold text-[#5e6ad2]">{weather.temperature}°C</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500">Soil Moisture:</span>
                  <span className="font-bold text-emerald-600">{weather.soilMoistureEst}% Index</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500">Wind Speed:</span>
                  <span className="font-bold text-slate-800">{weather.windSpeed} km/h</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500">Night Temperature:</span>
                  <span className="font-bold text-slate-800">
                    {weather.nightTemperature ? `${weather.nightTemperature}°C` : "21.0°C"}
                  </span>
                </div>
              </div>

              {/* Crop Thermal Range Indicator */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-700 font-bold font-mono">
                  <span>Optimal Range ({cropInfo.name}):</span>
                  <span>{cropInfo.t_opt_day}°C – {cropInfo.t_limit_day}°C</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: "65%" }}></div>
                  <div className="bg-amber-500 h-full" style={{ width: "20%" }}></div>
                  <div className="bg-rose-500 h-full" style={{ width: "15%" }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Optimal</span>
                  <span>Caution</span>
                  <span>Critical Stress</span>
                </div>
              </div>

              {/* Heat Stress Alert if active */}
              {weather.isNightHeatStress && (
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-900 text-xs font-mono space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Thermal Stress Risk: {weather.heatStressPercent}%</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                    Night temp exceeds {cropInfo.t_opt_night}°C threshold causing respiration carbohydrate loss. Syngenta Quantis® biostimulant recommended.
                  </p>
                </div>
              )}
            </div>

            {/* Architecture Card */}
            <div className="bg-gradient-to-br from-[#0f1011] to-[#18191a] text-white border border-[#23252a] rounded-2xl p-5 sm:p-6 space-y-3 shadow-md">
              <div className="flex items-center gap-2 font-bold text-sm text-[#f7f8f8]">
                <Cpu className="h-4 w-4 text-[#5e6ad2]" />
                <span>AASRA 5-Stage Precision Engine</span>
              </div>
              <ul className="text-xs text-[#8a8f98] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#5e6ad2] font-bold">1.</span>
                  <span><strong>Multi-Crop Registry:</strong> 50+ crops with thermal & GDD thresholds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5e6ad2] font-bold">2.</span>
                  <span><strong>Hyper-Local Grounding:</strong> Live Open-Meteo telemetry for exact coordinates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5e6ad2] font-bold">3.</span>
                  <span><strong>APMC Mandi Intelligence:</strong> 700+ verified government market yards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5e6ad2] font-bold">4.</span>
                  <span><strong>Agronomic Safety Guard:</strong> Real-time spray drift & dosage calculator</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5e6ad2] font-bold">5.</span>
                  <span><strong>Multilingual Chirp 3 HD:</strong> 12 Indian languages with natural acoustic speech</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </AppShell>
  );
}
