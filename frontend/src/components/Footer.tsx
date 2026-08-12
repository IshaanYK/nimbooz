"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <footer className="bg-[#063B2D] text-slate-300 border-t border-[#20C98A]/20 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-xs">
        {/* Brand Column */}
        <div className="space-y-3 text-center md:text-left">
          <Link href="/" className="inline-block">
            <div className="relative h-9 w-36 bg-white/95 p-1 rounded-xl">
              <Image src="/images/aasra_logo.png" alt="AASRA Logo" fill className="object-contain p-1" />
            </div>
          </Link>
          <p className="text-slate-400 max-w-sm leading-relaxed">
            {t.brandName} — {t.tagline}
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 font-semibold">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#20C98A] uppercase block font-black">PLATFORM</span>
            <ul className="space-y-1 text-slate-300">
              <li><Link href="/assistant" className="hover:text-white transition-colors">{t.navAdvisory}</Link></li>
              <li><Link href="/impact" className="hover:text-white transition-colors">{t.navRobi}</Link></li>
              <li><Link href="/what-if" className="hover:text-white transition-colors">{t.navWhatIf}</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#20C98A] uppercase block font-black">FARMERS</span>
            <ul className="space-y-1 text-slate-300">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">{t.navDashboard}</Link></li>
              <li><Link href="/weather" className="hover:text-white transition-colors">{t.navWeather}</Link></li>
              <li><Link href="/journal" className="hover:text-white transition-colors">{t.navJournal}</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#20C98A] uppercase block font-black">ACCOUNT</span>
            <ul className="space-y-1 text-slate-300">
              <li><Link href="/login" className="hover:text-white transition-colors">{t.navLogin}</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">{t.navGetStarted}</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">System Diagnostics</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right space-y-1 text-[11px] text-slate-400 font-mono">
          <p>© 2026 {t.brandName}. All rights reserved.</p>
          <p className="text-emerald-300">{t.heroBadge}</p>
        </div>
      </div>
    </footer>
  );
};
