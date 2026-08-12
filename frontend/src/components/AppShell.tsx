"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { isUserLoggedIn, getStoredProfile, logoutUser, INDIAN_LANGUAGES } from "@/lib/userStore";
import { Footer } from "@/components/Footer";
import {
  Globe, User, LogOut, Menu, X, Sparkles, LayoutDashboard, MapPin, BookOpen, TrendingUp, ChevronDown, Mic, Sliders
} from "lucide-react";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [profile, setProfile] = useState(getStoredProfile());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(isUserLoggedIn());
    setProfile(getStoredProfile());
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    setLoggedIn(false);
    setProfileDropdownOpen(false);
    router.push("/");
  };

  const displayName = profile.fullName && profile.fullName !== "Kisan Brother" ? profile.fullName : "Ramesh Patel";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#10B981] selection:text-white font-sans">
      {/* Top Stripe Pure White Navigation Header Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <Link href={loggedIn ? "/dashboard" : "/"} className="flex items-center gap-2.5 group cursor-pointer shrink-0">
            <div className="relative h-8 w-28 bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-xs group-hover:scale-105 transition-transform">
              <Image src="/images/aasra_logo.png" alt="AASRA Logo" fill className="object-contain p-0.5" priority />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-black tracking-widest text-[#10B981] uppercase font-mono">आसरा · AASRA</span>
              <span className="text-[9px] text-slate-500 font-bold tracking-wider">ASK. ACT. PROVE.</span>
            </div>
          </Link>

          {/* AUTHENTICATED STRIPE NAVIGATION TABS (Single-Line, High Contrast, 0 Emojis) */}
          {loggedIn && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-700">
              
              <Link
                href="/fields"
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/fields" || pathname === "/dashboard"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <MapPin className="h-4 w-4 text-[#10B981]" />
                <span>{language === "hi" ? "मेरा खेत व नक्शा" : "My Farm"}</span>
              </Link>

              <Link
                href="/assistant"
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/assistant" || pathname === "/advisory"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <Mic className="h-4 w-4 text-amber-500" />
                <span>{language === "hi" ? "आसरा से पूछें" : "Ask AASRA AI"}</span>
              </Link>

              <Link
                href="/impact"
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/impact" || pathname === "/robi"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>{language === "hi" ? "कमाई व बचत" : "Income & Savings"}</span>
              </Link>

              <Link
                href="/what-if"
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/what-if"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <Sliders className="h-4 w-4 text-blue-600" />
                <span>{language === "hi" ? "परिणाम सिमुलेटर" : "What-If Simulator"}</span>
              </Link>

            </nav>
          )}

          {/* Right Action Controls: Language Dropdown & Profile Badge */}
          <div className="flex items-center gap-3">
            
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-[#10B981]" />
                <span className="uppercase font-mono">{language}</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 text-xs font-medium">
                  <div className="text-[10px] font-mono text-[#10B981] uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-100">
                    🌐 Select Language / भाषा चुनें
                  </div>
                  <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto pr-1">
                    {INDIAN_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setLangDropdownOpen(false);
                        }}
                        className={`text-left px-2.5 py-2 rounded-xl transition-all flex flex-col gap-0.5 ${
                          language === lang.code
                            ? "bg-[#10B981] text-white font-bold shadow-md"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="font-bold text-[11px]">{lang.native}</span>
                        <span className="text-[9px] opacity-70">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated Profile Menu (No Kisan Brother!) */}
            {loggedIn && (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-900 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <div className="h-6 w-6 rounded-full bg-[#10B981] flex items-center justify-center text-white text-[10px] font-black">
                    {displayName.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-bold">{displayName}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <span className="font-bold text-slate-900 block">{displayName}</span>
                      <span className="text-[10px] text-slate-500 block">Field Manager · Bhopal</span>
                    </div>

                    <Link
                      href="/signup"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                    >
                      <User className="h-4 w-4 text-[#10B981]" /> Edit Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer font-bold"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Trigger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-1.5 text-xs font-bold shadow-xl divide-y divide-slate-100">
            <div className="space-y-1 pb-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-[#10B981]" />
                <span>{language === "hi" ? "ओवरवॉच डैशबोर्ड" : "Dashboard Overview"}</span>
              </Link>
              <Link
                href="/fields"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800 transition-colors"
              >
                <MapPin className="h-4 w-4 text-[#10B981]" />
                <span>{language === "hi" ? "मेरा खेत व नक्शा" : "My Farm & Map"}</span>
              </Link>
              <Link
                href="/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800 transition-colors"
              >
                <Mic className="h-4 w-4 text-amber-500" />
                <span>{language === "hi" ? "आसरा से पूछें" : "Ask AASRA Voice & Leaf AI"}</span>
              </Link>
              <Link
                href="/impact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800 transition-colors"
              >
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>{language === "hi" ? "कमाई व बचत" : "ROBI Yield & Savings"}</span>
              </Link>
              <Link
                href="/what-if"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800 transition-colors"
              >
                <Sliders className="h-4 w-4 text-blue-600" />
                <span>{language === "hi" ? "परिणाम सिमुलेटर" : "What-If Simulator"}</span>
              </Link>
              <Link
                href="/journal"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800 transition-colors"
              >
                <BookOpen className="h-4 w-4 text-purple-600" />
                <span>{language === "hi" ? "हस्तक्षेप डायरी" : "Intervention Journal"}</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
};
