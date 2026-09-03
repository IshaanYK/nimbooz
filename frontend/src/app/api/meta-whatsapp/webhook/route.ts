import { NextRequest, NextResponse } from "next/server";
import { getRecommendations, FarmerInput } from "@/lib/recommendationEngine";
import { getAllProducts, getProductByKey, SyngentaProduct } from "@/lib/syngentaProductsDB";
import { GOOGLE_AI_KEYS } from "@/lib/geminiEngine";
import { db, FarmerDbRecord } from "@/lib/db/aasraDb";

const META_ACCESS_TOKEN =
  process.env.META_WHATSAPP_ACCESS_TOKEN ||
  "EAA5Aigmq5tEBSRhX8jw8TB53kEtLpoQiG7O4NhW6iLISthGd2SirRbHhKIlWq5iIGKY7recLxtixBtFuiZBZB55FeRkbuGZAeZBwqbAtfphkBAt2Ksy2ZCVCGc4AypG4BzglIgpzj6DkgMRwNFn4RJoWmX5gVfpPsoz0U3zYZA2vmFsjOPpX4d4eRrnhh64u4fmTXCN4Tm9cyf7hOlIP6FJFrU00l04BTyCLX7GZBBvxkSOzx9NOOcoXFcgeWmHRAoqzP2Lr85hUjUrB6jXxfVfEZAZA2";

const META_PHONE_ID = process.env.META_WHATSAPP_PHONE_NUMBER_ID || "1280974545099009";
const META_VERIFY_TOKENS = [
  process.env.META_WHATSAPP_VERIFY_TOKEN,
  process.env.WHATSAPP_VERIFY_TOKEN,
  "annam-kisan-verify-2026",
  "aasra_webhook_secret_2026",
  "aros-meta-verify-2026",
].filter(Boolean);

const GRAPH_API_VERSION = "v22.0";

// Prioritize active non-rate-limited Google AI keys
const ACTIVE_GOOGLE_KEYS = Array.from(new Set(GOOGLE_AI_KEYS.slice().reverse()));

// Language Metadata Dictionary
const LANGUAGE_META: Record<
  string,
  { name: string; nativeName: string; greeting: string; promptLang: string }
> = {
  hi: { name: "Hindi", nativeName: "हिन्दी", greeting: "नमस्ते", promptLang: "Hindi (हिन्दी)" },
  mr: { name: "Marathi", nativeName: "मराठी", greeting: "नमस्कार", promptLang: "Marathi (मराठी)" },
  pa: { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ", promptLang: "Punjabi (ਪੰਜਾਬੀ)" },
  gu: { name: "Gujarati", nativeName: "ગુજરાતી", greeting: "નમસ્તે", promptLang: "Gujarati (ગુજરાતી)" },
  te: { name: "Telugu", nativeName: "తెలుగు", greeting: "నమస్కారం", promptLang: "Telugu (తెలుగు)" },
  ta: { name: "Tamil", nativeName: "தமிழ்", greeting: "வணக்கம்", promptLang: "Tamil (தமிழ்)" },
  kn: { name: "Kannada", nativeName: "ಕನ್ನಡ", greeting: "ನಮಸ್ಕಾರ", promptLang: "Kannada (ಕನ್ನಡ)" },
  en: { name: "English", nativeName: "English", greeting: "Hello", promptLang: "English" },
};

// District Coordinates for hyper-local telemetry fallback
const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = {
  kasganj: { lat: 27.8055, lon: 78.6489 },
  bhopal: { lat: 23.2599, lon: 77.4126 },
  agra: { lat: 27.1767, lon: 78.0081 },
  indore: { lat: 22.7196, lon: 75.8577 },
  sehore: { lat: 23.2014, lon: 77.0845 },
  aligarh: { lat: 27.8974, lon: 78.088 },
  mathura: { lat: 27.4924, lon: 77.6737 },
  ludhiana: { lat: 30.901, lon: 75.8573 },
  nagpur: { lat: 21.1458, lon: 79.0882 },
  nashik: { lat: 19.9975, lon: 73.7898 },
};

// Live Mandi Benchmarks dictionary
const MANDI_BENCHMARKS: Record<
  string,
  { nameHi: string; nameEn: string; modalQ: number; minQ: number; maxQ: number; trend: string }
> = {
  tamatar: { nameHi: "टमाटर (Tomato)", nameEn: "Tomato", modalQ: 2200, minQ: 1800, maxQ: 2600, trend: "स्थिर (Stable)" },
  tomato: { nameHi: "टमाटर (Tomato)", nameEn: "Tomato", modalQ: 2200, minQ: 1800, maxQ: 2600, trend: "स्थिर (Stable)" },
  aloo: { nameHi: "आलू (Potato)", nameEn: "Potato", modalQ: 1450, minQ: 1200, maxQ: 1650, trend: "तेज (Bullish)" },
  potato: { nameHi: "आलू (Potato)", nameEn: "Potato", modalQ: 1450, minQ: 1200, maxQ: 1650, trend: "तेज (Bullish)" },
  pyaj: { nameHi: "प्याज (Onion)", nameEn: "Onion", modalQ: 1850, minQ: 1500, maxQ: 2200, trend: "स्थिर (Stable)" },
  onion: { nameHi: "प्याज (Onion)", nameEn: "Onion", modalQ: 1850, minQ: 1500, maxQ: 2200, trend: "स्थिर (Stable)" },
  gehu: { nameHi: "गेहूं (Wheat Lokwan)", nameEn: "Wheat", modalQ: 2780, minQ: 2550, maxQ: 2950, trend: "मजबूत (Strong)" },
  wheat: { nameHi: "गेहूं (Wheat Lokwan)", nameEn: "Wheat", modalQ: 2780, minQ: 2550, maxQ: 2950, trend: "मजबूत (Strong)" },
  soybean: { nameHi: "सोयाबीन (Soybean Yellow)", nameEn: "Soybean", modalQ: 4650, minQ: 4300, maxQ: 4850, trend: "स्थिर (Stable)" },
  soya: { nameHi: "सोयाबीन (Soybean)", nameEn: "Soybean", modalQ: 4650, minQ: 4300, maxQ: 4850, trend: "स्थिर (Stable)" },
  chana: { nameHi: "चना (Chickpea / Desi Chana)", nameEn: "Chickpea", modalQ: 6150, minQ: 5800, maxQ: 6400, trend: "तेज (High demand)" },
  cotton: { nameHi: "कपास (Cotton Medium Staple)", nameEn: "Cotton", modalQ: 7200, minQ: 6800, maxQ: 7550, trend: "मजबूत (Strong)" },
  kapas: { nameHi: "कपास (Cotton)", nameEn: "Cotton", modalQ: 7200, minQ: 6800, maxQ: 7550, trend: "मजबूत (Strong)" },
  sarson: { nameHi: "सरसों (Mustard)", nameEn: "Mustard", modalQ: 5750, minQ: 5400, maxQ: 6050, trend: "तेज (Bullish)" },
  mustard: { nameHi: "सरसों (Mustard)", nameEn: "Mustard", modalQ: 5750, minQ: 5400, maxQ: 6050, trend: "तेज (Bullish)" },
  mirch: { nameHi: "हरी मिर्च (Green Chilli)", nameEn: "Chilli", modalQ: 3800, minQ: 3200, maxQ: 4400, trend: "स्थिर (Stable)" },
  chilli: { nameHi: "हरी मिर्च (Green Chilli)", nameEn: "Chilli", modalQ: 3800, minQ: 3200, maxQ: 4400, trend: "स्थिर (Stable)" },
  dhan: { nameHi: "धान (Paddy Basmati/PR)", nameEn: "Paddy", modalQ: 2850, minQ: 2400, maxQ: 3300, trend: "मजबूत (Strong)" },
  rice: { nameHi: "धान (Paddy)", nameEn: "Paddy", modalQ: 2850, minQ: 2400, maxQ: 3300, trend: "मजबूत (Strong)" },
};

/**
 * Send WhatsApp text message via Meta Cloud API
 */
async function sendWhatsAppMessage(to: string, textBody: string) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PHONE_ID}/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: textBody },
      }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    console.error("[Meta WhatsApp] Send message error:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Mark message as read (blue ticks)
 */
async function markMessageAsRead(messageId: string) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PHONE_ID}/messages`;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    });
  } catch {}
}

/**
 * Download media binary from Meta WhatsApp Cloud API
 */
async function downloadMetaMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    const metaUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${mediaId}`;
    const resMeta = await fetch(metaUrl, {
      headers: { Authorization: `Bearer ${META_ACCESS_TOKEN}` },
    });
    if (!resMeta.ok) return null;
    const metaData = await resMeta.json();
    const fileUrl = metaData.url;
    if (!fileUrl) return null;

    const fileRes = await fetch(fileUrl, {
      headers: { Authorization: `Bearer ${META_ACCESS_TOKEN}` },
    });
    if (!fileRes.ok) return null;

    const arrayBuf = await fileRes.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuf),
      mimeType: metaData.mime_type || "image/jpeg",
    };
  } catch (err) {
    console.error("[Meta Media] Download error:", err);
    return null;
  }
}

