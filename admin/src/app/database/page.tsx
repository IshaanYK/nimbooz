"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/AdminShell";
import { getDbStats, seedDatabase, resetDatabase } from "@/lib/api";
import {
  Database,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Users,
  MapPin,
  BookOpen,
  TrendingUp,
  Code,
} from "lucide-react";

export default function DatabaseAdminPage() {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"farmers" | "fields" | "journal" | "robi" | "raw">("farmers");
  const [seeding, setSeeding] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await getDbStats();
      setDbData(d);
    } catch {
      setDbData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 5000); };

  const handleSeed = async () => {
    setSeeding(true);
    const r = await seedDatabase();
    showMsg(r.message || "Database seeded with benchmark data.");
    await load();
    setSeeding(false);
  };

  const handleReset = async () => {
    setResetting(true);
    setConfirmReset(false);
    const r = await resetDatabase();
    showMsg(r.message || "Database reset and reseeded.");
    await load();
    setResetting(false);
  };

  const stats = dbData?.stats || {};
  const data = dbData?.data || {};

  const TABS = [
    { id: "farmers", label: "Farmers", icon: Users, count: stats.totalFarmers },
    { id: "fields", label: "Fields", icon: MapPin, count: stats.totalFields },
    { id: "journal", label: "Journal", icon: BookOpen, count: stats.totalJournalEntries },
    { id: "robi", label: "ROBI Audits", icon: TrendingUp, count: stats.totalRobiAudits },
    { id: "raw", label: "Raw JSON", icon: Code, count: null },
  ];

  const activeData = activeTab === "raw" ? dbData : data[activeTab === "robi" ? "robiAudits" : activeTab];

  return (
    <AdminShell>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-primary">
              <Database size={10} /> Database Explorer
            </span>
          </div>
          <h1 className="page-title">Database Management</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
            Inspect, seed, or reset AASRA database collections.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw size={14} style={loading ? { animation: "spin 0.7s linear infinite" } : {}} />
            Refresh
          </button>
          <button className="btn btn-secondary" onClick={handleSeed} disabled={seeding || loading}>
            {seeding ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Seeding...</> : "Seed Data"}
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setConfirmReset(true)}
            disabled={resetting || loading}
          >
            <Trash2 size={13} />
            Reset DB
          </button>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div className="badge badge-success" style={{ display: "flex", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
          {msg}
        </div>
      )}

      {/* Confirm reset modal */}
      {confirmReset && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 24,
          }}
        >
          <div className="card-featured" style={{ maxWidth: 360, width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <AlertTriangle size={20} color="#fbbf24" />
              <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>Reset Database?</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>
              This will wipe all current data and restore default benchmark seed records. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmReset(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReset}>
                <Trash2 size={13} /> Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[
          { label: "Farmers", value: stats.totalFarmers, icon: Users },
          { label: "Fields", value: stats.totalFields, icon: MapPin },
          { label: "Journal Entries", value: stats.totalJournalEntries, icon: BookOpen },
          { label: "ROBI Audits", value: stats.totalRobiAudits, icon: TrendingUp },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon size={18} color="var(--primary)" />
                {loading ? "—" : (s.value ?? 0)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab nav */}
      <div
        style={{
          display: "flex", gap: 2, padding: 4,
          background: "var(--surface-1)",
          border: "1px solid var(--hairline)",
          borderRadius: 10, marginBottom: 16,
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 7,
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                border: "none",
                background: isActive ? "var(--surface-3)" : "transparent",
                color: isActive ? "var(--ink)" : "var(--ink-subtle)",
                transition: "all 0.1s",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={13} />
              {tab.label}
              {tab.count != null && (
                <span
                  style={{
                    fontSize: 10, padding: "1px 5px", borderRadius: 9999,
                    background: isActive ? "var(--primary)" : "var(--surface-2)",
                    color: isActive ? "white" : "var(--ink-tertiary)",
                  }}
                >
                  {tab.count ?? 0}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-subtle)", fontSize: 13 }}>
            <span className="spinner" style={{ display: "inline-block", marginBottom: 10 }} />
            <br />Loading data...
          </div>
        ) : activeTab === "raw" ? (
          <pre
            className="font-mono"
            style={{
              padding: 20,
              fontSize: 11,
              color: "var(--ink-muted)",
              overflow: "auto",
              maxHeight: 600,
              lineHeight: 1.6,
            }}
          >
            {JSON.stringify(dbData, null, 2)}
          </pre>
        ) : !activeData || (Array.isArray(activeData) && activeData.length === 0) ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-subtle)", fontSize: 13 }}>
            No records in this collection. Try seeding the database.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  {Object.keys((Array.isArray(activeData) ? activeData[0] : {}) || {})
                    .slice(0, 8)
                    .map((k) => (
                      <th key={k}>{k}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(activeData) ? activeData : [activeData]).map((row: any, i: number) => (
                  <tr key={row?.id || i}>
                    {Object.values(row || {})
                      .slice(0, 8)
                      .map((v: any, j: number) => (
                        <td key={j} style={{ maxWidth: 200 }}>
                          <span
                            className="font-mono"
                            style={{
                              fontSize: 11,
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={typeof v === "object" ? JSON.stringify(v) : String(v)}
                          >
                            {typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}
                          </span>
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
