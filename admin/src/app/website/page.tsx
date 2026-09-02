"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import {
  Settings,
  Globe,
  Bell,
  ShieldOff,
  Megaphone,
  ToggleLeft,
  ToggleRight,
  Save,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

type FeatureFlags = {
  voiceAssistant: boolean;
  mandiPrices: boolean;
  weatherTelemetry: boolean;
  journalFeature: boolean;
  fieldMapping: boolean;
  robiAudit: boolean;
  plantIntelligence: boolean;
  maintenanceMode: boolean;
};

const FEATURE_DEFS: { key: keyof FeatureFlags; label: string; desc: string; icon: React.ElementType; danger?: boolean }[] = [
  { key: "voiceAssistant", label: "Voice AI Assistant", desc: "Chirp 3 HD speech recognition and TTS advisory responses", icon: Bell },
  { key: "mandiPrices", label: "APMC Mandi Prices", desc: "Live market price data from Agmarknet API", icon: Globe },
  { key: "weatherTelemetry", label: "Weather Telemetry", desc: "Open-Meteo real-time sensor grounding for all advisories", icon: Globe },
  { key: "journalFeature", label: "Farm Journal", desc: "Farmer activity log and crop stage journal entries", icon: Settings },
  { key: "fieldMapping", label: "Field Mapping", desc: "GPS-based field boundary and area calculator", icon: Globe },
  { key: "robiAudit", label: "ROBI ROI Auditor", desc: "Return on Bio-Investment calculation engine", icon: Settings },
  { key: "plantIntelligence", label: "Plant Intelligence Pipeline", desc: "PS-02 & PS-03 ML stress forecast and biological advisor", icon: Settings },
  { key: "maintenanceMode", label: "Maintenance Mode", desc: "Show maintenance banner on main website to all users", icon: ShieldOff, danger: true },
];

export default function WebsiteControlsPage() {
  const [flags, setFlags] = useState<FeatureFlags>({
    voiceAssistant: true,
    mandiPrices: true,
    weatherTelemetry: true,
    journalFeature: true,
    fieldMapping: true,
    robiAudit: true,
    plantIntelligence: true,
    maintenanceMode: false,
  });

  const [broadcast, setBroadcast] = useState("");
  const [saved, setSaved] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleToggle = (key: keyof FeatureFlags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    // In production this would POST to an API endpoint
    // For MVP, changes are stored in component state
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleBroadcast = async () => {
    if (!broadcast.trim()) return;
    setBroadcasting(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulate API call
    setBroadcastSent(true);
    setBroadcast("");
    setBroadcasting(false);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  const mainUrl = process.env.NEXT_PUBLIC_MAIN_API_URL || "http://localhost:3000";

  return (
    <AdminShell>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-primary">
              <Settings size={10} /> Website Controls
            </span>
          </div>
          <h1 className="page-title">Website Management</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
            Toggle feature flags, enable maintenance mode, and broadcast alerts to farmers.
          </p>
        </div>
        <a
          href={mainUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          <ExternalLink size={14} />
          Open Main Site
        </a>
      </div>

      {/* Maintenance mode banner */}
      {flags.maintenanceMode && (
        <div
          className="badge badge-danger"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 13,
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <strong>Maintenance Mode is ON</strong> — The main website is showing a maintenance banner to all farmers.
        </div>
      )}

      {/* Feature Flags */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <ToggleRight size={15} color="var(--primary)" />
            Feature Flags
          </h2>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            style={{ gap: 5 }}
          >
            {saved ? (
              <><CheckCircle2 size={13} /> Saved!</>
            ) : (
              <><Save size={13} /> Save Changes</>
            )}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {FEATURE_DEFS.map((f) => {
            const Icon = f.icon;
            const isOn = flags[f.key];
            return (
              <div
                key={f.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: f.danger && isOn ? "rgba(220,38,38,0.08)" : "var(--surface-2)",
                  border: f.danger && isOn ? "1px solid rgba(220,38,38,0.2)" : "1px solid transparent",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Icon
                    size={15}
                    color={f.danger ? "#f87171" : isOn ? "var(--primary)" : "var(--ink-tertiary)"}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{f.label}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-tertiary)", marginTop: 1 }}>{f.desc}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(f.key)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    display: "flex",
                    color: isOn ? (f.danger ? "#f87171" : "var(--primary)") : "var(--ink-tertiary)",
                    transition: "color 0.15s",
                    flexShrink: 0,
                  }}
                  title={isOn ? "Click to disable" : "Click to enable"}
                >
                  {isOn ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Broadcast Message */}
      <div className="card">
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
          <Megaphone size={15} color="var(--primary)" />
          Broadcast Alert to Farmers
        </h2>

        {broadcastSent && (
          <div
            className="badge badge-success"
            style={{ display: "flex", gap: 6, padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 12 }}
          >
            <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            Alert broadcast queued successfully. Farmers will see this on next login.
          </div>
        )}

        <p style={{ fontSize: 12, color: "var(--ink-subtle)", marginBottom: 12 }}>
          Send a system-wide advisory message that appears as a banner on the main AASRA website for all logged-in farmers.
        </p>
        <textarea
          className="input"
          placeholder="e.g. Advisory: Heavy rainfall expected in Vidarbha region. Delay foliar spraying for 48 hours. Stay safe."
          value={broadcast}
          onChange={(e) => setBroadcast(e.target.value)}
          rows={3}
          style={{ resize: "vertical", marginBottom: 12, lineHeight: 1.5 }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "var(--ink-tertiary)" }}>
            {broadcast.length} / 500 characters
          </span>
          <button
            className="btn btn-primary"
            onClick={handleBroadcast}
            disabled={!broadcast.trim() || broadcasting}
          >
            {broadcasting ? (
              <><span className="spinner" style={{ width: 12, height: 12 }} /> Sending...</>
            ) : (
              <><Megaphone size={13} /> Broadcast Alert</>
            )}
          </button>
        </div>
      </div>

      {/* System Links */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
          <Globe size={15} color="var(--primary)" />
          Quick Links
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
          {[
            { label: "Main Website", url: mainUrl },
            { label: "Dashboard", url: `${mainUrl}/dashboard` },
            { label: "AI Assistant", url: `${mainUrl}/assistant` },
            { label: "Weather", url: `${mainUrl}/weather` },
            { label: "API Health", url: `${mainUrl}/api/health` },
            { label: "Vercel Project", url: "https://vercel.com" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ justifyContent: "space-between" }}
            >
              <span>{link.label}</span>
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