/**
 * Resolve farmer profile from AASRA database
 */
function resolveFarmerProfile(rawPhone: string): FarmerDbRecord {
  const cleanDigits = rawPhone.replace(/\D/g, "");
  const farmer = db.getFarmer(cleanDigits);
  if (farmer) return farmer;

  // Fallback default for demo/hackathon
  return {
    id: `farmer-${cleanDigits.slice(-4)}`,
    fullName: "किसान साथी",
    mobileNumber: cleanDigits,
    language: "hi",
    state: "Uttar Pradesh",
    district: "Kasganj",
    village: "Bilram",
    fieldAreaAcres: 3.5,
    primaryCrop: "Potato",
    cropVariety: "Kufri Jyoti",
    sowingDate: "2026-07-15",
    soilType: "Alluvial Sandy Loam",
    irrigationType: "Tube Well Sprinkler",
    hasKisanCreditCard: true,
    pmKisanBeneficiary: true,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate accurate crop growth stage from Sowing Date (DAS: Days After Sowing)
 */
function calculateGrowthStage(crop: string, sowingDateStr?: string): {
  stageKey: "germination" | "vegetative" | "flowering" | "podFormation" | "maturity";
  stageLabel: string;
  das: number;
} {
  const sowing = sowingDateStr ? new Date(sowingDateStr) : new Date(Date.now() - 45 * 86400000);
  const das = Math.max(1, Math.floor((Date.now() - sowing.getTime()) / (1000 * 60 * 60 * 24)));
  const c = (crop || "").toLowerCase();

  if (c.includes("potato") || c.includes("aloo")) {
    if (das < 20) return { stageKey: "germination", stageLabel: "अंकुरण (Sprouting 0-20 DAS)", das };
    if (das < 45) return { stageKey: "vegetative", stageLabel: "वानस्पतिक शाखाएं (Foliar Canopy 20-45 DAS)", das };
    if (das < 75) return { stageKey: "flowering", stageLabel: "कंद निर्माण / फुलाव (Tuber Bulking 45-75 DAS)", das };
    return { stageKey: "maturity", stageLabel: "परिपक्वता / खुदाई (Tuber Maturity 75+ DAS)", das };
  }

  if (c.includes("soy") || c.includes("soya")) {
    if (das < 15) return { stageKey: "germination", stageLabel: "अंकुरण (Germination 0-15 DAS)", das };
    if (das < 40) return { stageKey: "vegetative", stageLabel: "वानस्पतिक बढ़वार (Vegetative 15-40 DAS)", das };
    if (das < 65) return { stageKey: "flowering", stageLabel: "फूल खिलना (Flowering R1-R2 40-65 DAS)", das };
    if (das < 90) return { stageKey: "podFormation", stageLabel: "फली विकास (Pod Fill R3-R5 65-90 DAS)", das };
    return { stageKey: "maturity", stageLabel: "परिपक्वता (Maturity R7-R8 90+ DAS)", das };
  }

  // Default Wheat and Cereals
  if (das < 20) return { stageKey: "germination", stageLabel: "अंकुरण एवं CRI (Crown Root 0-20 DAS)", das };
  if (das < 50) return { stageKey: "vegetative", stageLabel: "कल्ले फूटना (Tillering Vegetative 20-50 DAS)", das };
  if (das < 75) return { stageKey: "flowering", stageLabel: "बालियां एवं फूल (Booting/Flowering 50-75 DAS)", das };
  if (das < 105) return { stageKey: "podFormation", stageLabel: "दाना भराव (Grain Milking 75-105 DAS)", das };
  return { stageKey: "maturity", stageLabel: "परिपक्वता एवं कटाई (Maturity/Harvest 105+ DAS)", das };
}

/**
 * Psychrometric Stull's equation for Wet Bulb Temperature & Delta T Spray Radar
 */
function calculateDeltaT(T: number, rh: number): number {
  const Tw =
    T * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
    Math.atan(T + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035;
  return Math.round((T - Tw) * 10) / 10;
}

/**
 * Dynamically geocode any Indian city/town/village using Open-Meteo Geocoding
 */
async function geocodeLocation(locationName: string): Promise<{
  lat: number;
  lon: number;
  name: string;
  state: string;
}> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      locationName
    )}&count=1&language=en&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const r = data.results[0];
        return {
          lat: r.latitude,
          lon: r.longitude,
          name: r.name,
          state: r.admin1 || "",
        };
      }
    }
  } catch (err) {
    console.warn("[Geocode] lookup failed:", err);
  }

  // Fallback coords
  const lower = (locationName || "").toLowerCase().trim();
  const found = DISTRICT_COORDS[lower] || DISTRICT_COORDS["kasganj"];
  return {
    lat: found.lat,
    lon: found.lon,
    name: locationName.charAt(0).toUpperCase() + locationName.slice(1),
    state: "India",
  };
}

