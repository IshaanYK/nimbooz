"use client";

import React, { useState, useEffect } from "react";
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
  Globe,
  User,
  MapPin,
  Sprout,
  Volume2,
  Bell,
  CheckCircle2,
  Save,
  Navigation,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
  Settings as SettingsIcon,
} from "lucide-react";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { weather, refetch: refetchWeather } = useWeather();

  const [profile, setProfile] = useState<FarmerProfile>({
    ...EMPTY_FARMER_PROFILE,
    language: language || "hi",
  });
  const [loadingGps, setLoadingGps] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"language" | "profile" | "farm" | "voice">("language");

  useEffect(() => {
    const stored = getStoredProfile();
    if (stored) {
      setProfile({
        ...stored,
        language: stored.language || language || "hi",
      });
    }
  }, [language]);

  const handleLanguageSelect = (langCode: string) => {
    setProfile((prev) => ({ ...prev, language: langCode }));
    setLanguage(langCode);
    const updated = { ...profile, language: langCode };
    saveProfile(updated);
    showSaveNotification();
  };

  const showSaveNotification = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2800);
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveProfile(profile);
    setLanguage(profile.language);
    showSaveNotification();
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
            state: geo.state || prev.state || "State",
            district: geo.district || prev.district || "Field District",
            village: geo.village || prev.village || "Local Village",
            fieldName: `${geo.district || "My"} Farm Plot`,
          }));
          setLoadingGps(false);
          showSaveNotification();
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

  return (
    <AppShell>
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-[#10B981] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
                AASRA SYSTEM PREFERENCES
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-900 flex items-center gap-3">
              <SettingsIcon className="h-8 w-8 text-[#10B981]" />
              <span>{t.navProfile || "Settings & Preferences"}</span>
            </h1>
            <p className="text-sm text-slate-600 font-medium mt-1">
              Configure your regional language, farm specifications, GPS coordinates, and AI advisory preferences.
            </p>
          </div>

          <button
            onClick={() => handleSaveAll()}
            className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>

        {/* Save Success Alert Banner */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="h-5 w-5 text-[#10B981] shrink-0" />
            <div className="text-xs font-bold">
              Settings & Language preferences successfully synchronized across AASRA!
            </div>
          </div>
        )}

        {/* Settings Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
          {[
            { id: "language", label: "🌐 Language (भाषा)", icon: Globe },
            { id: "profile", label: "👤 Farmer Profile", icon: User },
            { id: "farm", label: "🌱 Farm & Crop Details", icon: Sprout },
            { id: "voice", label: "🎙️ AI Voice & Alerts", icon: Volume2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-emerald-50 text-[#10B981] font-black border border-emerald-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#10B981]" : "text-slate-400"}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: LANGUAGE SELECTION (Protected from translation) */}
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

            {/* 12-Language Grid */}
            <div className="notranslate" translate="no">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {INDIAN_LANGUAGES.map((lang) => {
                  const isSelected = (profile.language || language) === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between notranslate cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/80 border-[#10B981] text-slate-900 shadow-sm ring-2 ring-emerald-400"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-emerald-300 hover:shadow-xs"
                      }`}
                      translate="no"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-extrabold text-base text-slate-900 notranslate" translate="no">
                          {lang.native}
                        </span>
                        {isSelected ? (
                          <div className="h-5 w-5 rounded-full bg-[#10B981] flex items-center justify-center text-white shrink-0">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium notranslate" translate="no">
                        <span className="notranslate" translate="no">{lang.name}</span>
                        <span className="font-mono uppercase text-[9px] text-slate-400 notranslate" translate="no">
                          {lang.code}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#10B981] shrink-0" />
              <span>
                <strong>Active Language:</strong> {INDIAN_LANGUAGES.find((l) => l.code === (profile.language || language))?.native} ({INDIAN_LANGUAGES.find((l) => l.code === (profile.language || language))?.name})
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: FARMER PROFILE DETAILS */}
        {activeTab === "profile" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                PERSONAL INFORMATION
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-2">
                Farmer Identity & Location
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Used to personalize advisory messages, SMS alerts, and regional telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  {t.fullNameLabel}
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  {t.mobileNumberLabel}
                </label>
                <input
                  type="tel"
                  value={profile.mobileNumber}
                  onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-mono font-bold text-slate-900 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Village / Town
                </label>
                <input
                  type="text"
                  value={profile.village}
                  onChange={(e) => setProfile({ ...profile, village: e.target.value })}
                  placeholder="e.g. Berasia"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  District
                </label>
                <input
                  type="text"
                  value={profile.district}
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  placeholder="e.g. Bhopal"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  placeholder="e.g. Madhya Pradesh"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  GPS Auto-Detection
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={loadingGps}
                  className="w-full bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-xl p-3.5 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation className={`h-4 w-4 ${loadingGps ? "animate-spin" : ""}`} />
                  <span>{loadingGps ? "Detecting GPS Coordinates..." : "Fetch Coordinates via Device GPS"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FARM & CROP CONFIGURATION */}
        {activeTab === "farm" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                FIELD SPECIFICATIONS
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-2">
                Crop & Agronomic Details
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Used to compute heat stress thresholds, ROBI returns, and optimal bio-stimulant timing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Primary Crop
                </label>
                <select
                  value={profile.primaryCrop}
                  onChange={(e) => setProfile({ ...profile, primaryCrop: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none cursor-pointer"
                >
                  <option value="soybean">Soybean (सोयाबीन)</option>
                  <option value="cotton">Cotton (कपास)</option>
                  <option value="wheat">Wheat (गेहूं)</option>
                  <option value="rice">Rice (धान / चावल)</option>
                  <option value="mustard">Mustard (सरसों)</option>
                  <option value="chickpea">Gram / Chickpea (चना)</option>
                  <option value="maize">Maize (मक्का)</option>
                  <option value="groundnut">Groundnut (मूंगफली)</option>
                  <option value="sugarcane">Sugarcane (गन्ना)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Field Area (Hectares)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.fieldAreaHa || 2.5}
                  onChange={(e) => setProfile({ ...profile, fieldAreaHa: parseFloat(e.target.value) || 2.5 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-mono font-bold text-slate-900 focus:border-[#10B981] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Irrigation System
                </label>
                <select
                  value={profile.irrigationType}
                  onChange={(e) => setProfile({ ...profile, irrigationType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none cursor-pointer"
                >
                  <option value="Drip Irrigation">Drip Irrigation (ड्रिप सिंचाई - Highly Efficient)</option>
                  <option value="Sprinkler">Sprinkler (फव्वारा)</option>
                  <option value="Flood Irrigation">Flood / Canal Irrigation (खुला पानी / नहर)</option>
                  <option value="Rainfed">Rainfed (वर्षा आधारित / बारानी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Soil Type
                </label>
                <select
                  value={profile.soilType}
                  onChange={(e) => setProfile({ ...profile, soilType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none cursor-pointer"
                >
                  <option value="Black Clay (Regur)">Black Clay / Regur (काली मिट्टी)</option>
                  <option value="Alluvial Soil">Alluvial Soil (जलोढ़ मिट्टी)</option>
                  <option value="Red Loam">Red Loam (लाल दोमट)</option>
                  <option value="Sandy Loam">Sandy Loam (बलुई दोमट)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VOICE & ALERTS PREFERENCES */}
        {activeTab === "voice" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-mono font-bold text-[#10B981] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                SPEECH & INTELLIGENCE
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-2">
                AI Voice Synthesis & Notifications
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Configure Google Chirp3-HD natural voice audio speed, tone, and SMS warning threshold.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-900 block">
                    Enable Natural Voice Responses
                  </span>
                  <span className="text-xs text-slate-500 block">
                    Play real human female voice synthesis in your selected language for all agronomic advice.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.voiceResponsesEnabled !== false}
                  onChange={(e) => setProfile({ ...profile, voiceResponsesEnabled: e.target.checked })}
                  className="h-5 w-5 text-[#10B981] rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-900 block">
                    Night Heat Stress SMS & WhatsApp Alerts
                  </span>
                  <span className="text-xs text-slate-500 block">
                    Send automated warnings when overnight temperature exceeds 24.5°C during flowering.
                  </span>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 text-[#10B981] rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-900 block">
                    Foliar Spray Window Alerts
                  </span>
                  <span className="text-xs text-slate-500 block">
                    Notify 24 hours before optimal morning/evening spray windows based on wind speed and rain forecast.
                  </span>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 text-[#10B981] rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="text-xs text-slate-600 font-medium">
            Changes are saved locally to your device and synced with your AASRA Farm Engine.
          </div>
          <button
            onClick={() => handleSaveAll()}
            className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save All Settings</span>
          </button>
        </div>

      </div>
    </AppShell>
  );
}
