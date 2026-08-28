"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { getStoredProfile, FarmerProfile } from "@/lib/userStore";
import { playGoogleNeuralSpeech, stopGoogleSpeech } from "@/lib/googleVoiceEngine";
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
  const profile = getStoredProfile();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const farmerName = profile?.fullName || "Ramesh Patel";
  const crop = profile?.primaryCrop || "Soybean";
  const acreage = profile?.fieldAreaAcres || 12.5;
  const district = profile?.district || "Bhopal";
  const village = profile?.village || "Fanda Kalan";

  // Real calculations for the farmer
  const totalDoseLiters = Math.round((250 * acreage) / 100) / 10;
  const totalWaterLiters = Math.round(175 * acreage);
  const isOptimalSpray = !weather.isRaining && weather.windSpeed <= 15 && weather.precipitation <= 0.2;
  const estimatedSavings = Math.round(1850 * acreage);

  const nearbyDealers = getNearbySyngentaDealers(district);
  const primaryDealer = nearbyDealers[0];

  const verdictTextHindi = `नमस्ते ${farmerName} जी! आपके ${village}, ${district} के ${acreage} एकड़ ${crop} खेत के लिए आज की लाइव रिपोर्ट: ` +
    (isOptimalSpray
      ? `मौसम छिडकाव के लिए अनुकूल है। हवा की गति ${weather.windSpeed} किमी/घंटा और तापमान ${weather.temperature}°C है। रात का तापमान ${weather.nightTemperature || weather.temperature}°C होने से गर्मी तनाव बढ़ सकता है। सलाह: आज शाम 4:30 बजे के बाद ${acreage} एकड़ खेत में 3.1 लीटर सिंजेंटा क्वांटिस को ${totalWaterLiters} लीटर पानी में मिलाकर छिडकें। इससे लगभग ₹${estimatedSavings.toLocaleString("en-IN")} का शुद्ध फसल लाभ सुरक्षित होगा।`
      : `आज तेज हवा या बारिश के कारण छिडकाव न करें। मौसम साफ होने की प्रतीक्षा करें।`);

  const verdictTextEnglish = `Namaste ${farmerName}! Live report for your ${acreage} acres of ${crop} in ${village}, ${district}: ` +
    (isOptimalSpray
      ? `Optimal spray window active today. Wind speed is ${weather.windSpeed} km/h and temperature is ${weather.temperature}°C. Recommendation: Apply ${totalDoseLiters}L Syngenta Quantis in ${totalWaterLiters}L water after 4:30 PM today to safeguard ~₹${estimatedSavings.toLocaleString("en-IN")} in net farm profit.`
      : `High wind speed or rain detected. Pause spraying operations until favorable weather.`);

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
    const shareText = `🌾 *AASRA किसान सलाह पत्र — ${farmerName} (${crop})*\n` +
      `📍 स्थान: ${village}, ${district} (${acreage} एकड़)\n` +
      `🌡️ लाइव तापमान: ${weather.temperature}°C | रात का तापमान: ${weather.nightTemperature || weather.temperature}°C\n` +
      `✅ आज का फैसला: ${isOptimalSpray ? "छिडकाव का सही समय है (Optimal Spray Window)" : "आज छिडकाव न करें"}\n` +
      `🧪 खुराक: ${totalDoseLiters} लीटर Syngenta Quantis + ${totalWaterLiters} लीटर पानी\n` +
      `💰 अनुमानित शुद्ध लाभ: +₹${estimatedSavings.toLocaleString("en-IN")}\n` +
      `📞 सिंजेंटा हेल्पलाइन: 1800-102-7964\n` +
      `👉 देखें: https://frontend-phi-flame-21.vercel.app/dashboard`;
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
              {farmerName} · {acreage} Ac ({crop}) · {village}, {district}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
            <span>{isOptimalSpray ? (language === "hi" ? "🟢 आज शाम छिडकाव का उत्तम समय है" : "🟢 Optimal Spray Window Open Today") : (language === "hi" ? "🔴 आज छिडकाव रोकें" : "🔴 Hold Spray Operations Today")}</span>
          </h2>
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
            <span>{isPlayingAudio ? (language === "hi" ? "आवाज बंद करें" : "Stop Audio") : (language === "hi" ? "🔊 बोलकर सुनें" : "🔊 Listen Voice")}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            title="Share with Farmers on WhatsApp"
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
          <p className="text-base font-black text-white">Syngenta Quantis</p>
          <p className="text-xs font-mono font-bold text-emerald-300">
            {totalDoseLiters} L कुल ({acreage} एकड़)
          </p>
          <span className="text-[10px] text-slate-400 block font-sans">
            (250 ml प्रति एकड़ @ 150-200L पानी)
          </span>
        </div>

        {/* 2. Ideal Time Window */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
              {language === "hi" ? "छिडकाव का समय" : "Spray Window"}
            </span>
            <span className="text-base">🕒</span>
          </div>
          <p className="text-base font-black text-white">
            {language === "hi" ? "आज शाम 4:30 – 7:00 बजे" : "Today 4:30 – 7:00 PM"}
          </p>
          <p className="text-xs font-mono font-bold text-amber-300">
            हवा: {weather.windSpeed} km/h (शांत)
          </p>
          <span className="text-[10px] text-slate-400 block font-sans">
            {language === "hi" ? "धूप ढलने के बाद घोल तुरंत असर करता है" : "Evening application avoids leaf burn"}
          </span>
        </div>

        {/* 3. Financial Gain */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
              {language === "hi" ? "अनुमानित शुद्ध बचत" : "Net Farm Benefit"}
            </span>
            <span className="text-base">💰</span>
          </div>
          <p className="text-xl font-black text-emerald-400">
            +₹{estimatedSavings.toLocaleString("en-IN")}
          </p>
          <p className="text-xs font-mono text-slate-300">
            +₹1,850 प्रति एकड़ शुद्ध लाभ
          </p>
          <span className="text-[10px] text-slate-400 block font-sans">
            (फूल व फली झड़ने से सुरक्षा)
          </span>
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
              <span>कॉल</span>
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
          <span>🎙️ Google Chirp 3 HD Neural Voice Live Streaming... ("आज की बोलती किसान रिपोर्ट")</span>
        </div>
      )}
    </div>
  );
};