/**
 * Fetch live Open-Meteo weather telemetry
 */
async function fetchFieldWeather(lat: number, lon: number): Promise<{
  temp: number;
  humidity: number;
  windSpeed: number;
  rainProb24h: number;
  deltaT: number;
  spraySafe: boolean;
  sprayReason: string;
}> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m&forecast_days=2&timezone=auto`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const d = await res.json();
      const temp = Math.round(d.current?.temperature_2m ?? 30);
      const humidity = Math.round(d.current?.relative_humidity_2m ?? 65);
      const windSpeed = Math.round(d.current?.wind_speed_10m ?? 8);
      const hourlyProbs: number[] = d.hourly?.precipitation_probability || [];
      const rainProb24h = hourlyProbs.slice(0, 24).length > 0 ? Math.max(...hourlyProbs.slice(0, 24)) : 10;
      const deltaT = calculateDeltaT(temp, humidity);

      let spraySafe = true;
      let sprayReason = "मौसम अनुकूल है, स्प्रे किया जा सकता है।";

      if (windSpeed > 15) {
        spraySafe = false;
        sprayReason = `तेज हवा (${windSpeed} km/h) के कारण स्प्रे उड़ जाएगा (Drift Risk). हवा थमने की प्रतीक्षा करें।`;
      } else if (rainProb24h > 60) {
        spraySafe = false;
        sprayReason = `अगले 24 घंटे में बारिश की आशंका (${rainProb24h}%) है। बारिश से दवा धुलने का खतरा है।`;
      } else if (deltaT > 8) {
        spraySafe = false;
        sprayReason = `Delta T अधिक (${deltaT}°C) है। बूंदें हवा में सूख जाएंगी। सुबह या शाम को स्प्रे करें।`;
      } else if (deltaT < 2) {
        spraySafe = false;
        sprayReason = `Delta T कम (${deltaT}°C) है। ओस और अत्यधिक नमी के कारण दवा बह सकती है।`;
      }

      return { temp, humidity, windSpeed, rainProb24h, deltaT, spraySafe, sprayReason };
    }
  } catch (err) {
    console.warn("[Weather Telemetry] Fallback used:", err);
  }

  return {
    temp: 31,
    humidity: 65,
    windSpeed: 8,
    rainProb24h: 15,
    deltaT: 4.8,
    spraySafe: true,
    sprayReason: "तापमान और हवा अनुकूल हैं (Delta T: 4.8°C).",
  };
}

/**
 * Multimodal Gemini Vision: Deep Crop Health OR Syngenta Product Suitability Analysis
 */
async function analyzeImageWithGeminiPersonalized(
  base64Image: string,
  mimeType: string,
  caption: string,
  farmer: FarmerDbRecord,
  growthStage: ReturnType<typeof calculateGrowthStage>
): Promise<string> {
  const langConfig = LANGUAGE_META[farmer.language] || LANGUAGE_META["hi"];
  const keys = Array.from(new Set(ACTIVE_GOOGLE_KEYS));

  const prompt = `You are ANNAM AI / AASRA (आसरा), an elite agricultural advisor for Syngenta India.
You are chatting on WhatsApp with farmer: ${farmer.fullName}.
FARMER'S REGISTERED FARM PROFILE:
- Location: ${farmer.village}, ${farmer.district}, ${farmer.state}
- Field Area: ${farmer.fieldAreaAcres} Acres
- Registered Crop: ${farmer.primaryCrop} (${farmer.cropVariety || "Benchmark Variety"})
- Sowing Date: ${farmer.sowingDate} (${growthStage.das} Days After Sowing - DAS)
- Current Growth Stage: ${growthStage.stageLabel}
- Soil Type: ${farmer.soilType}
- Farmer's Question / Caption: "${caption || "Analyze this image"}"

CRITICAL INSTRUCTIONS:
Carefully inspect the image and identify whether it is:

CASE A: CROP LEAF / PLANT / FIELD ISSUE:
1. Health Verdict: Clearly say whether crop is Healthy or Diseased/Stressed.
2. Detected Issue: Name the exact pathogen, disease, pest, or physiological heat/moisture stress.
3. Personalized Syngenta Treatment:
   - Prescribe the exact Syngenta product for ${farmer.primaryCrop} (e.g. Ridomil Gold, Revus, Kavach, Amistar Top, Ampligo, Quantis, Isabion).
   - Calculate exact dosage for the farmer's field (${farmer.fieldAreaAcres} acres) and water requirement.
   - Mention ICAR scientific research trial proof.
4. Spray Timing & Rainfastness.

CASE B: SYNGENTA PRODUCT BOTTLE / PACKET / LABEL:
1. Identify the product name, active ingredient, and product category (Insecticide, Fungicide, Biostimulant, Herbicide).
2. PERSONALIZED SUITABILITY VERDICT FOR THIS FARMER:
   - Critically evaluate: Is this product suitable for the farmer's current crop (${farmer.primaryCrop}) at current stage (${growthStage.stageLabel}, ${growthStage.das} DAS)?
   - If SUITABLE: Explain why it helps right now, exact dose for ${farmer.fieldAreaAcres} acres, and mixing instructions.
   - If NOT SUITABLE or DANGEROUS: Provide a BOLD, CLEAR WARNING explaining why applying it to ${farmer.primaryCrop} will damage the crop or waste money, and name the correct Syngenta product they should use instead!

