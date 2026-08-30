"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { ConceptNoteExplorer } from "@/components/ConceptNoteExplorer";

export default function ArchitecturePage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-slate-950 font-sans pb-16">
        <ConceptNoteExplorer />
      </div>
    </AppShell>
  );
}
