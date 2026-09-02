"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { InterventionJournal } from "@/components/InterventionJournal";
import { BookOpen, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function JournalPage() {
  const [filter, setFilter] = useState("all");
  const { t } = useLanguage();

  const FILTERS = [
    { id: "all",      label: t.allEntries,    count: 14, color: "slate"   },
    { id: "spray",   label: t.sprayEvents,   count: 5,  color: "emerald" },
    { id: "heat",    label: t.heatAlerts,    count: 4,  color: "rose"    },
    { id: "ai",      label: t.aiAdvisory,    count: 3,  color: "indigo"  },
    { id: "planting",label: t.plantingStage, count: 2,  color: "amber"   },
  ];

  return (
    <AppShell>
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-900 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-mono font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> {t.editorialChronicleBadge}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#111827] tracking-tight">
              {t.chroniclesOfSeason}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl">
              {t.chroniclesSub}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-xl bg-white text-indigo-700 text-xs font-mono font-bold border border-slate-200 shadow-2xs">
              14 {t.entriesRecordedCount}
            </span>
          </div>
        </div>

        {/* Filter Tab Strip */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ id, label, count, color }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filter === id
                  ? color === "emerald"
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                    : color === "rose"
                    ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                    : color === "indigo"
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                    : color === "amber"
                    ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                    : "bg-slate-900 text-white border-slate-950 shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black ${
                filter === id ? "bg-white/20" : "bg-slate-100 text-slate-600"
              }`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Main Vertical Journal Component */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <InterventionJournal filter={filter} />
        </div>
      </div>
    </AppShell>
  );
}
