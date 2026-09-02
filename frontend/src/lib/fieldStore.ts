"use client";

import { getStoredProfile } from "./userStore";
import { calculatePolygonArea } from "./calculations/geospatial";

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

import { MASTER_CROPS, getRegionalCrops, saveCustomCrop, CropInfo } from "./cropRegistry";

export { saveCustomCrop };
export type { CropInfo };

export const CROP_OPTIONS = MASTER_CROPS.map((c) => ({
  id: c.id,
  name: c.name,
  defaultVariety: c.defaultVariety,
  stage: c.stage,
}));

export function getFieldCropOptions(district?: string, state?: string) {
  const regional = getRegionalCrops(district, state);
  return regional.map((c) => ({
    id: c.id,
    name: c.name,
    defaultVariety: c.defaultVariety,
    stage: c.stage,
    isCustom: c.isCustom,
  }));
}

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
    areaHa: profile.fieldAreaHa || +( (profile.fieldAreaAcres || 5.0) * 0.4047 ).toFixed(2),
    center: [lat, lon],
    polygon: profile.polygon && profile.polygon.length >= 3 ? profile.polygon : [
      [lat + 0.0012, lon - 0.0015],
      [lat + 0.0015, lon + 0.0018],
      [lat - 0.0011, lon + 0.0014],
      [lat - 0.0014, lon - 0.0012],
    ],
    sowingDate: profile.sowingDate || "2026-06-15",
    growthStage: profile.growthStage || "R2 Flowering Stage",
    soilType: profile.soilType || "Black Cotton Soil",
    irrigationType: profile.irrigationType || "Rainfed + Borewell",
    color: "#10B981",
    healthScore: 94,
    pins: [],
  };
}

/**
 * Calculate planar Shoelace polygon area in Acres and Hectares
 */
export function calculatePolygonAreaAcres(coords: Array<[number, number]>): { acres: number; ha: number } {
  if (!coords || coords.length < 3) return { acres: 0, ha: 0 };
  const res = calculatePolygonArea(coords);
  return {
    acres: res.acres > 0 ? res.acres : 0.5,
    ha: res.hectares > 0 ? res.hectares : 0.2,
  };
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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error reading fields from storage:", e);
  }
  const initial = getInitialFarmerField();
  try {
    localStorage.setItem(STORAGE_KEY_FIELDS, JSON.stringify([initial]));
    localStorage.setItem(STORAGE_KEY_ACTIVE_FIELD, initial.id);
  } catch (_) {}
  return [initial];
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
