"""
AASRA FastAPI Backend — Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routers import weather, advisory, fields, chat, impact, journal, ps02_ps03

app = FastAPI(
    title="AASRA API",
    description="Intelligent Agricultural Companion — PS-02, PS-03, PS-04 & PS-07",
    version="1.0.0",
)

# CORS — Allow all origins in dev for seamless connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(weather.router,          prefix="/api/weather",            tags=["Weather"])
app.include_router(advisory.router,         prefix="/api/advisory",           tags=["Advisory"])
app.include_router(fields.router,           prefix="/api/fields",             tags=["Fields"])
app.include_router(chat.router,             prefix="/api/chat",               tags=["Chat"])
app.include_router(impact.router,           prefix="/api/impact",             tags=["Impact / ROBI"])
app.include_router(journal.router,          prefix="/api/journal",            tags=["Intervention Journal"])
app.include_router(ps02_ps03.router,        prefix="/api/plant-intelligence", tags=["Plant Intelligence (PS-02 & PS-03)"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "app": "AASRA", "version": "1.0.0"}


@app.get("/api/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "demo_mode": settings.DEMO_MODE,
        "meteoblue_configured": bool(settings.METEOBLUE_API_KEY),
        "cehub_configured": bool(settings.CEHUB_API_KEY),
        "gemini_configured": bool(settings.GOOGLE_API_KEY),
        "ps02_engine_configured": True,
    }
