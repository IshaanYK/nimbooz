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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm text-slate-900 font-sans">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
          <div className="relative h-9 w-36 sm:w-44 flex items-center justify-start bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-sm">
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
          className={`px-3 py-1 rounded-full text-[10px] font-accent font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
            isDemoMode
              ? "bg-amber-50 text-amber-800 border-amber-300"
              : "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm"
          }`}
          title="Click to toggle between LIVE API mode and DEMO dataset mode"
        >
          <span className={`w-2 h-2 rounded-full ${isDemoMode ? "bg-amber-500" : "bg-emerald-500 animate-ping"}`} />
          <span>{isDemoMode ? "DEMO MODE" : "LIVE API MODE"}</span>
        </button>

        {loggedIn && profile?.fullName ? (
          <Link
            href="/onboarding"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all font-accent"
          >
            <User className="h-3.5 w-3.5 text-emerald-600" />
            <span>{profile.fullName}</span>
          </Link>
        ) : (
          <Link
            href="/signup"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all shadow-sm cursor-pointer font-accent"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Sign Up</span>
          </Link>
        )}
      </div>

      {/* Center Nav Links */}
      <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto max-w-full no-scrollbar font-accent">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-emerald-600"}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-accent">
        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
          <Globe className="h-3.5 w-3.5 text-emerald-600" />
          <select
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer pr-1"
          >
            {INDIAN_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-white text-slate-900">
                {l.native} ({l.name})
              </option>
            ))}
          </select>
        </div>

        {/* Technical Admin Diagnostics Link */}
        <Link
          href="/admin/api-status"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors"
          title="Admin API Status & Telemetry"
        >
          <Activity className="h-4 w-4 text-emerald-600" />
        </Link>
      </div>
    </header>
  );
};