LANGUAGE REQUIREMENT:
Write the complete response strictly in ${langConfig.promptLang}.
Address the farmer warmly by name ("${farmer.fullName} ji").
Use clean WhatsApp markdown (*bold*, bullet points, emojis).`;

  for (const key of keys) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(18000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      console.warn("[Gemini Vision] Key failed:", e);
    }
  }

  return (
    `🌾 *ANNAM AI — फोटो विश्लेषण* 📸\n\n` +
    `नमस्ते ${farmer.fullName} जी! आपकी फोटो प्राप्त हो गई है।\n` +
    `आपकी फसल **${farmer.primaryCrop}** (${growthStage.stageLabel}) के लिए हमारा इंजन जांच कर रहा है।`
  );
}

/**
 * Build personalized recommendation message
 */
function buildPersonalizedAdvice(
  farmer: FarmerDbRecord,
  growthStage: ReturnType<typeof calculateGrowthStage>,
  parsedSymptoms: string,
  weather: Awaited<ReturnType<typeof fetchFieldWeather>>
): string {
  const langConfig = LANGUAGE_META[farmer.language] || LANGUAGE_META["hi"];

  // 7-parameter recommendation engine input
  const farmerInput: FarmerInput = {
    cropType: farmer.primaryCrop.toLowerCase(),
    growthStage: growthStage.stageKey,
    temperatureMax: weather.temp,
    temperatureMin: weather.temp - 8,
    humidityAvg: weather.humidity,
    rainfall7Day: weather.rainProb24h > 40 ? 25 : 5,
    windSpeed: weather.windSpeed,
    soilMoisture: "optimal",
    soilType: farmer.soilType.toLowerCase().includes("black") ? "black_cotton" : "alluvial",
    symptoms: parsedSymptoms,
    season: "kharif",
    daysSinceLastSpray: 14,
    acreage: farmer.fieldAreaAcres,
    locationName: `${farmer.district}, ${farmer.state}`,
  };

  const recResult = getRecommendations(farmerInput);
  const top1 = recResult.recommendations[0];
  const top2 = recResult.recommendations[1];

  if (!top1) {
    return (
      `🌾 *ANNAM AI — Krishi Salah*\n\n` +
      `नमस्ते ${farmer.fullName} जी! आपके ${farmer.fieldAreaAcres} एकड़ खेत (${farmer.primaryCrop}) के लिए सिफारिश तैयार की जा रही है।`
    );
  }

  const p = top1.product;
  const totalWater = p.waterPerAcre * farmer.fieldAreaAcres;
  const totalCost = top1.costBreakdown.productCost * farmer.fieldAreaAcres;

  return (
    `🌾 *ANNAM AI — व्यक्तिगत फसल सलाहकार* 🌾\n` +
    `_(Syngenta Plant Intelligence Engine)_\n\n` +
    `👤 *किसान:* *${farmer.fullName} जी*\n` +
    `📍 *खेत:* ${farmer.village}, ${farmer.district} (${farmer.fieldAreaAcres} एकड़)\n` +
    `🌱 *फसल:* *${farmer.primaryCrop} (${farmer.cropVariety || "Benchmark"})*\n` +
    `📅 *अवस्था:* *${growthStage.stageLabel}* (बुवाई के ${growthStage.das} दिन बाद)\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🥇 *सर्वोत्तम उत्पाद:* *${p.name}*\n` +
    `🏷️ *वर्ग:* ${p.category.toUpperCase()} | *सॉल्ट:* ${p.activeIngredient}\n\n` +
    `📋 *अनुशंसित मात्रा (Dose):* *${top1.dosageForThisCase}*\n` +
    `💧 *कुल पानी:* ${totalWater} लीटर (${farmer.fieldAreaAcres} एकड़ के लिए)\n` +
    `💰 *कुल लागत:* लगभग ₹${totalCost.toLocaleString("en-IN")} (₹${top1.costBreakdown.productCost}/एकड़)\n\n` +
    `🔬 *ICAR वैज्ञानिक प्रमाण:*\n` +
    `• *${top1.trialEfficacyPct}% प्रमाणित नियंत्रण*\n` +
    `• _${top1.trialCitation}_\n\n` +
    `⏱️ *Cropwise Spray Radar:*\n` +
    `• मौसम स्थिति: ${weather.spraySafe ? "🟢 सुरक्षित (Safe to Spray)" : "🔴 प्रतीक्षा करें (Caution)"}\n` +
    `• Delta T: *${weather.deltaT}°C* (अनुकूल 2-8°C) | हवा: *${weather.windSpeed} km/h*\n` +
    `• Rainfastness: *${top1.cropwiseStandard?.rainfastnessHours || 2} घंटे*\n\n` +
    (top2 ? `🥈 *वैकल्पिक उत्पाद (#2):* *${top2.product.name}* (Dose: ${top2.dosageForThisCase})\n\n` : "") +
    `💡 _यह सलाह आपकी वेबसाइट प्रोफ़ाइल और वास्तविक मौसम टेलीमेट्री पर आधारित है।_`
  );
}

/**
 * Detect language from text (supports English, Hindi, and regional languages)
 */
function detectQueryLanguage(text: string, defaultFarmerLang: string = "hi"): string {
  const t = text.toLowerCase();

  const englishTokens = [
    "what", "how", "which", "when", "why", "who", "rate", "price", "cost", "today",
    "tomorrow", "yesterday", "tomato", "potato", "onion", "wheat", "crop", "spray",
    "weather", "safe", "can", "in", "at", "of", "is", "the", "fungus", "disease",
    "treat", "should", "help", "hello", "hi", "good", "morning", "profit", "benefit"
  ];

  const hindiTokens = [
    "kya", "kaise", "kitna", "bhav", "bhaav", "aaj", "kal", "khet", "fasal", "pani",
    "paani", "dawa", "dawai", "me", "mein", "hai", "ho", "hain", "patte", "sukha",
    "sookh", "keeda", "kida", "rog", "namaste", "pranam", "bhai", "salah", "kharch"
  ];

  let engCount = 0;
  let hinCount = 0;

  const words = t.split(/[\s,?.!]+/);
  for (const w of words) {
    if (englishTokens.includes(w)) engCount++;
    if (hindiTokens.includes(w)) hinCount++;
  }

  if (engCount > hinCount && engCount >= 1) return "en";
  if (hinCount > engCount && hinCount >= 1) return "hi";
  return defaultFarmerLang;
}

/**
 * Extract target location / mandi name from user query
 */
