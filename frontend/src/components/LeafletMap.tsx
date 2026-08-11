"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, CheckCircle2 } from "lucide-react";

interface LeafletMapProps {
  lat: number;
  lon: number;
  onLocationSelect: (lat: number, lon: number) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  lat,
  lon,
  onLocationSelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentLat, setCurrentLat] = useState(lat || 23.2599);
  const [currentLon, setCurrentLon] = useState(lon || 77.4126);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load Leaflet script & CSS if not present
    if (typeof window !== "undefined" && !(window as any).L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        setMapLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Clear previous map if initialized
    if ((mapRef.current as any)._leaflet_id) {
      (mapRef.current as any)._leaflet_id = null;
      mapRef.current.innerHTML = "";
    }

    const map = L.map(mapRef.current).setView([currentLat, currentLon], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    const marker = L.marker([currentLat, currentLon], { draggable: true }).addTo(map);

    marker.bindPopup(`<b>Selected Field Location</b><br>Lat: ${currentLat.toFixed(4)}, Lon: ${currentLon.toFixed(4)}`).openPopup();

    map.on("click", (e: any) => {
      const { lat: newLat, lng: newLng } = e.latlng;
      setCurrentLat(newLat);
      setCurrentLon(newLng);
      marker.setLatLng([newLat, newLng]);
      marker.getPopup().setContent(`<b>Selected Field Location</b><br>Lat: ${newLat.toFixed(4)}, Lon: ${newLng.toFixed(4)}`);
      onLocationSelect(newLat, newLng);
    });

    marker.on("dragend", (e: any) => {
      const { lat: newLat, lng: newLng } = e.target.getLatLng();
      setCurrentLat(newLat);
      setCurrentLon(newLng);
      onLocationSelect(newLat, newLng);
    });
  }, [mapLoaded]);

  const handleUseGps = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLon = pos.coords.longitude;
          setCurrentLat(newLat);
          setCurrentLon(newLon);
          onLocationSelect(newLat, newLon);
        },
        () => {
          alert("Using default Bhopal GPS coordinates.");
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-emerald-400" /> Interactive Field GPS Location Map (OpenStreetMap)
        </span>
        <button
          type="button"
          onClick={handleUseGps}
          className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1 hover:bg-emerald-500/30 transition-all cursor-pointer"
        >
          <Navigation className="h-3.5 w-3.5" />
          Acquire GPS
        </button>
      </div>

      <div
        ref={mapRef}
        className="w-full h-[280px] rounded-2xl border border-white/10 overflow-hidden shadow-inner bg-slate-950"
      />

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
        <span>Selected GPS Coordinates:</span>
        <span className="text-emerald-400 font-bold">
          {currentLat.toFixed(4)}° N, {currentLon.toFixed(4)}° E
        </span>
      </div>
    </div>
  );
};
