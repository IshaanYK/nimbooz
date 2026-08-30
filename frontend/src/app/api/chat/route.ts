import { NextRequest, NextResponse } from "next/server";
import { executeGoogleGeminiPrompt, fetchLiveAgronomicTelemetry } from "@/lib/geminiEngine";
import { findCropMandiRate } from "@/lib/mandiEngine";

const LANGUAGE_NAMES: Record<string, string> = {
  hi: "Hindi (हिन्दी)",
  mr: "Marathi (मराठी)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  gu: "Gujarati (ગુજરાતી)",
  te: "Telugu (తెలుగు)",
  ta: "Tamil (தமிழ்)",
  kn: "Kannada (ಕನ್ನಡ)",
  ml: "Malayalam (മലയാളം)",
  bn: "Bengali (বাংলা)",
  or: "Odia (ଓଡ଼ିଆ)",
  as: "Assamese (অসমীया)",
  en: "English",
};

function buildFallbackReply(
  message: string, district: string, crop: string,
  temp: number, nightTemp: number, soilMoisture: number,
  windSpeed: number, acresNum: number, dosePerAcreMl: number, language: string
): string {
  const q = message.toLowerCase();
  const isHi = language === "hi";

  // Real APMC Mandi Price Lookup
  if (q.match(/mandi|price|bhav|rate|भाव|मूल्य|दाम|सोयाबीन|गेहूं|गेहूँ|कपास|सरसों|प्याज|आलू|चना|मक्का|धान|wheat|onion|cotton|mustard|soybean|soyabean/)) {
    const m = findCropMandiRate(message || crop, district);
    return isHi
      ? `${m.mandi} में आज ${m.commodityHi} का मॉडल भाव ₹${m.modalPrice.toLocaleString("en-IN")} प्रति क्विंटल (दायरा: ₹${m.minPrice.toLocaleString("en-IN")} - ₹${m.maxPrice.toLocaleString("en-IN")}/क्विंटल) है।`
      : `In ${m.mandi} today, ${m.commodity} modal price is ₹${m.modalPrice.toLocaleString("en-IN")}/quintal (Range: ₹${m.minPrice.toLocaleString("en-IN")} – ₹${m.maxPrice.toLocaleString("en-IN")}/q).`;
  }

  if (q.match(/weather|rain|temperature|wind|मौसम|बारिश|तापमान|humidity/)) {
    return isHi
      ? `${district} में अभी: तापमान ${temp}°C, रात ${nightTemp}°C, हवा ${windSpeed} km/h, मिट्टी नमी ${soilMoisture}%।`
      : `${district} live: ${temp}°C, night ${nightTemp}°C, wind ${windSpeed} km/h, soil moisture ${soilMoisture}%.`;
  }

  if (q.match(/spray|dose|dosage|छिड़काव|खुराक|दवा|कितना/)) {
    const totalDose = Math.round(dosePerAcreMl * acresNum);
    const waterL = Math.round(175 * acresNum);
    return isHi
      ? `${acresNum} एकड़ के लिए: ${dosePerAcreMl} ml/एकड़ × ${acresNum} = ${totalDose} ml दवा, ${waterL} L पानी। सुबह 6–9 या शाम 5–7 बजे छिड़काव करें।`
      : `For ${acresNum} acres: ${dosePerAcreMl} ml/acre × ${acresNum} = ${totalDose} ml in ${waterL} L water. Spray 6–9 AM or 5–7 PM.`;
  }

  if (q.match(/risk|disease|danger|problem|खतरा|रोग|बीमारी|biggest/)) {
    if (nightTemp > 25) {
      return isHi
        ? `${district} में सबसे बड़ा खतरा: रात का तापमान ${nightTemp}°C — यह ${crop} में heat stress से फूल झड़ने का कारण बन सकता है।`
        : `Biggest risk in ${district}: night temperature ${nightTemp}°C causing heat stress and potential flower drop in ${crop}.`;
    }
    if (soilMoisture < 30) {
      return isHi
        ? `मिट्टी नमी ${soilMoisture}% बहुत कम है — ${district} में आपकी ${crop} को drought stress का खतरा है। सिंचाई करें।`
        : `Soil moisture ${soilMoisture}% is critically low — drought stress risk for ${crop} in ${district}. Irrigate now.`;
    }
    if (windSpeed > 15) {
      return isHi
        ? `हवा ${windSpeed} km/h — छिड़काव में drift का खतरा। हवा 10 km/h से कम होने पर ही छिड़काव करें।`
        : `Wind ${windSpeed} km/h — high spray drift risk in ${district}. Wait until wind drops below 10 km/h.`;
    }
    return isHi
      ? `${district} में अभी ${crop} की स्थिति सामान्य (${temp}°C, नमी ${soilMoisture}%)। मुख्य खतरा: कीट और पत्ती रोग — साप्ताहिक निगरानी करें।`
      : `Conditions in ${district} are normal for ${crop} (${temp}°C, moisture ${soilMoisture}%). Main risk: pest and leaf disease — monitor weekly.`;
  }

  if (q.match(/irrigat|water|सिंचाई|पानी देना/)) {
    return isHi
      ? `मिट्टी नमी ${soilMoisture}%${soilMoisture < 35 ? " — सिंचाई की जरूरत है।" : " — अभी पर्याप्त है, 3–4 दिन बाद जांचें।"}`
      : `Soil moisture ${soilMoisture}%${soilMoisture < 35 ? " — irrigation needed now." : " — sufficient, check again in 3–4 days."}`;
  }

  return isHi
    ? `${district} में अभी: ${temp}°C, मिट्टी नमी ${soilMoisture}%। कृपया प्रश्न और स्पष्ट करें।`
    : `${district} live: ${temp}°C, soil moisture ${soilMoisture}%. Please rephrase your question.`;
}

