"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useFarm } from "@/context/FarmContext";
import { isUserLoggedIn, getStoredProfile, logoutUser, INDIAN_LANGUAGES } from "@/lib/userStore";
import { Footer } from "@/components/Footer";
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
  Layers,
  PhoneCall,
  Home,
  UserPlus,
  BookOpen,
  CloudSun,
  FileText,
  HelpCircle,
  Plus,
  CheckCircle2,
} from "lucide-react";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/how-it-works", "/product", "/impact-story", "/architecture"];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { farms, activeFarm, selectFarm, createFarm } = useFarm();

  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [profile, setProfile] = useState(getStoredProfile());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);
  const [showNewFarmModal, setShowNewFarmModal] = useState(false);

  // New farm modal state
  const [newFarmName, setNewFarmName] = useState("");
  const [newFarmDistrict, setNewFarmDistrict] = useState("");
  const [newFarmState, setNewFarmState] = useState("");
  const [newFarmCrop, setNewFarmCrop] = useState("Soybean");
  const [newFarmAcres, setNewFarmAcres] = useState(5.0);

  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const farmDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isAuthed = isUserLoggedIn();
    setLoggedIn(isAuthed);
    setProfile(getStoredProfile());
  }, [pathname]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (farmDropdownRef.current && !farmDropdownRef.current.contains(e.target as Node)) {
        setFarmDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setLoggedIn(false);
    setProfileDropdownOpen(false);
    router.push("/");
  };

  const isProtectedPath = !PUBLIC_PATHS.includes(pathname);
  const showAuthGate = !loggedIn && isProtectedPath;

  const displayName = profile.fullName && profile.fullName.trim()
    ? profile.fullName
    : (language === "hi" ? "किसान साथी" : "Farmer Friend");
  const displayLocation = activeFarm.district && activeFarm.state
    ? `${activeFarm.district}, ${activeFarm.state}`
    : activeFarm.district || (language === "hi" ? "लाइव क्षेत्र" : "Live Region");

  const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === language) || INDIAN_LANGUAGES[0];

  const isSecondaryActive = ["/what-if", "/impact", "/journal", "/architecture", "/robi"].includes(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0d253d] selection:bg-[#10B981] selection:text-white font-sans pb-20 md:pb-0">
      
      {/* ── Precision Glassmorphic Top Navbar ────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Global Farm Selector */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="relative h-8 w-28 bg-slate-50 p-1 rounded-xl border border-slate-200/80 shadow-xs group-hover:scale-102 transition-transform">
                <Image src="/images/aasra_logo.png" alt="AASRA Logo" fill className="object-contain p-0.5" priority />
              </div>
            </Link>

            {/* Global Farm & Location Selector */}
            {loggedIn && (
              <div className="relative" ref={farmDropdownRef}>
                <button
                  type="button"
                  onClick={() => setFarmDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs font-bold shadow-xs cursor-pointer border border-slate-700"
                  title="Switch Active Farm or Field"
                >
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <div className="text-left leading-tight max-w-[130px] sm:max-w-[170px] truncate">
                    <span className="block text-[11px] font-extrabold truncate">{activeFarm.name}</span>
                    <span className="block text-[9px] text-emerald-300 font-mono truncate">{activeFarm.primaryCrop} · {activeFarm.areaAcres} ac</span>
                  </div>
                  <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${farmDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {farmDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-800">
                    <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Farm / Portfolio</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{farms.length} Farm(s)</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1 space-y-1">
                      {farms.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            selectFarm(f.id);
                            setFarmDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors ${
                            f.id === activeFarm.id
                              ? "bg-emerald-50 text-emerald-950 font-extrabold border-l-4 border-emerald-600"
                              : "text-slate-700 font-medium"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{f.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-md">{f.primaryCrop}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {f.district ? `${f.district}, ${f.state}` : "GPS Location"} · <strong className="text-slate-800">{f.areaAcres} Acres</strong>
                            </div>
                          </div>
                          {f.id === activeFarm.id && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 pt-2 px-2.5">
                      <button
                        onClick={() => {
                          setFarmDropdownOpen(false);
                          setShowNewFarmModal(true);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        <span>+ Add Another Farm / Field</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Primary Clean Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-700">
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all ${
                pathname === "/dashboard"
                  ? "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 shadow-xs"
                  : "hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-600" />
              <span>{t.navDashboard || "Dashboard"}</span>
            </Link>

            <Link
              href="/plant-intelligence"
              className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all ${
                pathname === "/plant-intelligence"
                  ? "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 shadow-xs"
                  : "hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Sprout className="h-4 w-4 text-blue-600" />
              <span>{t.navPlantAi || "Plant Health AI"}</span>
            </Link>

            <Link
              href="/fields"
              className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all ${
                pathname === "/fields"
                  ? "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 shadow-xs"
                  : "hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Layers className="h-4 w-4 text-purple-600" />
              <span>{t.navFields || "Fields & Map"}</span>
            </Link>

            <Link
              href="/assistant"
              className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all ${
                pathname === "/assistant"
                  ? "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 shadow-xs"
                  : "hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Mic className="h-4 w-4 text-amber-500" />
              <span>{t.navAdvisory || "Voice AI"}</span>
            </Link>

            {/* Clean Dropdown for Secondary Tools */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen((v) => !v)}
                className={`flex items-center gap-1 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                  isSecondaryActive
                    ? "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200"
                    : "hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{language === "hi" ? "अधिक उपकरण" : "More Tools"}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {moreDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 font-medium text-xs text-slate-700 space-y-1">
                  <Link
                    href="/what-if"
                    onClick={() => setMoreDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                  >
                    <Sliders className="h-4 w-4 text-sky-600" />
                    <div>
                      <span className="font-bold block">What-If Simulator</span>
                      <span className="text-[10px] text-slate-500">Dosage vs Profit Matrix</span>
                    </div>
                  </Link>

                  <Link
                    href="/impact"
                    onClick={() => setMoreDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="font-bold block">ROBI Causal Impact</span>
                      <span className="text-[10px] text-slate-500">Yield Attribution Proof</span>
                    </div>
                  </Link>

                  <Link
                    href="/journal"
                    onClick={() => setMoreDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-amber-600" />
                    <div>
                      <span className="font-bold block">Intervention Journal</span>
                      <span className="text-[10px] text-slate-500">Farm Spray Records</span>
                    </div>
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <Link
                    href="/architecture"
                    onClick={() => setMoreDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <div>
                      <span className="font-bold block">Concept Note & Architecture</span>
                      <span className="text-[10px] text-slate-500">PS-01 to PS-07 Spec</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Tools: Language Selector + User Profile + Mobile Toggle */}
          <div className="flex items-center gap-2">
            
            {/* Language Switcher Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-bold notranslate" translate="no">{currentLangObj.native}</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 font-sans">
                  {INDIAN_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors notranslate ${
                        language === l.code ? "bg-emerald-50 text-emerald-800 font-extrabold" : "text-slate-700 font-medium"
                      }`}
                      translate="no"
                    >
                      <span>{l.native}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">({l.name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Avatar / User Info */}
            {loggedIn ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-all cursor-pointer"
                >
                  <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {displayName[0] || "K"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[120px]">{displayName}</span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">{displayLocation}</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-500 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 font-sans text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900 block">{displayName}</span>
                      <span className="text-[10px] text-slate-500 block">{profile.primaryCrop} ({profile.fieldAreaAcres || 5} Acres)</span>
                    </div>
                    <Link
                      href="/onboarding"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-500" />
                      <span>Edit Farm Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-rose-50 text-rose-600 font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signup"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 animate-in slide-in-from-top-2 text-xs font-bold text-slate-800">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700"
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-600" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/plant-intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Sprout className="h-4 w-4 text-blue-600" />
              <span>Plant Health AI</span>
            </Link>
            <Link
              href="/fields"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Layers className="h-4 w-4 text-purple-600" />
              <span>Fields & Map</span>
            </Link>
            <Link
              href="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Mic className="h-4 w-4 text-amber-500" />
              <span>Voice AI Assistant</span>
            </Link>
            <Link
              href="/what-if"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Sliders className="h-4 w-4 text-sky-600" />
              <span>What-If Simulator</span>
            </Link>
            <Link
              href="/impact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700"
            >
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span>ROBI Causal Impact</span>
            </Link>
            <Link
              href="/journal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700"
            >
              <BookOpen className="h-4 w-4 text-slate-700" />
              <span>Farm Journal</span>
            </Link>
            <Link
              href="/architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 text-indigo-700"
            >
              <FileText className="h-4 w-4" />
              <span>Concept Note & Architecture</span>
            </Link>
          </div>
        )}
      </header>

      {/* Main App Content Area */}
      <main className="flex-1 w-full">{children}</main>

      {/* ── Mobile Fixed Bottom Nav Bar (1-Tap Fast Switcher) ─────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 flex items-center justify-around shadow-lg">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname === "/dashboard" ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/plant-intelligence"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname === "/plant-intelligence" ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          <Sprout className="h-4 w-4" />
          <span>Plant AI</span>
        </Link>

        <Link
          href="/assistant"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname === "/assistant" ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          <div className="h-8 w-8 -mt-3 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Mic className="h-4 w-4" />
          </div>
          <span>Ask AI</span>
        </Link>

        <Link
          href="/fields"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname === "/fields" ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Map</span>
        </Link>

        <Link
          href="/what-if"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname === "/what-if" ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Simulate</span>
        </Link>
      </div>

      {/* ── Add New Farm Portfolio Modal ──────────────────────── */}
      {showNewFarmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                  Farm Portfolio
                </span>
                <h3 className="text-lg font-black text-slate-900 font-display mt-0.5">
                  {language === "hi" ? "नया खेत / फार्म जोड़ें" : "Add New Farm Plot"}
                </h3>
              </div>
              <button
                onClick={() => setShowNewFarmModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createFarm({
                  name: newFarmName.trim() || `Farm Plot #${farms.length + 1}`,
                  district: newFarmDistrict.trim() || activeFarm.district || "Indore",
                  state: newFarmState.trim() || activeFarm.state || "Madhya Pradesh",
                  primaryCrop: newFarmCrop,
                  areaAcres: Number(newFarmAcres) || 5.0,
                });
                setShowNewFarmModal(false);
                setNewFarmName("");
                setNewFarmDistrict("");
                setNewFarmState("");
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Farm Name</label>
                <input
                  type="text"
                  required
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                  placeholder="e.g. South Canal Soybean Plot"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">District / City</label>
                  <input
                    type="text"
                    required
                    value={newFarmDistrict}
                    onChange={(e) => setNewFarmDistrict(e.target.value)}
                    placeholder="e.g. Indore, Pune, Karnal"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newFarmState}
                    onChange={(e) => setNewFarmState(e.target.value)}
                    placeholder="e.g. Madhya Pradesh"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Crop</label>
                  <select
                    value={newFarmCrop}
                    onChange={(e) => setNewFarmCrop(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 cursor-pointer"
                  >
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Cotton">Cotton (कपास)</option>
                    <option value="Wheat">Wheat (गेहूँ)</option>
                    <option value="Rice / Paddy">Rice / Paddy (धान)</option>
                    <option value="Maize">Maize (मक्का)</option>
                    <option value="Mustard">Mustard (सरसों)</option>
                    <option value="Gram">Gram / Chana (चना)</option>
                    <option value="Sugarcane">Sugarcane (गन्ना)</option>
                    <option value="Tomato">Tomato (टमाटर)</option>
                    <option value="Chilli">Chilli (मिर्च)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={newFarmAcres}
                    onChange={(e) => setNewFarmAcres(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFarmModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow transition-all cursor-pointer"
                >
                  Save &amp; Switch Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
