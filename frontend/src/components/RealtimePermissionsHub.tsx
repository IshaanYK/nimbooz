"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import {
  MapPin,
  Mic,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Lock,
} from "lucide-react";

interface RealtimePermissionsHubProps {
  onLocationUpdated?: (lat: number, lon: number, district?: string) => void;
}

export function RealtimePermissionsHub({ onLocationUpdated }: RealtimePermissionsHubProps) {
  const { language } = useLanguage();
  const { setCustomCoordinates } = useWeather();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  const [locationStatus, setLocationStatus] = useState<"granted" | "prompt" | "denied">("prompt");
  const [micStatus, setMicStatus] = useState<"granted" | "prompt" | "denied">("prompt");
  const [cameraStatus, setCameraStatus] = useState<"granted" | "prompt" | "denied">("prompt");
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Check initial permissions
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.permissions) {
      // 1. Geolocation
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((res) => {
          setLocationStatus(res.state as any);
          res.onchange = () => setLocationStatus(res.state as any);
        })
        .catch(() => {});

      // 2. Microphone
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((res) => {
          setMicStatus(res.state as any);
          res.onchange = () => setMicStatus(res.state as any);
        })
        .catch(() => {});

      // 3. Camera
      navigator.permissions
        .query({ name: "camera" as PermissionName })
        .then((res) => {
          setCameraStatus(res.state as any);
          res.onchange = () => setCameraStatus(res.state as any);
        })
        .catch(() => {});
    }
  }, []);

  // Request all permissions
  const handleRequestAllPermissions = async () => {
    setIsRequesting(true);
    setFeedbackMessage(null);

    // 1. Request GPS Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setLocationStatus("granted");
          setCustomCoordinates(lat, lon);

          try {
            const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
            if (res.ok) {
              const data = await res.json();
              if (data.district) {
                localStorage.setItem("aasra_user_district", data.district);
                if (onLocationUpdated) onLocationUpdated(lat, lon, data.district);
              }
            }
          } catch {}
        },
        () => setLocationStatus("denied"),
        { timeout: 8000 }
      );
    }

    // 2. Request Mic and Camera Streams
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMicStatus("granted");
        setCameraStatus("granted");
        // Stop tracks immediately after granting
        stream.getTracks().forEach((track) => track.stop());
        setFeedbackMessage(
          isHindi
            ? "सभी अनुमतियाँ सक्रिय हैं! लाइव मौसम, वॉयस AI और कैमरा रोग निदान तैयार है।"
            : "All real-time sensors active! Live weather, Voice AI, and Camera Leaf Diagnosis ready."
        );
      } catch (err: any) {
        // Fallback: Try audio only
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicStatus("granted");
          audioStream.getTracks().forEach((track) => track.stop());
        } catch {
          setMicStatus("denied");
        }

        // Try video only
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraStatus("granted");
          videoStream.getTracks().forEach((track) => track.stop());
        } catch {
          setCameraStatus("denied");
        }
      }
    }

    setIsRequesting(false);
  };

  const allGranted = locationStatus === "granted" && micStatus === "granted" && cameraStatus === "granted";

  if (allGranted) {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold block">
              {isHindi ? "लाइव सेंसर व टेलीमेट्री सक्रिय (GPS, माइक, कैमरा)" : "Real-Time Telemetry Active (GPS, Mic, Camera)"}
            </span>
            <span className="text-[11px] text-emerald-800">
              {isHindi
                ? "स्थान आधारित सटीक मौसम, बोलकर पूछने की सुविधा और फसल रोग स्कैनर चालू हैं।"
                : "Hyperlocal weather, hands-free Voice AI, and instant leaf disease scanner are authorized."}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
          ALL SENSORS ONLINE ✓
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-[#0d253d] to-slate-900 text-white shadow-xl border border-indigo-500/30 space-y-3.5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold font-display text-white">
              {isHindi ? "वास्तविक समय जानकारी हेतु डिवाइस अनुमति" : "Enable Real-Time Farm Telemetry & Sensors"}
            </h3>
            <p className="text-xs text-slate-300">
              {isHindi
                ? "आपके खेत का सटीक मौसम, मंडी भाव, बोलकर पूछने (माइक) और पत्ती स्कैनर (कैमरा) के लिए अनुमति दें।"
                : "Authorize GPS, Voice AI, and Leaf Disease Scanner for hyper-localized agronomic recommendations."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRequestAllPermissions}
          disabled={isRequesting}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#533afd] to-emerald-500 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          {isRequesting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          <span>{isHindi ? "⚡ सभी अनुमतियाँ चालू करें" : "⚡ Authorize Real-Time Sensors"}</span>
        </button>
      </div>

      {/* Permission Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {/* 1. Location */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-400" />
            <div>
              <span className="font-bold block text-slate-200">GPS Location</span>
              <span className="text-[10px] text-slate-400">Micro-weather & Mandi</span>
            </div>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
              locationStatus === "granted"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
            }`}
          >
            {locationStatus === "granted" ? "ACTIVE ✓" : "PROMPT"}
          </span>
        </div>

        {/* 2. Microphone */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-indigo-400" />
            <div>
              <span className="font-bold block text-slate-200">Microphone</span>
              <span className="text-[10px] text-slate-400">Voice AI Assistant</span>
            </div>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
              micStatus === "granted"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
            }`}
          >
            {micStatus === "granted" ? "ACTIVE ✓" : "PROMPT"}
          </span>
        </div>

        {/* 3. Camera */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-sky-400" />
            <div>
              <span className="font-bold block text-slate-200">Camera</span>
              <span className="text-[10px] text-slate-400">Leaf Disease AI Scan</span>
            </div>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
              cameraStatus === "granted"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
            }`}
          >
            {cameraStatus === "granted" ? "ACTIVE ✓" : "PROMPT"}
          </span>
        </div>
      </div>

      {feedbackMessage && (
        <p className="text-[11px] font-mono text-emerald-300 bg-emerald-950/40 p-2 rounded-lg border border-emerald-400/20">
          ✓ {feedbackMessage}
        </p>
      )}
    </div>
  );
}