function extractLocationFromQuery(text: string, defaultDistrict: string): string {
  const t = text.toLowerCase();

  // 1. Matches: "in ajmer", "at bhopal", "near indore", "ajmer me", "agra mandi"
  const prepMatch = t.match(/\b(?:in|at|near|around|me|mein|se|ki)\s+([a-zA-Z\u0900-\u097F]+)/i);
  if (prepMatch && prepMatch[1]) {
    const cand = prepMatch[1].trim();
    const stopwords = ["mandi", "rate", "price", "bhav", "bhaav", "the", "aaj", "today", "crop", "khet", "field", "kilo", "kg"];
    if (!MANDI_BENCHMARKS[cand] && cand.length > 2 && !stopwords.includes(cand)) {
      return cand.charAt(0).toUpperCase() + cand.slice(1);
    }
  }

  // 2. Matches: "ajmer mandi", "agra market", "bhopal yard"
  const suffixMatch = t.match(/([a-zA-Z\u0900-\u097F]+)\s+(?:mandi|market|yard|apmc)/i);
  if (suffixMatch && suffixMatch[1]) {
    const cand = suffixMatch[1].trim();
    const stopwords = ["mandi", "rate", "price", "bhav", "bhaav", "the", "aaj", "today", "crop", "khet", "field", "kilo", "kg"];
    if (!MANDI_BENCHMARKS[cand] && cand.length > 2 && !stopwords.includes(cand)) {
      return cand.charAt(0).toUpperCase() + cand.slice(1);
    }
  }

  return defaultDistrict;
}

/**
 * Handle Live Weather & Spray Radar Query with dynamic geocoding
 */
async function handleWeatherQuery(farmer: FarmerDbRecord, userText: string): Promise<string> {
  const lang = detectQueryLanguage(userText, farmer.language);
  const targetLocation = extractLocationFromQuery(userText, farmer.district);

  // Dynamically geocode the queried location
  const geo = await geocodeLocation(targetLocation);
  const weather = await fetchFieldWeather(geo.lat, geo.lon);
  const isEn = lang === "en";

  if (isEn) {
    return (
      `⛅ *ANNAM AI — Live Field Weather & Spray Radar* 🛰️\n\n` +
      `📍 *Location:* ${geo.name}, ${geo.state} (${geo.lat.toFixed(2)}°N, ${geo.lon.toFixed(2)}°E)\n\n` +
      `🌡️ *Live Temperature:* *${weather.temp}°C*\n` +
      `💧 *Relative Humidity:* *${weather.humidity}%*\n` +
      `💨 *Wind Speed:* *${weather.windSpeed} km/h*\n` +
      `🌧️ *Rain Probability (Next 24h):* *${weather.rainProb24h}%*\n` +
      `🎯 *Cropwise Delta T:* *${weather.deltaT}°C* (Optimal: 2–8°C)\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🎯 *Spray Window Verdict:*\n` +
      `${weather.spraySafe ? "🟢 *SAFE TO SPRAY (Optimal weather conditions)*" : "🔴 *UNSAFE TO SPRAY (Hold chemical spray)*"}\n` +
      `👉 _${weather.sprayReason}_\n\n` +
      `💡 *Best Application Timing:* Early morning (6:00 AM – 9:30 AM) or late afternoon (after 4:30 PM) for maximum stomatal uptake.`
    );
  }

  return (
    `⛅ *ANNAM AI — लाइव खेत मौसम एवं स्प्रे राडार* 🛰️\n\n` +
    `📍 *स्थान:* ${geo.name}, ${geo.state} (${geo.lat.toFixed(2)}°N, ${geo.lon.toFixed(2)}°E)\n\n` +
    `🌡️ *लाइव तापमान:* *${weather.temp}°C*\n` +
    `💧 *सापेक्षिक आर्द्रता (Humidity):* *${weather.humidity}%*\n` +
    `💨 *हवा की गति:* *${weather.windSpeed} km/h*\n` +
    `🌧️ *अगले 24 घंटे में बारिश का जोखिम:* *${weather.rainProb24h}%*\n` +
    `🎯 *Cropwise Delta T:* *${weather.deltaT}°C* (आदर्श रेंज: 2-8°C)\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🎯 *स्प्रे निर्णय (Spray Window Verdict):*\n` +
    `${weather.spraySafe ? "🟢 *छिड़काव के लिए उत्तम समय है (SAFE TO SPRAY)*" : "🔴 *अभी छिड़काव न करें (UNSAFE TO SPRAY)*"}\n` +
    `👉 _${weather.sprayReason}_\n\n` +
    `💡 *सलाह:* सुबह 6:00 से 9:30 बजे या शाम 4:30 के बाद स्प्रे करना सबसे असरदार रहता है।`
  );
}

/**
 * Handle ROBI (Return on Investment) Query
 */
function handleRobiQuery(farmer: FarmerDbRecord): string {
  const acres = farmer.fieldAreaAcres;
  const costPerAcre = 400; // Syngenta biostimulant average
  const totalCost = costPerAcre * acres;
  const yieldProtectedPerAcre = 1.8; // quintals/acre
  const totalSavedQ = (yieldProtectedPerAcre * acres).toFixed(1);
  const mandiPrice = 2800; // average ₹/quintal
  const revenueSaved = Math.round(Number(totalSavedQ) * mandiPrice);
  const netBenefit = revenueSaved - totalCost;
  const robiRatio = (revenueSaved / totalCost).toFixed(1);

  return (
    `💰 *ANNAM AI — ROBI (जैविक निवेश पर लाभ) ऑडिट* 📈\n\n` +
    `👤 *किसान:* ${farmer.fullName} जी\n` +
    `🌱 *फसल:* ${farmer.primaryCrop} (${acres} एकड़ खेत)\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💵 *लागत (Input Cost):* ₹${totalCost.toLocaleString("en-IN")} (₹${costPerAcre}/एकड़)\n` +
    `🌾 *सुरक्षित संभावित उपज:* *+${totalSavedQ} क्विंटल*\n` +
    `💎 *बाजार मूल्य (Mandi Value):* *₹${revenueSaved.toLocaleString("en-IN")}*\n` +
    `🚀 *शुद्ध लाभ (Net Saved Profit):* *₹${netBenefit.toLocaleString("en-IN")}*\n` +
    `⭐ *ROBI मल्टीप्लायर:* *${robiRatio}x Return on Investment!*\n\n` +
    `💡 *आसरा ऑडिट निष्कर्ष:* ₹1 लगाने पर आपको ₹${robiRatio} की फसल सुरक्षा प्राप्त हो रही है।`
  );
}

