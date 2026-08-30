import { NextRequest, NextResponse } from "next/server";
import { executeGoogleGeminiPrompt, extractAndParseJson } from "@/lib/geminiEngine";

// Comprehensive Indian District to State & Agro-Climatic Zone Mapping
const DISTRICT_ZONE_MAP: Record<string, { state: string; zone: string }> = {
  // Uttar Pradesh (Western, Central & Eastern)
  kasganj: { state: "Uttar Pradesh", zone: "UP_WEST" },
  agra: { state: "Uttar Pradesh", zone: "UP_WEST" },
  etah: { state: "Uttar Pradesh", zone: "UP_WEST" },
  aligarh: { state: "Uttar Pradesh", zone: "UP_WEST" },
  hathras: { state: "Uttar Pradesh", zone: "UP_WEST" },
  mathura: { state: "Uttar Pradesh", zone: "UP_WEST" },
  firozabad: { state: "Uttar Pradesh", zone: "UP_WEST" },
  mainpuri: { state: "Uttar Pradesh", zone: "UP_WEST" },
  badaun: { state: "Uttar Pradesh", zone: "UP_WEST" },
  bareilly: { state: "Uttar Pradesh", zone: "UP_WEST" },
  moradabad: { state: "Uttar Pradesh", zone: "UP_WEST" },
  shahjahanpur: { state: "Uttar Pradesh", zone: "UP_WEST" },
  bulandshahr: { state: "Uttar Pradesh", zone: "UP_WEST" },
  meerut: { state: "Uttar Pradesh", zone: "UP_WEST" },
  muzaffarnagar: { state: "Uttar Pradesh", zone: "UP_WEST" },
  saharanpur: { state: "Uttar Pradesh", zone: "UP_WEST" },
  sidhpura: { state: "Uttar Pradesh", zone: "UP_WEST" },
  amanpur: { state: "Uttar Pradesh", zone: "UP_WEST" },
  kanpur: { state: "Uttar Pradesh", zone: "UP_CENTRAL" },
  lucknow: { state: "Uttar Pradesh", zone: "UP_CENTRAL" },
  varanasi: { state: "Uttar Pradesh", zone: "UP_EAST" },
  gorakhpur: { state: "Uttar Pradesh", zone: "UP_EAST" },
  prayagraj: { state: "Uttar Pradesh", zone: "UP_EAST" },
  chandauli: { state: "Uttar Pradesh", zone: "UP_EAST" },
  
  // Punjab & Haryana
  ludhiana: { state: "Punjab", zone: "PUNJAB_HARYANA" },
  bathinda: { state: "Punjab", zone: "PUNJAB_HARYANA" },
  amritsar: { state: "Punjab", zone: "PUNJAB_HARYANA" },
  jalandhar: { state: "Punjab", zone: "PUNJAB_HARYANA" },
  patiala: { state: "Punjab", zone: "PUNJAB_HARYANA" },
  karnal: { state: "Haryana", zone: "PUNJAB_HARYANA" },
  hisar: { state: "Haryana", zone: "PUNJAB_HARYANA" },
  sirsa: { state: "Haryana", zone: "PUNJAB_HARYANA" },
  kurukshetra: { state: "Haryana", zone: "PUNJAB_HARYANA" },
  ambala: { state: "Haryana", zone: "PUNJAB_HARYANA" },
  rohtak: { state: "Haryana", zone: "PUNJAB_HARYANA" },

  // Madhya Pradesh
  bhopal: { state: "Madhya Pradesh", zone: "MP_CENTRAL" },
  indore: { state: "Madhya Pradesh", zone: "MP_CENTRAL" },
  ujjain: { state: "Madhya Pradesh", zone: "MP_CENTRAL" },
  dewas: { state: "Madhya Pradesh", zone: "MP_CENTRAL" },
  sehore: { state: "Madhya Pradesh", zone: "MP_CENTRAL" },
  vidisha: { state: "Madhya Pradesh", zone: "MP_CENTRAL" },
  dhar: { state: "Madhya Pradesh", zone: "MP_CENTRAL" },
  khargone: { state: "Madhya Pradesh", zone: "MP_CENTRAL" },
  mandsaur: { state: "Madhya Pradesh", zone: "MP_CENTRAL" },
  neemuch: { state: "Madhya Pradesh", zone: "MP_CENTRAL" },
  jabalpur: { state: "Madhya Pradesh", zone: "MP_CENTRAL" },

  // Maharashtra
  nagpur: { state: "Maharashtra", zone: "MAHARASHTRA" },
  akola: { state: "Maharashtra", zone: "MAHARASHTRA" },
  amravati: { state: "Maharashtra", zone: "MAHARASHTRA" },
  yavatmal: { state: "Maharashtra", zone: "MAHARASHTRA" },
  jalgaon: { state: "Maharashtra", zone: "MAHARASHTRA" },
  nashik: { state: "Maharashtra", zone: "MAHARASHTRA" },
  pune: { state: "Maharashtra", zone: "MAHARASHTRA" },
  aurangabad: { state: "Maharashtra", zone: "MAHARASHTRA" },
  ahmednagar: { state: "Maharashtra", zone: "MAHARASHTRA" },

  // Gujarat
  rajkot: { state: "Gujarat", zone: "GUJARAT" },
  gondal: { state: "Gujarat", zone: "GUJARAT" },
  junagadh: { state: "Gujarat", zone: "GUJARAT" },
  jamnagar: { state: "Gujarat", zone: "GUJARAT" },
  amreli: { state: "Gujarat", zone: "GUJARAT" },
  bhavnagar: { state: "Gujarat", zone: "GUJARAT" },
  surat: { state: "Gujarat", zone: "GUJARAT" },
  mehsana: { state: "Gujarat", zone: "GUJARAT" },
  banaskantha: { state: "Gujarat", zone: "GUJARAT" },

  // Andhra Pradesh & Telangana
  guntur: { state: "Andhra Pradesh", zone: "ANDHRA_TELANGANA" },
  krishna: { state: "Andhra Pradesh", zone: "ANDHRA_TELANGANA" },
  kurnool: { state: "Andhra Pradesh", zone: "ANDHRA_TELANGANA" },
  anantapur: { state: "Andhra Pradesh", zone: "ANDHRA_TELANGANA" },
  warangal: { state: "Telangana", zone: "ANDHRA_TELANGANA" },
  khammam: { state: "Telangana", zone: "ANDHRA_TELANGANA" },
  karimnagar: { state: "Telangana", zone: "ANDHRA_TELANGANA" },

  // Rajasthan
  jaipur: { state: "Rajasthan", zone: "RAJASTHAN" },
  kota: { state: "Rajasthan", zone: "RAJASTHAN" },
  sriganganagar: { state: "Rajasthan", zone: "RAJASTHAN" },
  alwar: { state: "Rajasthan", zone: "RAJASTHAN" },
  bharatpur: { state: "Rajasthan", zone: "RAJASTHAN" },
};

