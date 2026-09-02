"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  saveProfile,
  EMPTY_FARMER_PROFILE,
  INDIAN_LANGUAGES,
  FarmerProfile,
} from "@/lib/userStore";
import { saveFarmerField, setActiveField, FieldRecord } from "@/lib/fieldStore";
import { getRegionalCrops } from "@/lib/cropRegistry";
import { reverseGeocode } from "@/context/WeatherContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  User,
  MapPin,
  Sprout,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Navigation,
  Globe,
  ShieldCheck,
  Zap,
  Volume2,
  Lock,
  Layers,
  Sliders,
  Check,
} from "lucide-react";

const POPULAR_AGRI_HUBS = [
  { name: "Sehore / Bhopal", district: "Sehore", state: "Madhya Pradesh", lat: 23.2000, lon: 77.0800, soil: "Deep Black Cotton Soil", crop: "Soybean" },
  { name: "Pune / Baramati", district: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567, soil: "Black Clayey Soil", crop: "Sugarcane" },
  { name: "Nashik / Lasalgaon", district: "Nashik", state: "Maharashtra", lat: 19.9975, lon: 73.7898, soil: "Red & Black Loam", crop: "Onion" },
  { name: "Rajkot / Gondal", district: "Rajkot", state: "Gujarat", lat: 22.3039, lon: 70.8022, soil: "Medium Black Soil", crop: "Cotton" },
  { name: "Ludhiana / Khanna", district: "Ludhiana", state: "Punjab", lat: 30.9010, lon: 75.8573, soil: "Alluvial Loam", crop: "Wheat" },
  { name: "Jaipur / Muhana", district: "Jaipur", state: "Rajasthan", lat: 26.8320, lon: 75.7650, soil: "Sandy Loam", crop: "Mustard" },
];

const PRESET_FARMER_PERSONAS = [
  { name: "Ramesh Patel", district: "Sehore", state: "Madhya Pradesh", crop: "Soybean", acres: 5, avatar: "🌾" },
  { name: "Gurpreet Singh", district: "Ludhiana", state: "Punjab", crop: "Wheat", acres: 12, avatar: "🚜" },
  { name: "Suresh Jadhav", district: "Nashik", state: "Maharashtra", crop: "Onion", acres: 4, avatar: "🍇" },
  { name: "Venkatesh Rao", district: "Guntur", state: "Andhra Pradesh", crop: "Cotton", acres: 8, avatar: "🌶️" },
];

const AVAILABLE_CROPS = [
  { id: "Soybean", name: "Soybean (सोयाबीन)", icon: "🫘", color: "from-amber-500/20 to-emerald-500/20" },
  { id: "Wheat", name: "Wheat (गेहूं)", icon: "🌾", color: "from-yellow-500/20 to-amber-500/20" },
  { id: "Mustard", name: "Mustard (सरसों)", icon: "🌼", color: "from-yellow-400/20 to-lime-500/20" },
  { id: "Cotton", name: "Cotton (कपास)", icon: "☁️", color: "from-sky-500/20 to-indigo-500/20" },
  { id: "Tomato", name: "Tomato (टमाटर)", icon: "🍅", color: "from-rose-500/20 to-red-500/20" },
  { id: "Gram", name: "Gram / Chana (चना)", icon: "🥣", color: "from-orange-500/20 to-amber-500/20" },
  { id: "Paddy", name: "Rice / Paddy (धान)", icon: "🌾", color: "from-emerald-500/20 to-green-500/20" },
  { id: "Maize", name: "Maize (मक्का)", icon: "🌽", color: "from-amber-400/20 to-yellow-500/20" },
];

