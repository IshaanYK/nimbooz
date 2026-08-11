"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { OneSoilFieldMap } from "@/components/OneSoilFieldMap";
import { StressMetrics } from "@/components/StressMetrics";
import { InterventionJournal } from "@/components/InterventionJournal";
import { Ps07ProofAttribution } from "@/components/Ps07ProofAttribution";
import { getStoredProfile } from "@/lib/userStore";
import { Sprout, MapPin, Layers, Activity, BookOpen, TrendingUp, Calendar, Mic, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function FieldDetailPage() {
  const params = useParams();
  const profile = getStoredProfile();
  const [activeTab, setActiveTab] = useState<"overview" | "intelligence" | "journal" | "impact">("overview");

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        {/* Header */}
        <div className="bg-[#063B2D] text-white p-6 sm:p-8 rounded-3xl border border-[#20C98A]/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#20C98A] bg-[#20C98A]/20 px-3 py-1 rounded-full border border-[#20C98A]/30 uppercase">
                {params?.id || "BHOPAL-01"}
              </span>
              <span className="text-xs font-mono text-slate-300">
                {profile.village || "Patel Nagar"}, {profile.district || "Bhopal"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-display text-white">
              {profile.fieldName || "Bhopal Soybean Field 01"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-mono">
              Crop: <strong className="text-emerald-300">Soybean (JS-335)</strong> • Stage: <strong className="text-amber-300">R2 Flowering</strong> • Area: <strong>{profile.fieldAreaHa || 4.2} ha</strong>
            </p>
          </div>

          <Link
            href="/assistant"
            className="px-6 py-3 rounded-2xl bg-[#00A878] hover:bg-[#20C98A] text-white font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Mic className="h-4 w-4 text-amber-300 animate-pulse" />
            <span>Ask AASRA for this Field</span>
          </Link>
        </div>

        {/* Sticky Tabs Header */}
        <div className="sticky top-18 z-40 bg-[#F7F6EF]/95 backdrop-blur-md py-3 border-b border-slate-300/80">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 font-mono text-xs font-bold">
            {[
              { id: "overview", label: "Overview", icon: Layers },
              { id: "intelligence", label: "Intelligence & Sensors", icon: Activity },
              { id: "journal", label: "Journal & Timeline", icon: BookOpen },
              { id: "impact", label: "Impact & ROBI (PS-07)", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#00A878] text-white font-black shadow-lg"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Map Preview */}
            <OneSoilFieldMap crop="soybean" fieldAreaHa={4.2} />

            {/* Risk & Recommendation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-amber-400/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    THERMAL STRESS ALERT
                  </span>
                  <span className="text-xs font-mono font-black text-rose-600">78% RISK</span>
                </div>
                <h3 className="text-lg font-black font-display text-[#10241F]">Night Temperature Spike Detected</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  3-day forecast indicates night temperatures staying above 25.5°C during R2 flowering. Risk of dark respiration flower pod drop.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#063B2D]/15 shadow-xl space-y-4">
                <span className="text-xs font-mono font-bold text-[#00A878] bg-[#DDF7EC] px-3 py-1 rounded-full border border-[#00A878]/30">
                  RECOMMENDED ACTION
                </span>
                <h3 className="text-lg font-black font-display text-[#10241F]">Apply Foliar Biostimulant Spray</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Spray biostimulant (500 ml/ha) between Aug 13–14 to preserve flower cell membranes and stabilize yield potential.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Intelligence & Sensors */}
        {activeTab === "intelligence" && (
          <div className="space-y-8 animate-fade-in">
            <StressMetrics />
          </div>
        )}

        {/* Tab Content 3: Journal */}
        {activeTab === "journal" && (
          <div className="space-y-8 animate-fade-in">
            <InterventionJournal />
          </div>
        )}

        {/* Tab Content 4: Impact (PS-07) */}
        {activeTab === "impact" && (
          <div className="space-y-8 animate-fade-in">
            <Ps07ProofAttribution />
          </div>
        )}
      </div>
    </AppShell>
  );
}
