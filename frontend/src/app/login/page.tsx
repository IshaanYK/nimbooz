"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loginUser, saveProfile, DEFAULT_DEMO_PROFILE, INDIAN_LANGUAGES } from "@/lib/userStore";
import { Phone, ArrowRight, ShieldCheck, Globe, CloudSun, Leaf, Sparkles, CheckCircle2, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("hi");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      loginUser();
      saveProfile({ ...DEFAULT_DEMO_PROFILE, mobileNumber, language: selectedLanguage });
      setLoading(false);
      router.push("/dashboard");
    }, 800);
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      loginUser();
      saveProfile(DEFAULT_DEMO_PROFILE);
      setLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#063B2D] text-white font-sans overflow-hidden">
      {/* LEFT 55% HERO BRAND SIDE (Desktop Only / Top on Mobile) */}
      <div className="relative lg:col-span-7 flex flex-col justify-between p-8 sm:p-12 min-h-[380px] lg:min-h-screen overflow-hidden">
        {/* Background Image with Dark Forest Gradient */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/aasra_hero_farm.png"
            alt="Lush green crop field"
            fill
            priority
            className="object-cover object-center brightness-75 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#063B2D] via-[#063B2D]/80 to-transparent" />
        </div>

        {/* Top Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-36 bg-white/95 p-1.5 rounded-xl border border-[#20C98A]/30 shadow-lg">
              <Image src="/images/aasra_logo.png" alt="AASRA" fill className="object-contain p-1" priority />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-black tracking-widest text-[#20C98A] uppercase font-mono">आसरा</span>
              <span className="text-[10px] text-emerald-200 font-extrabold tracking-wider font-mono">ASK. ACT. PROVE.</span>
            </div>
          </Link>

          <span className="px-3 py-1 rounded-full bg-[#00A878]/30 border border-[#20C98A]/30 text-[#20C98A] text-xs font-mono font-bold">
            PS-04 & PS-07 ENGINE
          </span>
        </div>

        {/* Center Statement & Animated Weather Widget */}
        <div className="relative z-10 max-w-xl space-y-6 my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-mono font-bold border border-white/15">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" /> AASRA INTELLIGENT PLATFORM
            </span>

            <h1 className="text-3xl sm:text-5xl font-black font-display text-white leading-tight">
              Your field's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20C98A] via-[#00A878] to-amber-300">
                intelligent companion.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
              Log in to access your field's live crop stage, thermal risk forecasts, multilingual advisory, and return on biological investment tracking.
            </p>
          </motion.div>

          {/* Animated Mini Field / Weather Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#10241F]/80 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/30 shadow-2xl max-w-md space-y-3 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CloudSun className="h-4 w-4 text-amber-300" />
                <span>Bhopal Soybean Field</span>
              </div>
              <span className="text-[10px] text-slate-400">R2 Flowering</span>
            </div>

            <div className="flex items-center justify-between text-slate-200">
              <span>Heat Risk (3 Days):</span>
              <span className="font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30">78% ALERT</span>
            </div>
            <div className="flex items-center justify-between text-slate-200">
              <span>Modelled Biological Gain:</span>
              <span className="font-bold text-[#20C98A]">+0.60 q/acre</span>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400 font-mono">
          © 2026 AASRA AI • Syngenta India Hackathon
        </div>
      </div>

      {/* RIGHT 45% AUTHENTICATION PANEL */}
      <div className="lg:col-span-5 bg-[#F7F6EF] text-[#10241F] p-8 sm:p-12 flex flex-col justify-center space-y-8 font-sans border-l border-emerald-500/20 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-md mx-auto w-full"
        >
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-black font-display text-[#10241F]">Welcome back.</h2>
            <p className="text-xs sm:text-sm text-slate-600">Enter your registered mobile number to continue.</p>
          </div>

          {/* Quick Demo One-Click Login Button */}
          <div className="bg-[#DDF7EC] p-4 rounded-2xl border border-[#00A878]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#063B2D]">HACKATHON DEMO MODE</span>
              <Sparkles className="h-4 w-4 text-[#00A878]" />
            </div>
            <p className="text-xs text-slate-700">Skip SMS verification and explore Kisan Brother's pre-loaded demo soybean farm immediately.</p>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#063B2D] hover:bg-[#00A878] text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 text-amber-300" />
              <span>{loading ? "Logging in..." : "Explore Demo Farm (One-Click Login)"}</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="flex-shrink mx-4 text-xs font-mono text-slate-400">OR LOGIN VIA MOBILE OTP</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[#00A878]" /> Preferred Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#00A878] outline-none cursor-pointer"
            >
              {INDIAN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* Form */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#00A878]" /> Mobile Number
                </label>
                <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#00A878] transition-all">
                  <span className="text-xs font-mono font-bold text-slate-500 mr-2">+91</span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none"
                    maxLength={10}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#00A878] hover:bg-[#063B2D] text-white font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{loading ? "Sending OTP..." : "Get OTP Verification Code"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#00A878]" /> Enter 4-Digit OTP Code
                </label>
                <input
                  type="text"
                  placeholder="1234"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:ring-2 focus:ring-[#00A878] outline-none"
                  maxLength={4}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#00A878] hover:bg-[#063B2D] text-white font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? "Verifying..." : "Verify & Continue"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Signup Link */}
          <div className="text-center pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-600">New to AASRA? </span>
            <Link href="/signup" className="text-xs font-black text-[#00A878] hover:underline">
              Create account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
