/**
 * AASRA /api/weather/current — Vercel-compatible serverless route
 * Calls Meteoblue Dataset API (NEMSGLOBAL) + CE Hub GDD + Hydric Stress
 * then runs AASRA Agriculture Engine to compute stress scores.
 *
 * API keys stored as server-side env vars — never exposed to browser.
 * Graceful fallback to demo data if keys are absent or API fails.
 */
import { NextRequest, NextResponse } from "next/server";
import { assessFieldStress, calcCumulativeGDD, CROP_THRESHOLDS } from "@/lib/agricultureEngine";

// ─── Helpers ─────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}
function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}
function daysAheadStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

// ─── Meteoblue Dataset API ─────────────────────────────────
async function fetchMeteoblue(lat: number, lon: number): Promise<{
  records: Array<{
    date: string;
    temperature_max: number;
    temperature_min: number;
    temperature_mean: number;
    rainfall: number;
    evapotranspiration: number;
    soil_moisture: number;
  }>;
  is_demo: boolean;
}> {
  const apiKey = process.env.METEOBLUE_API_KEY;
  if (!apiKey) {
    console.warn("[AASRA] METEOBLUE_API_KEY not set — using demo data");
    return { records: getDemoWeatherRecords(), is_demo: true };
  }

  const startDate = daysAgoStr(7);
  const endDate = todayStr();
  // Note: Meteoblue coordinates are [longitude, latitude] — CRITICAL
  const body = {
    units: { temperature: "C", velocity: "m/s", length: "metric", energy: "watts" },
    geometry: {
      type: "MultiPoint",
      coordinates: [[lon, lat]],
      locationNames: [`${lat.toFixed(4)},${lon.toFixed(4)}`],
    },
    format: "json",
    timeIntervals: [`${startDate}T+00:00/${endDate}T+00:00`],
    timeIntervalsAlignment: "none",
    queries: [
      {
        domain: "NEMSGLOBAL",
        gapFillDomain: null,
        timeResolution: "daily",
        codes: [
          { code: 11, level: "2 m above gnd", aggregation: "max" },  // temp max
          { code: 11, level: "2 m above gnd", aggregation: "min" },  // temp min
          { code: 11, level: "2 m above gnd", aggregation: "mean" }, // temp mean
          { code: 61, level: "sfc", aggregation: "sum" },            // precipitation
          { code: 144, level: "0-10 cm down", aggregation: "mean" }, // soil moisture
          { code: 261, level: "sfc", aggregation: "sum" },           // ET
        ],
      },
    ],
  };

  try {
    const res = await fetch(
      `https://my.meteoblue.com/dataset/query?apikey=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!res.ok) {
      console.warn(`[AASRA] Meteoblue HTTP ${res.status} — falling back to Open-Meteo live API`);
      return await fetchOpenMeteo(lat, lon);
    }

    const data = await res.json();
    // Parse Meteoblue response structure
    // data[0] = first query result; its geometry = one location
    const q = data?.[0];
    if (!q) return { records: getDemoWeatherRecords(), is_demo: true };

    const timeSteps: string[] = q.timeIntervals ?? [];
    // codes order: max, min, mean, rain, soil, et
    const maxArr: number[] = q.codes?.[0]?.dataPerTimeInterval?.[0]?.data ?? [];
    const minArr: number[] = q.codes?.[1]?.dataPerTimeInterval?.[0]?.data ?? [];
    const meanArr: number[] = q.codes?.[2]?.dataPerTimeInterval?.[0]?.data ?? [];
    const rainArr: number[] = q.codes?.[3]?.dataPerTimeInterval?.[0]?.data ?? [];
    const smArr: number[] = q.codes?.[4]?.dataPerTimeInterval?.[0]?.data ?? [];
    const etArr: number[] = q.codes?.[5]?.dataPerTimeInterval?.[0]?.data ?? [];

    if (maxArr.length === 0) {
      console.warn("[AASRA] Meteoblue returned empty data arrays — using demo");
      return { records: getDemoWeatherRecords(), is_demo: true };
    }

    const records = timeSteps.map((ts, i) => ({
      date: ts.split("T")[0] ?? ts,
      temperature_max: maxArr[i] ?? 30,
      temperature_min: minArr[i] ?? 20,
      temperature_mean: meanArr[i] ?? 25,
      rainfall: rainArr[i] ?? 0,
      evapotranspiration: etArr[i] ?? 4,
      soil_moisture: smArr[i] ?? 0.25,
    }));

    if (records.length > 0) {
      return { records, is_demo: false, source: "meteoblue" };
    }
    return await fetchOpenMeteo(lat, lon);
  } catch (err) {
    console.warn("[AASRA] Meteoblue fetch error — falling back to Open-Meteo live:", err);
    return await fetchOpenMeteo(lat, lon);
  }
}

// ─── Open-Meteo Live Telemetry Fallback ────────────────────
async function fetchOpenMeteo(lat: number, lon: number): Promise<{
  records: Array<{
    date: string;
    temperature_max: number;
    temperature_min: number;
    temperature_mean: number;
    rainfall: number;
    evapotranspiration: number;
    soil_moisture: number;
  }>;
  is_demo: boolean;
  source?: string;
}> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,et0_fao_evapotranspiration,soil_moisture_0_to_7cm_mean&past_days=7&forecast_days=1&timezone=auto`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { records: getDemoWeatherRecords(), is_demo: true, source: "demo" };
    const data = await res.json();
    const daily = data?.daily;
    if (!daily?.time?.length) return { records: getDemoWeatherRecords(), is_demo: true, source: "demo" };

    const records = daily.time.map((timeStr: string, i: number) => ({
      date: timeStr,
      temperature_max: Math.round((daily.temperature_2m_max?.[i] ?? 32) * 10) / 10,
      temperature_min: Math.round((daily.temperature_2m_min?.[i] ?? 23) * 10) / 10,
      temperature_mean: Math.round((daily.temperature_2m_mean?.[i] ?? 27.5) * 10) / 10,
      rainfall: Math.round((daily.precipitation_sum?.[i] ?? 0) * 10) / 10,
      evapotranspiration: Math.round((daily.et0_fao_evapotranspiration?.[i] ?? 4.2) * 10) / 10,
      soil_moisture: Math.round((daily.soil_moisture_0_to_7cm_mean?.[i] ?? 0.25) * 100) / 100,
    }));
    return { records, is_demo: false, source: "open-meteo" };
  } catch (err) {
    console.warn("[AASRA] Open-Meteo fallback error:", err);
    return { records: getDemoWeatherRecords(), is_demo: true, source: "demo" };
  }
}

// ─── CE Hub GDD ────────────────────────────────────────────
async function fetchCEHubGDD(lat: number, lon: number): Promise<{
  data: Array<{ date: string; value: number }>;
  is_demo: boolean;
}> {
  const apiKey = process.env.CEHUB_API_KEY;
  if (!apiKey) return { data: getDemoGDD(), is_demo: true };

  const startDate = daysAgoStr(14);
  const endDate = daysAgoStr(2); // CE Hub: cannot span past-to-future

  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      startDate,
      endDate,
      baseLimit: "10.0",
      maxLimit: "35.0",
      useEnhancedFormula: "true",
    });

    const res = await fetch(
      `https://services.cehub.syngenta-ais.com/api/AgronomicsDecisionRecommendation/GDDRecommendation?${params}`,
      {
        headers: { ApiKey: apiKey, Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) {
      console.warn(`[AASRA] CE Hub GDD HTTP ${res.status}`);
      return { data: getDemoGDD(), is_demo: true };
    }

    const raw: Array<{ date: string; value: number; accumlatedValue: number }> = await res.json();
    const data = (raw ?? []).slice(-7).map((r) => ({
      date: r.date?.split(" ")?.[0] ?? r.date,
      value: r.value ?? 0,
    }));

    return { data, is_demo: false };
  } catch (err) {
    console.warn("[AASRA] CE Hub GDD error:", err);
    return { data: getDemoGDD(), is_demo: true };
  }
}

