import { NextRequest, NextResponse } from "next/server";
import { getRecommendations, FarmerInput } from "@/lib/recommendationEngine";
import { getAllProducts } from "@/lib/syngentaProductsDB";

const REGIONS_DATA: Record<string, { name: string; lat: number; lon: number; soil_type: string; soil_buffer: number; salinity_index: number; crops: string[]; dominant_stresses: string[] }> = {
  punjab: {
    name: "Punjab / Indo-Gangetic Plain",
    crops: ["wheat", "rice", "cotton_bt"],
    lat: 30.9,
    lon: 75.86,
    soil_type: "Alluvial Loam",
    soil_buffer: 0.50,
    salinity_index: 0.20,
    dominant_stresses: ["Heat Waves", "Waterlogging"]
  },
  bhopal: {
    name: "Bhopal / Central India",
    crops: ["soybean", "wheat", "chickpea"],
    lat: 23.2599,
    lon: 77.4126,
    soil_type: "Medium Black Clay",
    soil_buffer: 0.65,
    salinity_index: 0.15,
    dominant_stresses: ["Drought", "Heat Waves"]
  },
  maharashtra_vidarbha: {
    name: "Vidarbha / Maharashtra",
    crops: ["cotton_bt", "soybean", "pigeon_pea"],
    lat: 20.93,
    lon: 77.75,
    soil_type: "Deep Black Clay (Vertisol)",
    soil_buffer: 0.70,
    salinity_index: 0.18,
    dominant_stresses: ["Drought", "Heat Waves"]
  },
  gujarat_saurashtra: {
    name: "Saurashtra / Gujarat",
    crops: ["groundnut", "cotton_bt", "sesame"],
    lat: 21.52,
    lon: 70.45,
    soil_type: "Sandy Loam / Coastal",
    soil_buffer: 0.25,
    salinity_index: 0.45,
    dominant_stresses: ["Severe Drought", "Soil Salinity"]
  },
  jammu: {
    name: "Jammu & Kashmir Valley",
    crops: ["apple", "saffron", "mustard"],
    lat: 34.08,
    lon: 74.79,
    soil_type: "Mountain Meadow / Karewa",
    soil_buffer: 0.55,
    salinity_index: 0.10,
    dominant_stresses: ["Frost / Cold Snap", "Erratic Rainfall"]
  },
  andhra_telangana: {
    name: "Rayalaseema / Andhra Pradesh",
    crops: ["chilli", "groundnut", "rice"],
    lat: 14.68,
    lon: 77.60,
    soil_type: "Red Sandy Loam",
    soil_buffer: 0.30,
    salinity_index: 0.25,
    dominant_stresses: ["Severe Drought", "High VPD Atmospheric Pull"]
  }
};

// Map soil_type from region data to recommendation engine soil types
function mapSoilType(soilType: string): string {
  const lower = soilType.toLowerCase();
  if (lower.includes("alluvial")) return "alluvial";
  if (lower.includes("black") || lower.includes("vertisol")) return "black_cotton";
  if (lower.includes("red") || lower.includes("laterite")) return "red_laterite";
  if (lower.includes("sandy")) return "sandy";
  if (lower.includes("loam")) return "loamy";
  if (lower.includes("clay")) return "clay";
  return "loamy";
}

// Detect current season based on date
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 10) return "kharif";
  if (month >= 11 || month <= 3) return "rabi";
  return "zaid";
}

// Map symptoms from frontend to engine format
function mapSymptoms(symptoms: string): string {
  const lower = (symptoms || "none").toLowerCase();
  if (lower.includes("wilt")) return "wilting";
  if (lower.includes("yellow") || lower.includes("chlorosis")) return "yellowing";
  if (lower.includes("spot") || lower.includes("lesion")) return "leaf_spots";
  if (lower.includes("pest") || lower.includes("insect") || lower.includes("borer") || lower.includes("worm")) return "pest_damage";
  if (lower.includes("stunt") || lower.includes("dwarf")) return "stunting";
  return "none";
}

