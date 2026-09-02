"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ConceptNoteExplorer } from "@/components/ConceptNoteExplorer";
import { AskActProveSection } from "@/components/AskActProveSection";
import { FarmerStoryTimeline } from "@/components/FarmerStoryTimeline";
import { WhyScienceSection } from "@/components/WhyScienceSection";
import { ArrowRight, Sparkles, Layers, UserPlus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";

export default function HowItWorksPage() {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);
  const loggedIn = isUserLoggedIn();

  return (
    <AppShell>
      <div className="space-y-12 pb-16 font-sans bg-[#f6f9fc] min-h-screen text-[#0d253d]">
        <ConceptNoteExplorer />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <WhyScienceSection />
          <AskActProveSection />
          <FarmerStoryTimeline />

          {/* Connected Next Steps Bar */}
          <div className="p-8 rounded-3xl bg-white border border-[#e3e8ee] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-[#0d253d] font-display">
                {isHindi ? "आगे बढ़ें: उत्पाद की सभी तकनीकी विशेषताएँ देखें" : "Next Step: Explore Full Product Capabilities"}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi
                  ? "AASRA के सभी 7 वैज्ञानिक मॉड्यूल्स (PS-01 से PS-07) का विस्तृत विवरण देखें।"
                  : "Discover all 7 scientific problem statements and automated causal engines."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/product"
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Layers className="h-4 w-4 text-blue-600" />
                <span>{isHindi ? "उत्पाद विशेषताएँ देखें" : "View Product"}</span>
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
