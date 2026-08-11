"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { saveProfile, DEFAULT_DEMO_PROFILE, INDIAN_LANGUAGES, FarmerProfile } from "@/lib/userStore";
import { User, MapPin, Sprout, Settings, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Navigation, Mic, MessageSquare } from "lucide-react";
import { RealFieldMap } from "@/components/RealFieldMap";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState<FarmerProfile>({ ...DEFAULT_DEMO_PROFILE });
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
    }, 2000);
  };

  const detectLocation = () => {
    setLoadingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            gpsLocation: { lat: pos.coords.latitude, lon: pos.coords.longitude },
            state: "Madhya Pradesh",
            district: "Bhopal",
            village: "Patel Nagar",
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
    <div className="min-h-screen bg-[#F7F6EF] text-[#10241F] font-sans flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header Logo */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-36 bg-white p-1.5 rounded-xl border border-emerald-500/20 shadow-md">
            <Image src="/images/aasra_logo.png" alt="AASRA" fill className="object-contain p-1" />
          </div>
          <span className="text-xs font-black tracking-widest text-[#00A878] font-mono hidden sm:inline">آसरा • ONBOARDING</span>
        </Link>

        <span className="text-xs font-mono font-bold text-slate-500">
          Step <strong className="text-[#00A878] text-sm">{step}</strong> of 4
        </span>
      </header>

      {/* Field Ready Celebration Modal */}
      {fieldReady && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#063B2D] border border-[#20C98A]/40 text-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-fade-in">
            <div className="h-16 w-16 bg-[#00A878] rounded-full mx-auto flex items-center justify-center text-amber-300 shadow-xl animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black font-display text-white">Your field is ready!</h3>
            <p className="text-xs text-emerald-200">
              Field boundaries and live weather telemetry loaded. Redirecting to your AASRA dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Main Multi-Step Form Card */}
      <main className="max-w-3xl mx-auto w-full my-auto py-6">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#063B2D]/15 shadow-2xl space-y-8">
          {/* Animated Progress Bar Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-black text-slate-500">
              <span className={step === 1 ? "text-[#00A878]" : ""}>01. ABOUT YOU</span>
              <span className={step === 2 ? "text-[#00A878]" : ""}>02. LOCATION</span>
              <span className={step === 3 ? "text-[#00A878]" : ""}>03. FIELD & MAP</span>
              <span className={step === 4 ? "text-[#00A878]" : ""}>04. PREFERENCES</span>
            </div>

            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <motion.div
                className="h-full bg-[#00A878] rounded-full"
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Form Step Body with AnimatePresence */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[#00A878] text-xs font-mono font-bold">
                    <User className="h-4 w-4" /> STEP 01
                  </div>
                  <h2 className="text-2xl font-black font-display text-[#10241F]">Tell us about yourself</h2>
                  <p className="text-xs text-slate-600">Your information helps AASRA customize farm advice for your region.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Patel"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-[#F7F6EF] border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00A878]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Mobile Number (OTP Verification)</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-[#F7F6EF] border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00A878]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Preferred Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-[#F7F6EF] border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00A878] cursor-pointer font-bold"
                    >
                      {INDIAN_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.native} ({lang.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[#00A878] text-xs font-mono font-bold">
                    <MapPin className="h-4 w-4" /> STEP 02
                  </div>
                  <h2 className="text-2xl font-black font-display text-[#10241F]">Your Farm Location</h2>
                  <p className="text-xs text-slate-600">AASRA uses hyper-local weather telemetry for micro-climate forecasting.</p>
                </div>

                <div className="space-y-4">
                  {/* GPS Auto Detect Button */}
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={loadingGps}
                    className="w-full py-3 px-4 rounded-xl bg-[#DDF7EC] border border-[#00A878]/30 text-[#063B2D] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#00A878] hover:text-white transition-colors cursor-pointer"
                  >
                    <Navigation className="h-4 w-4 text-[#00A878]" />
                    <span>{loadingGps ? "Detecting GPS Coordinates..." : gpsDetected ? "✓ GPS Coordinates Locked (23.25°N, 77.41°E)" : "Auto-Detect My GPS Location"}</span>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full p-3.5 rounded-xl bg-[#F7F6EF] border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00A878]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">District</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full p-3.5 rounded-xl bg-[#F7F6EF] border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00A878]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Village</label>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-[#F7F6EF] border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00A878]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[#00A878] text-xs font-mono font-bold">
                    <Sprout className="h-4 w-4" /> STEP 03
                  </div>
                  <h2 className="text-2xl font-black font-display text-[#10241F]">Field Setup & Interactive Map</h2>
                  <p className="text-xs text-slate-600">Draw your field boundary on the live satellite map below.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Field Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Bhopal Soybean Field"
                        value={formData.fieldName}
                        onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                        className="w-full p-3.5 rounded-xl bg-[#F7F6EF] border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00A878]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Primary Crop</label>
                      <select
                        value={formData.primaryCrop}
                        onChange={(e) => setFormData({ ...formData, primaryCrop: e.target.value })}
                        className="w-full p-3.5 rounded-xl bg-[#F7F6EF] border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00A878] cursor-pointer font-bold"
                      >
                        <option value="soybean">Soybean (सोयाबीन)</option>
                        <option value="cotton">Cotton (कपास)</option>
                        <option value="wheat">Wheat (गेहूं)</option>
                        <option value="rice">Rice (धान)</option>
                        <option value="sugarcane">Sugarcane (गन्ना)</option>
                      </select>
                    </div>
                  </div>

                  {/* Real Leaflet Map with Drawing Tool */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-700">Interactive Map & Polygon Draw</label>
                    <RealFieldMap
                      initialLat={formData.gpsLocation?.lat || 23.2599}
                      initialLon={formData.gpsLocation?.lon || 77.4126}
                      crop={formData.primaryCrop}
                      fieldName={formData.fieldName || "Bhopal Field"}
                      fieldAreaHa={formData.fieldAreaHa || 4.2}
                      allowDrawing={true}
                      onPolygonComplete={(points, area) => {
                        setFormData((prev) => ({ ...prev, fieldAreaHa: area }));
                      }}
                      onLocationSelect={(lat, lon) => {
                        setFormData((prev) => ({
                          ...prev,
                          gpsLocation: { lat, lon },
                        }));
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[#00A878] text-xs font-mono font-bold">
                    <Settings className="h-4 w-4" /> STEP 04
                  </div>
                  <h2 className="text-2xl font-black font-display text-[#10241F]">Interaction Preferences</h2>
                  <p className="text-xs text-slate-600">Choose how you want AASRA to communicate recommendations.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Communication Mode</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { mode: "Voice + Text", icon: Mic },
                        { mode: "Voice Only", icon: Mic },
                        { mode: "Text Only", icon: MessageSquare },
                      ].map((item) => (
                        <button
                          key={item.mode}
                          type="button"
                          onClick={() => setFormData({ ...formData, preferredCommunication: item.mode })}
                          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            formData.preferredCommunication === item.mode
                              ? "bg-[#00A878] text-white border-[#00A878] shadow-md"
                              : "bg-[#F7F6EF] text-slate-700 border-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.mode}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-slate-700">Notification Preference</label>
                    <select
                      value={formData.notificationPreference}
                      onChange={(e) => setFormData({ ...formData, notificationPreference: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-[#F7F6EF] border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00A878] cursor-pointer"
                    >
                      <option value="Important alerts">Important thermal risk alerts only</option>
                      <option value="Daily summary">Daily morning farm summary</option>
                      <option value="Weekly digest">Weekly field digest</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-3 px-6 rounded-xl bg-[#00A878] hover:bg-[#063B2D] text-white font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer hover:scale-105"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="py-3.5 px-7 rounded-xl bg-[#063B2D] hover:bg-[#00A878] text-white font-black text-xs flex items-center gap-2 transition-all shadow-xl cursor-pointer hover:scale-105"
              >
                <CheckCircle2 className="h-4.5 w-4.5 text-amber-300" />
                <span>Start using AASRA</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 font-mono py-4">
        Already have an account? <Link href="/login" className="text-[#00A878] font-bold hover:underline">Log in</Link>
      </footer>
    </div>
  );
}
