"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather, reverseGeocode } from "@/context/WeatherContext";
import {
  getStoredProfile,
  saveProfile,
  INDIAN_LANGUAGES,
  FarmerProfile,
  EMPTY_FARMER_PROFILE,
} from "@/lib/userStore";
import {
  User,
  MessageSquare,
  Sprout,
  MapPin,
  Save,
  CheckCircle2,
  Send,
  Smartphone,
  Copy,
  ExternalLink,
  Clock,
  Navigation,
  Globe,
  Check,
  RefreshCw,
  Sliders,
  Bell,
  ShieldCheck,
} from "lucide-react";

function ProfileContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "whatsapp" ? "whatsapp" : "profile";

  const { language, setLanguage, t } = useLanguage();
  const { weather, refetch: refetchWeather } = useWeather();

  const [activeTab, setActiveTab] = useState<"profile" | "whatsapp" | "farm" | "language">(
    initialTab as any
  );

  const [profile, setProfile] = useState<FarmerProfile>({
    ...EMPTY_FARMER_PROFILE,
    language: language || "hi",
  });

  const [loadingGps, setLoadingGps] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // WhatsApp State
  const [waStatus, setWaStatus] = useState<{
    connected: boolean;
    connection: any;
    displayPhone: string;
    provider: string;
  }>({
    connected: false,
    connection: null,
    displayPhone: "+1 555 025 8921",
    provider: "meta_cloud",
  });

  const [waTokenData, setWaTokenData] = useState<{
    tokenDisplay: string;
    expiresAt: string;
    deepLink: string;
    displayPhone: string;
  } | null>(null);

  const [waGenerating, setWaGenerating] = useState(false);
  const [waCopied, setWaCopied] = useState(false);
  const [waDisconnecting, setWaDisconnecting] = useState(false);
  const [waSendingTest, setWaSendingTest] = useState(false);
  const [waTestSuccess, setWaTestSuccess] = useState(false);

  // Notification Preferences State
  const [waPrefs, setWaPrefs] = useState({
    weatherAlerts: true,
    rainAlerts: true,
    heatAlerts: true,
    windAlerts: true,
    stressAlerts: true,
    sprayAlerts: true,
    marketAlerts: true,
    adminAlerts: true,
    quietHours: { enabled: true, start: "22:00", end: "06:00" },
    enabled: true,
  });
  const [waPrefsSaving, setWaPrefsSaving] = useState(false);
  const [waPrefsSaved, setWaPrefsSaved] = useState(false);

  // Load stored profile
  useEffect(() => {
    const stored = getStoredProfile();
    if (stored) {
      setProfile({
        ...stored,
        language: stored.language || language || "hi",
      });
    }
  }, [language]);

  // Load WhatsApp connection & preferences
  const fetchWhatsAppStatus = async () => {
    try {
      const res = await fetch(`/api/whatsapp/link?farmerId=farmer-001`);
      if (res.ok) {
        const data = await res.json();
        setWaStatus(data);
        if (data.connected) {
          setWaTokenData(null);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch WhatsApp status:", err);
    }
  };

  const fetchNotificationPrefs = async () => {
    try {
      const res = await fetch(`/api/whatsapp/preferences?farmerId=farmer-001`);
      if (res.ok) {
        const data = await res.json();
        if (data?.preferences) {
          setWaPrefs(data.preferences);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch notification preferences:", err);
    }
  };

  useEffect(() => {
    fetchWhatsAppStatus();
    fetchNotificationPrefs();
  }, []);

  // Poll for connection activation if token is currently displayed
  useEffect(() => {
    if (!waTokenData || waStatus.connected) return;
    const interval = setInterval(fetchWhatsAppStatus, 3000);
    return () => clearInterval(interval);
  }, [waTokenData, waStatus.connected]);

  const showSaveToast = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2800);
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveProfile(profile);
    setLanguage(profile.language);

    if (profile.gpsLocation) {
      try {
        const rawFields = localStorage.getItem("aasra_farmer_fields_v3");
        if (rawFields) {
          const fields = JSON.parse(rawFields);
          if (Array.isArray(fields) && fields.length > 0) {
            fields[0].center = [profile.gpsLocation.lat, profile.gpsLocation.lon];
            fields[0].crop = profile.primaryCrop || fields[0].crop;
            fields[0].areaAcres = profile.fieldAreaAcres || fields[0].areaAcres;
            localStorage.setItem("aasra_farmer_fields_v3", JSON.stringify(fields));
          }
        }
      } catch (_) {}
      refetchWeather(true);
    }
    showSaveToast();
  };

  const detectLocation = () => {
    setLoadingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const geo = await reverseGeocode(lat, lon);

          setProfile((prev) => ({
            ...prev,
            gpsLocation: { lat, lon },
            state: geo.state || prev.state || "Madhya Pradesh",
            district: geo.district || prev.district || "Bhopal",
            village: geo.village || prev.village || "Phanda",
            fieldName: `${geo.district || "My"} Farm Plot`,
          }));
          setLoadingGps(false);
          showSaveToast();
        },
        (err) => {
          console.warn("GPS lookup denied:", err);
          setLoadingGps(false);
        }
      );
    } else {
      setLoadingGps(false);
    }
  };

  const handleGenerateWaToken = async () => {
    setWaGenerating(true);
    try {
      const res = await fetch("/api/whatsapp/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmerId: "farmer-001" }),
      });
      if (res.ok) {
        const data = await res.json();
        setWaTokenData(data);
      }
    } catch (err) {
      console.error("Token generation error:", err);
    } finally {
      setWaGenerating(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm("Are you sure you want to disconnect WhatsApp from this AASRA account?")) return;
    setWaDisconnecting(true);
    try {
      const res = await fetch(`/api/whatsapp/link?farmerId=farmer-001`, { method: "DELETE" });
      if (res.ok) {
        await fetchWhatsAppStatus();
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    } finally {
      setWaDisconnecting(false);
    }
  };

  const handleSaveWaPreferences = async () => {
    setWaPrefsSaving(true);
    try {
      const res = await fetch("/api/whatsapp/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmerId: "farmer-001", preferences: waPrefs }),
      });
      if (res.ok) {
        setWaPrefsSaved(true);
        setTimeout(() => setWaPrefsSaved(false), 2500);
      }
    } catch (err) {
      console.error("Save preferences error:", err);
    } finally {
      setWaPrefsSaving(false);
    }
  };

  const handleSendTestAdvisory = async () => {
    setWaSendingTest(true);
    try {
      const res = await fetch("/api/cron/monitor-alerts");
      if (res.ok) {
        setWaTestSuccess(true);
        setTimeout(() => setWaTestSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Test advisory error:", err);
    } finally {
      setWaSendingTest(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-[#10B981] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
                FARMER PROFILE & GATEWAYS
              </span>
              {waStatus.connected && (
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  WHATSAPP ACTIVE
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
              Profile & Account Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Update your personal farmer information, crop parameters, GPS land grounding, and connect WhatsApp for automatic alerts.
            </p>
          </div>

          <button
            onClick={() => handleSaveProfile()}
            className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile</span>
          </button>
        </div>

        {/* Save Success Alert Banner */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="h-5 w-5 text-[#10B981] shrink-0" />
            <div className="text-xs font-bold">
              Farmer profile settings successfully saved and synced across AASRA Farm Engine!
            </div>
          </div>
        )}

        {/* Navigation Tabs (Stripe Aesthetic) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
          {[
            { id: "profile", label: "👤 Personal Profile", icon: User },
            { id: "whatsapp", label: "💬 Connect WhatsApp", icon: MessageSquare, badge: waStatus.connected ? "Active" : "New" },
            { id: "farm", label: "🌱 Farm & Crop Details", icon: Sprout },
            { id: "language", label: "🌐 Regional Language", icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
                  isActive
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#10B981]" : "text-slate-400"}`} />
                <span className="truncate">{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      tab.badge === "Active"
                        ? "bg-emerald-200 text-emerald-900"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: PERSONAL PROFILE (Editable Inputs)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                FARMER IDENTITY
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-2">
                Personal & Contact Details
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Used to personalize voice responses, local APMC Mandi price discovery, and agricultural advisories.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Farmer Full Name (किसान का पूरा नाम)
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar Verma"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Mobile Number (मोबाइल नंबर)
                </label>
                <input
                  type="tel"
                  value={profile.mobileNumber}
                  onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
                />
              </div>

              {/* Village */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Village / Town (ग्राम / कस्बा)
                </label>
                <input
                  type="text"
                  value={profile.village}
                  onChange={(e) => setProfile({ ...profile, village: e.target.value })}
                  placeholder="e.g. Phanda Kalan"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  District (जिला)
                </label>
                <input
                  type="text"
                  value={profile.district}
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  placeholder="e.g. Bhopal"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  State (राज्य)
                </label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  placeholder="e.g. Madhya Pradesh"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* GPS Auto-Detect Location Card */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  GPS Land Grounding (सटीक स्थान)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 truncate">
                    {profile.gpsLocation
                      ? `Lat: ${profile.gpsLocation.lat.toFixed(4)}, Lon: ${profile.gpsLocation.lon.toFixed(4)}`
                      : "GPS Not Set (23.2599, 77.4126 default)"}
                  </div>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={loadingGps}
                    className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Navigation className={`h-3.5 w-3.5 ${loadingGps ? "animate-spin" : ""}`} />
                    <span>{loadingGps ? "Locating..." : "Auto-Detect"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Changes saved here immediately update the AI Assistant and Weather Telemetry.
              </span>
              <button
                onClick={() => handleSaveProfile()}
                className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: WHATSAPP INTEGRATION & NOTIFICATIONS (Stripe Aesthetic)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === "whatsapp" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Connection Status Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      MULTI-CHANNEL ASSISTANT
                    </span>
                    {waStatus.connected ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        CONNECTED & ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-300">
                        NOT CONNECTED
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-2">
                    AASRA WhatsApp Gateway
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Receive autonomous weather warnings, Delta-T spray windows, and crop disease advice directly on WhatsApp.
                  </p>
                </div>

                {waStatus.connected && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSendTestAdvisory}
                      disabled={waSendingTest}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{waSendingTest ? "Sending Test..." : "Send Test Advisory"}</span>
                    </button>
                    <button
                      onClick={handleDisconnectWhatsApp}
                      disabled={waDisconnecting}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {waDisconnecting ? "Disconnecting..." : "Disconnect"}
                    </button>
                  </div>
                )}
              </div>

              {/* Test Advisory Success Banner */}
              {waTestSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Test agronomic advisory evaluated and dispatched to your WhatsApp!</span>
                </div>
              )}

              {/* Connected State View */}
              {waStatus.connected ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-bold block">Connected Number</span>
                    <span className="text-sm font-mono font-extrabold text-slate-900 block">
                      {waStatus.connection?.phoneNumberNormalized || waStatus.connection?.phoneNumber || "+91 98765 43210"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-bold block">AASRA Bot Phone</span>
                    <span className="text-sm font-mono font-extrabold text-emerald-700 block">
                      {waStatus.displayPhone}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-bold block">Connection Provider</span>
                    <span className="text-sm font-mono font-extrabold text-slate-700 block uppercase">
                      {waStatus.provider || "Meta Cloud Graph API v21.0"}
                    </span>
                  </div>
                </div>
              ) : (
                /* Disconnected State View & Activation Flow */
                <div className="space-y-6">
                  {!waTokenData ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                          <Smartphone className="h-7 w-7 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">
                            Connect Your WhatsApp in 30 Seconds
                          </h3>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            Click below to generate a secure 16-character code and pre-filled WhatsApp activation link.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleGenerateWaToken}
                        disabled={waGenerating}
                        className="px-6 py-3.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{waGenerating ? "Generating Code..." : "Connect WhatsApp Now"}</span>
                      </button>
                    </div>
                  ) : (
                    /* Active Activation Token Card with Live 15-min countdown */
                    <div className="p-6 bg-emerald-50/70 border-2 border-emerald-400 rounded-3xl space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping"></span>
                          <span className="text-xs font-mono font-bold text-emerald-800 uppercase">
                            ONE-TIME ACTIVATION CODE (EXPIRES IN 15 MIN)
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Waiting for your message...</span>
                        </span>
                      </div>

                      <div className="bg-white border border-emerald-300 rounded-2xl p-6 text-center space-y-3 shadow-xs">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                          Send this exact message from your phone
                        </span>
                        <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 tracking-wider">
                          AASRA CONNECT {waTokenData.tokenDisplay}
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`AASRA CONNECT ${waTokenData.tokenDisplay}`);
                              setWaCopied(true);
                              setTimeout(() => setWaCopied(false), 2000);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            {waCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{waCopied ? "Copied!" : "Copy Code"}</span>
                          </button>

                          <a
                            href={waTokenData.deepLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>Open WhatsApp App</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 font-medium flex items-center justify-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>
                          Once sent, this screen will automatically refresh and mark your account as Connected.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Preferences Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    WhatsApp Automated Alert Preferences
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Select which scientific climate risks and market triggers AASRA sends to your WhatsApp.
                  </p>
                </div>
                {waPrefsSaved && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Saved!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    key: "rainAlerts" as const,
                    title: "🌧️ Rain & Storm Warnings (बारिश व आंधी अलर्ट)",
                    desc: "Notifies 24 hours prior if rain probability exceeds 65% so you can postpone spraying.",
                  },
                  {
                    key: "heatAlerts" as const,
                    title: "🔥 Severe Heatwave Stress (अत्यधिक तापमान चेतावनी)",
                    desc: "Warns when nocturnal temperatures exceed 24.5°C causing flower abortion in soybean/pulses.",
                  },
                  {
                    key: "sprayAlerts" as const,
                    title: "🟢 Delta-T Spray Windows (अनुकूल छिड़काव समय)",
                    desc: "Alerts when atmospheric Delta-T is within the 2°C–8°C Goldilocks window with low wind.",
                  },
                  {
                    key: "marketAlerts" as const,
                    title: "📊 APMC Mandi Rate Updates (मंडी भाव अपडेट)",
                    desc: "Weekly commodity modal price updates for your primary crop at nearest mandi.",
                  },
                  {
                    key: "adminAlerts" as const,
                    title: "📢 District Advisories (प्रशासनिक व कृषि सलाह)",
                    desc: "High-priority agronomic advisories issued by agricultural scientists.",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(waPrefs[item.key])}
                      onChange={(e) =>
                        setWaPrefs((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                      className="mt-0.5 h-4 w-4 text-[#10B981] rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{item.title}</span>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  Quiet Hours: No non-emergency alerts sent between 10:00 PM and 6:00 AM.
                </span>
                <button
                  onClick={handleSaveWaPreferences}
                  disabled={waPrefsSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{waPrefsSaving ? "Saving..." : "Save Preferences"}</span>
                </button>
              </div>
            </div>

            {/* Interactive WhatsApp Cheat-Sheet Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#10B981]" />
                <h3 className="text-sm font-bold font-mono tracking-wider text-emerald-400 uppercase">
                  Commands You Can Message AASRA on WhatsApp
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-300 block">🌤️ "Kal barish hogi?"</span>
                  <span className="text-slate-400 text-[11px] block">Returns real 48h Open-Meteo rainfall telemetry.</span>
                </div>
                <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-300 block">🟢 "Spray kar sakte hain?"</span>
                  <span className="text-slate-400 text-[11px] block">Computes live Delta-T psychrometric absorption window.</span>
                </div>
                <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-300 block">📊 "Mandi bhav kya hai?"</span>
                  <span className="text-slate-400 text-[11px] block">Fetches latest APMC commodity modal rate for your district.</span>
                </div>
                <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-300 block">📸 Send Crop Photo</span>
                  <span className="text-slate-400 text-[11px] block">Gemini Vision AI inspects leaf disease & prescribes treatment.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: FARM & CROP DETAILS (Acreage, Crop Variety, Soil, Sowing)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === "farm" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                AGRONOMIC DATA
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-2">
                Farm & Crop Specifications
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Used to tune ROBI biological dosage calculators, GDD crop stage models, and heat stress threshold alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Primary Crop */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Primary Crop (मुख्य फसल)
                </label>
                <select
                  value={profile.primaryCrop}
                  onChange={(e) => setProfile({ ...profile, primaryCrop: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Cotton">Cotton (कपास)</option>
                  <option value="Gram / Chana">Gram / Chana (चना)</option>
                  <option value="Maize">Maize (मक्का)</option>
                  <option value="Rice / Paddy">Rice / Paddy (धान / चावल)</option>
                  <option value="Mustard">Mustard (सरसों)</option>
                </select>
              </div>

              {/* Crop Variety */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Crop Variety (फसल किस्म / बीज)
                </label>
                <input
                  type="text"
                  value={profile.cropVariety || ""}
                  onChange={(e) => setProfile({ ...profile, cropVariety: e.target.value })}
                  placeholder="e.g. JS-9560, Shriram 303, RCH-659"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Farm Size in Acres */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Total Land Area in Acres (कुल खेत का रकबा - एकड़)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={profile.fieldAreaAcres || 5.0}
                  onChange={(e) => setProfile({ ...profile, fieldAreaAcres: parseFloat(e.target.value) || 5.0 })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
                />
              </div>

              {/* Sowing Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Sowing Date (बुवाई की तारीख)
                </label>
                <input
                  type="date"
                  value={profile.sowingDate ? profile.sowingDate.split("T")[0] : "2026-06-15"}
                  onChange={(e) => setProfile({ ...profile, sowingDate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Soil Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Soil Type (मिट्टी का प्रकार)
                </label>
                <select
                  value={profile.soilType || "Deep Black Clay Soil"}
                  onChange={(e) => setProfile({ ...profile, soilType: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Deep Black Clay Soil">Deep Black Clay Soil (काली कपासी मिट्टी)</option>
                  <option value="Medium Black Soil">Medium Black Soil (मध्यम काली मिट्टी)</option>
                  <option value="Loamy Alluvial Soil">Loamy Alluvial Soil (दोमट कछारी मिट्टी)</option>
                  <option value="Red Sandy Soil">Red Sandy Soil (लाल रेतीली मिट्टी)</option>
                </select>
              </div>

              {/* Irrigation Source */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Irrigation Facility (सिंचाई का साधन)
                </label>
                <select
                  value={profile.irrigationType || "Rainfed + Borewell"}
                  onChange={(e) => setProfile({ ...profile, irrigationType: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Rainfed + Borewell">Rainfed + Borewell (वर्षा आधारित + नलकूप)</option>
                  <option value="Canal Irrigation">Canal Irrigation (नहरी पानी)</option>
                  <option value="Drip / Sprinkler">Drip / Sprinkler (ड्रिप / स्प्रिंकलर)</option>
                  <option value="Purely Rainfed">Purely Rainfed (केवल वर्षा आधारित)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Crop specs ground the ROBI biological dosage and yield simulator.
              </span>
              <button
                onClick={() => handleSaveProfile()}
                className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Farm Specifications</span>
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 4: LANGUAGE SELECTION (12 Indian Languages)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === "language" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                REGIONAL LOCALIZATION
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-2">
                Choose Website & AI Voice Language
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Selecting a language updates every page, advisory message, weather report, and voice synthesis immediately.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {INDIAN_LANGUAGES.map((lang) => {
                const isSelected = (profile.language || language) === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setProfile({ ...profile, language: lang.code });
                      setLanguage(lang.code);
                      saveProfile({ ...profile, language: lang.code });
                      showSaveToast();
                    }}
                    className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/80 border-[#10B981] text-slate-900 shadow-sm ring-2 ring-emerald-400"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-emerald-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-extrabold text-base text-slate-900">{lang.native}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Loading Profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
