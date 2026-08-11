"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { InterventionJournal } from "@/components/InterventionJournal";
import { BookOpen, Plus, Filter, Sparkles } from "lucide-react";

export default function JournalPage() {
  const [filter, setFilter] = useState("all");

  return (
    <AppShell>
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-[#00A878] uppercase bg-[#DDF7EC] px-3 py-1 rounded-full border border-[#00A878]/30">
              SEASON TIMELINE
            </span>
            <h1 className="text-3xl font-black font-display text-[#10241F] mt-2 flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-[#00A878]" /> Farm Journal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Structured chronological timeline of planting, thermal risks, spray interventions, weather events, and harvest outcomes.
            </p>
          </div>
        </div>

        {/* Main Vertical Journal Component */}
        <InterventionJournal />
      </div>
    </AppShell>
  );
}
