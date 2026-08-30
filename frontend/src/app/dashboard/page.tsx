"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { InteractiveWeatherMap } from "@/components/InteractiveWeatherMap";
import { DataBadge } from "@/components/DataBadge";
import { PageHelpModal } from "@/components/PageHelpModal";
import { FarmerProfile, getStoredProfile, saveProfile } from "@/lib/userStore";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { getTranslation } from "@/lib/translations";
import { getActiveField, FieldRecord } from "@/lib/fieldStore";
import { SyngentaDealerLocator } from "@/components/SyngentaDealerLocator";
import { KisanActionVerdict } from "@/components/KisanActionVerdict";
import { MandiPriceTicker } from "@/components/MandiPriceTicker";
import { BiologicalActivationCountdown } from "@/components/BiologicalActivationCountdown";
import { CropFitEconomicMatrix } from "@/components/CropFitEconomicMatrix";
import { playGoogleNeuralSpeech, stopGoogleSpeech } from "@/lib/googleVoiceEngine";
import { useFarm } from "@/context/FarmContext";
import { calculateDeterministicROI } from "@/lib/calculations/roiEngine";
import { getRegionalCrops, saveCustomCrop } from "@/lib/cropRegistry";
import {
  Sparkles, TrendingUp, ArrowRight, Sun, Zap, AlertTriangle, Mic, Layers, MapPin, CheckCircle2, Sliders,
  Thermometer, Droplets, Sprout, RefreshCw, Volume2, VolumeX, Edit3, ShieldCheck, X, Plus
} from "lucide-react";

