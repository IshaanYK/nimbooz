"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Ps04SpeechIntelligence } from "@/components/Ps04SpeechIntelligence";
import { WhyScienceSection } from "@/components/WhyScienceSection";
import { Sprout, Mic, Award, Sliders, ArrowRight, Sparkles } from "lucide-react";

export default function ProductPage() {
  return (
    <AppShell>
      <div className="space-y-12 pb-16 bg-slate-50 text-slate-900 font-body">
        {/* Product Hero */}
        <section className="relative py-20 px-4 sm:px-8 overflow-hidden border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-accent font-bold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> AASRA PLATFORM SPECIFICATION
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold font-display text-slate-900 tracking-tight leading-tight">
              Biological Science <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">
                meets Voice Intelligence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-body">
              Combining PS-04 multilingual speech intelligence with PS-07 return on biological investment attribution.
            </p>

            <div className="pt-4 flex justify-center gap-4 font-accent">
              <Link
                href="/assistant"
                className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <Mic className="h-4 w-4" />
                <span>LAUNCH VOICE AI & LEAF SCANNER</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <Ps04SpeechIntelligence />
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <WhyScienceSection />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
