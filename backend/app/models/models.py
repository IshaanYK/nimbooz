"""
AASRA Database Models
Core entities for the agricultural intelligence platform.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, JSON,
    ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


# ─────────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────────

class Language(str, enum.Enum):
    EN = "en"
    HI = "hi"
    MR = "mr"
    TA = "ta"
    TE = "te"


class CropType(str, enum.Enum):
    SOYBEAN = "soybean"
    COTTON = "cotton"
    RICE = "rice"
    WHEAT = "wheat"
    MAIZE = "maize"
    CHICKPEA = "chickpea"
    MUSTARD = "mustard"
    SUGARCANE = "sugarcane"
    OTHER = "other"


class IrrigationType(str, enum.Enum):
    RAINFED = "rainfed"
    DRIP = "drip"
    FLOOD = "flood"
    SPRINKLER = "sprinkler"
    CANAL = "canal"


class SoilType(str, enum.Enum):
    SANDY = "sandy"
    CLAY = "clay"
    LOAM = "loam"
    SILTY = "silty"
    UNKNOWN = "unknown"


class StressType(str, enum.Enum):
    HEAT = "heat"
    DROUGHT = "drought"
    FLOOD = "flood"
    COLD = "cold"
    COMPOUND = "compound"
    DISEASE = "disease"
    PEST = "pest"


class StressLevel(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class InterventionType(str, enum.Enum):
    FOLIAR = "foliar"
    SOIL = "soil"
    SEED_TREATMENT = "seed_treatment"
    FERTIGATION = "fertigation"


class Product(str, enum.Enum):
    ISABION = "isabion"
    QUANTIS = "quantis"
    COUCAL = "coucal"
    OTHER = "other"


# ─────────────────────────────────────────────
# USER & FARMER PROFILE
# ─────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False)


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    preferred_language = Column(SAEnum(Language), default=Language.HI)
    state = Column(String(100))
    district = Column(String(100))
    village = Column(String(200))
    latitude = Column(Float)
    longitude = Column(Float)
    total_land_area_acres = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="farmer_profile")
    fields = relationship("Field", back_populates="farmer")


# ─────────────────────────────────────────────
# FIELD & CROP
# ─────────────────────────────────────────────

class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=False)
    name = Column(String(200), nullable=False)
    area_acres = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    soil_type = Column(SAEnum(SoilType), default=SoilType.UNKNOWN)
    irrigation_type = Column(SAEnum(IrrigationType), default=IrrigationType.RAINFED)
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    farmer = relationship("FarmerProfile", back_populates="fields")
    seasons = relationship("FieldSeason", back_populates="field")


class FieldSeason(Base):
    """One crop season on one field."""
    __tablename__ = "field_seasons"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    crop_type = Column(SAEnum(CropType), nullable=False)
    variety = Column(String(200))
    sowing_date = Column(DateTime(timezone=True), nullable=False)
    expected_harvest_date = Column(DateTime(timezone=True))
    actual_harvest_date = Column(DateTime(timezone=True))
    season_name = Column(String(100))  # e.g. "Kharif 2025"
    is_active = Column(Boolean, default=True)
    gdd_accumulated = Column(Float, default=0.0)
    current_stage = Column(String(100))  # e.g. "Flowering (R1)"
    current_stage_code = Column(String(20))  # e.g. "R1"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    field = relationship("Field", back_populates="seasons")
    stress_events = relationship("StressEvent", back_populates="season")
    recommendations = relationship("Recommendation", back_populates="season")
    interventions = relationship("Intervention", back_populates="season")
    yield_record = relationship("YieldRecord", back_populates="season", uselist=False)
    conversations = relationship("Conversation", back_populates="season")


# ─────────────────────────────────────────────
# WEATHER
# ─────────────────────────────────────────────

class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    temp_max = Column(Float)
    temp_min = Column(Float)
    temp_mean = Column(Float)
    precipitation_mm = Column(Float)
    humidity_pct = Column(Float)
    wind_speed_ms = Column(Float)
    solar_radiation_wm2 = Column(Float)
    vpd_kpa = Column(Float)  # Vapor Pressure Deficit
    et0_mm = Column(Float)  # Reference Evapotranspiration
    gdd = Column(Float)     # Growing Degree Days for that day
    source = Column(String(50))  # "meteoblue" | "ce_hub" | "demo"
    is_forecast = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────
# STRESS & RECOMMENDATIONS
# ─────────────────────────────────────────────

class StressEvent(Base):
    __tablename__ = "stress_events"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("field_seasons.id"), nullable=False)
    stress_type = Column(SAEnum(StressType), nullable=False)
    stress_level = Column(SAEnum(StressLevel), nullable=False)
    detected_date = Column(DateTime(timezone=True), nullable=False)
    expected_start = Column(DateTime(timezone=True))
    expected_end = Column(DateTime(timezone=True))
    actual_start = Column(DateTime(timezone=True))
    actual_end = Column(DateTime(timezone=True))
    probability_pct = Column(Float)  # 0-100
    crop_stage_at_detection = Column(String(100))
    weather_variables = Column(JSON)  # Snapshot of triggering weather
    source = Column(String(50))  # "ce_hub" | "meteoblue" | "calculated" | "demo"
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    season = relationship("FieldSeason", back_populates="stress_events")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("field_seasons.id"), nullable=False)
    stress_event_id = Column(Integer, ForeignKey("stress_events.id"), nullable=True)
    product = Column(SAEnum(Product), nullable=False)
    recommended_date = Column(DateTime(timezone=True), nullable=False)
    application_window_start = Column(DateTime(timezone=True))
    application_window_end = Column(DateTime(timezone=True))
    application_type = Column(SAEnum(InterventionType))
    confidence_pct = Column(Float)
    reasoning = Column(JSON)  # Structured explanation
    evidence_sources = Column(JSON)  # Data sources used
    is_accepted = Column(Boolean)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    season = relationship("FieldSeason", back_populates="recommendations")
    stress_event = relationship("StressEvent")


# ─────────────────────────────────────────────
# CONVERSATIONS (PS-04)
# ─────────────────────────────────────────────

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("field_seasons.id"), nullable=False)
    language = Column(SAEnum(Language), default=Language.HI)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    season = relationship("FieldSeason", back_populates="conversations")
    messages = relationship("ConversationMessage", back_populates="conversation")


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20))  # "user" | "assistant"
    content = Column(Text, nullable=False)
    language = Column(SAEnum(Language))
    intent = Column(String(100))  # "ask_status" | "ask_recommendation" | etc.
    context_snapshot = Column(JSON)  # Field context at time of message
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")


# ─────────────────────────────────────────────
# INTERVENTION JOURNAL (PS-04/07)
# ─────────────────────────────────────────────

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("field_seasons.id"), nullable=False)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"), nullable=True)
    stress_event_id = Column(Integer, ForeignKey("stress_events.id"), nullable=True)
    product = Column(SAEnum(Product), nullable=False)
    application_date = Column(DateTime(timezone=True), nullable=False)
    application_type = Column(SAEnum(InterventionType))
    area_treated_acres = Column(Float)
    cost_per_acre_inr = Column(Float)
    total_cost_inr = Column(Float)
    crop_stage_at_application = Column(String(100))
    weather_at_application = Column(JSON)  # Temp, humidity, wind at time
    days_before_stress = Column(Integer)   # Negative = after stress
    user_notes = Column(Text)
    # IMPORTANT: We never invent dosage. It's optional.
    dosage_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    season = relationship("FieldSeason", back_populates="interventions")
    recommendation = relationship("Recommendation")
    stress_event = relationship("StressEvent")


# ─────────────────────────────────────────────
# YIELD & OUTCOME (PS-07)
# ─────────────────────────────────────────────

class YieldRecord(Base):
    __tablename__ = "yield_records"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("field_seasons.id"), nullable=False)
    harvest_date = Column(DateTime(timezone=True), nullable=False)
    actual_yield_q_per_acre = Column(Float, nullable=False)  # Quintals per acre
    total_yield_quintals = Column(Float)
    market_price_inr_per_quintal = Column(Float)
    total_revenue_inr = Column(Float)
    other_input_cost_inr = Column(Float)
    farmer_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    season = relationship("FieldSeason", back_populates="yield_record")
    outcome_analysis = relationship("OutcomeAnalysis", back_populates="yield_record", uselist=False)


class OutcomeAnalysis(Base):
    """PS-07: Weather-adjusted yield attribution."""
    __tablename__ = "outcome_analyses"

    id = Column(Integer, primary_key=True, index=True)
    yield_record_id = Column(Integer, ForeignKey("yield_records.id"), nullable=False)

    # Baseline
    baseline_yield_q_per_acre = Column(Float)
    baseline_method = Column(String(200))
    weather_adjusted_baseline = Column(Float)

    # Decomposition
    base_yield = Column(Float)
    weather_effect = Column(Float)
    soil_effect = Column(Float)
    management_effect = Column(Float)
    biological_effect_low = Column(Float)
    biological_effect_mid = Column(Float)
    biological_effect_high = Column(Float)
    residual = Column(Float)

    # Confidence
    confidence_pct = Column(Float)
    data_quality_score = Column(Float)  # 0-1 based on data completeness
    method = Column(String(200))
    limitations = Column(JSON)
    data_sources = Column(JSON)

    # ROBI
    robi_result_id = Column(Integer, ForeignKey("robi_results.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    yield_record = relationship("YieldRecord", back_populates="outcome_analysis")
    robi_result = relationship("ROBIResult")


class ROBIResult(Base):
    """Return on Biological Investment."""
    __tablename__ = "robi_results"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("field_seasons.id"), nullable=False)

    # Inputs
    product_cost_inr_per_acre = Column(Float)
    total_product_cost_inr = Column(Float)
    market_price_inr_per_quintal = Column(Float)

    # Estimated yield gain
    estimated_yield_gain_low = Column(Float)   # q/acre
    estimated_yield_gain_mid = Column(Float)
    estimated_yield_gain_high = Column(Float)

    # Value
    estimated_value_low_inr = Column(Float)
    estimated_value_mid_inr = Column(Float)
    estimated_value_high_inr = Column(Float)

    # Net benefit
    net_benefit_low_inr = Column(Float)
    net_benefit_mid_inr = Column(Float)
    net_benefit_high_inr = Column(Float)

    # ROBI %
    robi_pct_low = Column(Float)
    robi_pct_mid = Column(Float)
    robi_pct_high = Column(Float)

    confidence_pct = Column(Float)
    is_modelled = Column(Boolean, default=True)  # Always label as modelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
