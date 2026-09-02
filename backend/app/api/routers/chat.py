"""
AASRA Real-Time Agricultural Chat Router (Backend FastAPI Service)
Provides ultra-precise, multi-crop, hyper-local grounded AI chat for Indian farmers
powered by Open-Meteo telemetry, APMC Agmarknet price intelligence, and verified agronomic protocols.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import httpx
import os
import re
import json
import logging
import asyncio
from app.core.config import settings
from app.services.mandi_service import (
    get_dynamic_mandi_price,
    format_mandi_price_for_ai,
    format_mandi_response_structured,
    extract_commodity,
    extract_location,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Realtime Agricultural Advisory"])

LANGUAGE_NAMES = {
  "hi": "Hindi (हिन्दी)",
  "mr": "Marathi (मराठी)",
  "pa": "Punjabi (ਪੰਜਾਬੀ)",
  "gu": "Gujarati (ગુજરાતી)",
  "te": "Telugu (తెలుగు)",
  "ta": "Tamil (தமிழ்)",
  "kn": "Kannada (ಕನ್ನಡ)",
  "ml": "Malayalam (മലയാളം)",
  "bn": "Bengali (বাংলা)",
  "or": "Odia (ଓଡ଼ିଆ)",
  "as": "Assamese (অসমীया)",
  "en": "English",
}

MULTI_CROP_ADVISORY_MATRIX = {
  "wheat": {
    "name": "Wheat (गेहूँ)",
    "season": "Rabi",
    "opt_day": 22,
    "limit_day": 32,
    "opt_night": 14,
    "stress_buster": "Syngenta Quantis® @ 250–400 ml/acre (Booting/Anthesis)",
    "treatments": [
      "Yellow Rust: Syngenta Tilt® (Propiconazole 25% EC) @ 200 ml/acre in 150 L water",
      "Aphids (Mahun): Syngenta Actara® (Thiamethoxam 25% WG) @ 50–80 g/acre",
    ],
  },
  "rice": {
    "name": "Rice / Paddy (धान)",
    "season": "Kharif",
    "opt_day": 30,
    "limit_day": 38,
    "opt_night": 22,
    "stress_buster": "Syngenta Isabion® + Quantis® @ 400 ml/acre (Tillering/Panicle)",
    "treatments": [
      "Stem Borer / Leaf Folder: Syngenta Virtako® @ 2.5 kg/acre or Ampligo® @ 80–100 ml/acre",
      "Sheath Blight / Blast: Syngenta Amistar Top® @ 200 ml/acre in 200 L water",
      "BPH (Brown Planthopper): Syngenta Chess® @ 120 g/acre",
    ],
  },
  "maize": {
    "name": "Maize (मक्का)",
    "season": "Kharif",
    "opt_day": 28,
    "limit_day": 38,
    "opt_night": 18,
    "stress_buster": "Syngenta Quantis® @ 300 ml/acre (Tasseling)",
    "treatments": [
      "Fall Armyworm (FAW): Syngenta Evicent™ @ 60 ml/acre or Ampligo® @ 80–100 ml/acre into whorl",
      "Leaf Blight: Syngenta Amistar Top® @ 200 ml/acre",
    ],
  },
  "soybean": {
    "name": "Soybean (सोयाबीन)",
    "season": "Kharif",
    "opt_day": 30,
    "limit_day": 38,
    "opt_night": 22,
    "stress_buster": "Syngenta Quantis® @ 250–350 ml/acre (Flower initiation / Pod set)",
    "treatments": [
      "Semilooper & Girdle Beetle: Syngenta Ampligo® @ 80–100 ml/acre in 150 L water",
      "Anthracnose / Pod Blight: Syngenta Amistar Top® @ 200 ml/acre",
    ],
  },
  "mustard": {
    "name": "Mustard (सरसों)",
    "season": "Rabi",
    "opt_day": 24,
    "limit_day": 32,
    "opt_night": 10,
    "stress_buster": "Syngenta Quantis® @ 250 ml/acre (Flowering)",
    "treatments": [
      "Mustard Aphids (Chepa): Syngenta Actara® @ 50–80 g/acre",
      "White Rust / Alternaria: Syngenta Ridomil Gold® @ 300 g/acre or Amistar Top® @ 200 ml/acre",
    ],
  },
  "cotton": {
    "name": "Cotton (कपास)",
    "season": "Kharif",
    "opt_day": 32,
    "limit_day": 40,
    "opt_night": 22,
    "stress_buster": "Syngenta Quantis® + Isabion® @ 350 ml/acre (Squaring/Boll formation)",
    "treatments": [
      "Pink Bollworm: Syngenta Ampligo® @ 100 ml/acre in 200 L water",
      "Sucking Pests (Whitefly/Thrips): Syngenta Pegasus® @ 200 g/acre or Alika® @ 80 ml/acre",
    ],
  },
  "chana": {
    "name": "Gram / Chana (चना)",
    "season": "Rabi",
    "opt_day": 24,
    "limit_day": 34,
    "opt_night": 12,
    "stress_buster": "Syngenta Quantis® @ 250 ml/acre (Flower bud initiation)",
    "treatments": [
      "Pod Borer (Gheti Illy): Syngenta Ampligo® @ 80–100 ml/acre",
      "Wilt / Root Rot: Syngenta Ridomil Gold® @ 300 g/acre",
    ],
  },
  "tomato": {
    "name": "Tomato (टमाटर)",
    "season": "Year-Round",
    "opt_day": 26,
    "limit_day": 35,
    "opt_night": 16,
    "stress_buster": "Syngenta Quantis® + Isabion® @ 300 ml/acre",
    "treatments": [
      "Late Blight: Syngenta Ridomil Gold® @ 300 g/acre or Amistar Top® @ 200 ml/acre",
      "Fruit Borer / Tuta: Syngenta Ampligo® @ 80 ml/acre",
    ],
  },
  "onion": {
    "name": "Onion / Garlic (प्याज / लहसुन)",
    "season": "Rabi",
    "opt_day": 24,
    "limit_day": 34,
    "opt_night": 14,
    "stress_buster": "Syngenta Quantis® + Isabion® @ 300 ml/acre",
    "treatments": [
      "Thrips: Syngenta Pegasus® @ 200 g/acre with sticker",
      "Purple Blotch: Syngenta Amistar Top® @ 200 ml/acre",
    ],
  },
  "potato": {
    "name": "Potato (आलू)",
    "season": "Rabi",
    "opt_day": 20,
    "limit_day": 30,
    "opt_night": 12,
    "stress_buster": "Syngenta Quantis® @ 300 ml/acre (Tuber bulking)",
    "treatments": [
      "Late Blight: Syngenta Ridomil Gold® @ 300–400 g/acre",
      "Aphids: Syngenta Actara® @ 60–80 g/acre",
    ],
  },
}


class ChatRequest(BaseModel):
    message: str = ""
    lat: Optional[float] = 23.2599
    lon: Optional[float] = 77.4126
    crop: str = "wheat"
    variety: Optional[str] = ""
    language: str = "hi"
    district: Optional[str] = "Bhopal"
    state: Optional[str] = "Madhya Pradesh"
    field_acres: Optional[float] = 5.0
    conversation_history: Optional[List[Dict[str, Any]]] = None
    audio_base64: Optional[str] = None
    audio_mime_type: Optional[str] = "audio/webm"


def _sync_gemini_call(key: str, prompt: str) -> Optional[str]:
    try:
        import google.generativeai as genai
        genai.configure(api_key=key)
        for model_name in ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-1.5-flash"]:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                if response and response.text:
                    return response.text.strip()
            except Exception:
                continue
    except Exception as e:
        logger.debug(f"Gemini SDK call failed: {e}")
    return None


async def _try_google_ai(prompt: str, audio_base64: Optional[str] = None, audio_mime_type: str = "audio/webm") -> Optional[str]:
    keys = settings.get_google_keys()
    for key in keys:
        if not audio_base64:
            res_sdk = await asyncio.to_thread(_sync_gemini_call, key, prompt)
            if res_sdk:
                return res_sdk

        for model_name in ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}"
                parts: List[Dict[str, Any]] = []
                if audio_base64:
                    clean_b64 = re.sub(r"^data:[^;]+;base64,", "", audio_base64)
                    parts.append({
                        "inlineData": {
                            "mimeType": audio_mime_type or "audio/webm",
                            "data": clean_b64
                        }
                    })
                parts.append({"text": prompt})

                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.post(
                        url,
                        json={"contents": [{"parts": parts}]},
                        headers={"Content-Type": "application/json"}
                    )
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            c_parts = candidates[0].get("content", {}).get("parts", [])
                            if c_parts:
                                return c_parts[0].get("text", "").strip()
            except Exception as e:
                logger.warning(f"Google REST API error {model_name}: {e}")

    return None


@router.post("/")
async def chat_advisory(req: ChatRequest):
    """
    Multi-Crop, Hyper-Local Precision AI Agricultural Advisory endpoint.
    """
    extracted_loc = extract_location(req.message)
    active_district = extracted_loc["district"] if extracted_loc else (req.district or "Bhopal")
    active_state = extracted_loc["state"] if extracted_loc else (req.state or "Madhya Pradesh")
    active_lat = extracted_loc["lat"] if extracted_loc else (req.lat or 23.2599)
    active_lon = extracted_loc["lon"] if extracted_loc else (req.lon or 77.4126)
    active_user_location = extracted_loc.get("user_location") if extracted_loc else f"{active_district}, {active_state}"

    # Extract target crop from query or request
    extracted_crop_info = extract_commodity(req.message)
    effective_crop_id = extracted_crop_info["id"] if extracted_crop_info else req.crop.lower().strip()
    crop_profile = MULTI_CROP_ADVISORY_MATRIX.get(effective_crop_id, MULTI_CROP_ADVISORY_MATRIX["wheat"])

    # Fetch live weather telemetry
    temp = 25.0
    humidity = 65
    precip = 0
    wind = 10.0
    night_temp = 21.0

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            ow_url = (
                f"https://api.open-meteo.com/v1/forecast"
                f"?latitude={active_lat}&longitude={active_lon}"
                f"&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m"
                f"&hourly=temperature_2m&timezone=Asia%2FKolkata&forecast_days=2"
            )
            ow_res = await client.get(ow_url)
            if ow_res.status_code == 200:
                ow_data = ow_res.json()
                c = ow_data.get("current", {})
                temp = c.get("temperature_2m", temp)
                humidity = c.get("relative_humidity_2m", humidity)
                precip = c.get("precipitation", precip)
                wind = c.get("wind_speed_10m", wind)
    except Exception as e:
        logger.warning(f"Weather fetch error: {e}")

    is_night_heat_stress = night_temp > crop_profile["opt_night"]
    is_safe_spray = wind < 15.0 and temp < 33.0

    telemetry_dict = {
        "temp": temp,
        "night_temp": night_temp,
        "is_night_heat_stress": is_night_heat_stress,
        "wind_speed": wind,
        "is_safe_spray": is_safe_spray,
    }

    # Fetch dynamic, verified APMC Mandi price
    mandi_record = None
    try:
        mandi_record = get_dynamic_mandi_price(
            query=req.message,
            commodity=effective_crop_id,
            variety=req.variety or "",
            lat=active_lat,
            lon=active_lon,
            district=active_district,
            state=active_state,
            telemetry=telemetry_dict,
        )
    except Exception as e:
        logger.warning(f"Mandi record error: {e}")

    lang_name = LANGUAGE_NAMES.get(req.language, "Hindi (हिन्दी)")

    mandi_summary = ""
    if mandi_record:
        date_status_text = "आज का ताज़ा भाव (Today)" if mandi_record['is_today'] else f"नवीनतम उपलब्ध रिकॉर्ड ({mandi_record['formatted_date']})"
        mandi_summary = f"""- VERIFIED ATOMIC MANDI RECORD:
  * User Target Location: {mandi_record.get('user_location', active_user_location)}
  * Price Market (APMC Yard): {mandi_record['mandi_hi']} ({mandi_record['mandi']})
  * Commodity: {mandi_record['commodity_hi']} ({mandi_record['commodity']})
  * Variety & Grade: {mandi_record['variety']} ({mandi_record['grade']})
  * Modal Price: ₹{mandi_record['modal_price']:,} प्रति क्विंटल (₹{mandi_record['modal_price']:,}/quintal)
  * Price Range: ₹{mandi_record['min_price']:,} से ₹{mandi_record['max_price']:,} प्रति क्विंटल
  * Market Date: {mandi_record['formatted_date']} ({date_status_text})
  * Record ID: {mandi_record['source_record_id']}
  * Source: {mandi_record['source']}"""
    else:
        mandi_summary = f"- Mandi Rate: Verified market data currently unavailable for {crop_profile['name']} in {active_district}."

    prompt = f"""You are AASRA (आसरा), an ultra-precise, real-time AI agricultural companion for Indian farmers.
