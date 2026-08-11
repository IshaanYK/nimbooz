"use client";

import React, { useState, useEffect } from "react";
import { Navigation, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { getStoredProfile, saveProfile } from "@/lib/userStore";
import { useLanguage } from "@/context/LanguageContext";

export const AutoPermissionModal: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(false);
  const [locationInfo, setLocationInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("aasra_permission_granted");
      if (!cached) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleRequestPermissions = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const profile = getStoredProfile();
          const updated = {
            ...profile,
            gpsLocation: { lat, lon },
            dataConsent: true,
          };
          saveProfile(updated);
          localStorage.setItem("aasra_permission_granted", "true");
          setLocationInfo({ lat, lon });
          setGranted(true);
          setLoading(false);
          setTimeout(() => setIsOpen(false), 1600);
        },
        (err) => {
          console.warn("Geolocation fallback to Bhopal default", err);
          localStorage.setItem("aasra_permission_granted", "true");
          setGranted(true);
          setLoading(false);
          setTimeout(() => setIsOpen(false), 1200);
        }
      );
    } else {
      localStorage.setItem("aasra_permission_granted", "true");
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in font-body">
      <div className="bg-white rounded-3xl border border-emerald-500/30 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center transition-all scale-100">
        {/* Header Icon Badge */}
        <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-sm">
          <Navigation className="h-7 w-7 text-emerald-600 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold font-display text-[#0f291e] tracking-tight">
            {t.welcomePrefix} {t.brandName}!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            To give you exact weather warnings and crop protection for your field, allow AASRA to check your location and live weather.
          </p>
        </div>

        {granted ? (
          <div className="bg-emerald-50/80 border border-emerald-500/30 p-4 rounded-2xl space-y-1 text-xs font-mono-numeric text-emerald-900 animate-pulse">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
            <p className="font-semibold">Location & Weather Connected!</p>
            {locationInfo && (
              <p className="text-[11px] text-slate-600">
                GPS: {locationInfo.lat.toFixed(4)}° N, {locationInfo.lon.toFixed(4)}° E
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <button
              onClick={handleRequestPermissions}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              {loading ? "Acquiring Weather Telemetry..." : "Allow & Start Personal Farm Check"}
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 underline cursor-pointer"
            >
              Continue with default location
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
