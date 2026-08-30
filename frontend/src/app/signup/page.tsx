"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { saveProfile, EMPTY_FARMER_PROFILE, INDIAN_LANGUAGES, FarmerProfile } from "@/lib/userStore";
import { saveFarmerField, setActiveField, FieldRecord } from "@/lib/fieldStore";
import { getRegionalCrops, saveCustomCrop } from "@/lib/cropRegistry";
import { saveFieldToBackend } from "@/lib/api";
import { reverseGeocode } from "@/context/WeatherContext";
import {
  User, MapPin, Sprout, Settings, ArrowRight, ArrowLeft, CheckCircle2, Navigation, Mic, Globe,
  Search, ShieldCheck, Sparkles, AlertCircle, Check
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

const POPULAR_AGRI_HUBS = [
  { name: "Bhopal (Fanda Kalan)", district: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126, soil: "Black Cotton Soil" },
  { name: "Pune (Haveli / Baramati)", district: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567, soil: "Black Clayey Soil" },
  { name: "Indore (Sanwer / Depalpur)", district: "Indore", state: "Madhya Pradesh", lat: 22.7196, lon: 75.8577, soil: "Deep Vertisol Clay" },
  { name: "Ludhiana (Jagraon / Samrala)", district: "Ludhiana", state: "Punjab", lat: 30.9010, lon: 75.8573, soil: "Alluvial Loam" },
  { name: "Nashik (Niphad / Dindori)", district: "Nashik", state: "Maharashtra", lat: 19.9975, lon: 73.7898, soil: "Red & Black Loam" },
  { name: "Ujjain (Ghatiya / Badnagar)", district: "Ujjain", state: "Madhya Pradesh", lat: 23.1765, lon: 75.7885, soil: "Black Cotton Soil" },
  { name: "Nagpur (Katol / Saoner)", district: "Nagpur", state: "Maharashtra", lat: 21.1458, lon: 79.0882, soil: "Black Clay Soil" },
  { name: "Rajkot (Gondal / Jetpur)", district: "Rajkot", state: "Gujarat", lat: 22.3039, lon: 70.8022, soil: "Medium Black Soil" },
  { name: "Karnal (Gharaunda)", district: "Karnal", state: "Haryana", lat: 29.6857, lon: 76.9905, soil: "Fertile Alluvial" },
  { name: "Guntur (Tenali / Bapatla)", district: "Guntur", state: "Andhra Pradesh", lat: 16.3067, lon: 80.4365, soil: "Black Heavy Clay" },
];

export default function SignupPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [step, setStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState<FarmerProfile>({
    ...EMPTY_FARMER_PROFILE,
    language: language || "hi",
    fullName: "",
    mobileNumber: "",
    state: "",
    district: "",
    village: "",
    primaryCrop: "Soybean",
    fieldAreaAcres: 5.0,
    fieldAreaHa: 2.0,
    sowingDate: "2026-06-15",
    cropVariety: "JS-335 (Broadleaf Soybean)",
    irrigationType: "Drip + Monsoon Rainfed",
    soilType: "Black Cotton Soil",
  });

  const [isCustomCropMode, setIsCustomCropMode] = useState<boolean>(false);
  const [customCropInput, setCustomCropInput] = useState<string>("");
  const regionalCrops = getRegionalCrops(formData.district, formData.state);

  const [gpsDetected, setGpsDetected] = useState<boolean>(false);
  const [loadingGps, setLoadingGps] = useState<boolean>(false);
  const [fieldReady, setFieldReady] = useState<boolean>(false);
  const [searchDistrictQuery, setSearchDistrictQuery] = useState<string>("");
  const [isSearchingGeocode, setIsSearchingGeocode] = useState<boolean>(false);

  // Auto-detect GPS when reaching step 2
  const detectLocation = () => {
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
            state: geo.state || prev.state || "India",
            district: geo.district || prev.district || "My District",
            village: geo.village || prev.village || "My Village",
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

  const handleSearchCustomLocation = async () => {
    if (!searchDistrictQuery.trim()) return;
    setIsSearchingGeocode(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchDistrictQuery)}&format=json&limit=1`, {
        headers: { "User-Agent": "AASRA-Agri-App/1.0" },
      });
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const match = results[0];
          const lat = parseFloat(match.lat);
          const lon = parseFloat(match.lon);
          const geo = await reverseGeocode(lat, lon);

          setFormData((prev) => ({
            ...prev,
            gpsLocation: { lat, lon },
            state: geo.state || prev.state,
            district: geo.district || searchDistrictQuery,
            village: geo.village || prev.village,
            fieldName: `${geo.village || geo.district || searchDistrictQuery} Farm Plot`,
          }));
          setGpsDetected(true);
        }
      }
    } catch (e) {
      console.warn("Custom location search failed:", e);
    } finally {
      setIsSearchingGeocode(false);
    }
  };

  const handleSelectPresetHub = (hub: typeof POPULAR_AGRI_HUBS[0]) => {
    setFormData((prev) => ({
      ...prev,
      gpsLocation: { lat: hub.lat, lon: hub.lon },
      state: hub.state,
      district: hub.district,
      village: hub.name.split("(")[1]?.replace(")", "") || "",
      soilType: hub.soil,
      fieldName: `${hub.district} Farm Plot`,
    }));
    setGpsDetected(true);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName.trim()) {
        alert("Please enter your full name");
        return;
      }
      if (!formData.mobileNumber.trim() || formData.mobileNumber.trim().length < 10) {
        alert("Please enter a valid 10-digit mobile number");
        return;
      }
      // Auto-trigger GPS detection as farmer moves to Location step
      if (!gpsDetected) {
        detectLocation();
      }
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    const lat = formData.gpsLocation?.lat || 23.2599;
    const lon = formData.gpsLocation?.lon || 77.4126;
    const acres = formData.fieldAreaAcres || 5.0;
    const ha = Math.round((acres / 2.471) * 100) / 100;

    let primaryCrop = formData.primaryCrop;
    let cropVariety = formData.cropVariety || "High Yield Certified";

    if (isCustomCropMode && customCropInput.trim()) {
      const saved = saveCustomCrop({ name: customCropInput.trim() });
      primaryCrop = saved.name;
      cropVariety = saved.defaultVariety;
    }

    const finalProfile: FarmerProfile = {
      ...formData,
      primaryCrop,
      cropVariety,
      fieldAreaHa: ha,
      gpsLocation: { lat, lon },
    };

    saveProfile(finalProfile);
    setLanguage(finalProfile.language);
    setFieldReady(true);

    // Create real field polygon around real farmer coordinates
    const offset = 0.0025;
    const initialField: FieldRecord = {
      id: `field_${Date.now()}`,
      name: finalProfile.fieldName || `${finalProfile.fullName}'s Farm Plot`,
      crop: finalProfile.primaryCrop,
      cropVariety: finalProfile.cropVariety || "High Yield Certified",
      areaAcres: acres,
      areaHa: ha,
      center: [lat, lon],
      polygon: [
        [lat + offset, lon - offset],
        [lat + offset * 1.2, lon + offset],
        [lat - offset, lon + offset * 1.1],
        [lat - offset * 1.1, lon - offset * 0.9],
      ],
      sowingDate: finalProfile.sowingDate || "2026-06-15",
      growthStage: "R2 Flowering Stage",
      soilType: finalProfile.soilType || "Black Cotton Soil",
      irrigationType: finalProfile.irrigationType || "Rainfed + Borewell",
      color: "#10B981",
      healthScore: 94,
      pins: [],
    };

    saveFarmerField(initialField);
    setActiveField(initialField.id);

    try {
      await saveFieldToBackend({
        name: initialField.name,
        crop: initialField.crop,
        areaHa: initialField.areaHa,
        center: initialField.center,
      });
    } catch (_) {}

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col justify-between p-4 sm:p-8 relative">
      
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4 relative z-10 border-b border-slate-200 pb-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-32 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <Image src="/images/aasra_logo.png" alt="AASRA" fill className="object-contain p-0.5" priority />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-[#10B981] uppercase hidden sm:inline">
            {t.brandName} · Real Farm Registration
          </span>
        </Link>

        <Link href="/login" className="text-xs font-extrabold text-slate-600 hover:text-[#10B981]">
          {t.alreadyRegistered}
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="max-w-4xl mx-auto w-full my-8 relative z-10">
        
        {/* Step Indicator Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-8 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-center">
          {[
            { id: 1, label: "01. ABOUT YOU", icon: User },
            { id: 2, label: "02. REAL LOCATION", icon: MapPin },
            { id: 3, label: "03. CROP & FIELD", icon: Sprout },
            { id: 4, label: "04. CONFIRM", icon: Settings },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => step > s.id && setStep(s.id)}
              className={`py-3 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                step === s.id
                  ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-sm"
                  : step > s.id
                  ? "text-emerald-700 bg-emerald-50/50"
                  : "text-slate-400"
              }`}
            >
              <s.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Form Wizard Cards */}
        <div className="bg-white border border-slate-200 shadow-md rounded-3xl p-6 sm:p-10 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: ABOUT YOU */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    STEP 01 / FARMER IDENTITY
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
                    {t.tellUsAboutYourself}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Register your name and mobile number to receive localized AI crop advice and weather alerts.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      {t.fullNameLabel} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Ramesh Patel, Gurpreet Singh, Suresh Jadhav"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      {t.mobileNumberLabel} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      placeholder="e.g. +91 98260 14890"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-mono font-bold text-slate-900 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                  </div>

                  <div className="notranslate" translate="no">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        {t.preferredLanguage}
                      </label>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 uppercase">
                        12 Indian Languages
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {INDIAN_LANGUAGES.map((lang) => {
                        const isSelected = formData.language === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, language: lang.code }));
                              setLanguage(lang.code);
                            }}
                            className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col justify-between notranslate cursor-pointer ${
                              isSelected
                                ? "bg-emerald-50 border-[#10B981] text-slate-900 shadow-xs ring-2 ring-emerald-300"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                            }`}
                            translate="no"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 notranslate" translate="no">
                                {lang.native}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium notranslate mt-0.5" translate="no">
                              {lang.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNext}
                    className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t.continueToStep2}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: REAL LOCATION */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    STEP 02 / REAL FARM LOCATION &amp; GPS
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
                    Where is your farm located?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    We connect live Open-Meteo &amp; Syngenta satellite telemetry to your exact coordinates.
                  </p>
                </div>

                {/* 1-Tap Real GPS Auto-Detection */}
                <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-emerald-950 block">Auto-Detect Real Farm GPS</span>
                      {gpsDetected && (
                        <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                          ✓ GPS LOCKED
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-emerald-800 font-medium block">
                      {formData.gpsLocation
                        ? `Exact Coordinates: ${formData.gpsLocation.lat.toFixed(4)}° N, ${formData.gpsLocation.lon.toFixed(4)}° E`
                        : "Click below to read live device GPS coordinates"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={loadingGps}
                    className="px-5 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>{loadingGps ? "Detecting GPS..." : gpsDetected ? "Refresh GPS" : "Detect My Live Location"}</span>
                  </button>
                </div>

                {/* Custom Search Bar */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Or Search Any Indian City / District / Mandi:
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchDistrictQuery}
                        onChange={(e) => setSearchDistrictQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchCustomLocation()}
                        placeholder="e.g. Pune, Ludhiana, Indore, Nashik, Rajkot, Guntur, Karnal..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchCustomLocation}
                      disabled={isSearchingGeocode}
                      className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      {isSearchingGeocode ? "Searching..." : "Set Location"}
                    </button>
                  </div>
                </div>

                {/* Popular Agricultural Hubs Quick Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Popular Agricultural Regions (1-Tap Select):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {POPULAR_AGRI_HUBS.map((hub) => (
                      <button
                        key={hub.district}
                        type="button"
                        onClick={() => handleSelectPresetHub(hub)}
                        className={`p-2.5 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                          formData.district.toLowerCase() === hub.district.toLowerCase()
                            ? "bg-emerald-50 border-[#10B981] text-emerald-900 font-extrabold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="font-bold truncate">{hub.district}</div>
                        <div className="text-[10px] text-slate-500 truncate">{hub.state}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Location Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      {t.stateLabel}
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g. Madhya Pradesh"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      {t.districtLabel} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g. Bhopal"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      {t.villageLabel} / Mandi
                    </label>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      placeholder="e.g. Fanda Kalan"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBack}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{t.backBtn}</span>
                  </button>

                  <button
                    onClick={handleNext}
                    className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t.continueToStep3}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CROP & FIELD MAP */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    STEP 03 / PRIMARY CROP &amp; FIELD AREA
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
                    Crop &amp; Farm Characteristics
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Configure crop physiology parameters to calculate real heat stress resilience and Syngenta CropFit dosages.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        {t.primaryCropLabel}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCropMode(!isCustomCropMode);
                          if (!isCustomCropMode) setCustomCropInput("");
                        }}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                      >
                        {isCustomCropMode ? "← List" : "+ Custom"}
                      </button>
                    </div>

                    {isCustomCropMode ? (
                      <div>
                        <input
                          type="text"
                          required
                          value={customCropInput}
                          onChange={(e) => setCustomCropInput(e.target.value)}
                          placeholder="e.g. Dragon Fruit, Garlic, Saffron, Chia..."
                          className="w-full bg-emerald-50/60 border-2 border-emerald-500 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 block mt-1">
                          ✨ AI detects GDD &amp; MSP
                        </span>
                      </div>
                    ) : (
                      <select
                        value={formData.primaryCrop}
                        onChange={(e) => {
                          if (e.target.value === "ADD_CUSTOM") {
                            setIsCustomCropMode(true);
                          } else {
                            setFormData({ ...formData, primaryCrop: e.target.value });
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none cursor-pointer"
                      >
                        {regionalCrops.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name} {c.isCustom ? "★ (Custom)" : ""}
                          </option>
                        ))}
                        <option value="ADD_CUSTOM">+ Add Custom Crop...</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      {t.fieldAreaAcresLabel}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={formData.fieldAreaAcres || 5.0}
                      onChange={(e) => setFormData({ ...formData, fieldAreaAcres: parseFloat(e.target.value) || 5.0 })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-mono font-bold text-slate-900 focus:border-[#10B981] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      {t.sowingDateLabel}
                    </label>
                    <input
                      type="date"
                      value={formData.sowingDate || "2026-06-15"}
                      onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-mono font-bold text-slate-900 focus:border-[#10B981] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      Crop Variety / Seed
                    </label>
                    <input
                      type="text"
                      value={formData.cropVariety}
                      onChange={(e) => setFormData({ ...formData, cropVariety: e.target.value })}
                      placeholder="e.g. JS-335, Basmati 1121, BT Cotton"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      Irrigation &amp; Soil Type
                    </label>
                    <select
                      value={formData.soilType}
                      onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none cursor-pointer"
                    >
                      <option value="Black Cotton Soil">Black Cotton Soil (Deep Vertisol)</option>
                      <option value="Alluvial Loam">Alluvial Loam (Indo-Gangetic)</option>
                      <option value="Red Sandy Loam">Red Sandy Loam (Deccan / South)</option>
                      <option value="Laterite Soil">Laterite Soil (Coastal / Heavy Rain)</option>
                      <option value="Clayey Loam">Clayey Loam (High Moisture Retentive)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBack}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{t.backBtn}</span>
                  </button>

                  <button
                    onClick={handleNext}
                    className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t.continueToStep4}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: CONFIRMATION & LAUNCH */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    STEP 04 / FINAL CONFIRMATION
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
                    Review Your Real Farm Profile
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Confirm your details to generate your live GIS boundary and start AI farm monitoring.
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 font-sans text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-slate-500 font-medium">Farmer Name:</span>
                    <span className="font-black text-slate-900 text-sm">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-slate-500 font-medium">Mobile Number:</span>
                    <span className="font-bold text-slate-900 font-mono">{formData.mobileNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-slate-500 font-medium">Real Farm Location:</span>
                    <span className="font-bold text-slate-900">
                      {formData.village ? `${formData.village}, ` : ""}{formData.district || "District"}, {formData.state || "State"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-slate-500 font-medium">GPS Coordinates:</span>
                    <span className="font-mono text-emerald-800 font-bold">
                      {formData.gpsLocation ? `${formData.gpsLocation.lat.toFixed(4)}° N, ${formData.gpsLocation.lon.toFixed(4)}° E` : "Auto-Resolved Coordinates"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-slate-500 font-medium">Crop &amp; Landholding:</span>
                    <span className="font-black text-emerald-800">
                      {formData.primaryCrop?.toUpperCase()} · {formData.fieldAreaAcres} Acres ({formData.cropVariety})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Soil &amp; Irrigation:</span>
                    <span className="font-medium text-slate-700">{formData.soilType}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBack}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{t.backBtn}</span>
                  </button>

                  <button
                    onClick={handleFinish}
                    className="px-8 py-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{fieldReady ? "Generating Farm Boundary..." : "Complete Setup & Launch Dashboard"}</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-4 text-xs text-slate-500 font-mono">
        © 2026 AASRA — Syngenta Biologicals Yield Overwatch Platform
      </footer>
    </div>
  );
}