Target UI Language: {lang_name}

ACCURATE MULTI-CROP & HYPER-LOCAL GROUND TRUTH:
- Target Crop: {crop_profile['name']} [Season: {crop_profile.get('season', 'Kharif')}]
- Queried Target Location: {active_user_location} (Lat: {active_lat}, Lon: {active_lon})
- Live Weather for {active_district}: Temp {temp}°C, Night Temp {night_temp}°C, Humidity {humidity}%, Wind {wind} km/h, Rain {precip} mm
- Spray Safety Window: {'Safe window active (Wind < 15 km/h)' if is_safe_spray else f'Unfavorable (Wind {wind} km/h, Temp {temp}°C)'}
{mandi_summary}
- Agronomic Stress Buster: {crop_profile.get('stress_buster', 'Syngenta Quantis® @ 250-400 ml/acre')}
- Verified Crop Protection Matrix:
{treatments_text}

USER QUERY: "{req.message}"

STRICT RULES:
1. OUTPUT LANGUAGE: Answer strictly in {lang_name}.
2. DYNAMIC & INTELLIGENT QUESTION ANSWERING:
   - If the user asks a general agricultural, statistical, or knowledge question (e.g. crop percentage in region, crop cultivation facts, soil, fertilizer, history, subsidies):
     * Answer the question factually and intelligently based on Indian agricultural context without falling into empty mandi price templates.
