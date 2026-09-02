"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { InterventionJournal } from "@/components/InterventionJournal";
import { BookOpen, Sparkles, Activity, AlertTriangle, Mic, Sprout, Calendar, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getStoredProfile } from "@/lib/userStore";

export default function JournalPage() {
  const [filter, setFilter] = useState("all");
  const { t } = useLanguage();
  const profile = getStoredProfile();

  const FILTERS = [
    { id: "all",      label: "All Chronicles",    count: 8, icon: BookOpen },
    { id: "spray",   label: "Biological Sprays", count: 2, icon: Activity },
    { id: "heat",    label: "Climate Warnings",  count: 2, icon: AlertTriangle },
    { id: "ai",      label: "AI Advisories",     count: 2, icon: Mic },
    { id: "planting",label: "Crop Phenology",    count: 2, icon: Sprout },
  ];

  return (
    <AppShell>
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-900 font-sans">
        
        {/* Header (Stripe Aesthetic) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#e3e8ee] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[#533afd] text-xs font-mono font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-[#533afd]" />
              <span>PS-07 · AGRONOMIC SEASON LOG</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-[#0d253d] tracking-tight">
              Chronicles of the Season
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              A chronological audit trail documenting sowing milestones, nocturnal heatwave alerts, Syngenta biological interventions, and verified harvest gains for <strong>{profile.fullName || "Ishaan Sen"}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-2xl bg-[#f6f9fc] text-[#533afd] text-xs font-mono font-bold border border-[#e3e8ee] shadow-2xs">
              8 Verified Milestones
            </span>
          </div>
        </div>

        {/* 3 Quick Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e3e8ee] shadow-2xs space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              SEASON TIMELINE
            </span>
            <div className="text-2xl font-black font-mono text-[#0d253d]">
              Kharif 2026
            </div>
            <p className="text-xs text-slate-500">
              Sowing to R2 Flowering ({profile.fieldAreaAcres || 5.0} Acres {profile.primaryCrop || "Soybean"})
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e3e8ee] shadow-2xs space-y-1">
            <span className="text-[11px] font-mono text-emerald-600 uppercase tracking-wider block">
              BIOLOGICAL PROTECTION VALUE
            </span>
            <div className="text-2xl font-black font-mono text-emerald-600">
              +₹22,120 Saved
            </div>
            <p className="text-xs text-slate-500">
              4.46x Verified ROBI (Syngenta Quantis Treatment)
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e3e8ee] shadow-2xs space-y-1">
            <span className="text-[11px] font-mono text-indigo-600 uppercase tracking-wider block">
              CAUSAL AUDIT STATUS
            </span>
            <div className="text-2xl font-black font-display text-[#533afd]">
              Verified 100%
            </div>
            <p className="text-xs text-slate-500">
              Cross-checked against Open-Meteo satellite reanalysis
            </p>
          </div>
        </div>

        {/* Filter Tab Strip */}
        <div className="flex flex-wrap gap-2.5">
          {FILTERS.map(({ id, label, count, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                filter === id
                  ? "bg-[#533afd] text-white shadow-sm border border-[#533afd]"
                  : "bg-white text-slate-700 hover:text-[#0d253d] hover:bg-[#f6f9fc] border border-[#e3e8ee]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                  filter === id ? "bg-white/20 text-white" : "bg-[#f1f4f8] text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Main Timeline Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-sm">
          <InterventionJournal filter={filter} />
        </div>

      </div>
    </AppShell>
  );
}
