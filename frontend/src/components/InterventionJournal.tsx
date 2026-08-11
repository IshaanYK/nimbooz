"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Sparkles, TrendingUp, CheckCircle2, ShieldCheck, Download, Calendar, Activity } from "lucide-react";
import { DataBadge } from "./DataBadge";
import { fetchJournalEntries, addJournalEntry } from "@/lib/api";
import { getStoredProfile } from "@/lib/userStore";

export const InterventionJournal: React.FC = () => {
  const profile = getStoredProfile();

  const [entries, setEntries] = useState<any[]>([
    {
      id: "entry-001",
      farmer_name: profile.fullName || "Kisan Brother",
      field_name: profile.fieldName || "Bhopal Soybean Field",
      crop: profile.primaryCrop || "soybean",
      application_date: "2026-07-10",
      product_name: "Syngenta Stress Buster",
      dose_per_ha: "500 ml / ha",
      treated_area_ha: 4.2,
      baseline_yield_kg: 2200,
      treated_yield_kg: 2450,
      net_profit_gain_inr: 8900,
      robi_ratio: 15.8,
      notes: "Foliar spray applied during peak night heat stress (25.8°C). Preserved pod filling potential.",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    product_name: "Syngenta Stress Buster",
    application_date: new Date().toISOString().split("T")[0],
    dose_per_ha: "500 ml / ha",
    treated_area_ha: 4.2,
    control_area_ha: 1.0,
    baseline_yield_kg: 2200,
    treated_yield_kg: 2500,
    product_cost_inr: 600,
    market_price_inr_per_kg: 38.0,
    notes: "",
  });

  useEffect(() => {
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
      farmer_name: profile.fullName || "Authenticated Farmer",
      field_name: profile.fieldName || "Primary Field",
      crop: profile.primaryCrop || "soybean",
      ...newEntry,
    };

    const res = await addJournalEntry(payload);
    if (res && res.record) {
      setEntries([res.record, ...entries]);
    } else {
      const extraYield = newEntry.treated_yield_kg - newEntry.baseline_yield_kg;
      const extraRevenue = extraYield * newEntry.market_price_inr_per_kg;
      const netProfit = extraRevenue - newEntry.product_cost_inr;
      const robi = extraRevenue / (newEntry.product_cost_inr || 1);

      const fallbackRecord = {
        id: `entry-${(entries.length + 1).toString().padStart(3, "0")}`,
        ...payload,
        net_profit_gain_inr: Math.round(netProfit),
        robi_ratio: Number(robi.toFixed(1)),
      };
      setEntries([fallbackRecord, ...entries]);
    }

    setShowForm(false);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-white/10 p-6 space-y-6 shadow-2xl font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              PS-07 Field Intervention Journal
            </h3>
            <DataBadge type="USER_PROVIDED" />
            <DataBadge type="MODELLED" customText="ROBI TRACKED" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Log biological applications, track control vs treated plots, and generate verifiable proof cards.
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
              New Biological Application Record
            </h4>
            <DataBadge type="USER_PROVIDED" size="sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 block mb-1">Product Applied</label>
              <select
                value={newEntry.product_name}
                onChange={(e) => setNewEntry({ ...newEntry, product_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 font-bold"
              >
                <option value="Syngenta Stress Buster">Syngenta Stress Buster (Abiotic Heat)</option>
                <option value="Syngenta Nutrient Booster">Syngenta Nutrient Booster (NUE)</option>
                <option value="Syngenta Yield Booster">Syngenta Yield Booster (Grain Fill)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Application Date</label>
              <input
                type="date"
                value={newEntry.application_date}
                onChange={(e) => setNewEntry({ ...newEntry, application_date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Treated Area (ha)</label>
              <input
                type="number"
                step="0.1"
                value={newEntry.treated_area_ha}
                onChange={(e) => setNewEntry({ ...newEntry, treated_area_ha: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              <label className="text-slate-400 block mb-1">Product Cost (₹/ha)</label>
              <input
                type="number"
                value={newEntry.product_cost_inr}
                onChange={(e) => setNewEntry({ ...newEntry, product_cost_inr: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-2 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Market Price (₹/kg)</label>
              <input
                type="number"
                value={newEntry.market_price_inr_per_kg}
                onChange={(e) => setNewEntry({ ...newEntry, market_price_inr_per_kg: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-2 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1">Intervention & Weather Notes</label>
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
        {entries.map((item, idx) => (
          <div
            key={item.id || idx}
            className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3 shadow-lg relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-600 text-slate-950 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{item.product_name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {item.field_name} • {item.crop?.toUpperCase()} ({item.treated_area_ha} ha)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DataBadge type="USER_PROVIDED" size="sm" />
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
                <span className="font-bold text-amber-300 font-mono">+₹{item.net_profit_gain_inr} / ha</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-mono">ROBI RATIO</span>
                <span className="font-bold text-emerald-300 font-mono">{item.robi_ratio} : 1</span>
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
