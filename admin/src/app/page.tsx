"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthed, adminLogin } from "@/lib/adminAuth";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthed()) router.replace("/dashboard");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Slight delay to feel real
    await new Promise((r) => setTimeout(r, 600));

    const ok = adminLogin(password);
    if (ok) {
      router.replace("/dashboard");
    } else {
      setError("Invalid admin password. Access denied.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--canvas)",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "var(--primary)",
              borderRadius: 12,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Shield size={24} color="white" />
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "var(--ink)",
              letterSpacing: "-0.5px",
              marginBottom: 6,
            }}
          >
            AASRA Admin Panel
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-subtle)" }}>
            Secure administrative access only
          </p>
        </div>

        {/* Login card */}
        <div
          className="card"
          style={{ borderColor: "var(--hairline-strong)" }}
        >
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label
                htmlFor="admin-pw"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--ink-subtle)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Admin Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="admin-pw"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="input"
                  style={{ paddingRight: 40 }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--ink-tertiary)",
                    padding: 4,
                    display: "flex",
                  }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="badge badge-danger"
                style={{ display: "flex", gap: 6, padding: "8px 12px", borderRadius: 8 }}
              >
                <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12 }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "10px 14px", marginTop: 4 }}
              disabled={loading || !password}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  Verifying...
                </>
              ) : (
                "Access Admin Panel"
              )}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "var(--ink-tertiary)",
            marginTop: 20,
          }}
        >
          Unauthorized access is prohibited. All actions are logged.
        </p>
      </div>
    </div>
  );
}
