"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/AdminShell";
import {
  getWebsiteSettings,
  updateWebsiteSettings,
  sendFarmerBroadcast,
  clearFarmerBroadcast,
  MAIN_SITE_URL,
} from "@/lib/api";
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
  RefreshCw,
  XCircle,
  Clock,
} from "lucide-react";

type FeatureFlags = {
  voiceAssistant: boolean;
  mandiPrices: boolean;
  weatherTelemetry: boolean;
  journalFeature: boolean;
  fieldMapping: boolean;
  robiAudit: boolean;
  plantIntelligence: boolean;
};

const FEATURE_DEFS: { key: keyof FeatureFlags; label: string; desc: string; icon: React.ElementType }[] = [
  { key: "voiceAssistant", label: "Voice AI Assistant", desc: "Chirp 3 HD speech recognition and TTS advisory responses", icon: Bell },
  { key: "mandiPrices", label: "APMC Mandi Prices", desc: "Live market price data from Agmarknet API", icon: Globe },
  { key: "weatherTelemetry", label: "Weather Telemetry", desc: "Open-Meteo real-time sensor grounding for all advisories", icon: Globe },
  { key: "journalFeature", label: "Farm Journal", desc: "Farmer activity log and crop stage journal entries", icon: Settings },
  { key: "fieldMapping", label: "Field Mapping", desc: "GPS-based field boundary and area calculator", icon: Globe },
  { key: "robiAudit", label: "ROBI ROI Auditor", desc: "Return on Bio-Investment calculation engine", icon: Settings },
  { key: "plantIntelligence", label: "Plant Intelligence Pipeline", desc: "PS-02 & PS-03 ML stress forecast and biological advisor", icon: Settings },
];

