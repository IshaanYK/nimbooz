"use client";

import { getStoredProfile } from "./userStore";

/**
 * AASRA Multi-Field Store & Polygon Boundary Engine
 * Allows farmers to create, draw, store, select, pin observations, and manage real field boundary polygons.
 */

export interface FieldPin {
  id: string;
  fieldId?: string;
  lat: number;
  lon: number;
  note: string;
  category: "pest" | "water" | "spray" | "general";
  date: string;
}

export interface FieldRecord {
  id: string;
  name: string;
  crop: string;            // "Rice / Paddy", "Soybean", "Wheat", "Cotton", "Sugarcane", "Maize"
  cropVariety: string;     // e.g. "Pusa Basmati 1121", "JS-335"
  areaAcres: number;       // Calculated field area in acres
  areaHa: number;          // Calculated field area in hectares
  center: [number, number]; // [lat, lon] center coordinate
  polygon: Array<[number, number]>; // Boundary coordinates
  sowingDate: string;
  growthStage: string;
  soilType: string;
  irrigationType: string;
  color: string;
  district?: string;
  state?: string;
  village?: string;
  pins?: FieldPin[];
  healthScore?: number;
}

export const CROP_OPTIONS = [
  { id: "soybean", name: "Soybean (सोयाबीन)", defaultVariety: "JS-335", stage: "R2 Flowering" },
  { id: "rice", name: "Rice / Paddy (धान)", defaultVariety: "Pusa Basmati 1121", stage: "Flowering / Grain Filling" },
  { id: "wheat", name: "Wheat (गेहूं)", defaultVariety: "HD-2967", stage: "Tillering Stage" },
  { id: "cotton", name: "Cotton (कपास)", defaultVariety: "Bt Cotton II", stage: "Square Formation" },
  { id: "sugarcane", name: "Sugarcane (गन्ना)", defaultVariety: "Co-86032", stage: "Grand Growth Phase" },
  { id: "maize", name: "Maize (मक्का)", defaultVariety: "HQPM-1", stage: "Tasseling Stage" },
];

const STORAGE_KEY_FIELDS = "aasra_farmer_real_fields_v4";
const STORAGE_KEY_ACTIVE_FIELD = "aasra_active_field_id_v4";
const STORAGE_KEY_PINS = "aasra_map_pins_v4";

/**
 * Helper to generate template field for a farmer
 */
export function getInitialFarmerField(): FieldRecord {
  const profile = getStoredProfile();
  const lat = profile.gpsLocation?.lat || 23.2599;
  const lon = profile.gpsLocation?.lon || 77.4126;
  const farmerName = profile.fullName.trim() || "My";
  const fieldName = profile.fieldName || `${farmerName}'s Farm Plot`;

  return {
    id: `field_${Date.now()}`,
    name: fieldName,
    crop: profile.primaryCrop || "Soybean",
    cropVariety: profile.cropVariety || "JS-335",
    areaAcres: profile.fieldAreaAcres || 5.0,
    areaHa: profile.fieldAreaHa || 2.0,
    center: [lat, lon],
    polygon: [
      [lat + 0.001, lon - 0.001],
      [lat + 0.001, lon + 0.001],
      [lat - 0.001, lon + 0.001],
      [lat - 0.001, lon - 0.001],
    ],
    sowingDate: profile.sowingDate || "2026-06-15",
    growthStage: "R2 Flowering Stage",
    soilType: profile.soilType || "Black Cotton Soil",
    irrigationType: profile.irrigationType || "Rainfed + Borewell",
    color: "#10B981",
    healthScore: 92,
    pins: [],
  };
}

/**
 * Calculate planar Shoelace polygon area in Acres and Hectares
 */
export function calculatePolygonAreaAcres(coords: Array<[number, number]>): { acres: number; ha: number } {
  if (coords.length < 3) return { acres: 0, ha: 0 };
  
  const R = 6378137; // Earth radius in meters
  const meanLat = (coords.reduce((acc, c) => acc + c[0], 0) / coords.length) * (Math.PI / 180);
  const cosLat = Math.cos(meanLat);

  // Convert lat/lon coordinates to local metric (x, y) meters
  const points = coords.map(([lat, lon]) => ({
    x: (lon * Math.PI / 180) * R * cosLat,
    y: (lat * Math.PI / 180) * R,
  }));

  // Standard Shoelace formula in square meters
  let areaM2 = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    areaM2 += points[i].x * points[j].y;
    areaM2 -= points[j].x * points[i].y;
  }
  areaM2 = Math.abs(areaM2) / 2;

  const ha = Math.round((areaM2 / 10000) * 100) / 100;
  const acres = Math.round((areaM2 / 4046.85642) * 100) / 100;
  return { acres: acres > 0 ? acres : 0.5, ha: ha > 0 ? ha : 0.2 };
}

/**
 * Get all saved farmer fields (NO fake pre-populated dummy farms)
 */
export function getSavedFields(): FieldRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIELDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error reading fields from storage:", e);
  }
  return [];
}

/**
 * Save or update a field
 */
export function saveFarmerField(field: FieldRecord): FieldRecord[] {
  const current = getSavedFields();
  const existingIdx = current.findIndex((f) => f.id === field.id);
  let updated: FieldRecord[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = field;
  } else {
    updated = [field, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEY_FIELDS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY_ACTIVE_FIELD, field.id);
  } catch (e) {
    console.error("Error saving field:", e);
  }
  return updated;
}

/**
 * Delete a field
 */
export function deleteFarmerField(fieldId: string): FieldRecord[] {
  const current = getSavedFields();
  const updated = current.filter((f) => f.id !== fieldId);
  try {
    localStorage.setItem(STORAGE_KEY_FIELDS, JSON.stringify(updated));
    if (getActiveFieldId() === fieldId) {
      if (updated.length > 0) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_FIELD, updated[0].id);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_FIELD);
      }
    }
  } catch (e) {
    console.error("Error deleting field:", e);
  }
  return updated;
}

/**
 * Get active field ID
 */
export function getActiveFieldId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_ACTIVE_FIELD);
}

/**
 * Set active field ID
 */
export function setActiveField(fieldId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_ACTIVE_FIELD, fieldId);
}

/**
 * Get active field record
 */
export function getActiveField(): FieldRecord {
  const fields = getSavedFields();
  if (fields.length === 0) return getInitialFarmerField();
  const activeId = getActiveFieldId();
  return fields.find((f) => f.id === activeId) || fields[0] || getInitialFarmerField();
}

/**
 * Save a field observation pin
 */
export function saveFieldPin(pin: FieldPin): FieldPin[] {
  const current = getSavedPins();
  const updated = [pin, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_PINS, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving pin:", e);
  }
  return updated;
}

/**
 * Get all saved pins
 */
export function getSavedPins(): FieldPin[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PINS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error reading pins:", e);
  }
  return [];
}