export default function SignupPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [step, setStep] = useState<number>(1);
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  // Form State
  const [formData, setFormData] = useState<FarmerProfile>({
    ...EMPTY_FARMER_PROFILE,
    language: language || "hi",
    fullName: "",
    mobileNumber: "",
    state: "Madhya Pradesh",
    district: "Sehore",
    village: "Fanda Kalan",
    primaryCrop: "Soybean",
    fieldAreaAcres: 5.0,
    fieldAreaHa: 2.0,
    sowingDate: "2026-06-15",
    cropVariety: "JS-335 (Broadleaf)",
    irrigationType: "Monsoon Rainfed + Drip",
    soilType: "Deep Black Cotton Soil",
  });

  const [loadingGps, setLoadingGps] = useState<boolean>(false);
  const [gpsDetected, setGpsDetected] = useState<boolean>(false);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  // GPS Auto Detect
  const handleDetectGPS = () => {
    setLoadingGps(true);
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const geo = await reverseGeocode(lat, lon);

          setFormData((prev) => ({
            ...prev,
            gpsLocation: { lat, lon },
            state: geo.state || prev.state || "Madhya Pradesh",
            district: geo.district || prev.district || "Sehore",
            village: geo.village || prev.village || "Local Village",
            fieldName: `${geo.village || geo.district || "Main"} Farm Plot`,
          }));
          setLoadingGps(false);
          setGpsDetected(true);
        },
        (err) => {
          console.warn("GPS lookup denied or unavailable:", err);
          setLoadingGps(false);
        },
        { timeout: 8000 }
      );
    } else {
      setLoadingGps(false);
    }
  };

  const handleApplyPersona = (persona: typeof PRESET_FARMER_PERSONAS[0]) => {
    setSelectedPersona(persona.name);
    setFormData((prev) => ({
      ...prev,
      fullName: persona.name,
      district: persona.district,
      state: persona.state,
      primaryCrop: persona.crop,
      fieldAreaAcres: persona.acres,
      mobileNumber: "98260 14890",
    }));
  };

  // Complete Registration & Generate Farmer Passport
  const handleCompleteRegistration = () => {
    const finalProfile: FarmerProfile = {
      ...formData,
      isRegistered: true,
      lastLogin: new Date().toISOString(),
    };

    saveProfile(finalProfile);

    // Save initial field record
    const initialField: FieldRecord = {
      id: `field-${Date.now()}`,
      name: `${finalProfile.fullName}'s ${finalProfile.primaryCrop} Field`,
      crop: finalProfile.primaryCrop || "Soybean",
      cropVariety: finalProfile.cropVariety || "JS-335",
      areaAcres: finalProfile.fieldAreaAcres || 5.0,
      areaHa: finalProfile.fieldAreaHa || 2.0,
      center: finalProfile.gpsLocation ? [finalProfile.gpsLocation.lat, finalProfile.gpsLocation.lon] : [23.2, 77.08],
      polygon: [],
      sowingDate: finalProfile.sowingDate || "2026-06-15",
      growthStage: "Vegetative",
      soilType: finalProfile.soilType || "Deep Black Cotton Soil",
      irrigationType: finalProfile.irrigationType || "Rainfed",
      color: "#10B981",
      state: finalProfile.state || "Madhya Pradesh",
      district: finalProfile.district || "Sehore",
      village: finalProfile.village || "Main Village",
    };

    saveFarmerField(initialField);
    setActiveField(initialField.id);

    if (typeof window !== "undefined") {
      localStorage.setItem("aasra_is_logged_in", "true");
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] text-[#0d253d] font-sans flex flex-col justify-between select-none relative overflow-hidden">
      
      {/* ── Atmospheric Ambient Radial Meshes (Stripe Aesthetic) ──── */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #533afd 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/2 -right-24 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)" }}
      />

      {/* ── Header Navigation Bar ─────────────────────────────────── */}
      <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
            <Image src="/images/aasra_logo.png" alt="AASRA Logo" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <span className="text-xl font-bold font-display text-[#0d253d] tracking-tight block">AASRA</span>
            <span className="text-[10px] font-mono text-[#533afd] font-bold block uppercase tracking-wider">Farmer Passport</span>
          </div>
        </Link>

        {/* Header Right Links */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-slate-600 hover:text-[#533afd] transition-colors"
          >
            Already registered? <span className="text-[#533afd] underline">Log In</span>
          </Link>
        </div>
      </header>

      {/* ── Main Interactive Registration Container ──────────────── */}
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 z-10 flex flex-col justify-center">
        
        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { num: 1, label: isHindi ? "01. पहचान" : "01. Identity", icon: User },
            { num: 2, label: isHindi ? "02. स्थान" : "02. Location", icon: MapPin },
            { num: 3, label: isHindi ? "03. फसल" : "03. Crop", icon: Sprout },
            { num: 4, label: isHindi ? "04. पासपोर्ट" : "04. Passport", icon: ShieldCheck },
          ].map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                className={`p-2.5 rounded-2xl border text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                  isCurrent
                    ? "bg-white border-[#533afd] text-[#533afd] shadow-md shadow-[#533afd]/10 scale-[1.02]"
                    : isCompleted
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-white/60 border-[#e3e8ee] text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <s.icon className={`h-4 w-4 shrink-0 ${isCurrent ? "text-[#533afd]" : "text-slate-400"}`} />
                )}
                <span className="text-xs font-bold hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Multi-Step Form Card */}
        <div className="rounded-3xl bg-white border border-[#e3e8ee] shadow-xl p-6 sm:p-10 space-y-6 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* ── STEP 1: FARMER IDENTITY & NATIVE LANGUAGE ───────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#533afd] bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 uppercase">
                    Step 01 / Farmer Identity
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0d253d] font-display mt-1 tracking-tight">
                    {isHindi ? "किसान पहचान व भाषा चयन" : "Tell us about yourself"}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748d] mt-1">
                    {isHindi
                      ? "अपना नाम और भाषा चुनें ताकि AASRA AI आपकी अपनी बोली में सटीक सलाह दे सके।"
                      : "Register your name and preferred language for personalized voice and agronomic advisory."}
                  </p>
                </div>

                {/* Quick Persona Pre-fills (Playful feature) */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    ✨ Quick Preset Personas (1-Click Fill):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_FARMER_PERSONAS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleApplyPersona(p)}
                        className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          selectedPersona === p.name
                            ? "bg-indigo-50 border-[#533afd] text-[#533afd] font-bold"
                            : "bg-slate-50 hover:bg-slate-100 border-[#e3e8ee] text-slate-700"
                        }`}
                      >
                        <span className="text-base mr-1">{p.avatar}</span>
                        <span className="font-bold block truncate">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{p.district}, {p.crop}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0d253d]">
                      {isHindi ? "पूरा नाम *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Ramesh Patel, Gurpreet Singh..."
                      className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] focus:border-[#533afd] rounded-2xl text-sm font-bold text-[#0d253d] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0d253d]">
                      {isHindi ? "मोबाइल नंबर *" : "Mobile Number *"}
                    </label>
                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      placeholder="e.g. 98260 14890"
                      className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] focus:border-[#533afd] rounded-2xl text-sm font-bold text-[#0d253d] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Preferred Language 12-Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0d253d]">
                      {isHindi ? "पसंदीदा बोली / भाषा चुनें:" : "Choose Preferred Language:"}
                    </label>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      12 Indian Languages Active
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {INDIAN_LANGUAGES.map((lang) => {
                      const isSelected = formData.language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, language: lang.code });
                            setLanguage(lang.code as any);
                          }}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-[#533afd] text-white border-[#533afd] shadow-md shadow-[#533afd]/20 scale-[1.02]"
                              : "bg-[#f6f9fc] hover:bg-slate-100 border-[#e3e8ee] text-slate-700"
                          }`}
                        >
                          <div>
                            <span className="text-xs font-black block">{lang.native}</span>
                            <span className={`text-[10px] block ${isSelected ? "text-indigo-100" : "text-slate-400"}`}>
                              {lang.name}
                            </span>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Continue Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.fullName.trim()}
                    className="px-6 py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
                  >
                    <span>{isHindi ? "आगे बढ़ें: स्थान चयन" : "Continue to Step 2"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: HYPERLOCAL LOCATION & GPS ───────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#533afd] bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 uppercase">
                    Step 02 / Hyperlocal Location
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0d253d] font-display mt-1 tracking-tight">
                    {isHindi ? "खेत का सटीक स्थान व जिला" : "Where is your farm located?"}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748d] mt-1">
                    {isHindi
                      ? "सटीक मौसम टेलीमेट्री और नजदीकी मंडी भाव के लिए अपने खेत का स्थान दर्ज करें।"
                      : "Satellite weather telemetry and APMC mandi distance depend on your exact field coordinates."}
                  </p>
                </div>

                {/* GPS Auto Detect Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#533afd] text-white flex items-center justify-center shadow-sm shrink-0">
                      <Navigation className={`h-5 w-5 ${loadingGps ? "animate-spin" : ""}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0d253d]">
                        {gpsDetected ? "✓ GPS Location Locked" : "Auto-Detect Satellite GPS"}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {gpsDetected
                          ? `${formData.district}, ${formData.state} (±15m accuracy)`
                          : "Pinpoint your farm using device GPS sensor"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    className="px-4 py-2 rounded-xl bg-white border border-[#e3e8ee] hover:border-[#533afd] text-[#533afd] font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
                  >
                    {loadingGps ? "Detecting..." : gpsDetected ? "Re-detect" : "Auto-Detect"}
                  </button>
                </div>

                {/* Popular Agriculture Hubs */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    📍 Major Agricultural Clusters (1-Click Select):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {POPULAR_AGRI_HUBS.map((hub) => (
                      <button
                        key={hub.district}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            district: hub.district,
                            state: hub.state,
                            primaryCrop: hub.crop,
                            soilType: hub.soil,
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          formData.district === hub.district
                            ? "bg-[#533afd] text-white border-[#533afd] shadow-sm font-bold"
                            : "bg-[#f6f9fc] hover:bg-slate-100 border-[#e3e8ee] text-slate-700"
                        }`}
                      >
                        <span className="font-bold block truncate">{hub.name}</span>
                        <span className={`text-[10px] block ${formData.district === hub.district ? "text-indigo-100" : "text-slate-400"}`}>
                          {hub.state} · {hub.crop}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* State & District Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0d253d]">
                      {isHindi ? "जिला (District) *" : "District *"}
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g. Sehore, Bhopal, Nashik..."
                      className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] focus:border-[#533afd] rounded-2xl text-sm font-bold text-[#0d253d] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0d253d]">
                      {isHindi ? "राज्य (State) *" : "State *"}
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g. Madhya Pradesh, Maharashtra..."
                      className="w-full px-4 py-3 bg-[#f6f9fc] border border-[#e3e8ee] focus:border-[#533afd] rounded-2xl text-sm font-bold text-[#0d253d] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-[#e3e8ee] text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!formData.district.trim()}
                    className="px-6 py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
                  >
                    <span>{isHindi ? "आगे बढ़ें: फसल चयन" : "Continue to Step 3"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: CROP & FARM ACREAGE ─────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#533afd] bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 uppercase">
                    Step 03 / Crop & Acreage
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0d253d] font-display mt-1 tracking-tight">
                    {isHindi ? "फसल और खेत का क्षेत्रफल" : "Select your primary crop"}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748d] mt-1">
                    {isHindi
                      ? "AASRA आपकी फसल के विकास चक्र और बीमारियों की पहचान के लिए विशेष मॉडल सक्रिय करेगा।"
                      : "We calibrate disease vision and phenological biological windows specifically for your crop."}
                  </p>
                </div>

                {/* Visual Crop Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVAILABLE_CROPS.map((cr) => {
                    const isSelected = formData.primaryCrop === cr.id;
                    return (
                      <button
                        key={cr.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, primaryCrop: cr.id })}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-[#533afd] text-white border-[#533afd] shadow-md shadow-[#533afd]/20 scale-[1.03]"
                            : "bg-[#f6f9fc] hover:bg-slate-100 border-[#e3e8ee] text-slate-700"
                        }`}
                      >
                        <span className="text-2xl">{cr.icon}</span>
                        <span className="text-xs font-bold block">{cr.name}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
                      </button>
                    );
                  })}
                </div>

                {/* Acreage Slider */}
                <div className="p-5 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-[#0d253d]">
                    <span>{isHindi ? "खेत का क्षेत्रफल (Farm Acreage):" : "Farm Acreage:"}</span>
                    <span className="font-mono text-base text-[#533afd] font-black bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                      {formData.fieldAreaAcres} {isHindi ? "एकड़" : "Acres"}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={formData.fieldAreaAcres || 5}
                    onChange={(e) => setFormData({ ...formData, fieldAreaAcres: Number(e.target.value) })}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#533afd]"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1 Acre</span>
                    <span>25 Acres</span>
                    <span>50+ Acres</span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 rounded-xl border border-[#e3e8ee] text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-6 py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
                  >
                    <span>{isHindi ? "पासपोर्ट तैयार करें" : "Generate Smart Passport"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: SMART FARMER PASSPORT GENERATION ────────────── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase">
                    Ready to Activate
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0d253d] font-display mt-1">
                    {isHindi ? "आपका डिजिटल किसान पासपोर्ट तैयार है!" : "Your AASRA Smart Card is Ready!"}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748d] mt-1 max-w-md mx-auto">
                    {isHindi
                      ? "आपके खेत के लिए सभी 7 AI और सैटेलाइट सिस्टम सफलतापूर्वक सक्रिय कर दिए गए हैं।"
                      : "Telemetry streams, verified APMC rates, and Gemini 2.5 crop vision are linked to your profile."}
                  </p>
                </div>

                {/* Holographic Smart Kisan Card */}
                <div className="max-w-md mx-auto rounded-3xl p-6 bg-gradient-to-br from-[#0d253d] via-[#1a237e] to-[#0d253d] text-white shadow-2xl border border-indigo-400/40 relative overflow-hidden text-left space-y-4">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#533afd]/30 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Card Top Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                        🌾
                      </div>
                      <div>
                        <span className="text-xs font-bold block">AASRA SMART CARD</span>
                        <span className="text-[9px] text-emerald-400 font-mono">VERIFIED FARMER</span>
                      </div>
                    </div>
                    <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold">
                      ACTIVE ●
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono block">FARMER NAME</span>
                      <span className="font-bold text-sm text-white">{formData.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono block">PRIMARY CROP</span>
                      <span className="font-bold text-sm text-amber-300">{formData.primaryCrop} ({formData.fieldAreaAcres} Ac)</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono block">DISTRICT / STATE</span>
                      <span className="font-medium text-slate-200">{formData.district}, {formData.state}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono block">CONNECTED TELEMETRY</span>
                      <span className="font-mono text-emerald-300">Open-Meteo + Agmarknet</span>
                    </div>
                  </div>

                  {/* Security Chip Simulation */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>ID: AASRA-2026-{Math.floor(1000 + Math.random() * 9000)}</span>
                    <span className="text-emerald-400">100% Free Public Good</span>
                  </div>
                </div>

                {/* Final Launch Button */}
                <div className="pt-4 max-w-md mx-auto space-y-3">
                  <button
                    type="button"
                    onClick={handleCompleteRegistration}
                    className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
                      boxShadow: "0 8px 25px rgba(83, 58, 253, 0.35)",
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isHindi ? "मेरा खेत डैशबोर्ड खोलें" : "Launch My Farm AI Dashboard"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Edit Farm Info
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="max-w-6xl w-full mx-auto px-4 py-4 text-center text-xs text-slate-400 z-10">
        © 2026 AASRA — Syngenta Biologicals & AI Crop Science Companion
      </footer>

    </div>
  );
}
