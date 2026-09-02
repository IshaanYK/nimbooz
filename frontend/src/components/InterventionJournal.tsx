"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Activity,
  Zap,
  AlertTriangle,
  Sprout,
  Mic,
  Camera,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  DollarSign,
  Tag,
  Check,
} from "lucide-react";
import { useFarm } from "@/context/FarmContext";
import { getStoredProfile } from "@/lib/userStore";

export interface JournalEntry {
  id: string;
  category: "spray" | "heat" | "ai" | "planting";
  title: string;
  subtitle: string;
  date: string;
  badge: string;
  badgeColor: "emerald" | "rose" | "indigo" | "amber";
  metrics: { label: string; value: string; highlight?: boolean }[];
  notes: string;
  costINR?: number;
  returnINR?: number;
}

const DEFAULT_JOURNAL_RECORDS: JournalEntry[] = [
  {
    id: "j-001",
    category: "spray",
    title: "Syngenta Quantis / Stress Buster Application",
    subtitle: "Main Acreage · Soybean (JS-9560 High Yield) · 5.0 Acres",
    date: "2026-08-28",
    badge: "VERIFIED TREATMENT · 4.46x ROBI",
    badgeColor: "emerald",
    metrics: [
      { label: "Dosage", value: "250 ml / acre (Tractor Boom)" },
      { label: "Net Cash Gain", value: "+₹22,120", highlight: true },
      { label: "Pod Retention", value: "98% Preserved" },
      { label: "Weather Trigger", value: "24.8°C Night Heatwave" },
    ],
    notes: "Applied 36 hours before 38.5°C peak heat wave wavefront. Flower abortion halted, cellular osmolyte turgor sustained, preventing 1.24 q/ac loss.",
    costINR: 6400,
    returnINR: 28520,
  },
  {
    id: "j-002",
    category: "heat",
    title: "Nocturnal Heat Stress Warning (25.8°C Night Peak)",
    subtitle: "Open-Meteo Satellite Reanalysis Telemetry · Bhopal Station",
    date: "2026-08-26",
    badge: "HIGH THERMAL RISK",
    badgeColor: "rose",
    metrics: [
      { label: "Peak Night Temp", value: "25.8°C (Limit: 24°C)" },
      { label: "Respiration Penalty", value: "-1.24 q/ac if untreated" },
      { label: "Blossom Abortion", value: "Up to 42% Risk" },
      { label: "Action Window", value: "Spraying recommended within 48h" },
    ],
    notes: "AASRA detected +4.8 nocturnal degree-hours above the 24°C respiration limit. Initiated biological countdown timer for foliar osmoprotectant application.",
  },
  {
    id: "j-003",
    category: "ai",
    title: "Google Gemini Multimodal Voice Consultation",
    subtitle: "Kisan Voice Advisory in Hindi (Google Chirp 3 HD Audio)",
    date: "2026-08-25",
    badge: "VOICE PRESCRIPTION",
    badgeColor: "indigo",
    metrics: [
      { label: "Farmer Query", value: '"गरमी में फूल गिरने से कैसे बचाएं?"' },
      { label: "AI Prescription", value: "Syngenta Quantis @ 250ml/ac" },
      { label: "Projected Profit", value: "+₹22,120 for 5 Acres", highlight: true },
      { label: "Confidence", value: "94.8% Agro-Agronomic" },
    ],
    notes: "AASRA combined real-time weather telemetry with phenology to recommend timely biostimulant spraying with exact break-even APMC Mandi economics.",
  },
  {
    id: "j-004",
    category: "planting",
    title: "R2 Full Flowering Stage Reached",
    subtitle: "Phenology Model (Growing Degree Days: 640 °C-Days)",
    date: "2026-08-15",
    badge: "CRITICAL PHENOLOGY WINDOW",
    badgeColor: "amber",
    metrics: [
      { label: "Phenological Stage", value: "R2 Full Bloom" },
      { label: "Vegetative Index", value: "NDVI 0.76 (Dense Canopy)" },
      { label: "Flower Abundance", value: "18-24 blossoms / plant" },
      { label: "Vulnerability", value: "Extreme Heat Sensitivity" },
    ],
    notes: "Crop entered maximum reproductive flowering. Any heat spike >35°C daytime or >24°C nighttime causes acute flower drop without osmoprotection.",
  },
  {
    id: "j-005",
    category: "spray",
    title: "Syngenta Isabion Amino Acid Foliar Tonic",
    subtitle: "Vegetative V4 Stage Root Expansion · 5.0 Acres",
    date: "2026-08-04",
    badge: "NUTRIENT BIO-STIMULANT",
    badgeColor: "emerald",
    metrics: [
      { label: "Dosage", value: "400 ml / acre" },
      { label: "Input Cost", value: "₹1,800 Total" },
      { label: "Root Proliferation", value: "+22% Root Volume" },
      { label: "Chlorophyll Gain", value: "+8.4 SPAD Index" },
    ],
    notes: "Applied natural free amino acids to accelerate root branching, soil nutrient uptake, and build vigor prior to reproductive phase.",
    costINR: 1800,
  },
  {
    id: "j-006",
    category: "ai",
    title: "Leaf Scanner Disease & Nutrient Diagnosis",
    subtitle: "Multimodal Gemini Vision Model · Leaf Camera Scan",
    date: "2026-07-20",
    badge: "AI SCAN VERIFIED",
    badgeColor: "indigo",
    metrics: [
      { label: "Visual Diagnosis", value: "Healthy Canopy (Zero Blight)" },
      { label: "Nutrient Status", value: "Optimal Nitrogen Balance" },
      { label: "Confidence", value: "98.2% Computer Vision" },
      { label: "Recommendation", value: "No Fungicide Required" },
    ],
    notes: "Leaf scanner verified healthy chloroplasts and cellular turgor. Advised against unnecessary chemical fungicide spray, saving ₹2,400.",
  },
  {
    id: "j-007",
    category: "heat",
    title: "Dry Spell & Root-Zone Moisture Deficit Alert",
    subtitle: "Soil Telemetry & Satellite Evapotranspiration",
    date: "2026-07-12",
    badge: "SOIL MOISTURE WATCH",
    badgeColor: "rose",
    metrics: [
      { label: "Soil Moisture", value: "31% (Opt: 40-60%)" },
      { label: "Evapotranspiration", value: "5.8 mm / day" },
      { label: "Action Taken", value: "18mm Supplementary Drip" },
      { label: "Recovery", value: "Restored to 46% Moisture" },
    ],
    notes: "Temporary 9-day monsoon break prevented from causing root hydraulic failure via timely supplemental irrigation.",
  },
  {
    id: "j-008",
    category: "planting",
    title: "Monsoon Sowing & Seed Inoculation",
    subtitle: "JS-9560 Certified High-Yield Seed Stock · Phanda Kalan",
    date: "2026-06-25",
    badge: "SEASON INCEPTION",
    badgeColor: "amber",
    metrics: [
      { label: "Sowing Depth", value: "3.5 cm (Black Clay Soil)" },
      { label: "Emergence Rate", value: "96% Germination" },
      { label: "Plant Density", value: "185,000 plants / acre" },
      { label: "Bio-Inoculant", value: "Rhizobium Bio-Fertilizer" },
    ],
    notes: "Sowing initiated following 64mm monsoon onset rain. Calibrated sowing date into AASRA GDD Phenology Engine.",
  },
];

