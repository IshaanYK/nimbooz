import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render total page count,
    running headers, and running footers with corporate aesthetic.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Running Top Header (Pages > 1)
        if self._pageNumber > 1:
            self.drawString(50, 11 * inch - 34, "AASRA - 6-MODEL LINEAR INPUT & API PROVENANCE SPECIFICATION")
            self.setFont("Helvetica", 8)
            self.drawRightString(8.5 * inch - 50, 11 * inch - 34, "Google Vertex AI & Syngenta Biologicals Pipeline")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.75)
            self.line(50, 11 * inch - 40, 8.5 * inch - 50, 11 * inch - 40)
            
        # Running Bottom Footer (All Pages)
        self.setFont("Helvetica-Bold", 8)
        self.drawString(50, 28, "AASRA Platform | Team 02 (Google & Syngenta Hackathon 2026)")
        self.setFont("Helvetica", 8)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 50, 28, page_text)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(50, 38, 8.5 * inch - 50, 38)
        self.restoreState()

def generate_pdf(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=48,
        rightMargin=48,
        topMargin=46,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()

    # Premium Color Palette
    c_primary = colors.HexColor("#0F172A")    # Deep Navy
    c_blue = colors.HexColor("#1A73E8")       # Google Cloud Blue
    c_emerald = colors.HexColor("#059669")    # Syngenta Leaf Green
    c_amber = colors.HexColor("#D97706")      # Warm Warning Amber
    c_slate = colors.HexColor("#334155")      # Text Charcoal
    c_subtext = colors.HexColor("#64748B")    # Secondary Gray
    c_bg_light = colors.HexColor("#F8FAFC")   # Crisp Card BG
    c_border = colors.HexColor("#CBD5E1")     # Light Border
    c_header_bg = colors.HexColor("#1E293B")  # Dark Table Header

    # Typography & Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=21,
        textColor=c_primary,
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13.5,
        textColor=c_blue,
        spaceAfter=7
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=11,
        textColor=c_slate
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=c_primary,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.2,
        leading=12,
        textColor=c_emerald,
        spaceBefore=5,
        spaceAfter=2,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=11,
        textColor=c_slate,
        spaceAfter=3.5
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=c_primary
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.4,
        leading=10.2,
        textColor=colors.HexColor("#1E293B")
    )

    table_th = ParagraphStyle(
        'TableTH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.5,
        textColor=colors.white
    )

    table_td = ParagraphStyle(
        'TableTD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.0,
        leading=9.4,
        textColor=c_slate
    )

    table_td_bold = ParagraphStyle(
        'TableTDBold',
        parent=table_td,
        fontName='Helvetica-Bold',
        textColor=c_primary
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.5,
        leading=8.3,
        textColor=colors.HexColor("#0F172A")
    )

    code_inline = ParagraphStyle(
        'CodeInline',
        parent=table_td,
        fontName='Courier',
        fontSize=6.8,
        leading=8.8,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # ==================== PAGE 1: COVER & MASTER DATA PROVENANCE ====================
    story.append(Paragraph("AASRA: 6-Model Modular Machine Learning System", title_style))
    story.append(Paragraph("Comprehensive Linear Feature Engineering & Exact API Input Source Specification", subtitle_style))

    meta_text = (
        "<b>Project Context:</b> AASRA — Syngenta Biologicals Yield Protection Overwatch | <b>Team 02:</b> Divyansh, Rishabh, Sameer, Ishaan, Ritvik<br/>"
        "<b>Target Platforms:</b> Google Vertex AI Model Registry, Next.js Live Production Gateway, WhatsApp Conversational Layer<br/>"
        "<b>Specification Scope:</b> Exact API endpoints, HTTP methods, request parameters, JSON response keys, and inter-model data contracts."
    )
    meta_table = Table([[Paragraph(meta_text, meta_style)]], colWidths=[516])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_bg_light),
        ('BOX', (0, 0), (-1, -1), 0.75, c_border),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 4))

    exec_summary = (
        "<b>Architectural Foundation:</b> AASRA decouples agricultural intelligence into 6 specialized, leak-proof models executed "
        "in a strict linear pipeline. Every single model is mathematically tuned for its distinct agronomic purpose: "
        "Model 1 classifies impending climate stress; Model 2 predicts stomatal readiness; Model 3 ranks biological interventions; "
        "Model 4 predicts non-linear dosage response; Model 5 forecasts counterfactual baseline yield; and Model 6 calculates "
        "unbiased Return on Biological Investment (ROBI) via Double Machine Learning. Below is the comprehensive directory "
        "of exact API input endpoints and the linear model specifications."
    )
    story.append(Paragraph(exec_summary, body_style))
    story.append(Spacer(1, 4))

    story.append(HRFlowable(width="100%", thickness=1.5, color=c_blue, spaceBefore=2, spaceAfter=4))
    story.append(Paragraph("1. Master API & Data Telemetry Provenance Directory", h1_style))
    story.append(Paragraph(
        "All real-time features ingest directly from live, production-grade endpoints with authenticated credentials:",
        body_style
    ))

    provenance_rows = [
        [Paragraph("Category & Data Source", table_th), Paragraph("Exact Live Endpoints & Protocols", table_th), Paragraph("Telemetry Variables Extracted", table_th), Paragraph("Downstream Pipeline Consumer", table_th)],
        [
            Paragraph("<b>Meteoblue Dataset API</b><br/><code>synJg7GEMeblkyn6QY</code>", table_td_bold),
            Paragraph("<code>POST https://my.meteoblue.com/dataset/query</code><br/>Auth: <code>?apikey=KEY</code><br/>Fallback: <code>GET /packages/basic-day</code>", table_td),
            Paragraph("Max Temp (Code 11, max), Min Temp (Code 11, min), Mean Temp (Code 11, mean), Rain (Code 61, sum), Soil Moisture 0-10cm (Code 144, mean), ET0 (Code 261), Wind Speed (Code 32).", table_td),
            Paragraph("Feeds Model 1 (Stress Risk), Model 2 (Readiness Gate), Model 5 (Seasonal Baseline).", table_td)
        ],
        [
            Paragraph("<b>Syngenta CE Hub API</b><br/><code>b5428df1...cb98</code>", table_td_bold),
            Paragraph("<code>GET https://services.cehub.syngenta-ais.com/api/AgronomicsDecisionRecommendation/</code><br/>Headers: <code>ApiKey: KEY</code>", table_td),
            Paragraph("<code>/GDDRecommendation</code>: accumulated GDD.<br/><code>/HydricStressRecommendation</code>: water deficit.<br/><code>/SprayWindowRecommendation</code>: Delta-T & spray hours.", table_td),
            Paragraph("Cross-validates Meteoblue telemetry. Dual-sensor consensus triggers high-confidence gates.", table_td)
        ],
        [
            Paragraph("<b>Open-Meteo API</b><br/>Free / Open-Source", table_td_bold),
            Paragraph("<code>GET https://api.open-meteo.com/v1/forecast</code><br/>Params: <code>hourly=temperature_2m,relative_humidity_2m...</code>", table_td),
            Paragraph("Granular hourly 2m temperature, relative humidity %, precipitation probability %, and surface wind speed (km/h).", table_td),
            Paragraph("Backup & high-resolution time-of-day spray window calculation in Model 2.", table_td)
        ],
        [
            Paragraph("<b>ISRIC SoilGrids REST API</b><br/>Global 250m Resolution", table_td_bold),
            Paragraph("<code>GET https://rest.isric.org/soilgrids/v2.0/properties/query</code><br/>Properties: <code>phh2o, soc, clay, silt, sand</code>", table_td),
            Paragraph("Soil pH in H2O (0-15cm, /10 scale), Soil Organic Carbon (SOC dg/kg to %), Clay % fraction, Silt %, Sand %.", table_td),
            Paragraph("Feeds Model 3 (soil pH compatibility), Model 4 (SOC nutrient uptake), Model 5 (water retention).", table_td)
        ],
        [
            Paragraph("<b>Government Open Data</b><br/>Agmarknet & data.gov.in", table_td_bold),
            Paragraph("<code>GET https://api.data.gov.in/resource/...</code><br/>Scraper: <code>https://agmarknet.gov.in/SearchCmmMkt.aspx</code>", table_td),
            Paragraph("Daily APMC mandi modal price (INR/quintal), 5-year seasonal price trends, 10-year district crop yields.", table_td),
            Paragraph("Feeds Model 5 (district counterfactual baseline) and Model 6 (ROBI monetization).", table_td)
        ],
        [
            Paragraph("<b>ICRISAT VDSA Database</b><br/>Open Research Data", table_td_bold),
            Paragraph("<code>http://data.icrisat.org/dld/</code><br/>Meso-level district agricultural time series", table_td),
            Paragraph("Rainfed crop yield distributions, input expenditure distributions, extreme dry-spell yield impacts.", table_td),
            Paragraph("Training baseline for Model 5 and confounding covariate weights for Model 6.", table_td)
        ],
        [
            Paragraph("<b>Farmer Field Twin</b><br/>Direct Farmer Inputs", table_td_bold),
            Paragraph("AASRA Onboarding Form & Mobile Geolocation<br/>Local device GPS: <code>navigator.geolocation</code>", table_td),
            Paragraph("Crop variety (Soybean JS-335, Potato, Wheat), Sowing Date, Exact GPS coordinates, Soil Type, Farm Size, Irrigation.", table_td),
            Paragraph("Initiates GDD accumulation clock, anchors GIS queries, and establishes treatment cohorts.", table_td)
        ]
    ]

    prov_table = Table(provenance_rows, colWidths=[105, 125, 175, 111])
    prov_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 2.8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(prov_table)

    # Page Break to Page 2
    story.append(PageBreak())

    # ==================== PAGE 2: LIVE API CONNECTION SPECS & JSON PATHS ====================
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_blue, spaceBefore=2, spaceAfter=4))
    story.append(Paragraph("2. Technical API Connection Blueprints & Response JSON Mapping", h1_style))
    story.append(Paragraph(
        "Below are the verified, exact request contracts, HTTP methods, authentication schemes, and JSON response paths "
        "used by AASRA's data ingestion layer to extract input features for model inference:",
        body_style
    ))

    api_specs = [
        [Paragraph("API Provider", table_th), Paragraph("Request Method, URL & Parameters", table_th), Paragraph("Request Body / Payload Sample", table_th), Paragraph("Exact JSON Response Path Extracted", table_th)],
        [
            Paragraph("<b>Meteoblue Dataset API</b><br/>Weather & Soil Telemetry", table_td_bold),
            Paragraph("<b>POST</b> <code>https://my.meteoblue.com/dataset/query?apikey=synJg7GEMeblkyn6QY</code><br/>Headers: <code>Content-Type: application/json</code><br/><b>Critical:</b> Coordinates are <code>[lon, lat]</code>!", table_td),
            Paragraph("<code>{\n  \"geometry\": {\"type\": \"MultiPoint\", \"coordinates\": [[76.56, 18.40]]},\n  \"timeIntervals\": [\"2026-06-15T+00:00/2026-06-22T+00:00\"],\n  \"queries\": [{\n    \"domain\": \"NEMSGLOBAL\",\n    \"timeResolution\": \"daily\",\n    \"codes\": [\n      {\"code\": 11, \"level\": \"2 m above gnd\", \"aggregation\": \"max\"},\n      {\"code\": 11, \"level\": \"2 m above gnd\", \"aggregation\": \"min\"},\n      {\"code\": 61, \"level\": \"sfc\", \"aggregation\": \"sum\"},\n      {\"code\": 144, \"level\": \"0-10 cm down\", \"aggregation\": \"mean\"}\n    ]\n  }]\n}</code>", code_style),
            Paragraph("• <code>temp_max</code>: <code>data[0].coordinates[0].dates[i].value</code> (Code 11 max)<br/>• <code>temp_min</code>: <code>data[1].coordinates[0].dates[i].value</code> (Code 11 min)<br/>• <code>rainfall</code>: <code>data[2].coordinates[0].dates[i].value</code> (Code 61 sum)<br/>• <code>soil_moisture</code>: <code>data[3].coordinates[0].dates[i].value</code> (Code 144 mean)", table_td)
        ],
        [
            Paragraph("<b>Syngenta CE Hub API</b><br/>GDD & Phenology", table_td_bold),
            Paragraph("<b>GET</b> <code>/api/AgronomicsDecisionRecommendation/GDDRecommendation</code><br/>Headers: <code>ApiKey: b5428df1-abb7-4f52-8a13-ddaed67dcb98</code><br/>Query: <code>latitude, longitude, startDate, endDate, baseLimit=10, maxLimit=35, useEnhancedFormula=true</code>", table_td),
            Paragraph("<i>No body (HTTP GET query parameters).<br/><b>Constraint:</b> Range must be entirely in past or entirely in future.</i>", code_style),
            Paragraph("• <code>crop_gdd_accumulated</code>: <code>response[last].accumlatedValue</code><br/>• <code>daily_gdd_rate</code>: <code>response[i].value</code>", table_td)
        ],
        [
            Paragraph("<b>Syngenta CE Hub API</b><br/>Spray Window Gate", table_td_bold),
            Paragraph("<b>GET</b> <code>/api/AgronomicsDecisionRecommendation/SprayWindowRecommendation</code><br/>Headers: <code>ApiKey: b5428df1...cb98</code><br/>Query: <code>latitude, longitude, startDate, endDate, sprayingType=Biological, top=5, format=json</code>", table_td),
            Paragraph("<i>No body (HTTP GET query parameters).</i>", code_style),
            Paragraph("• <code>spray_window_safe</code>: <code>response[0].isFavorable</code><br/>• <code>delta_t_celsius</code>: <code>response[0].deltaT</code><br/>• <code>optimal_spray_hour</code>: <code>response[0].bestApplicationTime</code>", table_td)
        ],
        [
            Paragraph("<b>Syngenta CE Hub API</b><br/>Hydric Drought Stress", table_td_bold),
            Paragraph("<b>GET</b> <code>/api/AgronomicsDecisionRecommendation/HydricStressRecommendation</code><br/>Headers: <code>ApiKey: b5428df1...cb98</code><br/>Query: <code>latitude, longitude, startDate, endDate, waterAvailabilty=50</code>", table_td),
            Paragraph("<i>Note official API query parameter spelling: <code>waterAvailabilty</code> (missing 'i').</i>", code_style),
            Paragraph("• <code>hydric_stress_level</code>: <code>response[0].stressIndex</code><br/>• <code>drought_deficit_pct</code>: <code>response[0].waterDeficit</code>", table_td)
        ],
        [
            Paragraph("<b>ISRIC SoilGrids REST API</b><br/>Chemical & Physical Soil", table_td_bold),
            Paragraph("<b>GET</b> <code>https://rest.isric.org/soilgrids/v2.0/properties/query</code><br/>Query: <code>lat=18.40&lon=76.56&property=phh2o&property=soc&property=clay&depth=0-5cm&depth=5-15cm&value=mean</code>", table_td),
            Paragraph("<i>No body (Public REST API, no auth required).</i>", code_style),
            Paragraph("• <code>soil_ph</code>: <code>layers[name='phh2o'].depths[0].values.mean / 10.0</code><br/>• <code>soil_organic_carbon_pct</code>: <code>layers[name='soc'].depths[0].values.mean / 100.0</code><br/>• <code>soil_clay_pct</code>: <code>layers[name='clay'].depths[0].values.mean / 10.0</code>", table_td)
        ],
        [
            Paragraph("<b>Agmarknet / data.gov.in</b><br/>Mandi Commodity Pricing", table_td_bold),
            Paragraph("<b>GET</b> <code>https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070</code><br/>Query: <code>api-key=KEY&format=json&filters[state]=Maharashtra&filters[commodity]=Soyabean</code>", table_td),
            Paragraph("<i>No body (Government API key passed via query string).</i>", code_style),
            Paragraph("• <code>mandi_price_per_q</code>: <code>records[0].modal_price</code> (INR/Quintal)<br/>• <code>mandi_min_price</code>: <code>records[0].min_price</code><br/>• <code>mandi_max_price</code>: <code>records[0].max_price</code>", table_td)
        ]
    ]

    api_table = Table(api_specs, colWidths=[90, 140, 130, 156])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(api_table)

    # Page Break to Page 3
    story.append(PageBreak())

    # ==================== PAGE 3: MODEL 1 & MODEL 2 DETAILED INPUT SPECS ====================
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_blue, spaceBefore=2, spaceAfter=4))
    story.append(Paragraph("3. Linear Model Specifications — Stage 1 & Stage 2 (PS-02 Early Warning & Readiness)", h1_style))

    # ---------- MODEL 1 ----------
    story.append(Paragraph("Stage 1: Model 1 — Climate Stress Early Warning Classifier (PS-02)", h2_style))
    story.append(Paragraph(
        "<b>Model Function:</b> Predicts imminent abiotic stress 3 to 7 days before visual damage occurs. "
        "<b>Algorithm:</b> <code>XGBClassifier(n_estimators=200, max_depth=5, learning_rate=0.05)</code> (Classes: 0=Optimal, 1=Heat, 2=Drought, 3=Compound). "
        "<b>Assigned Owner:</b> Divyansh.",
        body_style
    ))

    m1_table_data = [
        [Paragraph("Feature Name", table_th), Paragraph("Type & Range", table_th), Paragraph("Exact API Endpoint & Query", table_th), Paragraph("Exact JSON Response Path / Extraction Logic", table_th)],
        [
            Paragraph("<code>temp_max_forecast_7d</code>", table_td_bold),
            Paragraph("Float (°C)<br/>20.0 to 48.0", table_td),
            Paragraph("<b>Meteoblue Dataset API:</b><br/>POST <code>/dataset/query</code><br/>Domain: <code>NEMSGLOBAL</code>, Code 11, max", table_td),
            Paragraph("<code>response['data'][0]['coordinates'][0]['dates'][i]['value']</code><br/>Aggregated: <code>max(values[:7])</code> across 7-day forecast horizon.", table_td)
        ],
        [
            Paragraph("<code>temp_night_min_7d</code>", table_td_bold),
            Paragraph("Float (°C)<br/>12.0 to 32.0", table_td),
            Paragraph("<b>Meteoblue Dataset API:</b><br/>POST <code>/dataset/query</code><br/>Domain: <code>NEMSGLOBAL</code>, Code 11, min", table_td),
            Paragraph("<code>response['data'][1]['coordinates'][0]['dates'][i]['value']</code><br/>Aggregated: <code>mean(values[:7])</code>. Night temp > 24.5°C blocks cellular recovery.", table_td)
        ],
        [
            Paragraph("<code>rh_avg_forecast_7d</code>", table_td_bold),
            Paragraph("Float (%)<br/>15.0 to 98.0", table_td),
            Paragraph("<b>Open-Meteo Hourly API:</b><br/>GET <code>/v1/forecast?hourly=relative_humidity_2m</code><br/>Fallback: Meteoblue Packages API", table_td),
            Paragraph("<code>response['hourly']['relative_humidity_2m'][:168]</code><br/>Extracted: <code>mean(hourly_rh)</code> over 7-day window.", table_td)
        ],
        [
            Paragraph("<code>vpd_kpa</code>", table_td_bold),
            Paragraph("Float (kPa)<br/>0.5 to 5.5", table_td),
            Paragraph("<b>Derived via Tetens Physics:</b><br/>Calculated from Meteoblue <code>temp_max</code> and Open-Meteo <code>rh_avg</code>", table_td),
            Paragraph("<code>svp = 0.61078 * exp((17.27 * T) / (T + 237.3))</code><br/><code>vpd = svp * (1.0 - rh / 100.0)</code>. Primary biophysical driver of transpiration shutdown.", table_td)
        ],
        [
            Paragraph("<code>soil_moisture_vol_pct</code>", table_td_bold),
            Paragraph("Float (%)<br/>8.0 to 50.0", table_td),
            Paragraph("<b>Meteoblue Dataset API:</b><br/>Code 144 (0-10 cm down, mean)<br/>Cross-checked: <b>CE Hub API</b> HydricStress", table_td),
            Paragraph("<code>response['data'][3]['coordinates'][0]['dates'][i]['value']</code><br/>Cross-validated with CE Hub: <code>100 - response[0]['waterDeficit']</code>. < 20% indicates acute drought.", table_td)
        ],
        [
            Paragraph("<code>consecutive_hot_days</code>", table_td_bold),
            Paragraph("Integer (Days)<br/>0 to 14", table_td),
            Paragraph("<b>Derived Rolling Time-Series:</b><br/>Meteoblue daily temperature history + forecast", table_td),
            Paragraph("Count of consecutive days where <code>daily_tmax > 35.0°C</code>. Prolonged continuous heat causes cellular protein coagulation.", table_td)
        ],
        [
            Paragraph("<code>crop_gdd_accumulated</code>", table_td_bold),
            Paragraph("Float (°C-days)<br/>0 to 2500", table_td),
            Paragraph("<b>Syngenta CE Hub API:</b><br/>GET <code>/GDDRecommendation</code><br/>Params: <code>startDate={sowing_date}, baseLimit=10</code>", table_td),
            Paragraph("<code>response[-1]['accumlatedValue']</code><br/>Sowing date starts clock. Accurately maps crop phenology stage.", table_td)
        ]
    ]

    m1_table = Table(m1_table_data, colWidths=[110, 75, 145, 186])
    m1_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(m1_table)

    m1_out_box = [[Paragraph("<b>Model 1 Output Handed Downstream:</b> <code>stress_type</code> (1=Heat, 2=Drought, 3=Compound) | <code>stress_intensity_index</code> (0.0 to 1.0 probability) | <code>days_to_impact</code> (3 to 7 days).", callout_style)]]
    t_m1_box = Table(m1_out_box, colWidths=[516])
    t_m1_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
        ('BOX', (0, 0), (-1, -1), 1, c_blue),
        ('PADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(Spacer(1, 2))
    story.append(t_m1_box)
    story.append(Spacer(1, 4))

    # ---------- MODEL 2 ----------
    story.append(Paragraph("Stage 2: Model 2 — Biological Intervention Readiness Engine (PS-02)", h2_style))
    story.append(Paragraph(
        "<b>Model Function:</b> Evaluates whether the field microclimate permits safe, effective foliar biostimulant uptake. "
        "<b>Algorithm:</b> <code>CalibratedClassifierCV(LogisticRegression, method='sigmoid')</code> (Platt Scaling) with biophysical threshold cutoffs. "
        "<b>Assigned Owner:</b> Rishabh.",
        body_style
    ))

    m2_table_data = [
        [Paragraph("Feature Name", table_th), Paragraph("Type & Gate Rule", table_th), Paragraph("Exact API Endpoint & Query", table_th), Paragraph("Exact JSON Response Path / Extraction Logic", table_th)],
        [
            Paragraph("<code>soil_moisture_pct</code>", table_td_bold),
            Paragraph("Float (%)<br/>Optimal: 40% - 70%", table_td),
            Paragraph("<b>Meteoblue API:</b> Code 144 (0-10cm)<br/>& <b>CE Hub API:</b> <code>/HydricStressRecommendation</code>", table_td),
            Paragraph("<code>Meteoblue: response['data'][3]['coordinates'][0]['dates'][0]['value']</code><br/>If soil < 30%, root xylem pressure collapses; stomata close and foliar sprays fail.", table_td)
        ],
        [
            Paragraph("<code>delta_t_celsius</code>", table_td_bold),
            Paragraph("Float (°C)<br/>Safe: 2.0°C to 8.0°C", table_td),
            Paragraph("<b>Syngenta CE Hub API:</b><br/>GET <code>/SprayWindowRecommendation</code><br/>Fallback: Derived via Stull formula from Meteoblue", table_td),
            Paragraph("<code>CE Hub: response[0]['deltaT']</code><br/>Atmospheric wet-bulb depression. Delta-T > 8°C causes spray droplet evaporation before leaf penetration. < 2°C causes runoff.", table_td)
        ],
        [
            Paragraph("<code>wind_speed_kmh</code>", table_td_bold),
            Paragraph("Float (km/h)<br/>Safe: < 15.0 km/h", table_td),
            Paragraph("<b>Meteoblue Dataset API:</b> Code 32 (10m)<br/>& <b>Open-Meteo Hourly API</b>", table_td),
            Paragraph("<code>response['hourly']['wind_speed_10m'][0]</code><br/>High wind causes microscopic droplet drift into non-target zones. Wind > 18 km/h forces readiness to 0.0.", table_td)
        ],
        [
            Paragraph("<code>rain_prob_next_48h</code>", table_td_bold),
            Paragraph("Float (%)<br/>Safe: < 40%", table_td),
            Paragraph("<b>Open-Meteo Hourly API:</b><br/>GET <code>/v1/forecast?hourly=precipitation_probability</code>", table_td),
            Paragraph("<code>max(response['hourly']['precipitation_probability'][:48])</code><br/>Rainfastness gate: biological peptides require 2-4 hours rain-free to absorb onto foliage.", table_td)
        ],
        [
            Paragraph("<code>crop_stage_sensitivity</code>", table_td_bold),
            Paragraph("Float Multiplier<br/>0.2 (Veg) to 1.0 (Flower)", table_td),
            Paragraph("<b>Derived Phenology Lookup:</b><br/>Mapped from CE Hub <code>accumlatedValue</code> GDD", table_td),
            Paragraph("<code>STAGE_SENSITIVITY[current_stage]</code> (Vegetative: 0.2, Flowering: 1.0, Pod fill: 0.85). Focuses investment where economic ROI is maximized.", table_td)
        ]
    ]

    m2_table = Table(m2_table_data, colWidths=[110, 80, 140, 186])
    m2_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(m2_table)

    m2_out_box = [[Paragraph("<b>Model 2 Output Handed Downstream:</b> <code>readiness_score</code> (0.0 to 1.0 calibrated probability) | <code>spray_window_safe</code> (True/False) | <code>delta_t</code> (current wet-bulb depression).", callout_style)]]
    t_m2_box = Table(m2_out_box, colWidths=[516])
    t_m2_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ECFDF5")),
        ('BOX', (0, 0), (-1, -1), 1, c_emerald),
        ('PADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(Spacer(1, 2))
    story.append(t_m2_box)

    # Page Break to Page 4
    story.append(PageBreak())

    # ==================== PAGE 4: MODEL 3 & MODEL 4 DETAILED INPUT SPECS ====================
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_blue, spaceBefore=2, spaceAfter=4))
    story.append(Paragraph("4. Linear Model Specifications — Stage 3 & Stage 4 (PS-03 Portfolio & Response Curve)", h1_style))

    # ---------- MODEL 3 ----------
    story.append(Paragraph("Stage 3: Model 3 — Biological Product Ranking Engine (PS-03)", h2_style))
    story.append(Paragraph(
        "<b>Model Function:</b> Ranks Syngenta's catalog of 50 biological products to select the optimal Top-3 recommendations based on stress type, crop stage, and soil chemistry. "
        "<b>Algorithm:</b> <code>XGBRanker(objective='rank:ndcg', eval_metric='ndcg@3')</code> (LambdaMART pairwise ranking). "
        "<b>Assigned Owner:</b> Sameer (Team Leader).",
        body_style
    ))

    m3_table_data = [
        [Paragraph("Feature Name", table_th), Paragraph("Type & Range", table_th), Paragraph("Interconnected Source / Provenance", table_th), Paragraph("Exact Ingestion Path / Role in Pairwise Ranker", table_th)],
        [
            Paragraph("<code>stress_type</code>", table_td_bold),
            Paragraph("Integer Category<br/>[1, 2, 3]", table_td),
            Paragraph("<b>UPSTREAM OUTPUT: MODEL 1</b><br/>(Divyansh's Stress Classifier)", table_td),
            Paragraph("<code>model1_output['stress_class']</code><br/>Restricts ranking pool to products formulated for the active stress (e.g., Quantis for Heat, Isabion for Drought/Osmotic).", table_td)
        ],
        [
            Paragraph("<code>readiness_score</code>", table_td_bold),
            Paragraph("Float<br/>0.0 to 1.0", table_td),
            Paragraph("<b>UPSTREAM OUTPUT: MODEL 2</b><br/>(Rishabh's Readiness Engine)", table_td),
            Paragraph("<code>model2_output['readiness_score']</code><br/>Down-weights foliar biostimulants if stomata are closed; promotes soil-drench or systemic alternatives.", table_td)
        ],
        [
            Paragraph("<code>crop_stage</code>", table_td_bold),
            Paragraph("Categorical Enum<br/>Germ, Veg, Flower, Pod", table_td),
            Paragraph("<b>Derived Phenology Engine:</b><br/>CE Hub API <code>/GDDRecommendation</code>", table_td),
            Paragraph("<code>gdd = cehub_response[-1]['accumlatedValue']</code><br/>Mapped to crop stage table (e.g. Soybean JS-335: Flower = 450-700 GDD). Checks product label stage compatibility.", table_td)
        ],
        [
            Paragraph("<code>soil_ph</code>", table_td_bold),
            Paragraph("Float<br/>5.5 to 8.5", table_td),
            Paragraph("<b>ISRIC SoilGrids REST API:</b><br/>GET <code>/properties/query?property=phh2o</code><br/>(or Farmer Field Twin Input)", table_td),
            Paragraph("<code>response['properties']['layers'][0]['depths'][0]['values']['mean'] / 10.0</code><br/>Alkaline soil (pH > 7.5) degrades soil-applied peptides; forces ranker to elevate foliar formulations.", table_td)
        ],
        [
            Paragraph("<code>product_catalog_vector</code>", table_td_bold),
            Paragraph("Vector (50 Items)<br/>Active salts, cost/acre", table_td),
            Paragraph("<b>Syngenta Product Knowledge Base:</b><br/>Verified catalog from <code>syngenta.co.in</code>", table_td),
            Paragraph("Encoded feature vector for each of the 50 products: amino acid profile, free peptide chain length, potassium/calcium salts, dealer MRP.", table_td)
        ]
    ]

    m3_table = Table(m3_table_data, colWidths=[110, 80, 140, 186])
    m3_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(m3_table)

    m3_out_box = [[Paragraph("<b>Model 3 Output Handed Downstream:</b> <code>selected_product_key</code> ('quantis') | <code>top_ranked_products</code> (1st Quantis 94.2%, 2nd Isabion 88.5%, 3rd Amistar Top 71.0%) | <code>active_salts</code> ('Amino acids + K + Ca').", callout_style)]]
    t_m3_box = Table(m3_out_box, colWidths=[516])
    t_m3_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
        ('BOX', (0, 0), (-1, -1), 1, c_blue),
        ('PADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(Spacer(1, 2))
    story.append(t_m3_box)
    story.append(Spacer(1, 4))

    # ---------- MODEL 4 ----------
    story.append(Paragraph("Stage 4: Model 4 — Expected Product Response & Yield Protection Curve (PS-03 / PS-07)", h2_style))
    story.append(Paragraph(
        "<b>Model Function:</b> Predicts the non-linear yield recovery curve (+% yield protected or +quintals/acre saved) based on dosage, timing, and soil carbon. "
        "<b>Algorithm:</b> <code>CatBoostRegressor(iterations=250, loss_function='Huber:delta=1.5')</code> with Ordered Target Encoding. "
        "<b>Assigned Owner:</b> Sameer (Team Leader).",
        body_style
    ))

    m4_table_data = [
        [Paragraph("Feature Name", table_th), Paragraph("Type & Range", table_th), Paragraph("Interconnected Source / Provenance", table_th), Paragraph("Exact Ingestion Path / Law of Diminishing Returns", table_th)],
        [
            Paragraph("<code>product_key</code>", table_td_bold),
            Paragraph("Categorical String<br/>e.g. 'quantis', 'isabion'", table_td),
            Paragraph("<b>UPSTREAM OUTPUT: MODEL 3</b><br/>(Top-1 recommended product)", table_td),
            Paragraph("<code>model3_output['selected_product_key']</code><br/>Passed as native categorical string to CatBoost. Identifies physiological mechanism without one-hot leakage.", table_td)
        ],
        [
            Paragraph("<code>dosage_ml_per_acre</code>", table_td_bold),
            Paragraph("Float<br/>200 to 600 ml/acre", table_td),
            Paragraph("<b>Farmer Interactive Slider:</b><br/>Live Web Frontend Input", table_td),
            Paragraph("<code>frontend_request['dosage_ml_per_acre']</code><br/>Models Mitscherlich's Law of Diminishing Marginal Returns: increments past 400ml produce progressively smaller yield gains.", table_td)
        ],
        [
            Paragraph("<code>timing_days_before_stress</code>", table_td_bold),
            Paragraph("Integer (Days)<br/>1 to 5 days prior", table_td),
            Paragraph("<b>UPSTREAM OUTPUT: MODEL 1</b><br/>(`days_to_impact` from weather forecast)", table_td),
            Paragraph("<code>model1_output['days_to_impact']</code><br/>Proactive preventative spraying (48h before heatwave) provides 3x higher cellular protection than reactive curative spraying.", table_td)
        ],
        [
            Paragraph("<code>stress_intensity_index</code>", table_td_bold),
            Paragraph("Float<br/>0.0 to 1.0", table_td),
            Paragraph("<b>UPSTREAM OUTPUT: MODEL 1</b><br/>(Model 1 prediction confidence)", table_td),
            Paragraph("<code>model1_output['confidence']</code><br/>Quantifies severity of impending stress. Higher stress provides higher potential headroom for yield protection.", table_td)
        ],
        [
            Paragraph("<code>soil_organic_carbon_pct</code>", table_td_bold),
            Paragraph("Float (%)<br/>0.2% to 1.8%", table_td),
            Paragraph("<b>ISRIC SoilGrids REST API:</b><br/>GET <code>/properties/query?property=soc</code>", table_td),
            Paragraph("<code>response['properties']['layers'][0]['depths'][0]['values']['mean'] / 100.0</code><br/>Soil microbial vitality: higher SOC increases foliar product translocation efficiency.", table_td)
        ]
    ]

    m4_table = Table(m4_table_data, colWidths=[110, 80, 140, 186])
    m4_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(m4_table)

    m4_out_box = [[Paragraph("<b>Model 4 Output Handed Downstream:</b> <code>delta_yield_pct</code> (+14.5% yield loss prevented) | <code>optimal_dosage_ml</code> (400 ml/acre) | <code>marginal_gain_curve</code> ([0.5L: +8.0%, 1.0L: +14.5%, 1.5L: +16.2%]).", callout_style)]]
    t_m4_box = Table(m4_out_box, colWidths=[516])
    t_m4_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ECFDF5")),
        ('BOX', (0, 0), (-1, -1), 1, c_emerald),
        ('PADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(Spacer(1, 2))
    story.append(t_m4_box)

    # Page Break to Page 5
    story.append(PageBreak())

    # ==================== PAGE 5: MODEL 5 & MODEL 6 DETAILED INPUT SPECS ====================
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_blue, spaceBefore=2, spaceAfter=4))
    story.append(Paragraph("5. Linear Model Specifications — Stage 5 & Stage 6 (PS-07 Baseline & Causal ROBI)", h1_style))

    # ---------- MODEL 5 ----------
    story.append(Paragraph("Stage 5: Model 5 — Field Yield Baseline Prediction (PS-07)", h2_style))
    story.append(Paragraph(
        "<b>Model Function:</b> Predicts the unperturbed counterfactual yield: 'What would this farm produce normally under this season\\'s weather without biologicals?' "
        "<b>Algorithm:</b> <code>XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.04)</code> (GroupKFold by District). "
        "<b>Assigned Owner:</b> Ishaan.",
        body_style
    ))

    m5_table_data = [
        [Paragraph("Feature Name", table_th), Paragraph("Type & Range", table_th), Paragraph("Exact API Endpoint & Query", table_th), Paragraph("Exact JSON Response Path / Ingestion Logic", table_th)],
        [
            Paragraph("<code>gdd_seasonal_total</code>", table_td_bold),
            Paragraph("Float (°C-days)<br/>1200 to 2400", table_td),
            Paragraph("<b>Meteoblue ERA5 Dataset API:</b><br/>POST <code>/dataset/query</code><br/>Domain: <code>ERA5</code> (Season-to-date daily)", table_td),
            Paragraph("Cumulative sum of <code>max(0, (tmax + tmin)/2 - 10)</code> across entire season. Measures total thermal potential.", table_td)
        ],
        [
            Paragraph("<code>rainfall_total_mm</code>", table_td_bold),
            Paragraph("Float (mm)<br/>200 to 1400", table_td),
            Paragraph("<b>Meteoblue Dataset API:</b><br/>Code 61 (sfc, sum)<br/>Cross-checked: CE Hub API", table_td),
            Paragraph("<code>sum(response['data'][2]['coordinates'][0]['dates'][i]['value'])</code><br/>Seasonal cumulative precipitation. Baseline rainfed yield determinant.", table_td)
        ],
        [
            Paragraph("<code>dry_spell_max_consecutive_days</code>", table_td_bold),
            Paragraph("Integer (Days)<br/>0 to 35", table_td),
            Paragraph("<b>Derived Time-Series Metric:</b><br/>Meteoblue precipitation time-series", table_td),
            Paragraph("Longest continuous run of days where daily rainfall < 2.5mm during critical growth phases. Primary driver of catastrophic yield loss.", table_td)
        ],
        [
            Paragraph("<code>extreme_heat_days_count</code>", table_td_bold),
            Paragraph("Integer (Days)<br/>0 to 20", table_td),
            Paragraph("<b>Derived Time-Series Metric:</b><br/>Meteoblue temperature time-series", table_td),
            Paragraph("Count of days where <code>tmax > 38.0°C</code> during flowering/anthesis. Drives floret sterility.", table_td)
        ],
        [
            Paragraph("<code>soil_clay_pct</code>", table_td_bold),
            Paragraph("Float (%)<br/>10.0% to 65.0%", table_td),
            Paragraph("<b>ISRIC SoilGrids REST API:</b><br/>GET <code>/properties/query?property=clay</code>", table_td),
            Paragraph("<code>response['properties']['layers'][0]['depths'][0]['values']['mean'] / 10.0</code><br/>Soil water holding capacity: Vertisols (black clay) buffer dry spells; sandy soils dry out immediately.", table_td)
        ],
        [
            Paragraph("<code>district_historical_mean_yield</code>", table_td_bold),
            Paragraph("Float (Q/Acre)<br/>3.0 to 45.0", table_td),
            Paragraph("<b>data.gov.in / ICRISAT VDSA:</b><br/>Ministry of Agriculture Crop Statistics", table_td),
            Paragraph("<code>data_gov_record['yield_q_per_acre']</code><br/>10-year official district historical average. Calibrates local technological and agro-climatic baseline.", table_td)
        ]
    ]

    m5_table = Table(m5_table_data, colWidths=[110, 80, 140, 186])
    m5_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(m5_table)

    m5_out_box = [[Paragraph("<b>Model 5 Output Handed Downstream:</b> <code>expected_baseline_yield_q</code> (e.g. 21.0 Quintals/Acre) | <code>counterfactual_revenue_baseline</code> (Baseline Yield x Mandi Price).", callout_style)]]
    t_m5_box = Table(m5_out_box, colWidths=[516])
    t_m5_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
        ('BOX', (0, 0), (-1, -1), 1, c_blue),
        ('PADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(Spacer(1, 2))
    story.append(t_m5_box)
    story.append(Spacer(1, 4))

    # ---------- MODEL 6 ----------
    story.append(Paragraph("Stage 6: Model 6 — Causal Biological Impact & ROBI Attribution Engine (PS-07)", h2_style))
    story.append(Paragraph(
        "<b>Model Function:</b> Isolates true causal treatment effect (tau) by partialling out wealth and weather confounders, computing unbiased Return on Biological Investment. "
        "<b>Algorithm:</b> <code>LinearDML(model_y=RandomForestRegressor, model_t=RandomForestClassifier, cv=3)</code> via EconML. "
        "<b>Assigned Owner:</b> Ritvik.",
        body_style
    ))

    m6_table_data = [
        [Paragraph("DML Covariate Role", table_th), Paragraph("Variable Schema", table_th), Paragraph("Interconnected & API Source", table_th), Paragraph("Exact Ingestion Path / Confounder Partialling", table_th)],
        [
            Paragraph("<b>Treatment (T)</b>", table_td_bold),
            Paragraph("<code>treatment_applied</code><br/>Binary (1 or 0)", table_td),
            Paragraph("<b>Farmer Application Log</b><br/>or Verified Syngenta Purchase", table_td),
            Paragraph("<code>farmer_profile['treatment_applied']</code><br/>Core causal binary treatment variable.", table_td)
        ],
        [
            Paragraph("<b>Outcome (Y)</b>", table_td_bold),
            Paragraph("<code>observed_yield</code><br/>Float (Quintals/Acre)", table_td),
            Paragraph("<b>Farmer Harvest Record</b><br/>(Inference: M5 * (1 + M4 Delta))", table_td),
            Paragraph("<code>farmer_profile['harvest_yield']</code> or predicted outcome <code>model5_yield * (1 + model4_delta)</code>.", table_td)
        ],
        [
            Paragraph("<b>Confounders (W)</b><br/>(Nuisance Covariates)", table_td_bold),
            Paragraph("• <code>rainfall_total</code><br/>• <code>soil_moisture</code><br/>• <code>irrigation_type</code><br/>• <code>farm_size_acres</code>", table_td),
            Paragraph("<b>Meteoblue API</b> (weather)<br/>+ <b>Farmer Profile</b> (wealth)", table_td),
            Paragraph("Cross-fitted via auxiliary ML models. Ensures richer farmers with borewells do not give false credit to the biostimulant.", table_td)
        ],
        [
            Paragraph("<b>Heterogeneity (X)</b><br/>(Effect Modifiers)", table_td_bold),
            Paragraph("• <code>stress_intensity</code><br/>• <code>crop_growth_stage</code><br/>• <code>soil_type</code>", table_td),
            Paragraph("<b>OUTPUT FROM MODEL 1</b><br/>+ <b>Farmer Field Twin</b>", table_td),
            Paragraph("Estimates Conditional Average Treatment Effect (CATE): proves product delivers higher recovery under extreme stress.", table_td)
        ],
        [
            Paragraph("<b>Mandi Market Price</b>", table_td_bold),
            Paragraph("<code>mandi_price_per_q</code><br/>Float (INR/Quintal)", table_td),
            Paragraph("<b>Agmarknet APMC Mandi API:</b><br/><code>data.gov.in</code> daily market prices", table_td),
            Paragraph("<code>response['records'][0]['modal_price']</code><br/>Live wholesale price. Converts physical yield saved into verified rupees.", table_td)
        ],
        [
            Paragraph("<b>Product Cost</b>", table_td_bold),
            Paragraph("<code>product_cost_per_acre</code><br/>Float (INR/Acre)", table_td),
            Paragraph("<b>Syngenta Dealer MRP:</b><br/>Catalog Knowledge Base", table_td),
            Paragraph("<code>catalog[product_key]['dealer_mrp'] * dosage</code><br/>Computes net profit: <code>ROBI = (tau * Mandi_Price - Cost) / Cost</code>.", table_td)
        ]
    ]

    m6_table = Table(m6_table_data, colWidths=[105, 105, 125, 181])
    m6_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(m6_table)

    m6_out_box = [[Paragraph("<b>Model 6 Output Handed Downstream:</b> <code>causal_yield_gain_q</code> (+2.8 Q/Acre true causal treatment effect tau) | <code>revenue_saved_inr</code> (INR 11,350 net profit) | <code>robi_multiplier</code> (20.6x Return on Biological Investment).", callout_style)]]
    t_m6_box = Table(m6_out_box, colWidths=[516])
    t_m6_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ECFDF5")),
        ('BOX', (0, 0), (-1, -1), 1, c_emerald),
        ('PADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(Spacer(1, 2))
    story.append(t_m6_box)

    # Page Break to Page 6
    story.append(PageBreak())

    # ==================== PAGE 6: INTERCONNECTION FLOW & UNIFIED JSON CONTRACT ====================
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_blue, spaceBefore=2, spaceAfter=4))
    story.append(Paragraph("6. Interconnection Architecture & Unified JSON Contract", h1_style))
    story.append(Paragraph(
        "The 6 models execute in a tightly coupled mathematical chain. Upstream outputs become mandatory downstream inputs:",
        body_style
    ))

    interconn_data = [
        [Paragraph("Pipeline Transition", table_th), Paragraph("Upstream Model Output", table_th), Paragraph("Downstream Model Consuming Feature", table_th), Paragraph("Agronomic & Mathematical Function", table_th)],
        [
            Paragraph("<b>Stage 1 &rarr; Stage 3</b>", table_td_bold),
            Paragraph("Model 1: <code>stress_type</code> & <code>stress_intensity</code>", table_td),
            Paragraph("Model 3: <code>stress_type</code> in ranking vector", table_td),
            Paragraph("Filters catalog so ranker only evaluates biostimulants designed to neutralize the active stress.", table_td)
        ],
        [
            Paragraph("<b>Stage 2 &rarr; Stage 3</b>", table_td_bold),
            Paragraph("Model 2: <code>readiness_score</code> & <code>spray_window_safe</code>", table_td),
            Paragraph("Model 3: <code>readiness_score</code> weight in LambdaMART", table_td),
            Paragraph("Suppresses foliar products if field is closed to spray; boosts systemic alternatives.", table_td)
        ],
        [
            Paragraph("<b>Stage 3 &rarr; Stage 4</b>", table_td_bold),
            Paragraph("Model 3: <code>selected_product_key</code> ('quantis')", table_td),
            Paragraph("Model 4: <code>product_key</code> categorical feature", table_td),
            Paragraph("Directs CatBoost to evaluate the specific dose-response curve for the #1 chosen product.", table_td)
        ],
        [
            Paragraph("<b>Stage 1 &rarr; Stage 4</b>", table_td_bold),
            Paragraph("Model 1: <code>days_to_impact</code> (lead time)", table_td),
            Paragraph("Model 4: <code>timing_days_before_stress</code> feature", table_td),
            Paragraph("Allows CatBoost to calculate proactive vs reactive efficacy penalty curves.", table_td)
        ],
        [
            Paragraph("<b>Stage 4 + 5 &rarr; Stage 6</b>", table_td_bold),
            Paragraph("Model 4: <code>delta_yield_pct</code><br/>Model 5: <code>expected_baseline_yield_q</code>", table_td),
            Paragraph("Model 6: <code>observed_yield</code> / treatment outcome matrix", table_td),
            Paragraph("Provides unperturbed baseline and expected recovery to Double ML to isolate causal tau.", table_td)
        ],
        [
            Paragraph("<b>Stage 6 &rarr; Gemini</b>", table_td_bold),
            Paragraph("Model 6: <code>tau</code>, <code>revenue_saved_inr</code>, <code>robi_multiplier</code>", table_td),
            Paragraph("<b>Google Gemini 2.5 Flash</b> & <b>WhatsApp Bot</b>", table_td),
            Paragraph("Gemini translates raw mathematical JSON into warm, trustworthy vernacular farmer dialogue.", table_td)
        ]
    ]

    interconn_table = Table(interconn_data, colWidths=[90, 125, 130, 171])
    interconn_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 2.8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(interconn_table)
    story.append(Spacer(1, 4))

    story.append(Paragraph("Standardized Unified JSON Payload Contract", h2_style))
    story.append(Paragraph(
        "Upon completing the 6-stage linear pipeline, the system outputs the following unified JSON payload consumed by the frontend and Gemini 2.5:",
        body_style
    ))

    sample_json = (
        "{\n"
        '  "farmer_id": "MH-LAT-2026-8842",\n'
        '  "location": { "lat": 18.4088, "lon": 76.5604, "district": "Latur", "state": "Maharashtra" },\n'
        '  "field_twin": { "crop": "Soybean", "variety": "JS-335", "sowing_date": "2026-06-15", "stage": "R1 Flowering", "soil_ph": 8.1 },\n'
        '  "stage1_model1_risk": {\n'
        '    "stress_type": "Compound Heat & Drought", "stress_class": 3, "confidence": 0.92, "days_to_impact": 4, "peak_forecast_temp": 42.4\n'
        '  },\n'
        '  "stage2_model2_readiness": {\n'
        '    "spray_window_safe": true, "readiness_score": 0.88, "delta_t_celsius": 5.2, "optimal_spray_window": "06:30 AM - 09:15 AM Tomorrow"\n'
        '  },\n'
        '  "stage3_model3_portfolio": {\n'
        '    "recommended_products": [\n'
        '      { "rank": 1, "product_key": "quantis", "name": "Quantis", "score": 94.2, "active_salts": "Amino acids + K + Ca", "cost_per_acre": 550 },\n'
        '      { "rank": 2, "product_key": "isabion", "name": "Isabion", "score": 88.5, "active_salts": "Animal Origin Peptides", "cost_per_acre": 400 },\n'
        '      { "rank": 3, "product_key": "amistar_top", "name": "Amistar Top", "score": 71.0, "active_salts": "Azoxystrobin + Difenoconazole", "cost_per_acre": 750 }\n'
        '    ]\n'
        '  },\n'
        '  "stage4_model4_response": {\n'
        '    "product": "Quantis", "optimal_dosage_ml_per_acre": 400, "yield_protected_pct": 14.5, "timing_advantage": "3.2x higher efficacy than curative"\n'
        '  },\n'
        '  "stage5_model5_baseline": {\n'
        '    "counterfactual_baseline_yield_q_per_acre": 21.0, "district_10yr_norm_q": 19.8\n'
        '  },\n'
        '  "stage6_model6_causal_robi": {\n'
        '    "causal_treatment_effect_tau_q": 2.8, "mandi_price_per_q": 4250, "product_cost_inr": 550, "net_revenue_saved_inr": 11350, "robi_multiplier": "20.6x ROI"\n'
        '  }\n'
        "}"
    )

    t_json = Table([[Paragraph(sample_json.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style)]], colWidths=[516])
    t_json.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_json)

    # Page Break to Page 7
    story.append(PageBreak())

    # ==================== PAGE 7: TRAINING VS INFERENCE & ANTI-LEAKAGE ====================
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_blue, spaceBefore=2, spaceAfter=4))
    story.append(Paragraph("7. Training vs. Live Web Inference Pipelines & Leakage Prevention", h1_style))
    story.append(Paragraph(
        "To guarantee high real-world accuracy on the website without target leakage or overfitting, "
        "training and live web inference use distinct pipelines:",
        body_style
    ))

    train_vs_infer = [
        [Paragraph("Model", table_th), Paragraph("Training Phase Data & Provenance", table_th), Paragraph("Live Web Inference Data & Ingestion", table_th), Paragraph("Target Evaluation Metric", table_th)],
        [
            Paragraph("<b>Model 1</b><br/>Stress Classifier", table_td_bold),
            Paragraph("10-Year historical ERA5 hourly weather (1985-2025) aligned with IMD historical heatwave & drought records.", table_td),
            Paragraph("Live 7-day weather forecast from Meteoblue Dataset API + CE Hub ShortRangeForecastDaily.", table_td),
            Paragraph("Macro F1 > 0.85<br/>ROC-AUC > 0.88", table_td)
        ],
        [
            Paragraph("<b>Model 2</b><br/>Readiness Engine", table_td_bold),
            Paragraph("Historical spray field trials and stomatal conductance logs from ICAR / Syngenta protocol data.", table_td),
            Paragraph("Live 48h hourly microclimate from Meteoblue & Open-Meteo (Delta-T, wind speed, rain probability).", table_td),
            Paragraph("Brier Score < 0.08<br/>LogLoss < 0.25", table_td)
        ],
        [
            Paragraph("<b>Model 3</b><br/>Product Ranker", table_td_bold),
            Paragraph("Pairwise multi-location trial outcomes from Syngenta product registration dossiers.", table_td),
            Paragraph("Model 1 stress output + Model 2 readiness output + SoilGrids API pH + Catalog Vector.", table_td),
            Paragraph("NDCG@3 > 0.92", table_td)
        ],
        [
            Paragraph("<b>Model 4</b><br/>Response Curve", table_td_bold),
            Paragraph("Syngenta multi-dosage field trials (0.5L, 1.0L, 1.5L, 2.0L) under controlled abiotic stress conditions.", table_td),
            Paragraph("Model 3 top product key + Farmer interactive dosage slider + Model 1 lead time + SoilGrids SOC.", table_td),
            Paragraph("R2 > 0.80<br/>RMSE < 1.5%", table_td)
        ],
        [
            Paragraph("<b>Model 5</b><br/>Baseline Regressor", table_td_bold),
            Paragraph("10-year district crop production statistics from data.gov.in & ICRISAT VDSA rainfed time-series.", table_td),
            Paragraph("Season-to-date accumulated GDD & rainfall from Meteoblue ERA5 + SoilGrids clay %.", table_td),
            Paragraph("R2 > 0.78<br/>RMSE < 2.2 Q/Acre", table_td)
        ],
        [
            Paragraph("<b>Model 6</b><br/>Double ML ROBI", table_td_bold),
            Paragraph("Observational farm survey dataset with treated and untreated control plots (ICRISAT + Syngenta Club).", table_td),
            Paragraph("Model 5 baseline + Model 4 delta yield + Agmarknet APMC live mandi price + Syngenta dealer MRP.", table_td),
            Paragraph("Unbiased causal tau with 95% Confidence Interval", table_td)
        ]
    ]

    t_train_infer = Table(train_vs_infer, colWidths=[80, 150, 180, 106])
    t_train_infer.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_header_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 2.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(t_train_infer)
    story.append(Spacer(1, 6))

    story.append(Paragraph("Quality Assurance & The 5 Anti-Leakage Rules", h1_style))

    qa_bullets = [
        "<b>1. GroupKFold by District (Spatial Leakage Shield):</b> Spatial autocorrelation causes adjacent fields to experience identical weather. Models 1, 3, and 5 are strictly cross-validated by District grouping (<code>GroupKFold(n_splits=5, groups=df['district'])</code>).",
        "<b>2. TimeSeriesSplit (Temporal Leakage Shield):</b> Weather and yield series are never randomly shuffled. Shuffling leaks future weather into past models. Training uses 2015-2024; evaluation uses 2025-2026.",
        "<b>3. Scaler Pre-Fit Isolation:</b> All scalers (<code>StandardScaler</code>, <code>MinMaxScaler</code>) are fit strictly on <code>X_train</code> and applied onto <code>X_test</code> without recomputing means or standard deviations.",
        "<b>4. Double ML Cross-Fitting for True Causation:</b> Richer farmers who buy biostimulants also have drip irrigation. Naive comparison assigns credit for water to the biostimulant. Model 6 uses <code>LinearDML</code> with cross-fitting to partial out confounders orthogonally.",
        "<b>5. Golden Anti-Cheat Rule:</b> Any tabular model claiming > 98% accuracy is flagged for target leakage. Agricultural biological systems are naturally noisy; true uncheated models exhibit realistic F1 > 0.85 and R2 > 0.78-0.82."
    ]

    for b in qa_bullets:
        story.append(Paragraph(f"• {b}", body_style))
        story.append(Spacer(1, 1))

    story.append(Spacer(1, 4))
    summary_box = [
        [Paragraph("<b>Production Sign-Off:</b> This linear specification provides the complete engineering blueprint for data ingestion, model training, and Google Vertex AI containerized deployment. All inputs have verified physical sources, exact API response mapping, and all model boundaries are protected against target leakage.", callout_style)]
    ]
    t_summary = Table(summary_box, colWidths=[516])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
        ('BOX', (0, 0), (-1, -1), 1, c_blue),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_summary)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] High-fidelity updated PDF generated: {output_filename}")

if __name__ == '__main__':
    target_path = os.path.abspath("AASRA_6_Models_Linear_Input_Specification.pdf")
    generate_pdf(target_path)
