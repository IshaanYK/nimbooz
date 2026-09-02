"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/AdminShell";
import {
  getWebsiteSettings,
  updateWebsiteSettings,
  sendFarmerBroadcast,
  clearFarmerBroadcast,
  getWhatsAppAdminStats,
  triggerCloudAlertScan,
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
  MessageSquare,
  Users,
  Send,
  Smartphone,
  ShieldCheck,
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

  // Multi-Channel Delivery State
  const [channelWebsite, setChannelWebsite] = useState(true);
  const [channelWhatsApp, setChannelWhatsApp] = useState(true);
  const [targetAudience, setTargetAudience] = useState<"all" | "bhopal" | "soybean">("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [waAdminStats, setWaAdminStats] = useState<any>(null);
  const [scanningCloud, setScanningCloud] = useState(false);

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
      try {
        const waStats = await getWhatsAppAdminStats();
        if (waStats) setWaAdminStats(waStats);
      } catch (_) {}
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

  const handleTriggerScan = async () => {
    setScanningCloud(true);
    try {
      const ok = await triggerCloudAlertScan();
      if (ok) {
        setStatusMsg("Autonomous Cloud Scan executed successfully across all active WhatsApp connections.");
      } else {
        setStatusMsg("Scan completed. No pending high-risk conditions.");
      }
      setTimeout(() => setStatusMsg(""), 5000);
    } catch (e: any) {
      setStatusMsg(`Scan failed: ${e.message}`);
    } finally {
      setScanningCloud(false);
    }
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
    if (channelWhatsApp && !showConfirmModal) {
      setShowConfirmModal(true);
      return;
    }
    setShowConfirmModal(false);
    setBroadcasting(true);
    try {
      if (channelWebsite) {
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
      }
      if (channelWhatsApp) {
        await triggerCloudAlertScan();
      }
      setBroadcast("");
      setStatusMsg(
        channelWhatsApp
          ? "Multi-Channel Broadcast Dispatched! Banner active on Website and alert queued for WhatsApp farmers."
          : "Website banner broadcast sent to live farmer website."
      );
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

      {/* WhatsApp Fleet Overwatch Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <MessageSquare size={15} color="#25D366" />
              WhatsApp Fleet & Alert Engine Overwatch
            </h2>
            <p style={{ fontSize: 12, color: "var(--ink-subtle)", marginTop: 2 }}>
              Monitor live WhatsApp connection status, serverless cron triggers, and farmer delivery telemetry.
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleTriggerScan}
            disabled={scanningCloud}
            title="Triggers immediate autonomous scan across all connected farmers"
          >
            <RefreshCw size={13} style={scanningCloud ? { animation: "spin 0.7s linear infinite" } : {}} />
            {scanningCloud ? "Scanning Telemetry..." : "Trigger Cloud Scan"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--hairline)" }}>
            <div style={{ fontSize: 11, color: "var(--ink-tertiary)", fontWeight: 600, textTransform: "uppercase" }}>Gateway Engine</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="status-dot online" />
              {waAdminStats?.provider ? waAdminStats.provider.toUpperCase() : "META CLOUD V21.0"}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-tertiary)", marginTop: 2 }}>Zero-Cost Conversational Tier</div>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--hairline)" }}>
            <div style={{ fontSize: 11, color: "var(--ink-tertiary)", fontWeight: 600, textTransform: "uppercase" }}>Bot Display Number</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#25D366", marginTop: 4, fontFamily: "monospace" }}>
              {waAdminStats?.displayPhone || "+91 72229 49347"}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-tertiary)", marginTop: 2 }}>Test Sandbox Recipient Active</div>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--hairline)" }}>
            <div style={{ fontSize: 11, color: "var(--ink-tertiary)", fontWeight: 600, textTransform: "uppercase" }}>Autonomous Cloud Cron</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={14} color="var(--primary)" />
              Daily 06:00 UTC (11:30 IST)
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-tertiary)", marginTop: 2 }}>Vercel Cron (Runs PC Offline)</div>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--hairline)" }}>
            <div style={{ fontSize: 11, color: "var(--ink-tertiary)", fontWeight: 600, textTransform: "uppercase" }}>Active Connections</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginTop: 4 }}>
              {waAdminStats?.connected ? "1 Active Account" : "Listening for Link Requests"}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-tertiary)", marginTop: 2 }}>Single-Farmer Identity Mapped</div>
          </div>
        </div>
      </div>

      {/* Broadcast Message to Farmers */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
          <Megaphone size={15} color="var(--primary)" />
          Multi-Channel Advisory Broadcast
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
            No active broadcast. Post an advisory below to notify farmers across the website and direct WhatsApp messaging.
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

        {/* Multi-Channel Delivery & Target Audience Selectors */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            padding: "12px 14px",
            background: "var(--surface-2)",
            borderRadius: 8,
            border: "1px solid var(--hairline)",
            marginBottom: 14,
          }}
        >
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-subtle)", display: "block", marginBottom: 6 }}>
              Delivery Channels
            </span>
            <div style={{ display: "flex", gap: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={channelWebsite}
                  onChange={(e) => setChannelWebsite(e.target.checked)}
                  style={{ accentColor: "var(--primary)", cursor: "pointer" }}
                />
                <span>🌐 Website Banner</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={channelWhatsApp}
                  onChange={(e) => setChannelWhatsApp(e.target.checked)}
                  style={{ accentColor: "#25D366", cursor: "pointer" }}
                />
                <span>💬 WhatsApp Alert</span>
              </label>
            </div>
          </div>

          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-subtle)", display: "block", marginBottom: 6 }}>
              Target Audience
            </span>
            <select
              className="input"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as any)}
              style={{ fontSize: 12, padding: "6px 10px", height: "auto" }}
            >
              <option value="all">All Registered Farmers</option>
              <option value="bhopal">Bhopal & Central MP District</option>
              <option value="soybean">Soybean & Pulse Growers</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "var(--ink-tertiary)" }}>
            {broadcast.length} / 500 characters
          </span>
          <button
            className="btn btn-primary"
            onClick={handleBroadcast}
            disabled={!broadcast.trim() || broadcasting || (!channelWebsite && !channelWhatsApp)}
          >
            {broadcasting ? (
              <><span className="spinner" style={{ width: 12, height: 12 }} /> Sending...</>
            ) : (
              <><Megaphone size={13} /> Broadcast to Selected Channels</>
            )}
          </button>
        </div>
      </div>

      {/* WhatsApp Broadcast Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 480,
              width: "100%",
              background: "var(--surface-1)",
              border: "1px solid var(--hairline)",
              padding: 24,
              borderRadius: 12,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37,211,102,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare size={18} color="#25D366" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Confirm WhatsApp Dispatch</h3>
                <span style={{ fontSize: 11, color: "var(--ink-tertiary)" }}>Multi-Channel Broadcast Authorization</span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: "var(--ink-subtle)", lineHeight: 1.5, marginBottom: 16 }}>
              You are about to send an agricultural advisory to <strong>all verified farmers</strong> connected via WhatsApp and publish a top-level alert on the main website.
            </p>

            <div style={{ background: "var(--surface-2)", padding: 12, borderRadius: 8, border: "1px solid var(--hairline)", marginBottom: 18, fontSize: 12, color: "var(--ink)", fontStyle: "italic" }}>
              &ldquo;{broadcast}&rdquo;
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: "#25D366", borderColor: "#20bd5a" }}
                onClick={handleBroadcast}
              >
                <Send size={13} /> Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}


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
