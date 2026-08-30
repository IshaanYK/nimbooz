"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { ConceptNoteExplorer } from "@/components/ConceptNoteExplorer";
import { AskActProveSection } from "@/components/AskActProveSection";
import { FarmerStoryTimeline } from "@/components/FarmerStoryTimeline";
import { WhyScienceSection } from "@/components/WhyScienceSection";

export default function HowItWorksPage() {
  return (
    <AppShell>
      <div className="space-y-12 pb-16 font-sans bg-slate-950">
        <ConceptNoteExplorer />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <WhyScienceSection />
          <AskActProveSection />
          <FarmerStoryTimeline />
        </div>
      </div>
    </AppShell>
  );
}
