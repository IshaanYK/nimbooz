import { NextRequest, NextResponse } from "next/server";
import { getMandiRatesForLocation, getLatestMandiPrice, formatMandiResponseStructured } from "@/lib/mandiPriceService";
import { fetchLiveAgronomicTelemetry } from "@/lib/geminiEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") || "";
  const district = searchParams.get("district") || "Bhopal";
  const crop = searchParams.get("crop") || "";
  const variety = searchParams.get("variety") || "";
  const grade = searchParams.get("grade") || "";
  const marketDate = searchParams.get("marketDate") || "";
  const userLocation = searchParams.get("location") || "";
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

  // If a single specific crop was queried
  if (crop && crop.trim()) {
    try {
      const singleRate = await getLatestMandiPrice({
        commodity: crop,
        variety: variety || undefined,
        grade: grade || undefined,
        marketDate: marketDate || undefined,
        location: {
          lat,
          lon,
          district,
          state,
          userLocation: userLocation || `${district}, ${state}`,
        },
        telemetry: telemetryFactors,
      });

      return NextResponse.json({
        success: true,
        record: singleRate,
        rates: [singleRate],
        source: singleRate.source,
        sourceRecordId: singleRate.sourceRecordId,
        marketDate: singleRate.marketDate,
        formattedDate: singleRate.formattedDate,
        isToday: singleRate.isToday,
        userLocation: singleRate.userLocation,
        mandi: singleRate.mandi,
        mandiHi: singleRate.mandiHi,
        variety: singleRate.variety,
        varietyMatched: singleRate.varietyMatched,
        varietyNotice: singleRate.varietyNotice,
        structuredTextEn: formatMandiResponseStructured(singleRate, "en"),
        structuredTextHi: formatMandiResponseStructured(singleRate, "hi"),
        telemetry: telemetryFactors,
      });
    } catch (err: any) {
      return NextResponse.json({
        success: false,
        error: err.message || "Failed to retrieve verified mandi price",
        rates: [],
      }, { status: 400 });
    }
  }

  // Multi-commodity location feed
  try {
    const dynamicRates = await getMandiRatesForLocation(
      userLocation || district,
      state,
      lat,
      lon,
      telemetryFactors
    );
    const cleanDistrict = district.replace(/District|Division|Mandi/gi, "").trim() || "District";

    return NextResponse.json({
      success: true,
      rates: dynamicRates,
      source: dynamicRates[0]?.source || `${cleanDistrict} APMC (Directorate of Marketing & Inspection)`,
      sourceRecordId: dynamicRates[0]?.sourceRecordId,
      marketDate: dynamicRates[0]?.marketDate || new Date().toISOString().split("T")[0],
      formattedDate: dynamicRates[0]?.formattedDate || "Today",
      isToday: dynamicRates[0]?.isToday ?? true,
      userLocation: userLocation || `${district}, ${state}`,
      mandi: dynamicRates[0]?.mandi || `${cleanDistrict} APMC Mandi`,
      telemetry: telemetryFactors,
    });
  } catch (e: any) {
    console.error("Mandi rates API error:", e);
    return NextResponse.json({
      success: false,
      rates: [],
      error: "Mandi price data temporarily unavailable",
    }, { status: 500 });
  }
}
