"""
Image Analysis Service — Gemini Vision API
Analyses crop images for stress detection and optionally extracts
NPK values from soil-report photographs.

Returns strictly structured JSON, no explanation text.
"""

import json
import base64
import logging
import random
from typing import Optional, Dict, Any

import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────
# Prompt templates
# ─────────────────────────────────────────────────────────────────

_CROP_ONLY_PROMPT = """\
You are an agricultural vision expert. Analyse the crop image provided.

Return ONLY a JSON object — no markdown, no explanation, no code fences.

Schema:
{
  "crop_detected": "<crop name, e.g. wheat, rice, cotton, maize, soybean, etc.>",
  "stress_type": "<one of: heat, drought, disease, growth, none>",
  "severity": <float 0.0 – 1.0, where 0 = healthy and 1 = extreme stress>,
  "npk": null
}

Rules:
- Identify the crop species visible in the image.
- Determine the primary stress type based on visual cues (leaf discoloration, wilting, lesions, stunted growth, etc.).
- If the crop looks healthy with no visible stress, set stress_type to "none" and severity to 0.0.
- Return ONLY the raw JSON object.
"""

_CROP_AND_SOIL_PROMPT = """\
You are an agricultural vision expert. You will receive TWO images:
1. A crop field photograph.
2. A soil test / soil health report image (may be a lab printout, card, or document).

Return ONLY a JSON object — no markdown, no explanation, no code fences.

Schema:
{
  "crop_detected": "<crop name, e.g. wheat, rice, cotton, maize, soybean, etc.>",
  "stress_type": "<one of: heat, drought, disease, growth, none>",
  "severity": <float 0.0 – 1.0, where 0 = healthy and 1 = extreme stress>,
  "npk": {
    "n": <float or null — nitrogen value from soil report>,
    "p": <float or null — phosphorus value from soil report>,
    "k": <float or null — potassium value from soil report>
  }
}

Rules:
- From the crop image: identify species, stress type, and severity.
- From the soil report image: extract N, P, and K values.
  Use the numeric value as-is from the report (typically in kg/ha or ppm).
  If a specific nutrient is not legible or not present in the report, set that field to null.
- If the crop looks healthy with no visible stress, set stress_type to "none" and severity to 0.0.
- Return ONLY the raw JSON object.
"""

# ─────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────

def _get_api_key() -> str:
    """Pick a random available Google API key for load distribution."""
    keys = settings.get_google_keys()
    if not keys:
        raise RuntimeError("No GOOGLE_API_KEY configured. Set at least one key in .env")
    return random.choice(keys)


def _image_to_part(image_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """Convert raw image bytes into a Gemini-compatible inline_data part."""
    return {
        "inline_data": {
            "mime_type": mime_type,
            "data": base64.b64encode(image_bytes).decode("utf-8"),
        }
    }


def _sanitise_json_text(raw: str) -> str:
    """Strip markdown code fences or stray whitespace around JSON."""
    text = raw.strip()
    if text.startswith("```"):
        # Remove opening fence (possibly ```json)
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


# ─────────────────────────────────────────────────────────────────
# Core analysis function
# ─────────────────────────────────────────────────────────────────

async def analyse_crop_image(
    crop_image_bytes: bytes,
    crop_mime_type: str = "image/jpeg",
    soil_image_bytes: Optional[bytes] = None,
    soil_mime_type: str = "image/jpeg",
) -> Dict[str, Any]:
    """
    Analyse a crop image (and optional soil report image) via Gemini Vision.

    Parameters
    ----------
    crop_image_bytes : bytes
        Raw bytes of the crop photograph.
    crop_mime_type : str
        MIME type of the crop image (default ``image/jpeg``).
    soil_image_bytes : bytes | None
        Raw bytes of the soil report image, if available.
    soil_mime_type : str
        MIME type of the soil report image (default ``image/jpeg``).

    Returns
    -------
    dict
        Structured analysis result matching the documented JSON schema.
    """
    api_key = _get_api_key()
    genai.configure(api_key=api_key)

    model = genai.GenerativeModel("gemini-2.0-flash")

    # Build multimodal content parts
    if soil_image_bytes is not None:
        prompt_text = _CROP_AND_SOIL_PROMPT
        content_parts = [
            prompt_text,
            _image_to_part(crop_image_bytes, crop_mime_type),
            _image_to_part(soil_image_bytes, soil_mime_type),
        ]
    else:
        prompt_text = _CROP_ONLY_PROMPT
        content_parts = [
            prompt_text,
            _image_to_part(crop_image_bytes, crop_mime_type),
        ]

    logger.info(
        "Sending image analysis request to Gemini (soil_report=%s)",
        soil_image_bytes is not None,
    )

    try:
        response = model.generate_content(
            content_parts,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                max_output_tokens=512,
            ),
        )
    except Exception as exc:
        logger.error("Gemini Vision API call failed: %s", exc)
        raise RuntimeError(f"Gemini Vision API error: {exc}") from exc

    raw_text = response.text
    logger.debug("Gemini raw response: %s", raw_text)

    # Parse JSON from model output
    try:
        result = json.loads(_sanitise_json_text(raw_text))
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse Gemini response as JSON: %s", raw_text)
        raise ValueError(
            f"Model returned non-JSON output. Raw text: {raw_text[:300]}"
        ) from exc

    # Validate / coerce essential fields
    result.setdefault("crop_detected", "unknown")
    result.setdefault("stress_type", "none")
    result.setdefault("severity", 0.0)

    if soil_image_bytes is None:
        result["npk"] = None
    else:
        result.setdefault("npk", None)

    # Clamp severity to [0, 1]
    try:
        result["severity"] = max(0.0, min(1.0, float(result["severity"])))
    except (TypeError, ValueError):
        result["severity"] = 0.0

    return result
