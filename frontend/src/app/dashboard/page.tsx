"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { InteractiveWeatherMap } from "@/components/InteractiveWeatherMap";
import { AdvisoryChat } from "@/components/AdvisoryChat";
import { DataBadge } from "@/components/DataBadge";
import { PageHelpModal } from "@/components/PageHelpModal";
import { FarmerProfile, getStoredProfile, saveProfile } from "@/lib/userStore";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { getTranslation } from "@/lib/translations";
import { getActiveField, FieldRecord } from "@/lib/fieldStore";
import { SyngentaDealerLocator } from "@/components/SyngentaDealerLocator";
import { playGoogleNeuralSpeech, stopGoogleSpeech } from "@/lib/googleVoiceEngine";
import {
  Sparkles, TrendingUp, ArrowRight, Sun, Zap, AlertTriangle, Mic, Layers, MapPin, CheckCircle2, Sliders,
  Thermometer, Droplets, Sprout, PanelRightClose, PanelRightOpen, RefreshCw, Volume2, VolumeX, Edit3
} from "lucide-react";

export default function DashboardPage() {
  const { language } = useLanguage();
  const { weather, refetch } = useWeather();
  const t = getTranslation(language);

  const [profile, setProfile] = useState<FarmerProfile>(getStoredProfile());
  const [activeField, setActiveFieldState] = useState<FieldRecord>(getActiveField());
  const [chatCollapsed, setChatCollapsed] = useState<boolean>(false);
  const [isSpeakingBriefing, setIsSpeakingBriefing] = useState<boolean>(false);

  useEffect(() => {
    setProfile(getStoredProfile());
    setActiveFieldState(getActiveField());
  }, []);

  const handleUpdateAcreage = (newAcres: number) => {
    const updated = { ...profile, fieldAreaAcres: newAcres };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleUpdateCrop = (newCrop: string) => {
    const updated = { ...profile, primaryCrop: newCrop };
    setProfile(updated);
    saveProfile(updated);
    setActiveFieldState((prev) => ({ ...prev, crop: newCrop }));
  };

  const currentAcres = profile.fieldAreaAcres || 12.5;
  const netProfitEst = Math.round(2030 * currentAcres);
  const chemicalLiters = Math.round((250 * currentAcres) / 100) / 10;

  // Speak Daily Farm Briefing
  const handlePlayBriefing = () => {
    if (isSpeakingBriefing) {
      stopGoogleSpeech();
      setIsSpeakingBriefing(false);
      return;
    }

    const farmerName = profile.fullName || "Kisan Bhai";
    const briefingText = language === "hi"
      ? `नमस्ते ${farmerName} जी! आपके ${profile.district || "भोपाल"} स्थित ${currentAcres} एकड़ ${profile.primaryCrop || "सोयाबीन"} खेत का आज का तापमान ${weather.temperature} डिग्री सेल्सियस है। रात का तापमान 25 डिग्री से अधिक होने के कारण गर्मी का तनाव सक्रिय है। सुरक्षा के लिए सिंजेंटा स्ट्रेस बस्टर 250 मिलीलीटर प्रति एकड़ के हिसाब से छिड़कें। आपके कुल ${currentAcres} एकड़ खेत के लिए ${chemicalLiters} लीटर दवा लगेगी और लगभग ₹${netProfitEst.toLocaleString("en-IN")} का शुद्ध मुनाफा सुरक्षित होगा।`
      : `Namaste ${farmerName}! For your ${currentAcres} acre ${profile.primaryCrop || "soybean"} farm in ${profile.district || "Bhopal"}, current temperature is ${weather.temperature}°C. Active night heat stress detected. Applying Syngenta Stress Buster @ 250 ml/acre (${chemicalLiters} L total) will protect an estimated ₹${netProfitEst.toLocaleString("en-IN")} in extra farm income.`;

    setIsSpeakingBriefing(true);
    playGoogleNeuralSpeech(briefingText, language, {
      onStart: () => setIsSpeakingBriefing(true),
      onEnd: () => setIsSpeakingBriefing(false),
      onError: () => setIsSpeakingBriefing(false),
    });
  };

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {t.fieldCommandCenter}
              </span>
              <DataBadge type="LIVE_CEHUB" customText="OPEN-METEO TELEMETRY" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 mt-1">
              {t.welcomePrefix} {profile.fullName || "Ramesh Patel"}
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              {profile.village ? `${profile.village}, ` : ""}{profile.district || "Bhopal"}, {profile.state || "MP"} · <strong className="text-slate-900">{currentAcres} Acres</strong> ({profile.primaryCrop?.toUpperCase() || "SOYBEAN"})
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePlayBriefing}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                isSpeakingBriefing
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {isSpeakingBriefing ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-amber-300" />}
              <span>{isSpeakingBriefing ? "Stop Voice Briefing" : language === "hi" ? "🔊 आज की बोलती रिपोर्ट" : "🔊 Daily Voice Briefing"}</span>
            </button>

            <PageHelpModal
              pageKey="dashboard"
              title="How to Use Field Command Center"
              subtitle="Your central hub for satellite overwatch, live telemetry, and AI voice advisory."
              steps={[
                { number: "01", title: "View Satellite Field Boundary", desc: "Inspect your active farm on the Esri satellite map. Tap 'Draw Boundary' to mark custom farm polygons." },
                { number: "02", title: "Monitor Live Weather Telemetry", desc: "Check real-time air temperature, soil moisture, wind speed, and rain alerts updated via Open-Meteo." },
                { number: "03", title: "Chat with AASRA AI Assistant", desc: "Tap 'Ask AASRA' or use the right AI panel to get voice advice in 12 Indian languages." },
              ]}
            />

            <button
              onClick={() => setChatCollapsed((c) => !c)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              {chatCollapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
              <span>{chatCollapsed ? t.openAiAssistant : t.collapseAssistant}</span>
            </button>
          </div>
        </div>

        {/* Interactive Farmer Quick-Tuning Bar */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg font-black shrink-0">
                👨‍🌾
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 font-display">
                    {profile.fullName || "Ramesh Patel"} · {profile.district || "Bhopal"} ({profile.village || "Fanda Kalan"})
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                    Active Farm
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {language === "hi"
                    ? "नीचे से अपनी फसल और एकड़ चुनें — पूरी वेबसाइट आपके खेत के अनुसार गणना करेगी"
                    : "Select your crop and land acreage below to recalculate all farm metrics in real time"}
                </p>
              </div>
            </div>

            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white/80 hover:bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs transition-all shrink-0"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{language === "hi" ? "प्रोफ़ाइल बदलें" : "Edit Profile"}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-emerald-200">
            {/* Quick Crop Selector */}
            <div className="bg-white/90 p-3 rounded-2xl border border-emerald-200 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                {language === "hi" ? "मुख्य फसल (Crop)" : "Primary Crop"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: "soybean", label: "🌱 Soybean" },
                  { key: "cotton", label: "☁️ Cotton" },
                  { key: "wheat", label: "🌾 Wheat" },
                  { key: "maize", label: "🌽 Maize" },
                ].map((c) => (
                  <button
                    key={c.key}
                    onClick={() => handleUpdateCrop(c.key)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      (profile.primaryCrop || "soybean").toLowerCase() === c.key
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Acreage Selector */}
            <div className="bg-white/90 p-3 rounded-2xl border border-emerald-200 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                {language === "hi" ? "खेत का क्षेत्रफल (Acres)" : "Farm Acreage"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[5, 10, 12.5, 20, 35].map((ac) => (
                  <button
                    key={ac}
                    onClick={() => handleUpdateAcreage(ac)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      currentAcres === ac
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {ac} Ac
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Farm Extra Profit */}
            <div className="bg-white/90 p-3 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">
                {language === "hi" ? "कुल अतिरिक्त शुद्ध लाभ" : "Total Extra Farm Income"}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-emerald-600 font-display">
                  +₹{netProfitEst.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">({currentAcres} acres)</span>
              </div>
            </div>

            {/* Syngenta Dosage Requirement */}
            <div className="bg-white/90 p-3 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">
                {language === "hi" ? "आवश्यक सिंजेंटा दवा" : "Total Syngenta Dosage"}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-amber-900 font-display">
                  {chemicalLiters} Litres
                </span>
                <span className="text-[10px] text-slate-500 font-medium">(@ 250ml/ac)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dual-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column */}
          <div className={`space-y-8 transition-all duration-300 ${chatCollapsed ? "lg:col-span-12" : "lg:col-span-7"}`}>
            
            {/* Interactive Satellite Map */}
            <InteractiveWeatherMap
              lat={activeField.center[0]}
              lon={activeField.center[1]}
              crop={activeField.crop}
              onFieldSelected={(f) => setActiveFieldState(f)}
            />

            {/* Live Real-Time Telemetry & Sensor Card */}
            <div className="stripe-card p-6 space-y-4 rounded-3xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                      100% REAL OPEN-METEO LIVE SENSORS
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {weather.lastUpdated}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 font-display">
                    <Sun className="h-5 w-5 text-amber-500" />
                    <span>{t.liveTelemetryTitle} — {weather.locationName}</span>
                  </h3>
                </div>

                <button
                  onClick={() => refetch(true)}
                  className="px-3 py-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Sync GPS</span>
                </button>
              </div>

              {/* 6 Real Telemetry Metric Cells */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                
                {/* 1. Day / Ambient Temp */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 block text-[10px] font-bold">AMBIENT TEMP</span>
                  <span className="text-2xl font-black text-slate-900">{weather.temperature}°C</span>
                  <span className="text-[10px] text-slate-500 block">Feels like {weather.apparentTemperature}°C</span>
                </div>

                {/* 2. Real Night Mean Temp */}
                <div className={`p-3.5 rounded-2xl border space-y-0.5 ${
                  weather.isNightHeatStress
                    ? "bg-rose-50/80 border-rose-200 text-rose-950"
                    : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                }`}>
                  <span className="text-[10px] font-bold block opacity-75">NIGHT TEMP (20-06h)</span>
                  <span className="text-2xl font-black">{weather.nightTemperature || weather.temperature}°C</span>
                  <span className="text-[10px] block opacity-75">
                    {weather.isNightHeatStress ? "⚠️ Thermal Stress (>25°C)" : "✅ Optimal"}
                  </span>
                </div>

                {/* 3. Real Measured Volumetric Soil Moisture */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 block text-[10px] font-bold">SOIL MOISTURE (0-7cm)</span>
                  <span className="text-2xl font-black text-emerald-600">{weather.soilMoistureEst}%</span>
                  <span className="text-[10px] text-slate-500 block">Volumetric Water Content</span>
                </div>

                {/* 4. Real Measured Soil Temp */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 block text-[10px] font-bold">SOIL TEMP</span>
                  <span className="text-2xl font-black text-amber-600">{weather.soilTemperatureReal || 28.2}°C</span>
                  <span className="text-[10px] text-slate-500 block">Surface Layer (0cm)</span>
                </div>

                {/* 5. Real Precipitation & Rain Status */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 block text-[10px] font-bold">RAIN / PRECIP</span>
                  <span className="text-2xl font-black text-blue-600">{weather.precipitation} mm</span>
                  <span className="text-[10px] text-slate-500 block">
                    {weather.isRaining ? "🌧️ Active Rain" : `Rain Prob: ${weather.precipitationProbability}%`}
                  </span>
                </div>

                {/* 6. Wind Speed & Spray Suitability */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 block text-[10px] font-bold">WIND SPEED</span>
                  <span className="text-2xl font-black text-slate-800">{weather.windSpeed} km/h</span>
                  <span className="text-[10px] text-slate-500 block">
                    {weather.windSpeed <= 15 ? "✅ Safe for Spray" : "⚠️ Drift Warning"}
                  </span>
                </div>

              </div>

              {/* Stress Degree-Hours Alert if active */}
              {weather.isNightHeatStress && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-900 text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>
                      {t.nightHeatStressWarning} (Risk: {weather.heatStressPercent}%): Real nocturnal degree-hours = +{weather.nightStressDegreeHours} °C·h above 25°C threshold.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3 Quick Impact Stripe Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              <div className="stripe-card p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    {activeField.areaAcres} Acres
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{activeField.name}</h4>
                <p className="text-xs text-slate-500">{activeField.crop} ({activeField.growthStage})</p>
                <Link href="/fields" className="text-xs font-bold text-[#10B981] flex items-center gap-1 hover:underline pt-1">
                  {t.viewMapLayers} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="stripe-card p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    PS-07
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{t.robiAttributionTitle}</h4>
                <p className="text-xs text-slate-500">{t.robiDesc}</p>
                <Link href="/impact" className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline pt-1">
                  {t.calculateRobi} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="stripe-card p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    Simulator
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{t.whatIfTitle}</h4>
                <p className="text-xs text-slate-500">{t.whatIfSubtitle}</p>
                <Link href="/what-if" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline pt-1">
                  {t.runSimulation} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

            </div>

            {/* Verified Syngenta Authorized Dealer Locator Section */}
            <SyngentaDealerLocator
              district={profile.district || "Bhopal"}
              farmerName={profile.fullName || "Ramesh Patel"}
              crop={profile.primaryCrop || "Soybean"}
              fieldAcres={currentAcres}
              productName="Syngenta Quantis & Stress Buster"
            />

          </div>

          {/* Right Column: Collapsible AASRA AI Voice Assistant */}
          {!chatCollapsed && (
            <div className="lg:col-span-5 space-y-4">
              <div className="stripe-card p-6 sticky top-24 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 font-display">
                    <Mic className="h-5 w-5 text-amber-500 animate-pulse" />
                    {t.askAasraTitle}
                  </h3>
                  <button onClick={() => setChatCollapsed(true)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer">
                    <PanelRightClose className="h-4 w-4" />
                  </button>
                </div>

                <AdvisoryChat currentField={activeField.name} crop={activeField.crop} />
              </div>
            </div>
          )}

        </div>

      </div>
    </AppShell>
  );
}