// ─── CE Hub Hydric Stress ──────────────────────────────────
async function fetchCEHubHydric(lat: number, lon: number): Promise<{
  data: Array<{ date: string; status: string; index?: number }>;
  is_demo: boolean;
}> {
  const apiKey = process.env.CEHUB_API_KEY;
  if (!apiKey) return { data: getDemoHydric(), is_demo: true };

  const startDate = daysAgoStr(14);
  const endDate = daysAgoStr(2);

  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      startDate,
      endDate,
      waterAvailabilty: "50", // Note: API has intentional typo
    });

    const res = await fetch(
      `https://services.cehub.syngenta-ais.com/api/AgronomicsDecisionRecommendation/HydricStressRecommendation?${params}`,
      {
        headers: { ApiKey: apiKey, Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) {
      console.warn(`[AASRA] CE Hub Hydric HTTP ${res.status}`);
      return { data: getDemoHydric(), is_demo: true };
    }

    const raw: Array<{ date?: string; constraint?: string; soilWaterIndex?: number }> = await res.json();
    const data = (raw ?? []).slice(-5).map((r) => ({
      date: r.date?.split(" ")?.[0] ?? "",
      status: r.constraint ?? "Normal",
      index: r.soilWaterIndex,
    }));

    return { data, is_demo: false };
  } catch (err) {
    console.warn("[AASRA] CE Hub Hydric error:", err);
    return { data: getDemoHydric(), is_demo: true };
  }
}

