/**
 * AASRA WhatsApp Message Formatter
 * Generates structured, farmer-friendly messages in regional Indian languages.
 */

export interface FormattedWeatherContext {
  temp: number;
  tempMax: number;
  tempMin: number;
  humidity: number;
  windSpeed: number;
  rainProb: number;
  rainExpectedMm: number;
  locationName: string;
}

export interface FormattedSprayWindowContext {
  isSafe: boolean;
  deltaT: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  bestWindow: string;
  reason: string;
}

export function formatWelcomeConnectedMessage(farmerName: string, lang = "hi"): string {
  if (lang === "hi") {
    return `🌾 *नमस्ते ${farmerName} जी!*

आपका WhatsApp AASRA (आसरा) कृषि इंटेलिजेंस से सफलतापूर्वक जुड़ गया है।

आप मुझसे कभी भी पूछ सकते हैं:
• *"आज बारिश होगी?"*
• *"स्प्रे करने का सही समय क्या है?"*
• *"सोयाबीन का मंडी भाव क्या है?"*
• *"क्वांटिस (Quantis) का उपयोग कैसे करें?"*
• खेत की पत्ती का फोटो भेजें बीमारी की पहचान के लिए।

AASRA आपके खेत की सुरक्षा के लिए हमेशा तैयार है! 🚜`;
  }

  if (lang === "mr") {
    return `🌾 *नमस्ते ${farmerName} जी!*

आपला WhatsApp AASRA (आसरा) कृषी इंटेलिजन्सशी यशस्वीरीत्या जोडला गेला आहे.

तुम्ही कधीही विचारू शकता:
• *"आज पाऊस पडेल का?"*
• *"फवारणीची योग्य वेळ कोणती?"*
• *"सोयाबीनचा आजचा बाजारभाव काय?"*
• पिकांच्या रोगाच्या निदानासाठी पानांचा फोटो पाठवा.

AASRA आपल्या सेवेसाठी तत्पर आहे! 🚜`;
  }

  return `🌾 *Welcome ${farmerName}!*

Your WhatsApp is now successfully connected to AASRA Precision Agriculture Intelligence.

You can ask me anytime:
• *"Will it rain today?"*
• *"Is it safe to spray now?"*
• *"What is the Mandi price for Soybean?"*
• *"How to use Quantis biostimulant?"*
• Send a photo of any crop leaf for instant disease diagnosis.

AASRA is with you at every step of farming! 🚜`;
}

export function formatWeatherMessage(ctx: FormattedWeatherContext, lang = "hi"): string {
  const rainIcon = ctx.rainProb > 50 ? "🌧️" : ctx.rainProb > 20 ? "🌦️" : "☀️";

  if (lang === "hi") {
    return `${rainIcon} *मौसम रिपोर्ट — ${ctx.locationName}*

• *वर्तमान तापमान:* ${ctx.temp}°C
• *अधिकतम / न्यूनतम:* ${ctx.tempMax}°C / ${ctx.tempMin}°C
• *हवा में नमी (Humidity):* ${ctx.humidity}%
• *हवा की गति:* ${ctx.windSpeed} km/h
• *बारिश की संभावना:* ${ctx.rainProb}% (${ctx.rainExpectedMm} mm)

${
  ctx.rainProb > 60
    ? "⚠️ *सलाह:* अगले 24 घंटों में बारिश की संभावना है। कोई भी रासायनिक छिड़काव टालें।"
    : "✅ *सलाह:* मौसम सामान्य है। नियमित सिंचाई व कृषि कार्य जारी रखें।"
}

_आसरा लाइव वेदर टेलीमेट्री_`;
  }

  return `${rainIcon} *Weather Report — ${ctx.locationName}*

• *Current Temp:* ${ctx.temp}°C
• *High / Low:* ${ctx.tempMax}°C / ${ctx.tempMin}°C
• *Humidity:* ${ctx.humidity}%
• *Wind Speed:* ${ctx.windSpeed} km/h
• *Rain Probability:* ${ctx.rainProb}% (${ctx.rainExpectedMm} mm)

${
  ctx.rainProb > 60
    ? "⚠️ *Advisory:* Significant rain expected in the next 24 hours. Postpone foliar spraying."
    : "✅ *Advisory:* Weather conditions are stable for routine field operations."
}

_AASRA Live Weather Telemetry_`;
}

export function formatSprayWindowMessage(ctx: FormattedSprayWindowContext, lang = "hi"): string {
  const statusIcon = ctx.isSafe ? "🟢" : "🔴";

  if (lang === "hi") {
    return `${statusIcon} *स्प्रे विंडो निर्णय (Delta-T Advisory)*

• *स्थिति:* ${ctx.isSafe ? "*स्प्रे के लिए उपयुक्त समय*" : "*स्प्रे ना करें (प्रतिकूल मौसम)*"}
• *Delta-T:* ${ctx.deltaT.toFixed(1)}°C (आदर्श सीमा: 2°C – 8°C)
• *तापमान:* ${ctx.temp}°C
• *नमी:* ${ctx.humidity}%
• *हवा की गति:* ${ctx.windSpeed} km/h (सीमा: < 15 km/h)

⏱️ *सर्वोत्तम छिड़काव समय:* ${ctx.bestWindow}
📋 *कारण:* ${ctx.reason}

_वैज्ञानिक आधार: सिंजेंटा क्रॉपवाइज डेल्टा-टी स्ट्रोमैटल अवशोषण भौतिकी_`;
  }

  return `${statusIcon} *Spray Window Verdict (Delta-T Advisory)*

• *Status:* ${ctx.isSafe ? "*SAFE TO SPRAY NOW*" : "*HOLD SPRAY (Unfavorable)*"}
• *Delta-T:* ${ctx.deltaT.toFixed(1)}°C (Goldilocks: 2°C – 8°C)
• *Temperature:* ${ctx.temp}°C
• *Humidity:* ${ctx.humidity}%
• *Wind Speed:* ${ctx.windSpeed} km/h (Limit: < 15 km/h)

⏱️ *Optimal Window:* ${ctx.bestWindow}
📋 *Assessment:* ${ctx.reason}

_Scientific Basis: Syngenta Cropwise Delta-T Stomatal Absorption Physics_`;
}