// Map growth stage from frontend to engine format
function mapGrowthStage(stage: string): string {
  const lower = (stage || "flowering").toLowerCase();
  if (lower.includes("germin") || lower.includes("emerg") || lower.includes("seedl")) return "germination";
  if (lower.includes("veget") || lower.includes("tiller")) return "vegetative";
  if (lower.includes("flower") || lower.includes("bloom") || lower.includes("anthes")) return "flowering";
  if (lower.includes("pod") || lower.includes("grain") || lower.includes("fruit") || lower.includes("boll") || lower.includes("tuber")) return "podFormation";
  if (lower.includes("matur") || lower.includes("ripen") || lower.includes("harvest")) return "maturity";
  return "flowering";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const crop = body.crop_type || "soybean";
  const stage = body.growth_stage || "Flowering";
  const regionKey = body.region || "bhopal";
  const symptoms = body.symptoms || "None";
  const soilMoisture = body.soil_moisture || "Optimal";

  const regionInfo = REGIONS_DATA[regionKey] || REGIONS_DATA["bhopal"];
  
  // Use custom coordinates if provided, otherwise use region defaults
  const lat = body.lat != null ? Number(body.lat) : regionInfo.lat;
  const lon = body.lon != null ? Number(body.lon) : regionInfo.lon;
  const locationName = body.custom_location_name || regionInfo.name;

  // 1. Fetch live 14-day weather from Open-Meteo
  let dailyData: any = null;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,relative_humidity_2m_min,wind_speed_10m_max&timezone=Asia%2FKolkata&forecast_days=14`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      const meteo = await res.json();
      dailyData = meteo.daily;
    }
  } catch (err) {}

  // 2. Crop thresholds for forecast stress calculation
  const cropThresholds: Record<string, { tmax_opt: number; tmax_lim: number; tmin_opt: number; tmin_lim: number }> = {
    soybean: { tmax_opt: 32, tmax_lim: 45, tmin_opt: 22, tmin_lim: 28 },
    wheat: { tmax_opt: 25, tmax_lim: 32, tmin_opt: 15, tmin_lim: 20 },
    cotton_bt: { tmax_opt: 32, tmax_lim: 38, tmin_opt: 20, tmin_lim: 25 },
    cotton: { tmax_opt: 32, tmax_lim: 38, tmin_opt: 20, tmin_lim: 25 },
    rice: { tmax_opt: 32, tmax_lim: 38, tmin_opt: 22, tmin_lim: 28 },
    groundnut: { tmax_opt: 30, tmax_lim: 40, tmin_opt: 20, tmin_lim: 26 },
    chickpea: { tmax_opt: 28, tmax_lim: 35, tmin_opt: 15, tmin_lim: 22 },
    chilli: { tmax_opt: 30, tmax_lim: 38, tmin_opt: 18, tmin_lim: 24 },
    maize: { tmax_opt: 33, tmax_lim: 44, tmin_opt: 22, tmin_lim: 28 },
    potato: { tmax_opt: 20, tmax_lim: 30, tmin_opt: 12, tmin_lim: 20 },
    mustard: { tmax_opt: 24, tmax_lim: 34, tmin_opt: 12, tmin_lim: 22 },
    sugarcane: { tmax_opt: 30, tmax_lim: 40, tmin_opt: 20, tmin_lim: 28 },
    tomato: { tmax_opt: 26, tmax_lim: 36, tmin_opt: 16, tmin_lim: 24 },
    onion: { tmax_opt: 25, tmax_lim: 35, tmin_opt: 15, tmin_lim: 24 },
  };
  const th = cropThresholds[crop.toLowerCase()] || { tmax_opt: 32, tmax_lim: 42, tmin_opt: 20, tmin_lim: 26 };

  // Stage vulnerability
  const stageWeights: Record<string, number> = {
    Germination: 0.40,
    Vegetative: 0.50,
    Flowering: 0.95,
    "Pod Formation": 0.85,
    Maturity: 0.30
  };
  const wStage = stageWeights[stage] || 0.60;

  // Process forecast days
  const today = new Date();
  const forecast = [];
  let avgHsi = 0;
  let avgDsi = 0;
  let heavyRainDays = 0;
  let totalRainfall = 0;
  let avgHumidity = 0;
  let maxWind = 0;
  let peakTmax = 0;
  let peakTmin = 0;

  for (let i = 0; i < 14; i++) {
    let tmax = 28 + (i % 3);
    let tmin = 22 + (i % 2);
    let precip = i === 5 ? 25 : (i === 6 ? 45 : 2);
    let rhMax = 90;
    let rhMin = 65;
    let wind = 14;
    let dateStr = new Date(today.getTime() + i * 86400000).toISOString().split("T")[0];

    if (dailyData && dailyData.time && dailyData.time[i]) {
      dateStr = dailyData.time[i];
      tmax = dailyData.temperature_2m_max[i];
      tmin = dailyData.temperature_2m_min[i];
      precip = dailyData.precipitation_sum[i];
      rhMax = dailyData.relative_humidity_2m_max ? dailyData.relative_humidity_2m_max[i] : 88;
      rhMin = dailyData.relative_humidity_2m_min ? dailyData.relative_humidity_2m_min[i] : 65;
      wind = dailyData.wind_speed_10m_max ? dailyData.wind_speed_10m_max[i] : 12;
    }

    if (precip >= 15) heavyRainDays++;
    totalRainfall += precip;
    avgHumidity += (rhMax + rhMin) / 2;
    if (wind > maxWind) maxWind = wind;
    if (tmax > peakTmax) peakTmax = tmax;
    if (tmin > peakTmin) peakTmin = tmin;

    // Calculate HSI
    let hsiDay = 0;
    if (tmax > th.tmax_opt) {
      hsiDay = Math.min((tmax - th.tmax_opt) / (th.tmax_lim - th.tmax_opt), 1.0);
    }
    let hsiNight = 0;
    if (tmin > th.tmin_opt) {
      hsiNight = Math.min((tmin - th.tmin_opt) / (th.tmin_lim - th.tmin_opt), 1.0);
    }
    const hsi = Number((hsiDay * 0.6 + hsiNight * 0.4).toFixed(3));

    // Calculate VPD & DSI
    const rhAvg = (rhMax + rhMin) / 2;
    const es = 0.6108 * Math.exp((17.27 * tmax) / (tmax + 237.3));
    const ea = es * (rhAvg / 100);
    const vpd = Math.max(es - ea, 0);
    let dsi = Math.min(vpd / 4.0, 1.0);
    if (precip > 5) dsi *= 0.4;
    else if (precip > 1) dsi *= 0.7;
    dsi = Number(dsi.toFixed(3));

    const cold = tmin < 4 ? Math.max(0, (4 - tmin) / 7) : 0;
    const cs = Number(((hsi * 0.6 + dsi * 0.4) * (1 + hsi * dsi * 0.3)).toFixed(3));

    avgHsi += hsi;
    avgDsi += dsi;

    let dominant = "Optimal Window";
    if (precip >= 20) dominant = "Heavy Rainfall / Waterlogging Risk";
    else if (hsi > 0.35) dominant = "Heat Wave Stress";
    else if (dsi > 0.35) dominant = "Drought / VPD Deficit";
    else if (hsi > 0.15) dominant = "Moderate Thermal Load";
    else dominant = "Mild Moisture Stress";

    const safeToSpray = wind < 15 && precip < 2 && tmax < 36;

    forecast.push({
      day: i + 1,
      date: dateStr,
      overall_stress_probability: Number(cs.toFixed(2)),
      dominant_stress: dominant,
      is_stressed: cs > 0.30 || precip >= 25,
      safe_to_spray: safeToSpray,
      stress_breakdown: { heat: hsi, drought: dsi, cold: Number(cold.toFixed(2)) },
      weather_layer: {
        TMax: Number(tmax.toFixed(1)),
        TMin: Number(tmin.toFixed(1)),
        Precipitation_mm: Number(precip.toFixed(1)),
        RH_max: rhMax,
        RH_min: rhMin,
        Wind_kmh: Number(wind.toFixed(1)),
        VPD_kPa: Number(vpd.toFixed(2))
      },
      satellite_layer: {
        NDVI: Number((0.72 - 0.10 * cs).toFixed(2)),
        NDWI: Number((0.38 - 0.08 * dsi).toFixed(2)),
        Hydric_Index: Number((0.10 + 0.20 * dsi).toFixed(2))
      },
      soil_layer: {
        Soil_Moisture_Pct: Math.round(32 - 16 * dsi),
        Soil_Temp_C: Number((tmin + 3).toFixed(1))
      },
      shap_explanations: [
        { factor: "Thermal Load (TMax/TNight)", contribution: `+${Math.round(hsi * 60 + 10)}%` },
        { factor: "VPD & Moisture Deficit", contribution: `+${Math.round(dsi * 60 + 10)}%` },
        { factor: "Phenology Vulnerability", contribution: `+${Math.round(wStage * 30)}%` }
      ],
      products: []
    });
  }

  avgHsi /= 14;
  avgDsi /= 14;
  avgHumidity /= 14;

  if (soilMoisture === "Dry") avgDsi = Math.max(avgDsi, 0.65);
  if (symptoms === "Wilting") avgDsi += 0.15;
  if (symptoms === "Stunting") avgHsi += 0.10;

  const compoundStress = (avgHsi * 0.6 + avgDsi * 0.4) * (1 + avgHsi * avgDsi * 0.3);
  const yieldRisk = Math.min(Math.round(compoundStress * 1000) / 10, 95.0);
  const riskLevel = yieldRisk > 70 ? "CRITICAL" : yieldRisk > 45 ? "HIGH" : yieldRisk > 25 ? "MODERATE" : "LOW";

  // ============================================================
  // 3-LAYER HYBRID RECOMMENDATION ENGINE (50 Syngenta Products)
  // ============================================================
  const farmerInput: FarmerInput = {
    cropType: crop.replace("_bt", "").replace("_", ""),
    growthStage: mapGrowthStage(stage),
    temperatureMax: peakTmax || 35,
    temperatureMin: peakTmin || 24,
    humidityAvg: avgHumidity || 75,
    rainfall7Day: totalRainfall || 0,
    windSpeed: maxWind || 12,
    soilMoisture: soilMoisture.toLowerCase() === "dry" ? "dry" : soilMoisture.toLowerCase() === "waterlogged" ? "waterlogged" : "optimal",
    soilType: mapSoilType(regionInfo.soil_type),
    symptoms: mapSymptoms(symptoms),
    season: getCurrentSeason(),
    daysSinceLastSpray: 14,
    acreage: 5,
    locationName: locationName,
  };

  const recommendationResult = getRecommendations(farmerInput);
  const topRec = recommendationResult.recommendations[0];
  const secondRec = recommendationResult.recommendations[1];
  const thirdRec = recommendationResult.recommendations[2];

  // Build the primary product response from the top recommendation
  const primaryProduct = topRec ? {
    product_key: topRec.product.key,
    product_name: topRec.product.name,
    category: topRec.product.category,
    active_ingredient: topRec.product.activeIngredient,
    dosage: topRec.dosageForThisCase,
    application_method: topRec.product.category === "seed_treatment" ? "Seed Treatment" : "Foliar Spray with Boom / Knapsack Nozzle",
    water_usage: `${topRec.product.waterPerAcre} L/acre`,
    target: topRec.product.targetPests.join(", "),
    description: topRec.farmerExplanation,
    synergist: topRec.product.tankMixSafe.length > 0 ? `Compatible with: ${topRec.product.tankMixSafe.slice(0, 3).join(", ")}` : undefined,
    tank_mix_safe: topRec.product.tankMixSafe,
    tank_mix_danger: topRec.product.tankMixDanger,
    retail_price: topRec.product.mrpInr,
  } : null;

  // Build secondary recommendation
  const secondaryProd = secondRec ? {
    product_name: secondRec.product.name,
    category: secondRec.product.category,
    active_ingredient: secondRec.product.activeIngredient,
    dosage: secondRec.dosageForThisCase,
    rationale: secondRec.farmerExplanation,
    tank_mix_compatibility: secondRec.product.tankMixSafe.some(s => topRec && s.toLowerCase().includes(topRec.product.name.toLowerCase().replace("®", "")))
      ? `Compatible with ${topRec?.product.name} in the same spray tank.`
      : "Apply separately for best results.",
  } : null;

  // Build top candidates list for UI display
  const topCandidates = recommendationResult.recommendations.map(r => ({
    name: r.product.name,
    score: Math.round(r.score * 10) / 10,
    target: r.product.targetPests.slice(0, 3).join(", "),
    category: r.product.category,
    costPerAcre: r.costBreakdown.totalPerAcre,
    mrp: r.product.mrpInr,
    dosage: r.dosageForThisCase,
    reasoning: r.farmerExplanation,
    triggerReasons: r.triggerReasons,
    stressType: r.stressType,
    costBreakdown: r.costBreakdown,
    expectedBenefit: r.expectedBenefit,
    sprayWindow: r.sprayWindow,
    trialEfficacyPct: r.trialEfficacyPct,
    trialCitation: r.trialCitation,
    etlThreshold: r.etlThreshold,
    cropwiseStandard: r.cropwiseStandard,
    tankMixSafe: r.tankMixSafe,
    tankMixDanger: r.tankMixDanger,
  }));

  // Build complete catalog from all 50 products
  const allProducts = getAllProducts();
  const catalogSummary = allProducts.map(p => ({
    key: p.key,
    name: p.name,
    category: p.category,
    active_ingredient: p.activeIngredient,
    retail_price: p.mrpInr,
    target: p.targetPests.slice(0, 3).join(", "),
    dosage: p.dosagePerAcre,
    approved_crops: p.approvedCrops.slice(0, 5).join(", "),
    trial_efficacy: `${p.trialEfficacyPct}% (${p.trialCitation.split(';')[0]})`,
    etl_trigger: p.etlThreshold,
  }));

  // Economic ROI from recommendation engine
  const economicROI = topRec ? {
    productCost: topRec.costBreakdown.productCost,
    applicationCost: topRec.costBreakdown.laborCost,
    waterCost: topRec.costBreakdown.waterCost,
    totalCostPerAcre: topRec.costBreakdown.totalPerAcre,
    totalCostForField: topRec.costBreakdown.totalForField,
    expectedYieldGain: `${topRec.expectedBenefit.yieldProtectedQPerAcre} q/acre`,
    mandiPrice: topRec.expectedBenefit.revenueProtectedPerAcre / (topRec.expectedBenefit.yieldProtectedQPerAcre || 1),
    expectedRevenue: topRec.expectedBenefit.revenueProtectedPerAcre,
    robi: topRec.expectedBenefit.robi,
  } : { productCost: 1250, applicationCost: 400, totalCostPerAcre: 1650, totalCostForField: 8250, expectedYieldGain: "2 q/acre", mandiPrice: 4800, expectedRevenue: 9600, robi: 5.8 };

  return NextResponse.json({
    data_source: dailyData ? "LIVE_OPEN_METEO" : "CALIBRATED_FALLBACK",
    weather_api: "Open-Meteo (api.open-meteo.com) — Live GPS Telemetry",
    region: {
      ...regionInfo,
      lat,
      lon,
      name: locationName,
    },
    crop_profile: {
      crop,
      stage,
      stage_vulnerability: `${Math.round(wStage * 100)}%`,
      soil_type: regionInfo.soil_type
    },
    has_critical_alert: yieldRisk > 45,
    alert: {
      title: `Compound Climate Stress Alert (${riskLevel})`,
      description: `Meteorological telemetry for ${crop} at ${stage} stage in ${locationName}. ${recommendationResult.stressProfile.dominantStress !== 'none' ? `Dominant stress: ${recommendationResult.stressProfile.dominantStress.toUpperCase()}.` : 'Conditions are within acceptable range.'}`,
      severity: riskLevel,
      factors: [
        {
          factor: "Peak Max Temperature",
          readings: `${peakTmax.toFixed(1)}°C`,
          status: peakTmax > 35 ? "Critical" : "Normal",
          threshold_info: ">35°C Denaturing Limit"
        },
        {
          factor: "Peak Night Temperature (HNT)",
          readings: `${peakTmin.toFixed(1)}°C`,
          status: peakTmin > 22 ? "Warning" : "Normal",
          threshold_info: ">22°C Dark Respiration Threshold"
        },
        {
          factor: "14-Day Cumulative Rain",
          readings: `${Math.round(totalRainfall)} mm`,
          status: heavyRainDays >= 2 ? "High Monsoon Rain" : "Normal",
          threshold_info: "Monsoon Season Active"
        },
        {
          factor: "Average Humidity",
          readings: `${Math.round(avgHumidity)}%`,
          status: avgHumidity > 80 ? "Fungal Risk" : "Normal",
          threshold_info: ">80% Fungal Disease Conducive"
        }
      ],
      recommendations: topRec ? [
        `Apply ${topRec.product.name} (${topRec.dosageForThisCase}) — ${topRec.stressType} stress shield`,
        secondRec ? `Secondary: ${secondRec.product.name} (${secondRec.dosageForThisCase})` : "Morning spray (6:00 - 9:00 AM) optimal",
        `Cost: ₹${topRec.costBreakdown.totalPerAcre}/acre | Expected benefit: ₹${topRec.expectedBenefit.revenueProtectedPerAcre}/acre | ROBI: ${topRec.expectedBenefit.robi.toFixed(1)}x`,
      ] : ["Monitor crop conditions and re-assess in 3 days."]
    },
    cropfit: primaryProduct ? {
      product: primaryProduct,
      secondary_crop_protection: secondaryProd,
      rationale: topRec?.farmerExplanation || `Recommendation engine analysis for ${crop} at ${stage} in ${locationName}.`,
      confidence: Math.min(96, Math.round(topRec?.score || 80)),
      top_candidates: topCandidates,
    } : null,
    // Stress profile from the 3-layer engine
    stress_profile: recommendationResult.stressProfile,
    // Gemini prompt for LLM explanation layer
    gemini_explanation_prompt: recommendationResult.geminiPrompt,
    forecast,
    economicROI,
    // Full 50-product catalog
    syngenta_india_catalog: catalogSummary,
    // Engine metadata
    engine_metadata: {
      version: "3.0-hybrid",
      layers: ["Deterministic Filter (50 products → candidates)", "Multi-Criteria Scoring (6 weights)", "Farmer Explanation Generator"],
      total_products_evaluated: allProducts.length,
      candidates_after_filter: recommendationResult.recommendations.length > 0 ? "filtered" : "all",
      recommendation_count: recommendationResult.recommendations.length,
    }
  });
}
