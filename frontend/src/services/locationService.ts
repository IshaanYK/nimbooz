/**
 * ASSARA Location Service
 * Provides verified GPS geolocation, Nominatim reverse geocoding, and Open-Meteo search.
 * Never hardcodes fallback coordinates.
 */

export interface LocationResult {
  lat: number;
  lon: number;
  name: string;
  district?: string;
  state?: string;
  country?: string;
  source: "GPS" | "SEARCH" | "MAP_CLICK" | "CACHED";
  timestamp: string;
}

export interface GeocodeSuggestion {
  name: string;
  district: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}

/**
 * Obtain current user coordinates via browser GPS with high accuracy
 */
export async function getCurrentGPSLocation(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser"));
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Math.round(pos.coords.latitude * 100000) / 100000;
        const lon = Math.round(pos.coords.longitude * 100000) / 100000;

        let locationName = `GPS (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`;
        let district = "";
        let state = "";
        let country = "India";

        try {
          // Reverse geocode via internal API
          const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.address) {
              district = data.address.state_district || data.address.county || data.address.city || "";
              state = data.address.state || "";
              country = data.address.country || "India";
              locationName = data.display_name || `${district}, ${state}`;
            }
          }
        } catch (_) {}

        resolve({
          lat,
          lon,
          name: locationName,
          district: district || undefined,
          state: state || undefined,
          country,
          source: "GPS",
          timestamp: new Date().toISOString(),
        });
      },
      (err) => {
        reject(new Error(err.message || "Unable to retrieve GPS location"));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

/**
 * Autocomplete search for Indian cities, districts, and tehsils
 */
export async function searchLocation(query: string): Promise<GeocodeSuggestion[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          name: item.name || item.display_name || "Unknown",
          district: item.district || item.address?.state_district || "",
          state: item.state || item.address?.state || "",
          country: item.country || item.address?.country || "India",
          lat: Number(item.lat),
          lon: Number(item.lon),
        }));
      }
    }
  } catch (err) {
    console.warn("[LocationService] Search failed:", err);
  }

  return [];
}