export function formatMandiRateMessage(crop: string, district: string, modalPrice: number, minPrice: number, maxPrice: number, lang = "hi"): string {
  if (lang === "hi") {
    return `📊 *लाइव एपीएमसी मंडी भाव (APMC Mandi Rates)*

• *फसल:* ${crop}
• *मंडी/जिला:* ${district}
• *औसत भाव (Modal Rate):* *₹${modalPrice.toLocaleString("en-IN")} / क्विंटल*
• *न्यूनतम / अधिकतम:* ₹${minPrice.toLocaleString("en-IN")} – ₹${maxPrice.toLocaleString("en-IN")}

💡 *आसरा सुझाव:* वर्तमान मंडी दर लाभदायक स्तर पर है। फसल कटाई व बिक्री योजना बनाएं।

_स्रोत: भारत सरकार एगमार्कनेट (Agmarknet Live Database)_`;
  }

  return `📊 *APMC Mandi Commodity Rates*

• *Commodity:* ${crop}
• *Market / District:* ${district}
• *Modal Price:* *₹${modalPrice.toLocaleString("en-IN")} / Quintal*
• *Min / Max Range:* ₹${minPrice.toLocaleString("en-IN")} – ₹${maxPrice.toLocaleString("en-IN")}

💡 *AASRA Advice:* Modal rates are currently favorable. Align harvesting and storage accordingly.

_Source: Agmarknet (Ministry of Agriculture & Farmers Welfare)_`;
}

export function formatProductMessage(p: any, lang = "hi"): string {
  if (lang === "hi") {
    return `🔬 *सिंजेंटा उत्पाद जानकारी: ${p.name}*

• *श्रेणी:* ${p.category?.toUpperCase()}
• *सक्रिय घटक (Active Ingredient):* ${p.activeIngredient}
• *उपयोग की मात्रा (Dosage):* *${p.dosagePerAcre}*
• *पानी की मात्रा:* ${p.waterPerAcre} लीटर प्रति एकड़
• *अनुशंसित फसलें:* ${Array.isArray(p.approvedCrops) ? p.approvedCrops.slice(0, 4).join(", ") : p.approvedCrops}
• *Rainfastness (वर्षा सहनशीलता):* ${p.cropwiseStandard?.rainfastnessHours || 2} घंटे
• *Delta-T विंडो:* ${p.cropwiseStandard?.optimalDeltaT || "2-8°C"}

🛡️ *विशेष लाभ:* ${p.cropwiseStandard?.advisoryNote || "फसल तनाव से सुरक्षा एवं उपज में सुधार।"}`;
  }

  return `🔬 *Syngenta Product Intelligence: ${p.name}*

• *Category:* ${p.category?.toUpperCase()}
• *Active Ingredient:* ${p.activeIngredient}
• *Dosage:* *${p.dosagePerAcre}*
• *Water Volume:* ${p.waterPerAcre} L / Acre
• *Approved Crops:* ${Array.isArray(p.approvedCrops) ? p.approvedCrops.slice(0, 4).join(", ") : p.approvedCrops}
• *Rainfastness:* ${p.cropwiseStandard?.rainfastnessHours || 2} hours
• *Optimal Delta-T:* ${p.cropwiseStandard?.optimalDeltaT || "2-8°C"}

🛡️ *Cropwise Protocol:* ${p.cropwiseStandard?.advisoryNote || "Protects cellular turgor and boosts yield stability."}`;
}

export function formatAutonomousAlertMessage(
  alertType: string,
  title: string,
  message: string,
  lang = "hi"
): string {
  const icon =
    alertType === "rain"
      ? "🌧️"
      : alertType === "heat"
      ? "🔥"
      : alertType === "spray_window"
      ? "🟢"
      : alertType === "admin_broadcast"
      ? "📢"
      : "⚠️";

  if (lang === "hi") {
    return `${icon} *आसरा स्वचालित अलर्ट — ${title}*

${message}

वेबसाइट पर विस्तृत विश्लेषण देखें:
👉 https://frontend-phi-flame-21.vercel.app/dashboard

_आसरा कृषि रक्षा प्रणाली (AASRA Guardian)_`;
  }

  return `${icon} *AASRA Automated Alert — ${title}*

${message}

View detailed telemetry on your dashboard:
👉 https://frontend-phi-flame-21.vercel.app/dashboard

_AASRA Precision Agriculture Guardian_`;
}
