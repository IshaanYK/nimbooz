"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AdminShell } from "@/components/AdminShell";
import {
  getDbStats,
  seedDatabase,
  resetDatabase,
  deleteCollectionRecord,
  updateCollectionRecord,
  createFarmer,
  createField,
  createJournalEntry,
  exportDataToCsv,
  exportDataToJson,
} from "@/lib/api";
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
  Download,
  Search,
  Edit3,
  Plus,
  X,
  CheckCircle2,
  FileSpreadsheet,
  FileJson,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function DatabaseAdminPage() {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"farmers" | "fields" | "journal" | "robi" | "raw">("farmers");
  const [searchQuery, setSearchQuery] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  // Modal States
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Form Fields
  const [editFormData, setEditFormData] = useState<any>({});

  // Add Form Fields
  const [addType, setAddType] = useState<"farmer" | "field" | "journal">("farmer");
  const [addFormData, setAddFormData] = useState<any>({});

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

  useEffect(() => {
    load();
  }, []);

  const showMsg = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 5000);
  };

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

  // ── Delete Record ──
  const confirmDelete = async () => {
    if (!deletingRecord) return;
    setActionLoading(true);
    const colName =
      activeTab === "robi" ? "robi" : activeTab;
    const ok = await deleteCollectionRecord(colName, deletingRecord.id);
    if (ok) {
      showMsg(`Record "${deletingRecord.name || deletingRecord.fullName || deletingRecord.title || deletingRecord.id}" deleted.`);
      await load();
    } else {
      showMsg("Failed to delete record. Check server logs.");
    }
    setActionLoading(false);
    setDeletingRecord(null);
  };

  // ── Open Edit Modal ──
  const openEdit = (record: any) => {
    setEditingRecord(record);
    setEditFormData({ ...record });
  };

  // ── Save Edited Record ──
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setActionLoading(true);
    const colName = activeTab === "robi" ? "robi" : activeTab;
    const ok = await updateCollectionRecord(colName, editingRecord.id, editFormData);
    if (ok) {
      showMsg(`Updated record ${editingRecord.id} successfully.`);
      await load();
      setEditingRecord(null);
    } else {
      showMsg("Failed to save changes.");
    }
    setActionLoading(false);
  };

  // ── Create New Record ──
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (addType === "farmer") {
        await createFarmer(addFormData);
        showMsg(`Farmer "${addFormData.fullName}" added to live database.`);
      } else if (addType === "field") {
        await createField(addFormData);
        showMsg(`Field "${addFormData.name}" added to database.`);
      } else if (addType === "journal") {
        await createJournalEntry(addFormData);
        showMsg(`Journal entry "${addFormData.title}" logged.`);
      }
      setShowAddModal(false);
      setAddFormData({});
      await load();
    } catch (err: any) {
      showMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Export Handlers ──
  const handleExportCsv = () => {
    if (activeTab === "raw") {
      exportDataToJson("aasra_database_backup", dbData);
      return;
    }
    const dataList = getActiveDataList();
    if (!dataList || dataList.length === 0) {
      showMsg("No records to export in current collection.");
      return;
    }
    exportDataToCsv(`aasra_${activeTab}`, dataList);
    showMsg(`Exported ${dataList.length} ${activeTab} records as CSV.`);
  };

  const handleExportJson = () => {
    exportDataToJson("aasra_full_database_dump", dbData?.data || dbData);
    showMsg("Full database backup downloaded as JSON.");
  };

  const stats = dbData?.stats || {};
  const counts = stats.counts || {};
  const data = dbData?.data || {};

  const farmersCount = counts.farmers ?? data?.farmers?.length ?? 0;
  const fieldsCount = counts.fields ?? data?.fields?.length ?? 0;
  const journalCount = counts.journal ?? data?.journal?.length ?? 0;
  const robiCount = counts.robi_audits ?? (data?.robiAudits || data?.robi_audits)?.length ?? 0;

  const TABS = [
    { id: "farmers", label: "Farmers (किसान)", icon: Users, count: farmersCount },
    { id: "fields", label: "Fields (खेत)", icon: MapPin, count: fieldsCount },
    { id: "journal", label: "Journal Logs", icon: BookOpen, count: journalCount },
    { id: "robi", label: "ROBI Audits", icon: TrendingUp, count: robiCount },
    { id: "raw", label: "Raw JSON", icon: Code, count: null },
  ];

  function getActiveDataList(): any[] {
    if (activeTab === "robi") return data?.robiAudits || data?.robi_audits || [];
    if (activeTab === "farmers") return data?.farmers || [];
    if (activeTab === "fields") return data?.fields || [];
    if (activeTab === "journal") return data?.journal || [];
    return [];
  }

  // Filtered by Search Query
  const filteredData = useMemo(() => {
    const list = getActiveDataList();
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((item) => {
      return Object.values(item).some((val) => {
        if (typeof val === "string") return val.toLowerCase().includes(q);
        if (typeof val === "number") return val.toString().includes(q);
        if (typeof val === "object" && val !== null) {
          return JSON.stringify(val).toLowerCase().includes(q);
        }
        return false;
      });
    });
  }, [activeTab, data, searchQuery]);

  return (
    <AdminShell>
      {/* ── Top Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="badge badge-primary">
              <Database size={11} /> High-Speed Live Store
            </span>
            <span
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                color: "var(--primary)",
                background: "rgba(99, 102, 241, 0.1)",
                padding: "2px 8px",
                borderRadius: 9999,
              }}
            >
              Zero-Latency JSON-FS
            </span>
          </div>
          <h1 className="page-title">Database Management &amp; Explorer</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
            Inspect, edit, delete, and download full database collections in real-time.
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button className="btn btn-secondary" onClick={load} disabled={loading} title="Refresh records">
            <RefreshCw size={13} style={loading ? { animation: "spin 0.7s linear infinite" } : {}} />
            Refresh
          </button>
          <button className="btn btn-secondary" onClick={handleExportCsv} title="Export active collection as CSV">
            <FileSpreadsheet size={13} color="#10b981" />
            Export CSV
          </button>
          <button className="btn btn-secondary" onClick={handleExportJson} title="Download entire DB as JSON">
            <FileJson size={13} color="#6366f1" />
            Backup JSON
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setAddType(activeTab === "fields" ? "field" : activeTab === "journal" ? "journal" : "farmer");
              setShowAddModal(true);
            }}
          >
            <Plus size={13} /> Add Record
          </button>
          <button className="btn btn-secondary" onClick={handleSeed} disabled={seeding || loading}>
            {seeding ? "Seeding..." : "Seed"}
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setConfirmReset(true)}
            disabled={resetting || loading}
            title="Reset database to default verified benchmark"
          >
            <Trash2 size={13} /> Reset
          </button>
        </div>
      </div>

      {/* ── Notification Message ── */}
      {msg && (
        <div
          className="badge badge-success"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 12,
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#34d399",
          }}
        >
          <CheckCircle2 size={14} />
          {msg}
        </div>
      )}

      {/* ── Stats Metric Cards ── */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[
          { id: "farmers", label: "Farmers (किसान)", value: farmersCount, icon: Users, color: "#6366f1" },
          { id: "fields", label: "Fields (खेत)", value: fieldsCount, icon: MapPin, color: "#10b981" },
          { id: "journal", label: "Journal Logs", value: journalCount, icon: BookOpen, color: "#f59e0b" },
          { id: "robi", label: "ROBI Audits", value: robiCount, icon: TrendingUp, color: "#ec4899" },
        ].map((s) => {
          const Icon = s.icon;
          const isCurrentTab = activeTab === s.id;
          return (
            <div
              key={s.label}
              className="stat-card"
              onClick={() => setActiveTab(s.id as any)}
              style={{
                cursor: "pointer",
                border: isCurrentTab ? `1px solid ${s.color}` : "1px solid var(--hairline)",
                background: isCurrentTab ? "var(--surface-2)" : "var(--surface-1)",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="stat-label">{s.label}</span>
                <Icon size={14} color={s.color} />
              </div>
              <div className="stat-value" style={{ marginTop: 4 }}>
                {loading ? "—" : s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tab Selector & Search Row ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: 2,
            padding: 4,
            background: "var(--surface-1)",
            border: "1px solid var(--hairline)",
            borderRadius: 10,
            overflowX: "auto",
          }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
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
                      fontSize: 10,
                      padding: "1px 6px",
                      borderRadius: 9999,
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

        {/* Real-Time Search Bar */}
        {activeTab !== "raw" && (
          <div style={{ position: "relative", minWidth: 260 }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--ink-subtle)",
              }}
            />
            <input
              type="text"
              placeholder={`Search in ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px 7px 30px",
                background: "var(--surface-1)",
                border: "1px solid var(--hairline)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--ink)",
                outline: "none",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--ink-subtle)",
                  cursor: "pointer",
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Main Data View ── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--ink-subtle)", fontSize: 13 }}>
            <span className="spinner" style={{ display: "inline-block", marginBottom: 12 }} />
            <br />
            Loading live records from AASRA engine...
          </div>
        ) : activeTab === "raw" ? (
          <div>
            <div
              style={{
                padding: "10px 16px",
                borderBottom: "1px solid var(--hairline)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--surface-2)",
              }}
            >
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--ink-muted)" }}>
                Storage File: {stats.storageLocation || "aasra_mvp.json"}
              </span>
              <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 11 }} onClick={handleExportJson}>
                <Download size={11} /> Save Copy
              </button>
            </div>
            <pre
              className="font-mono"
              style={{
                padding: 20,
                fontSize: 11,
                color: "var(--ink-muted)",
                overflow: "auto",
                maxHeight: 650,
                lineHeight: 1.6,
                background: "#08090b",
              }}
            >
              {JSON.stringify(dbData, null, 2)}
            </pre>
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--ink-subtle)", fontSize: 13 }}>
            {searchQuery ? `No records matching "${searchQuery}".` : "No records found in this collection."}
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={handleSeed}>
                Seed Sample Data
              </button>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            {/* ── 1. Farmers Collection Table ── */}
            {activeTab === "farmers" && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Farmer Name &amp; ID</th>
                    <th>Contact Phone</th>
                    <th>Location (District, State)</th>
                    <th>Primary Crop &amp; Variety</th>
                    <th>Area (Acres)</th>
                    <th>Soil &amp; Irrigation</th>
                    <th>Personalization</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((f: any) => (
                    <tr key={f.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--ink)" }}>{f.fullName || f.name}</div>
                        <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-subtle)" }}>
                          {f.id}
                        </div>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                          +91 {f.mobileNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>{f.village ? `${f.village}, ` : ""}{f.district}</div>
                        <div style={{ fontSize: 10, color: "var(--ink-subtle)" }}>{f.state}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: 11 }}>
                          {f.primaryCrop || f.crop || "Soybean"}
                        </span>
                        <div style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 2 }}>
                          {f.cropVariety || "High Yield"}
                        </div>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: "#10b981" }}>
                          {f.fieldAreaAcres || f.area_acres || "5.0"} ac
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 11 }}>{f.soilType || "Clay Loam"}</div>
                        <div style={{ fontSize: 10, color: "var(--ink-subtle)" }}>{f.irrigationType || "Rainfed"}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {f.hasKisanCreditCard && (
                            <span style={{ fontSize: 9, background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "1px 5px", borderRadius: 4 }}>
                              KCC ✓
                            </span>
                          )}
                          {f.pmKisanBeneficiary && (
                            <span style={{ fontSize: 9, background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", padding: "1px 5px", borderRadius: 4 }}>
                              PM-Kisan
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "4px 8px", marginRight: 6 }}
                          onClick={() => openEdit(f)}
                          title="Edit farmer"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "4px 8px" }}
                          onClick={() => setDeletingRecord(f)}
                          title="Delete farmer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── 2. Fields Collection Table ── */}
            {activeTab === "fields" && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Field Name &amp; ID</th>
                    <th>Center GPS Lat/Lon</th>
                    <th>Acreage</th>
                    <th>Assigned Crop</th>
                    <th>Soil Type</th>
                    <th>Polygon Vertices</th>
                    <th>Registered Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((f: any) => (
                    <tr key={f.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--ink)" }}>{f.name}</div>
                        <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-subtle)" }}>{f.id}</div>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                          {f.lat?.toFixed(4)}, {f.lon?.toFixed(4)}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: "#10b981" }}>
                          {f.area_acres} Acres
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-primary">{f.crop}</span>
                        {f.variety && <div style={{ fontSize: 10, color: "var(--ink-subtle)", marginTop: 2 }}>{f.variety}</div>}
                      </td>
                      <td>
                        <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{f.soil_type || "Black Soil"}</span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: 11, color: "#818cf8" }}>
                          {Array.isArray(f.polygon) ? `${f.polygon.length} points` : "—"}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-subtle)" }}>
                          {f.created_at ? f.created_at.slice(0, 10) : "—"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "4px 8px", marginRight: 6 }}
                          onClick={() => openEdit(f)}
                          title="Edit field"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "4px 8px" }}
                          onClick={() => setDeletingRecord(f)}
                          title="Delete field"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── 3. Journal Collection Table ── */}
            {activeTab === "journal" && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Activity Title &amp; Subtitle</th>
                    <th>Date</th>
                    <th>Verified Badge</th>
                    <th>Cost / Return (₹)</th>
                    <th>Agronomic Notes</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((j: any) => (
                    <tr key={j.id}>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background:
                              j.category === "spray"
                                ? "rgba(16, 185, 129, 0.2)"
                                : j.category === "heat"
                                ? "rgba(239, 68, 68, 0.2)"
                                : "rgba(99, 102, 241, 0.2)",
                            color:
                              j.category === "spray"
                                ? "#34d399"
                                : j.category === "heat"
                                ? "#f87171"
                                : "#818cf8",
                            fontSize: 10,
                            textTransform: "uppercase",
                          }}
                        >
                          {j.category}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--ink)" }}>{j.title}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-subtle)" }}>{j.subtitle}</div>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: 11 }}>{j.date}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 10, color: "#10b981", fontWeight: 600 }}>{j.badge}</span>
                      </td>
                      <td>
                        <div className="font-mono" style={{ fontSize: 11 }}>
                          Cost: ₹{j.costINR ?? 0}
                        </div>
                        <div className="font-mono" style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>
                          Gain: +₹{j.returnINR ?? 0}
                        </div>
                      </td>
                      <td style={{ maxWidth: 240 }}>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--ink-muted)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {j.notes}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "4px 8px", marginRight: 6 }}
                          onClick={() => openEdit(j)}
                          title="Edit log"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "4px 8px" }}
                          onClick={() => setDeletingRecord(j)}
                          title="Delete log"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── 4. ROBI Audits Table ── */}
            {activeTab === "robi" && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Certificate No</th>
                    <th>Farmer &amp; Acreage</th>
                    <th>Crop Protected</th>
                    <th>Saved Harvest</th>
                    <th>Financial Gain (ROBI)</th>
                    <th>Multiplier</th>
                    <th>Audit Hash</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((r: any) => (
                    <tr key={r.id || r.certificateNo}>
                      <td>
                        <div className="font-mono" style={{ fontWeight: 600, color: "var(--primary)" }}>
                          {r.certificateNo}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--ink-subtle)" }}>{r.issueDate}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.farmerName}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{r.fieldAcres} Acres</div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{r.crop}</span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: 11, fontWeight: 600 }}>
                          +{r.savedHarvestQuintals} q
                        </span>
                      </td>
                      <td>
                        <div className="font-mono" style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>
                          +₹{r.netProfitINR?.toLocaleString() || r.netProfitINR}
                        </div>
                        <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-subtle)" }}>
                          Cost: ₹{r.inputCostINR?.toLocaleString() || r.inputCostINR}
                        </div>
                      </td>
                      <td>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#10b981",
                          }}
                        >
                          {r.robiMultiplier}x
                        </span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-subtle)" }}>
                          {r.verificationHash ? `${r.verificationHash.slice(0, 10)}...` : "—"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "4px 8px", marginRight: 6 }}
                          onClick={() => openEdit(r)}
                          title="Edit audit"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "4px 8px" }}
                          onClick={() => setDeletingRecord(r)}
                          title="Delete audit"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL: Delete Record Confirmation ── */}
      {deletingRecord && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 150,
            padding: 24,
          }}
        >
          <div className="card-featured" style={{ maxWidth: 400, width: "100%", border: "1px solid rgba(239, 68, 68, 0.4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(239, 68, 68, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ef4444",
                }}
              >
                <Trash2 size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Delete Record</h3>
                <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-subtle)" }}>
                  ID: {deletingRecord.id || deletingRecord.certificateNo}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to delete{" "}
              <strong>
                &quot;{deletingRecord.name || deletingRecord.fullName || deletingRecord.title || deletingRecord.id}&quot;
              </strong>{" "}
              from the live database? This change will be permanently saved.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setDeletingRecord(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={actionLoading}>
                {actionLoading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: In-Place Edit Record ── */}
      {editingRecord && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 150,
            padding: 24,
          }}
        >
          <div
            className="card-featured"
            style={{
              maxWidth: 520,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              border: "1px solid var(--primary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Edit3 size={16} color="var(--primary)" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
                  Edit {activeTab.slice(0, -1).toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                style={{ background: "transparent", border: "none", color: "var(--ink-subtle)", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activeTab === "farmers" && (
                <>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={editFormData.fullName || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={editFormData.mobileNumber || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Acreage (Acres)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        value={editFormData.fieldAreaAcres || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, fieldAreaAcres: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Primary Crop
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={editFormData.primaryCrop || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, primaryCrop: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Crop Variety
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={editFormData.cropVariety || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, cropVariety: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        District
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={editFormData.district || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        State
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={editFormData.state || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "fields" && (
                <>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                      Field Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={editFormData.name || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Area (Acres)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        value={editFormData.area_acres || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, area_acres: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Crop
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={editFormData.crop || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, crop: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        className="input"
                        value={editFormData.lat || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, lat: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        className="input"
                        value={editFormData.lon || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, lon: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "journal" && (
                <>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                      Title
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={editFormData.title || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                      Subtitle
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={editFormData.subtitle || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Cost (₹)
                      </label>
                      <input
                        type="number"
                        className="input"
                        value={editFormData.costINR || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, costINR: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Return (₹)
                      </label>
                      <input
                        type="number"
                        className="input"
                        value={editFormData.returnINR || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, returnINR: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                      Notes
                    </label>
                    <textarea
                      className="input"
                      rows={3}
                      value={editFormData.notes || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    />
                  </div>
                </>
              )}

              {activeTab === "robi" && (
                <>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                      Farmer Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={editFormData.farmerName || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, farmerName: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Saved Harvest (q)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        value={editFormData.savedHarvestQuintals || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, savedHarvestQuintals: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Net Profit (₹)
                      </label>
                      <input
                        type="number"
                        className="input"
                        value={editFormData.netProfitINR || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, netProfitINR: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingRecord(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Add New Record ── */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 150,
            padding: 24,
          }}
        >
          <div className="card-featured" style={{ maxWidth: 480, width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Plus size={16} color="var(--primary)" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Add New Database Record</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--ink-subtle)", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Type selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {(["farmer", "field", "journal"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setAddType(t);
                    setAddFormData({});
                  }}
                  style={{
                    flex: 1,
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "capitalize",
                    border: "none",
                    cursor: "pointer",
                    background: addType === t ? "var(--primary)" : "var(--surface-2)",
                    color: addType === t ? "white" : "var(--ink-muted)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateRecord} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {addType === "farmer" && (
                <>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                      Farmer Full Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Ramesh Chandra"
                      required
                      value={addFormData.fullName || ""}
                      onChange={(e) => setAddFormData({ ...addFormData, fullName: e.target.value })}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="10-digit phone"
                        required
                        value={addFormData.mobileNumber || ""}
                        onChange={(e) => setAddFormData({ ...addFormData, mobileNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Area (Acres)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        className="input"
                        placeholder="5.0"
                        value={addFormData.fieldAreaAcres || ""}
                        onChange={(e) => setAddFormData({ ...addFormData, fieldAreaAcres: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Primary Crop
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Soybean, Cotton, Wheat"
                        value={addFormData.primaryCrop || "Soybean"}
                        onChange={(e) => setAddFormData({ ...addFormData, primaryCrop: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        District
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Bhopal, Indore"
                        value={addFormData.district || "Bhopal"}
                        onChange={(e) => setAddFormData({ ...addFormData, district: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {addType === "field" && (
                <>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                      Field Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. North Plot Soybean"
                      required
                      value={addFormData.name || ""}
                      onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Acreage
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        className="input"
                        placeholder="5.0"
                        value={addFormData.area_acres || ""}
                        onChange={(e) => setAddFormData({ ...addFormData, area_acres: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Crop
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Soybean"
                        value={addFormData.crop || "Soybean"}
                        onChange={(e) => setAddFormData({ ...addFormData, crop: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {addType === "journal" && (
                <>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                      Activity Title
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Syngenta Quantis Foliar Spray"
                      required
                      value={addFormData.title || ""}
                      onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                      Notes
                    </label>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="Application details and weather conditions..."
                      value={addFormData.notes || ""}
                      onChange={(e) => setAddFormData({ ...addFormData, notes: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? "Adding..." : "Add Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Reset DB Confirmation ── */}
      {confirmReset && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 150,
            padding: 24,
          }}
        >
          <div className="card-featured" style={{ maxWidth: 380, width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <AlertTriangle size={20} color="#fbbf24" />
              <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>Reset Database?</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>
              This will wipe all modified records and restore default verified benchmark datasets. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleReset}>
                <Trash2 size={13} /> Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
