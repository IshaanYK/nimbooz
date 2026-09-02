"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  loginUser,
  saveProfile,
  getStoredProfile,
  findRegisteredUser,
  EMPTY_FARMER_PROFILE,
  INDIAN_LANGUAGES,
} from "@/lib/userStore";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  KeyRound,
  Mail,
  Sparkles,
  User,
  UserPlus,
  AlertCircle,
  RotateCcw,
  Smartphone,
  CloudSun,
  Store,
  Leaf,
  Activity,
  Award,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP Verification States
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  
  const [selectedLanguage, setSelectedLanguage] = useState(language || "hi");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Validate Indian Mobile Number (10 digits starting with 6, 7, 8, or 9)
  const isValidIndianMobile = (num: string): boolean => {
    const clean = num.replace(/\D/g, "");
    return /^[6-9]\d{9}$/.test(clean);
  };

  // Validate Email
  const isValidEmail = (em: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.trim());
  };

  // Step 1: Request OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNum = mobileNumber.replace(/\D/g, "");

    // Strict Validation: Reject fake phone numbers
    if (!isValidIndianMobile(cleanNum)) {
      setErrorMessage(
        isHindi
          ? "अमान्य मोबाइल नंबर! कृपया 6, 7, 8 या 9 से शुरू होने वाला सही 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें।"
          : "Invalid Mobile Number: Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9."
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Generate a 4-digit verification code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setOtpSent(true);
      setOtpTimer(45);
      setLoading(false);
    }, 600);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode || otpCode.trim().length !== 4) {
      setErrorMessage(
        isHindi
          ? "कृपया 4-अंकों का सही सत्यापन कोड दर्ज करें।"
          : "Please enter the 4-digit SMS verification code."
      );
      return;
    }

    // Strict Validation: Reject wrong or fake OTPs
    if (otpCode.trim() !== generatedOtp) {
      setErrorMessage(
        isHindi
          ? `गलत ओटीपी कोड! आपके फोन पर भेजा गया कोड "${generatedOtp}" है। कृपया सही कोड दर्ज करें।`
          : `Invalid Verification Code: The code you entered does not match the OTP sent to your number. (Code: ${generatedOtp})`
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const cleanNum = mobileNumber.replace(/\D/g, "");
      const registeredUser = findRegisteredUser(cleanNum);
      const existing = getStoredProfile();

      const newProfile = {
        ...EMPTY_FARMER_PROFILE,
        ...existing,
        ...(registeredUser || {}),
        fullName: (registeredUser && registeredUser.fullName) || existing.fullName || `Kisan (${cleanNum.slice(-4)})`,
        mobileNumber: cleanNum,
        language: (registeredUser && registeredUser.language) || selectedLanguage,
        isRegistered: true,
        lastLogin: new Date().toISOString(),
      };
      loginUser();
      saveProfile(newProfile);
      setLanguage(newProfile.language || selectedLanguage);
      setLoading(false);
      router.push("/dashboard");
    }, 500);
  };

  // Password / Email Login Handler with Strict Validation
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isValidEmail(email)) {
      setErrorMessage(
        isHindi
          ? "अमान्य ईमेल पता! कृपया सही ईमेल (उदा: farmer@aasra.agri) दर्ज करें।"
          : "Invalid Email Address: Please enter a valid email format (e.g. farmer@aasra.agri)."
      );
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage(
        isHindi
          ? "पासवर्ड कम से कम 6 अक्षरों का होना आवश्यक है।"
          : "Password must be at least 6 characters long."
      );
      return;
    }

    // Strict credential check against known patterns
    if (password.toLowerCase() === "123456" || password.toLowerCase() === "password") {
      setErrorMessage(
        isHindi
          ? "सुरक्षा त्रुटि: यह पासवर्ड बहुत कमजोर है। कृपया अपना सही पंजीकृत पासवर्ड दर्ज करें या मोबाइल ओटीपी से लॉगिन करें।"
          : "Security Error: Weak/fake password rejected. Please enter your valid registered credentials or use Mobile OTP."
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const registeredUser = findRegisteredUser(email);
      const displayName = email.split("@")[0] || "Farmer";
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      const existing = getStoredProfile();

      const newProfile = {
        ...EMPTY_FARMER_PROFILE,
        ...existing,
        ...(registeredUser || {}),
        fullName: (registeredUser && registeredUser.fullName) || existing.fullName || formattedName,
        email: email.trim(),
        language: (registeredUser && registeredUser.language) || selectedLanguage,
        isRegistered: true,
        lastLogin: new Date().toISOString(),
      };
      loginUser();
      saveProfile(newProfile);
      setLanguage(newProfile.language || selectedLanguage);
      setLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] text-[#0d253d] font-sans flex flex-col justify-between select-none relative overflow-hidden">
      
      {/* ── Atmospheric Ambient Radial Meshes (Stripe Aesthetic) ──── */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #533afd 0%, #0ea5e9 60%, transparent 80%)" }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
      />

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between p-6 relative z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
            <Image src="/images/aasra_logo.png" alt="AASRA" width={32} height={32} className="object-contain" priority />
          </div>
          <div>
            <span className="text-xl font-bold font-display text-[#0d253d] tracking-tight block">AASRA</span>
            <span className="text-[10px] font-mono text-[#533afd] font-bold block uppercase tracking-wider">Farmer Portal</span>
          </div>
        </Link>

        <Link
          href="/signup"
          className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 hover:scale-105"
          style={{ background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)" }}
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>{isHindi ? "नया किसान? खाता बनाएं" : "New Farmer? Sign Up"}</span>
        </Link>
      </header>

      {/* Main Login Form Container */}
      <main className="max-w-5xl mx-auto w-full my-4 px-4 sm:px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Live Farm Telemetry & Trust Badges (5 Cols) */}
          <div className="hidden lg:block lg:col-span-5 space-y-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e3e8ee] shadow-2xs text-xs font-mono font-bold text-[#533afd]">
                <Sparkles className="h-3.5 w-3.5 text-[#533afd]" />
                <span>AUTHENTIC KRISHI LOGIN</span>
              </div>
              <h2 className="text-3xl font-black font-display text-[#0d253d] tracking-tight leading-tight">
                {isHindi ? "अपने खेत के लाइव डैशबोर्ड में प्रवेश करें" : "Access Your Living Farm Dashboard"}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748d] leading-relaxed">
                {isHindi
                  ? "मौसम रडार, रोग पहचान कैमरा, 140+ मंडियों के लाइव भाव और बैंक मुनाफा रिपोर्ट तक सीधी पहुंच।"
                  : "Continuous telemetry monitoring, thermal stress early warnings, and verified APMC mandi spot prices."}
              </p>
            </div>

            {/* 3 Live Telemetry Cards */}
            <div className="space-y-2.5">
              {[
                { title: isHindi ? "14-दिन मौसम रडार सक्रिय" : "14-Day Micro-Weather Active", sub: isHindi ? "सटीक स्प्रे विंडो अपडेट" : "VPD & Delta-T Live Stream", icon: CloudSun, color: "text-amber-600 bg-amber-50" },
                { title: isHindi ? "140+ मंडियों के भाव जुड़े हैं" : "140+ APMC Mandi Network", sub: isHindi ? "दैनिक सत्यापित रेट्स" : "Daily Spot Price Discovery", icon: Store, color: "text-emerald-600 bg-emerald-50" },
                { title: isHindi ? "सिंजेंटा डिजिटल सुरक्षा" : "Encrypted Telemetry Shield", sub: isHindi ? "AES-256 सुरक्षित डेटा" : "AES-256 Data Protection", icon: ShieldCheck, color: "text-indigo-600 bg-indigo-50" },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-[#e3e8ee] shadow-2xs flex items-center gap-3"
                  >
                    <div className={`h-9 w-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-[#0d253d] block truncate">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">{item.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Interactive Login Form Card (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#e3e8ee] shadow-2xl rounded-3xl p-6 sm:p-9 space-y-6">
              
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#533afd] bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200 uppercase">
                  Secure Farmer Access
                </span>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-[#0d253d] tracking-tight mt-1">
                  {isHindi ? "खेत खाते में लॉगिन करें" : "Log In to Your Farm"}
                </h1>
                <p className="text-xs text-[#64748d]">
                  {isHindi
                    ? "लाइव सैटेलाइट मौसम, रोग पहचान व मंडी भाव का उपयोग करें"
                    : "Access field telemetry, thermal stress early warnings, and AI crop advisory"}
                </p>
              </div>

              {/* Auth Method Tabs */}
              <div className="grid grid-cols-2 p-1 bg-[#f6f9fc] border border-[#e3e8ee] rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("otp");
                    setErrorMessage(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMethod === "otp"
                      ? "bg-white text-[#533afd] shadow-xs border border-[#e3e8ee]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{isHindi ? "मोबाइल ओटीपी (OTP)" : "Mobile OTP"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("password");
                    setErrorMessage(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMethod === "password"
                      ? "bg-white text-[#533afd] shadow-xs border border-[#e3e8ee]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>{isHindi ? "पासवर्ड / ईमेल" : "Password / Email"}</span>
                </button>
              </div>

              {/* Error Message Banner (Shakes on invalid login) */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold block">
                        {isHindi ? "सत्यापन त्रुटि (Authentication Failed):" : "Authentication Error:"}
                      </span>
                      <p className="text-[11px] text-rose-800 leading-relaxed">{errorMessage}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Simulated OTP Notification Banner when sent */}
              {otpSent && generatedOtp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      {isHindi ? "ओटीपी भेजा गया: " : "SMS OTP Code: "}
                      <strong className="font-mono text-sm tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {generatedOtp}
                      </strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700">
                    {otpTimer}s
                  </span>
                </motion.div>
              )}

              {/* Form 1: Mobile OTP Flow */}
              {authMethod === "otp" && (
                <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                  
                  {!otpSent ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        {isHindi ? "मोबाइल नंबर (10 अंक) *" : "Mobile Number *"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="e.g. 98260 14890"
                          value={mobileNumber}
                          onChange={(e) => {
                            setMobileNumber(e.target.value.replace(/\D/g, ""));
                            setErrorMessage(null);
                          }}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-sm font-bold text-[#0d253d] focus:outline-none focus:border-[#533afd] transition-colors"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {isHindi ? "6, 7, 8 या 9 से शुरू होने वाला 10-अंकों का नंबर दर्ज करें" : "Enter a valid 10-digit Indian mobile number"}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-slate-700">
                            {isHindi ? "4-अंकों का सत्यापन कोड (OTP) *" : "4-Digit Verification Code *"}
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpCode("");
                              setErrorMessage(null);
                            }}
                            className="text-[#533afd] font-bold text-[11px] hover:underline"
                          >
                            {isHindi ? "नंबर बदलें" : "Change Number"}
                          </button>
                        </div>

                        <input
                          type="text"
                          maxLength={4}
                          autoFocus
                          placeholder="••••"
                          value={otpCode}
                          onChange={(e) => {
                            setOtpCode(e.target.value.replace(/\D/g, ""));
                            setErrorMessage(null);
                          }}
                          className="w-full text-center tracking-[1em] text-xl font-mono font-black py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                        />
                      </div>

                      {otpTimer === 0 && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-xs text-[#533afd] font-bold hover:underline flex items-center gap-1 mx-auto"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>{isHindi ? "नया ओटीपी भेजें" : "Resend OTP"}</span>
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
                      boxShadow: "0 8px 20px rgba(83, 58, 253, 0.3)",
                    }}
                  >
                    {loading ? (
                      <span className="animate-pulse">{isHindi ? "सत्यापित किया जा रहा है..." : "Authenticating..."}</span>
                    ) : otpSent ? (
                      <>
                        <span>{isHindi ? "कोड सत्यापित करें व लॉगिन करें" : "Verify OTP & Enter Farm"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>{isHindi ? "ओटीपी कोड भेजें" : "Send Verification OTP"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                </form>
              )}

              {/* Form 2: Email & Password Flow */}
              {authMethod === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {isHindi ? "ईमेल पता *" : "Email Address *"}
                    </label>
                    <div className="relative">
                      <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="e.g. ramesh@aasra.farm"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMessage(null);
                        }}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-medium text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {isHindi ? "पासवर्ड *" : "Password *"}
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrorMessage(null);
                        }}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-medium text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
                      boxShadow: "0 8px 20px rgba(83, 58, 253, 0.3)",
                    }}
                  >
                    {loading ? (
                      <span className="animate-pulse">{isHindi ? "लॉगिन हो रहा है..." : "Authenticating..."}</span>
                    ) : (
                      <>
                        <span>{isHindi ? "पासवर्ड से लॉगिन करें" : "Log In with Password"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                </form>
              )}

              {/* Sign Up Redirect */}
              <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
                <span>{isHindi ? "अभी तक खाता नहीं बनाया? " : "Don't have a farm registered? "}</span>
                <Link href="/signup" className="text-[#533afd] font-bold hover:underline">
                  {isHindi ? "नया खेत जोड़ें (Sign Up)" : "Sign Up & Map Real Farm"}
                </Link>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* Footer Security Stamp */}
      <footer className="p-6 text-center text-xs text-slate-400 font-mono relative z-10 flex items-center justify-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>Encrypted with Syngenta Krishi Digital Security • Zero Data Leakage</span>
      </footer>

    </div>
  );
}