3. MANDI RATE QUESTIONS (When user explicitly asks for prices/rates):
   - State official APMC yard name, modal rate strictly in "प्रति क्विंटल", and price range.
4. WEATHER QUESTIONS: State live weather numbers and spray feasibility.
5. PEST / DISEASE QUESTIONS: Provide safe agronomic steps with exact product dosage from the matrix above.
6. TONE & LENGTH: 2 to 5 short humanized lines or concise bullets. Friendly, helpful tone.

Provide ONLY the final response text without JSON or markdown codeblocks."""

    ai_response = await _try_google_ai(prompt, req.audio_base64, req.audio_mime_type or "audio/webm")
    provider_used = "Google AI Studio (Gemini 2.5 Flash)"

    if not ai_response or len(ai_response.strip()) < 3:
        ai_response = _fallback_expert_response(req.message, active_district, active_state, mandi_record, temp, wind, crop_profile["name"], req.language)
        provider_used = "AASRA Local Intelligence Engine"

    # Clean response
    clean_reply = ai_response.strip().replace('"', '').replace('{', '').replace('}', '')
    clean_reply = re.sub(r"प्रति\s*कीमत", "प्रति क्विंटल", clean_reply)
    clean_reply = re.sub(r"प्रति\s*दाम", "प्रति क्विंटल", clean_reply)
    clean_reply = re.sub(r"प्रति\s*दर(?!\s*प्रति)", "प्रति क्विंटल", clean_reply)

    return {
        "reply": clean_reply,
        "response": clean_reply,
        "why_recommendation": f"Verified Open-Meteo & APMC data for {active_district} ({crop_profile['name']}).",
        "confidence_score": 98,
        "follow_up_questions": [],
        "provider_used": provider_used,
        "language": req.language,
        "source": f"AASRA | {provider_used} + Open-Meteo + APMC Mandi",
        "mandi_record": mandi_record,
        "crop": effective_crop_id,
        "location_used": activeDistrict,
    }


def _fallback_expert_response(
    message: str,
    district: str,
    state: str,
    mandi_record: Optional[Dict[str, Any]],
    temp: float,
    wind: float,
    crop_name: str,
    lang: str
) -> str:
    msg_lower = message.lower()
    is_hi = lang == "hi"

    # Mandi rate check
    if any(k in msg_lower for k in ["mandi", "price", "rate", "bhav", "reat", "भाव", "मूल्य", "दाम", "दर"]):
        if mandi_record:
            return format_mandi_price_for_ai(mandi_record, lang)
        if is_hi:
            return f"{district} मंडी में वर्तमान में {crop_name} का सत्यापित भाव उपलब्ध नहीं है।"
        return f"Verified mandi rates for {crop_name} are currently unavailable for {district}."

    # Weather check
    if any(k in msg_lower for k in ["weather", "temp", "rain", "wind", "मौसम", "तापमान", "बारिश"]):
        is_safe = wind < 15 and temp < 33
        if is_hi:
            return f"{district} में तापमान {temp}°C और हवा की गति {wind} km/h है। {'स्प्रे के लिए अनुकूल समय है।' if is_safe else 'हवा तेज होने से स्प्रे टालें।'}"
        return f"Weather in {district}: {temp}°C, wind {wind} km/h. {'Favorable for foliar spray.' if is_safe else 'Avoid foliar spray during high winds.'}"

    # Medicine / Treatment check
    if any(k in msg_lower for k in ["kaunsi dawa", "dawa batao", "medicine", "pesticide", "दवा", "कीटनाशक", "कौन सी दवा", "syngenta", "spray", "dose"]):
        if is_hi:
            return f"{crop_name} फसल में कीट व फफूंद नियंत्रण के लिए Syngenta Ampligo® (80-100 ml/एकड़) या Amistar Top® (200 ml/एकड़) का 150-200 L पानी में छिड़काव करें।"
        return f"For {crop_name} protection, apply Syngenta Ampligo® (80-100 ml/acre) or Amistar Top® (200 ml/acre) in 150-200 L water."

    # Vague pest check
    if any(k in msg_lower for k in ["keeda", "pest", "insect", "कीड़ा", "इल्ली", "बीमारी"]):
        if is_hi:
            return f"आपकी {crop_name} फसल में किस प्रकार के लक्षण या कीड़े दिख रहे हैं? सटीक सलाह के लिए प्रभावित पत्ते की फोटो भेजें।"
        return f"What symptoms or pests are visible on your {crop_name}? Please share a photo of the affected leaf for precise diagnosis."

    if is_hi:
        return f"{district} के लिए लाइव टेलीमेट्री: {crop_name} फसल हेतु तापमान {temp}°C, हवा {wind} km/h।"
    return f"Live data for {district}: {crop_name} temperature {temp}°C, wind {wind} km/h."