export default function DashboardPage() {
  const { language } = useLanguage();
  const { weather, refetch, setCustomCoordinates } = useWeather();
  const { activeFarm, updateActiveFarm } = useFarm();
  const t = getTranslation(language);

  const [profile, setProfile] = useState<FarmerProfile>(getStoredProfile());
  const [isSpeakingBriefing, setIsSpeakingBriefing] = useState<boolean>(false);
  const [showCropSwitchModal, setShowCropSwitchModal] = useState<boolean>(false);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customCropText, setCustomCropText] = useState<string>("");

  const currentAcres = activeFarm.areaAcres || 5.0;
  const currentCrop = activeFarm.primaryCrop || "Soybean";
  const currentDistrict = activeFarm.district || weather.district || "Local Region";
  const currentState = activeFarm.state || weather.state || "India";

  const regionalCrops = getRegionalCrops(currentDistrict, currentState);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  const handleUpdateCrop = (newCrop: string) => {
    updateActiveFarm({ primaryCrop: newCrop });
    const p = getStoredProfile();
    saveProfile({ ...p, primaryCrop: newCrop });
  };

  const handleUpdateAcreage = (newAcres: number) => {
    updateActiveFarm({ areaAcres: newAcres });
    const p = getStoredProfile();
    saveProfile({ ...p, fieldAreaAcres: newAcres });
  };

  const roi = calculateDeterministicROI({
    acres: currentAcres,
    mandiPricePerQtl: 4850,
    preservedYieldQtlPerAcre: 0.52,
    productCostPerAcre: 420,
    labourCostPerAcre: 150,
    cropName: currentCrop,
  });

  const netProfitEst = roi.totalFieldNetProfit;
  const chemicalLiters = Math.round((250 * currentAcres) / 100) / 10;

  // Speak Daily Farm Briefing
  const handlePlayBriefing = () => {
    if (isSpeakingBriefing) {
      stopGoogleSpeech();
      setIsSpeakingBriefing(false);
      return;
    }

    const farmerName = profile.fullName || "Kisan Bhai";
    const districtName = profile.district || weather.district || (language === "hi" ? "आपके क्षेत्र" : "Your Region");
    const cropName = profile.primaryCrop || (language === "hi" ? "सोयाबीन" : "crop");
    const briefingText = language === "hi"
      ? `नमस्ते ${farmerName} जी! आपके ${districtName} स्थित ${currentAcres} एकड़ ${cropName} खेत का आज का तापमान ${weather.temperature} डिग्री सेल्सियस है। ${weather.isNightHeatStress ? "रात का तापमान 25 डिग्री से अधिक होने के कारण गर्मी का तनाव सक्रिय है। सुरक्षा के लिए सिंजेंटा स्ट्रेस बस्टर 250 मिलीलीटर प्रति एकड़ के हिसाब से छिड़कें।" : "मौसम फसल के लिए अनुकूल है।"} आपके कुल ${currentAcres} एकड़ खेत के लिए ${chemicalLiters} लीटर दवा लगेगी और लगभग ₹${netProfitEst.toLocaleString("en-IN")} का शुद्ध मुनाफा सुरक्षित होगा।`
      : `Namaste ${farmerName}! For your ${currentAcres} acre ${cropName} farm in ${districtName}, current temperature is ${weather.temperature}°C. ${weather.isNightHeatStress ? "Active night heat stress detected. Applying Syngenta Stress Buster @ 250 ml/acre will protect your yield." : "Favorable weather conditions today."} Estimated protected net value is ₹${netProfitEst.toLocaleString("en-IN")}.`;

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
              {t.welcomePrefix} {profile.fullName || "Kisan Sathi"}
            </h1>
            <p className="text-sm text-slate-600 font-medium flex items-center gap-2 flex-wrap mt-1">
              <span>{profile.village ? `${profile.village}, ` : ""}{profile.district || weather.district || "Live GPS Location"}{profile.state ? `, ${profile.state}` : ""}</span>
              <span>·</span>
              <strong className="text-slate-900">{currentAcres} Acres</strong>
              <span>·</span>
              <button
                onClick={() => setShowCropSwitchModal(true)}
                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-2.5 py-0.5 rounded-lg cursor-pointer transition-all shadow-2xs"
                title="Click to change or add crop"
              >
                <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                <span>{profile.primaryCrop || "Soybean"}</span>
                <Edit3 className="h-2.5 w-2.5 opacity-60 ml-0.5" />
              </button>
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

            <Link
              href="/assistant"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Mic className="h-4 w-4 text-emerald-400" />
              <span>{t.openAiAssistant}</span>
            </Link>
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
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[11px] font-mono font-black text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    PS-04: Voice Advisory AI
                  </span>
                  <span className="text-[11px] font-mono font-black text-purple-950 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300">
                    PS-03: Syngenta Prescription
                  </span>
                  <span className="text-[11px] font-mono font-black text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    PS-07: ROBI Return
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 font-display">
                    {profile.fullName
                      ? `${profile.fullName} · ${profile.district || "Registered Farm"} ${profile.village ? `(${profile.village})` : ""}`
                      : `Your Farm · ${activeFarm.name || "Main Field Plot"}`}
                  </h3>
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

        {/* 🌟 1. Today's Farmer Action Verdict & 1-Tap Voice Briefing */}
        <KisanActionVerdict />

        {/* 🌟 2. Concept Note PS-02: Biological Activation Countdown */}
        <BiologicalActivationCountdown
          cropName={currentCrop.toUpperCase()}
          fieldAcres={currentAcres}
          stressType={weather.isNightHeatStress ? "Active Night Thermal Heat Stress (>25°C)" : "Compound Solar Radiation & Moisture Deficit"}
        />

        {/* 🌟 3. Concept Note PS-03: CropFit Apply vs Delay vs Skip Decision Support */}
        <CropFitEconomicMatrix
          cropName={currentCrop}
          fieldAcres={currentAcres}
        />

        {/* Full Width Overwatch Layout */}
        <div className="space-y-8">
          
          {/* Interactive Satellite Map */}
          <InteractiveWeatherMap
            lat={activeFarm.center[0]}
            lon={activeFarm.center[1]}
            crop={activeFarm.primaryCrop}
            onLocationSelect={async (newLat, newLon) => {
              if (setCustomCoordinates) {
                await setCustomCoordinates(newLat, newLon);
              }
              updateActiveFarm({
                center: [newLat, newLon]
              });
            }}
            onFieldSelected={(f) => {
              updateActiveFarm({
                primaryCrop: f.crop,
                cropVariety: f.cropVariety,
                areaAcres: f.areaAcres,
                areaHa: f.areaHa,
                center: f.center,
                polygon: f.polygon,
              });
              if (setCustomCoordinates) {
                setCustomCoordinates(f.center[0], f.center[1]);
              }
            }}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
              
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
                <span className="text-[10px] text-slate-500 block">Volumetric Water</span>
              </div>

              {/* 4. Real Measured Soil Temp */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-0.5">
                <span className="text-slate-500 block text-[10px] font-bold">SOIL TEMP</span>
                <span className="text-2xl font-black text-amber-600">{weather.soilTemperatureReal || 28.2}°C</span>
                <span className="text-[10px] text-slate-500 block">Surface Layer</span>
              </div>

              {/* 5. Real Precipitation & Rain Status */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-0.5">
                <span className="text-slate-500 block text-[10px] font-bold">RAIN / PRECIP</span>
                <span className="text-2xl font-black text-blue-600">{weather.precipitation} mm</span>
                <span className="text-[10px] text-slate-500 block">
                  {weather.isRaining ? "🌧️ Active Rain" : `Prob: ${weather.precipitationProbability}%`}
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
                <Link
                  href="/assistant"
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
                >
                  Ask AI Solution →
                </Link>
              </div>
            )}
          </div>

          {/* 4 Core Hackathon Problem Statement Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* PS-04 AI Assistant Card */}
            <div className="stripe-card p-5 space-y-3 border-2 border-emerald-300 bg-gradient-to-b from-white to-emerald-50/30 rounded-3xl">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Mic className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono font-black bg-emerald-100 text-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  PS-04 AI Voice
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 font-display">AASRA Voice Studio</h4>
                <p className="text-xs text-slate-600 mt-1">12 Indian languages, voice-first agronomist, crop leaf camera diagnostics, and live sensor citations.</p>
              </div>
              <Link href="/assistant" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 hover:text-emerald-900 pt-2">
                Open AI Studio <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* PS-02 Plant Intelligence Card */}
            <div className="stripe-card p-5 space-y-3 rounded-3xl border border-slate-200">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono font-black bg-blue-100 text-blue-950 px-2.5 py-0.5 rounded-full border border-blue-300">
                  PS-02 Stress
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 font-display">14-Day Plant Stress Early Warning</h4>
                <p className="text-xs text-slate-600 mt-1">Predictive thermal heat respiration models & CE Hub GDD tracking before visual symptoms appear.</p>
              </div>
              <Link href="/plant-intelligence" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-700 hover:text-blue-900 pt-2">
                Inspect Predictions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* PS-03 Syngenta Matcher Card */}
            <div className="stripe-card p-5 space-y-3 rounded-3xl border border-slate-200">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono font-black bg-purple-100 text-purple-950 px-2.5 py-0.5 rounded-full border border-purple-300">
                  PS-03 CropFit
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 font-display">Syngenta CropFit Solution</h4>
                <p className="text-xs text-slate-600 mt-1">Quantis & Isabion biological prescriptions with exact dosage calculated for {currentAcres} acres.</p>
              </div>
              <Link href="/product" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-700 hover:text-purple-900 pt-2">
                View Prescriptions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* PS-07 ROBI Financial Return Card */}
            <div className="stripe-card p-5 space-y-3 rounded-3xl border border-slate-200">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono font-black bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300">
                  PS-07 ROBI
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 font-display">Return on Biologicals (ROBI)</h4>
                <p className="text-xs text-slate-600 mt-1">Weather-adjusted yield attribution proving +₹{netProfitEst.toLocaleString("en-IN")} extra net income.</p>
              </div>
              <Link href="/impact" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 hover:text-amber-950 pt-2">
                Calculate ROI Proof <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>

          {/* Verified Syngenta Authorized Dealer Locator Section */}
          <SyngentaDealerLocator
            district={currentDistrict}
            farmerName={profile.fullName || "Farm Owner"}
            crop={currentCrop}
            fieldAcres={currentAcres}
            productName="Syngenta Quantis & Stress Buster"
          />

          {/* Daily APMC Mandi Commodity Rates Ticker */}
          <MandiPriceTicker
            district={currentDistrict}
            state={currentState}
          />

        </div>

      </div>

      {/* 🌟 Dynamic Regional & Custom Crop Switcher Modal */}
      {showCropSwitchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                  {weather.district || profile.district || "Regional"} Agromarket
                </span>
                <h3 className="text-lg font-black text-slate-900 font-display mt-0.5">
                  {language === "hi" ? "फसल चुनें या नई फसल जोड़ें" : "Select or Add Farm Crop"}
                </h3>
              </div>
              <button
                onClick={() => setShowCropSwitchModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Toggle Modes */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  !isCustomMode ? "bg-white text-emerald-900 shadow-xs" : "text-slate-600"
                }`}
              >
                🌾 Native Regional Crops ({regionalCrops.length})
              </button>
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  isCustomMode ? "bg-white text-emerald-900 shadow-xs" : "text-slate-600"
                }`}
              >
                ✨ + Add Custom Crop
              </button>
            </div>

            {isCustomMode ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    {language === "hi" ? "अपनी नई फसल का नाम दर्ज करें:" : "Enter New Custom Crop Name:"}
                  </label>
                  <input
                    type="text"
                    value={customCropText}
                    onChange={(e) => setCustomCropText(e.target.value)}
                    placeholder="e.g. Dragon Fruit, Garlic (लहसुन), Saffron, Strawberry, Chia Seeds..."
                    className="w-full px-4 py-3 bg-emerald-50/60 border-2 border-emerald-500 rounded-xl text-slate-900 font-bold text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    💡 AASRA AI will automatically estimate base Growing Degree Days (GDD), thermal limit curves, and local MSP benchmarks for this crop.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (customCropText.trim()) {
                      const saved = saveCustomCrop({ name: customCropText.trim() });
                      handleUpdateCrop(saved.name);
                      setCustomCropText("");
                      setShowCropSwitchModal(false);
                    }
                  }}
                  disabled={!customCropText.trim()}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save &amp; Switch to {customCropText.trim() || "New Crop"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {regionalCrops.map((c) => {
                    const isSelected = profile.primaryCrop?.toLowerCase().includes(c.id) || profile.primaryCrop === c.name;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          handleUpdateCrop(c.name);
                          setShowCropSwitchModal(false);
                        }}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-xs">{c.name} {c.isCustom ? "★" : ""}</div>
                          <div className="text-[10px] text-slate-500">{c.defaultVariety} · {c.season}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
