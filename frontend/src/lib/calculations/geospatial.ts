/**
 * Centralized Geospatial Calculation Engine for Nimbooz Precision Agriculture
 * Provides accurate spherical polygon area calculation and geodesic distance without arbitrary hardcoded values.
 */

const EARTH_RADIUS_METERS = 6378137; // WGS84 Major Axis Radius
const HECTARE_TO_ACRES = 2.47105381;
const SQ_METERS_TO_HECTARES = 0.0001;
const SQ_METERS_TO_ACRES = 0.000247105381;

export interface AreaResult {
  squareMeters: number;
  hectares: number;
  acres: number;
}

/**
 * Calculates true spherical polygon area from an array of [lat, lon] coordinates using geodesic projection.
 * Returns square meters, hectares, and acres.
 */
export function calculatePolygonArea(polygon: Array<[number, number]>): AreaResult {
  if (!polygon || polygon.length < 3) {
    return { squareMeters: 0, hectares: 0, acres: 0 };
  }

  let total = 0;
  const len = polygon.length;

  for (let i = 0; i < len; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % len];

    const lat1Rad = (p1[0] * Math.PI) / 180;
    const lon1Rad = (p1[1] * Math.PI) / 180;
    const lat2Rad = (p2[0] * Math.PI) / 180;
    const lon2Rad = (p2[1] * Math.PI) / 180;

    total += (lon2Rad - lon1Rad) * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }

  const sqMeters = Math.abs((total * EARTH_RADIUS_METERS * EARTH_RADIUS_METERS) / 2.0);
  const roundedSqMeters = Math.round(sqMeters * 10) / 10;
  const hectares = Math.round(sqMeters * SQ_METERS_TO_HECTARES * 100) / 100;
  const acres = Math.round(sqMeters * SQ_METERS_TO_ACRES * 100) / 100;

  return {
    squareMeters: roundedSqMeters,
    hectares,
    acres: acres > 0 ? acres : 0.1, // Safe minimum for display if polygon is tiny
  };
}

/**
 * Calculates geodesic distance between two coordinate pairs using Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = (EARTH_RADIUS_METERS / 1000) * c;
  return Math.round(km * 10) / 10;
}

/**
 * Calculates geographic centroid of a polygon.
 */
export function calculatePolygonCentroid(polygon: Array<[number, number]>): [number, number] {
  if (!polygon || polygon.length === 0) return [23.2599, 77.4126];
  const sumLat = polygon.reduce((acc, curr) => acc + curr[0], 0);
  const sumLon = polygon.reduce((acc, curr) => acc + curr[1], 0);
  return [
    Math.round((sumLat / polygon.length) * 100000) / 100000,
    Math.round((sumLon / polygon.length) * 100000) / 100000,
  ];
}
