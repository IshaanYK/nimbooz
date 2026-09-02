"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/AdminShell";
import { getFarmers, deleteFarmer, createFarmer, MAIN_SITE_URL } from "@/lib/api";
import {
  Users,
  RefreshCw,
  Trash2,
  Search,
  MapPin,
  Sprout,
  Phone,
  UserX,
  UserPlus,
  AlertTriangle,
  X,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function UsersPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);

  // New farmer form state
  const [newFullName, setNewFullName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newState, setNewState] = useState("Madhya Pradesh");
  const [newDistrict, setNewDistrict] = useState("Bhopal");
  const [newCrop, setNewCrop] = useState("Soybean");
  const [newAcres, setNewAcres] = useState("5.0");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getFarmers();
      setFarmers(Array.isArray(data) ? data : data?.farmers || data?.data?.farmers || []);
    } catch {
      setFarmers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const ok = await deleteFarmer(deleteModal.id);
    if (ok) {
      setFarmers((prev) => prev.filter((f) => f.id !== deleteModal.id));
      setActionMsg(`Farmer "${deleteModal.fullName || deleteModal.name}" removed from live production.`);
      setTimeout(() => setActionMsg(""), 4000);
    } else {
      setActionMsg("Failed to remove farmer. Please check server logs.");
    }
    setDeleting(false);
    setDeleteModal(null);
  };

  const handleAddFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newMobile.trim()) return;
    setAdding(true);
    try {
      const res = await createFarmer({
        fullName: newFullName.trim(),
        mobileNumber: newMobile.trim(),
        state: newState,
        district: newDistrict,
        primaryCrop: newCrop,
        fieldAreaAcres: parseFloat(newAcres) || 5.0,
      });
      if (res?.farmer) {
        setFarmers((prev) => [res.farmer, ...prev]);
        setActionMsg(`Farmer "${newFullName}" successfully registered on live production.`);
        setShowAddModal(false);
        setNewFullName("");
        setNewMobile("");
        setTimeout(() => setActionMsg(""), 4000);
      }
    } catch (err: any) {
      setActionMsg(`Failed to add farmer: ${err?.message || "Unknown error"}`);
    } finally {
      setAdding(false);
    }
  };

  const filtered = farmers.filter((f) => {
    const q = search.toLowerCase();
    return (
      (f.fullName || f.name || "").toLowerCase().includes(q) ||
      (f.district || "").toLowerCase().includes(q) ||
      (f.state || "").toLowerCase().includes(q) ||
      (f.primaryCrop || f.crop || "").toLowerCase().includes(q) ||
      (f.mobileNumber || "").includes(q)
    );
  });

  return (
    <AdminShell>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-primary">
              <Users size={10} /> User Management
            </span>
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>
              Connected to {MAIN_SITE_URL.replace("https://", "")}
            </span>
          </div>
          <h1 className="page-title">Registered Farmer Accounts</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
            Manage, inspect, or delete farmer accounts synchronized with live production.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw size={14} style={loading ? { animation: "spin 0.7s linear infinite" } : {}} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={14} />
            Add Farmer
          </button>
        </div>
      </div>

      {/* Action message toast */}
      {actionMsg && (
        <div
          className="badge badge-success"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}
        >
          <CheckCircle2 size={15} />
          {actionMsg}
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-tertiary)" }} />
        <input
          className="input"
          placeholder="Search live farmers by name, phone, district, state, or crop..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 34 }}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-subtle)", fontSize: 13 }}>
            <span className="spinner" style={{ display: "inline-block", marginBottom: 12 }} />
            <br />Querying live farmers from production database...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-subtle)", fontSize: 13 }}>
            <Users size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <br />
            {search ? "No farmers match your search criteria." : "No farmers registered in the live database yet."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Location</th>
                  <th>Crop</th>
                  <th>Farm Size</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((farmer) => (
                  <tr key={farmer.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>
                        {farmer.fullName || farmer.name || "—"}
                      </div>
                      <div className="font-mono text-subtle" style={{ fontSize: 10, marginTop: 2 }}>
                        ID: {farmer.id}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                        <MapPin size={11} color="var(--ink-subtle)" />
                        <span>{farmer.district || "—"}, {farmer.state || "—"}</span>
                      </div>
                      {farmer.village && (
                        <div className="text-subtle" style={{ fontSize: 10, marginLeft: 16 }}>
                          Village: {farmer.village}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                        <Sprout size={11} color="var(--primary)" />
                        <span style={{ textTransform: "capitalize" }}>
                          {farmer.primaryCrop || farmer.crop || "—"}
                        </span>
                      </div>
                      {farmer.cropVariety && (
                        <div className="text-subtle" style={{ fontSize: 10, marginLeft: 16 }}>
                          {farmer.cropVariety}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontSize: 12 }}>
                        {farmer.fieldAreaAcres || farmer.fieldAreaHa || "5.0"} {farmer.fieldAreaAcres ? "Acres" : "ha"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                        <Phone size={11} color="var(--ink-subtle)" />
                        <span className="font-mono">{farmer.mobileNumber || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-success">Active Farmer</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteModal(farmer)}
                        title="Delete farmer from live database"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-subtle" style={{ fontSize: 11, marginTop: 10 }}>
        Showing {filtered.length} of {farmers.length} live registered farmers
      </p>

      {/* Add Farmer Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 24,
          }}
          onClick={() => !adding && setShowAddModal(false)}
        >
          <div
            className="card-featured"
            style={{ maxWidth: 460, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: "rgba(94,106,210,0.15)", border: "1px solid rgba(94,106,210,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <UserPlus size={16} color="var(--primary)" />
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>Add Farmer Account</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", color: "var(--ink-subtle)", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddFarmer} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--ink-subtle)", marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  className="input"
                  placeholder="e.g. Ramesh Chandra Patel"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--ink-subtle)", marginBottom: 4 }}>
                  Mobile Number
                </label>
                <input
                  className="input"
                  placeholder="e.g. 9876543210"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--ink-subtle)", marginBottom: 4 }}>
                    State
                  </label>
                  <input
                    className="input"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--ink-subtle)", marginBottom: 4 }}>
                    District
                  </label>
                  <input
                    className="input"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--ink-subtle)", marginBottom: 4 }}>
                    Primary Crop
                  </label>
                  <input
                    className="input"
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--ink-subtle)", marginBottom: 4 }}>
                    Acreage
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    value={newAcres}
                    onChange={(e) => setNewAcres(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={adding || !newFullName.trim() || !newMobile.trim()}
                >
                  {adding ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Registering...</> : "Create Farmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 24,
          }}
          onClick={() => !deleting && setDeleteModal(null)}
        >
          <div
            className="card-featured"
            style={{ maxWidth: 380, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <UserX size={16} color="#f87171" />
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Delete Farmer Account</span>
              </div>
              <button
                onClick={() => setDeleteModal(null)}
                style={{ background: "none", border: "none", color: "var(--ink-subtle)", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="badge badge-danger"
              style={{ display: "flex", gap: 6, padding: "10px 12px", borderRadius: 8, marginBottom: 16, fontSize: 12 }}
            >
              <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
              This will permanently delete this farmer from the live production database.
            </div>

            <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>
              Are you sure you want to permanently delete{" "}
              <strong style={{ color: "var(--ink)" }}>
                {deleteModal.fullName || deleteModal.name}
              </strong>{" "}
              (ID: {deleteModal.id})?
            </p>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Deleting...</> : <><Trash2 size={13} /> Delete Account</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
