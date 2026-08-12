import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "23.2599");
  const lon = parseFloat(searchParams.get("lon") || "77.4126");
  const crop = searchParams.get("crop") || "soybean";

  const records = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    return {
      date: dateStr,
      temperature_max: 34.2 + (i % 3) * 0.5,
      temperature_min: 26.5 + (i % 2) * 0.4,
      temperature_mean: 29.8,
      rainfall: i === 4 ? 12.5 : 0.0,
      evapotranspiration: 4.8,
      soil_moisture: 0.28,
    };
  });

  return NextResponse.json({
    weather: {
      location: { lat, lon, domain: "NEMSGLOBAL" },
      records,
    },
    stress_assessment: {
      crop,
      stress_level: "HIGH",
      night_heat_stress: {
        active: true,
        threshold_c: 25,
        avg_night_temp: 26.5,
        consecutive_days: 4,
        description: "Night temperature > 25°C threshold during flowering stage causes pod abortion",
      },
      recommended_intervention: {
        product: "Syngenta Quantis / StressBuster Biological",
        dosage: "250 ml/acre",
        expected_yield_recovery_pct: 75,
        action: "Apply biostimulant via foliar spray within 48 hours to preserve 120-180 kg/acre yield",
      },
    },
    cumulative_gdd_7d: 138.6,
    hydric_stress_latest: [
      { date: "2026-08-10", index: 0.72, status: "Moderate Deficit" },
      { date: "2026-08-11", index: 0.78, status: "Severe Deficit" },
      { date: "2026-08-12", index: 0.81, status: "Critical Heat/Hydric Stress" },
    ],
    cehub_gdd_latest: [
      { date: "2026-08-10", gdd: 19.8 },
      { date: "2026-08-11", gdd: 20.1 },
      { date: "2026-08-12", gdd: 19.5 },
    ],
  });
}
