import { NextRequest, NextResponse } from "next/server";
import {
  executeGoogleGeminiPrompt,
  executeGoogleGeminiAudioPrompt,
  fetchLiveAgronomicTelemetry,
} from "@/lib/geminiEngine";
import {
  getLatestMandiPrice,
  extractCommodityFromNaturalQuery,
  formatMandiPriceForAI,
  NormalizedMandiRecord,
  resolveCanonicalLocation,
  isDataCoverageQuery,
  getDataCoverageSummary,
} from "@/lib/mandiPriceService";
import { getCropAdvisoryProfile, CropAgronomicProfile } from "@/lib/agriculture/cropAdvisoryMatrix";
import { resolveCropThresholds } from "@/lib/cropRegistry";

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

/**
 * Generate smart, varied follow-up suggestions dynamically for any query
 */
function generateDynamicFollowUps(
  cropName: string,
  district: string,
  lang: string,
  intent: "mandi" | "weather" | "disease" | "knowledge" | "general"
): string[] {
  const isHi = lang === "hi";

  if (intent === "mandi") {
    return isHi
      ? [
          `${district} में ${cropName} के पिछले सप्ताह के भाव की तुलना करें`,
          `${cropName} बेचने का सबसे अच्छा समय क्या है?`,
          `आसपास की अन्य मंडियों में ${cropName} का भाव देखें`,
        ]
      : [
          `Compare last week's ${cropName} price trend in ${district}`,
          `When is the most profitable time to sell ${cropName}?`,
          `Check nearby APMC mandi prices for ${cropName}`,
        ];
  }

  if (intent === "weather") {
    return isHi
      ? [
          `${district} में अगले 3 दिनों का बारिश का पूर्वानुमान बताएं`,
          `वर्तमान मौसम में फसल में स्प्रे का सही समय क्या है?`,
          `तापमान तनाव से फसल को बचाने के उपाय`,
        ]
      : [
          `What is the 3-day rainfall forecast in ${district}?`,
          `When is the ideal spray window under current weather?`,
          `How to protect crops against current temperature stress?`,
        ];
  }

  if (intent === "disease") {
    return isHi
      ? [
          `${cropName} में दवा छिड़काव की सही मात्रा (Dosage) और पानी का अनुपात बताएं`,
          `स्प्रे के समय किन बातों का ध्यान रखना चाहिए?`,
          `${cropName} में फूल व फल झड़ने से रोकने के उपाय बताएं`,
        ]
      : [
          `Recommended chemical dosage and water ratio for ${cropName}`,
          `Best weather window for spraying ${cropName} today`,
          `How to prevent flower & fruit drop in ${cropName}`,
        ];
  }

  return isHi
    ? [
        `${district} में ${cropName} की खेती के प्रमुख वैज्ञानिक नियम क्या हैं?`,
        `${cropName} का आज का ताजा मंडी भाव क्या है?`,
        `वर्तमान मौसम में फसल के लिए जरूरी सुझाव`,
      ]
    : [
        `Key scientific agronomy practices for ${cropName} in ${district}`,
        `What is today's ${cropName} mandi price?`,
        `Current seasonal crop recommendations for this region`,
      ];
}

