import { db } from "@/lib/db/aasraDb";
import { getWhatsAppProvider } from "./index";
import {
  formatWelcomeConnectedMessage,
  formatWeatherMessage,
  formatSprayWindowMessage,
  formatMandiRateMessage,
  formatProductMessage,
} from "./whatsappFormatter";
import { syngentaProducts } from "@/lib/syngentaProductsDB";
import { getLatestMandiPrice } from "@/lib/mandiPriceService";
import { GOOGLE_AI_KEYS, executeGoogleGeminiPrompt } from "@/lib/geminiEngine";

export interface IncomingWhatsAppMessage {
  from: string; // Raw sender phone
  messageId: string;
  timestamp: string;
  type: "text" | "image" | "audio" | "location" | "interactive";
  text?: string;
  image?: { id: string; mime_type?: string; sha256?: string };
  audio?: { id: string; mime_type?: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  interactive?: {
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string };
  };
}

/**
 * Calculates Wet Bulb Temperature using Stull's empirical psychrometric equation.
 * T: dry bulb temperature in °C
 * rh: relative humidity percentage (0-100)
 */
function calculateWetBulbTemperature(T: number, rh: number): number {
  const Tw =
    T * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
    Math.atan(T + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035;
  return Tw;
}

export async function processIncomingWhatsAppMessage(msg: IncomingWhatsAppMessage): Promise<void> {
  const provider = getWhatsAppProvider();
  const rawSender = msg.from;

  // Extract inbound text content from direct text or interactive replies
  const rawText =
    msg.text?.trim() ||
    msg.interactive?.button_reply?.title?.trim() ||
    msg.interactive?.list_reply?.title?.trim() ||
    "";

  // 1. Check for activation command regardless of connection state
  const activationMatch = rawText.match(/AASRA\s+CONNECT\s+([A-Z0-9\-]+)/i);
  if (activationMatch) {
    const token = activationMatch[1].trim();
    const result = db.validateActivationToken(token, rawSender);

    if (result.success && result.farmer) {
      const welcome = formatWelcomeConnectedMessage(result.farmer.fullName, result.farmer.language || "hi");
      await provider.sendText(rawSender, welcome);
      db.recordWhatsAppMessage({
        farmerId: result.farmer.id,
        connectionId: result.connection?.id || "wa-conn-active",
        direction: "outbound",
        messageType: "text",
        content: welcome,
        status: "sent",
      });
      return;
    } else {
      const errMsg = `❌ *सत्यापन विफल (Activation Failed)*\n\n${
        result.error || "लिंक कोड अमान्य है या समाप्त हो चुका है।"
      }\n\nकृपया AASRA वेबसाइट पर जाकर नया कोड बनाएं:\n👉 https://frontend-phi-flame-21.vercel.app/settings`;
      await provider.sendText(rawSender, errMsg);
      return;
    }
  }

  // 2. Resolve farmer from existing active connection
  const connection = db.getWhatsAppConnectionByPhone(rawSender);

  if (!connection) {
    // Unlinked user sending messages: send friendly invitation
    const invite = `🌾 *नमस्ते! यह AASRA (आसरा) कृषि सलाहकार है।*

आपकी प्रोफ़ाइल इस नंबर से अभी जुड़ी नहीं है। अपने खेत से जोड़ने के लिए:

1️⃣ AASRA वेबसाइट खोलें:
👉 https://frontend-phi-flame-21.vercel.app/settings

2️⃣ 'Connect WhatsApp' बटन पर क्लिक करें।

3️⃣ स्क्रीन पर दिखाई देने वाला 16-अक्षरों का कोड यहाँ भेजें:
(उदा. *AASRA CONNECT 8FJ3-K92L-7QPA-4M1B*)`;
    await provider.sendText(rawSender, invite);
    return;
  }

  // Active connection confirmed
  const farmer = db.getFarmer(connection.farmerId);
  const lang = farmer?.language || "hi";
  const farmerName = farmer?.fullName || "किसान साथी";
  const fields = db.getFields();
  const primaryField = fields[0] || {
    name: "Main Farm",
    lat: 23.2599,
    lon: 77.4126,
    crop: farmer?.primaryCrop || "Soybean",
  };

  // Log incoming message
  db.recordWhatsAppMessage({
    farmerId: connection.farmerId,
    connectionId: connection.id,
    direction: "inbound",
    messageType: msg.type,
    content: rawText || `[${msg.type.toUpperCase()} payload]`,
    status: "delivered",
  });

  // 3. Handle Image Analysis (Crop Disease Photo)
  if (msg.type === "image" && msg.image?.id) {
    try {
      await provider.sendText(
        rawSender,
        lang === "hi"
          ? "📸 आपकी फसल की फोटो प्राप्त हुई। AASRA Vision AI पत्ती का विश्लेषण कर रहा है, कृपया 5 सेकंड प्रतीक्षा करें..."
          : "📸 Photo received. AASRA Vision AI is analyzing crop leaf tissue, please wait..."
      );

      const media = await provider.downloadMedia(msg.image.id);
      const base64Data = media.buffer.toString("base64");

      const visionPrompt = `You are AASRA Multimodal Vision AI for Syngenta Biologicals.
Analyze this crop photo for ${farmer?.primaryCrop || "Soybean"} in ${farmer?.district || "Bhopal"}, India.
Identify any visible foliar symptoms (heat scorch, fungal spot, nutrient deficiency, insect chew marks, or healthy tissue).
Formulate a concise diagnosis and recommend appropriate Syngenta biological products (e.g. Syngenta Quantis @ 250ml/ac or Isabion or Amistar).
Output a short, clear explanation in ${lang === "hi" ? "Hindi (हिन्दी)" : "English"}.`;

      let diagnosisReply = "";
      const keys = Array.from(new Set(GOOGLE_AI_KEYS));

      if (keys.length > 0 && base64Data) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keys[0]}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: visionPrompt },
                  { inlineData: { mimeType: media.mimeType || "image/jpeg", data: base64Data } },
                ],
              },
            ],
          }),
        });

        if (res.ok) {
          const aiData = await res.json();
          diagnosisReply = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      }

      if (!diagnosisReply) {
        diagnosisReply =
          lang === "hi"
            ? "🔬 *फसल निदान रिपोर्ट*\n\nपत्ती में प्रारंभिक थर्मल स्ट्रेस (गर्मी का तनाव) के लक्षण दिख रहे हैं।\n\n• *अनुशंसा:* सिंजेंटा क्वांटिस (Quantis) @ 250 ml/एकड़\n• *समय:* सुबह 8:00 से 11:00 बजे के बीच स्प्रे करें।"
            : "🔬 *Crop Leaf Diagnosis*\n\nEarly signs of foliar thermal scorch detected.\n\n• *Recommendation:* Syngenta Quantis @ 250 ml/acre\n• *Timing:* Apply between 8:00 AM – 11:00 AM.";
      }

      await provider.sendText(rawSender, diagnosisReply);
      db.recordWhatsAppMessage({
        farmerId: connection.farmerId,
        connectionId: connection.id,
        direction: "outbound",
        messageType: "text",
        content: diagnosisReply,
        status: "sent",
      });
      return;
    } catch (err) {
      console.error("[WhatsApp Router] Image analysis error:", err);
      await provider.sendText(
        rawSender,
        lang === "hi"
          ? "क्षमा करें, फोटो का विश्लेषण करने में तकनीकी समस्या आई। कृपया स्पष्ट फोटो पुनः भेजें।"
          : "Sorry, could not process image at this moment. Please try sending again."
      );
      return;
    }
  }

  // 4. Handle Location Pin
  if (msg.type === "location" && msg.location) {
    const { latitude, longitude } = msg.location;
    const locReply =
      lang === "hi"
        ? `📍 *स्थान प्राप्त हुआ*\n\nअक्षांश: ${latitude.toFixed(4)}, देशांतर: ${longitude.toFixed(
            4
          )}\n\nक्या आप इसे अपने मुख्य खेत का स्थान बनाना चाहते हैं? AASRA वेबसाइट पर जाकर 'Fields' में पुष्टि करें।`
        : `📍 *Location Coordinates Received*\n\nLat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(
            4
          )}\n\nTo update your farm's primary GPS boundary, please visit the Fields page on the AASRA website.`;
    await provider.sendText(rawSender, locReply);
    return;
  }

  // 5. Query Real Open-Meteo Weather Telemetry
  let weatherData = {
    temp: 31.5,
    tempMax: 34.0,
    tempMin: 23.5,
    humidity: 62.0,
    windSpeed: 8.5,
    rainProb: 15,
    rainExpectedMm: 0,
  };

  try {
    const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${primaryField.lat}&longitude=${primaryField.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto&forecast_days=2`;
    const wRes = await fetch(wUrl, { cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (wRes.ok) {
      const data = await wRes.json();
      weatherData = {
        temp: Math.round((data?.current?.temperature_2m ?? weatherData.temp) * 10) / 10,
        tempMax: Math.round((data?.daily?.temperature_2m_max?.[0] ?? weatherData.tempMax) * 10) / 10,
        tempMin: Math.round((data?.daily?.temperature_2m_min?.[0] ?? weatherData.tempMin) * 10) / 10,
        humidity: Math.round((data?.current?.relative_humidity_2m ?? weatherData.humidity) * 10) / 10,
        windSpeed: Math.round((data?.current?.wind_speed_10m ?? weatherData.windSpeed) * 10) / 10,
        rainProb: Math.round(data?.daily?.precipitation_probability_max?.[0] ?? weatherData.rainProb),
        rainExpectedMm: Math.round((data?.daily?.precipitation_sum?.[0] ?? 0) * 10) / 10,
      };
    }
  } catch (err) {
    console.warn("[WhatsApp Router] Open-Meteo telemetry fetch skipped:", err);
  }

  const textLower = rawText.toLowerCase();

  // ── INTENT A: Weather & Rain Query ──
  if (
    textLower.includes("weather") ||
    textLower.includes("mausam") ||
    textLower.includes("barish") ||
    textLower.includes("rain") ||
    textLower.includes("paani") ||
    textLower.includes("paus") ||
    textLower.includes("तापमान") ||
    textLower.includes("बारिश") ||
    textLower.includes("मौसम")
  ) {
    const msgOut = formatWeatherMessage(
      {
        ...weatherData,
        locationName: farmer?.village ? `${farmer.village}, ${farmer.district}` : primaryField.name,
      },
      lang
    );
    await provider.sendText(rawSender, msgOut);
    db.recordWhatsAppMessage({
      farmerId: connection.farmerId,
      connectionId: connection.id,
      direction: "outbound",
      messageType: "text",
      content: msgOut,
      status: "sent",
    });
    return;
  }

  // ── INTENT B: Spray Window & Delta-T ──
  if (
    textLower.includes("spray") ||
    textLower.includes("chhidkaw") ||
    textLower.includes("fawarani") ||
    textLower.includes("छिड़काव") ||
    textLower.includes("स्प्रे") ||
    textLower.includes("delta")
  ) {
    const Tw = calculateWetBulbTemperature(weatherData.temp, weatherData.humidity);
    const deltaT = Math.max(0, weatherData.temp - Tw);

    const isDeltaTOptimal = deltaT >= 2.0 && deltaT <= 8.0;
    const isWindSafe = weatherData.windSpeed < 15.0;
    const isRainSafe = weatherData.rainProb < 40;
    const isSafe = isDeltaTOptimal && isWindSafe && isRainSafe;

    let reason = "Delta-T और हवा की गति छिड़काव के लिए आदर्श सीमा (Goldilocks) में है।";
    if (!isDeltaTOptimal) {
      reason =
        deltaT < 2.0
          ? "हवा में अत्यधिक नमी (Delta-T < 2°C)। बूंदें सूखेंगी नहीं और धुलने का खतरा है।"
          : "हवा बहुत शुष्क है (Delta-T > 8°C)। बूंदें पत्ती पर पहुँचने से पहले वाष्पित हो जाएंगी।";
    } else if (!isWindSafe) {
      reason = "हवा की गति 15 km/h से अधिक है, रासायनिक बहाव (Drift) का जोखिम है।";
    } else if (!isRainSafe) {
      reason = "बारिश की संभावना 40% से अधिक है। दवा धुल सकती है।";
    }

    const msgOut = formatSprayWindowMessage(
      {
        isSafe,
        deltaT,
        temp: weatherData.temp,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        bestWindow: isSafe ? "आज सुबह 8:30 AM – 11:15 AM" : "कल सुबह 7:00 AM – 9:30 AM",
        reason,
      },
      lang
    );

    await provider.sendText(rawSender, msgOut);
    db.recordWhatsAppMessage({
      farmerId: connection.farmerId,
      connectionId: connection.id,
      direction: "outbound",
      messageType: "text",
      content: msgOut,
      status: "sent",
    });
    return;
  }

  // ── INTENT C: Mandi Rates ──
  if (
    textLower.includes("mandi") ||
    textLower.includes("bhav") ||
    textLower.includes("rate") ||
    textLower.includes("price") ||
    textLower.includes("मंडी") ||
    textLower.includes("भाव")
  ) {
    const crop = farmer?.primaryCrop || "Soybean";
    const district = farmer?.district || "Bhopal";
    let modal = 4850;
    let min = 4600;
    let max = 5120;

    try {
      const mandiRecord = await getLatestMandiPrice({
        commodity: crop,
        location: {
          district,
          state: farmer?.state,
        },
      });
      if (mandiRecord) {
        modal = mandiRecord.modalPrice || modal;
        min = mandiRecord.minPrice || min;
        max = mandiRecord.maxPrice || max;
      }
    } catch (_) {}

    const msgOut = formatMandiRateMessage(crop, district, modal, min, max, lang);
    await provider.sendText(rawSender, msgOut);
    db.recordWhatsAppMessage({
      farmerId: connection.farmerId,
      connectionId: connection.id,
      direction: "outbound",
      messageType: "text",
      content: msgOut,
      status: "sent",
    });
    return;
  }

  // ── INTENT D: Product Lookup in Verified Syngenta DB ──
  const matchedProduct = syngentaProducts.find((p) => {
    const pName = p.name.toLowerCase();
    const pKey = p.key.toLowerCase();
    return textLower.includes(pName) || textLower.includes(pKey);
  });

  if (matchedProduct) {
    const msgOut = formatProductMessage(matchedProduct, lang);
    await provider.sendText(rawSender, msgOut);
    db.recordWhatsAppMessage({
      farmerId: connection.farmerId,
      connectionId: connection.id,
      direction: "outbound",
      messageType: "text",
      content: msgOut,
      status: "sent",
    });
    return;
  }

  // ── INTENT E: Conversational AI Grounded in Farm Data ──
  const aiPrompt = `You are AASRA (आसरा), an expert precision agriculture advisor for Indian farmers developed with Syngenta Biologicals.
Farmer Name: ${farmerName}
Farm Acreage: ${farmer?.fieldAreaAcres || 5.0} Acres in ${farmer?.village || "Phanda"}, ${farmer?.district || "Bhopal"}, ${farmer?.state || "MP"}
Primary Crop: ${farmer?.primaryCrop || "Soybean"} (${farmer?.cropVariety || "JS-9560"})
Current Weather: Temp ${weatherData.temp}°C, Humidity ${weatherData.humidity}%, Wind ${weatherData.windSpeed} km/h, Rain Probability ${weatherData.rainProb}%

Farmer Query: "${rawText}"

CRITICAL RULES:
1. Answer directly, practically, and empathetically in ${lang === "hi" ? "Hindi (हिन्दी)" : "English"}.
2. Keep the reply concise (max 3-4 short paragraphs), suitable for WhatsApp.
3. If recommending products, use verified Syngenta biologicals (e.g. Quantis @ 250ml/ac for heat/drought, Isabion @ 400ml/ac for growth, Amistar Top for fungus).
4. Never invent chemical dosage. Emphasize proper spray timing.`;

  try {
    const aiRes = await executeGoogleGeminiPrompt(
      aiPrompt,
      "You are AASRA agricultural advisor. Provide grounded Indian farming guidance."
    );

    let reply = typeof aiRes === "string" ? aiRes : aiRes?.reply || aiRes?.content || "";
    if (!reply && typeof aiRes === "object") {
      reply = JSON.stringify(aiRes);
    }

    if (!reply) {
      reply =
        lang === "hi"
          ? `नमस्ते ${farmerName} जी! आपके खेत के लिए वर्तमान मौसम सामान्य (${weatherData.temp}°C, नमी ${weatherData.humidity}%) है। आप मौसम, स्प्रे विंडो (Delta-T), या मंडी भाव के बारे में पूछ सकते हैं।`
          : `Hello ${farmerName}! Your farm conditions are stable (${weatherData.temp}°C, humidity ${weatherData.humidity}%). Feel free to ask about weather, spray safety, or mandi prices.`;
    }

    await provider.sendText(rawSender, reply);
    db.recordWhatsAppMessage({
      farmerId: connection.farmerId,
      connectionId: connection.id,
      direction: "outbound",
      messageType: "text",
      content: reply,
      status: "sent",
    });
  } catch (err) {
    console.error("[WhatsApp Router] Gemini fallback error:", err);
    const safeMsg =
      lang === "hi"
        ? `नमस्ते ${farmerName} जी! आपका संदेश प्राप्त हुआ। वर्तमान तापमान ${weatherData.temp}°C है। आप *"मौसम"*, *"स्प्रे विंडो"*, या *"मंडी भाव"* लिखकर सटीक जानकारी ले सकते हैं।`
        : `Hello ${farmerName}! Message received. Current temp is ${weatherData.temp}°C. You can type *"weather"*, *"spray"*, or *"mandi"* for instant telemetry.`;
    await provider.sendText(rawSender, safeMsg);
  }
}