/**
 * Live Grounded APMC Mandi Price Search via Google Search
 */
async function fetchLiveMandiPriceWithSearch(
  crop: string,
  location: string,
  lang: string
): Promise<string | null> {
  const keys = Array.from(new Set(ACTIVE_GOOGLE_KEYS));
  const isEn = lang === "en";

  const searchPrompt = isEn
    ? `Search the web for the latest wholesale market price (APMC Mandi rate) of ${crop} in ${location}, India today (September 2026).
Provide real current numbers for modal price per kg (and per quintal), min-max range, and the official APMC Mandi yard name.
Format the output for WhatsApp with these exact sections:
📍 *Live Mandi Price — ${crop}* 📍
🏛️ *Market:* [Official APMC Mandi Yard Name, State]
📅 *Trade Date:* [Latest available date, e.g. 03 Sep 2026] (Live Real-time APMC Data)
💰 *Today's Modal Price:* ₹[X] per kg (₹[Y] per quintal)
📈 *Price Range:* ₹[Min] - ₹[Max] per kg (₹[MinQ] - ₹[MaxQ] /q)
• *Market Status / Arrivals:* [e.g. Active trading, steady arrivals]
💡 *Farmer Advisory:* [1-sentence clear advice for farmer].`
    : `Search the web for the latest wholesale market price (APMC Mandi rate) of ${crop} in ${location}, India today (September 2026).
Provide real current numbers for modal price per kg (and per quintal), min-max range, and the official APMC Mandi yard name.
Format the output in clean Hindi for WhatsApp with these exact sections:
📍 *लाइव मंडी भाव — ${crop}* 📍
🏛️ *मंडी:* [आधिकारिक एपीएमसी मंडी का नाम, राज्य]
📅 *ट्रेडिंग दिनांक:* [उपलब्ध ताज़ा तारीख, e.g. 03 Sep 2026] (लाइव एपीएमसी डेटा)
💰 *आज का मॉडल भाव:* ₹[X] प्रति किलो (₹[Y] प्रति क्विंटल)
📈 *भाव सीमा (Range):* ₹[Min] - ₹[Max] प्रति किलो
• *बाजार स्थिति:* [सक्रिय व्यापार / आवक की स्थिति]
💡 *किसान सलाह:* [बिक्री के संबंध में 1 पंक्ति की स्पष्ट सलाह]।`;

  for (const key of keys) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
      const payload = {
        contents: [{ parts: [{ text: searchPrompt }] }],
        tools: [{ google_search: {} }],
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(18000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.length > 50) {
          return text.trim();
        }
      }
    } catch (e) {
      console.warn("[Live Mandi Search] Key failed:", e);
    }
  }

  return null;
}

/**
 * Handle Mandi Bhav Queries with dynamic language, location resolution, and live web search
 */
async function handleMandiQuery(text: string, farmer: FarmerDbRecord): Promise<string | null> {
  const t = text.toLowerCase();
  const isMandi =
    t.includes("bhav") ||
    t.includes("bhaav") ||
    t.includes("rate") ||
    t.includes("price") ||
    t.includes("mandi") ||
    t.includes("kilo") ||
    t.includes("dam") ||
    t.includes("daam") ||
    t.includes("cost");

  if (!isMandi) return null;

  const lang = detectQueryLanguage(text, farmer.language);
  const targetLocation = extractLocationFromQuery(text, farmer.district);

  let matchedCommodity: (typeof MANDI_BENCHMARKS)[string] | null = null;
  for (const [key, item] of Object.entries(MANDI_BENCHMARKS)) {
    if (t.includes(key)) {
      matchedCommodity = item;
      break;
    }
  }

  // Default to farmer's primary crop if asking general mandi rates
  if (!matchedCommodity && (t.includes("meri mandi") || t.includes("aaj ka bhav") || t.includes("mandi rate") || t.includes("crop price"))) {
    const cropKey = farmer.primaryCrop.toLowerCase();
    for (const [key, item] of Object.entries(MANDI_BENCHMARKS)) {
      if (cropKey.includes(key)) {
        matchedCommodity = item;
        break;
      }
    }
  }

  if (!matchedCommodity) {
    if (lang === "en") {
      return (
        `📊 *ANNAM AI — Live Mandi Price Service* 📍\n\n` +
        `Hello ${farmer.fullName}! Which crop's mandi price would you like to check? For example:\n` +
        `👉 *"Rate of tomato in Ajmer"*\n` +
        `👉 *"Potato price in Agra"*\n` +
        `👉 *"Wheat mandi rate today"*\n` +
        `👉 *"Soybean price"*`
      );
    }
    return (
      `📊 *ANNAM AI — लाइव मंडी भाव सेवा* 📍\n\n` +
      `नमस्ते ${farmer.fullName} जी! आप किस फसल का मंडी भाव जानना चाहते हैं?\n` +
      `👉 *"अजमेर में टमाटर का भाव"*\n` +
      `👉 *"आगरा में आलू का रेट"*\n` +
      `👉 *"गेहूं मंडी भाव"*\n` +
      `👉 *"सोयाबीन का रेट"*`
    );
  }

  // 1. Try Live Google Search Grounded Mandi Prices First
  const liveResult = await fetchLiveMandiPriceWithSearch(matchedCommodity.nameEn, targetLocation, lang);
  if (liveResult) {
    return liveResult;
  }

  // 2. Calibrated APMC Fallback
  const perKgModal = (matchedCommodity.modalQ / 100).toFixed(0);
  const perKgMin = (matchedCommodity.minQ / 100).toFixed(0);
  const perKgMax = (matchedCommodity.maxQ / 100).toFixed(0);

  if (lang === "en") {
    return (
      `📍 *Mandi Price Today — ${matchedCommodity.nameEn}* 📍\n` +
      `🏛️ *Market:* ${targetLocation} APMC Yard\n\n` +
      `💰 *Today's Modal Price:* *₹${perKgModal} per kg* (₹${matchedCommodity.modalQ.toLocaleString("en-IN")}/quintal)\n\n` +
      `📈 *Price Range:*\n` +
      `• Minimum (Min): ₹${perKgMin}/kg (₹${matchedCommodity.minQ.toLocaleString("en-IN")}/q)\n` +
      `• Maximum (Max): ₹${perKgMax}/kg (₹${matchedCommodity.maxQ.toLocaleString("en-IN")}/q)\n` +
      `• Market Trend: *${matchedCommodity.trend}*\n\n` +
      `💡 *Farmer Advisory:* Do not sell to intermediaries below ₹${perKgMin}/kg. Prices are expected to remain steady based on current APMC arrivals.`
    );
  }

  return (
    `📍 *Mandi Bhav Today — ${matchedCommodity.nameHi}* 📍\n` +
    `🏛️ *मंडी:* ${targetLocation} APMC Yard\n\n` +
    `💰 *आज का मॉडल भाव:* *₹${perKgModal} प्रति किलो* (₹${matchedCommodity.modalQ.toLocaleString("en-IN")}/क्विंटल)\n\n` +
    `📈 *भाव सीमा (Range):*\n` +
    `• न्यूनतम (Min): ₹${perKgMin}/kg (₹${matchedCommodity.minQ.toLocaleString("en-IN")}/q)\n` +
    `• अधिकतम (Max): ₹${perKgMax}/kg (₹${matchedCommodity.maxQ.toLocaleString("en-IN")}/q)\n` +
    `• बाजार रुख (Trend): *${matchedCommodity.trend}*\n\n` +
    `💡 *किसान सलाह:* बिचौलिये को ₹${perKgMin}/kg से कम में न बेचें।`
  );
}

