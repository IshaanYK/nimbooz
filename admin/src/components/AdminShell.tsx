"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAdminAuthed, adminLogout } from "@/lib/adminAuth";
import {
  LayoutDashboard,
  Users,
  Activity,
  Database,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ExternalLink,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "User Management", icon: Users },
  { href: "/diagnostics", label: "Diagnostics", icon: Activity },
  { href: "/database", label: "Database", icon: Database },
  { href: "/website", label: "Website Controls", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!isAdminAuthed()) {
      router.replace("/");
    } else {
      setAuthed(true);
    }
  }, [router]);

  const handleLogout = () => {
    adminLogout();
    router.replace("/");
  };

  if (!authed) return null;

  return (
    <div className="l-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`l-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <Shield size={14} />
          </div>
          <div>
            <div className="sidebar-logo-text">AASRA Admin</div>
            <div className="sidebar-logo-sub">Control Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Management</div>
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${isActive ? " active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="sidebar-section-label" style={{ marginTop: 8 }}>External</div>
          <a
            href={process.env.NEXT_PUBLIC_MAIN_API_URL || "http://localhost:3000"}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
          >
            <ExternalLink size={15} />
            <span>Main Website</span>
          </a>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item" style={{ border: "none", background: "none", width: "100%", cursor: "pointer" }}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="l-main">
        {/* Top bar */}
        <header className="l-topbar">
          <button
            className="btn btn-secondary btn-sm"
            style={{ display: "none" }}
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "var(--ink-subtle)",
              cursor: "pointer",
              display: "none",
              padding: "4px",
              borderRadius: "4px",
            }}
            className="mobile-menu-btn"
          >
            <Menu size={18} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "auto" }}>
            <span
              className="badge badge-success"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <span className="status-dot online" />
              Admin Session Active
            </span>
          </div>

          <span className="text-muted" style={{ fontSize: 12 }}>
            AASRA v1.0 · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </header>

        {/* Page content */}
        <main className="l-content">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}
