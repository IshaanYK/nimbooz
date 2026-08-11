"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { RealFieldMap } from "@/components/RealFieldMap";
import { DataBadge } from "@/components/DataBadge";
import { getStoredProfile } from "@/lib/userStore";
import { MapPin, Plus, Sprout, Layers, ChevronRight, AlertTriangle, CheckCircle2, Sliders, Thermometer, Droplets } from "lucide-react";

export default function MyFieldsPage() {
  const profile = getStoredProfile();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFieldLat, setSelectedFieldLat] = useState<number>(profile.gpsLocation?.lat || 23.2599);
  const [selectedFieldLon, setSelectedFieldLon] = useState<number>(profile.gpsLocation?.lon || 77.4126);

  const fields = [
    {
      id: "bhopal-01",
      name: profile.fieldName || "Bhopal Soybean Field 01",
      crop: "Soybean (JS-335)",
      areaHa: profile.fieldAreaHa || 4.2,
      location: `${profile.village || "Patel Nagar"}, ${profile.district || "Bhopal"}`,
      stage: "R2 Flowering",
      riskLevel: "HIGH ALERT (78%)",
      riskType: "Night Heat Stress",
      lastActivity: "Biostimulant Applied (Aug 14)",
      lat: profile.gpsLocation?.lat || 23.2599,
      lon: profile.gpsLocation?.lon || 77.4126,
      color: "border-[#00A878] bg-white",
      statusBadge: "bg-rose-50 text-rose-600 border-rose-200",
    },
    {
      id: "nagpur-02",
      name: "Nagpur Cotton Field 02",
      crop: "Cotton (Bt Cotton II)",
      areaHa: 3.8,
      location: "Katol, Nagpur",
      stage: "Square Formation",
      riskLevel: "MODERATE (42%)",
      riskType: "Sucking Pest Watch",
      lastActivity: "Soil Moisture Logged (Aug 10)",
      lat: 21.1458,
      lon: 79.0882,
      color: "border-slate-200 bg-white",
      statusBadge: "bg-amber-50 text-amber-600 border-amber-200",
    },
    {
      id: "pune-03",
      name: "Pune Sugarcane Field 03",
      crop: "Sugarcane (Co-86032)",
      areaHa: 2.8,
      location: "Shirur, Pune",
      stage: "Tillering Phase",
      riskLevel: "LOW (15%)",
      riskType: "Normal Baseline",
      lastActivity: "Season Impact Verified (July 28)",
      lat: 18.5204,
      lon: 73.8567,
      color: "border-slate-200 bg-white",
      statusBadge: "bg-[#DDF7EC] text-[#063B2D] border-[#00A878]/30",
    },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-[#00A878] uppercase bg-[#DDF7EC] px-3 py-1 rounded-full border border-[#00A878]/30">
                FARM PORTFOLIO & REAL MAP
              </span>
              <DataBadge type="LIVE_METEOBLUE" />
              <DataBadge type="LIVE_CEHUB" />
            </div>
            <h1 className="text-3xl font-black font-display text-[#10241F] mt-1">My Fields</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Manage your registered crop fields, draw field boundary polygons, and inspect live weather overlays.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-[#00A878] hover:bg-[#063B2D] text-white font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Add Field</span>
          </button>
        </div>

        {/* Real Field Leaflet Map */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#10241F] text-lg font-display flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#00A878]" /> Interactive Field Polygon Map (Leaflet Satellite)
            </h3>
            <DataBadge type="USER_PROVIDED" customText="FIELD POLYGONS" />
          </div>

          <RealFieldMap
            initialLat={selectedFieldLat}
            initialLon={selectedFieldLon}
            crop={profile.primaryCrop || "soybean"}
            fieldName={profile.fieldName || "Bhopal Field 01"}
            fieldAreaHa={profile.fieldAreaHa || 4.2}
            allowDrawing={true}
          />
        </div>

        {/* Field Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fields.map((f, idx) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              onClick={() => {
                setSelectedFieldLat(f.lat);
                setSelectedFieldLon(f.lon);
              }}
              className={`p-6 rounded-3xl border-2 ${f.color} shadow-xl flex flex-col justify-between space-y-6 hover:shadow-2xl hover:border-[#00A878] transition-all cursor-pointer group`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">FIELD 0{idx + 1}</span>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${f.statusBadge}`}>
                    {f.riskLevel}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black font-display text-[#10241F] group-hover:text-[#00A878] transition-colors">
                    {f.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-[#00A878]" /> {f.location}
                  </p>
                </div>

                <div className="bg-[#F7F6EF] p-4 rounded-2xl border border-slate-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-700 font-bold">
                    <span>Crop & Variety:</span>
                    <span className="text-[#063B2D]">{f.crop}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Area:</span>
                    <span>{f.areaHa} ha ({(f.areaHa * 2.47).toFixed(1)} acres)</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Current Stage:</span>
                    <span className="text-[#00A878] font-bold">{f.stage}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">{f.lastActivity}</span>
                <span className="font-black text-[#00A878] group-hover:text-[#063B2D] flex items-center gap-1">
                  Fly To Field <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Field Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans">
            <div className="bg-white text-[#10241F] p-7 rounded-3xl max-w-md w-full space-y-5 border border-emerald-500/20 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-lg font-black font-display text-[#10241F] flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[#00A878]" /> Add New Field
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); alert("New field registered!"); }} className="space-y-4 text-xs font-bold">
                <div className="space-y-1">
                  <label>Field Name</label>
                  <input type="text" placeholder="e.g. Sehore Wheat Field 04" className="w-full p-3 rounded-xl bg-[#F7F6EF] border border-slate-300 outline-none focus:ring-2 focus:ring-[#00A878]" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label>Crop</label>
                    <select className="w-full p-3 rounded-xl bg-[#F7F6EF] border border-slate-300 outline-none focus:ring-2 focus:ring-[#00A878]">
                      <option>Soybean</option>
                      <option>Cotton</option>
                      <option>Wheat</option>
                      <option>Rice</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label>Area (ha)</label>
                    <input type="number" step="0.1" placeholder="3.0" className="w-full p-3 rounded-xl bg-[#F7F6EF] border border-slate-300 outline-none focus:ring-2 focus:ring-[#00A878]" required />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#00A878] text-white font-black">Save Field</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