export default function WebsiteControlsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "AASRA is currently performing scheduled agricultural system updates. Farm telemetry remains active."
  );
  const [flags, setFlags] = useState<FeatureFlags>({
    voiceAssistant: true,
    mandiPrices: true,
    weatherTelemetry: true,
    journalFeature: true,
    fieldMapping: true,
    robiAudit: true,
    plantIntelligence: true,
  });

  const [activeAlert, setActiveAlert] = useState<{ message: string; createdAt: string; active: boolean } | null>(null);
  const [broadcast, setBroadcast] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getWebsiteSettings();
      if (data) {
        setMaintenanceMode(Boolean(data.maintenanceMode));
        if (data.maintenanceMessage) setMaintenanceMessage(data.maintenanceMessage);
        if (data.featureFlags) {
          setFlags((prev) => ({ ...prev, ...data.featureFlags }));
        }
        setActiveAlert(data.broadcastAlert && data.broadcastAlert.active ? data.broadcastAlert : null);
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggle = (key: keyof FeatureFlags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateWebsiteSettings({
        maintenanceMode,
        maintenanceMessage,
        featureFlags: flags,
      });
      setStatusMsg("Settings synchronized with live production website.");
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err: any) {
      setStatusMsg(`Failed to save: ${err?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcast.trim()) return;
    setBroadcasting(true);
    try {
      const res = await sendFarmerBroadcast(broadcast.trim());
      if (res?.settings?.broadcastAlert) {
        setActiveAlert(res.settings.broadcastAlert);
      } else {
        setActiveAlert({
          message: broadcast.trim(),
          createdAt: new Date().toISOString(),
          active: true,
        });
      }
      setBroadcast("");
      setStatusMsg("Advisory broadcast sent! Farmers will see the top banner on the live website.");
      setTimeout(() => setStatusMsg(""), 5000);
    } catch (err: any) {
      setStatusMsg(`Broadcast failed: ${err?.message || "Check connection"}`);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleClearAlert = async () => {
    try {
      await clearFarmerBroadcast();
      setActiveAlert(null);
      setStatusMsg("Broadcast alert cleared from live website.");
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err: any) {
      setStatusMsg(`Failed to clear alert: ${err?.message}`);
    }
  };

  return (
    <AdminShell>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-primary">
              <Settings size={10} /> Website Controls
            </span>
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>
              Connected to {MAIN_SITE_URL.replace("https://", "")}
            </span>
          </div>
          <h1 className="page-title">Website Management</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
            Control live farmer website feature flags, toggle maintenance mode, and send real-time alerts.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={loadSettings} disabled={loading}>
            <RefreshCw size={14} style={loading ? { animation: "spin 0.7s linear infinite" } : {}} />
            Reload
          </button>
          <a
            href={MAIN_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <ExternalLink size={14} />
            Open Main Site
          </a>
          <button
            className="btn btn-primary"
            onClick={handleSaveSettings}
            disabled={saving || loading}
          >
            {saving ? (
              <><span className="spinner" style={{ width: 12, height: 12 }} /> Saving...</>
            ) : (
              <><Save size={14} /> Save Live Changes</>
            )}
          </button>
        </div>
      </div>

      {/* Status toast */}
      {statusMsg && (
        <div
          className="badge badge-success"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: 13 }}
        >
          <CheckCircle2 size={15} />
          {statusMsg}
        </div>
      )}

      {/* Maintenance Mode Controller */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          border: maintenanceMode ? "1px solid rgba(245,158,11,0.4)" : "1px solid var(--hairline)",
          background: maintenanceMode ? "rgba(245,158,11,0.05)" : "var(--surface-1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: maintenanceMode ? "rgba(245,158,11,0.15)" : "var(--surface-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ShieldOff size={16} color={maintenanceMode ? "#f59e0b" : "var(--ink-tertiary)"} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Emergency Maintenance Mode</div>
              <div style={{ fontSize: 12, color: "var(--ink-tertiary)" }}>
                {maintenanceMode ? "Banner is ACTIVE on live website" : "Banner is currently disabled"}
              </div>
            </div>
          </div>

          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
              display: "flex",
              color: maintenanceMode ? "#f59e0b" : "var(--ink-tertiary)",
              transition: "color 0.15s",
            }}
            title={maintenanceMode ? "Click to disable maintenance mode" : "Click to enable maintenance mode"}
          >
            {maintenanceMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>

        {maintenanceMode && (
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--ink-subtle)", marginBottom: 6 }}>
              Maintenance Notice Banner Text (Shown on live website)
            </label>
            <input
              className="input"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="e.g. Scheduled platform maintenance in progress. Live telemetry remains active."
              style={{ marginBottom: 10 }}
            />
            <p style={{ fontSize: 11, color: "var(--ink-tertiary)" }}>
              Tip: Click &quot;Save Live Changes&quot; in the top right to push this update to the main website.
            </p>
          </div>
        )}
      </div>

      {/* Broadcast Message to Farmers */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
          <Megaphone size={15} color="var(--primary)" />
          Broadcast Advisory Banner to Farmers
        </h2>

        {activeAlert ? (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 8,
              background: "rgba(94,106,210,0.1)",
              border: "1px solid rgba(94,106,210,0.3)",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span className="badge badge-primary" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span className="status-dot online" /> ACTIVE ON LIVE WEBSITE
              </span>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleClearAlert}
                style={{ fontSize: 11 }}
              >
                <XCircle size={13} /> Deactivate Alert
              </button>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, marginBottom: 6 }}>
              &ldquo;{activeAlert.message}&rdquo;
            </div>
            {activeAlert.createdAt && (
              <div style={{ fontSize: 11, color: "var(--ink-tertiary)", display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={11} /> Sent at: {new Date(activeAlert.createdAt).toLocaleString("en-IN")}
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: "var(--ink-subtle)", marginBottom: 12 }}>
            No active broadcast. Post an advisory below to show a high-visibility banner to all farmers visiting the main site.
          </p>
        )}

        <textarea
          className="input"
          placeholder="e.g. Advisory: Heavy rainfall expected in Malwa plateau. Delay foliar pesticide spraying by 36 hours. Contact your local KVK for assistance."
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
              <><Megaphone size={13} /> Broadcast Alert Now</>
            )}
          </button>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <ToggleRight size={15} color="var(--primary)" />
              Main Website Feature Flags
            </h2>
            <p style={{ fontSize: 12, color: "var(--ink-subtle)", marginTop: 2 }}>
              Enable or disable specific modules on the farmer website in real time.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Save size={13} />}
            Save Flags
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
                  background: "var(--surface-2)",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Icon
                    size={15}
                    color={isOn ? "var(--primary)" : "var(--ink-tertiary)"}
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
                    color: isOn ? "var(--primary)" : "var(--ink-tertiary)",
                    transition: "color 0.15s",
                    flexShrink: 0,
                  }}
                  title={isOn ? "Click to turn off" : "Click to turn on"}
                >
                  {isOn ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production System Links */}
      <div className="card">
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
          <Globe size={15} color="var(--primary)" />
          Live Website Verification Links
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
          {[
            { label: "Main Farmer Home", url: MAIN_SITE_URL },
            { label: "Farmer Dashboard", url: `${MAIN_SITE_URL}/dashboard` },
            { label: "Voice AI Advisory", url: `${MAIN_SITE_URL}/assistant` },
            { label: "What-If Simulator", url: `${MAIN_SITE_URL}/what-if` },
            { label: "ROBI Causal Impact", url: `${MAIN_SITE_URL}/impact` },
            { label: "Live System Settings API", url: `${MAIN_SITE_URL}/api/settings` },
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
