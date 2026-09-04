"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { Sprout } from "lucide-react";

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  const t = getTranslation(language);

  return (
    <footer className="bg-[#0B0F17] text-slate-400 border-t border-slate-800/80 py-14 px-4 sm:px-6 font-sans">
      <div className="max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-slate-800/80">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block">
              <div className="relative h-9 w-9 rounded-xl overflow-hidden border border-indigo-500/30 bg-white/10">
                <Image src="/images/aasra_logo.png" alt="AASRA Logo" fill sizes="36px" className="object-contain p-1" />
              </div>
            </Link>
            <div>
              <p className="font-extrabold text-white text-sm font-display tracking-tight">AASRA</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{language === "hi" ? "आपकी खेती का सच्चा साथी" : "Your Field's Intelligent Companion"}</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              {t.brandName} — {t.tagline}
            </p>
            {/* Tech badge */}
            <div className="inline-flex items-center gap-1.5 bg-indigo-950/60 border border-indigo-500/30 rounded-full px-3 py-1.5 text-[10px] font-bold text-indigo-300">
              <Sprout className="h-3 w-3 text-emerald-400" />
              Google Gemini 2.5 Flash
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest block">{t.footerPlatform || "Platform"}</span>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link href="/assistant" className="hover:text-white transition-colors">{t.navAdvisory || "Voice AI Advisory"}</Link></li>
              <li><Link href="/impact" className="hover:text-white transition-colors">{t.navRobi || "ROBI Causal Impact"}</Link></li>
              <li><Link href="/what-if" className="hover:text-white transition-colors">{t.navWhatIf || "What-If Simulator"}</Link></li>
              <li><Link href="/plant-intelligence" className="hover:text-white transition-colors">Plant Health AI</Link></li>
            </ul>
          </div>

          {/* Farmers Links */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest block">{t.footerFarmers || "For Farmers"}</span>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">{t.navDashboard || "Dashboard"}</Link></li>
              <li><Link href="/fields" className="hover:text-white transition-colors">Field Management</Link></li>
              <li><Link href="/journal" className="hover:text-white transition-colors">{t.navJournal || "Farm Journal"}</Link></li>
              <li><Link href="/architecture" className="hover:text-white transition-colors">Concept Note &amp; Spec</Link></li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-widest block">{t.footerAccount || "Account"}</span>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link href="/login" className="hover:text-white transition-colors">{t.navLogin || "Log In"}</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">{t.navGetStarted || "Get Started"}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
          <p>{t.footerRights || "© 2026 AASRA · All Rights Reserved · Team-2 Hackathon"}</p>
          <p className="text-indigo-400 font-bold">{t.heroBadge || "Google Gemini · Open-Meteo · APMC Data"}</p>
        </div>
      </div>
    </footer>
  );
};
