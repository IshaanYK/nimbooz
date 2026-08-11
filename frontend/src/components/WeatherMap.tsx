"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Sun, CloudRain, Wind, Navigation, Layers, Sparkles, CheckCircle2, AlertTriangle, Zap, User } from "lucide-react";

interface WeatherMapProps {
  lat: number;
  lon: number;
  crop: string;
  onLocationSelect?: (lat: number, lon: number) => void;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  lat,
  lon,
  crop,
  onLocationSelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentLat, setCurrentLat] = useState(lat || 23.2599);
  const [currentLon, setCurrentLon] = useState(lon || 77.4126);
  const [weatherCondition, setWeatherCondition] = useState<"sunny" | "rainy" | "windy">("sunny");
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const nearbyFarms = [
    {
      id: "my_farm",
      name: "My Primary Field (Bhopal Soybean)",
      owner: "Farmer Profile",
      crop: crop || "Soybean (JS-335)",
      area: "4.2 ha",
      lat: currentLat,
      lon: currentLon,
      stress: "Night Heat Stress (6.3/9)",
      recommendation: "Syngenta Stress Buster (500 ml/ha)",
      color: "#059669",
    },
    {
      id: "neighbor_1",
      name: "Sharma Agricultural Farm",
      owner: "Suresh Sharma",
      crop: "Cotton (Bt-II)",
      area: "3.8 ha",
      lat: currentLat + 0.015,
      lon: currentLon + 0.012,
      stress: "Optimal Moisture (78%)",
      recommendation: "Syngenta Nutrient Booster",
      color: "#0284c7",
    },
    {
      id: "neighbor_2",
      name: "Verma Crop Lands",
      owner: "Anil Verma",
      crop: "Paddy / Rice",
      area: "5.0 ha",
      lat: currentLat - 0.012,
      lon: currentLon - 0.018,
      stress: "Moderate Hydric Stress",
      recommendation: "Syngenta Yield Booster",
      color: "#d97706",
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if ((mapRef.current as any)._leaflet_id) {
      (mapRef.current as any)._leaflet_id = null;
      mapRef.current.innerHTML = "";
    }

    const map = L.map(mapRef.current).setView([currentLat, currentLon], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // Plot Nearby Farms on Map
    nearbyFarms.forEach((farm) => {
      const marker = L.marker([farm.lat, farm.lon]).addTo(map);
      marker.bindPopup(`<b>${farm.name}</b><br>Owner: ${farm.owner}<br>Crop: ${farm.crop} (${farm.area})<br>Status: ${farm.stress}`);
      marker.on("click", () => {
        setSelectedFarm(farm);
      });
    });

    map.on("click", (e: any) => {
      const { lat: newLat, lng: newLng } = e.latlng;
      setCurrentLat(newLat);
      setCurrentLon(newLng);
      if (onLocationSelect) onLocationSelect(newLat, newLng);
    });
  }, [mapLoaded, weatherCondition]);

  const handleUseGps = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newLat = pos.coords.latitude;
        const newLon = pos.coords.longitude;
        setCurrentLat(newLat);
        setCurrentLon(newLon);
        if (onLocationSelect) onLocationSelect(newLat, newLon);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Map Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-500/20 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-extrabold text-slate-900 uppercase tracking-wider font-mono">
            Interactive OpenStreetMap Field & Nearby Farms
          </span>
        </div>

        {/* Weather Effect Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 px-2">Weather Layer:</span>
          {[
            { id: "sunny", label: "☀️ Sunny (35°C)", icon: Sun },
            { id: "rainy", label: "🌧️ Raining (12mm)", icon: CloudRain },
            { id: "windy", label: "🌬️ Wind (18 km/h)", icon: Wind },
          ].map((w) => (
            <button
              key={w.id}
              onClick={() => setWeatherCondition(w.id as any)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                weatherCondition === w.id
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleUseGps}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Navigation className="h-3.5 w-3.5" />
          Acquire My GPS Location
        </button>
      </div>

      {/* Map Container with Dynamic Weather Overlay */}
      <div className="relative w-full h-[380px] rounded-3xl border border-emerald-500/30 overflow-hidden shadow-xl bg-slate-900">
        <div ref={mapRef} className="w-full h-full" />

        {/* Weather Overlays */}
        {weatherCondition === "sunny" && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-tr from-amber-500/10 via-transparent to-amber-400/20 backdrop-brightness-110" />
        )}

        {weatherCondition === "rainy" && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-slate-950/25 overflow-hidden">
            <div className="w-full h-full flex justify-around opacity-60">
              <div className="w-0.5 h-6 bg-sky-300 animate-rain" />
              <div className="w-0.5 h-6 bg-sky-300 animate-rain" style={{ animationDelay: "0.2s" }} />
              <div className="w-0.5 h-6 bg-sky-300 animate-rain" style={{ animationDelay: "0.4s" }} />
              <div className="w-0.5 h-6 bg-sky-300 animate-rain" style={{ animationDelay: "0.6s" }} />
            </div>
          </div>
        )}

        {/* Floating Farm Telemetry Popup */}
        {selectedFarm && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/40 shadow-2xl space-y-2 text-xs animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <h4 className="font-extrabold text-slate-900 text-sm">{selectedFarm.name}</h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                {selectedFarm.area}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-700">
              <div>
                <span className="text-slate-500 block">Farmer / Owner:</span>
                <span className="font-bold text-slate-900">{selectedFarm.owner}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Crop Variety:</span>
                <span className="font-bold text-slate-900">{selectedFarm.crop}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Stress Assessment:</span>
                <span className="font-bold text-amber-600">{selectedFarm.stress}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Biological Action:</span>
                <span className="font-bold text-emerald-600">{selectedFarm.recommendation}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Coordinates bar */}
      <div className="flex items-center justify-between text-xs bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-slate-700">
        <span>Active GPS Coordinates:</span>
        <span className="font-mono font-bold text-emerald-700">
          {currentLat.toFixed(4)}° N, {currentLon.toFixed(4)}° E
        </span>
      </div>
    </div>
  );
};