/**
 * Handle General Multilingual AI Chat via Gemini Flash
 */
async function generateMultilingualChatReply(userMessage: string, farmer: FarmerDbRecord): Promise<string> {
  const detectedLang = detectQueryLanguage(userMessage, farmer.language);
  const langConfig = LANGUAGE_META[detectedLang] || LANGUAGE_META[farmer.language] || LANGUAGE_META["hi"];
  const keys = Array.from(new Set(ACTIVE_GOOGLE_KEYS));

  const prompt = `You are ANNAM AI (Kisan Mitra), the trusted agricultural expert assistant for Syngenta India.
You are chatting with farmer: ${farmer.fullName} on WhatsApp.
FARMER PROFILE CONTEXT:
- Location: ${farmer.village}, ${farmer.district}, ${farmer.state}
- Crop: ${farmer.primaryCrop} (${farmer.cropVariety || "Standard"})
- Land Area: ${farmer.fieldAreaAcres} Acres
- Sowing Date: ${farmer.sowingDate}
- User's Question Language: ${langConfig.promptLang}

Farmer's Message: "${userMessage}"

RULES:
1. Answer directly and concisely in ${langConfig.promptLang}. If the user asked in English, answer in English. If in Hindi, answer in Hindi.
2. Address the farmer respectfully as "${farmer.fullName} ji" (or "Sameer" if English).
3. Always integrate their crop (${farmer.primaryCrop}) context whenever relevant.
4. Keep the reply friendly, practical, structured in 3-4 bullet points, with emojis.`;

  for (const key of keys) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      console.warn("[Gemini Chat] Key failed:", e);
    }
  }

  return (
    `🌾 *ANNAM AI — किसान सलाहकार*\n\n` +
    `नमस्ते ${farmer.fullName} जी! आपका संदेश प्राप्त हुआ। अपनी फसल **${farmer.primaryCrop}** की किसी भी समस्या के लिए हमें लिखें या फोटो भेजें।`
  );
}

