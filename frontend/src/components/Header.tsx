"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sprout,
  Globe,
  MapPin,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  BookOpen,
  HelpCircle,
  User,
  UserPlus,
  Shield,
  Activity,
  Layers,
} from "lucide-react";
import { INDIAN_LANGUAGES, getStoredProfile, FarmerProfile, isUserLoggedIn } from "@/lib/userStore";
import { DataBadge } from "./DataBadge";

interface HeaderProps {
  currentField?: string;
  onFieldChange?: (field: string) => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  backendOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentField = "bhopal",
  onFieldChange,
  language = "hi",
  onLanguageChange,
  backendOnline = true,
}) => {
  const pathname = usePathname();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  useEffect(() => {
    setProfile(getStoredProfile());
    setLoggedIn(isUserLoggedIn());
  }, [pathname]);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/fields", label: "Fields & Map", icon: Layers },
    { href: "/assistant", label: "Ask AASRA", icon: MessageSquare },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/impact", label: "ROBI Impact", icon: TrendingUp },
    { href: "/what-if", label: "What-If", icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#063B2D]/95 border-b border-[#20C98A]/30 px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl text-white font-sans">
      {/* Brand Logo with Official Image */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
          <div className="relative h-9 w-36 sm:w-44 flex items-center justify-start bg-white p-1.5 rounded-xl shadow-md">
            <Image
              src="/images/aasra_logo.png"
              alt="AASRA"
              fill
              priority
              className="object-contain p-1"
            />
          </div>
        </Link>

        {/* Live vs Demo Mode Toggle Pill */}
        <button
          onClick={() => setIsDemoMode(!isDemoMode)}
          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
            isDemoMode
              ? "bg-slate-800 text-amber-300 border-amber-500/40"
              : "bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-sm"
          }`}
          title="Click to toggle between LIVE API mode and DEMO dataset mode"
        >
          <span className={`w-2 h-2 rounded-full ${isDemoMode ? "bg-amber-400" : "bg-emerald-400 animate-ping"}`} />
          <span>{isDemoMode ? "DEMO MODE" : "LIVE API MODE"}</span>
        </button>

        {loggedIn && profile?.fullName ? (
          <Link
            href="/onboarding"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A878]/30 border border-[#20C98A]/40 text-emerald-200 text-xs font-bold hover:bg-[#00A878]/50 transition-all"
          >
            <User className="h-3.5 w-3.5 text-amber-300" />
            <span>{profile.fullName}</span>
          </Link>
        ) : (
          <Link
            href="/signup"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00A878] text-white font-black text-xs hover:bg-[#20C98A] transition-all shadow-md cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Sign Up</span>
          </Link>
        )}
      </div>

      {/* Center Nav Links */}
      <nav className="flex items-center gap-1 bg-[#10241F] p-1 rounded-2xl border border-white/10 overflow-x-auto max-w-full no-scrollbar">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-[#00A878] text-white shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-amber-300" : "text-[#20C98A]"}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-[#10241F] border border-white/10 rounded-xl px-2.5 py-1 text-xs">
          <Globe className="h-3.5 w-3.5 text-[#20C98A]" />
          <select
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="bg-transparent text-emerald-200 font-bold focus:outline-none cursor-pointer pr-1"
          >
            {INDIAN_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                {l.native} ({l.name})
              </option>
            ))}
          </select>
        </div>

        {/* Technical Admin Diagnostics Link */}
        <Link
          href="/admin/api-status"
          className="p-2 rounded-xl bg-[#10241F] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          title="Admin API Status & Telemetry"
        >
          <Activity className="h-4 w-4 text-[#20C98A]" />
        </Link>
      </div>
    </header>
  );
};
