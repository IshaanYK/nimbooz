"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { saveProfile, EMPTY_FARMER_PROFILE, INDIAN_LANGUAGES, FarmerProfile } from "@/lib/userStore";
import { saveFieldToBackend } from "@/lib/api";
import { reverseGeocode } from "@/context/WeatherContext";
import { User, MapPin, Sprout, Settings, ArrowRight, ArrowLeft, CheckCircle2, Navigation, Mic, Globe } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function SignupPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [step, setStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState<FarmerProfile>({ ...EMPTY_FARMER_PROFILE, language: language || "hi", fullName: "" });
  const [gpsDetected, setGpsDetected] = useState<boolean>(false);
  const [loadingGps, setLoadingGps] = useState<boolean>(false);
  const [fieldReady, setFieldReady] = useState<boolean>(false);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    saveProfile(formData);
    setLanguage(formData.language);
    setFieldReady(true);
    try {
      await saveFieldToBackend({
        name: formData.fieldName || `${formData.fullName}'s Farm`,
        crop: formData.primaryCrop,
        areaHa: formData.fieldAreaHa || 2.5,
        center: [formData.gpsLocation?.lat || 23.2599, formData.gpsLocation?.lon || 77.4126],
      });
    } catch (_) {}
    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
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
            {t.brandName} · {t.btnStartFarm}
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
                    {t.tellUsAboutYourself}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t.aboutYouDesc}
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      {t.fullNameLabel}
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
                      {t.mobileNumberLabel}
                    </label>
                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      placeholder="+91 98765 43210"
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
                    {t.whereIsFarmLocated}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t.locationDesc}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-extrabold text-sm text-slate-900 block">{t.usePhoneGps}</span>
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
                      {t.stateLabel}
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
                      {t.districtLabel}
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
                      {t.villageLabel}
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
                    {t.primaryCropFieldArea}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t.primaryCropDesc}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      {t.primaryCropLabel}
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
                      {t.fieldAreaAcresLabel}
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
                    {t.reviewSetupFarm}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {t.reviewDesc}
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
                    <span>{t.backBtn}</span>
                  </button>

                  <button
                    onClick={handleFinish}
                    className="px-8 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{fieldReady ? "Initializing Overwatch..." : t.completeSetupLaunch}</span>
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