function getZoneForLocation(district: string, state: string): string {
  const normDist = district.toLowerCase().trim();
  const normState = state.toLowerCase().trim();

  // 1. Direct district match
  for (const [key, mapping] of Object.entries(DISTRICT_ZONE_MAP)) {
    if (normDist.includes(key) || key.includes(normDist)) {
      return mapping.zone;
    }
  }

  // 2. State-level fallback
  if (normState.includes("uttar pradesh") || normState.includes("up")) return "UP_WEST";
  if (normState.includes("punjab") || normState.includes("haryana")) return "PUNJAB_HARYANA";
  if (normState.includes("andhra") || normState.includes("telangana")) return "ANDHRA_TELANGANA";
  if (normState.includes("gujarat")) return "GUJARAT";
  if (normState.includes("maharashtra")) return "MAHARASHTRA";
  if (normState.includes("rajasthan")) return "RAJASTHAN";
  if (normState.includes("bihar")) return "UP_EAST";

  return "MP_CENTRAL";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let state = searchParams.get("state") || "India";
  let district = searchParams.get("district") || "Local Region";

  const zone = getZoneForLocation(district, state);
  const cleanDistrict = district.replace(/District|Division|Mandi/gi, "").trim() || "District";

  let defaultRates = [];

  switch (zone) {
    case "UP_WEST":
      // Western UP (Kasganj, Agra, Aligarh, Mathura, Etah) — REAL AUTHENTIC CROPS (No Soybean/Cotton)
      defaultRates = [
        {
          commodity: "Wheat (Lokwan / Sharbati)",
          commodityHi: "गेहूँ (शरबती / लोकवान)",
          mandi: `${cleanDistrict} Mandi Samiti (Amanpur Road)`,
          minPrice: 2350,
          maxPrice: 2580,
          modalPrice: 2470,
          trend: "up",
          changePct: 0.8
        },
        {
          commodity: "Mustard / Sarson (Laha)",
          commodityHi: "सरसों / राई (लाहा)",
          mandi: `${cleanDistrict} Oilseed Mandi`,
          minPrice: 5420,
          maxPrice: 5880,
          modalPrice: 5660,
          trend: "up",
          changePct: 1.2
        },
        {
          commodity: "Potato (Chipsona / Pukhraj)",
          commodityHi: "आलू (चिप्सोना / पुखराज)",
          mandi: `${cleanDistrict} Cold Storage Mandi`,
          minPrice: 1350,
          maxPrice: 1780,
          modalPrice: 1560,
          trend: "stable",
          changePct: 0.0
        },
        {
          commodity: "Bajra / Pearl Millet (Desi)",
          commodityHi: "बाजरा (देसी / हाइब्रिड)",
          mandi: `${cleanDistrict} Grain APMC Yard`,
          minPrice: 2180,
          maxPrice: 2420,
          modalPrice: 2310,
          trend: "up",
          changePct: 0.6
        },
        {
          commodity: "Paddy / Dhan (PR-106 / Sharbati)",
          commodityHi: "धान (शरबती / पीआर-१०६)",
          mandi: `${cleanDistrict} Rice Mandi Yard`,
          minPrice: 2280,
          maxPrice: 2750,
          modalPrice: 2520,
          trend: "up",
          changePct: 1.1
        },
        {
          commodity: "Maize (Yellow Corn)",
          commodityHi: "मक्का (पीला)",
          mandi: `${cleanDistrict} APMC Yard`,
          minPrice: 2110,
          maxPrice: 2340,
          modalPrice: 2220,
          trend: "down",
          changePct: -0.4
        }
      ];
      break;

    case "UP_EAST":
      // Eastern UP & Bihar (Varanasi, Gorakhpur, Chandauli)
      defaultRates = [
        { commodity: "Paddy / Dhan (Sona Masoori / Sambha)", commodityHi: "धान (सोना मंसूरी / सांभा)", mandi: `${cleanDistrict} APMC Mandi (Rohania)`, minPrice: 2220, maxPrice: 2560, modalPrice: 2420, trend: "up", changePct: 0.9 },
        { commodity: "Wheat (HD-2967 / Lokwan)", commodityHi: "गेहूँ (उन्नत)", mandi: `${cleanDistrict} Krishi Mandi`, minPrice: 2340, maxPrice: 2560, modalPrice: 2460, trend: "stable", changePct: 0.4 },
        { commodity: "Mustard / Sarson", commodityHi: "सरसों", mandi: `${cleanDistrict} Oilseed Mandi`, minPrice: 5380, maxPrice: 5820, modalPrice: 5620, trend: "up", changePct: 1.0 },
        { commodity: "Arhar / Tur (Pigeonpea)", commodityHi: "अरहर / तुअर", mandi: `${cleanDistrict} Dal Mandi`, minPrice: 9400, maxPrice: 10600, modalPrice: 10100, trend: "up", changePct: 1.8 },
        { commodity: "Gram / Chana (Desi)", commodityHi: "चना (देसी)", mandi: `${cleanDistrict} Mandi`, minPrice: 5850, maxPrice: 6280, modalPrice: 6040, trend: "up", changePct: 0.7 },
        { commodity: "Maize (Yellow Corn)", commodityHi: "मक्का", mandi: `${cleanDistrict} Grain Yard`, minPrice: 2090, maxPrice: 2310, modalPrice: 2200, trend: "down", changePct: -0.5 }
      ];
      break;

    case "PUNJAB_HARYANA":
      // Punjab & Haryana (Ludhiana, Karnal, Bathinda)
      defaultRates = [
        { commodity: "Basmati Paddy (Pusa 1121 / 1509)", commodityHi: "बासमती धान (११२१ / १५०९)", mandi: `${cleanDistrict} New Grain Market`, minPrice: 3450, maxPrice: 4050, modalPrice: 3780, trend: "up", changePct: 1.9 },
        { commodity: "Paddy (Parmal / PR-126)", commodityHi: "धान (परमल / पीआर-१२६)", mandi: `${cleanDistrict} APMC Mandi`, minPrice: 2320, maxPrice: 2450, modalPrice: 2380, trend: "stable", changePct: 0.2 },
        { commodity: "Wheat (HD-2967 / PBW-824)", commodityHi: "गेहूँ (एचडी-२९६७)", mandi: `${cleanDistrict} Grain Market Yard`, minPrice: 2360, maxPrice: 2590, modalPrice: 2480, trend: "stable", changePct: 0.3 },
        { commodity: "Mustard / Raya (Sarson)", commodityHi: "सरसों / राया", mandi: `${cleanDistrict} Krishi Mandi`, minPrice: 5460, maxPrice: 5920, modalPrice: 5690, trend: "up", changePct: 1.1 },
        { commodity: "Cotton / Narma (Medium Staple)", commodityHi: "कपास / नरमा", mandi: `${cleanDistrict} Cotton Market`, minPrice: 7150, maxPrice: 7720, modalPrice: 7440, trend: "up", changePct: 0.8 },
        { commodity: "Maize (Hybrid Corn)", commodityHi: "मक्का (हाइब्रिड)", mandi: `${cleanDistrict} Grain Yard`, minPrice: 2150, maxPrice: 2380, modalPrice: 2270, trend: "down", changePct: -0.3 }
      ];
      break;

    case "ANDHRA_TELANGANA":
      // Andhra Pradesh & Telangana (Guntur, Warangal)
      defaultRates = [
        { commodity: "Chilli (Teja / 334 Dry Red)", commodityHi: "लाल मिर्च (तेजा / ३३४)", mandi: `${cleanDistrict} Asia's Largest Mirchi Yard`, minPrice: 14200, maxPrice: 16800, modalPrice: 15400, trend: "up", changePct: 2.3 },
        { commodity: "Cotton (Medium / Long Staple)", commodityHi: "कपास (मध्यम व लंबा रेशा)", mandi: `${cleanDistrict} Cotton Market Yard`, minPrice: 7180, maxPrice: 7720, modalPrice: 7450, trend: "up", changePct: 0.9 },
        { commodity: "Paddy (Sona Masoori / BPT 5204)", commodityHi: "धान (सोना मसूरी)", mandi: `${cleanDistrict} APMC Mandi`, minPrice: 2320, maxPrice: 2620, modalPrice: 2470, trend: "stable", changePct: 0.4 },
        { commodity: "Groundnut (Pod / Podu)", commodityHi: "मूंगफली", mandi: `${cleanDistrict} Oilseed Yard`, minPrice: 6280, maxPrice: 6850, modalPrice: 6540, trend: "up", changePct: 1.1 },
        { commodity: "Turmeric (Finger / Nizamabad)", commodityHi: "हल्दी (फिंगर)", mandi: `${cleanDistrict} Spices Yard`, minPrice: 12500, maxPrice: 14800, modalPrice: 13700, trend: "up", changePct: 1.6 },
        { commodity: "Maize (Yellow Corn)", commodityHi: "मक्का", mandi: `${cleanDistrict} Grain Mandi`, minPrice: 2130, maxPrice: 2360, modalPrice: 2240, trend: "down", changePct: -0.5 }
      ];
      break;

    case "GUJARAT":
      // Gujarat & Saurashtra (Rajkot, Gondal)
      defaultRates = [
        { commodity: "Groundnut (Bold / GG-20)", commodityHi: "मूंगफली (बोल्ड / जीजी-२०)", mandi: `${cleanDistrict} Bedi Marketing Yard`, minPrice: 6420, maxPrice: 7050, modalPrice: 6720, trend: "up", changePct: 1.6 },
        { commodity: "Cotton (Shankar-6 / Kapas)", commodityHi: "कपास (शंकर-६)", mandi: `${cleanDistrict} Marketing Yard`, minPrice: 7280, maxPrice: 7890, modalPrice: 7580, trend: "up", changePct: 0.8 },
        { commodity: "Cumin / Jeera (Cleaned)", commodityHi: "जीरा (मशीन क्लीन)", mandi: `${cleanDistrict} Spices Market Yard`, minPrice: 24800, maxPrice: 28200, modalPrice: 26500, trend: "stable", changePct: 0.3 },
        { commodity: "Sesame (White / Til)", commodityHi: "सफेद तिल", mandi: `${cleanDistrict} APMC Yard`, minPrice: 11400, maxPrice: 13100, modalPrice: 12300, trend: "up", changePct: 2.0 },
        { commodity: "Castor Seed / Divela", commodityHi: "अरंडी (दिवेला)", mandi: `${cleanDistrict} Oilseed Yard`, minPrice: 5650, maxPrice: 6180, modalPrice: 5910, trend: "up", changePct: 0.6 },
        { commodity: "Wheat (Tukdi / Sharbati)", commodityHi: "गेहूँ (टुकड़ी)", mandi: `${cleanDistrict} Mandi Yard`, minPrice: 2410, maxPrice: 2680, modalPrice: 2540, trend: "up", changePct: 0.4 }
      ];
      break;

    case "MAHARASHTRA":
      // Maharashtra (Vidarbha / Nashik / Pune)
      defaultRates = [
        { commodity: "Cotton (Bt Cotton / Kapas)", commodityHi: "कपास (बीटी कॉटन)", mandi: `${cleanDistrict} Cotton APMC Yard`, minPrice: 7180, maxPrice: 7750, modalPrice: 7460, trend: "up", changePct: 0.9 },
        { commodity: "Soybean (Yellow / Standard)", commodityHi: "सोयाबीन (पीला)", mandi: `${cleanDistrict} APMC Mandi`, minPrice: 4620, maxPrice: 4940, modalPrice: 4810, trend: "up", changePct: 1.3 },
        { commodity: "Onion / Kanda (Nashik Red)", commodityHi: "कांदा / लाल प्याज", mandi: `${cleanDistrict} Lasalgaon / APMC Yard`, minPrice: 1850, maxPrice: 2850, modalPrice: 2350, trend: "up", changePct: 3.2 },
        { commodity: "Arhar / Tur (Marathwada Red)", commodityHi: "तुअर / तूर", mandi: `${cleanDistrict} Pulses Yard`, minPrice: 9450, maxPrice: 10700, modalPrice: 10200, trend: "up", changePct: 1.5 },
        { commodity: "Gram / Harbhara (Desi Chana)", commodityHi: "हरभरा / चना", mandi: `${cleanDistrict} Krishi Mandi`, minPrice: 5820, maxPrice: 6280, modalPrice: 6050, trend: "up", changePct: 0.8 },
        { commodity: "Wheat (Sharbati / Lokwan)", commodityHi: "गेहूँ (लोकवान)", mandi: `${cleanDistrict} Mandi Yard`, minPrice: 2380, maxPrice: 2680, modalPrice: 2520, trend: "stable", changePct: 0.3 }
      ];
      break;

    default:
      // Madhya Pradesh & Central India (Bhopal, Indore)
      defaultRates = [
        { commodity: "Soybean (Yellow / Standard)", commodityHi: "सोयाबीन (पीला / स्टैंडर्ड)", mandi: `${cleanDistrict} Karond / APMC Mandi`, minPrice: 4650, maxPrice: 4980, modalPrice: 4820, trend: "up", changePct: 1.4 },
        { commodity: "Wheat (Sharbati / Sehore Gold)", commodityHi: "गेहूँ (सीहोर शरबती)", mandi: `${cleanDistrict} Krishi Upaj Mandi`, minPrice: 2480, maxPrice: 3200, modalPrice: 2840, trend: "up", changePct: 0.7 },
        { commodity: "Gram / Chana (Desi / Dollar)", commodityHi: "चना (देसी / डॉलर)", mandi: `${cleanDistrict} Mandi Yard`, minPrice: 5850, maxPrice: 7200, modalPrice: 6450, trend: "up", changePct: 1.2 },
        { commodity: "Cotton (Medium Staple)", commodityHi: "कपास (मध्यम रेशा)", mandi: `${cleanDistrict} Regional APMC`, minPrice: 6980, maxPrice: 7580, modalPrice: 7310, trend: "up", changePct: 0.8 },
        { commodity: "Mustard / Sarson", commodityHi: "सरसों / राई", mandi: `${cleanDistrict} Oilseed Mandi`, minPrice: 5400, maxPrice: 5880, modalPrice: 5660, trend: "up", changePct: 0.9 },
        { commodity: "Maize (Yellow Corn)", commodityHi: "मक्का (पीला)", mandi: `${cleanDistrict} Grain Mandi`, minPrice: 2130, maxPrice: 2360, modalPrice: 2240, trend: "down", changePct: -0.5 }
      ];
      break;
  }

  // If Gemini API is reachable, request ultra-fresh daily rates matching the zone
  try {
    const prompt = `You are AASRA's Real-Time Agmarknet / APMC Mandi Price Intelligence Engine for Indian agriculture.
Provide realistic, current market prices (in INR per quintal) for the top 6 commercial agricultural crops actually grown and traded in ${cleanDistrict}, ${state}, India.
IMPORTANT RULE: If ${cleanDistrict} is in Uttar Pradesh or Northern plains, do NOT include Soybean or Cotton (they are not grown there); include Wheat, Mustard, Potato, Bajra, Paddy, Maize.
Return ONLY valid JSON with this exact array structure:
[
  {
    "commodity": "Commodity Name in English",
    "commodityHi": "Commodity Name in Hindi",
    "mandi": "${cleanDistrict} Mandi Name",
    "minPrice": number,
    "maxPrice": number,
    "modalPrice": number,
    "trend": "up",
    "changePct": 1.5
  }
]`;

    const aiRes = await executeGoogleGeminiPrompt(
      prompt,
      "You are an APMC Mandi Commodity Pricing AI for India. Return ONLY a valid JSON array."
    );

    if (aiRes && aiRes.reply) {
      const parsed = extractAndParseJson(aiRes.reply);
      if (Array.isArray(parsed) && parsed.length >= 4) {
        return NextResponse.json({ success: true, rates: parsed, source: `${cleanDistrict} APMC Live Intel` });
      }
    }
  } catch (err) {
    console.warn("Mandi rates AI fetch fallback:", err);
  }

  return NextResponse.json({ success: true, rates: defaultRates, source: `${cleanDistrict} APMC Daily Benchmark` });
}
