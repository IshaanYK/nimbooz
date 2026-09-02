import { NextRequest, NextResponse } from "next/server";
import { COMPREHENSIVE_MANDI_REGISTRY } from "@/lib/locationResolver";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // 1. Handle Reverse Geocoding (lat/lon to district & state)
  if (lat && lon) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

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
        const district =
          addr.state_district ||
          addr.county ||
          addr.city ||
          addr.district ||
          addr.town ||
          addr.suburb ||
          "Local Region";
        const state = addr.state || "India";
        const village =
          addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || "";
        const country = addr.country || "India";
        const displayName =
          data.display_name ||
          (village ? `${village}, ${district}, ${state}` : `${district}, ${state}`);

        return NextResponse.json({
          district,
          state,
          village,
          country,
          displayName,
          lat: latNum,
          lon: lonNum,
        });
      }
    } catch (err) {
      console.warn("[Reverse Geocode Error]:", err);
    }

    // Fallback based on nearest APMC mandi in registry if Nominatim is unreachable
    const matchedMandi = COMPREHENSIVE_MANDI_REGISTRY.find(
      (m) => Math.abs(m.lat - latNum) < 0.5 && Math.abs(m.lon - lonNum) < 0.5
    );

    if (matchedMandi) {
      return NextResponse.json({
        district: matchedMandi.district,
        state: matchedMandi.state,
        village: "",
        country: "India",
        displayName: `${matchedMandi.district}, ${matchedMandi.state}`,
        lat: latNum,
        lon: lonNum,
      });
    }

    return NextResponse.json({
      district: "Local Region",
      state: "India",
      village: "",
      country: "India",
      displayName: `Location (${latNum.toFixed(2)}° N, ${lonNum.toFixed(2)}° E)`,
      lat: latNum,
      lon: lonNum,
    });
  }

  // 2. Handle Forward Geocoding (query search)
  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const queryLower = q.toLowerCase().trim();

  // Try matching against registry first
  const registryMatches = COMPREHENSIVE_MANDI_REGISTRY.filter((m) =>
    m.aliases.some((a) => queryLower.includes(a.toLowerCase())) ||
    m.district.toLowerCase().includes(queryLower) ||
    m.state.toLowerCase().includes(queryLower)
  ).map((m) => ({
    name: `${m.nameEn} (${m.district}, ${m.state})`,
    lat: m.lat,
    lon: m.lon,
    district: m.district,
    state: m.state,
    type: "mandi",
  }));

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
        return NextResponse.json({ results: [...registryMatches.slice(0, 2), ...mapped] });
      }
    }
  } catch (err) {
    console.warn("[Geocode API Error]:", err);
  }

  if (registryMatches.length > 0) {
    return NextResponse.json({
      results: registryMatches,
    });
  }

  return NextResponse.json({
    results: [],
  });
}
