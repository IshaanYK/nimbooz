"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sprout,
  Layers,
  Mic,
  Sliders,
  TrendingUp,
  BookOpen,
  FileText,
  Globe,
  User,
  UserPlus,
} from "lucide-react";
import { INDIAN_LANGUAGES, getStoredProfile, FarmerProfile, isUserLoggedIn } from "@/lib/userStore";

interface HeaderProps {
  currentField?: string;
  onFieldChange?: (field: string) => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  backendOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language = "hi",
  onLanguageChange,
}) => {
  const pathname = usePathname();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    setProfile(getStoredProfile());
    setLoggedIn(isUserLoggedIn());
  }, [pathname]);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/plant-intelligence", label: "Plant AI", icon: Sprout },
    { href: "/fields", label: "Fields", icon: Layers },
    { href: "/assistant", label: "Ask AI", icon: Mic },
    { href: "/what-if", label: "What-If", icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_4px_rgba(0,0,0,0.02)] px-4 sm:px-6 h-16 flex items-center justify-between gap-4 text-slate-900 font-sans">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-28 bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-xs">
            <Image src="/images/aasra_logo.png" alt="AASRA" fill priority className="object-contain p-0.5" />
          </div>
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-mono font-bold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE TELEMETRY</span>
        </div>
      </div>

      {/* Center Nav Links */}
      <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-700">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200"
                  : "hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-600" : "text-slate-500"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs notranslate" translate="no">
          <Globe className="h-3.5 w-3.5 text-emerald-600" />
          <select
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer pr-1 notranslate"
            translate="no"
          >
            {INDIAN_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-white text-slate-900 notranslate" translate="no">
                {l.native}
              </option>
            ))}
          </select>
        </div>

        {loggedIn && profile?.fullName ? (
          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold hover:bg-emerald-100 transition-all"
            title="Farmer Profile & WhatsApp Settings"
          >
            <User className="h-3.5 w-3.5 text-emerald-600" />
            <span className="truncate max-w-[100px]">{profile.fullName}</span>
          </Link>
        ) : (
          <Link
            href="/signup"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all shadow-xs"
          >
            Sign Up
          </Link>
        )}
      </div>
    </header>
  );
};
