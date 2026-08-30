import { NextRequest, NextResponse } from "next/server";
import { getMandiRatesByLocation } from "@/lib/mandiEngine";
import { fetchLiveAgronomicTelemetry } from "@/lib/geminiEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") || "";
  const district = searchParams.get("district") || "Local Region";
  const lat = parseFloat(searchParams.get("lat") || "23.2599");
  const lon = parseFloat(searchParams.get("lon") || "77.4126");

  // Fetch real-time telemetry for the user's location
  let telemetryFactors = {
    temp: 28,
    nightTemp: 23,
    soilMoisture: 40,
    windSpeed: 10,
    isNightHeatStress: false,
    isRaining: false,
  };

  try {
    const live = await fetchLiveAgronomicTelemetry(lat, lon);
    telemetryFactors = {
      temp: live.temp,
      nightTemp: live.nightTemp,
      soilMoisture: live.soilMoisture,
      windSpeed: live.windSpeed,
      isNightHeatStress: live.nightTemp > 25.0,
      isRaining: false,
    };
  } catch (e) {
    console.warn("Live telemetry for mandi rates skipped:", e);
  }

  const dynamicRates = getMandiRatesByLocation(district, state, telemetryFactors);
  const cleanDistrict = district.replace(/District|Division|Mandi/gi, "").trim() || "District";

  return NextResponse.json({
    success: true,
    rates: dynamicRates,
    source: `${cleanDistrict} APMC Live Agro-Intelligence`,
    telemetry: telemetryFactors,
  });
}

