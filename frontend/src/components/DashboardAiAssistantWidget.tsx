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
import { FormattedAgriResponse } from "./FormattedAgriResponse";

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

  // Re-sync voice service when language changes
  React.useEffect(() => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stopListening();
      voiceServiceRef.current = null;
    }
  }, [language]);

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
        farmerName || "Ishaan Sen",
        effectiveAcres,
        activeFarm.cropVariety || "JS 20-34 Certified",
        activeFarm.soilType || "Deep Black Loam",
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
          field_id: activeFarm.id || "field_1",
          field_name: activeFarm.name || "Main Acreage",
          farmer_id: "farmer_1",
        }
      );

      if (res && (res.reply || res.response)) {
        setLatestResponse({
          query: textToSubmit,
          reply: res.reply || res.response,
          mandiRecord: res.mandi_record,
          whyRecommendation: res.why_recommendation,
          confidenceScore: res.confidence_score || 98,
          matchedField: res.matched_field,
          allRegisteredFields: res.all_registered_fields,
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
    setInputQuery("");
    setLiveVoiceTranscript("");

    if (!voiceServiceRef.current) {
      voiceServiceRef.current = new VoiceRecognitionService({
        languageKey: language,
        onStateChange: setVoiceState,
        onInterimTranscript: (interim: string) => {
          setLiveVoiceTranscript(interim);
          setInputQuery(interim);
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
              voiceState === "LISTENING"
                ? language === "hi"
                  ? "🎙️ बोलना शुरू करें... शब्द यहाँ लाइव टाइप होंगे"
                  : "🎙️ Speak now... words appear here live"
                : language === "hi"
                ? `${effectiveDistrict} में आज ${effectiveTemp}°C तापमान में ${effectiveCrop} पर सलाह पूछें या बोलें...`
                : `Ask AASRA about ${effectiveTemp}°C weather, spray windows, or mandi rates in ${effectiveDistrict}...`
            }
            className={`w-full pl-4 pr-24 py-3.5 rounded-2xl text-xs sm:text-sm text-[#0d253d] font-medium transition-all ${
              voiceState === "LISTENING"
                ? "bg-rose-50/40 border-2 border-rose-400 ring-4 ring-rose-500/15 focus:outline-none placeholder-rose-400 shadow-inner"
                : "bg-white border border-[#e3e8ee] focus:border-[#533afd] placeholder-slate-400 focus:outline-none shadow-xs"
            }`}
            disabled={isLoading}
          />
          {/* Blinking Live Speech Cursor */}
          {voiceState === "LISTENING" && inputQuery.length > 0 && (
            <span className="absolute right-28 inline-block w-1.5 h-4 bg-rose-600 rounded-full animate-pulse pointer-events-none" />
          )}

          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Voice Mic Trigger */}
            <button
              type="button"
              onClick={voiceState === "LISTENING" ? handleStopVoice : handleStartVoice}
              className={`p-2 rounded-xl cursor-pointer transition-all ${
                voiceState === "LISTENING"
                  ? "bg-rose-500 text-white animate-pulse shadow-md hover:scale-105"
                  : "bg-[#f6f9fc] hover:bg-indigo-50 text-slate-600 hover:text-[#533afd] border border-[#e3e8ee]"
              }`}
              title={voiceState === "LISTENING" ? "Stop & Submit" : "Speak Question"}
            >
              <Mic className="h-4 w-4" />
            </button>

            {/* Send Query */}
            <button
              type="button"
              onClick={() => handleAsk(inputQuery)}
              disabled={isLoading || !inputQuery.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-[#533afd] to-[#4434d4] hover:opacity-95 disabled:opacity-40 text-white cursor-pointer transition-all shadow-xs disabled:cursor-not-allowed"
              title="Submit Query"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Listening Status Bar */}
        {voiceState === "LISTENING" && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-mono flex items-center justify-between animate-in fade-in duration-150">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping inline-block" />
              <span className="font-bold text-rose-950">
                {language === "hi" ? "🔴 लाइव रिकॉर्डिंग चालू है..." : "🔴 Live Voice Recording..."}
              </span>
              <span className="text-[11px] text-rose-700 opacity-90 truncate max-w-[280px]">
                {inputQuery || (language === "hi" ? "बोलना शुरू करें..." : "Speak now...")}
              </span>
            </span>
            <button
              type="button"
              onClick={handleStopVoice}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-white px-2 py-0.5 rounded-lg border border-rose-200 cursor-pointer shadow-2xs"
            >
              Done (पूरा हुआ)
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

      {/* Render Latest Grounded Response with FormattedAgriResponse */}
      {latestResponse && (
        <div className="bg-white border border-indigo-200/80 rounded-2xl p-5 space-y-3.5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-[#0d253d] font-display">
                {latestResponse.query}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 flex-wrap">
              {latestResponse.matchedField && (
                <span className="text-[10px] font-mono font-bold text-[#533afd] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                  <Sprout className="h-3 w-3 text-[#533afd]" />
                  {latestResponse.matchedField.name} ({latestResponse.matchedField.area_acres} ac {latestResponse.matchedField.crop})
                </span>
              )}
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                {latestResponse.telemetryUsed.location} · {latestResponse.telemetryUsed.temp}°C
              </span>
            </div>
          </div>

          <FormattedAgriResponse
            id="dashboard-ai-latest"
            text={latestResponse.reply}
            language={language}
            isSpeaking={isSpeaking}
            onToggleSpeech={() => handleToggleSpeech(latestResponse.reply)}
            telemetryUsed={latestResponse.telemetryUsed}
            mandiRecord={latestResponse.mandiRecord}
            confidenceScore={latestResponse.confidenceScore}
            whyRecommendation={latestResponse.whyRecommendation}
            cropName={crop}
            acres={acres}
          />

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
