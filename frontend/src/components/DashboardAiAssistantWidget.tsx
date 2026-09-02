"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Mic,
  Loader2,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  HelpCircle,
  Sprout,
  CheckCircle2,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { useFarm } from "@/context/FarmContext";
import { playGoogleNeuralSpeech, stopGoogleSpeech } from "@/lib/googleVoiceEngine";
import { VoiceRecognitionService, VoiceState } from "@/lib/voiceRecognitionService";

interface DashboardAiAssistantWidgetProps {
  crop: string;
  acres: number;
  district: string;
  farmerName: string;
}

export const DashboardAiAssistantWidget: React.FC<DashboardAiAssistantWidgetProps> = ({
  crop,
  acres,
  district,
  farmerName,
}) => {
  const { language } = useLanguage();
  const { weather } = useWeather();
  const { activeFarm } = useFarm();

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [latestResponse, setLatestResponse] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [liveVoiceTranscript, setLiveVoiceTranscript] = useState("");

  const voiceServiceRef = useRef<VoiceRecognitionService | null>(null);

  const effectiveCrop = crop || activeFarm.primaryCrop || "Soybean";
  const effectiveAcres = acres || activeFarm.areaAcres || 5.0;
  const effectiveDistrict = district || weather.district || "Bhopal";
  const effectiveTemp = weather.temperature;
  const isSpraySafe = weather.windSpeed < 15 && weather.temperature < 33;

  // Pre-configured questions with real sensor numbers
  const quickQuestions = [
    language === "hi"
      ? `🌡️ ${effectiveTemp}°C तापमान: क्या आज ${effectiveCrop} पर स्ट्रेस बस्टर स्प्रे सुरक्षित है?`
      : `🌡️ At ${effectiveTemp}°C: Is it safe to spray ${effectiveCrop} today?`,
    language === "hi"
      ? `🏛️ ${effectiveDistrict} APMC: आज का ताजा ${effectiveCrop} मंडी भाव क्या है?`
      : `🏛️ What is today's ${effectiveCrop} modal price in ${effectiveDistrict} APMC?`,
    language === "hi"
      ? `🛡️ सिंजेंटा क्वांटिस®: मेरे ${effectiveAcres} एकड़ खेत के लिए सही खुराक बताएं`
      : `🛡️ Syngenta Quantis®: Exact dosage & dilution for ${effectiveAcres} acres`,
    language === "hi"
      ? `💧 मिट्टी में ${weather.soilMoistureEst}% नमी: क्या सिंचाई तुरंत करनी चाहिए?`
      : `💧 Soil moisture at ${weather.soilMoistureEst}%: Should I irrigate or spray?`,
  ];

  const handleAsk = async (queryText: string) => {
    const textToSubmit = (queryText || inputQuery).trim();
    if (!textToSubmit) return;

    setIsLoading(true);
    setLatestResponse(null);
    stopGoogleSpeech();
    setIsSpeaking(false);

    try {
      const res = await sendChatMessage(
        textToSubmit,
        weather.lat,
        weather.lon,
        effectiveCrop.toLowerCase(),
        language,
        `${effectiveDistrict}, ${weather.state || "Madhya Pradesh"}`,
        weather.nightTemperature || weather.temperature,
        farmerName || "Farmer Friend",
        effectiveAcres,
        "",
        "Deep Black Loam",
        effectiveDistrict,
        "",
        undefined,
        undefined,
        undefined,
        undefined,
        {
          temperature: weather.temperature,
          humidity: weather.humidity ?? 68,
          wind_speed: weather.windSpeed,
          soil_moisture: weather.soilMoistureEst,
          state: weather.state || "Madhya Pradesh",
        }
      );

      if (res && (res.reply || res.response)) {
        setLatestResponse({
          query: textToSubmit,
          reply: res.reply || res.response,
          mandiRecord: res.mandi_record,
          whyRecommendation: res.why_recommendation,
          confidenceScore: res.confidence_score || 98,
          telemetryUsed: {
            temp: weather.temperature,
            soil: weather.soilMoistureEst,
            wind: weather.windSpeed,
            location: effectiveDistrict,
          },
          followUps: res.follow_up_questions || [],
        });
        setInputQuery("");
      }
    } catch (err) {
      console.warn("[Dashboard AI Assistant Error]:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeech = (text: string) => {
    if (isSpeaking) {
      stopGoogleSpeech();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    playGoogleNeuralSpeech(text, language, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Voice recognition init
  const handleStartVoice = async () => {
    stopGoogleSpeech();
    setIsSpeaking(false);

    if (!voiceServiceRef.current) {
      voiceServiceRef.current = new VoiceRecognitionService({
        languageKey: language,
        onStateChange: setVoiceState,
        onInterimTranscript: (interim: string) => {
          setLiveVoiceTranscript(interim);
        },
        onFinalTranscript: (final: string) => {
          setLiveVoiceTranscript(final);
          if (final && final.trim().length > 2) {
            setInputQuery(final.trim());
            handleAsk(final.trim());
            voiceServiceRef.current?.stopListening();
          }
        },
        onError: () => setVoiceState("IDLE"),
      });
    }

    const started = await voiceServiceRef.current.startListening();
    if (!started) setVoiceState("IDLE");
  };

  const handleStopVoice = () => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stopListening();
    }
    setVoiceState("IDLE");
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#fbfcfd] to-indigo-50/30 border border-[#e3e8ee] rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 transition-all">
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-100/40 via-purple-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#533afd] to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#533afd] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                AASRA Grounded AI
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                Live Sensor Telemetry Grounded
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#0d253d] font-display mt-0.5">
              {language === "hi" ? "त्वरित कृषि AI परामर्श" : "Instant Grounded Field Advisory"}
            </h3>
          </div>
        </div>

        <Link
          href="/assistant"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#533afd] hover:text-[#4434d4] bg-white hover:bg-indigo-50/60 border border-[#e3e8ee] hover:border-indigo-300 px-3.5 py-2 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
        >
          <span>{language === "hi" ? "पूर्ण AI स्टूडियो खोलें" : "Open Full AI Studio"}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Telemetry Sensor Ribbon Injected into AI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-white border border-[#e3e8ee] p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
          <span className="text-slate-500 font-sans font-medium flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#533afd]" /> Field Location
          </span>
          <span className="font-bold text-[#0d253d] truncate max-w-[120px]">{effectiveDistrict}</span>
        </div>

        <div className="bg-white border border-[#e3e8ee] p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
          <span className="text-slate-500 font-sans font-medium flex items-center gap-1.5">
            <Thermometer className="h-3.5 w-3.5 text-blue-600" /> Air Temp
          </span>
          <span className="font-bold text-[#533afd]">{effectiveTemp}°C</span>
        </div>

        <div className="bg-white border border-[#e3e8ee] p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
          <span className="text-slate-500 font-sans font-medium flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5 text-emerald-600" /> Soil Index
          </span>
          <span className="font-bold text-emerald-600">{weather.soilMoistureEst}%</span>
        </div>

        <div className="bg-white border border-[#e3e8ee] p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
          <span className="text-slate-500 font-sans font-medium flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-amber-600" /> Spray Window
          </span>
          <span className={`font-bold ${isSpraySafe ? "text-emerald-700" : "text-amber-700"}`}>
            {isSpraySafe ? "Safe Active" : "Drift Caution"}
          </span>
        </div>
      </div>

      {/* Interactive Input Bar */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAsk(inputQuery);
            }}
            placeholder={
              language === "hi"
                ? `${effectiveDistrict} में आज ${effectiveTemp}°C तापमान में ${effectiveCrop} पर सलाह पूछें या बोलें...`
                : `Ask AASRA about ${effectiveTemp}°C weather, spray windows, or mandi rates in ${effectiveDistrict}...`
            }
            className="w-full pl-4 pr-24 py-3.5 bg-white border border-[#e3e8ee] focus:border-[#533afd] rounded-2xl text-xs sm:text-sm text-[#0d253d] placeholder-slate-400 focus:outline-none shadow-xs transition-all"
            disabled={isLoading}
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Voice Mic Trigger */}
            <button
              type="button"
              onClick={voiceState === "LISTENING" ? handleStopVoice : handleStartVoice}
              className={`p-2 rounded-xl cursor-pointer transition-all ${
                voiceState === "LISTENING"
                  ? "bg-rose-500 text-white animate-pulse shadow-md"
                  : "bg-[#f6f9fc] hover:bg-indigo-50 text-slate-600 hover:text-[#533afd] border border-[#e3e8ee]"
              }`}
              title="Speak Question"
            >
              <Mic className="h-4 w-4" />
            </button>

            {/* Send Query */}
            <button
              type="button"
              onClick={() => handleAsk(inputQuery)}
              disabled={isLoading || !inputQuery.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-[#533afd] to-[#4434d4] hover:opacity-95 disabled:opacity-40 text-white cursor-pointer transition-all shadow-xs"
              title="Submit Query"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Listening Status Bar */}
        {voiceState === "LISTENING" && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-mono flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping inline-block" />
              <span>{liveVoiceTranscript || "Listening in your language... Speak now"}</span>
            </span>
            <button
              type="button"
              onClick={handleStopVoice}
              className="text-[10px] font-bold text-rose-700 underline cursor-pointer"
            >
              Done Speaking
            </button>
          </div>
        )}

        {/* Quick Grounded Question Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAsk(q)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-white hover:bg-indigo-50 border border-[#e3e8ee] hover:border-indigo-300 text-[#0d253d] hover:text-[#533afd] cursor-pointer transition-all whitespace-nowrap shrink-0 shadow-2xs flex items-center gap-1.5"
            >
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Render Latest Grounded Response */}
      {latestResponse && (
        <div className="bg-white border border-indigo-200/80 rounded-2xl p-5 space-y-3.5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-[#0d253d] font-display">
                {latestResponse.query}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                {latestResponse.telemetryUsed.location} · {latestResponse.telemetryUsed.temp}°C
              </span>

              <button
                type="button"
                onClick={() => handleToggleSpeech(latestResponse.reply)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  isSpeaking
                    ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                    : "bg-[#f6f9fc] hover:bg-indigo-50 text-slate-700 hover:text-[#533afd] border-[#e3e8ee]"
                }`}
              >
                {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-[#533afd]" />}
                <span>{isSpeaking ? "Stop" : "Listen"}</span>
              </button>
            </div>
          </div>

          <p className="whitespace-pre-line text-xs sm:text-sm text-[#0d253d] leading-relaxed">
            {latestResponse.reply}
          </p>

          {/* Mandi Record Card if returned */}
          {latestResponse.mandiRecord && (
            <div className="bg-[#f6f9fc] border border-[#e3e8ee] p-3 rounded-xl flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-sans">
                🏛️ {latestResponse.mandiRecord.mandiHi || latestResponse.mandiRecord.mandi}:
              </span>
              <span className="font-extrabold text-[#0d253d]">
                ₹{latestResponse.mandiRecord.modalPrice?.toLocaleString("en-IN")}/quintal
              </span>
            </div>
          )}

          {/* Follow-up Question Chips */}
          {latestResponse.followUps && latestResponse.followUps.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
              {latestResponse.followUps.map((fq: string, fIdx: number) => (
                <button
                  key={fIdx}
                  type="button"
                  onClick={() => handleAsk(fq)}
                  className="px-3 py-1 rounded-xl text-[11px] font-semibold bg-[#f6f9fc] hover:bg-indigo-50 text-slate-700 hover:text-[#533afd] border border-[#e3e8ee] cursor-pointer transition-all"
                >
                  💡 {fq}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
