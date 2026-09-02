"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ConceptNoteExplorer } from "@/components/ConceptNoteExplorer";
import { ArrowRight, UserPlus, Sparkles, Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";

export default function ArchitecturePage() {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);
  const loggedIn = isUserLoggedIn();

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f6f9fc] font-sans pb-16 space-y-10">
        <ConceptNoteExplorer />

        {/* Connected Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="p-8 rounded-3xl bg-white border border-[#e3e8ee] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-[#0d253d] font-display">
                {isHindi ? "AASRA आर्किटेक्चर का अन्वेषण पूरा हुआ" : "Ready to Start Using AASRA?"}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi
                  ? "अब अपने खेत के लिए वास्तविक समय की AI सलाह और मंडी भाव देखें।"
                  : "Begin tracking live field telemetry, disease diagnostics, and APMC rates."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/"
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Home className="h-4 w-4 text-slate-600" />
                <span>{isHindi ? "होम पेज" : "Home"}</span>
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
