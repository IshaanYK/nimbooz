"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { saveProfile, DEFAULT_DEMO_PROFILE, INDIAN_LANGUAGES, FarmerProfile } from "@/lib/userStore";
import { reverseGeocode } from "@/context/WeatherContext";
import { User, MapPin, Sprout, Settings, ArrowRight, ArrowLeft, CheckCircle2, Navigation, Mic, Globe } from "lucide-react";
import { RealFieldMap } from "@/components/RealFieldMap";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState<FarmerProfile>({ ...DEFAULT_DEMO_PROFILE, fullName: "" });
  const [gpsDetected, setGpsDetected] = useState<boolean>(false);
  const [loadingGps, setLoadingGps] = useState<boolean>(false);
  const [fieldReady, setFieldReady] = useState<boolean>(false);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    saveProfile(formData);
    setFieldReady(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  const detectLocation = () => {
    setLoadingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const geo = await reverseGeocode(lat, lon);

          setFormData((prev) => ({
            ...prev,
            gpsLocation: { lat, lon },
            state: geo.state || prev.state || "State",
            district: geo.district || prev.district || "Field District",
            village: geo.village || prev.village || "Local Village",
            fieldName: `${geo.district || "My"} Farm Plot`,
          }));
          setLoadingGps(false);
          setGpsDetected(true);
        },
        (err) => {
          console.warn("GPS lookup denied or unavailable:", err);
          setLoadingGps(false);
          setGpsDetected(true);
        }
      );
    } else {
      setLoadingGps(false);
      setGpsDetected(true);
    }
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
            AASRA · FARMER ONBOARDING
          </span>
        </Link>

        <Link href="/login" className="text-xs font-extrabold text-slate-600 hover:text-[#10B981]">
          Already registered? <span className="text-[#10B981] underline">Log In</span>
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="max-w-4xl mx-auto w-full my-8 relative z-10">
        
        {/* Step Indicator Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-8 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-center">
          {[
            { id: 1, label: "01. ABOUT YOU", icon: User },
            { id: 2, label: "02. LOCATION", icon: MapPin },
            { id: 3, label: "03. FIELD MAP", icon: Sprout },
            { id: 4, label: "04. PREFERENCES", icon: Settings },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`py-3 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                step === s.id
                  ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <s.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Form Wizard Cards */}
        <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 sm:p-10 space-y-6">
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
                    STEP 01 / FARMER PROFILE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
                    Tell us about yourself
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Your information helps AASRA customize farm advice and crop warnings for your region.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      Full Name / नाम
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      Mobile Number (OTP Verification)
                    </label>
                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-mono font-bold text-slate-900 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      Preferred Language / भाषा
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 outline-none cursor-pointer"
                    >
                      {INDIAN_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.native} ({lang.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNext}
                    className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Step 2</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: LOCATION */}
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
                    STEP 02 / FARM LOCATION
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
                    Where is your farm located?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    AASRA pulls real-time weather telemetry from Open-Meteo for your village coordinates.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-extrabold text-sm text-slate-900 block">Use Phone Hardware GPS</span>
                    <span className="text-xs text-slate-500 font-mono">Automatically sets exact Lat/Lon coordinates</span>
                  </div>
                  <button
                    onClick={detectLocation}
                    disabled={loadingGps}
                    className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>{loadingGps ? "Locating..." : gpsDetected ? "GPS Locked" : "Fetch Location"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      State / राज्य
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      District / जिला
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      Village / गाँव
                    </label>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
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
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleNext}
                    className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Step 3</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: FIELD MAP & CROP */}
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
                    STEP 03 / CROP & FIELD BOUNDARY
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
                    Primary Crop & Field Area
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    AASRA calculates night heat stress degradation specific to your crop variety.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      Primary Crop / मुख्य फसल
                    </label>
                    <select
                      value={formData.primaryCrop}
                      onChange={(e) => setFormData({ ...formData, primaryCrop: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none cursor-pointer"
                    >
                      <option value="soybean">Soybean (सोयाबीन)</option>
                      <option value="rice">Rice / Paddy (धान)</option>
                      <option value="cotton">Cotton (कपास)</option>
                      <option value="wheat">Wheat (गेहूँ)</option>
                      <option value="maize">Maize (मक्का)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      Field Area (Acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.fieldAreaAcres || 4.2}
                      onChange={(e) => setFormData({ ...formData, fieldAreaAcres: parseFloat(e.target.value) || 4.2 })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-mono font-bold text-slate-900 focus:border-[#10B981] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      Sowing Date / बुआई तिथि
                    </label>
                    <input
                      type="date"
                      value={formData.sowingDate || "2026-06-15"}
                      onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-mono font-bold text-slate-900 focus:border-[#10B981] outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBack}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleNext}
                    className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Step 4</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: PREFERENCES & COMPLETE */}
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
                    Review & Setup Farm Overwatch
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Confirm details to initialize your personalized AASRA AI Assistant.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Farmer Name:</span>
                    <span className="font-bold text-slate-900">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-bold text-slate-900">{formData.village}, {formData.district}, {formData.state}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Primary Crop:</span>
                    <span className="font-bold text-emerald-700">{formData.primaryCrop?.toUpperCase()} ({formData.fieldAreaAcres} Acres)</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBack}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleFinish}
                    className="px-8 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{fieldReady ? "Initializing Overwatch..." : "Complete Setup & Launch Dashboard"}</span>
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