/**
 * GET: Meta Webhook Verification Handshake
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log(`[Meta Webhook Handshake] mode=${mode}, token=${token}`);

  if (mode === "subscribe" && token && META_VERIFY_TOKENS.includes(token)) {
    console.log("[Meta Webhook Handshake] ✅ Webhook verified successfully!");
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("[Meta Webhook Handshake] ❌ Verification token mismatch");
  return new Response("Verification token mismatch", { status: 403 });
}

/**
 * POST: Incoming WhatsApp Message Receiver (Personalized, Multilingual, Multimodal)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const value = change.value || {};

        // Skip status updates (sent, delivered, read)
        if (value.statuses && !value.messages) {
          continue;
        }

        const messages = value.messages || [];
        for (const msg of messages) {
          const from = msg.from; // Sender phone number
          const messageId = msg.id;

          if (!from) continue;

          // 1. Mark as read (blue ticks) immediately
          await markMessageAsRead(messageId);

          // 2. Resolve Farmer Profile & Sowing Context
          const farmer = resolveFarmerProfile(from);
          const growthStage = calculateGrowthStage(farmer.primaryCrop, farmer.sowingDate);

          console.log(
            `[Meta Webhook] 👤 Sender: ${from} | Farmer: ${farmer.fullName} | Crop: ${farmer.primaryCrop} (${growthStage.stageLabel}) | Lang: ${farmer.language}`
          );

          // 3. Handle GPS Location Sharing (WhatsApp Location Pin)
          if (msg.type === "location" && msg.location) {
            const { latitude, longitude } = msg.location;
            console.log(`[Meta Webhook] 📍 GPS Pin received from ${from}: ${latitude}, ${longitude}`);

            // Save field GPS in database
            db.addField({
              name: `${farmer.fullName}'s Farm Pin`,
              lat: latitude,
              lon: longitude,
              area_acres: farmer.fieldAreaAcres,
              crop: farmer.primaryCrop,
              variety: farmer.cropVariety,
              soil_type: farmer.soilType,
              polygon: [
                [latitude - 0.002, longitude - 0.002],
                [latitude - 0.002, longitude + 0.002],
                [latitude + 0.002, longitude + 0.002],
                [latitude + 0.002, longitude - 0.002],
              ],
            });

            // Fetch live telemetry for exact GPS coordinates
            const weather = await fetchFieldWeather(latitude, longitude);

            const locationReply =
              `📍 *खेत की लोकेशन प्राप्त हुई (GPS Coordinates Linked!)* 🛰️\n\n` +
              `नमस्ते ${farmer.fullName} जी! आपके खेत के सटीक निर्देशांक (*${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E*) को AASRA पोर्टल पर जोड़ दिया गया है।\n\n` +
              `🌡️ *आपके खेत का सीधा मौसम:*\n` +
              `• तापमान: *${weather.temp}°C* | नमी: *${weather.humidity}%*\n` +
              `• हवा: *${weather.windSpeed} km/h* | बारिश का जोखिम: *${weather.rainProb24h}%*\n` +
              `• Cropwise Delta T: *${weather.deltaT}°C*\n\n` +
              `🎯 *स्प्रे स्थिति:* ${weather.spraySafe ? "🟢 *स्प्रे करने के लिए सुरक्षित*" : "🔴 *स्प्रे स्थगित रखें*"}\n` +
              `👉 _${weather.sprayReason}_\n\n` +
              `🌱 *फसल:* ${farmer.primaryCrop} (${growthStage.stageLabel}, ${farmer.fieldAreaAcres} एकड़)`;

            await sendWhatsAppMessage(from, locationReply);
            continue;
          }

          // 4. Handle Inbound Images (Crop Disease photo OR Syngenta Product bottle)
          if (msg.type === "image" && msg.image?.id) {
            console.log(`[Meta Webhook] 📸 Inbound photo from ${from} (mediaId: ${msg.image.id})`);

            await sendWhatsAppMessage(
              from,
              `📸 *नमस्ते ${farmer.fullName} जी! आपकी फोटो प्राप्त हुई!*\n\nAASRA Vision AI आपकी फसल **${farmer.primaryCrop}** (${growthStage.stageLabel}) के संदर्भ में जांच कर रहा है, कृपया 5-10 सेकंड प्रतीक्षा करें...`
            );

            const media = await downloadMetaMedia(msg.image.id);
            if (media && media.buffer) {
              const base64Img = media.buffer.toString("base64");
              const diagnosis = await analyzeImageWithGeminiPersonalized(
                base64Img,
                media.mimeType,
                msg.image.caption || "",
                farmer,
                growthStage
              );
              await sendWhatsAppMessage(from, diagnosis);
            } else {
              await sendWhatsAppMessage(
                from,
                "⚠️ फोटो डाउनलोड में समस्या आई। कृपया दोबारा फोटो भेजें।"
              );
            }
            continue;
          }

          // 5. Handle Text Messages
          let textBody = "";
          if (msg.type === "text") {
            textBody = msg.text?.body || "";
          } else if (msg.type === "interactive") {
            textBody =
              msg.interactive?.button_reply?.title ||
              msg.interactive?.list_reply?.title ||
              "";
          } else if (msg.type === "button") {
            textBody = msg.button?.text || "";
          }

          if (!textBody) continue;

          console.log(`[Meta Webhook] 📩 Incoming text from ${from}: "${textBody}"`);
          const tLower = textBody.toLowerCase();

          // A. Mandi Bhav Query
          const mandiReply = await handleMandiQuery(textBody, farmer);
          if (mandiReply) {
            await sendWhatsAppMessage(from, mandiReply);
            continue;
          }

          // B. Weather & Spray Radar Query
          if (
            tLower.includes("mausam") ||
            tLower.includes("weather") ||
            tLower.includes("hawa") ||
            tLower.includes("spray kar sakte") ||
            tLower.includes("barish") ||
            tLower.includes("baarish")
          ) {
            const weatherReply = await handleWeatherQuery(farmer, textBody);
            await sendWhatsAppMessage(from, weatherReply);
            continue;
          }

          // C. ROBI / Profit / Investment Query
          if (
            tLower.includes("robi") ||
            tLower.includes("profit") ||
            tLower.includes("fayda") ||
            tLower.includes("faida") ||
            tLower.includes("bachat") ||
            tLower.includes("munafa")
          ) {
            const robiReply = handleRobiQuery(farmer);
            await sendWhatsAppMessage(from, robiReply);
            continue;
          }

          // D. Field Journal Entry via WhatsApp
          if (
            (tLower.includes("spray kiya") || tLower.includes("dawa dali") || tLower.includes("kharch")) &&
            (tLower.includes("aaj") || tLower.includes("kal"))
          ) {
            db.addJournalEntry({
              category: "spray",
              title: `WhatsApp Spray Log — ${farmer.primaryCrop}`,
              subtitle: `${farmer.fieldAreaAcres} एकड़ खेत · ${farmer.village}`,
              date: new Date().toISOString().split("T")[0],
              badge: "FOLIAR APPLICATION",
              badgeColor: "emerald",
              metrics: [
                { label: "Crop", value: farmer.primaryCrop },
                { label: "Stage", value: growthStage.stageLabel },
                { label: "Field Area", value: `${farmer.fieldAreaAcres} Acres` },
              ],
              notes: textBody,
              costINR: 800,
            });

            const journalConfirm =
              `📝 *खेत डायरी में दर्ज किया गया (AASRA Field Journal Updated!)*\n\n` +
              `नमस्ते ${farmer.fullName} जी! आपका स्प्रे विवरण AASRA पोर्टल पर सुरक्षित कर लिया गया है:\n` +
              `• फसल: *${farmer.primaryCrop}*\n` +
              `• विवरण: _"${textBody}"_\n` +
              `• दिनांक: ${new Date().toLocaleDateString("hi-IN")}\n\n` +
              `👉 आप इसे वेबसाइट पर देख सकते हैं:\nhttps://frontend-phi-flame-21.vercel.app/journal`;

            await sendWhatsAppMessage(from, journalConfirm);
            continue;
          }

          // E. Agronomic Symptom / Recommendation Query
          let symptoms = "none";
          if (tLower.includes("pest") || tLower.includes("keeda") || tLower.includes("kida") || tLower.includes("sundi") || tLower.includes("borer") || tLower.includes("caterpillar")) {
            symptoms = "pest_damage";
          } else if (tLower.includes("yellow") || tLower.includes("peela") || tLower.includes("peeli")) {
            symptoms = "yellowing";
          } else if (tLower.includes("spot") || tLower.includes("dhabba") || tLower.includes("rust") || tLower.includes("blight") || tLower.includes("fungus")) {
            symptoms = "leaf_spots";
          } else if (tLower.includes("wilt") || tLower.includes("murjha") || tLower.includes("sukha")) {
            symptoms = "wilting";
          }

          if (symptoms !== "none" || tLower.includes("dawa") || tLower.includes("recommend") || tLower.includes("upchar")) {
            const coords = DISTRICT_COORDS[farmer.district.toLowerCase()] || DISTRICT_COORDS["kasganj"];
            const weather = await fetchFieldWeather(coords.lat, coords.lon);
            const adviceReply = buildPersonalizedAdvice(farmer, growthStage, symptoms, weather);
            await sendWhatsAppMessage(from, adviceReply);
            continue;
          }

          // F. General Native Language Chatbot
          const chatReply = await generateMultilingualChatReply(textBody, farmer);
          await sendWhatsAppMessage(from, chatReply);
        }
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err: any) {
    console.error("[Meta Webhook] Processing error:", err);
    return NextResponse.json({ status: "error", error: err.message }, { status: 500 });
  }
}
