"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [currentLat, setCurrentLat] = useState(lat || 23.2599);
  const [currentLon, setCurrentLon] = useState(lon || 77.4126);
  const [weatherCondition, setWeatherCondition] = useState<"sunny" | "rainy" | "windy">("sunny");
  const [selectedFarm, setSelectedFarm] = useState<any>(null);

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
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    } catch {}

    const map = L.map(mapRef.current).setView([currentLat, currentLon], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    // Plot Nearby Farms on Map
    nearbyFarms.forEach((farm) => {
      const customIcon = L.divIcon({
        className: "custom-farm-icon",
        html: `<div style="background-color: ${farm.color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🌱</div>`,
        iconSize: [24, 24],
      });

      const marker = L.marker([farm.lat, farm.lon], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        setSelectedFarm(farm);
        if (onLocationSelect) onLocationSelect(farm.lat, farm.lon);
      });
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat: newLat, lng: newLng } = e.latlng;
      setCurrentLat(newLat);
      setCurrentLon(newLng);
      if (onLocationSelect) onLocationSelect(newLat, newLng);
    });

    setTimeout(() => {
      try { map.invalidateSize(); } catch {}
    }, 200);

    return () => {
      try { map.remove(); } catch {}
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" />
            Field & Regional Farm Telemetry Map
          </h3>
          <p className="text-xs text-slate-400">
            Real-time geospatial intelligence cross-referencing micro-climate across farms
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* The Map */}
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-white/10 shadow-lg h-[400px]">
          <div ref={mapRef} className="w-full h-full bg-slate-950" />

          {/* Floating Map Overlay Info */}
          <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs space-y-1 shadow-lg text-slate-200 font-mono">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE GIS OVERLAY</span>
            </div>
            <div>Selected Lat: {currentLat.toFixed(4)}</div>
            <div>Selected Lon: {currentLon.toFixed(4)}</div>
            <div className="text-[10px] text-slate-400">Source: Open-Meteo & Syngenta CE Hub</div>
          </div>
        </div>

        {/* Selected / Active Farm Information Panel */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Plot Intelligence
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                {selectedFarm ? selectedFarm.crop : crop || "Soybean"}
              </span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">
                {selectedFarm ? selectedFarm.name : "My Primary Farm"}
              </h4>
              <p className="text-xs text-slate-400">
                Owner: {selectedFarm ? selectedFarm.owner : "Farmer Profile"} • Area: {selectedFarm ? selectedFarm.area : "4.2 ha"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Biological Stress:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {selectedFarm ? selectedFarm.stress : "Night Heat Stress (6.3/9)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Recommended Action:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  {selectedFarm ? selectedFarm.recommendation : "Syngenta Stress Buster (500 ml/ha)"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Click any farm marker to inspect field status</span>
          </div>
        </div>
      </div>
    </div>
  );
};
