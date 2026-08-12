"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { InterventionJournal } from "@/components/InterventionJournal";
import { BookOpen, Plus, Filter, Sparkles, Calendar, Bookmark, FileText } from "lucide-react";

export default function JournalPage() {
  const [filter, setFilter] = useState("all");

  return (
    <AppShell>
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-10 bg-slate-50 text-slate-900 font-body">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-accent font-bold tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> EDITORIAL CHRONICLE
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold font-display text-slate-900 tracking-tight">
              Chronicles of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">
                the Season.
              </span>
            </h1>
            <p className="text-sm text-slate-600 max-w-xl font-body">
              A structured timeline recording planting stages, thermal heat stress alerts, biological spray interventions, and yield outcomes.
            </p>
          </div>

          <div className="flex items-center gap-3 font-accent">
            <span className="px-4 py-2 rounded-full bg-white text-emerald-700 text-xs font-bold border border-slate-200 shadow-sm">
              14 ENTRIES RECORDED
            </span>
          </div>
        </div>

        {/* Main Vertical Journal Component */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          <InterventionJournal />
        </div>
      </div>
    </AppShell>
  );
}
