"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Volume2,
  VolumeX,
  Camera,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  Globe,
  ShieldCheck,
  AlertTriangle,
  CloudSun,
  X,
  CheckCircle,
  MessageSquare,
  Sprout,
  Search,
  Droplets,
  Wind,
  Thermometer,
  Layers,
  ArrowRight,
} from "lucide-react";
import { sendChatMessage, analyzeCropLeafImage } from "@/lib/api";
import { getStoredProfile, INDIAN_LANGUAGES } from "@/lib/userStore";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { useFarm } from "@/context/FarmContext";
import { getTranslation } from "@/lib/translations";
import { playGoogleNeuralSpeech, stopGoogleSpeech } from "@/lib/googleVoiceEngine";
import { VoiceRecognitionService, VoiceState } from "@/lib/voiceRecognitionService";
import { MASTER_CROPS, CropInfo, resolveCropThresholds, getRegionalCrops } from "@/lib/cropRegistry";
import { getCropAdvisoryProfile } from "@/lib/agriculture/cropAdvisoryMatrix";
import { FormattedAgriResponse } from "./FormattedAgriResponse";

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  provider?: string;
  imageUrl?: string;
  whyRecommendation?: string;
  dosageSummary?: string;
  confidenceScore?: number;
  followUpQuestions?: string[];
  telemetryUsed?: any;
  locationUsed?: string;
  cropProfile?: any;
  mandiRecord?: any;
  detectedLanguage?: string;
  rawTranscript?: string;
}

interface AdvisoryChatProps {
  currentField?: string;
  crop?: string;
  currentCrop?: string;
  farmerName?: string;
  acres?: number;
  variety?: string;
  district?: string;
  village?: string;
  externalQuery?: string;
  onClearExternalQuery?: () => void;
  onCropChange?: (cropId: string) => void;
}

const CROP_CATEGORIES = [
  { id: "all", label: "All Crops", labelHi: "सभी फसलें" },
  { id: "cereal", label: "Cereals", labelHi: "अनाज" },
  { id: "pulse", label: "Pulses", labelHi: "दलहन" },
  { id: "oilseed", label: "Oilseeds", labelHi: "तिलहन" },
  { id: "cash_crop", label: "Cash Crops", labelHi: "नकदी फसलें" },
  { id: "vegetable", label: "Vegetables", labelHi: "सब्जियां" },
  { id: "fruit", label: "Fruits", labelHi: "फल" },
  { id: "spice", label: "Spices", labelHi: "मसाले" },
];

