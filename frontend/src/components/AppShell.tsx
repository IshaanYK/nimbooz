"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { isUserLoggedIn, getStoredProfile, logoutUser, INDIAN_LANGUAGES } from "@/lib/userStore";
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
  UserPlus,
} from "lucide-react";

const PUBLIC_PATHS = ["/login", "/signup", "/how-it-works", "/product", "/impact-story"];

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

  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [profile, setProfile] = useState(getStoredProfile());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    const isAuthed = isUserLoggedIn();
    setLoggedIn(isAuthed);
    setProfile(getStoredProfile());
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    setLoggedIn(false);
    setProfileDropdownOpen(false);
    router.push("/signup");
  };

  const isProtectedPath = !PUBLIC_PATHS.includes(pathname);
  const showAuthGate = !loggedIn && isProtectedPath;

  const displayName = profile.fullName && profile.fullName.trim() ? profile.fullName : "Farmer Profile";
  const displayLocation = profile.village && profile.district
    ? `${profile.village}, ${profile.district}`
    : profile.district
    ? `${profile.district}, ${profile.state || "India"}`
    : "Live GPS Location";
  const displayCrop = profile.fieldAreaAcres
    ? `${profile.fieldAreaAcres} Acres · ${profile.primaryCrop || "Crop"}`
    : `${profile.primaryCrop || "Crop"}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#10B981] selection:text-white font-sans pb-16 md:pb-0">
      
      {/* Top Pure White Navigation Header Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <Link href={loggedIn ? "/dashboard" : "/signup"} className="flex items-center gap-2.5 group cursor-pointer shrink-0">
            <div className="relative h-8 w-28 bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-xs group-hover:scale-105 transition-transform">
              <Image src="/images/aasra_logo.png" alt="AASRA Logo" fill className="object-contain p-0.5" priority />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-black tracking-widest text-[#10B981] uppercase font-mono">आसरा · AASRA</span>
              <span className="text-[9px] text-slate-500 font-bold tracking-wider">ASK. ACT. PROVE.</span>
            </div>
          </Link>

          {/* AUTHENTICATED NAVIGATION TABS */}
          {loggedIn ? (
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
                <Activity className="h-4 w-4 text-blue-600" />
                <span>Plant Health AI</span>
              </Link>

              <Link
                href="/what-if"
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/what-if"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-xs"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <Sliders className="h-4 w-4 text-sky-600" />
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
                  pathname.startsWith("/fields")
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-xs"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <Layers className="h-4 w-4 text-purple-600" />
                <span>{t.navFields || "My Fields"}</span>
              </Link>

              <Link
                href="/weather"
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                  pathname === "/weather"
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-xs"
                    : "hover:text-[#10B981] hover:bg-slate-100"
                }`}
              >
                <MapPin className="h-4 w-4 text-rose-500" />
                <span>{t.navWeather}</span>
              </Link>
            </nav>
          ) : (
            <nav className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700">
              <Link href="/product" className="py-2 px-3 rounded-xl hover:bg-slate-100 hover:text-emerald-700 transition-colors">
                Product Architecture
              </Link>
              <Link href="/how-it-works" className="py-2 px-3 rounded-xl hover:bg-slate-100 hover:text-emerald-700 transition-colors">
                How It Works
              </Link>
            </nav>
          )}

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs notranslate"
                translate="no"
              >
                <Globe className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="notranslate font-extrabold" translate="no">
                  {INDIAN_LANGUAGES.find((l) => l.code === language)?.native || "हिन्दी"}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 notranslate" translate="no">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    Select Language ({INDIAN_LANGUAGES.length})
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {INDIAN_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors notranslate ${
                          language === lang.code
                            ? "bg-emerald-50 text-emerald-800 font-black"
                            : "text-slate-700 hover:bg-slate-50 font-medium"
                        }`}
                        translate="no"
                      >
                        <span className="font-bold">{lang.native}</span>
                        <span className="text-[10px] text-slate-400">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown or Login / Sign-up CTA Buttons */}
            {loggedIn && profile.fullName ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 py-1 px-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col text-left leading-none pr-1">
                    <span className="text-xs font-black text-slate-900 truncate max-w-[110px]">{displayName}</span>
                    <span className="text-[10px] font-mono text-emerald-800 truncate max-w-[110px]">{displayLocation}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                        {profile.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-slate-900 truncate">{displayName}</h4>
                          <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">VERIFIED</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{profile.mobileNumber || "Farmer Registered"}</p>
                        <p className="text-[10px] text-emerald-700 font-bold truncate">📍 {displayLocation}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs font-bold text-slate-700">
                      <Link
                        href="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-slate-500" />
                        <span>Farm Profile &amp; Location Settings</span>
                      </Link>

                      <Link
                        href="/fields"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <Layers className="h-4 w-4 text-slate-500" />
                        <span>My Farm Plots ({displayCrop})</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black transition-colors cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{t.navLogout || "Sign Out"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all"
                >
                  {t.navLogin}
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 shadow-xs transition-all flex items-center gap-1"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{t.navGetStarted}</span>
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

        {/* Problem Statement Quick-Nav Strip */}
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
                  <IconComp className="h-3 w-3" />
                  <span>{ps.id}: {ps.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-slate-200 p-4 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-xl">
            {loggedIn && profile.fullName ? (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xs text-slate-900">{displayName}</div>
                  <div className="text-[10px] text-emerald-800 font-mono">📍 {displayLocation}</div>
                </div>
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="text-xs text-emerald-700 font-bold hover:underline">
                  Settings
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pb-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="p-2.5 text-center text-xs font-bold border border-slate-200 rounded-xl">
                  {t.navLogin}
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="p-2.5 text-center text-xs font-bold bg-[#10B981] text-white rounded-xl">
                  {t.navGetStarted}
                </Link>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-[#10B981]" /> Dashboard
              </Link>
              <Link href="/assistant" onClick={() => setMobileMenuOpen(false)} className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2">
                <Mic className="h-4 w-4 text-amber-500" /> AI Voice &amp; Vision
              </Link>
              <Link href="/plant-intelligence" onClick={() => setMobileMenuOpen(false)} className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" /> Plant Health AI
              </Link>
              <Link href="/what-if" onClick={() => setMobileMenuOpen(false)} className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2">
                <Sliders className="h-4 w-4 text-sky-600" /> What-If
              </Link>
              <Link href="/impact" onClick={() => setMobileMenuOpen(false)} className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" /> ROBI Impact
              </Link>
              <Link href="/fields" onClick={() => setMobileMenuOpen(false)} className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-600" /> My Fields
              </Link>
              <Link href="/weather" onClick={() => setMobileMenuOpen(false)} className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-500" /> Weather
              </Link>
              <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-600" /> Settings
              </Link>
            </div>

            {loggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full p-2.5 text-center text-xs font-bold text-rose-700 bg-rose-50 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
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
                  Registration Required
                </span>
                <h2 className="text-2xl font-black font-display text-slate-900">
                  Register Your Real Farm
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Please sign up with your real name, crop, and location to access live satellite weather telemetry, thermal stress early warnings, and AI recommendations.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/signup"
                  className="w-full py-4 px-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Create Real Farmer Account</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Already Registered? Sign In</span>
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

      <Footer />
      <HackathonJudgeHUD />
    </div>
  );
};
