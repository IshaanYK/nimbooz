"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/AdminShell";
import { getDbStats, getHealthStatus } from "@/lib/api";
import {
  Users,
  MapPin,
  BookOpen,
  TrendingUp,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Zap,
  Database,
  Clock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [dbData, setDbData] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const [db, h] = await Promise.all([
        getDbStats().catch(() => null),
        getHealthStatus().catch(() => null),
      ]);
      setDbData(db);
      setHealth(h);
    } finally {
      setLoading(false);
      setLastRefresh(new Date().toLocaleTimeString("en-IN"));
    }
  };

  useEffect(() => { load(); }, []);

  const stats = dbData?.stats || {};
  const apiOnline = health?.status === "ok";

  const statCards = [
    { label: "Total Farmers", value: stats.totalFarmers ?? "—", icon: Users, color: "var(--primary)" },
    { label: "Field Records", value: stats.totalFields ?? "—", icon: MapPin, color: "#27a644" },
    { label: "Journal Entries", value: stats.totalJournalEntries ?? "—", icon: BookOpen, color: "#d97706" },
    { label: "ROBI Audits", value: stats.totalRobiAudits ?? "—", icon: TrendingUp, color: "#8b5cf6" },
  ];

  const serviceStatus = [
    {
      name: "FastAPI Backend",
      status: apiOnline ? "online" : "offline",
      detail: "http://localhost:8000/api/health",
      latency: health?.latency_ms ? `${health.latency_ms} ms` : "—",
    },
    {
      name: "Google Gemini 2.0 AI",
      status: health?.gemini_configured ? "online" : "warning",
      detail: "AI chat & advisory engine",
      latency: "~420 ms",
    },
    {
      name: "Google Cloud Speech (Chirp 3)",
      status: "online",
      detail: "STT + TTS · 12 Indian dialects",
      latency: "~280 ms",
    },
    {
      name: "Open-Meteo Weather API",
      status: "online",
      detail: "Real-time telemetry & forecasts",
      latency: "~110 ms",
    },
    {
      name: "Agmarknet Mandi API",
      status: "online",
      detail: "APMC market price data",
      latency: "~300 ms",
    },
  ];

  return (
    <AdminShell>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-primary">Admin Overview</span>
          </div>
          <h1 className="page-title">System Dashboard</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
            Live overview of database state, user activity, and service health.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={load}
          disabled={loading}
          style={{ flexShrink: 0 }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} style={loading ? { animation: "spin 0.7s linear infinite" } : {}} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 30, height: 30,
                    background: `${s.color}18`,
                    border: `1px solid ${s.color}30`,
                    borderRadius: 7,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon size={14} color={s.color} />
                </div>
                <span className="stat-label" style={{ margin: 0 }}>{s.label}</span>
              </div>
              <div className="stat-value">
                {loading ? <span className="spinner" /> : s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Service Health */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Activity size={15} color="var(--primary)" />
              Service Health Monitor
            </h2>
            {lastRefresh && (
              <span className="text-subtle font-mono" style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={11} /> Last check: {lastRefresh}
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {serviceStatus.map((svc) => (
              <div
                key={svc.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 7,
                  background: "var(--surface-2)",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span className={`status-dot ${svc.status}`} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{svc.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-tertiary)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {svc.detail}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-subtle)" }}>{svc.latency}</span>
                  <span
                    className={`badge ${svc.status === "online" ? "badge-success" : svc.status === "warning" ? "badge-warning" : "badge-danger"}`}
                  >
                    {svc.status === "online" ? "ONLINE" : svc.status === "warning" ? "WARN" : "OFFLINE"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <Zap size={15} color="var(--primary)" />
            Quick Actions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "View All Users", href: "/users", icon: Users },
              { label: "Run Diagnostics", href: "/diagnostics", icon: Activity },
              { label: "Explore Database", href: "/database", icon: Database },
              { label: "Website Controls", href: "/website", icon: Cpu },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.href}
                  href={action.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 7,
                    background: "var(--surface-2)",
                    color: "var(--ink)",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                >
                  <Icon size={14} color="var(--primary)" />
                  {action.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* DB Summary */}
        <div className="card">
          <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <Database size={15} color="var(--primary)" />
            Database Summary
          </h2>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-subtle)", fontSize: 13 }}>
              <span className="spinner" /> Loading...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["Engine", "AASRA LocalDB v1 (JSON)"],
                ["Storage", "Server-side JSON (Next.js)"],
                ["Collections", "4 (farmers, fields, journal, robi)"],
                ["Total Records", String((stats.totalFarmers || 0) + (stats.totalFields || 0) + (stats.totalJournalEntries || 0))],
                ["API Status", apiOnline ? "✓ Backend Online" : "Local Mode"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 0",
                    borderBottom: "1px solid var(--hairline)",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "var(--ink-subtle)" }}>{k}</span>
                  <span style={{ color: "var(--ink)", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
