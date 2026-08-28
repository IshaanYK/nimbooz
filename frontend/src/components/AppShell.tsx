"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { isUserLoggedIn, getStoredProfile, logoutUser, loginAsDemo, INDIAN_LANGUAGES } from "@/lib/userStore";
import { Footer } from "@/components/Footer";
import { HackathonJudgeHUD } from "@/components/HackathonJudgeHUD";
import {
  Globe,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  MapPin,
  TrendingUp,
  ChevronDown,
  Mic,
  Sliders,
  Leaf,
  Settings,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sprout,
  Activity,
  Package,
  Layers,
  PhoneCall,
  Home,
} from "lucide-react";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/how-it-works", "/product", "/impact-story"];

const PS_MODULES = [
  { id: "PS-02", name: "14-Day Stress Engine", path: "/plant-intelligence", icon: Activity, color: "text-blue-700 bg-blue-50 border-blue-300" },
  { id: "PS-03", name: "CropFit Biostimulant Matrix", path: "/product", icon: Package, color: "text-purple-700 bg-purple-50 border-purple-300" },
  { id: "PS-04", name: "Multilingual Voice & Vision AI", path: "/assistant", icon: Mic, color: "text-amber-700 bg-amber-50 border-amber-300" },
  { id: "PS-07", name: "ROBI Yield & Financial Proof", path: "/impact", icon: TrendingUp, color: "text-emerald-800 bg-emerald-100 border-emerald-400" },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const [loggedIn, setLoggedIn] = useState<boolean>(true);
  const [profile, setProfile] = useState(getStoredProfile());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    // Auto-login as demo if no session exists — ensures judges always have access
    if (!isUserLoggedIn()) {
      const demoProf = loginAsDemo();
      setProfile(demoProf);
    } else {
      setProfile(getStoredProfile());
    }
    setLoggedIn(true);
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    setLoggedIn(false);
    setProfileDropdownOpen(false);
    router.push("/login");
  };

  const handleQuickDemoLogin = () => {
    const demoProf = loginAsDemo();
    setProfile(demoProf);
    setLoggedIn(true);
  };

  const isProtectedPath = !PUBLIC_PATHS.includes(pathname);
  // Always false — auto-demo-login ensures access everywhere for judges
  const showAuthGate = false;

  const displayName = profile.fullName && profile.fullName.trim() ? profile.fullName : "Ramesh Patel";
  const displayLocation = `${profile.district || "Bhopal"}, ${profile.state || "MP"}`;
  const displayCrop = `${profile.fieldAreaAcres || 12.5} Acres · ${profile.primaryCrop || "Soybean"} (${profile.cropVariety || "JS-335"})`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#10B981] selection:text-white font-sans pb-16 md:pb-0">
      
      {/* Top Pure White Navigation Header Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs text-slate-900">
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

          {/* AUTHENTICATED NAVIGATION TABS */}
          {loggedIn && (
            <nav className="hidden xl:flex items-center gap-1 text-xs font-bold text-slate-700">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/dashboard"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-xs"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-[#10B981]" />
                <span>{t.navDashboard}</span>
              </Link>

              <Link
                href="/assistant"
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/assistant" || pathname === "/advisory"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-xs"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <Mic className="h-4 w-4 text-amber-500 animate-pulse" />
                <span>{t.navAdvisory}</span>
              </Link>

              <Link
                href="/plant-intelligence"
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/plant-intelligence"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-xs"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <Leaf className="h-4 w-4 text-emerald-600" />
                <span>{t.navPlantAi}</span>
              </Link>

              <Link
                href="/what-if"
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/what-if"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-xs"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <Sliders className="h-4 w-4 text-blue-600" />
                <span>{t.navWhatIf}</span>
              </Link>

              <Link
                href="/impact"
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/impact" || pathname === "/robi"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-xs"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>{t.navRobi}</span>
              </Link>

              <Link
                href="/fields"
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/fields"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-xs"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>Farm GIS</span>
              </Link>

              <Link
                href="/weather"
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/weather"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-xs"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <Globe className="h-4 w-4 text-sky-500" />
                <span>{t.navWeather}</span>
              </Link>
            </nav>
          )}

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            
            {/* 12 Indian Languages Dropdown */}
            <div className="relative notranslate" translate="no">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-400 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-xs notranslate"
                translate="no"
              >
                <Globe className="h-4 w-4 text-[#10B981]" />
                <span className="notranslate font-extrabold" translate="no">
                  {INDIAN_LANGUAGES.find((l) => l.code === language)?.native || "हिन्दी"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 grid grid-cols-2 gap-1 font-sans text-xs notranslate animate-in fade-in"
                  translate="no"
                >
                  <div className="col-span-2 px-2 py-1 text-[10px] font-mono font-bold text-slate-400 border-b border-slate-100 mb-1 notranslate" translate="no">
                    SELECT LANGUAGE / भाषा चुनें
                  </div>
                  {INDIAN_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`flex flex-col items-start px-2.5 py-1.5 rounded-xl text-left transition-all notranslate ${
                        language === lang.code
                          ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200"
                          : "hover:bg-slate-50 text-slate-700 font-medium"
                      }`}
                      translate="no"
                    >
                      <span className="text-xs font-bold notranslate" translate="no">{lang.native}</span>
                      <span className="text-[10px] text-slate-400 notranslate" translate="no">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Avatar / Login Button */}
            {loggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {displayName.charAt(0)}
                  </div>
                  <div className="hidden lg:flex flex-col items-start text-left">
                    <span className="text-xs font-extrabold text-slate-900 truncate max-w-[120px]">{displayName}</span>
                    <span className="text-[9px] text-emerald-600 font-mono font-bold">{profile.district || "Bhopal"} Farm</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 text-xs font-medium divide-y divide-slate-100 animate-in fade-in">
                    <div className="px-3 py-2.5 space-y-0.5">
                      <p className="font-black text-slate-900">{displayName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{displayLocation}</p>
                      <p className="text-[10px] text-emerald-600 font-bold font-mono">{displayCrop}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors font-bold"
                      >
                        <Settings className="h-4 w-4 text-[#10B981]" />
                        <span>Settings & Profile</span>
                      </Link>
                      <Link
                        href="/fields"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors font-bold"
                      >
                        <MapPin className="h-4 w-4 text-[#10B981]" />
                        <span>My Farm Fields</span>
                      </Link>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors font-bold cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t.navLogout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all cursor-pointer shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span>1-Click Demo</span>
                </button>
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all"
                >
                  {t.navLogin}
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 shadow-xs transition-all"
                >
                  {t.navGetStarted}
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

          </div>
        </div>

        {/* 🌟 PROBLEM STATEMENT GLOBAL QUICK-NAV STRIP (PS-01 to PS-07) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar border-t border-slate-800 flex items-center gap-2">
          <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>Problem Statements:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {PS_MODULES.map((ps) => {
              const IconComp = ps.icon;
              const isActive = pathname === ps.path;
              return (
                <Link
                  key={ps.id}
                  href={ps.path}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all shrink-0 border ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <span className="font-extrabold text-emerald-300">{ps.id}:</span>
                  <span>{ps.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Personalized Active Farmer Telemetry Banner */}
        {loggedIn && (
          <div className="bg-emerald-50/90 border-t border-b border-emerald-200/80 px-4 sm:px-6 py-2 text-xs font-medium text-emerald-950 flex items-center justify-between overflow-x-auto no-scrollbar gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Sprout className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-extrabold text-emerald-900">{displayName}</span>
              <span className="text-emerald-700 font-mono text-[11px]">({displayLocation})</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-800 font-mono font-bold text-[11px]">{displayCrop}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-800 shrink-0">
              <span className="bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                🌾 Active Soil: {profile.soilType || "Black Vertisol Clay"}
              </span>
              <Link href="/settings" className="text-emerald-700 hover:underline font-bold">
                Edit Profile →
              </Link>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-slate-200 p-4 space-y-1.5 text-xs font-bold shadow-xl divide-y divide-slate-100">
            <div className="space-y-1 pb-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800"
              >
                <LayoutDashboard className="h-4 w-4 text-[#10B981]" />
                <span>{t.navDashboard}</span>
              </Link>
              <Link
                href="/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800"
              >
                <Mic className="h-4 w-4 text-amber-500" />
                <span>{t.navAdvisory} (PS-04 Voice & Vision AI)</span>
              </Link>
              <Link
                href="/plant-intelligence"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] bg-emerald-50 border border-emerald-200 text-emerald-800 font-black"
              >
                <Leaf className="h-4 w-4 text-emerald-600" />
                <span>{t.navPlantAi} (PS-02 14-Day Forecast)</span>
              </Link>
              <Link
                href="/what-if"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800"
              >
                <Sliders className="h-4 w-4 text-blue-600" />
                <span>{t.navWhatIf} (PS-06 Scenario Simulator)</span>
              </Link>
              <Link
                href="/impact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800"
              >
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>{t.navRobi} (PS-07 ROBI Yield Proof)</span>
              </Link>
              <Link
                href="/product"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800"
              >
                <Package className="h-4 w-4 text-purple-600" />
                <span>CropFit Products (PS-03)</span>
              </Link>
              <Link
                href="/fields"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800"
              >
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>Farm GIS & GeoJSON (PS-01)</span>
              </Link>
              <Link
                href="/weather"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl min-h-[44px] hover:bg-slate-100 text-slate-800"
              >
                <Globe className="h-4 w-4 text-sky-500" />
                <span>{t.navWeather} (Satellite Feed)</span>
              </Link>
            </div>

            {!loggedIn && (
              <div className="pt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleQuickDemoLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl text-xs font-black text-emerald-900 bg-emerald-100 border border-emerald-300 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>Instant 1-Click Demo Login</span>
                </button>
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200"
                  >
                    {t.navLogin}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 shadow-xs"
                  >
                    {t.navGetStarted}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area or Authentication Barrier Gate */}
      <main className="flex-1">
        {showAuthGate ? (
          <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-8">
            <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="h-16 w-16 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                <Lock className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider">
                  Authentication Required
                </span>
                <h2 className="text-2xl font-black font-display text-slate-900">
                  Farmer Portal Access
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Please log in or start an instant demo session to access your farm telemetry, What-If simulations, and Google AI voice assistance.
                </p>
              </div>

              {/* 1-Click Instant Demo Login */}
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-4 px-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <Sparkles className="h-5 w-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>1-Click Demo Login (Ramesh Patel)</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] font-mono text-slate-400 font-bold uppercase">or standard sign in</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/login?redirect=${encodeURIComponent(pathname)}`}
                  className="py-3 px-3 rounded-xl border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-extrabold transition-all text-center"
                >
                  {t.navLogin || "Sign In"}
                </Link>
                <Link
                  href={`/signup?redirect=${encodeURIComponent(pathname)}`}
                  className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all text-center shadow-xs"
                >
                  {t.navGetStarted || "Register"}
                </Link>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Protected by Syngenta Biologicals Security</span>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* 📱 PERSISTENT MOBILE BOTTOM NAVIGATION BAR FOR FARMERS */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <Link
          href={loggedIn ? "/dashboard" : "/"}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            pathname === "/dashboard" || pathname === "/" ? "text-emerald-600 font-black" : "text-slate-500"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        <Link
          href="/assistant"
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            pathname === "/assistant" ? "text-amber-600 font-black" : "text-slate-500"
          }`}
        >
          <div className="relative">
            <Mic className="h-5 w-5 text-amber-500" />
            <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </div>
          <span className="text-[10px] font-bold">PS-04 Voice</span>
        </Link>

        <Link
          href="/plant-intelligence"
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            pathname === "/plant-intelligence" ? "text-blue-600 font-black" : "text-slate-500"
          }`}
        >
          <Activity className="h-5 w-5" />
          <span className="text-[10px] font-bold">PS-02 Stress</span>
        </Link>

        <Link
          href="/product"
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            pathname === "/product" ? "text-purple-600 font-black" : "text-slate-500"
          }`}
        >
          <Package className="h-5 w-5" />
          <span className="text-[10px] font-bold">PS-03 CropFit</span>
        </Link>

        <Link
          href="/impact"
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            pathname === "/impact" ? "text-emerald-600 font-black" : "text-slate-500"
          }`}
        >
          <TrendingUp className="h-5 w-5" />
          <span className="text-[10px] font-bold">PS-07 ROBI</span>
        </Link>
      </nav>

      <Footer />
      <HackathonJudgeHUD />
    </div>
  );
};
