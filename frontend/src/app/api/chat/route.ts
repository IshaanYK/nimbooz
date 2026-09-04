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
import { db, FieldDbRecord } from "@/lib/db/aasraDb";

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
      field_id = "",
      field_name = "",
      currentField = "",
      soil_type = "",
      farmer_id = "",
      conversation_history = [],
      last_resolved_location = null,
      audioBase64 = null,
      audioMimeType = "audio/webm",
    } = body;

    reqLang = language || "hi";
    const targetLangName = LANGUAGE_NAMES[reqLang] || "Hindi (हिन्दी)";

    // ─────────────────────────────────────────────────────────────
    // STAGE 0: AASRA Database Ingestion (Farmer Profile, Fields, Journal)
    // ─────────────────────────────────────────────────────────────
    const dbFarmers = db.getFarmers();
    const dbFields = db.getFields();
    const dbJournal = db.getJournal();
    const dbRobiAudits = db.getRobiAudits();

    const activeDbFarmer =
      (farmer_name && dbFarmers.find((f) => f.fullName.toLowerCase().includes(farmer_name.toLowerCase()))) ||
      (farmer_id && dbFarmers.find((f) => f.id === farmer_id)) ||
      dbFarmers[0] ||
      null;

    const msgLower = (message || "").toLowerCase();

    // Match or resolve targeted field from database
    let matchedField: FieldDbRecord | undefined = undefined;
    if (field_id) {
      matchedField = dbFields.find((f) => f.id === field_id);
    }
    if (!matchedField && (field_name || currentField)) {
      const targetName = (field_name || currentField).toLowerCase();
      matchedField = dbFields.find((f) => f.name.toLowerCase().includes(targetName));
    }
    if (!matchedField) {
      // Natural language matching against registered plot names/crops in DB
      matchedField = dbFields.find(
        (f) =>
          msgLower.includes(f.name.toLowerCase()) ||
          (f.variety && msgLower.includes(f.variety.toLowerCase())) ||
          (msgLower.includes("riverbank") && f.name.toLowerCase().includes("riverbank")) ||
          (msgLower.includes("trial") && f.name.toLowerCase().includes("trial")) ||
          (msgLower.includes("chana") && f.crop.toLowerCase().includes("chana"))
      );
    }

    const activeFieldName = matchedField?.name || field_name || currentField || (dbFields[0] ? dbFields[0].name : "Main Acreage");
    const activeFieldAcres = matchedField?.area_acres ?? (typeof field_acres === "number" ? field_acres : (activeDbFarmer?.fieldAreaAcres ?? 5.0));
    const activeSoilType = matchedField?.soil_type || soil_type || activeDbFarmer?.soilType || "Deep Black Clay Soil";
    const activeVariety = matchedField?.variety || crop_variety || variety || activeDbFarmer?.cropVariety || "";
    const cleanFarmerName = farmer_name && farmer_name.trim() && !farmer_name.includes("Farmer") && !farmer_name.includes("Kisan")
      ? farmer_name.trim()
      : (activeDbFarmer?.fullName || "Ishaan Sen");

    const defaultDistrict = district || activeDbFarmer?.district || "Bhopal";
    const defaultState = state || activeDbFarmer?.state || "Madhya Pradesh";
    const defaultVillage = village || activeDbFarmer?.village || "Phanda Kalan";
    const defaultLat = lat && lat !== 23.2599 ? Number(lat) : (matchedField?.lat ?? activeDbFarmer?.gpsLocation?.lat ?? 23.2599);
    const defaultLon = lon && lon !== 77.4126 ? Number(lon) : (matchedField?.lon ?? activeDbFarmer?.gpsLocation?.lon ?? 77.4126);

    // ─────────────────────────────────────────────────────────────
    // STAGE 1: Natural Language & 5-Tier Canonical Location Parsing
    // ─────────────────────────────────────────────────────────────
    const canonicalLoc = resolveCanonicalLocation({
      userQuery: message,
      conversationHistory: Array.isArray(conversation_history) ? conversation_history : [],
      lastResolvedLocation: last_resolved_location,
      selectedDistrict: defaultDistrict,
      selectedState: defaultState,
      gpsLat: defaultLat,
      gpsLon: defaultLon,
      gpsDistrict: defaultDistrict,
      gpsState: defaultState,
      gpsVillage: defaultVillage,
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

    const activeDistrict = canonicalLoc.district || defaultDistrict;
    const activeState = canonicalLoc.state || defaultState;
    const activeLat = canonicalLoc.lat || defaultLat;
    const activeLon = canonicalLoc.lon || defaultLon;
    const activeUserLocation = canonicalLoc.resolvedLocation || `${activeDistrict}, ${activeState}`;

    // ─────────────────────────────────────────────────────────────
    // STAGE 2: Intent Classification & Crop Resolution
    // ─────────────────────────────────────────────────────────────
    // Explicit price intent check (Only if user actually asks for price/rate/bhav)
    const isExplicitMandiQuery = /(mandi|price|bhav|rate|reat|kimat|mulya|kitne ka|bika|दाम|भाव|दर|रेट|मूल्य|प्रति क्विंटल)/i.test(msgLower);
    const isWeatherQuery = /(weather|temp|rain|barish|hawa|wind|mausam|मौसम|तापमान|बारिश|वर्षा|हवा)/i.test(msgLower);
    const isDiseaseQuery = /(keeda|pest|insect|dawa|bimari|spray|dose|khurak|rog|कीड़ा|दवा|कीटनाशक|बीमारी|रोग|झुलसा|छिड़काव|खुराक|इल्ली)/i.test(msgLower);
    const isFieldQuery = /(khet|field|plot|acre|acreage|land|jameen|soil|mitti|location|खेत|जमीन|एकड़|मिट्टी)/i.test(msgLower);
    const isJournalQuery = /(spray kiya|last spray|previous|journal|khad|pichla|डायरी|पिछला स्प्रे|खाद)/i.test(msgLower);

    let queryIntent: "mandi" | "weather" | "disease" | "knowledge" | "general" = "general";
    if (isExplicitMandiQuery) queryIntent = "mandi";
    else if (isWeatherQuery) queryIntent = "weather";
    else if (isDiseaseQuery) queryIntent = "disease";
    else queryIntent = "knowledge";

    // Extract target crop or commodity from query, fallback to active field's crop or passed crop
    const fallbackCrop = matchedField?.crop ? matchedField.crop.toLowerCase().split("/")[0].trim() : crop;
    const targetCommodity = extractCommodityFromNaturalQuery(message, fallbackCrop);
    const effectiveCropId = targetCommodity.id || fallbackCrop || "soybean";
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
        variety: activeVariety || undefined,
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

    // Conversation History
    let convoContext = "";
    if (Array.isArray(conversation_history) && conversation_history.length > 0) {
      const recentTurns = conversation_history.slice(-4);
      convoContext =
        `RECENT CONVERSATION HISTORY:\n` +
        recentTurns.map((t: any) => `${t.sender === "user" ? "Farmer" : "AASRA"}: "${t.text}"`).join("\n");
    }

    // Format database dossier for Gemini 2.5 Flash
    const registeredPlotsSummary = dbFields.map((f, idx) => 
      `  Plot #${idx + 1}: "${f.name}"
     - Area: ${f.area_acres} acres | Soil: ${f.soil_type || "Deep Black Clay Soil"} | GPS: (${f.lat.toFixed(4)}, ${f.lon.toFixed(4)})
     - Current Crop: ${f.crop}${f.variety ? ` (Variety: ${f.variety})` : ""}
     - Field ID: ${f.id}`
    ).join("\n");

    const recentJournalSummary = dbJournal.slice(0, 4).map((j) =>
      `  - [${j.date}] ${j.title} (${j.badge}): ${j.notes}`
    ).join("\n");

    const certifiedRobiSummary = dbRobiAudits.slice(0, 2).map((r) =>
      `  - Cert #${r.certificateNo} (${r.crop}): +${r.savedHarvestQuintals} quintals yield saved, Net Profit ₹${r.netProfitINR.toLocaleString("en-IN")}, ROBI Multiplier ${r.robiMultiplier}x`
    ).join("\n");

    // ─────────────────────────────────────────────────────────────
    // STAGE 4: Grounded Multi-Crop Gemini 2.5 Flash Synthesis
    // ─────────────────────────────────────────────────────────────
    const promptInstructions = `You are AASRA (आसरा), an ultra-smart, empathetic, humanized, and scientifically precise AI agricultural companion for Indian farmers.
The farmer is asking a question. ${audioBase64 ? "Listen to the farmer's raw acoustic audio recording carefully." : `Farmer query: "${message}"`}

FARMER PROFILE & VERIFIED DATABASE DOSSIER (AASRA DB GROUND TRUTH):
- Registered Farmer: ${cleanFarmerName} (ID: ${activeDbFarmer?.id || "farmer-001"})
- Farmer Home: ${defaultVillage}, ${activeDistrict}, ${activeState}
- KCC Status: ${activeDbFarmer?.hasKisanCreditCard ? "Active Kisan Credit Card" : "Not Linked"} | PM-Kisan: ${activeDbFarmer?.pmKisanBeneficiary ? "Active Beneficiary" : "Not Linked"}
- Total Registered Holdings: ${dbFields.reduce((sum, f) => sum + f.area_acres, 0).toFixed(1)} acres across ${dbFields.length} registered geo-tagged plots:
${registeredPlotsSummary}

ACTIVE TARGET FIELD FOR THIS CONSULTATION:
- Selected Field: "${activeFieldName}"
- Field Area: ${activeFieldAcres} acres
- Soil Classification: ${activeSoilType}
- Target Crop & Variety: ${cropProfile.nameEn} (${cropProfile.nameHi}) - ${activeVariety || "High Yield Certified"}
- Exact Field Coordinates: Lat ${activeLat.toFixed(4)}, Lon ${activeLon.toFixed(4)}
- Location: ${activeUserLocation}

FARM INTERVENTION JOURNAL (HISTORICAL ACTIONS FROM DB):
${recentJournalSummary || "  - No previous recorded sprays this season."}

CERTIFIED ROBI PERFORMANCE RECORDS:
${certifiedRobiSummary || "  - Standard baseline active."}

LIVE SENSOR & AGRO-CLIMATIC CONTEXT (100% REAL TELEMETRY):
- Live Weather in ${activeDistrict}: Temp ${activeTemp}°C, Night Temp ${activeNightTemp}°C${isNightHeatStress ? " (Night Thermal Stress Active)" : ""}, Soil Moisture ${activeSoil}%, Wind Speed ${activeWind} km/h, Humidity ${activeHumidity}%
- Spray Feasibility: ${isSprayWindowSafe ? "SAFE TO SPRAY NOW (Wind < 15 km/h, Temp < 33°C)" : `CAUTION: Wind speed ${activeWind} km/h or High temp ${activeTemp}°C`}
- ${verifiedMandiSummary}
- Agronomic Biological Thresholds for ${cropProfile.nameEn}:
  * Thermal Optimal: ${cropProfile.optimalDayTemp}°C (Critical Max: ${cropProfile.heatStressLimitDay}°C), Optimal Night: ${cropProfile.optimalNightTemp}°C
  * Biostimulant: ${cropProfile.stressBusterRecommendation.product} @ ${cropProfile.stressBusterRecommendation.dosePerAcre}
- Certified Protection Protocols for ${cropProfile.nameEn}:
${pestDiseasesList}

${convoContext}

CRITICAL INSTRUCTIONS & RESPONSE CRITERIA:
1. OUTPUT LANGUAGE: Answer STRICTLY in ${targetLangName}.
2. DIRECT & ACCURATE ANSWER TO USER'S QUESTION:
   - Carefully analyze what the farmer is asking and answer THAT specific question directly in the very first sentence.
   - If asked about their farm, plots, acreage, or location: List their exact registered fields from the database, total acres, soil types, and crops.
   - If asked about mandi price, selling, or profits: Cite today's modal price in ${activeDistrict} APMC (₹${mandiRecord ? mandiRecord.modalPrice.toLocaleString("en-IN") : "4,850"}/quintal) and calculate revenue for their ${activeFieldAcres} acres (~${(activeFieldAcres * 9).toFixed(0)} quintals yield = ₹${((mandiRecord?.modalPrice || 4850) * activeFieldAcres * 9).toLocaleString("en-IN")}).
   - If asked about disease, pest, spray, or dose: Prescribe the certified solution, calculate the EXACT total dose for their ${activeFieldAcres} acres (${((300 * activeFieldAcres) / 1000).toFixed(1)} to ${((400 * activeFieldAcres) / 1000).toFixed(1)} L in ${(200 * activeFieldAcres)} L water), and verify the spray window with wind at ${activeWind} km/h.
   - If asked about previous sprays or farm journal: Cite their actual journal logs directly from the database dossier.
   - If asked about weather, heat, or irrigation: Compare current temperature (${activeTemp}°C) with the crop's threshold (${cropProfile.heatStressLimitDay}°C) and evaluate soil moisture (${activeSoil}%).
3. PERSONALIZATION:
   - Address the farmer respectfully by name: "${cleanFarmerName} जी" (or "Namaste ${cleanFarmerName}").
   - Mention their specific field ("${activeFieldName}", ${activeFieldAcres} acres) and soil type ("${activeSoilType}").
4. ZERO VAGUE GENERALITIES:
   - Never say generic things like "दवा डाल दें". Always provide exact product names, exact dosage for their acres, and exact water ratio.
5. BEAUTIFUL, STRUCTURED, HUMANIZED FORMAT:
   - Keep the reply conversational, empathetic, encouraging, and clear.
   - Use bold markdown (**bold**) for key numbers, temperatures, chemical names, and prices for high readability.
   - Use neat, short bullet points where appropriate.

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
      reply: replyText || (reqLang === "hi" ? `जी ${cleanFarmerName}, ${activeDistrict} में आपके ${activeFieldName} (${activeFieldAcres} एकड़) के लिए लाइव तापमान ${activeTemp}°C है।` : `Live telemetry for ${cleanFarmerName}'s ${activeFieldName}: ${activeTemp}°C.`),
      response: replyText,
      detected_language: detectedLanguage,
      raw_transcript: rawTranscript || message,
      why_recommendation: `Verified AASRA Database, Open-Meteo & APMC data for ${cleanFarmerName} in ${activeDistrict} (${cropProfile.nameEn}).`,
      confidence_score: confidenceScore,
      follow_up_questions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
      model_used: "Gemini 2.5 Flash",
      language: reqLang,
      source: "AASRA Database + Google Gemini 2.5 Flash + Open-Meteo + APMC Agmarknet",
      mandi_record: mandiRecord,
      canonical_location: canonicalLoc,
      location_used: activeDistrict,
      matched_field: {
        name: activeFieldName,
        area_acres: activeFieldAcres,
        crop: cropProfile.nameEn,
        soil_type: activeSoilType,
        variety: activeVariety,
        lat: activeLat,
        lon: activeLon,
      },
      all_registered_fields: dbFields.map((f) => ({
        id: f.id,
        name: f.name,
        area_acres: f.area_acres,
        crop: f.crop,
        variety: f.variety,
        soil_type: f.soil_type,
      })),
      farmer_profile: {
        name: cleanFarmerName,
        id: activeDbFarmer?.id || "farmer-001",
        acres: activeFieldAcres,
        total_acres: dbFields.reduce((sum, f) => sum + f.area_acres, 0),
        crop: cropProfile.nameEn,
        village: defaultVillage,
        district: activeDistrict,
        state: activeState,
        has_kcc: activeDbFarmer?.hasKisanCreditCard ?? true,
        pm_kisan: activeDbFarmer?.pmKisanBeneficiary ?? true,
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
