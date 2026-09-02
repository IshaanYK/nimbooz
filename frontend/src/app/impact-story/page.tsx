"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Ps07ProofAttribution } from "@/components/Ps07ProofAttribution";
import { ROBICalculator } from "@/components/ROBICalculator";
import { ArrowRight, FileText, UserPlus, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";

export default function ImpactStoryPage() {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);
  const loggedIn = isUserLoggedIn();

  return (
    <AppShell>
      <div className="space-y-12 pb-16 font-sans bg-[#f6f9fc] min-h-screen text-[#0d253d]">
        
        {/* Header Hero */}
        <section className="bg-gradient-to-r from-[#0d253d] via-[#1c1e54] to-[#0d253d] text-white py-16 px-4 sm:px-6 text-center space-y-4 border-b border-[#e3e8ee]">
          <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase border border-emerald-400/30">
            PROVEN CAUSAL OUTCOMES
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight">
            Impact & ROBI Attribution Story
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Proving biological biostimulant value through scientific multi-factor baseline decomposition.
          </p>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <Ps07ProofAttribution />
          <ROBICalculator />

          {/* Connected Next Steps Bar */}
          <div className="p-8 rounded-3xl bg-white border border-[#e3e8ee] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-[#0d253d] font-display">
                {isHindi ? "आगे बढ़ें: संपूर्ण तकनीकी आर्किटेक्चर देखें" : "Next Step: Explore Full Technical Architecture"}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi
                  ? "AASRA के 7 वैज्ञानिक मॉडल्स और डेटा पाइपलाइनों का पूरा फ्लोचार्ट देखें।"
                  : "Review end-to-end telemetry ingestion, ML explainers, and API specifications."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/architecture"
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <FileText className="h-4 w-4 text-purple-600" />
                <span>{isHindi ? "आर्किटेक्चर देखें" : "View Architecture"}</span>
              </Link>
              <Link
                href={loggedIn ? "/dashboard" : "/signup"}
                className="px-5 py-3 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
              >
                <UserPlus className="h-4 w-4" />
                <span>{loggedIn ? (isHindi ? "मेरा खेत खोलें" : "Open Dashboard") : (isHindi ? "निःशुल्क शुरू करें" : "Sign Up Free")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
