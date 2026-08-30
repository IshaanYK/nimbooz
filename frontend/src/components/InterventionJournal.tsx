"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Sparkles, TrendingUp, CheckCircle2, ShieldCheck, Download, Calendar, Activity, Zap, AlertTriangle, Sprout, Mic } from "lucide-react";
import { DataBadge } from "./DataBadge";
import { fetchJournalEntries, addJournalEntry } from "@/lib/api";
import { useFarm } from "@/context/FarmContext";
import { getStoredProfile } from "@/lib/userStore";

interface InterventionJournalProps {
  filter?: string;
}

const DEFAULT_JOURNAL_RECORDS = [
  {
    id: "entry-001",
    category: "spray",
    farmer_name: "Ramesh Patel",
    field_name: "Bhopal North Plot",
    crop: "Soybean (JS 335)",
    application_date: "2026-08-14",
    product_name: "Syngenta Quantis / Stress Buster",
    dose_per_ha: "250 ml / acre",
    treated_area_ha: 5.0,
    baseline_yield_kg: 2200,
    treated_yield_kg: 2680,
    net_profit_gain_inr: 9800,
    robi_ratio: 14.2,
    notes: "Applied preventive foliar spray at R1 flowering stage 36h before peak 38°C heatwave. Pod retention 94%.",
    statusBadge: "VERIFIED TREATMENT",
  },
  {
    id: "entry-002",
    category: "heat",
    farmer_name: "Ramesh Patel",
    field_name: "Bhopal North Plot",
    crop: "Soybean (JS 335)",
    application_date: "2026-08-12",
    product_name: "Night Thermal Stress Warning (25.8°C)",
    dose_per_ha: "Telemetry Trigger",
    treated_area_ha: 5.0,
    baseline_yield_kg: 2200,
    treated_yield_kg: 2200,
    net_profit_gain_inr: 0,
    robi_ratio: 0,
    notes: "AASRA detected +4.8 nocturnal degree-hours above 25°C threshold via Open-Meteo. Triggered Day 1 biological clock countdown.",
    statusBadge: "WEATHER TELEMETRY",
  },
  {
    id: "entry-003",
    category: "ai",
    farmer_name: "Ramesh Patel",
    field_name: "Bhopal North Plot",
    crop: "Soybean (JS 335)",
    application_date: "2026-08-11",
    product_name: "Gemini 1.5 Pro Vernacular Voice Advisory",
    dose_per_ha: "Voice Query",
    treated_area_ha: 5.0,
    baseline_yield_kg: 2200,
    treated_yield_kg: 2680,
    net_profit_gain_inr: 9800,
    robi_ratio: 14.2,
    notes: "Farmer asked: 'गरमी में फूल गिरने से कैसे बचाएं?'. AASRA prescribed Quantis @ 250ml/acre in Hindi audio with exact mandi ROI calculations.",
    statusBadge: "VOICE ADVISORY",
  },
  {
    id: "entry-004",
    category: "spray",
    farmer_name: "Ramesh Patel",
    field_name: "South River Plot",
    crop: "Cotton (Bt-II)",
    application_date: "2026-07-28",
    product_name: "Syngenta Isabion (Pure Amino Acids)",
    dose_per_ha: "400 ml / acre",
    treated_area_ha: 4.2,
    baseline_yield_kg: 1800,
    treated_yield_kg: 2150,
    net_profit_gain_inr: 7400,
    robi_ratio: 11.8,
    notes: "Foliar application during vegetative branching for root biomass proliferation and nutrient absorption efficiency.",
    statusBadge: "VERIFIED TREATMENT",
  },
  {
    id: "entry-005",
    category: "planting",
    farmer_name: "Ramesh Patel",
    field_name: "Bhopal North Plot",
    crop: "Soybean (JS 335)",
    application_date: "2026-06-24",
    product_name: "Sowing & Seed Inoculation",
    dose_per_ha: "Seed Treatment",
    treated_area_ha: 5.0,
    baseline_yield_kg: 2200,
    treated_yield_kg: 2200,
    net_profit_gain_inr: 0,
    robi_ratio: 0,
    notes: "Sowing completed following monsoon onset. Sowing date calibrated into GDD Phenology Engine (Formula 3.1).",
    statusBadge: "PHENOLOGY MILESTONE",
  },
];

