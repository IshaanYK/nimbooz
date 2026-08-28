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
  const [mapLoaded, setMapLoaded] = useState(false);

  // 1. Load Leaflet CDN script & CSS reliably
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

  // 2. Initialize Leaflet Map Instance ONCE
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Fix default Leaflet icon paths
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

    // Add custom positioned Zoom Control
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Initial Base Tiles (Esri Satellite)
    const baseTiles = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Esri Satellite" }
    ).addTo(map);
    tileLayerRef.current = baseTiles;

    // Labels overlay for villages, roads, and mandis
    const labelTiles = L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, opacity: 0.8 }
    ).addTo(map);
    labelLayerRef.current = labelTiles;

    // Layer Group for vector features
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    map.on("click", (e: any) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // Invalidate size on mount
    setTimeout(() => map.invalidateSize(), 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapLoaded]);

  // 3. Switch Base Map Tiles smoothly
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !tileLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = mapInstanceRef.current;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    if (labelLayerRef.current) map.removeLayer(labelLayerRef.current);

    if (baseMapType === "satellite") {
      tileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, attribution: "Esri Satellite" }
      ).addTo(map);
      labelLayerRef.current = L.tileLayer(
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, opacity: 0.85 }
      ).addTo(map);
    } else if (baseMapType === "streets") {
      tileLayerRef.current = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 19, attribution: "OpenStreetMap" }
      ).addTo(map);
    } else {
      // CartoDB Voyager Hybrid
      tileLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, attribution: "CartoDB Voyager" }
      ).addTo(map);
    }

    if (layerGroupRef.current) {
      layerGroupRef.current.bringToFront();
    }
  }, [baseMapType, mapLoaded]);

  // 4. Smooth Pan / Fly to New Center
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.flyTo(center, 15, { duration: 1.2, easeLinearity: 0.25 });
  }, [center, mapLoaded]);

  // 5. Update Field Polygons, Drawing Nodes, and Pins
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !layerGroupRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // A. Render Registered Field Polygons
    savedFields.forEach((field) => {
      if (field.polygon && field.polygon.length >= 3) {
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
          fillColor: fillColor,
          fillOpacity: fillOpacity,
        });

        // Interactive Popup & Tooltip
        polygonObj.bindTooltip(
          `<div class="text-xs font-sans">
            <strong class="text-slate-900 block font-bold">${field.name}</strong>
            <span class="text-emerald-700 font-bold">${field.crop} (${field.cropVariety || "JS-335"})</span> · 
            <span>${field.areaAcres} Acres</span>
          </div>`,
          { permanent: false, direction: "top", className: "field-map-tooltip" }
        );

        polygonObj.on("click", () => {
          if (onSelectField) onSelectField(field);
        });

        layerGroup.addLayer(polygonObj);

        // Center Marker Badge for Field
        const centerIcon = L.divIcon({
          className: "field-center-badge",
          html: `<div style="background:${isActive ? "#059669" : "#1E293B"}; color:white; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:800; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.4); white-space:nowrap; display:flex; align-items:center; gap:4px">
            <span>🌱 ${field.name}</span>
            <span style="color:#A7F3D0">(${field.areaAcres} Ac)</span>
          </div>`,
        });

        const centerMarker = L.marker(field.center, { icon: centerIcon });
        centerMarker.on("click", () => {
          if (onSelectField) onSelectField(field);
        });
        layerGroup.addLayer(centerMarker);
      }
    });

    // B. Render Drawn Nodes for Polygon Creation
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
        const line = L.polyline(drawnNodes, { color: "#F59E0B", weight: 3, dashArray: "6, 6" });
        layerGroup.addLayer(line);
      }

      if (drawnNodes.length >= 3) {
        const previewPoly = L.polygon(drawnNodes, {
          color: "#F59E0B",
          weight: 2,
          fillColor: "#FBBF24",
          fillOpacity: 0.35,
        });
        layerGroup.addLayer(previewPoly);
      }
    }

    // C. Render Observation Pins
    pinsList.forEach((pin) => {
      const pinIcon = L.divIcon({
        className: "custom-pin-marker",
        html: `<div style="background:#EF4444; color:white; padding:3px 7px; border-radius:8px; font-size:10px; font-weight:bold; border:1.5px solid white; box-shadow:0 3px 6px rgba(0,0,0,0.35); display:flex; align-items:center; gap:3px">
          <span>📍</span> <span>${pin.note}</span>
        </div>`,
      });
      const marker = L.marker([pin.lat, pin.lon], { icon: pinIcon }).bindPopup(
        `<div style="font-family:sans-serif; font-size:12px; line-height:1.4">
          <strong style="color:#0F172A">Observation Point</strong><br/>
          <span>${pin.note}</span><br/>
          <small style="color:#64748B">${pin.date}</small>
        </div>`
      );
      layerGroup.addLayer(marker);
    });

  }, [mapLoaded, savedFields, activeFieldId, isDrawingMode, drawnNodes, activeLayer, pinsList, onSelectField]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full bg-slate-950 z-0 relative isolate overflow-hidden rounded-2xl [&_.leaflet-container]:!z-1 [&_.leaflet-pane]:!z-1"
    />
  );
});
