"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
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
  BookOpen,
  TrendingUp,
  ChevronDown,
  Home,
  Mic,
  Activity,
  Sliders,
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6EF] text-[#10241F] selection:bg-[#00A878] selection:text-white font-sans">
      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#063B2D]/95 backdrop-blur-md border-b border-[#20C98A]/20 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo Brand */}
          <Link href={loggedIn ? "/dashboard" : "/"} className="flex items-center gap-3 group cursor-pointer">
            <div className="relative h-9 w-32 bg-white/95 p-1.5 rounded-xl border border-[#20C98A]/30 shadow-md group-hover:scale-105 transition-transform">
              <Image src="/images/aasra_logo.png" alt="AASRA Logo" fill className="object-contain p-1" priority />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-black tracking-widest text-[#20C98A] uppercase font-mono">आसरा</span>
              <span className="text-[10px] text-emerald-200 font-extrabold tracking-wider font-mono">ASK. ACT. PROVE.</span>
            </div>
          </Link>

          {/* PUBLIC NAVIGATION */}
          {!loggedIn && (
            <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-200">
              <Link href="/product" className={`hover:text-[#20C98A] transition-colors ${pathname === "/product" ? "text-[#20C98A] font-black" : ""}`}>
                Product
              </Link>
              <Link href="/how-it-works" className={`hover:text-[#20C98A] transition-colors ${pathname === "/how-it-works" ? "text-[#20C98A] font-black" : ""}`}>
                How it Works
              </Link>
              <Link href="/impact-story" className={`hover:text-[#20C98A] transition-colors ${pathname === "/impact-story" ? "text-[#20C98A] font-black" : ""}`}>
                Impact
              </Link>
              <Link href="/#for-farmers" className="hover:text-[#20C98A] transition-colors">
                For Farmers
              </Link>
              <Link href="/#about" className="hover:text-[#20C98A] transition-colors">
                About
              </Link>
            </nav>
          )}

          {/* AUTHENTICATED NAVIGATION */}
          {loggedIn && (
            <nav className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-200">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${
                  pathname === "/dashboard" ? "bg-[#00A878] text-white font-black shadow-md" : "hover:text-[#20C98A] hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/fields"
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${
                  pathname.startsWith("/fields") ? "bg-[#00A878] text-white font-black shadow-md" : "hover:text-[#20C98A] hover:bg-white/5"
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>My Fields</span>
              </Link>

              <Link
                href="/assistant"
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${
                  pathname === "/assistant" || pathname === "/advisory" ? "bg-[#00A878] text-white font-black shadow-md" : "hover:text-[#20C98A] hover:bg-white/5"
                }`}
              >
                <Mic className="h-4 w-4 text-amber-300" />
                <span>Ask AASRA</span>
              </Link>

              <Link
                href="/journal"
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${
                  pathname === "/journal" ? "bg-[#00A878] text-white font-black shadow-md" : "hover:text-[#20C98A] hover:bg-white/5"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Journal</span>
              </Link>

              <Link
                href="/impact"
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${
                  pathname === "/impact" || pathname === "/robi" ? "bg-[#00A878] text-white font-black shadow-md" : "hover:text-[#20C98A] hover:bg-white/5"
                }`}
              >
                <TrendingUp className="h-4 w-4 text-emerald-300" />
                <span>Impact</span>
              </Link>

              <Link
                href="/what-if"
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${
                  pathname === "/what-if" ? "bg-[#00A878] text-white font-black shadow-md" : "hover:text-[#20C98A] hover:bg-white/5"
                }`}
              >
                <Sliders className="h-4 w-4 text-amber-300" />
                <span>What-If</span>
              </Link>
            </nav>
          )}

          {/* Right Action Controls: Language & Auth CTA */}
          <div className="flex items-center gap-3">
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-[#20C98A]" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="h-3 w-3 text-slate-300" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl p-1.5 z-50 text-xs font-medium space-y-1">
                  {INDIAN_LANGUAGES.slice(0, 6).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${
                        language === lang.code ? "bg-[#00A878] text-white font-bold" : "text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-[10px] text-emerald-300">{lang.native}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Public CTA Buttons */}
            {!loggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-black text-white hover:text-[#20C98A] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 rounded-xl bg-[#00A878] hover:bg-[#20C98A] text-white font-black text-xs shadow-md transition-all hover:scale-105"
                >
                  Try AASRA
                </Link>
              </div>
            ) : (
              /* Authenticated Profile Menu */
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00A878]/30 hover:bg-[#00A878]/50 border border-[#20C98A]/40 text-xs font-black text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <div className="h-6 w-6 rounded-full bg-[#00A878] flex items-center justify-center text-white text-[10px] font-bold">
                    {profile.fullName ? profile.fullName.charAt(0) : "K"}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{profile.fullName || "Farmer"}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-emerald-300" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-[#20C98A]/30 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <span className="font-bold text-white block">{profile.fullName}</span>
                      <span className="text-[10px] text-slate-400 block">{profile.village}, {profile.district}</span>
                      <span className="text-[10px] text-[#20C98A] font-mono block mt-0.5">{profile.primaryCrop?.toUpperCase()} • {profile.fieldAreaAcres || 4.2} ha</span>
                    </div>

                    <Link
                      href="/signup"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
                    >
                      <User className="h-4 w-4 text-[#20C98A]" /> Edit Farm Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/20 flex items-center gap-2 transition-colors cursor-pointer font-bold"
                    >
                      <LogOut className="h-4 w-4 text-rose-400" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/10 text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#063B2D] border-t border-[#20C98A]/20 p-4 space-y-3 font-bold text-sm">
            {!loggedIn ? (
              <>
                <Link href="/product" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-[#20C98A]">Product</Link>
                <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-[#20C98A]">How it Works</Link>
                <Link href="/impact-story" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-[#20C98A]">Impact</Link>
                <div className="pt-2 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 rounded-xl text-center bg-white/10 text-white">Login</Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 rounded-xl text-center bg-[#00A878] text-white">Try AASRA</Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-[#20C98A]">Dashboard</Link>
                <Link href="/fields" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-[#20C98A]">My Fields</Link>
                <Link href="/assistant" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-[#20C98A]">Ask AASRA</Link>
                <Link href="/journal" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-[#20C98A]">Journal</Link>
                <Link href="/impact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-[#20C98A]">Impact</Link>
                <Link href="/what-if" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-[#20C98A]">What-If Simulator</Link>
                <button onClick={handleLogout} className="w-full text-left py-2 text-rose-300 font-bold">Logout</button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main App Page Content */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <Footer />

      {/* MOBILE BOTTOM NAVIGATION BAR (for Authenticated Users) */}
      {loggedIn && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#063B2D]/95 backdrop-blur-lg border-t border-[#20C98A]/30 py-2 px-3 flex justify-around items-center text-[11px] font-bold text-slate-300 shadow-2xl">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 ${pathname === "/dashboard" ? "text-[#20C98A] font-extrabold" : "hover:text-white"}`}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>

          <Link
            href="/fields"
            className={`flex flex-col items-center gap-1 ${pathname.startsWith("/fields") ? "text-[#20C98A] font-extrabold" : "hover:text-white"}`}
          >
            <MapPin className="h-5 w-5" />
            <span>Fields</span>
          </Link>

          <Link
            href="/assistant"
            className="flex flex-col items-center gap-1 text-white bg-[#00A878] p-2.5 rounded-full -mt-6 shadow-xl border-2 border-white cursor-pointer hover:scale-110 transition-transform"
          >
            <Mic className="h-5 w-5 text-amber-300" />
          </Link>

          <Link
            href="/journal"
            className={`flex flex-col items-center gap-1 ${pathname === "/journal" ? "text-[#20C98A] font-extrabold" : "hover:text-white"}`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Journal</span>
          </Link>

          <Link
            href="/impact"
            className={`flex flex-col items-center gap-1 ${pathname === "/impact" || pathname === "/robi" ? "text-[#20C98A] font-extrabold" : "hover:text-white"}`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Impact</span>
          </Link>
        </div>
      )}
    </div>
  );
};