interface InterventionJournalProps {
  filter?: string;
}

export const InterventionJournal: React.FC<InterventionJournalProps> = ({ filter = "all" }) => {
  const profile = getStoredProfile();
  const { activeFarm } = useFarm();

  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("aasra_journal_entries_v3");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return DEFAULT_JOURNAL_RECORDS;
  });

  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>("j-001");

  // New entry form state
  const [newCategory, setNewCategory] = useState<"spray" | "heat" | "ai" | "planting">("spray");
  const [newTitle, setNewTitle] = useState<string>("Syngenta Quantis Foliar Treatment");
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newDose, setNewDose] = useState<string>("250 ml / acre");
  const [newCost, setNewCost] = useState<number>(1280);
  const [newNotes, setNewNotes] = useState<string>("");

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const createdEntry: JournalEntry = {
      id: `j-${Date.now().toString().slice(-4)}`,
      category: newCategory,
      title: newTitle,
      subtitle: `${activeFarm.name || "Main Field"} · ${activeFarm.primaryCrop || profile.primaryCrop || "Soybean"} · ${activeFarm.areaAcres || profile.fieldAreaAcres || 5.0} Acres`,
      date: newDate,
      badge: newCategory === "spray" ? "USER LOGGED SPRAY" : "USER LOGGED OBSERVATION",
      badgeColor: newCategory === "spray" ? "emerald" : newCategory === "heat" ? "rose" : newCategory === "ai" ? "indigo" : "amber",
      metrics: [
        { label: "Application Dose", value: newDose },
        { label: "Treatment Cost", value: `₹${newCost.toLocaleString("en-IN")}` },
        { label: "Field Size", value: `${activeFarm.areaAcres || profile.fieldAreaAcres || 5.0} Acres` },
        { label: "Status", value: "Active", highlight: true },
      ],
      notes: newNotes || "Logged by farmer via AASRA Season Journal.",
      costINR: newCost,
    };

    const updated = [createdEntry, ...entries];
    setEntries(updated);
    try {
      localStorage.setItem("aasra_journal_entries_v3", JSON.stringify(updated));
      fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory,
          title: newTitle,
          subtitle: `${activeFarm.name || "Main Field"} · ${activeFarm.primaryCrop || profile.primaryCrop || "Soybean"} · ${activeFarm.areaAcres || profile.fieldAreaAcres || 5.0} Acres`,
          date: newDate,
          dose_per_ha: newDose,
          costINR: newCost,
          notes: newNotes,
        }),
      }).catch(console.error);
    } catch {}

    setExpandedEntryId(createdEntry.id);
    setShowLogModal(false);
    setNewNotes("");
  };

  const filteredEntries = entries.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  return (
    <div className="space-y-6">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3e8ee] pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black font-display text-[#0d253d] flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#533afd]" />
            <span>Chronological Agronomic Timeline</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing <strong>{filteredEntries.length}</strong> verified events for <strong>{profile.fullName || "Ishaan Sen"}</strong> ({activeFarm.areaAcres || profile.fieldAreaAcres || 5.0} Acres {activeFarm.primaryCrop || profile.primaryCrop || "Soybean"}).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#533afd] hover:bg-[#4434d4] text-white font-mono font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Log New Activity</span>
        </button>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#e3e8ee]">
        {filteredEntries.map((entry) => {
          const isExpanded = expandedEntryId === entry.id;
          return (
            <div key={entry.id} className="relative group">
              
              {/* Timeline Connector Dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${
                  entry.badgeColor === "emerald"
                    ? "bg-emerald-600 text-white"
                    : entry.badgeColor === "rose"
                    ? "bg-rose-600 text-white"
                    : entry.badgeColor === "indigo"
                    ? "bg-[#533afd] text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {entry.category === "spray" ? (
                  <Activity className="h-3 w-3" />
                ) : entry.category === "heat" ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : entry.category === "ai" ? (
                  <Mic className="h-3 w-3" />
                ) : (
                  <Sprout className="h-3 w-3" />
                )}
              </div>

              {/* Timeline Card (Stripe Standard) */}
              <div className="bg-[#ffffff] border border-[#e3e8ee] hover:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all space-y-3">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f1f4f8] pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                          entry.badgeColor === "emerald"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : entry.badgeColor === "rose"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : entry.badgeColor === "indigo"
                            ? "bg-indigo-50 text-[#533afd] border-indigo-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {entry.badge}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {entry.date}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-[#0d253d] font-display mt-1">
                      {entry.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-sans">
                      {entry.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                    className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-[#f6f9fc] hover:bg-[#eef2f6] text-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-[#e3e8ee]"
                  >
                    <span>{isExpanded ? "Collapse" : "View Details"}</span>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* 4 Metric Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  {entry.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border ${
                        m.highlight
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold"
                          : "bg-[#f6f9fc] border-[#e3e8ee] text-slate-700"
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block font-normal uppercase">
                        {m.label}
                      </span>
                      <span className={`text-xs font-bold ${m.highlight ? "text-emerald-700 text-sm" : "text-[#0d253d]"}`}>
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Expanded Details / Field Notes */}
                {isExpanded && (
                  <div className="pt-2 border-t border-[#f1f4f8] space-y-2 text-xs animate-fade-in">
                    <p className="text-slate-600 leading-relaxed bg-[#fbfcfd] p-3.5 rounded-xl border border-[#e3e8ee]">
                      <span className="font-bold text-[#0d253d] block mb-1">Agronomic Observation & Verification:</span>
                      {entry.notes}
                    </p>

                    {entry.costINR && entry.returnINR && (
                      <div className="flex justify-between items-center text-xs font-mono font-bold bg-emerald-50/80 text-emerald-950 p-3 rounded-xl border border-emerald-200">
                        <span>Input Cost: ₹{entry.costINR.toLocaleString("en-IN")}</span>
                        <span className="text-emerald-900">
                          Net Verified Return: +₹{(entry.returnINR - entry.costINR).toLocaleString("en-IN")} (4.46x ROBI)
                        </span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          STRIPE-STYLE "LOG NEW ACTIVITY" MODAL
         ───────────────────────────────────────────────────────────────── */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#e3e8ee] shadow-2xl p-6 sm:p-8 space-y-5">
            
            <button
              type="button"
              onClick={() => setShowLogModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#533afd] uppercase tracking-wider">
                FIELD CHRONICLE
              </span>
              <h3 className="text-xl font-black font-display text-[#0d253d]">
                Log New Agronomic Activity
              </h3>
              <p className="text-xs text-slate-500">
                Record a biological spray, weather event, or crop scouting observation.
              </p>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              
              {/* Category */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Event Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "spray", label: "Biological Spray", color: "emerald" },
                    { id: "heat", label: "Climate Event", color: "rose" },
                    { id: "ai", label: "AI Consultation", color: "indigo" },
                    { id: "planting", label: "Phenology", color: "amber" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewCategory(cat.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold font-mono transition-all cursor-pointer ${
                        newCategory === cat.id
                          ? "bg-[#533afd] text-white border-[#533afd] shadow-xs"
                          : "bg-white text-slate-700 border-[#e3e8ee] hover:bg-slate-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title / Product */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Activity / Product Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Syngenta Quantis / Stress Buster"
                  required
                  className="w-full bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                />
              </div>

              {/* Date & Dosage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Date of Occurrence</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Dosage / Method</label>
                  <input
                    type="text"
                    value={newDose}
                    onChange={(e) => setNewDose(e.target.value)}
                    placeholder="e.g. 250 ml / acre"
                    className="w-full bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl px-3 py-2 text-xs font-bold text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                  />
                </div>
              </div>

              {/* Cost */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Total Cost (₹)</label>
                <input
                  type="number"
                  value={newCost}
                  onChange={(e) => setNewCost(Number(e.target.value))}
                  placeholder="1280"
                  className="w-full bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Observation Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Applied before night heatwave. No flower drop observed."
                  className="w-full bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl px-3.5 py-2 text-xs font-medium text-[#0d253d] focus:outline-none focus:border-[#533afd]"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#533afd] hover:bg-[#4434d4] text-white font-mono font-bold text-xs transition-all shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                Save Entry to Farm Timeline
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