export async function POST(req: NextRequest) {
  let reqLang = "hi";
  try {
    const body = await req.json();
    const {
      message = "",
      crop = "soybean",
      language = "hi",
      night_temp = null,
      temperature = null,
      soil_moisture = null,
      lat = 23.2599,
      lon = 77.4126,
      farmer_name = "Farmer",
      field_acres = 5.0,
      crop_variety = "Standard Variety",
      district = "Local District",
      village = "",
      state = "",
    } = body;

    reqLang = language;
    const targetLangName = LANGUAGE_NAMES[language] || "Hindi (हिन्दी)";
    const acresNum = Number(field_acres) || 5.0;

    // 1. Fetch Real Live Telemetry & Real APMC Mandi Data FIRST
    const telemetry = await fetchLiveAgronomicTelemetry(Number(lat) || 23.2599, Number(lon) || 77.4126, crop);

    const activeTemp = temperature != null ? Number(temperature) : telemetry.temp;
    const activeNightTemp = night_temp != null ? Number(night_temp) : telemetry.nightTemp;
    const activeSoil = soil_moisture != null ? Number(soil_moisture) : telemetry.soilMoisture;

    const mandiInfo = findCropMandiRate(message || crop, district, state, {
      temp: activeTemp,
      nightTemp: activeNightTemp,
      soilMoisture: activeSoil,
      windSpeed: telemetry.windSpeed,
      isNightHeatStress: activeNightTemp > 25.0,
      isRaining: false,
    });
    const dosePerAcreMl = 250;
    const totalDoseLiters = Math.round((dosePerAcreMl * acresNum) / 100) / 10;
    const waterLiters = Math.round(175 * acresNum);

    // 2. Build Gemini prompt with live telemetry & real mandi rates injected
    const prompt = `You are AASRA, an ultra-precise AI Agronomist for Indian farmers.

REAL-TIME DATA INVENTORY:
- Location: ${village ? village + ", " : ""}${district} (${lat}, ${lon})
- Live Weather: Temp ${activeTemp}°C, Night ${activeNightTemp}°C${activeNightTemp > 25 ? " (Heat stress active)" : ""}, Soil Moisture ${activeSoil}%, Wind ${telemetry.windSpeed} km/h
- Real APMC Mandi Rates for ${district}:
  * Commodity: ${mandiInfo.commodityHi} (${mandiInfo.commodity})
  * APMC Mandi: ${mandiInfo.mandi}
  * Modal Price: ₹${mandiInfo.modalPrice}/quintal (Range: ₹${mandiInfo.minPrice} - ₹${mandiInfo.maxPrice}/q)
  * Daily Trend: ${mandiInfo.trend.toUpperCase()} (${mandiInfo.changePct > 0 ? "+" : ""}${mandiInfo.changePct}%)

FARMER:
- Name: ${farmer_name}, Crop: ${crop} (${crop_variety}), ${acresNum} acres
- Dosage spec: ${dosePerAcreMl} ml/acre (${totalDoseLiters} L in ${waterLiters} L water)

QUESTION: "${message}"

RULES — STRICTLY ENFORCED:
1. Answer ONLY what the farmer asked. Use the real numbers from the data inventory above.
2. If asked about Mandi rate / Price / Bhav: State ONLY the current modal price (₹${mandiInfo.modalPrice}/quintal) and range (₹${mandiInfo.minPrice}-₹${mandiInfo.maxPrice}/q) at ${mandiInfo.mandi}. 1 concise sentence.
3. If asked about Weather: State ONLY current conditions for ${district}.
4. If asked about Spray / Dose: State ONLY ${dosePerAcreMl} ml/acre in ${waterLiters} L water.
5. If the request is incomplete or requires additional detail (e.g. disease without symptom description or photo), ask a targeted clarifying question without guessing.
6. Max 2 sentences total. No filler, no unsolicited advice, no greetings.
7. Language: ${targetLangName}.

Return strictly JSON:
{"reply":"exact answer in ${targetLangName}","confidence_score":98}`;

    let replyText: string | null = null;
    let confidenceScore = 95;

    try {
      const geminiResult = await executeGoogleGeminiPrompt(
        prompt,
        "Output strictly valid JSON only. No markdown, no explanation, just the JSON object."
      );

      const r = geminiResult?.data?.reply;
      if (r && typeof r === "string" && r.trim().length > 5) {
        replyText = r.trim();
        confidenceScore = geminiResult.data.confidence_score || 97;
      }
    } catch (geminiErr) {
      console.warn("[Chat] Gemini call failed:", geminiErr);
    }

    // 4. Rule-based fallback using live telemetry
    if (!replyText) {
      replyText = buildFallbackReply(
        message, district, crop,
        activeTemp, activeNightTemp, activeSoil,
        telemetry.windSpeed, acresNum, dosePerAcreMl, language
      );
      confidenceScore = 88;
    }

    // 5. Only return dosage card for spray questions
    const isSprayQ = /spray|dose|dosage|छिड़काव|खुराक|दवा/i.test(message);

    return NextResponse.json({
      reply: replyText,
      why_recommendation: "",
      dosage_summary: isSprayQ ? `${dosePerAcreMl} ml/acre (${totalDoseLiters} L for ${acresNum} acres)` : "",
      total_profit_gain: "",
      confidence_score: confidenceScore,
      follow_up_questions: [],
      model_used: "Gemini 2.5 Flash",
      telemetry_used: {
        temp: activeTemp,
        nightTemp: activeNightTemp,
        soilMoisture: activeSoil,
        windSpeed: telemetry.windSpeed,
        location: district,
      },
    });
  } catch (err: any) {
    console.warn("Chat route exception:", err);
    return NextResponse.json({
      reply: reqLang === "hi"
        ? "तकनीकी समस्या। कृपया फिर पूछें।"
        : "Technical issue. Please ask again.",
      why_recommendation: "",
      dosage_summary: "",
      total_profit_gain: "",
      confidence_score: 80,
      follow_up_questions: [],
    });
  }
}


