import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // 1. Handle Reverse Geocoding (lat/lon to district & state)
  if (lat && lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lon)}&zoom=10&addressdetails=1`;
      
      const res = await fetch(url, {
        headers: {
          "User-Agent": "AASRA-AgriGIS-Navigator/1.0",
          Accept: "application/json",
        },
        next: { revalidate: 86400 },
      });

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const district = addr.county || addr.state_district || addr.city || addr.town || addr.suburb || "Local Region";
        const state = addr.state || "India";
        const village = addr.village || addr.suburb || addr.neighbourhood || "";
        const displayName = data.display_name || `${district}, ${state}`;

        return NextResponse.json({
          district,
          state,
          village,
          displayName,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
        });
      }
    } catch (err) {
      console.warn("[Reverse Geocode Error]:", err);
    }

    return NextResponse.json({
      district: "Local Region",
      state: "India",
      village: "",
      displayName: `Location (${parseFloat(lat).toFixed(2)}, ${parseFloat(lon).toFixed(2)})`,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
    });
  }

  // 2. Handle Forward Geocoding (query search)
  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const PRESET_DISTRICTS: Record<string, { lat: number; lon: number; name: string }> = {
    bhopal: { lat: 23.2599, lon: 77.4126, name: "Bhopal, Madhya Pradesh" },
    fanda: { lat: 23.2389, lon: 77.2917, name: "Fanda Kalan, Bhopal, Madhya Pradesh" },
    indore: { lat: 22.7196, lon: 75.8577, name: "Indore, Madhya Pradesh" },
    sehore: { lat: 23.2032, lon: 77.0844, name: "Sehore, Madhya Pradesh" },
    vidisha: { lat: 23.5251, lon: 77.8081, name: "Vidisha, Madhya Pradesh" },
    ujjain: { lat: 23.1765, lon: 75.7885, name: "Ujjain, Madhya Pradesh" },
    hoshangabad: { lat: 22.7519, lon: 77.7289, name: "Narmadapuram (Hoshangabad), Madhya Pradesh" },
    jabalpur: { lat: 23.1815, lon: 79.9864, name: "Jabalpur, Madhya Pradesh" },
    gwalior: { lat: 26.2183, lon: 78.1828, name: "Gwalior, Madhya Pradesh" },
    pune: { lat: 18.5204, lon: 73.8567, name: "Pune, Maharashtra" },
    nashik: { lat: 19.9975, lon: 73.7898, name: "Nashik, Maharashtra" },
    nagpur: { lat: 21.1458, lon: 79.0882, name: "Nagpur, Maharashtra" },
    ludhiana: { lat: 30.901, lon: 75.8573, name: "Ludhiana, Punjab" },
    karnal: { lat: 29.6857, lon: 76.9905, name: "Karnal, Haryana" },
    rajkot: { lat: 22.3039, lon: 70.8022, name: "Rajkot, Gujarat" },
  };

  const queryLower = q.toLowerCase().trim();
  const presetMatch = Object.entries(PRESET_DISTRICTS).find(([k]) => queryLower.includes(k));

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q + ", India"
    )}&limit=5&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "AASRA-AgriGIS-Navigator/1.0",
        Accept: "application/json",
      },
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item: any) => ({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          type: item.type || "city",
        }));
        return NextResponse.json({ results: mapped });
      }
    }
  } catch (err) {
    console.warn("[Geocode API Error]:", err);
  }

  if (presetMatch) {
    return NextResponse.json({
      results: [presetMatch[1]],
    });
  }

  return NextResponse.json({
    results: [PRESET_DISTRICTS.bhopal],
  });
}
