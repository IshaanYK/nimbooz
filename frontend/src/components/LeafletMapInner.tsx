"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import { FieldRecord, FieldPin } from "@/lib/fieldStore";

interface LeafletMapInnerProps {
  center: [number, number];
  savedFields: FieldRecord[];
  activeFieldId?: string;
  isDrawingMode?: boolean;
  drawnNodes?: Array<[number, number]>;
  activeLayer?: string;
  baseMapType?: "satellite" | "streets" | "hybrid";
  pinsList?: FieldPin[];
  onMapClick?: (lat: number, lon: number) => void;
  onSelectField?: (field: FieldRecord) => void;
}

export const LeafletMapInner: React.FC<LeafletMapInnerProps> = memo(({
  center,
  savedFields,
  activeFieldId,
  isDrawingMode = false,
  drawnNodes = [],
  activeLayer = "crop_health",
  baseMapType = "satellite",
  pinsList = [],
  onMapClick,
  onSelectField,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const labelLayerRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // 1. Load Leaflet CDN script & CSS once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).L) {
      setMapReady(true);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setMapReady(true);
    document.body.appendChild(script);
  }, []);

  // 2. Initialize Map — runs once when Leaflet is ready
  useEffect(() => {
    if (!mapReady || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Fix default icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Zoom control bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Satellite base tiles
    tileLayerRef.current = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Esri Satellite" }
    ).addTo(map);

    // Labels overlay
    labelLayerRef.current = L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, opacity: 0.8 }
    ).addTo(map);

    // Vector layer group for polygons/markers
    layerGroupRef.current = L.layerGroup().addTo(map);

    // Map click handler
    map.on("click", (e: any) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // Fix size after mount
    setTimeout(() => {
      try { map.invalidateSize(); } catch { /* ignore */ }
    }, 300);

    return () => {
      try { map.remove(); } catch { /* ignore */ }
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      labelLayerRef.current = null;
      layerGroupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // 3. Switch Base Map Tiles when baseMapType changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    try { if (tileLayerRef.current) map.removeLayer(tileLayerRef.current); } catch { /* ignore */ }
    try { if (labelLayerRef.current) map.removeLayer(labelLayerRef.current); } catch { /* ignore */ }
    tileLayerRef.current = null;
    labelLayerRef.current = null;

    if (baseMapType === "satellite") {
      tileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
      ).addTo(map);
      labelLayerRef.current = L.tileLayer(
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, opacity: 0.85 }
      ).addTo(map);
    } else if (baseMapType === "streets") {
      tileLayerRef.current = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 19 }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(map);
    }

    // Ensure vector layer stays on top by re-adding it
    if (layerGroupRef.current) {
      try {
        map.removeLayer(layerGroupRef.current);
        layerGroupRef.current.addTo(map);
      } catch { /* ignore */ }
    }
  }, [baseMapType, mapReady]);

  // 4. Smooth Pan to center (guarded)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    // Delay to ensure map has rendered
    setTimeout(() => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(center, 15, { animate: true, duration: 1.2 });
        }
      } catch { /* ignore */ }
    }, 100);
  }, [center, mapReady]);

  // 5. Render Field Polygons, Drawing Nodes, Observation Pins
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !layerGroupRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // A. Field Polygons
    savedFields.forEach((field) => {
      if (!field.polygon || field.polygon.length < 3) return;
      const isActive = field.id === activeFieldId;
      const baseColor = isActive ? "#10B981" : field.color || "#F59E0B";

      let fillColor = baseColor;
      let fillOpacity = isActive ? 0.55 : 0.3;

      if (activeLayer === "temp") {
        fillColor = isActive ? "#EF4444" : "#F97316";
        fillOpacity = 0.6;
      } else if (activeLayer === "rain") {
        fillColor = "#3B82F6";
        fillOpacity = 0.55;
      } else if (activeLayer === "soil") {
        fillColor = "#8B5CF6";
        fillOpacity = 0.55;
      } else if (activeLayer === "crop_health") {
        fillColor = isActive ? "#10B981" : "#84CC16";
        fillOpacity = 0.5;
      }

      const polygonObj = L.polygon(field.polygon, {
        color: isActive ? "#059669" : baseColor,
        weight: isActive ? 4 : 2,
        dashArray: isActive ? undefined : "4, 4",
        fillColor,
        fillOpacity,
      });

      polygonObj.bindTooltip(
        `<div style="font-size:11px; font-family:sans-serif; line-height:1.4">
          <strong>${field.name}</strong><br/>
          <span style="color:#059669">${field.crop} (${field.cropVariety || "JS-335"})</span><br/>
          ${field.areaAcres} Acres
        </div>`,
        { permanent: false, direction: "top" }
      );

      polygonObj.on("click", () => {
        if (onSelectField) onSelectField(field);
      });

      layerGroup.addLayer(polygonObj);

      // Field label badge at center
      const centerIcon = L.divIcon({
        className: "field-center-badge",
        html: `<div style="background:${isActive ? "#059669" : "#1E293B"};color:white;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:800;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);white-space:nowrap;">
          🌱 ${field.name} (${field.areaAcres} Ac)
        </div>`,
      });

      const centerMarker = L.marker(field.center, { icon: centerIcon });
      centerMarker.on("click", () => {
        if (onSelectField) onSelectField(field);
      });
      layerGroup.addLayer(centerMarker);
    });

    // B. Drawing polygon preview
    if (drawnNodes.length > 0) {
      drawnNodes.forEach((node, idx) => {
        const circle = L.circleMarker(node, {
          radius: 7,
          color: "#FFFFFF",
          weight: 2,
          fillColor: "#F59E0B",
          fillOpacity: 1,
        }).bindTooltip(`Vertex ${idx + 1}`, { permanent: true, direction: "top" });
        layerGroup.addLayer(circle);
      });

      if (drawnNodes.length >= 2) {
        layerGroup.addLayer(
          L.polyline(drawnNodes, { color: "#F59E0B", weight: 3, dashArray: "6, 6" })
        );
      }

      if (drawnNodes.length >= 3) {
        layerGroup.addLayer(
          L.polygon(drawnNodes, {
            color: "#F59E0B",
            weight: 2,
            fillColor: "#FBBF24",
            fillOpacity: 0.3,
          })
        );
      }
    }

    // C. Observation pins
    pinsList.forEach((pin) => {
      const pinIcon = L.divIcon({
        className: "custom-pin-marker",
        html: `<div style="background:#EF4444;color:white;padding:3px 7px;border-radius:8px;font-size:10px;font-weight:bold;border:1.5px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.35)">
          📍 ${pin.note}
        </div>`,
      });
      const marker = L.marker([pin.lat, pin.lon], { icon: pinIcon }).bindPopup(
        `<div style="font-family:sans-serif;font-size:12px">
          <strong>Observation</strong><br/>${pin.note}<br/><small style="color:#64748B">${pin.date}</small>
        </div>`
      );
      layerGroup.addLayer(marker);
    });

  }, [mapReady, savedFields, activeFieldId, drawnNodes, activeLayer, pinsList, onSelectField]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full bg-slate-950 rounded-2xl overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
});