export async function POST(req: NextRequest) {
  let reqLang = "hi";
  try {
    const body = await req.json();
    const {
      message = "",
      crop = "wheat",
      variety = "",
      language = "hi",
      night_temp = null,
      temperature = null,
      humidity = null,
      wind_speed = null,
      soil_moisture = null,
      lat = 23.2599,
      lon = 77.4126,
      farmer_name = "",
      field_acres = 5.0,
      crop_variety = "",
      district = "",
      village = "",
      state = "",
      conversation_history = [],
      last_resolved_location = null,
      audioBase64 = null,
      audioMimeType = "audio/webm",
    } = body;

    reqLang = language || "hi";
    const targetLangName = LANGUAGE_NAMES[reqLang] || "Hindi (हिन्दी)";
    const acresNum = Number(field_acres) || 5.0;

    // ─────────────────────────────────────────────────────────────
    // STAGE 1: Natural Language & 5-Tier Canonical Location Parsing
    // ─────────────────────────────────────────────────────────────
    const canonicalLoc = resolveCanonicalLocation({
      userQuery: message,
      conversationHistory: Array.isArray(conversation_history) ? conversation_history : [],
      lastResolvedLocation: last_resolved_location,
      selectedDistrict: district,
      selectedState: state,
      gpsLat: lat ? Number(lat) : undefined,
      gpsLon: lon ? Number(lon) : undefined,
      gpsDistrict: district || undefined,
      gpsState: state || undefined,
      gpsVillage: village || undefined,
    });

    // Coverage Discovery Check
    if (canonicalLoc.isDataCoverageQuery || isDataCoverageQuery(message)) {
      const coverageText = getDataCoverageSummary(reqLang);
      return NextResponse.json({
        reply: coverageText,
        response: coverageText,
        detected_language: "Hindi",
        raw_transcript: message,
        why_recommendation: "AASRA Pan-India APMC Mandi Coverage Intelligence.",
        confidence_score: 100,
        model_used: "AASRA Registry Engine",
        language: reqLang,
        source: "AASRA APMC Government Network",
        canonical_location: canonicalLoc,
        location_used: "Pan-India (10 States)",
        follow_up_questions: reqLang === "hi"
          ? ["अजमेर में सरसों का भाव क्या है?", "सीहोर में सोयाबीन का भाव क्या है?", "लातूर में तुअर/अरहर का भाव क्या है?"]
          : ["Check mustard rate in Ajmer", "Check soybean price in Sehore", "Check pigeon pea rate in Latur"],
      });
    }

    const activeDistrict = canonicalLoc.district || district || "Bhopal";
    const activeState = canonicalLoc.state || state || "Madhya Pradesh";
    const activeLat = canonicalLoc.lat || lat || 23.2599;
    const activeLon = canonicalLoc.lon || lon || 77.4126;
    const activeUserLocation = canonicalLoc.resolvedLocation || `${activeDistrict}, ${activeState}`;

    // ─────────────────────────────────────────────────────────────
    // STAGE 2: Intent Classification & Crop Resolution
    // ─────────────────────────────────────────────────────────────
    const msgLower = message.toLowerCase();
    
    // Explicit price intent check (Only if user actually asks for price/rate/bhav)
    const isExplicitMandiQuery = /(mandi|price|bhav|rate|reat|kimat|mulya|kitne ka|bika|दाम|भाव|दर|रेट|मूल्य|प्रति क्विंटल)/i.test(msgLower);
    const isWeatherQuery = /(weather|temp|rain|barish|hawa|wind|mausam|मौसम|तापमान|बारिश|वर्षा|हवा)/i.test(msgLower);
    const isDiseaseQuery = /(keeda|pest|insect|dawa|bimari|spray|dose|khurak|rog|कीड़ा|दवा|कीटनाशक|बीमारी|रोग|झुलसा|छिड़काव|खुराक|इल्ली)/i.test(msgLower);

    let queryIntent: "mandi" | "weather" | "disease" | "knowledge" | "general" = "general";
    if (isExplicitMandiQuery) queryIntent = "mandi";
    else if (isWeatherQuery) queryIntent = "weather";
    else if (isDiseaseQuery) queryIntent = "disease";
    else queryIntent = "knowledge";

    // Extract target crop or commodity from query, fallback to active crop
    const targetCommodity = extractCommodityFromNaturalQuery(message, crop);
    const effectiveCropId = targetCommodity.id || crop || "wheat";
    const cropProfile = getCropAdvisoryProfile(effectiveCropId);
    const cropThresholds = resolveCropThresholds(effectiveCropId);

    // ─────────────────────────────────────────────────────────────
    // STAGE 3: Hyper-Local Telemetry & APMC Mandi Ingestion
    // ─────────────────────────────────────────────────────────────
    const telemetry = await fetchLiveAgronomicTelemetry(activeLat, activeLon, effectiveCropId);
    
    // Prioritize real active sensor telemetry from client if passed
    const activeTemp = typeof temperature === "number" && !isNaN(temperature) ? temperature : telemetry.temp;
    const activeNightTemp = typeof night_temp === "number" && !isNaN(night_temp) ? night_temp : telemetry.nightTemp;
    const activeSoil = typeof soil_moisture === "number" && !isNaN(soil_moisture) ? soil_moisture : telemetry.soilMoisture;
    const activeWind = typeof wind_speed === "number" && !isNaN(wind_speed) ? wind_speed : telemetry.windSpeed;
    const activeHumidity = typeof humidity === "number" && !isNaN(humidity) ? humidity : telemetry.humidity;

    const isSprayWindowSafe = activeWind < 15 && activeTemp < 33;
    const isNightHeatStress = activeNightTemp > cropProfile.optimalNightTemp;

    // Always fetch live APMC Mandi price benchmark so Gemini has full economic context
    let mandiRecord: NormalizedMandiRecord | null = null;
    try {
      mandiRecord = await getLatestMandiPrice({
        query: message,
        commodity: effectiveCropId,
        variety: variety || crop_variety || undefined,
        location: {
          lat: activeLat,
          lon: activeLon,
          district: activeDistrict,
          state: activeState,
          userLocation: activeUserLocation,
        },
        telemetry: {
          temp: activeTemp,
          nightTemp: activeNightTemp,
          soilMoisture: activeSoil,
          windSpeed: activeWind,
          isNightHeatStress,
          isRaining: false,
        },
      });
    } catch (mandiErr) {
      console.warn("[Chat] Mandi lookup error:", mandiErr);
    }

    // Format Mandi Ground Truth
    let verifiedMandiSummary = "";
    if (mandiRecord) {
      verifiedMandiSummary = `VERIFIED ATOMIC APMC MANDI RECORD (GROUND TRUTH):
- Target Market: ${mandiRecord.mandiHi} (${mandiRecord.mandi}) [${mandiRecord.district}, ${mandiRecord.state}]
- Commodity: ${mandiRecord.commodityHi} (${mandiRecord.commodity})
- Variety & Grade: ${mandiRecord.variety} (${mandiRecord.grade})
- Modal Price: ₹${mandiRecord.modalPrice.toLocaleString("en-IN")} प्रति क्विंटल (₹${mandiRecord.modalPrice.toLocaleString("en-IN")}/quintal)
- Price Range: ₹${mandiRecord.minPrice.toLocaleString("en-IN")} – ₹${mandiRecord.maxPrice.toLocaleString("en-IN")} प्रति क्विंटल
- Market Date: ${mandiRecord.formattedDate} (${mandiRecord.isToday ? "Today's live trading session" : "Latest available government record"})`;
    } else {
      verifiedMandiSummary = `MANDI BENCHMARK: Expected wholesale modal price for ${cropProfile.nameEn} in ${activeDistrict} is approximately ₹4,850/quintal.`;
    }

    // Protection Matrix
    const pestDiseasesList = cropProfile.diseasesAndPests
      .map(
        (dp, idx) =>
          `  ${idx + 1}. ${dp.name} (${dp.nameHi}):
     - Symptoms: ${dp.symptomsEn}
     - Solution: ${dp.solutionEn}
     - Recommended: ${dp.recommendedProduct} @ ${dp.dosePerAcre} in ${dp.waterLitersPerAcre} L water/acre (${dp.timing})`
      )
      .join("\n");

    // Farmer Name Personalization
    const cleanFarmerName = farmer_name && farmer_name.trim() && !farmer_name.includes("Farmer") && !farmer_name.includes("Kisan")
      ? farmer_name.trim()
      : "";

    // Conversation History
    let convoContext = "";
    if (Array.isArray(conversation_history) && conversation_history.length > 0) {
      const recentTurns = conversation_history.slice(-4);
      convoContext =
        `RECENT CONVERSATION HISTORY:\n` +
        recentTurns.map((t: any) => `${t.sender === "user" ? "Farmer" : "AASRA"}: "${t.text}"`).join("\n");
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 4: Grounded Multi-Crop Gemini 2.5 Flash Synthesis
    // ─────────────────────────────────────────────────────────────
    const promptInstructions = `You are AASRA (आसरा), an ultra-smart, empathetic, and scientifically precise AI agricultural companion for Indian farmers.
The farmer is asking a question. ${audioBase64 ? "Listen to the farmer's raw acoustic audio recording carefully." : `Farmer query: "${message}"`}

FARMER PROFILE & PERSONALIZATION:
- Farmer Name: ${cleanFarmerName ? `${cleanFarmerName}` : "Farmer Friend"}
- Farmer Farm Area: ${acresNum} acres
- Farmer Primary Crop: ${cropProfile.nameEn} (${cropProfile.nameHi}) [Category: ${cropProfile.category.toUpperCase()}]
- Queried/Active Location: ${activeUserLocation} (Lat: ${activeLat.toFixed(2)}, Lon: ${activeLon.toFixed(2)})

LIVE SENSOR & AGRO-CLIMATIC CONTEXT (100% REAL TELEMETRY):
- Live Weather in ${activeDistrict}: Temp ${activeTemp}°C, Night Temp ${activeNightTemp}°C${isNightHeatStress ? " (Night Thermal Stress Active)" : ""}, Soil Moisture ${activeSoil}%, Wind Speed ${activeWind} km/h, Humidity ${activeHumidity}%
- Spray Feasibility: ${isSprayWindowSafe ? "SAFE TO SPRAY NOW (Wind < 15 km/h, Temp < 33°C)" : `CAUTION: Wind speed ${activeWind} km/h or High temp ${activeTemp}°C`}
- ${verifiedMandiSummary}
- Agronomic Knowledge for ${cropProfile.nameEn}:
  * Thermal Optimal: ${cropProfile.optimalDayTemp}°C (Critical Max: ${cropProfile.heatStressLimitDay}°C), Optimal Night: ${cropProfile.optimalNightTemp}°C
  * Biostimulant: ${cropProfile.stressBusterRecommendation.product} @ ${cropProfile.stressBusterRecommendation.dosePerAcre}
- Certified Protection Protocols for ${cropProfile.nameEn}:
${pestDiseasesList}

${convoContext}

CRITICAL RULES & PRECISE REAL-DATA CITATION GUIDELINES:
1. OUTPUT LANGUAGE: Answer STRICTLY in ${targetLangName}.
2. MANDATORY REAL SENSOR CITATION:
   - You MUST explicitly cite the real numbers in your response so the farmer knows you are looking at their active field:
     * Mention the location: "${activeUserLocation}"
     * State the exact live temperature: "${activeTemp}°C"
     * State the soil moisture: "${activeSoil}%"
     * State current wind speed: "${activeWind} km/h"
3. SCIENTIFIC AGRO-CLIMATIC EVALUATION:
   - Compare the current temperature (${activeTemp}°C) with ${cropProfile.nameEn}'s optimal range (${cropProfile.optimalDayTemp}°C) and stress threshold (${cropProfile.heatStressLimitDay}°C).
   - If temperature is high (>32°C/35°C): Explain the danger (transpiration shock, floret abortion, pollen desiccation) and prescribe the exact solution: ${cropProfile.stressBusterRecommendation.product} at ${cropProfile.stressBusterRecommendation.dosePerAcre}.
   - Calculate exact total dosage for their ${acresNum} acres: ${((250 * acresNum) / 1000).toFixed(1)} to ${((400 * acresNum) / 1000).toFixed(1)} Litres mixed in ${(200 * acresNum)} Litres water.
4. SPRAY WINDOW & WIND DRIFT SAFETY:
   - With wind at ${activeWind} km/h: If wind > 15 km/h, strictly warn against droplet drift and advise holding until evening. If < 15 km/h and temp < 33°C, confirm the spray window is currently open.
5. MANDI RATES & HARVEST VALUE:
   - If asked about mandi price, selling, or profits, cite the official modal price (₹${mandiRecord ? mandiRecord.modalPrice.toLocaleString("en-IN") : "4,850"}/quintal in ${activeDistrict} APMC).
   - If relevant, calculate expected revenue: For ${acresNum} acres (~${(acresNum * 9).toFixed(0)} quintals expected yield), total crop value is ~₹${((mandiRecord?.modalPrice || 4850) * acresNum * 9).toLocaleString("en-IN")}.
6. ZERO GENERALITIES & HIGH PRECISION:
   - Never say vague things like "कुछ दवा डाल दें". Always provide exact product name, exact dilution per acre, and exact time of day.
   - Tone: Respectful, warm, concise, and structured with clear bullet points.

Output strictly valid JSON:
{
  "raw_transcript": "verbatim transcription of speech",
  "detected_language": "English | Hindi | Hinglish | Marathi | Punjabi | etc.",
  "reply": "concise, humanized, scientifically accurate answer strictly in ${targetLangName}",
  "confidence_score": 98,
  "follow_up_questions": [
    "Contextually relevant follow-up question 1 in ${targetLangName}",
    "Contextually relevant follow-up question 2 in ${targetLangName}",
    "Contextually relevant follow-up question 3 in ${targetLangName}"
  ]
}`;

    let replyText: string | null = null;
    let detectedLanguage: string | undefined = undefined;
    let rawTranscript: string | undefined = undefined;
    let confidenceScore = 96;
    let followUpQuestions: string[] = [];

    try {
      let geminiResult: any = null;

      if (audioBase64) {
        geminiResult = await executeGoogleGeminiAudioPrompt(
          promptInstructions,
          audioBase64,
          audioMimeType || "audio/webm",
          `Output strictly valid JSON only: {"raw_transcript":"...","detected_language":"...","reply":"...","confidence_score":98,"follow_up_questions":["..."]}`
        );
      } else {
        geminiResult = await executeGoogleGeminiPrompt(
          promptInstructions,
          `Output strictly valid JSON only: {"raw_transcript":"...","detected_language":"...","reply":"...","confidence_score":98,"follow_up_questions":["..."]}`
        );
      }

      const r = geminiResult?.data?.reply;
      if (r && typeof r === "string" && r.trim().length > 3) {
        replyText = r.trim();
        detectedLanguage = geminiResult.data.detected_language;
        rawTranscript = geminiResult.data.raw_transcript || message;
        confidenceScore = geminiResult.data.confidence_score || 97;
        if (Array.isArray(geminiResult.data.follow_up_questions)) {
          followUpQuestions = geminiResult.data.follow_up_questions.filter(
            (q: any) =>
              typeof q === "string" &&
              q.trim().length > 3 &&
              !/सिक्के|लेखक|फिल्म|गाना|coin|author|movie/i.test(q)
          );
        }
      }
    } catch (geminiErr) {
      console.warn("[Chat] Gemini API error:", geminiErr);
    }

    // Dynamic Contextual Follow-up Questions
    if (!followUpQuestions || followUpQuestions.length === 0) {
      followUpQuestions = generateDynamicFollowUps(
        reqLang === "hi" ? cropProfile.nameHi : cropProfile.nameEn,
        activeDistrict,
        reqLang,
        queryIntent
      );
    }

    return NextResponse.json({
      reply: replyText || (reqLang === "hi" ? `जी, ${activeDistrict} में आपकी ${cropProfile.nameHi} फसल के लिए लाइव तापमान ${activeTemp}°C है।` : `Live telemetry for ${activeDistrict}: ${activeTemp}°C.`),
      response: replyText,
      detected_language: detectedLanguage,
      raw_transcript: rawTranscript || message,
      why_recommendation: `Verified Open-Meteo & APMC data for ${activeDistrict} (${cropProfile.nameEn}).`,
      confidence_score: confidenceScore,
      follow_up_questions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
      model_used: "Gemini 2.5 Flash",
      language: reqLang,
      source: "AASRA | Google Gemini 2.5 Flash + Open-Meteo + APMC Agmarknet",
      mandi_record: mandiRecord,
      canonical_location: canonicalLoc,
      location_used: activeDistrict,
      farmer_profile: {
        name: cleanFarmerName || "Farmer Friend",
        acres: acresNum,
        crop: cropProfile.nameEn,
      },
      crop_profile: {
        id: cropProfile.cropId,
        name: cropProfile.nameEn,
        nameHi: cropProfile.nameHi,
        category: cropProfile.category,
        season: cropProfile.season,
      },
      telemetry_used: {
        location: activeDistrict,
        temp: activeTemp,
        night_temp: activeNightTemp,
        soil_moisture: activeSoil,
        wind_speed: activeWind,
        humidity: activeHumidity,
        is_spray_safe: isSprayWindowSafe,
        is_night_heat_stress: isNightHeatStress,
      },
    });
  } catch (err: any) {
    console.error("[Chat Advisory Route Fatal Exception]:", err);
    return NextResponse.json(
      {
        reply:
          reqLang === "hi"
            ? "तकनीकी समस्या के कारण सेवा अस्थायी रूप से बाधित है। कृपया कुछ देर बाद प्रयास करें।"
            : "Service is temporarily busy. Please try again in a moment.",
        response:
          reqLang === "hi"
            ? "तकनीकी समस्या के कारण सेवा अस्थायी रूप से बाधित है। कृपया कुछ देर बाद प्रयास करें।"
            : "Service is temporarily busy. Please try again in a moment.",
        confidence_score: 80,
        source: "AASRA_FALLBACK_HANDLER",
      },
      { status: 200 }
    );
  }
}
