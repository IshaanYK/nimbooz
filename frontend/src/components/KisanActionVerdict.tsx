"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { useFarm } from "@/context/FarmContext";
import { getStoredProfile } from "@/lib/userStore";
import { playGoogleNeuralSpeech, stopGoogleSpeech } from "@/lib/googleVoiceEngine";
import { evaluateSpraySuitability } from "@/lib/calculations/sprayingRisk";
import { calculateDeterministicROI } from "@/lib/calculations/roiEngine";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  Droplets,
  Wind,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Sun,
  Flame,
  ArrowRight,
  Phone,
  MessageSquare,
} from "lucide-react";
import { generateWhatsAppOrderLink, getNearbySyngentaDealers } from "@/lib/syngentaDealers";

export const KisanActionVerdict: React.FC = () => {
  const { language } = useLanguage();
  const { weather } = useWeather();
  const { activeFarm } = useFarm();
  const profile = getStoredProfile();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const farmerName = profile?.fullName && profile.fullName.trim() ? profile.fullName : (language === "hi" ? "किसान साथी" : "Farmer Friend");
  const crop = activeFarm.primaryCrop || "Soybean";
  const acreage = activeFarm.areaAcres || 5.0;
  const district = activeFarm.district || weather?.district || (language === "hi" ? "आपके क्षेत्र" : "Your Region");
  const village = activeFarm.village || "";

  // Deterministic Spray Evaluation
  const sprayVerdict = evaluateSpraySuitability({
    temp: weather.temperature,
    windSpeed: weather.windSpeed,
    rainProb: weather.precipitationProbability || 10,
    humidity: weather.humidity,
    precipitation: weather.precipitation,
    isRaining: weather.isRaining,
  });

  // Deterministic Financial Return
  const roi = calculateDeterministicROI({
    acres: acreage,
    mandiPricePerQtl: 4850,
    preservedYieldQtlPerAcre: 0.52,
    productCostPerAcre: 420,
    labourCostPerAcre: 150,
    cropName: crop,
  });

  // Input requirement
  const totalDoseLiters = Math.round((250 * acreage) / 100) / 10;
  const totalWaterLiters = Math.round(175 * acreage);

  const nearbyDealers = getNearbySyngentaDealers(district);
  const primaryDealer = nearbyDealers[0];

  const verdictTextHindi = `नमस्ते ${farmerName} जी! आपके ${activeFarm.name} (${district}) के ${acreage} एकड़ ${crop} खेत के लिए आज का फैसला: ` +
    (sprayVerdict.isSuitable
      ? `${sprayVerdict.actionTextHi}। ${sprayVerdict.primaryReasonHi} सर्वोत्तम समय: ${sprayVerdict.recommendedWindowHi}। कुल ${totalDoseLiters} लीटर दवा ${totalWaterLiters} लीटर पानी में मिलाकर प्रयोग करें। इससे लगभग ₹${roi.totalFieldNetProfit.toLocaleString("en-IN")} का शुद्ध फसल लाभ सुरक्षित होगा।`
      : `${sprayVerdict.actionTextHi}। ${sprayVerdict.primaryReasonHi} सिफारिश: ${sprayVerdict.recommendedWindowHi} मौसम की जांच करें।`);

  const verdictTextEnglish = `Namaste ${farmerName}! For your ${activeFarm.name} (${acreage} acres of ${crop} in ${district}): ` +
    (sprayVerdict.isSuitable
      ? `${sprayVerdict.actionText}. ${sprayVerdict.primaryReason} Recommended window: ${sprayVerdict.recommendedWindow}. Apply ${totalDoseLiters}L in ${totalWaterLiters}L water to safeguard ~₹${roi.totalFieldNetProfit.toLocaleString("en-IN")} in net farm profit.`
      : `${sprayVerdict.actionText}. ${sprayVerdict.primaryReason} Recheck conditions at ${sprayVerdict.recommendedWindow}.`);

  const currentSpeechText = language === "hi" ? verdictTextHindi : verdictTextEnglish;

  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      stopGoogleSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      playGoogleNeuralSpeech(
        currentSpeechText,
        language === "hi" ? "hi-IN" : "en-IN",
        {
          onEnd: () => setIsPlayingAudio(false),
          onError: () => setIsPlayingAudio(false),
        }
      );
    }
  };

  const handleShareWhatsApp = () => {
    const isOptimalSpray = sprayVerdict.isSuitable;
    const estimatedSavings = roi.totalFieldNetProfit;
    const shareText = language === "hi"
      ? `🌾 *AASRA किसान सलाह पत्र — ${farmerName} (${crop})*\n` +
        `📍 स्थान: ${village}, ${district} (${acreage} एकड़)\n` +
        `🌡️ लाइव तापमान: ${weather.temperature}°C | रात का तापमान: ${weather.nightTemperature || weather.temperature}°C\n` +
        `✅ आज का फैसला: ${isOptimalSpray ? "छिडकाव का सही समय है (Optimal Spray Window)" : "आज छिडकाव न करें"}\n` +
        `🧪 खुराक: ${totalDoseLiters} लीटर Syngenta Quantis + ${totalWaterLiters} लीटर पानी\n` +
        `💰 अनुमानित शुद्ध लाभ: +₹${estimatedSavings.toLocaleString("en-IN")}\n` +
        `📞 सिंजेंटा हेल्पलाइन: 1800-102-7964\n` +
        `👉 देखें: https://frontend-phi-flame-21.vercel.app/dashboard`
      : `🌾 *AASRA Farmer Advisory Note — ${farmerName} (${crop})*\n` +
        `📍 Location: ${village}, ${district} (${acreage} Acres)\n` +
        `🌡️ Live Temp: ${weather.temperature}°C | Night Temp: ${weather.nightTemperature || weather.temperature}°C\n` +
        `✅ Today's Action: ${isOptimalSpray ? "Optimal Spray Window Active" : "Hold Spray Operations"}\n` +
        `🧪 Dosage: ${totalDoseLiters}L Syngenta Quantis + ${totalWaterLiters}L Water\n` +
        `💰 Net Protected Benefit: +₹${estimatedSavings.toLocaleString("en-IN")}\n` +
        `📞 Syngenta Helpline: 1800-102-7964\n` +
        `👉 Open: https://frontend-phi-flame-21.vercel.app/dashboard`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-500/40 shadow-xl space-y-5 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 fill-slate-950" />
              {language === "hi" ? "आज का किसान फैसला" : "Today's Farm Action Verdict"}
            </span>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              {farmerName} · {activeFarm.name} · {acreage} Ac ({crop}) · {district}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
            <span>{language === "hi" ? sprayVerdict.actionTextHi : sprayVerdict.actionText}</span>
          </h2>
          <p className="text-xs text-emerald-200 font-medium max-w-3xl">
            💡 {language === "hi" ? sprayVerdict.primaryReasonHi : sprayVerdict.primaryReason}
          </p>
        </div>

        {/* Action Controls: Audio Briefing & Share */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleVoice}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isPlayingAudio
                ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                : "bg-amber-400 hover:bg-amber-300 text-slate-950"
            }`}
          >
            {isPlayingAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span>{isPlayingAudio ? (language === "hi" ? "आवाज बंद करें" : "Stop Voice") : (language === "hi" ? "🔊 बोलकर सुनें" : "🔊 Listen Voice")}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            title="Share on WhatsApp"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </div>

      {/* 4 Action Cards for the Farmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
        
        {/* 1. Exact Recommended Dose */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
              {language === "hi" ? "दवा और सही मात्रा" : "Chemical & Dosage"}
            </span>
            <span className="text-base">🧪</span>
          </div>
          <p className="text-base font-black text-white">Syngenta Quantis / Biostimulant</p>
          <p className="text-xs font-mono font-bold text-emerald-300">
            {totalDoseLiters} L {language === "hi" ? `कुल (${acreage} एकड़)` : `Total (${acreage} Acres)`}
          </p>
          <p className="text-[10px] text-slate-400">@ 250 ml/acre in {totalWaterLiters}L water</p>
        </div>

        {/* 2. Ideal Timing Window */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
              {language === "hi" ? "छिड़काव का सही समय" : "Recommended Window"}
            </span>
            <span className="text-base">⏰</span>
          </div>
          <p className="text-sm font-black text-amber-300">
            {language === "hi" ? sprayVerdict.recommendedWindowHi : sprayVerdict.recommendedWindow}
          </p>
          <p className="text-[10px] text-slate-400">
            Wind: {weather.windSpeed} km/h · Rain Prob: {weather.precipitationProbability}%
          </p>
        </div>

        {/* 3. Biological Return on Investment */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
              {language === "hi" ? "अनुमानित शुद्ध बचत" : "Protected Net Value"}
            </span>
            <span className="text-base">💰</span>
          </div>
          <p className="text-xl font-black text-emerald-400 font-mono">
            +₹{roi.totalFieldNetProfit.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-emerald-300/80 font-mono">
            ROBI: {roi.robiMultiple}x · {roi.roiPercentage}% Net Return
          </p>
        </div>
        {/* 4. Nearest Syngenta Dealer */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-sky-400 uppercase font-bold">
                {language === "hi" ? "निकटतम विक्रेता" : "Nearest Dealer"}
              </span>
              <span className="text-xs font-mono text-emerald-300 font-bold">{primaryDealer?.distanceKm} km</span>
            </div>
            <p className="text-xs font-black text-white truncate">{primaryDealer?.name}</p>
            <p className="text-[10px] text-slate-400">{primaryDealer?.phone}</p>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <a
              href={`tel:${primaryDealer?.phone}`}
              className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] text-center flex items-center justify-center gap-1 cursor-pointer"
            >
              <Phone className="h-3 w-3" />
              <span>{language === "hi" ? "कॉल" : "Call"}</span>
            </a>
            {primaryDealer && (
              <a
                href={generateWhatsAppOrderLink(primaryDealer, farmerName, crop, acreage, "Syngenta Quantis")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-[10px] text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                <MessageSquare className="h-3 w-3" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

      </div>

      {/* Voice Waveform Note */}
      {isPlayingAudio && (
        <div className="bg-amber-400/20 border border-amber-400/40 rounded-2xl p-3 flex items-center gap-3 text-xs text-amber-200 font-mono animate-pulse relative z-10">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span>🎙️ Google Chirp 3 HD Neural Voice Live Streaming... ({language === "hi" ? "आज की बोलती किसान रिपोर्ट" : "Daily Spoken Agronomic Briefing"})</span>
        </div>
      )}
    </div>
  );
};
