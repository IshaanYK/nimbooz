"use client";

/**
 * AASRA Multi-Field Store & Polygon Boundary Engine
 * Allows farmers to create, draw, store, select, pin observations, and manage unlimited field boundary polygons.
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
  pins?: FieldPin[];
  healthScore?: number;
}

export const CROP_OPTIONS = [
  { id: "rice", name: "Rice / Paddy (धान)", defaultVariety: "Pusa Basmati 1121", stage: "Flowering / Grain Filling" },
  { id: "soybean", name: "Soybean (सोयाबीन)", defaultVariety: "JS-335", stage: "R2 Flowering" },
  { id: "wheat", name: "Wheat (गेहूं)", defaultVariety: "HD-2967", stage: "Tillering Stage" },
  { id: "cotton", name: "Cotton (कपास)", defaultVariety: "Bt Cotton II", stage: "Square Formation" },
  { id: "sugarcane", name: "Sugarcane (गन्ना)", defaultVariety: "Co-86032", stage: "Grand Growth Phase" },
  { id: "maize", name: "Maize (मक्का)", defaultVariety: "HQPM-1", stage: "Tasseling Stage" },
];

export const DEFAULT_SAVED_FIELDS: FieldRecord[] = [
  {
    id: "field_a_rice",
    name: "Field A - Rice / Paddy Plot",
    crop: "Rice / Paddy",
    cropVariety: "Pusa Basmati 1121",
    areaAcres: 5.2,
    areaHa: 2.1,
    center: [23.2599, 77.4126],
    polygon: [
      [23.2615, 77.4105],
      [23.2628, 77.4142],
      [23.2595, 77.4158],
      [23.2582, 77.4118],
    ],
    sowingDate: "2026-06-10",
    growthStage: "Flowering Phase",
    soilType: "Clay Loam Soil",
    irrigationType: "Canal + Submersible",
    color: "#00A878",
    healthScore: 92,
    pins: [
      { id: "pin_1", lat: 23.2605, lon: 77.4125, note: "Syngenta Stress Buster Applied", category: "spray", date: "2026-08-10" }
    ]
  },
  {
    id: "field_b_soybean",
    name: "Field B - Bhopal Soybean Plot",
    crop: "Soybean",
    cropVariety: "JS-335",
    areaAcres: 4.2,
    areaHa: 1.7,
    center: [23.2550, 77.4200],
    polygon: [
      [23.2570, 77.4180],
      [23.2580, 77.4220],
      [23.2540, 77.4230],
      [23.2530, 77.4190],
    ],
    sowingDate: "2026-06-15",
    growthStage: "R2 Flowering Stage",
    soilType: "Black Cotton Soil",
    irrigationType: "Rainfed",
    color: "#F59E0B",
    healthScore: 84,
    pins: []
  },
];

const STORAGE_KEY_FIELDS = "aasra_farmer_fields_v2";
const STORAGE_KEY_ACTIVE_FIELD = "aasra_active_field_id_v2";
const STORAGE_KEY_PINS = "aasra_map_pins_v1";

/**
 * Calculate Shoelace spherical polygon area in Acres and Hectares
 */
export function calculatePolygonAreaAcres(coords: Array<[number, number]>): { acres: number; ha: number } {
  if (coords.length < 3) return { acres: 0, ha: 0 };
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6378137;
  let areaM2 = 0;
  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    areaM2 += (rad(p2[1]) - rad(p1[1])) * (2 + Math.sin(rad(p1[0])) + Math.sin(rad(p2[0])));
  }
  areaM2 = (Math.abs(areaM2) * R * R) / 2;
  const ha = Math.round((areaM2 / 10000) * 100) / 100;
  const acres = Math.round((areaM2 / 4046.86) * 100) / 100;
  return { acres: acres || 1.2, ha: ha || 0.48 };
}

/**
 * Get all saved farmer fields
 */
export function getSavedFields(): FieldRecord[] {
  if (typeof window === "undefined") return DEFAULT_SAVED_FIELDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIELDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error reading fields from storage:", e);
  }
  return DEFAULT_SAVED_FIELDS;
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
 * Delete a field by ID
 */
export function deleteFarmerField(fieldId: string): FieldRecord[] {
  const current = getSavedFields();
  const updated = current.filter((f) => f.id !== fieldId);
  const fallbackList = updated.length > 0 ? updated : DEFAULT_SAVED_FIELDS;
  try {
    localStorage.setItem(STORAGE_KEY_FIELDS, JSON.stringify(fallbackList));
    if (fallbackList.length > 0) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_FIELD, fallbackList[0].id);
    }
  } catch (e) {
    console.error("Error deleting field:", e);
  }
  return fallbackList;
}

/**
 * Get currently selected active field for predictions
 */
export function getActiveField(): FieldRecord {
  const fields = getSavedFields();
  if (typeof window === "undefined") return fields[0];
  try {
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_FIELD);
    if (activeId) {
      const match = fields.find((f) => f.id === activeId);
      if (match) return match;
    }
  } catch (e) {}
  return fields[0];
}

/**
 * Set active field ID
 */
export function setActiveField(fieldId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_FIELD, fieldId);
  } catch (e) {}
}

/**
 * Save a pin observation
 */
export function saveFieldPin(pin: FieldPin): FieldPin[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PINS);
    const pins: FieldPin[] = raw ? JSON.parse(raw) : [];
    const updated = [pin, ...pins];
    localStorage.setItem(STORAGE_KEY_PINS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

/**
 * Get saved pins
 */
export function getSavedPins(): FieldPin[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PINS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