// ─── Demo fallback data ────────────────────────────────────
function getDemoWeatherRecords() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().split("T")[0],
      temperature_max: 32 + (i % 3) * 0.8,
      temperature_min: 23 + (i % 2) * 0.5,
      temperature_mean: 27.5,
      rainfall: i === 3 ? 8.2 : i === 5 ? 3.1 : 0,
      evapotranspiration: 4.2 + (i % 2) * 0.3,
      soil_moisture: 0.24 + (i % 3) * 0.02,
    };
  });
}

function getDemoGDD() {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (4 - i));
    return { date: d.toISOString().split("T")[0], value: 17 + i * 0.5 };
  });
}

function getDemoHydric() {
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (2 - i));
    return { date: d.toISOString().split("T")[0], status: "Normal", index: 0.65 };
  });
}

// ─── Main Route Handler ────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "23.2599");
  const lon = parseFloat(searchParams.get("lon") || "77.4126");
  const crop = searchParams.get("crop") || "soybean";

  // Validate crop is supported
  const cropKey = crop.toLowerCase().split(" ")[0]; // "Rice / Paddy" → "rice"
  const cropThresholds = CROP_THRESHOLDS[cropKey] ?? CROP_THRESHOLDS.soybean;
  const normalizedCrop = Object.keys(CROP_THRESHOLDS).find(k =>
    crop.toLowerCase().includes(k)
  ) ?? "soybean";

  // Fetch all data sources in parallel
  const [meteoblueResult, gddResult, hydricResult] = await Promise.all([
    fetchMeteoblue(lat, lon),
    fetchCEHubGDD(lat, lon),
    fetchCEHubHydric(lat, lon),
  ]);

  const { records, is_demo: isWeatherDemo } = meteoblueResult;
  const { data: gddData, is_demo: isGddDemo } = gddResult;
  const { data: hydricData, is_demo: isHydricDemo } = hydricResult;
  const isAnyDemo = isWeatherDemo || isGddDemo;

  // Use the latest day's data for stress calculations
  const latest = records[records.length - 1] ?? {
    temperature_max: 32,
    temperature_min: 23,
    temperature_mean: 27.5,
    rainfall: 0,
    evapotranspiration: 4.2,
    soil_moisture: 0.25,
  };

  const cumulRainfall = records.reduce((s, r) => s + (r.rainfall ?? 0), 0);
  const cumulET = records.reduce((s, r) => s + (r.evapotranspiration ?? 0), 0);
  const avgSoilMoisture = records.length > 0
    ? (records.reduce((s, r) => s + (r.soil_moisture ?? 0), 0) / records.length) * 100
    : 25;
  const avgTemp = latest.temperature_mean ?? 27.5;

  // Run agriculture engine
  const stressAssessment = assessFieldStress(
    normalizedCrop,
    latest.temperature_max,
    latest.temperature_min,
    cumulRainfall,
    cumulET,
    avgSoilMoisture,
    avgTemp,
    records,
    isAnyDemo
  );

  // Cumulative GDD from CE Hub if available
  const cehubCumulGDD = gddData.reduce((s, r) => s + r.value, 0);
  const engineCumulGDD = calcCumulativeGDD(records, normalizedCrop);

  return NextResponse.json({
    location: { lat, lon },
    crop: normalizedCrop,
    crop_label: cropThresholds.name,
    weather: {
      records,
      location: { lat, lon, domain: isWeatherDemo ? "DEMO" : meteoblueResult.source === "open-meteo" ? "OPEN-METEO" : "NEMSGLOBAL" },
      is_demo: isWeatherDemo,
      source: meteoblueResult.source || (isWeatherDemo ? "demo" : "meteoblue"),
    },
    latest_conditions: {
      temperature_max: latest.temperature_max,
      temperature_min: latest.temperature_min,
      temperature_mean: latest.temperature_mean,
      rainfall_7d_mm: Math.round(cumulRainfall * 10) / 10,
      soil_moisture_pct: Math.round(avgSoilMoisture * 10) / 10,
    },
    stress_assessment: stressAssessment,
    cumulative_gdd_7d: {
      engine_calculated: Math.round(engineCumulGDD * 10) / 10,
      cehub_reported: Math.round(cehubCumulGDD * 10) / 10,
      source: isGddDemo ? "demo" : "cehub",
    },
    hydric_stress_latest: hydricData.slice(-3),
    cehub_gdd_latest: gddData.slice(-3),
    is_demo: isWeatherDemo && isGddDemo && isHydricDemo,
    data_sources: {
      weather: meteoblueResult.source || "demo",
      cehub_gdd: isGddDemo ? "demo" : "live",
      cehub_hydric: isHydricDemo ? "demo" : "live",
    },
  });
}
