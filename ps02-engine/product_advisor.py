"""
Product Advisor Pipeline Orchestrator

Executes the full advisory pipeline:
weather -> CE Hub -> ML -> image_analysis -> input_builder -> decision_engine -> response
"""

import sys
import asyncio
import logging
from pathlib import Path
from datetime import date, timedelta

# Add backend to path to import the new services
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.append(str(backend_path))

from app.services.meteoblue.adapter import fetch_weather_daily
from app.services.cehub.adapter import get_hydric_stress, get_gdd, get_spray_window
from app.services.image_analysis import analyse_crop_image
from app.services.input_builder import build_engine_input
from app.services.decision_engine import recommend

logger = logging.getLogger(__name__)


class SyngentaProductAdvisor:
    """
    Orchestrates the new backend service pipeline, completely replacing
    the old rule-based logic.
    """

    async def get_advisory(
        self,
        lat: float,
        lon: float,
        crop: str = "unknown",
        crop_image_bytes: bytes = None,
        soil_image_bytes: bytes = None,
        ml_stress_score: float = 0.0,
    ) -> dict:
        """
        Run the end-to-end product recommendation pipeline.
        """
        today = date.today()
        start = today - timedelta(days=14)

        logger.info("Starting product advisor pipeline for %s at %s, %s", crop, lat, lon)

        # 1. Weather Data (Meteoblue)
        weather_data = await fetch_weather_daily(lat, lon, start, today)

        # 2. CE Hub Data
        hydric = await get_hydric_stress(lat, lon, mode="past")
        gdd = await get_gdd(lat, lon, mode="past")
        spray = await get_spray_window(lat, lon, mode="future")

        # 3. ML Score (Passed in directly to this pipeline)
        
        # 4. Image Analysis (Gemini Vision)
        image_data = None
        if crop_image_bytes:
            try:
                image_data = await analyse_crop_image(
                    crop_image_bytes=crop_image_bytes,
                    soil_image_bytes=soil_image_bytes
                )
            except Exception as e:
                logger.error("Image analysis failed: %s", e)

        # 5. Input Builder (Data Fusion)
        engine_input = build_engine_input(
            image_analysis=image_data,
            weather=weather_data,
            hydric_stress_data=hydric,
            gdd_data=gdd,
            spray_window_data=spray,
            fallback_crop=crop,
            ml_stress_score=ml_stress_score,
        )

        # 6. Decision Engine (Recommendation Generation)
        response = recommend(engine_input)

        return {
            "pipeline_status": "success",
            "fused_inputs": engine_input,
            "recommendation": response
        }