export const InterventionJournal: React.FC<InterventionJournalProps> = ({ filter = "all" }) => {
  const profile = getStoredProfile();
  const { activeFarm, logIntervention } = useFarm();

  const [entries, setEntries] = useState<any[]>(DEFAULT_JOURNAL_RECORDS);
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    category: "spray",
    product_name: "Syngenta Quantis / Stress Buster",
    application_date: new Date().toISOString().split("T")[0],
    dose_per_ha: "250 ml / acre",
    treated_area_ha: activeFarm.areaAcres || 5.0,
    control_area_ha: 1.0,
    baseline_yield_kg: 2200,
    treated_yield_kg: 2600,
    product_cost_inr: 600,
    market_price_inr_per_kg: 49.2,
    notes: "",
  });

  useEffect(() => {
    // Load from local storage or API
    try {
      const stored = localStorage.getItem("aasra_journal_entries_v2");
      if (stored) {
        setEntries(JSON.parse(stored));
        return;
      }
    } catch {}

    async function loadJournal() {
      const data = await fetchJournalEntries();
      if (data && data.entries && data.entries.length > 0) {
        setEntries(data.entries);
      }
    }
    loadJournal();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      farmer_name: profile.fullName || "Farm Owner",
      field_name: activeFarm.name || profile.fieldName || "Primary Field",
      crop: activeFarm.primaryCrop || profile.primaryCrop || "Soybean",
      ...newEntry,
    };

    const extraYield = newEntry.treated_yield_kg - newEntry.baseline_yield_kg;
    const extraRevenue = extraYield * newEntry.market_price_inr_per_kg;
    const netProfit = extraRevenue - newEntry.product_cost_inr;
    const robi = extraRevenue / (newEntry.product_cost_inr || 1);

    const record = {
      id: `entry-${Date.now().toString().slice(-4)}`,
      ...payload,
      net_profit_gain_inr: Math.round(netProfit),
      robi_ratio: Number(robi.toFixed(1)),
      statusBadge: "USER LOGGED",
    };

    const updated = [record, ...entries];
    setEntries(updated);
    try {
      localStorage.setItem("aasra_journal_entries_v2", JSON.stringify(updated));
    } catch {}

    logIntervention({
      farmId: activeFarm.id,
      fieldName: activeFarm.name,
      crop: activeFarm.primaryCrop,
      date: newEntry.application_date,
      type: newEntry.category as any,
      product: newEntry.product_name,
      dosePerAcre: newEntry.dose_per_ha,
      targetPestOrStress: newEntry.notes,
      notes: newEntry.notes,
      areaTreatedAcres: Number(newEntry.treated_area_ha),
      costINR: newEntry.product_cost_inr,
    });

    try {
      await addJournalEntry(payload);
    } catch (err) {
      console.warn("Journal API sync failed, saved locally", err);
    }
    setShowForm(false);
  };

  const filteredEntries = entries.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-white/10 p-6 space-y-6 shadow-2xl font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              PS-07 Field Intervention Journal & Timeline
            </h3>
            <DataBadge type="USER_PROVIDED" />
            <DataBadge type="MODELLED" customText="ROBI TRACKED" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Showing {filteredEntries.length} chronological agronomic records for {profile.fullName || "Farm Owner"}.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          Log Biological Application
        </button>
      </div>

      {/* Entry Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 space-y-4 text-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider font-mono">
              New Field Intervention Entry
            </h4>
            <DataBadge type="USER_PROVIDED" size="sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-bold">Category</label>
              <select
                value={newEntry.category}
                onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 font-bold"
              >
                <option value="spray">Biological Spray Application</option>
                <option value="heat">Climate Heat Event</option>
                <option value="ai">AI Voice Advisory</option>
                <option value="planting">Planting / Phenology</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">Product / Event Name</label>
              <select
                value={newEntry.product_name}
                onChange={(e) => setNewEntry({ ...newEntry, product_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 font-bold"
              >
                <option value="Syngenta Quantis / Stress Buster">Syngenta Quantis (Abiotic Heat Shield)</option>
                <option value="Syngenta Isabion">Syngenta Isabion (Amino Acid Stimulant)</option>
                <option value="Syngenta Amistar Top">Syngenta Amistar Top (Disease Shield)</option>
                <option value="Field Heat Stress Event">Field Heat Stress Event</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">Date</label>
              <input
                type="date"
                value={newEntry.application_date}
                onChange={(e) => setNewEntry({ ...newEntry, application_date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Treated Area (Acres)</label>
              <input
                type="number"
                step="0.5"
                value={newEntry.treated_area_ha}
                onChange={(e) => setNewEntry({ ...newEntry, treated_area_ha: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-2 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Actual Yield (kg/ha)</label>
              <input
                type="number"
                value={newEntry.treated_yield_kg}
                onChange={(e) => setNewEntry({ ...newEntry, treated_yield_kg: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-emerald-300 rounded-xl px-2.5 py-2 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Baseline Yield (kg/ha)</label>
              <input
                type="number"
                value={newEntry.baseline_yield_kg}
                onChange={(e) => setNewEntry({ ...newEntry, baseline_yield_kg: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-2.5 py-2 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Mandi Price (₹/kg)</label>
              <input
                type="number"
                value={newEntry.market_price_inr_per_kg}
                onChange={(e) => setNewEntry({ ...newEntry, market_price_inr_per_kg: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-2 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-bold">Intervention & Weather Notes</label>
            <textarea
              value={newEntry.notes}
              onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
              placeholder="e.g. Applied during peak night heat stress event. Weather verified by Meteoblue."
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 font-medium"
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer"
          >
            Save Record to Journal & Calculate Attribution
          </button>
        </form>
      )}

      {/* Animated Field Journal Timeline */}
      <div className="space-y-4">
        {filteredEntries.map((item, idx) => (
          <div
            key={item.id || idx}
            className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3 shadow-lg relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold ${
                  item.category === "spray"
                    ? "bg-emerald-600 text-white"
                    : item.category === "heat"
                    ? "bg-rose-600 text-white"
                    : item.category === "ai"
                    ? "bg-blue-600 text-white"
                    : "bg-amber-600 text-white"
                }`}>
                  {item.category === "spray" ? <Activity className="w-4 h-4" /> : item.category === "heat" ? <AlertTriangle className="w-4 h-4" /> : item.category === "ai" ? <Mic className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{item.product_name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {item.field_name} • {item.crop?.toUpperCase()} ({item.treated_area_ha} Ac)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {item.statusBadge || "LOGGED"}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-700/50">
                  {item.application_date}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-mono">BASELINE YIELD</span>
                <span className="font-bold text-slate-300 font-mono">{item.baseline_yield_kg} kg/ha</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-mono">TREATED YIELD</span>
                <span className="font-bold text-emerald-400 font-mono">{item.treated_yield_kg} kg/ha</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-mono">NET PROFIT GAIN</span>
                <span className="font-bold text-amber-300 font-mono">
                  {item.net_profit_gain_inr > 0 ? `+₹${item.net_profit_gain_inr.toLocaleString("en-IN")}` : "Baseline"}
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-mono">ROBI RATIO</span>
                <span className="font-bold text-emerald-300 font-mono">
                  {item.robi_ratio > 0 ? `${item.robi_ratio}x Return` : "N/A"}
                </span>
              </div>
            </div>

            {item.notes && (
              <p className="text-[11px] text-slate-300 italic pt-1 border-t border-white/5">
                "{item.notes}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
