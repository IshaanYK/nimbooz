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
    { id: "ai",      label: t.aiAdvisory,    count: 3,  color: "blue"    },
    { id: "planting",label: t.plantingStage, count: 2,  color: "amber"   },
  ];

  return (
    <AppShell>
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-10 bg-slate-50 text-slate-900 font-body">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-accent font-bold tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> {t.editorialChronicleBadge}
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold font-display text-slate-900 tracking-tight">
              {t.chroniclesOfSeason}
            </h1>
            <p className="text-sm text-slate-600 max-w-xl font-body">
              {t.chroniclesSub}
            </p>
          </div>

          <div className="flex items-center gap-3 font-accent">
            <span className="px-4 py-2 rounded-full bg-white text-emerald-700 text-xs font-bold border border-slate-200 shadow-sm">
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
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                filter === id
                  ? color === "emerald"
                    ? "bg-emerald-600 text-white border-emerald-700 shadow"
                    : color === "rose"
                    ? "bg-rose-600 text-white border-rose-700 shadow"
                    : color === "blue"
                    ? "bg-blue-600 text-white border-blue-700 shadow"
                    : color === "amber"
                    ? "bg-amber-500 text-white border-amber-600 shadow"
                    : "bg-slate-800 text-white border-slate-900 shadow"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <span>{label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                filter === id ? "bg-white/20" : "bg-slate-100 text-slate-600"
              }`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Main Vertical Journal Component */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          <InterventionJournal />
        </div>
      </div>
    </AppShell>
  );
}
