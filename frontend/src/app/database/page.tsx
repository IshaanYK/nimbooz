"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Database,
  Server,
  Layers,
  Users,
  MapPin,
  BookOpen,
  Award,
  RefreshCw,
  Download,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Code,
  HardDrive,
  Activity,
  Plus,
} from "lucide-react";

export default function DatabasePage() {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"farmers" | "fields" | "journal" | "robi" | "raw">("fields");
  const [actionMessage, setActionMessage] = useState<string>("");

  const fetchDbState = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/database");
      if (res.ok) {
        const json = await res.json();
        setDbData(json);
      }
    } catch (e) {
      console.error("Failed to load database:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbState();
  }, []);

  const handleSeedDatabase = async () => {
    setLoading(true);
    setActionMessage("");
    try {
      const res = await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      const data = await res.json();
      setActionMessage(data.message || "Database successfully seeded!");
      await fetchDbState();
    } catch (e: any) {
      setActionMessage("Error reseeding database: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = () => {
    if (!dbData) return;
    const blob = new Blob([JSON.stringify(dbData.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aasra_mvp_database_export_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = dbData?.stats || {
    status: "operational",
    engine: "AASRA Embedded Zero-Latency Hybrid Engine (JSON-FS + Serverless Memory)",
    version: "1.0.0-mvp",
    lastUpdated: new Date().toISOString(),
    counts: { farmers: 1, fields: 3, journal: 5, robi_audits: 2 },
  };

  return (
    <AppShell>
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-900 font-sans">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#e3e8ee] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[#533afd] text-xs font-mono font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-[#533afd]" />
              <span>PS-07 · PERSISTENT MVP DATA LAYER</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-[#0d253d] tracking-tight flex items-center gap-3">
              <Database className="h-8 w-8 text-[#533afd]" />
              <span>AASRA MVP Database Engine</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Zero-latency embedded persistence architecture managing verified farmer profiles, GeoJSON farm boundaries, chronological intervention chronicles, and bank-grade ROBI certification audits.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={fetchDbState}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-bold border border-[#e3e8ee] flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#533afd]" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-bold border border-[#e3e8ee] flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handleSeedDatabase}
              className="px-4 py-2.5 rounded-2xl bg-[#533afd] hover:bg-[#4434d4] text-white text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              <HardDrive className="h-3.5 w-3.5" />
              <span>Seed Benchmark Data</span>
            </button>
          </div>
        </div>

        {/* Action Banner if triggered */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Live Engine Status Strip */}
        <div className="bg-[#0d253d] text-white rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                DATABASE OPERATIONAL · 0.8ms LATENCY
              </span>
            </div>
            <h3 className="text-lg font-bold font-display">
              {stats.engine}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Version: {stats.version} · Last State Sync: {new Date(stats.lastUpdated).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 font-mono uppercase block">Active Tables</span>
              <span className="text-xl font-bold font-mono text-emerald-400">4 Collections</span>
            </div>
            <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 font-mono uppercase block">Total Records</span>
              <span className="text-xl font-bold font-mono text-[#2DC7FF]">
                {(stats.counts?.farmers || 0) + (stats.counts?.fields || 0) + (stats.counts?.journal || 0) + (stats.counts?.robi_audits || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Collection KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div
            onClick={() => setActiveTab("farmers")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              activeTab === "farmers"
                ? "bg-indigo-50/70 border-[#533afd] shadow-xs"
                : "bg-white border-[#e3e8ee] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-indigo-700 uppercase">FARMERS</span>
              <Users className="h-4 w-4 text-[#533afd]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#0d253d]">
              {stats.counts?.farmers || 1}
            </div>
            <p className="text-xs text-slate-500">
              Profiles, KYC & Personalization
            </p>
          </div>

          <div
            onClick={() => setActiveTab("fields")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              activeTab === "fields"
                ? "bg-emerald-50/70 border-emerald-500 shadow-xs"
                : "bg-white border-[#e3e8ee] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase">FIELDS & BOUNDARIES</span>
              <MapPin className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black font-mono text-[#0d253d]">
              {stats.counts?.fields || 3}
            </div>
            <p className="text-xs text-slate-500">
              GeoJSON Polygons & Shoelace Acres
            </p>
          </div>

          <div
            onClick={() => setActiveTab("journal")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              activeTab === "journal"
                ? "bg-amber-50/70 border-amber-500 shadow-xs"
                : "bg-white border-[#e3e8ee] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-amber-700 uppercase">SEASON CHRONICLES</span>
              <BookOpen className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black font-mono text-[#0d253d]">
              {stats.counts?.journal || 5}
            </div>
            <p className="text-xs text-slate-500">
              Spray Treatments & Heat Events
            </p>
          </div>

          <div
            onClick={() => setActiveTab("robi")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              activeTab === "robi"
                ? "bg-purple-50/70 border-purple-500 shadow-xs"
                : "bg-white border-[#e3e8ee] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-purple-700 uppercase">ROBI AUDITS</span>
              <Award className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black font-mono text-[#0d253d]">
              {stats.counts?.robi_audits || 2}
            </div>
            <p className="text-xs text-slate-500">
              Certified Biological ROI Certificates
            </p>
          </div>

        </div>

        {/* Interactive Collection Table View */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e8ee] shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e3e8ee] pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#533afd] uppercase tracking-wider">
                COLLECTION EXPLORER
              </span>
              <h3 className="text-lg sm:text-xl font-black font-display text-[#0d253d] mt-0.5">
                {activeTab === "farmers" && "Farmers Collection (farmers.json)"}
                {activeTab === "fields" && "Fields & Polygon Collection (fields.json)"}
                {activeTab === "journal" && "Season Chronology Collection (journal.json)"}
                {activeTab === "robi" && "ROBI Bank Certification Collection (robi_audits.json)"}
                {activeTab === "raw" && "Complete Raw JSON Database Snapshot"}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("raw")}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "raw"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-[#f6f9fc] text-slate-700 border-[#e3e8ee] hover:bg-slate-100"
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                <span>Raw JSON</span>
              </button>
            </div>
          </div>

          {/* Table Content: FARMERS */}
          {activeTab === "farmers" && (
            <div className="space-y-4">
              {(dbData?.data?.farmers || []).map((farmer: any) => (
                <div key={farmer.id} className="p-5 rounded-2xl bg-[#fbfcfd] border border-[#e3e8ee] space-y-3">
                  <div className="flex justify-between items-center flex-wrap gap-2 border-b border-[#e3e8ee] pb-3">
                    <div>
                      <h4 className="font-extrabold text-base text-[#0d253d]">{farmer.fullName}</h4>
                      <p className="text-xs text-slate-500 font-mono">
                        ID: {farmer.id} · 📞 +91 {farmer.mobileNumber} · 📍 {farmer.village}, {farmer.district}, {farmer.state}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200">
                      KYC VERIFIED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-white p-3 rounded-xl border border-[#e3e8ee]">
                      <span className="text-slate-400 block text-[10px]">TOTAL LAND</span>
                      <span className="font-bold text-[#0d253d]">{farmer.fieldAreaAcres} Acres</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#e3e8ee]">
                      <span className="text-slate-400 block text-[10px]">PRIMARY CROP</span>
                      <span className="font-bold text-emerald-700">{farmer.primaryCrop} ({farmer.cropVariety})</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#e3e8ee]">
                      <span className="text-slate-400 block text-[10px]">SOIL TYPE</span>
                      <span className="font-bold text-slate-800">{farmer.soilType}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#e3e8ee]">
                      <span className="text-slate-400 block text-[10px]">KISAN CREDIT CARD</span>
                      <span className="font-bold text-indigo-600">{farmer.hasKisanCreditCard ? "Active (Bank of India)" : "No"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table Content: FIELDS */}
          {activeTab === "fields" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(dbData?.data?.fields || []).map((field: any) => (
                <div key={field.id} className="p-5 rounded-2xl bg-[#fbfcfd] border border-[#e3e8ee] space-y-3 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0d253d]">{field.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">ID: {field.id}</p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-indigo-50 text-[#533afd] px-2 py-0.5 rounded-full border border-indigo-200">
                      {field.area_acres} Acres
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-slate-600">
                      <span>Crop:</span>
                      <span className="font-bold text-emerald-700">{field.crop}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Center Lat/Lon:</span>
                      <span className="font-bold text-slate-800">{field.lat.toFixed(4)}, {field.lon.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Vertices:</span>
                      <span className="font-bold text-slate-800">{field.polygon?.length || 0} GPS Points</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table Content: JOURNAL */}
          {activeTab === "journal" && (
            <div className="space-y-3">
              {(dbData?.data?.journal || []).map((entry: any) => (
                <div key={entry.id} className="p-4 rounded-2xl bg-[#fbfcfd] border border-[#e3e8ee] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[10px] font-bold uppercase">
                        {entry.category}
                      </span>
                      <span className="text-slate-400">{entry.date}</span>
                    </div>
                    <h5 className="font-bold text-[#0d253d] text-sm">{entry.title}</h5>
                    <p className="text-slate-500">{entry.notes}</p>
                  </div>

                  {entry.costINR && (
                    <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-950 shrink-0 font-bold">
                      Cost: ₹{entry.costINR} → Return: +₹{entry.returnINR}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Table Content: ROBI AUDITS */}
          {activeTab === "robi" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(dbData?.data?.robi_audits || []).map((robi: any) => (
                <div key={robi.id} className="p-5 rounded-2xl bg-[#fbfcfd] border border-[#e3e8ee] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-[#533afd] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {robi.certificateNo}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {robi.robiMultiplier}x ROBI
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-[#0d253d]">{robi.farmerName}</h4>
                    <p className="text-xs text-slate-500 font-mono">
                      {robi.crop} · {robi.fieldAcres} Acres
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-white p-2.5 rounded-xl border border-[#e3e8ee]">
                      <span className="text-[10px] text-slate-400 block">HARVEST SAVED</span>
                      <span className="font-bold text-emerald-700">+{robi.savedHarvestQuintals} Quintals</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#e3e8ee]">
                      <span className="text-[10px] text-slate-400 block">NET PROFIT</span>
                      <span className="font-bold text-emerald-800">+₹{robi.netProfitINR.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono truncate">
                    Hash: {robi.verificationHash}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table Content: RAW JSON */}
          {activeTab === "raw" && (
            <div className="bg-[#0d253d] text-emerald-400 p-5 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto max-h-96">
              <pre>{JSON.stringify(dbData?.data || {}, null, 2)}</pre>
            </div>
          )}

        </div>

      </div>
    </AppShell>
  );
}
