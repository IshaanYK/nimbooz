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
  Clock,
  TrendingUp,
} from "lucide-react";
import { generateWhatsAppOrderLink, getNearbySyngentaDealers } from "@/lib/syngentaDealers";

export const KisanActionVerdict: React.FC = () => {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const { weather } = useWeather();
  const { activeFarm } = useFarm();
  const profile = getStoredProfile();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const farmerName = profile?.fullName && profile.fullName.trim() ? profile.fullName : (isHindi ? "किसान साथी" : "Farmer Friend");
  const crop = activeFarm.primaryCrop || "Soybean";
  const acreage = activeFarm.areaAcres || 5.0;
  const district = activeFarm.district || weather?.district || (isHindi ? "आपके क्षेत्र" : "Your Region");
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

  const currentSpeechText = isHindi ? verdictTextHindi : verdictTextEnglish;

  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      stopGoogleSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      playGoogleNeuralSpeech(
        currentSpeechText,
        isHindi ? "hi-IN" : "en-IN",
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
    const shareText = isHindi
      ? `🌾 *AASRA किसान सलाह पत्र — ${farmerName} (${crop})*\n` +
        `📍 स्थान: ${village ? village + ", " : ""}${district} (${acreage} एकड़)\n` +
        `🌡️ लाइव तापमान: ${weather.temperature}°C | रात का तापमान: ${weather.nightTemperature || weather.temperature}°C\n` +
        `✅ आज का फैसला: ${isOptimalSpray ? "छिडकाव का सही समय है (Optimal Spray Window)" : "आज छिडकाव न करें"}\n` +
        `🧪 खुराक: ${totalDoseLiters} लीटर Syngenta Quantis + ${totalWaterLiters} लीटर पानी\n` +
        `💰 अनुमानित शुद्ध लाभ: +₹${estimatedSavings.toLocaleString("en-IN")}\n` +
        `📞 सिंजेंटा हेल्पलाइन: 1800-102-7964\n` +
        `👉 देखें: https://frontend-phi-flame-21.vercel.app/dashboard`
      : `🌾 *AASRA Farmer Advisory Note — ${farmerName} (${crop})*\n` +
        `📍 Location: ${village ? village + ", " : ""}${district} (${acreage} Acres)\n` +
        `🌡️ Live Temp: ${weather.temperature}°C | Night Temp: ${weather.nightTemperature || weather.temperature}°C\n` +
        `✅ Today's Action: ${isOptimalSpray ? "Optimal Spray Window Active" : "Hold Spray Operations"}\n` +
        `🧪 Dosage: ${totalDoseLiters}L Syngenta Quantis + ${totalWaterLiters}L Water\n` +
        `💰 Net Protected Benefit: +₹${estimatedSavings.toLocaleString("en-IN")}\n` +
        `📞 Syngenta Helpline: 1800-102-7964\n` +
        `👉 Open: https://frontend-phi-flame-21.vercel.app/dashboard`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  return (
    <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 transition-all">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
              {isHindi ? "आज का किसान फैसला" : "Today's Farm Action Verdict"}
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
              {farmerName} · {activeFarm.name} · {acreage} Ac ({crop}) · {district}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display text-[#0d253d] tracking-tight flex items-center gap-2">
            <span>{isHindi ? sprayVerdict.actionTextHi : sprayVerdict.actionText}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-3xl">
            💡 {isHindi ? sprayVerdict.primaryReasonHi : sprayVerdict.primaryReason}
          </p>
        </div>

        {/* Action Controls: Audio Briefing & Share */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
              isPlayingAudio
                ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                : "bg-indigo-50 hover:bg-indigo-100 text-[#533afd] border border-indigo-200"
            }`}
          >
            {isPlayingAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span>{isPlayingAudio ? (isHindi ? "आवाज बंद करें" : "Stop Voice") : (isHindi ? "🔊 बोलकर सुनें" : "🔊 Listen Voice")}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Share on WhatsApp"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </div>

      {/* 4 Action Cards for the Farmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* 1. Exact Recommended Dose */}
        <div className="bg-[#f6f9fc] border border-[#e3e8ee] hover:border-slate-300 transition-all rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-indigo-700 uppercase font-bold">
              {isHindi ? "दवा और सही मात्रा" : "Chemical & Dosage"}
            </span>
            <span className="text-base">🧪</span>
          </div>
          <p className="text-sm font-bold text-[#0d253d]">Syngenta Quantis / Biostimulant</p>
          <p className="text-xs font-mono font-bold text-indigo-600">
            {totalDoseLiters} L {isHindi ? `कुल (${acreage} एकड़)` : `Total (${acreage} Acres)`}
          </p>
          <p className="text-[10px] text-slate-500">@ 250 ml/acre in {totalWaterLiters}L water</p>
        </div>

        {/* 2. Ideal Timing Window */}
        <div className="bg-[#f6f9fc] border border-[#e3e8ee] hover:border-slate-300 transition-all rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-700 uppercase font-bold">
              {isHindi ? "छिड़काव का सही समय" : "Recommended Window"}
            </span>
            <span className="text-base">⏰</span>
          </div>
          <p className="text-xs font-bold text-amber-900">
            {isHindi ? sprayVerdict.recommendedWindowHi : sprayVerdict.recommendedWindow}
          </p>
          <p className="text-[10px] text-slate-500">
            Wind: {weather.windSpeed} km/h · Rain Prob: {weather.precipitationProbability}%
          </p>
        </div>

        {/* 3. Biological Return on Investment */}
        <div className="bg-[#f6f9fc] border border-[#e3e8ee] hover:border-slate-300 transition-all rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold">
              {isHindi ? "अनुमानित शुद्ध बचत" : "Protected Net Value"}
            </span>
            <span className="text-base">💰</span>
          </div>
          <p className="text-lg font-black text-emerald-700 font-mono">
            +₹{roi.totalFieldNetProfit.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-emerald-800 font-mono font-medium">
            ROBI: {roi.robiMultiple}x · {roi.roiPercentage}% Net Return
          </p>
        </div>

        {/* 4. Nearest Syngenta Dealer */}
        <div className="bg-[#f6f9fc] border border-[#e3e8ee] hover:border-slate-300 transition-all rounded-2xl p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-sky-700 uppercase font-bold">
                {isHindi ? "निकटतम विक्रेता" : "Nearest Dealer"}
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">{primaryDealer?.distanceKm} km</span>
            </div>
            <p className="text-xs font-bold text-[#0d253d] truncate">{primaryDealer?.name}</p>
            <p className="text-[10px] text-slate-500">{primaryDealer?.phone}</p>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <a
              href={`tel:${primaryDealer?.phone}`}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px] text-center flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
            >
              <Phone className="h-3 w-3 text-slate-600" />
              <span>{isHindi ? "कॉल करें" : "Call"}</span>
            </a>
            {primaryDealer && (
              <a
                href={generateWhatsAppOrderLink(primaryDealer, farmerName, crop, acreage, "Syngenta Quantis")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-[10px] text-center flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
              >
                <MessageSquare className="h-3 w-3" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