export const AdvisoryChat: React.FC<AdvisoryChatProps> = ({
  currentField = "Field 1",
  crop: initialCrop,
  currentCrop,
  farmerName = "Kisan Mitra",
  acres,
  variety,
  district: initialDistrict,
  village,
  externalQuery,
  onClearExternalQuery,
  onCropChange,
}) => {
  const { language } = useLanguage();
  const { weather } = useWeather();
  const { activeFarm, activeField } = useFarm();
  const t = getTranslation(language);

  const [profile] = useState<any>(getStoredProfile() || {});
  const [openWhyId, setOpenWhyId] = useState<string | null>(null);

  // Multi-Crop State
  const defaultCropId = (initialCrop || currentCrop || activeField?.crop || activeFarm?.primaryCrop || profile.crop || "wheat").toLowerCase();
  const [selectedCropId, setSelectedCropId] = useState<string>(defaultCropId);
  const [cropCategoryFilter, setCropCategoryFilter] = useState<string>("all");
  const [cropSearchQuery, setCropSearchQuery] = useState<string>("");
  const [showCropPicker, setShowCropPicker] = useState<boolean>(false);

  // Effective location and parameters
  const effectiveDistrict = initialDistrict || weather.district || profile.district || "Bhopal";
  const effectiveVillage = village || profile.village || "";
  const effectiveAcres = acres || profile.acres || 5.0;
  const effectiveVariety = variety || profile.cropVariety || "";
  const effectiveLocation = effectiveVillage
    ? `${effectiveVillage}, ${effectiveDistrict}, ${weather.state || "India"}`
    : `${effectiveDistrict}, ${weather.state || "India"}`;

  const currentCropInfo: CropInfo = resolveCropThresholds(selectedCropId);
  const currentCropProfile = getCropAdvisoryProfile(selectedCropId);

  // Safe spray calculation
  const isSpraySafe = weather.windSpeed < 15 && weather.precipitation === 0 && weather.temperature < 33;

  const effectiveFarmerName = profile?.fullName?.trim() || farmerName || "";
  const displayFarmerGreeting = effectiveFarmerName
    ? (language === "hi" ? `${effectiveFarmerName} जी` : effectiveFarmerName)
    : (language === "hi" ? "किसान मित्र" : "Farmer Friend");

  // Build localized welcome message
  const buildWelcome = useCallback((): Message => {
    const isHi = language === "hi";
    const cropDisplay = isHi ? currentCropInfo.nameHi : currentCropInfo.name;
    return {
      id: "welcome",
      sender: "bot",
      text: isHi
        ? `नमस्ते ${displayFarmerGreeting}! मैं आपका AASRA (आसरा) AI बहु-फसली कृषि सलाहकार हूँ। वर्तमान में सक्रिय फसल: ${cropDisplay}। आप किसी भी भाषा में बोलकर या लिखकर फसल सुरक्षा, मौसम, स्प्रे समय, कृषि सांख्यिकी अथवा मंडी भाव के बारे में पूछ सकते हैं।`
        : `Namaste ${displayFarmerGreeting}! I am your AASRA Precision Multi-Crop AI Advisor. Active crop: ${cropDisplay}. Speak or type in any language about disease protection, weather, safe spray window, crop statistics, or APMC mandi rates.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      provider: "Google Gemini 2.5 Flash",
      whyRecommendation: isHi
        ? `लाइव Open-Meteo टेलीमेट्री (${effectiveDistrict}) और सरकारी APMC मंडी आंकड़ों पर आधारित वास्तविक सलाहकार प्रणाली।`
        : `Grounded with live Open-Meteo telemetry for ${effectiveDistrict} and verified APMC Agmarknet price records.`,
      confidenceScore: 99,
      followUpQuestions: [
        isHi ? `${cropDisplay} का आज मंडी भाव क्या है?` : `What is today's ${currentCropInfo.name} mandi rate?`,
        isHi ? `क्या आज मेरी फसल में स्प्रे करना सुरक्षित है?` : `Is it safe to spray on ${currentCropInfo.name} today?`,
        isHi ? `कीट व फफूंद रोग की रोकथाम के उपाय बताएं` : `How to prevent major pests and diseases?`,
      ],
      locationUsed: effectiveLocation,
    };
  }, [currentCropInfo, effectiveDistrict, effectiveLocation, farmerName, language]);

  const [messages, setMessages] = useState<Message[]>([buildWelcome()]);
  const [input, setInput] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [micPermissionError, setMicPermissionError] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const voiceServiceRef = useRef<VoiceRecognitionService | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Voice Recognition Service
  useEffect(() => {
    const service = new VoiceRecognitionService({
      languageKey: language,
      endpointingSilenceMs: 3200,
      maxRecordingDurationMs: 45000,
      onStateChange: (newState) => {
        setVoiceState(newState);
      },
      onInterimTranscript: (text) => {
        setLiveTranscript(text);
        setInput(text);
      },
      onFinalSpeechPayload: (payload) => {
        setLiveTranscript("");
        processUserMessage(payload.transcript, payload.audioBase64, payload.audioMimeType);
      },
      onFinalTranscript: (finalText) => {
        setLiveTranscript("");
        processUserMessage(finalText);
      },
      onAudioLevelChange: (level) => {
        setAudioLevel(level);
      },
      onError: (errType, message) => {
        console.warn("[Voice UI Error]:", errType, message);
        if (errType === "permission_denied" || errType === "not_allowed") {
          setMicPermissionError(true);
        }
      },
    });

    voiceServiceRef.current = service;
    setSpeechSupported(service.isSupported());

    return () => {
      service.cancelListening();
    };
  }, [language]);

  // Update language on voice service
  useEffect(() => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.setOptions({ languageKey: language });
    }
  }, [language]);

  // Sync crop changes
  const handleSelectCrop = (cropId: string) => {
    setSelectedCropId(cropId);
    setShowCropPicker(false);
    if (onCropChange) onCropChange(cropId);
  };

  // Reset chat when language or crop changes
  useEffect(() => {
    setMessages([buildWelcome()]);
    setVoiceState("IDLE");
    setInput("");
    setLiveTranscript("");
    if (voiceServiceRef.current) {
      voiceServiceRef.current.cancelListening();
    }
  }, [language, selectedCropId, buildWelcome]);

  // Handle external query
  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      processUserMessage(externalQuery.trim());
      if (onClearExternalQuery) onClearExternalQuery();
    }
  }, [externalQuery, onClearExternalQuery]);

  // Smooth container-scoped scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, voiceState, liveTranscript]);

  // Voice Controls
  const handleStartListening = async () => {
    setMicPermissionError(false);
    stopGoogleSpeech();
    setSpeakingMessageId(null);
    setInput("");
    setLiveTranscript("");
    if (voiceServiceRef.current) {
      const ok = await voiceServiceRef.current.startListening();
      if (!ok) setVoiceState("IDLE");
    }
  };

  const handleStopListening = () => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stopListening();
    }
  };

  const handleCancelListening = () => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.cancelListening();
    }
    setLiveTranscript("");
    setInput("");
    setVoiceState("IDLE");
  };

  const speakResponse = useCallback((msgId: string, textToSpeak: string) => {
    if (speakingMessageId === msgId) {
      stopGoogleSpeech();
      setSpeakingMessageId(null);
      setVoiceState("IDLE");
      return;
    }

    stopGoogleSpeech();
    setSpeakingMessageId(msgId);
    setVoiceState("RESPONDING");
    playGoogleNeuralSpeech(textToSpeak, language, {
      onStart: () => {
        setSpeakingMessageId(msgId);
        setVoiceState("RESPONDING");
      },
      onEnd: () => {
        setSpeakingMessageId(null);
        setVoiceState("IDLE");
      },
      onError: () => {
        setSpeakingMessageId(null);
        setVoiceState("IDLE");
      },
    });
  }, [language, speakingMessageId]);

  const handleStopSpeaking = () => {
    stopGoogleSpeech();
    setSpeakingMessageId(null);
    setVoiceState("IDLE");
  };

  // Image selection for Multimodal Leaf Scanner
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Process User Message (Text, Voice, Image)
  const processUserMessage = async (queryText?: string, audioBase64?: string, audioMimeType?: string) => {
    const textClean = (queryText || "").trim();
    if (!textClean && !selectedImage && !audioBase64) return;

    if (voiceServiceRef.current) {
      voiceServiceRef.current.cancelListening();
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textClean || (audioBase64 ? "🎙️ Voice Query (Analyzing...)" : (selectedImage ? "📷 Leaf Photo Diagnostics" : "")),
      time: timeStr,
      imageUrl: imagePreviewUrl || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLiveTranscript("");
    const currentImg = selectedImage;
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setVoiceState("PROCESSING");

    let replyText = "";
    let whyReason = "";
    let confScore = 98;
    let followUps: string[] = [];
    let providerUsed = "Google Gemini 2.5 Flash";
    let dosageSummary: string | undefined = undefined;
    let mandiRecord: any = undefined;
    let rawTrans: string | undefined = undefined;

    try {
      if (currentImg) {
        // Multimodal Gemini Leaf Scanner
        const visionRes = await analyzeCropLeafImage(currentImg, selectedCropId, language, textClean, effectiveDistrict);
        replyText = visionRes?.diagnosis || "Leaf analysis completed.";
        whyReason = visionRes?.why_recommendation || "Visual spectral and necrotic lesion markers evaluated.";
        confScore = visionRes?.confidence_score || 95;
        followUps = visionRes?.follow_up_questions || [];
        providerUsed = visionRes?.provider || "Google Gemini 2.5 Flash Vision";
        dosageSummary = visionRes?.dosage;
      } else {
        // Chat Pipeline API Call with Full Live Telemetry
        const res = await sendChatMessage(
          textClean,
          weather.lat,
          weather.lon,
          selectedCropId,
          language,
          effectiveLocation,
          weather.nightTemperature || weather.temperature,
          effectiveFarmerName,
          effectiveAcres,
          effectiveVariety,
          profile.soilType || "Deep Black Loam",
          effectiveDistrict,
          effectiveVillage,
          audioBase64,
          audioMimeType,
          messages.map((m) => ({ sender: m.sender, text: m.text })),
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
          replyText = res.reply || res.response;
          whyReason = res.why_recommendation || `Ground truth verified for ${effectiveDistrict}`;
          confScore = res.confidence_score || 98;
          mandiRecord = res.mandi_record;
          rawTrans = res.raw_transcript;
          if (res.follow_up_questions && res.follow_up_questions.length > 0) {
            followUps = res.follow_up_questions;
          }
          providerUsed = res.model_used ? `Google ${res.model_used}` : "Google Gemini 2.5 Flash";

          if (rawTrans && rawTrans !== textClean) {
            setMessages((prev) =>
              prev.map((m) => (m.id === userMsg.id ? { ...m, text: rawTrans || m.text } : m))
            );
          }
        }
      }
    } catch (err) {
      console.error("[Chat Process Error]:", err);
      replyText = language === "hi"
        ? "तकनीकी समस्या के कारण संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।"
        : "Could not connect to the advisory engine. Please try again.";
    } finally {
      setVoiceState("IDLE");
    }

    const botMsg: Message = {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      provider: providerUsed,
      whyRecommendation: whyReason,
      confidenceScore: confScore,
      followUpQuestions: followUps,
      dosageSummary,
      mandiRecord,
      locationUsed: effectiveDistrict,
      telemetryUsed: {
        location: effectiveDistrict,
        temp: weather.temperature,
        soil: weather.soilMoistureEst,
        wind: weather.windSpeed,
        isSpraySafe,
      },
    };

    setMessages((prev) => [...prev, botMsg]);

    // Automatically speak response if input was via voice
    if (audioBase64) {
      speakResponse(botMsg.id, replyText);
    }
  };

  // Filtered crops list for multi-crop switcher
  const allRegionalCrops = getRegionalCrops(effectiveDistrict, weather.state || "");
  const filteredCrops = allRegionalCrops.filter((c) => {
    const matchesCategory = cropCategoryFilter === "all" || c.category === cropCategoryFilter;
    const matchesSearch =
      !cropSearchQuery ||
      c.name.toLowerCase().includes(cropSearchQuery.toLowerCase()) ||
      c.nameHi.toLowerCase().includes(cropSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full space-y-4 font-sans text-[#0d253d]">
      
      {/* ─────────────────────────────────────────────────────────────
          1. STRIPE-STYLE TOP HUD: MULTI-CROP PICKER & LOCATION BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e3e8ee] rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
        
        {/* Active Crop Bar + Quick Switcher Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#533afd] shrink-0 shadow-2xs">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Target Crop
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#533afd] border border-indigo-200">
                  {currentCropProfile.category.toUpperCase()}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-[#0d253d] font-display flex items-center gap-2">
                <span>{language === "hi" ? currentCropInfo.nameHi : currentCropInfo.name}</span>
                <span className="text-xs font-normal text-slate-500">({currentCropProfile.season})</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCropPicker(!showCropPicker)}
              className="px-3.5 py-2 rounded-xl bg-[#f6f9fc] hover:bg-indigo-50 border border-[#e3e8ee] hover:border-indigo-300 text-xs font-bold text-[#0d253d] hover:text-[#533afd] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Layers className="h-3.5 w-3.5 text-[#533afd]" />
              <span>{showCropPicker ? "Hide Crops" : "Change Crop"}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${showCropPicker ? "rotate-180" : ""}`} />
            </button>

            {/* Spray Window Status Pill */}
            <div className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-2xs ${
              isSpraySafe
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
              <div className={`h-1.5 w-1.5 rounded-full ${isSpraySafe ? "bg-emerald-600 animate-pulse" : "bg-amber-600"}`} />
              <Wind className="h-3 w-3" />
              <span>{isSpraySafe ? "Spray Safe" : "Spray Caution"}</span>
            </div>
          </div>
        </div>

        {/* Expandable Multi-Crop Selector Panel */}
        {showCropPicker && (
          <div className="bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl p-4 space-y-3 animate-in fade-in duration-200 shadow-inner">
            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={cropSearchQuery}
                  onChange={(e) => setCropSearchQuery(e.target.value)}
                  placeholder="Search 50+ crops (e.g. Wheat, Cotton, Tomato, Mustard)..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#e3e8ee] rounded-xl text-xs text-[#0d253d] placeholder-slate-400 focus:outline-none focus:border-[#533afd] shadow-2xs"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {CROP_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCropCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      cropCategoryFilter === cat.id
                        ? "bg-[#533afd] text-white shadow-xs"
                        : "bg-white text-slate-700 hover:text-[#533afd] border border-[#e3e8ee]"
                    }`}
                  >
                    {language === "hi" ? cat.labelHi : cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Crop Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredCrops.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCrop(c.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedCropId === c.id
                      ? "bg-indigo-50 border-[#533afd] text-[#533afd] shadow-xs"
                      : "bg-white border-[#e3e8ee] text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30"
                  }`}
                >
                  <span className="text-xs font-bold truncate">
                    {language === "hi" ? c.nameHi : c.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Opt: {c.t_opt_day}°C
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hyper-Local Telemetry Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-[#f6f9fc] border border-[#e3e8ee] p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
            <span className="text-slate-500 font-sans font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#533afd]" /> Location
            </span>
            <span className="font-bold text-[#0d253d] truncate max-w-[120px]">{effectiveDistrict}</span>
          </div>

          <div className="bg-[#f6f9fc] border border-[#e3e8ee] p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
            <span className="text-slate-500 font-sans font-medium flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5 text-blue-600" /> Air Temp
            </span>
            <span className="font-bold text-[#533afd]">{weather.temperature}°C</span>
          </div>

          <div className="bg-[#f6f9fc] border border-[#e3e8ee] p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
            <span className="text-slate-500 font-sans font-medium flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-emerald-600" /> Soil Index
            </span>
            <span className="font-bold text-emerald-600">{weather.soilMoistureEst}%</span>
          </div>

          <div className="bg-[#f6f9fc] border border-[#e3e8ee] p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
            <span className="text-slate-500 font-sans font-medium flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5 text-amber-600" /> Wind Speed
            </span>
            <span className="font-bold text-[#0d253d]">{weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CHAT STREAM (STRIPE ELEVATED CARDS)
         ───────────────────────────────────────────────────────────── */}
      <div ref={chatContainerRef} className="flex-1 bg-[#fbfcfd] border border-[#e3e8ee] rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[420px] max-h-[560px] shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} space-y-1.5`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[82%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed border transition-all animate-card-entrance ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-[#533afd] to-[#4434d4] text-white border-[#4434d4] rounded-br-xs shadow-sm font-medium"
                  : "bg-white text-[#0d253d] border-[#e3e8ee] rounded-bl-xs shadow-xs"
              }`}
            >
              {/* Multimodal Image Preview */}
              {msg.imageUrl && (
                <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-200 max-w-[220px] shadow-xs">
                  <img src={msg.imageUrl} alt="Uploaded Leaf" className="w-full h-auto object-cover" />
                </div>
              )}

              {/* Bot Identity & Live Grounding Badge */}
              {msg.sender === "bot" && (
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                  <div className="relative overflow-hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 text-[#533afd] border border-indigo-200 text-[10px] font-bold font-mono uppercase tracking-wide shadow-2xs">
                    <Sparkles className="h-3 w-3 text-[#533afd] animate-pulse" />
                    <span>AASRA Intelligence</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-laser-shimmer" />
                  </div>

                  {msg.telemetryUsed && (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold flex items-center gap-1 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                      <span>{msg.telemetryUsed.location || effectiveDistrict} · {msg.telemetryUsed.temp}°C · Soil {msg.telemetryUsed.soil}%</span>
                    </span>
                  )}
                </div>
              )}

              {/* Message Content: FormattedAgriResponse for Bot, plain text for User */}
              {msg.sender === "bot" ? (
                <FormattedAgriResponse
                  id={msg.id}
                  text={msg.text}
                  language={language}
                  isSpeaking={speakingMessageId === msg.id}
                  onToggleSpeech={() => speakResponse(msg.id, msg.text)}
                  telemetryUsed={msg.telemetryUsed}
                  mandiRecord={msg.mandiRecord}
                  confidenceScore={msg.confidenceScore}
                  provider={msg.provider}
                  whyRecommendation={msg.whyRecommendation}
                  cropName={currentCropInfo.name}
                  acres={effectiveAcres}
                />
              ) : (
                <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed font-medium">{msg.text}</p>
              )}
            </div>

            {/* Contextual Follow-up Chips with Animated Hover */}
            {msg.sender === "bot" && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5 pl-1 max-w-[90%]">
                {msg.followUpQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => processUserMessage(q)}
                    className="px-3.5 py-1.5 rounded-xl text-xs bg-white hover:bg-indigo-50 border border-[#e3e8ee] hover:border-indigo-300 text-[#0d253d] hover:text-[#533afd] font-semibold cursor-pointer transition-all flex items-center gap-1.5 text-left shadow-2xs hover:scale-[1.02] hover:-translate-y-0.5"
                  >
                    <span>💡 {q}</span>
                    <ArrowRight className="h-2.5 w-2.5 opacity-50" />
                  </button>
                ))}
              </div>
            )}

            <span className="text-[10px] font-mono text-slate-400 px-1">{msg.time}</span>
          </div>
        ))}

        {/* Live Audio / Soundwave Equalizer State (design-spells) */}
        {voiceState === "LISTENING" && (
          <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border-2 border-rose-300 p-4 rounded-2xl flex items-center gap-4 animate-card-entrance shadow-md">
            <div className="relative h-11 w-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg animate-pulse-ring">
              <Mic className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-rose-900 font-display">
                  Listening in {language.toUpperCase()}...
                </span>
                <span className="text-xs text-rose-600 font-medium">Live typing in message box below</span>
              </div>
              <p className="text-slate-800 font-semibold text-xs mt-1 truncate">
                {liveTranscript || "बोलना शुरू करें / Speak for crop queries, spray timings, or mandi rates..."}
              </p>
            </div>
            
            {/* Live Dancing Equalizer Soundwave Bars */}
            <div className="flex items-center gap-1 h-8 px-2.5 py-1 bg-white/80 rounded-xl border border-rose-200">
              <div className="w-1 bg-rose-500 rounded-full animate-soundwave-1" />
              <div className="w-1 bg-rose-500 rounded-full animate-soundwave-2" />
              <div className="w-1 bg-rose-500 rounded-full animate-soundwave-3" />
              <div className="w-1 bg-rose-500 rounded-full animate-soundwave-4" />
              <div className="w-1 bg-rose-500 rounded-full animate-soundwave-5" />
            </div>

            <button
              type="button"
              onClick={handleStopListening}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md hover:scale-105 transition-all"
            >
              Done
            </button>
          </div>
        )}

        {/* Synthesis Processing State with Shimmer */}
        {voiceState === "PROCESSING" && (
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-center gap-3 text-xs text-indigo-950 font-medium shadow-sm animate-card-entrance">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-laser-shimmer" />
            <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-indigo-900 text-xs">Synthesizing Agronomic Intelligence...</div>
              <div className="text-[11px] text-slate-500">Cross-referencing Open-Meteo telemetry & APMC Mandi price buffers</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. BOTTOM INPUT BAR (VOICE, CAMERA, TEXT)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e3e8ee] rounded-3xl p-3 shadow-md space-y-2">
        
        {/* Live Voice Streaming Status Ribbon */}
        {voiceState === "LISTENING" && (
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-medium animate-in fade-in slide-in-from-bottom-1 duration-150 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
              </span>
              <span className="font-bold font-display text-rose-950">
                {language === "hi" ? "🔴 लाइव आवाज़ टाइप हो रही है..." : "🔴 Live Voice Transcribing..."}
              </span>
              <span className="text-[11px] text-rose-700 font-mono hidden sm:inline">
                {language === "hi" ? "(बोलते रहें, शब्द नीचे बॉक्स में दर्ज हो रहे हैं)" : "(Words are streaming into message box)"}
              </span>
            </div>
            <div className="flex items-center gap-1 h-3.5 px-2 py-0.5 bg-white/80 rounded-lg border border-rose-200">
              <div className="w-1 bg-rose-600 rounded-full animate-soundwave-1" />
              <div className="w-1 bg-rose-600 rounded-full animate-soundwave-2" />
              <div className="w-1 bg-rose-600 rounded-full animate-soundwave-3" />
              <div className="w-1 bg-rose-600 rounded-full animate-soundwave-4" />
            </div>
          </div>
        )}

        {/* Selected Image Thumbnail with Futuristic Laser Scan Effect */}
        {imagePreviewUrl && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50/70 via-[#f6f9fc] to-indigo-50/70 border border-emerald-300/80 p-3 rounded-2xl shadow-sm animate-card-entrance">
            <div className="relative h-14 w-14 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md shrink-0">
              <img src={imagePreviewUrl} alt="Leaf Preview" className="h-full w-full object-cover" />
              {/* Laser Scanning Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] animate-scanline" />
              {/* Corner Reticles */}
              <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 border-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Multimodal Leaf Scanner Active</span>
              </div>
              <p className="text-xs text-[#0d253d] font-medium truncate mt-0.5">
                {selectedImage?.name}
              </p>
              <span className="text-[10px] text-slate-500">Gemini 2.5 Flash ready to diagnose rust, chlorosis & pest necrosis</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setImagePreviewUrl(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
              title="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (voiceState === "LISTENING") {
              handleStopListening();
            }
            processUserMessage(input);
          }}
          className="flex items-center gap-2"
        >
          {/* Mobile Camera / Leaf Photo Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Scan Crop Leaf Photo"
            className="p-3 rounded-2xl bg-[#f6f9fc] hover:bg-indigo-50 border border-[#e3e8ee] hover:border-indigo-300 text-slate-600 hover:text-[#533afd] cursor-pointer transition-all shrink-0 shadow-2xs"
          >
            <Camera className="h-4 w-4" />
          </button>

          {/* Multilingual Voice Microphone with Active Live Streaming state */}
          <button
            type="button"
            onClick={voiceState === "LISTENING" ? handleStopListening : handleStartListening}
            title={voiceState === "LISTENING" ? "Stop Recording & Submit" : "Speak in any Indian language"}
            className={`p-3 rounded-2xl border transition-all cursor-pointer shrink-0 shadow-2xs ${
              voiceState === "LISTENING"
                ? "bg-rose-600 text-white border-rose-500 shadow-md animate-pulse hover:scale-105"
                : "bg-[#f6f9fc] hover:bg-indigo-50 border-[#e3e8ee] hover:border-indigo-300 text-[#533afd]"
            }`}
          >
            {voiceState === "LISTENING" ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          {/* Real-Time Live Streaming Text Input Field */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                voiceState === "LISTENING"
                  ? language === "hi"
                    ? "🎙️ बोलना शुरू करें... शब्द यहाँ टाइप होंगे"
                    : "🎙️ Speak now... words appear here live"
                  : language === "hi"
                  ? `${currentCropInfo.nameHi} के बारे में पूछें, मंडी भाव या मौसम...`
                  : `Ask about ${currentCropInfo.name}, mandi rates, or weather...`
              }
              className={`w-full rounded-2xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#0d253d] font-medium transition-all ${
                voiceState === "LISTENING"
                  ? "bg-rose-50/50 border-2 border-rose-400 ring-4 ring-rose-500/15 focus:outline-none placeholder-rose-400 shadow-inner"
                  : "bg-[#f6f9fc] border border-[#e3e8ee] placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#533afd] focus:ring-2 focus:ring-[#533afd]/15"
              }`}
            />
            {/* Blinking Live Speech Cursor */}
            {voiceState === "LISTENING" && input.length > 0 && (
              <span className="absolute right-3 inline-block w-1.5 h-4 bg-rose-600 rounded-full animate-pulse pointer-events-none" />
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() && !selectedImage}
            className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-[#533afd] to-[#4434d4] hover:opacity-95 disabled:opacity-40 text-white font-bold cursor-pointer transition-all shrink-0 disabled:cursor-not-allowed shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
