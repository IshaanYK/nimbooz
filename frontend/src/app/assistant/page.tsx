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
import { findCropMandiRate } from "@/lib/mandiEngine";
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
  Activity,
  TrendingUp,
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
            1. HEADER SECTION (STRIPE-INSPIRED REFINED HERO)
           ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3e8ee] pb-5 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-mono font-bold text-[#533afd] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1.5 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-[#533afd] animate-ping" />
                PS-04 · PRECISION MULTI-CROP AGRI-STACK
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-[#f6f9fc] px-2.5 py-0.5 rounded-full border border-[#e3e8ee]">
                50+ CROPS
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-[#f6f9fc] px-2.5 py-0.5 rounded-full border border-[#e3e8ee]">
                GEMINI 2.5 FLASH
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-[#f6f9fc] px-2.5 py-0.5 rounded-full border border-[#e3e8ee]">
                GOOGLE CHIRP 3 HD
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#0d253d] tracking-tight">
              {t.askAasraTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-3xl mt-1">
              Hyper-local, zero-hallucination agricultural intelligence grounded in live Open-Meteo telemetry & APMC Agmarknet prices.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => refetch(true)}
              className="px-4 py-2 rounded-xl border border-[#e3e8ee] bg-white hover:bg-[#f6f9fc] text-[#0d253d] text-xs font-bold flex items-center gap-1.5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#533afd]" />
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
                    ? "bg-gradient-to-r from-[#533afd] to-[#4434d4] text-white border-[#4434d4] shadow-sm ring-2 ring-[#533afd]/20"
                    : "bg-white border-[#e3e8ee] text-[#0d253d] hover:border-indigo-300 hover:bg-indigo-50/50 shadow-2xs"
                }`}
                translate="no"
              >
                <span className="notranslate font-bold" translate="no">{label}</span>{" "}
                <span className={`text-[10px] notranslate ${language === code ? "text-indigo-100" : "text-slate-400"}`} translate="no">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. SUGGESTED CROP-AWARE & TELEMETRY-AWARE QUESTION CHIPS
           ───────────────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500">{t.tryAskingLabel}</span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              Live {weather.temperature}°C Grounded
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              language === "hi"
                ? `🌡️ ${weather.temperature}°C में क्या ${cropInfo.nameHi} पर स्ट्रेस बस्टर स्प्रे करना चाहिए?`
                : `🌡️ At ${weather.temperature}°C: Should I spray stress buster on ${cropInfo.name}?`,
              language === "hi"
                ? `🏛️ ${weather.district || "भोपाल"} APMC में आज ${cropInfo.nameHi} का ताजा मंडी भाव क्या है?`
                : `🏛️ What is today's ${cropInfo.name} mandi price in ${weather.district || "Bhopal"} APMC?`,
              language === "hi"
                ? `💨 हवा ${weather.windSpeed} km/h: क्या आज कीटनाशक/टॉनिक छिड़काव के लिए सुरक्षित मौसम है?`
                : `💨 Wind at ${weather.windSpeed} km/h: Is current weather safe for spraying?`,
              language === "hi"
                ? `💧 मिट्टी में ${weather.soilMoistureEst}% नमी: क्या सिंचाई तुरंत करनी चाहिए?`
                : `💧 Soil moisture index at ${weather.soilMoistureEst}%: Is immediate irrigation required?`,
              language === "hi"
                ? `🛡️ सिंजेंटा क्वांटिस®: मेरे 5 एकड़ खेत के लिए सही खुराक व पानी की मात्रा बताएं`
                : `🛡️ Syngenta Quantis®: Exact dosage and water dilution for 5 acres`,
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedQuestion(q)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-indigo-50/80 border border-[#e3e8ee] hover:border-indigo-300 text-[#0d253d] hover:text-[#533afd] cursor-pointer transition-all whitespace-nowrap shrink-0 shadow-2xs text-left flex items-center gap-1.5 hover:scale-[1.01]"
              >
                <span>💡</span>
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. MAIN GRID LAYOUT (AI ADVISORY + TELEMETRY SIDEBAR)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          
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
            <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-[#0d253d] font-display flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Thermometer className="h-4 w-4 text-[#533afd]" />
                  <span>{t.liveFieldTelemetry}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => refetch(true)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  title="Refresh Telemetry"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center bg-[#f6f9fc] p-3 rounded-xl border border-[#e3e8ee]">
                  <span className="text-slate-500 font-sans font-medium">Active Crop:</span>
                  <span className="font-bold text-[#0d253d] flex items-center gap-1.5">
                    <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{language === "hi" ? cropInfo.nameHi : cropInfo.name}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[#f6f9fc] p-3 rounded-xl border border-[#e3e8ee]">
                  <span className="text-slate-500 font-sans font-medium">Air Temperature:</span>
                  <span className="font-bold text-[#533afd] text-sm">{weather.temperature}°C</span>
                </div>

                <div className="flex justify-between items-center bg-[#f6f9fc] p-3 rounded-xl border border-[#e3e8ee]">
                  <span className="text-slate-500 font-sans font-medium">Soil Moisture:</span>
                  <span className="font-bold text-emerald-600 text-sm">{weather.soilMoistureEst}% Index</span>
                </div>

                <div className="flex justify-between items-center bg-[#f6f9fc] p-3 rounded-xl border border-[#e3e8ee]">
                  <span className="text-slate-500 font-sans font-medium">Wind Speed:</span>
                  <span className="font-bold text-[#0d253d]">{weather.windSpeed} km/h</span>
                </div>

                <div className="flex justify-between items-center bg-[#f6f9fc] p-3 rounded-xl border border-[#e3e8ee]">
                  <span className="text-slate-500 font-sans font-medium">Night Temperature:</span>
                  <span className="font-bold text-[#0d253d]">
                    {weather.nightTemperature ? `${weather.nightTemperature}°C` : "21.0°C"}
                  </span>
                </div>
              </div>

              {/* Interactive Crop Thermal Range Indicator with Live Gauge Needle */}
              <div className="bg-[#f6f9fc] p-4 rounded-2xl border border-[#e3e8ee] space-y-3 text-xs shadow-2xs">
                <div className="flex justify-between text-[#0d253d] font-bold font-mono">
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-[#533afd]" />
                    <span>Live Thermal Gauge</span>
                  </span>
                  <span className="text-[#533afd] font-extrabold">{cropInfo.t_opt_day}°C – {cropInfo.t_limit_day}°C Opt</span>
                </div>
                
                {/* Visual Gauge Bar with Dynamic Pointer */}
                <div className="relative pt-4 pb-1">
                  {/* Gauge Needle */}
                  <div 
                    className="absolute -top-1 transition-all duration-700 ease-out flex flex-col items-center -translate-x-1/2 z-10"
                    style={{
                      left: `${Math.min(94, Math.max(6, ((weather.temperature - 15) / (45 - 15)) * 100))}%`
                    }}
                  >
                    <span className="px-1.5 py-0.5 rounded-md bg-[#0d253d] text-white text-[9px] font-mono font-bold shadow-xs whitespace-nowrap">
                      {weather.temperature}°C
                    </span>
                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-[#0d253d]" />
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex shadow-inner">
                    <div className="bg-gradient-to-r from-blue-400 to-emerald-500 h-full" style={{ width: "55%" }} title="Safe Range"></div>
                    <div className="bg-amber-400 h-full" style={{ width: "25%" }} title="Thermal Caution"></div>
                    <div className="bg-rose-500 h-full" style={{ width: "20%" }} title="Critical Respiration Loss"></div>
                  </div>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                    Optimal
                  </span>
                  <span className="text-amber-700 font-bold">Caution (32°C+)</span>
                  <span className="text-rose-700 font-bold">Critical Stress (38°C+)</span>
                </div>
              </div>

              {/* Heat Stress Alert if active */}
              {weather.isNightHeatStress && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-900 text-xs font-mono space-y-1.5 animate-pulse">
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

            {/* Live APMC Mandi Benchmark Card */}
            <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 space-y-3.5 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-[#0d253d] font-display flex items-center gap-2">
                  <span className="text-base">🏛️</span>
                  <span>APMC Mandi Benchmark</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  AGMARKNET
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center bg-[#f6f9fc] p-3 rounded-xl border border-[#e3e8ee]">
                  <span className="text-slate-500 font-sans font-medium">Market Yard:</span>
                  <span className="font-bold text-[#0d253d]">{weather.district || "Bhopal"} APMC</span>
                </div>
                <div className="flex justify-between items-center bg-[#f6f9fc] p-3 rounded-xl border border-[#e3e8ee]">
                  <span className="text-slate-500 font-sans font-medium">Modal Price:</span>
                  <span className="font-black text-[#533afd] text-sm">
                    ₹{(findCropMandiRate(activeCropId, weather.district || "Bhopal", weather.state || "Madhya Pradesh")?.modalPrice || 4850).toLocaleString("en-IN")}/quintal
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[#f6f9fc] p-3 rounded-xl border border-[#e3e8ee]">
                  <span className="text-slate-500 font-sans font-medium">5-Acre Harvest Est:</span>
                  <span className="font-bold text-emerald-700">
                    ~₹{((findCropMandiRate(activeCropId, weather.district || "Bhopal", weather.state || "Madhya Pradesh")?.modalPrice || 4850) * 45).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Spray Window Safety Meter */}
              <div className={`p-3.5 rounded-2xl border text-xs font-mono space-y-1.5 ${
                weather.windSpeed < 15 && weather.temperature < 33
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                  : "bg-amber-50 border-amber-200 text-amber-950"
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  <Wind className="h-4 w-4 shrink-0" />
                  <span>
                    {weather.windSpeed < 15 && weather.temperature < 33
                      ? "Safe Spray Window Active"
                      : "Spray Drift Caution"}
                  </span>
                </div>
                <p className="text-[11px] font-sans opacity-85 leading-relaxed">
                  {weather.windSpeed < 15 && weather.temperature < 33
                    ? `Wind is ${weather.windSpeed} km/h (threshold < 15 km/h) & Temp ${weather.temperature}°C. Minimal chemical drift risk.`
                    : `Wind speed is ${weather.windSpeed} km/h or temp is high (${weather.temperature}°C). Spray in the evening after 5:00 PM.`}
                </p>
              </div>
            </div>

            {/* Architecture Card - Stripe Enterprise Dark Accent with Interactive Glow */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0d253d] via-[#141d38] to-[#1c1e54] text-white border border-[#273951] rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#533afd]/25 rounded-full blur-3xl pointer-events-none animate-float-gentle" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-indigo-900/50 pb-3">
                <div className="flex items-center gap-2.5 font-bold text-sm text-white">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#533afd] to-indigo-400 text-white flex items-center justify-center shadow-md animate-pulse-ring">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-indigo-300 font-bold uppercase tracking-wider">AASRA Core</div>
                    <span className="text-white font-extrabold text-sm">5-Stage Precision Engine</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
              </div>

              <ul className="text-xs text-slate-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="h-6 w-6 rounded-lg bg-[#533afd]/40 text-[#b9b9f9] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#533afd]/60 shadow-xs">1</span>
                  <div>
                    <strong className="text-white block">Multi-Crop Registry</strong>
                    <span className="text-slate-400 text-[11px]">50+ crops with thermal, GDD & pest phenology limits</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="h-6 w-6 rounded-lg bg-[#533afd]/40 text-[#b9b9f9] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#533afd]/60 shadow-xs">2</span>
                  <div>
                    <strong className="text-white block">Hyper-Local Grounding</strong>
                    <span className="text-slate-400 text-[11px]">Live Open-Meteo microclimate per GPS field polygon</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="h-6 w-6 rounded-lg bg-[#533afd]/40 text-[#b9b9f9] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#533afd]/60 shadow-xs">3</span>
                  <div>
                    <strong className="text-white block">APMC Mandi Intelligence</strong>
                    <span className="text-slate-400 text-[11px]">700+ verified government market yards with real modal rates</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="h-6 w-6 rounded-lg bg-[#533afd]/40 text-[#b9b9f9] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#533afd]/60 shadow-xs">4</span>
                  <div>
                    <strong className="text-white block">Agronomic Safety Guard</strong>
                    <span className="text-slate-400 text-[11px]">Real-time chemical drift & per-acre dilution calculator</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="h-6 w-6 rounded-lg bg-[#533afd]/40 text-[#b9b9f9] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#533afd]/60 shadow-xs">5</span>
                  <div>
                    <strong className="text-white block">Multilingual Chirp 3 HD</strong>
                    <span className="text-slate-400 text-[11px]">12 Indian regional languages with natural acoustic speech</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </AppShell>
  );
}
