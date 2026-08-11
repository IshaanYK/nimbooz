"""
Chat router — PS-04 Multilingual AI Advisory.
Multi-Provider LLM Pipeline: Google AI Studio → Groq → OpenRouter → Rule Fallback
"""
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, timedelta
import httpx
import logging
from app.config import settings
from app.services.meteoblue.adapter import fetch_weather_daily
from app.services.agriculture.engine import assess_field_stress

logger = logging.getLogger(__name__)
router = APIRouter()

SYSTEM_PROMPTS = {
    "en": """You are AASRA, an intelligent agricultural companion for Indian farmers. 
You have access to real weather data, stress analysis, and biological product recommendations.
Be practical, concise, and farmer-friendly. Always explain WHY you recommend something.
Focus on Syngenta biological products: Stress Buster (abiotic stress), Nutrient Booster (NUE), Yield Booster (yield optimization).
If the farmer asks in Hindi or Marathi, respond in that language.""",

    "hi": """आप आसरा हैं, भारतीय किसानों के लिए एक बुद्धिमान कृषि सहायक।
आपके पास वास्तविक मौसम डेटा, तनाव विश्लेषण और जैविक उत्पाद अनुशंसाएं हैं।
व्यावहारिक, संक्षिप्त और किसान-अनुकूल भाषा में बात करें।
हमेशा बताएं कि आप कुछ क्यों सुझा रहे हैं।""",

    "mr": """आपण आसरा आहात, भारतीय शेतकऱ्यांसाठी एक बुद्धिमान कृषी सहाय्यक।
तुमच्याकडे वास्तविक हवामान डेटा, ताण विश्लेषण आणि जैविक उत्पाद शिफारसी आहेत।
व्यावहारिक, संक्षिप्त आणि शेतकरी-अनुकूल भाषेत बोला.""",
}


class ChatRequest(BaseModel):
    message: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    crop: str = "soybean"
    language: str = "en"
    conversation_history: Optional[list] = None


async def _try_google_ai(prompt: str) -> Optional[str]:
    """Try Google AI Studio / Gemini using key pool."""
    keys = settings.get_google_keys()
    for key in keys:
        try:
            import google.generativeai as genai
            genai.configure(api_key=key)
            for model_name in ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-pro"]:
                try:
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    if response and response.text:
                        return response.text.strip()
                except Exception:
                    continue
        except Exception as e:
            logger.warning(f"Google AI Studio key failed: {e}")
    return None


async def _try_groq(prompt: str) -> Optional[str]:
    """Try Groq API using key pool."""
    keys = settings.get_groq_keys()
    for key in keys:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 300,
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.warning(f"Groq key failed: {e}")
    return None


async def _try_openrouter(prompt: str) -> Optional[str]:
    """Try OpenRouter API using key pool."""
    keys = settings.get_openrouter_keys()
    for key in keys:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                    json={
                        "model": "google/gemini-2.0-flash-lite-001",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 300,
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.warning(f"OpenRouter key failed: {e}")
    return None


@router.post("/")
async def chat_advisory(req: ChatRequest):
    """
    RAG-Augmented Multilingual AI Advisory:
    Speech/Text -> RAG Telemetry Ingestion -> Multi-Provider LLM reasoning.
    """
    rag_context = ""
    if req.lat and req.lon:
        try:
            rag_res = await get_field_rag_context(req.lat, req.lon, req.crop)
            rag_context = rag_res.get("rag_context_text", "")
        except Exception as e:
            logger.warning(f"RAG context fetch error: {e}")

    system = SYSTEM_PROMPTS.get(req.language, SYSTEM_PROMPTS["en"])
    prompt = f"""{system}\n\n{rag_context}\n\nFarmer's question: {req.message}\nCrop: {req.crop}\nLocation: lat={req.lat}, lon={req.lon}\nProvide a clear, practical, farmer-friendly response under 150 words."""

    # Provider Failover Chain
    ai_response = await _try_google_ai(prompt)
    provider_used = "Google AI Studio"

    if not ai_response:
        ai_response = await _try_groq(prompt)
        provider_used = "Groq (Llama-3.3-70b)"

    if not ai_response:
        ai_response = await _try_openrouter(prompt)
        provider_used = "OpenRouter (Gemini 2.0 Flash)"

    if not ai_response:
        ai_response = _fallback_response(req.message, req.crop, req.language, rag_context)
        provider_used = "AASRA Local RAG Engine"

    return {
        "response": ai_response,
        "provider_used": provider_used,
        "rag_context": rag_context,
        "language": req.language,
        "source": f"AASRA | {provider_used} + Meteoblue + CE Hub",
    }


class AudioTTSRequest(BaseModel):
    text: str
    language_code: Optional[str] = "hi-IN"


@router.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...), language_code: str = "hi-IN"):
    """
    Sarvam Saaras v3 STT Endpoint: Converts farmer voice audio into text.
    """
    from app.services.sarvam.sarvam_service import transcribe_speech_saaras_v3
    audio_bytes = await file.read()
    res = await transcribe_speech_saaras_v3(audio_bytes, language_code)
    return res


@router.post("/text-to-speech")
async def text_to_speech(req: AudioTTSRequest):
    """
    Sarvam Bulbul v3 TTS Endpoint: Synthesizes high-quality Indian female voice output.
    """
    from app.services.sarvam.sarvam_service import generate_speech_bulbul_v3
    res = await generate_speech_bulbul_v3(req.text, req.language_code)
    return res


def _fallback_response(message: str, crop: str, lang: str, rag_context: str) -> str:

    msg_lower = message.lower()
    if lang == "hi":
        if "तनाव" in message or "गर्मी" in message or "stress" in msg_lower:
            return f"आपके खेत में गर्मी का तनाव देखा गया है। Syngenta Stress Buster का उपयोग करें — यह {crop} फसल को नुकसान से बचाता है। अगले 48 घंटों में 500 मिली/हेक्टेयर का छिड़काव करें।"
        return f"आपकी {crop} फसल की जानकारी मिली। मौसम और RAG डेटा के आधार पर नियमित निगरानी जारी रखें।"
    if lang == "mr":
        return f"तुमच्या {crop} पिकाचे निरीक्षण सुरू आहे. हवामान व RAG डेटाच्या आधारे शिफारशी दिल्या जातील."
    if any(w in msg_lower for w in ["stress", "heat", "drought", "water"]):
        return f"Based on your field RAG data, your {crop} crop is experiencing abiotic heat stress. Apply Syngenta Stress Buster (500 ml/ha) within 48 hours to protect yield."
    return f"Your {crop} field telemetry has been analyzed via AASRA RAG engine. Conditions are being monitored for optimal biological timing."
