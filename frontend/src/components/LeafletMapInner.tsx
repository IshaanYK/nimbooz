"use client";

import React, { useEffect, useRef, useState } from "react";
import { FieldRecord, FieldPin } from "@/lib/fieldStore";

interface LeafletMapInnerProps {
  center: [number, number];
  savedFields: FieldRecord[];
  activeFieldId?: string;
  isDrawingMode?: boolean;
  drawnNodes?: Array<[number, number]>;
  activeLayer?: string;
  pinsList?: FieldPin[];
  onMapClick?: (lat: number, lon: number) => void;
  onSelectField?: (field: FieldRecord) => void;
}

export const LeafletMapInner: React.FC<LeafletMapInnerProps> = ({
  center,
  savedFields,
  activeFieldId,
  isDrawingMode = false,
  drawnNodes = [],
  activeLayer = "satellite",
  pinsList = [],
  onMapClick,
  onSelectField,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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
    if (!mapLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
      mapContainerRef.current.innerHTML = "";
    }

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 15,
      zoomControl: true,
    });

    // 1. Satellite Base Layer (Esri World Imagery)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        maxZoom: 18,
      }
    ).addTo(map);

    // 2. OpenStreetMap Hybrid Labels Overlay
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      opacity: 0.25,
      maxZoom: 18,
    }).addTo(map);

    // 3. Render Field Polygons
    savedFields.forEach((field) => {
      if (field.polygon && field.polygon.length >= 3) {
        const isActive = field.id === activeFieldId;
        const color = isActive ? "#00A878" : field.color || "#F59E0B";

        // Layer-specific styling
        let fillColor = color;
        let fillOpacity = isActive ? 0.45 : 0.25;

        if (activeLayer === "temp") {
          fillColor = isActive ? "#EF4444" : "#F59E0B"; // Red thermal scorch
          fillOpacity = 0.55;
        } else if (activeLayer === "rain") {
          fillColor = "#3B82F6"; // Blue precipitation
          fillOpacity = 0.4;
        } else if (activeLayer === "soil") {
          fillColor = "#D97706"; // Soil water deficit orange
          fillOpacity = 0.45;
        } else if (activeLayer === "crop_health") {
          fillColor = isActive ? "#10B981" : "#84CC16"; // Green canopy NDVI
          fillOpacity = 0.5;
        }

        const polygonObj = L.polygon(field.polygon, {
          color: color,
          weight: isActive ? 3.5 : 2,
          fillColor: fillColor,
          fillOpacity: fillOpacity,
        }).addTo(map);

        polygonObj.bindTooltip(
          `<b>${field.name}</b><br>${field.crop} · ${field.areaAcres} Acres<br>Health: ${field.healthScore || 92}%`,
          { permanent: false, direction: "top" }
        );

        polygonObj.on("click", () => {
          if (onSelectField) onSelectField(field);
        });
      }
    });

    // 4. Render Drawn Nodes if drawing boundary
    if (drawnNodes.length > 0) {
      drawnNodes.forEach((node, idx) => {
        L.circleMarker(node, {
          radius: 6,
          color: "#F59E0B",
          fillColor: "#F59E0B",
          fillOpacity: 1,
        })
          .addTo(map)
          .bindTooltip(`Point ${idx + 1}`, { permanent: true, direction: "top" });
      });

      if (drawnNodes.length >= 2) {
        L.polyline(drawnNodes, { color: "#F59E0B", weight: 3, dashArray: "6, 6" }).addTo(map);
      }
    }

    // 5. Render Pin Markers
    pinsList.forEach((pin) => {
      const pinIcon = L.divIcon({
        className: "custom-pin-marker",
        html: `<div style="background:#EF4444;color:white;padding:3px 6px;border-radius:8px;font-size:10px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.4)">📌 ${pin.note}</div>`,
      });
      L.marker([pin.lat, pin.lon], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<b>Observation Pin</b><br>${pin.note}<br><small>${pin.date}</small>`);
    });

    // Handle map click
    map.on("click", (e: any) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    });
  }, [mapLoaded, center, savedFields, activeFieldId, isDrawingMode, drawnNodes, activeLayer, pinsList]);

  return <div ref={mapContainerRef} className="h-full w-full bg-slate-900 z-0 relative isolate overflow-hidden [&_.leaflet-container]:!z-1 [&_.leaflet-pane]:!z-1" />;
};
