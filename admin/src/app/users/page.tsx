"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/AdminShell";
import { getFarmers, deleteFarmer } from "@/lib/api";
import {
  Users,
  RefreshCw,
  Trash2,
  Search,
  MapPin,
  Sprout,
  Phone,
  UserX,
  AlertTriangle,
  X,
} from "lucide-react";

export default function UsersPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

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
      setActionMsg(`Farmer "${deleteModal.fullName || deleteModal.name}" removed successfully.`);
      setTimeout(() => setActionMsg(""), 4000);
    } else {
      setActionMsg("Failed to remove farmer. Try again.");
    }
    setDeleting(false);
    setDeleteModal(null);
  };

  const filtered = farmers.filter((f) => {
    const q = search.toLowerCase();
    return (
      (f.fullName || f.name || "").toLowerCase().includes(q) ||
      (f.district || "").toLowerCase().includes(q) ||
      (f.state || "").toLowerCase().includes(q) ||
      (f.primaryCrop || f.crop || "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-primary">
              <Users size={10} /> User Management
            </span>
          </div>
          <h1 className="page-title">Farmer Accounts</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
            {farmers.length} registered farmer{farmers.length !== 1 ? "s" : ""} in the AASRA system.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw size={14} style={loading ? { animation: "spin 0.7s linear infinite" } : {}} />
          Refresh
        </button>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div
          className="badge badge-success"
          style={{ display: "flex", gap: 6, padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 12 }}
        >
          {actionMsg}
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-tertiary)" }} />
        <input
          className="input"
          placeholder="Search by name, district, state, or crop..."
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
            <br />Loading farmers...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-subtle)", fontSize: 13 }}>
            <Users size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <br />
            {search ? "No farmers match your search." : "No farmers registered yet."}
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
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                        <Sprout size={11} color="var(--primary)" />
                        <span style={{ textTransform: "capitalize" }}>
                          {farmer.primaryCrop || farmer.crop || "—"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontSize: 12 }}>
                        {farmer.fieldAreaHa || farmer.fieldAreaAcres || "—"} {farmer.fieldAreaHa ? "ha" : "ac"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                        <Phone size={11} color="var(--ink-subtle)" />
                        <span className="font-mono">{farmer.mobileNumber || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteModal(farmer)}
                        title="Remove farmer"
                      >
                        <Trash2 size={13} />
                        Remove
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
        Showing {filtered.length} of {farmers.length} farmers
      </p>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
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
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Remove Farmer</span>
              </div>
              <button
                onClick={() => setDeleteModal(null)}
                style={{ background: "none", border: "none", color: "var(--ink-subtle)", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="badge badge-warning"
              style={{ display: "flex", gap: 6, padding: "10px 12px", borderRadius: 8, marginBottom: 16, fontSize: 12 }}
            >
              <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
              This will permanently remove the farmer and all associated data.
            </div>

            <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>
              Are you sure you want to remove{" "}
              <strong style={{ color: "var(--ink)" }}>
                {deleteModal.fullName || deleteModal.name}
              </strong>
              ? This action cannot be undone.
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
                {deleting ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Removing...</> : <><Trash2 size={13} /> Remove Farmer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
