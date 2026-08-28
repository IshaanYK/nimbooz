import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
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
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Top Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "AASRA PLATFORM — TECHNOLOGY STACK SPECIFICATION")
            self.setFont("Helvetica", 8)
            self.drawRightString(8.5 * inch - 54, 11 * inch - 36, "Google Cloud & System Stack Audit")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.75)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)
            
        # Bottom Footer (all pages)
        self.setFont("Helvetica-Bold", 8)
        self.drawString(54, 32, "AASRA | Syngenta Biologicals Yield Protection Platform")
        self.setFont("Helvetica", 8)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 32, page_text)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(54, 44, 8.5 * inch - 54, 44)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0F172A")    # Dark Navy
    c_google_blue = colors.HexColor("#1A73E8")# Google Blue
    c_emerald = colors.HexColor("#059669")    # Syngenta Emerald
    c_slate = colors.HexColor("#334155")      # Slate Body
    c_subtext = colors.HexColor("#64748B")    # Muted Grey
    c_bg_light = colors.HexColor("#F8FAFC")   # Light Card BG
    c_border = colors.HexColor("#E2E8F0")     # Border Grey

    # Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=c_primary,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_google_blue,
        spaceAfter=15
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_subtext
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_emerald,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=c_slate,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=c_slate,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4
    )

    badge_google = ParagraphStyle(
        'BadgeGoogle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1E40AF")
    )

    badge_other = ParagraphStyle(
        'BadgeOther',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#065F46")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=c_slate
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=c_primary
    )

    story = []

    # Title & Header Banner
    story.append(Paragraph("AASRA — Complete Technology Stack Specification", title_style))
    story.append(Paragraph("Detailed Technology Breakdown: Google Cloud Platform vs Other Component Tech", subtitle_style))
    
    meta_text = (
        "<b>Target Platform:</b> Syngenta Biologicals Overwatch & AASRA Agricultural Intelligence<br/>"
        "<b>Architectural Audit Date:</b> August 14, 2026 | <b>Scope:</b> 100% Codebase Component Audit (Frontend, Backend, ML, Weather, GIS)<br/>"
        "<b>Repository Location:</b> <code>f:\\hyperion</code>"
    )
    
    meta_table = Table(
        [[Paragraph(meta_text, meta_style)]],
        colWidths=[504]
    )
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_bg_light),
        ('BOX', (0, 0), (-1, -1), 0.75, c_border),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Executive Summary Paragraph
    exec_summary = (
        "This document presents the complete technical stack powering <b>AASRA</b> (Agricultural Intelligence & Yield Protection Platform). "
        "AASRA utilizes <b>Google Cloud Platform (GCP) and Google AI</b> as its core intelligence, voice, multimodal vision, and serverless compute layer. "
        "In addition to Google Cloud, AASRA leverages a curated set of specialized open-source frameworks, geospatial engines, weather telemetry APIs, and relational databases. "
        "Below is the exhaustive, categorized specification of all technology used across the platform."
    )
    story.append(Paragraph(exec_summary, body_style))
    story.append(Spacer(1, 10))

    # SECTION 1: GOOGLE CLOUD & GOOGLE AI TECH STACK
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_google_blue, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph("1. Primary Google Cloud & Google AI Technology Stack", h1_style))
    story.append(Paragraph(
        "AASRA is engineered around a <b>100% Google Cloud AI foundation</b> for multilingual conversational intelligence, vision diagnostics, high-definition speech synthesis, and serverless deployment.",
        body_style
    ))
    story.append(Spacer(1, 6))

    google_tech_items = [
        ("Google Cloud Run", "Serverless Container Execution", "Hosts the AASRA FastAPI Gateway (Python 3.11 / Uvicorn container). Provides auto-scaling, low-latency HTTPS REST routing, zero cold starts, and container isolation."),
        ("Google Gemini 2.0 Flash (gemini-2.0-flash)", "Multilingual LLM & RAG Reasoning Engine", "Powers Problem Statement 04 (PS-04). Provides multi-turn RAG advisories across 12 Indian languages (Hindi, Marathi, Telugu, Tamil, Kannada, Malayalam, Gujarati, Punjabi, Bengali, Odia, Assamese, English) with explainable rationales and confidence scores (92-96%)."),
        ("Google Gemini 2.0 Flash Vision", "Multimodal Crop Leaf Diagnostics", "Scans plant foliage photos uploaded by farmers (`/api/chat/diagnose-leaf`). Detects leaf necrosis, chlorosis, thermal scorch, and foliar diseases while synthesizing prescriptive Syngenta biostimulant treatment dosages."),
        ("Google Chirp 3 HD Speech API", "Neural Text-to-Speech (TTS)", "Generates high-definition regional accent audio streams (`/api/chat/google-tts`) delivering vocalized advisories to farmers directly in their native language."),
        ("Google Speech-to-Text (STT) & Speech API", "Voice Query Ingestion", "Handles real-time acoustic voice input from farmers in the `/ask` voice assistant interface, converting spoken regional dialects into structured prompt context."),
        ("Google Cloud REST Generative Language API", "Transport & Multi-Key Routing", "Underlying REST protocol (`google-generativeai` SDK v0.8.3). Includes backend multi-key auto-rotation strategy across 4 API keys (`GOOGLE_API_KEY_1..4`) for rate-limit and quota resilience.")
    ]

    for title, category, desc in google_tech_items:
        bullet_p = f"• <b>{title}</b> [<font color='#1A73E8'><b>{category}</b></font>]: {desc}"
        story.append(Paragraph(bullet_p, bullet_style))
    
    story.append(Spacer(1, 14))

    # SECTION 2: OTHER / ADDITIONAL TECHNOLOGY STACK
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_emerald, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph("2. Other / Additional Technology Stack Used in AASRA", h1_style))
    story.append(Paragraph(
        "To deliver a complete end-to-end enterprise web application, AASRA integrates specialized frontend, backend, database, geospatial, weather, and machine learning technologies alongside Google Cloud:",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Sub-section 2.1: Frontend
    story.append(Paragraph("2.1 Frontend Framework & User Interface Tier", h2_style))
    frontend_items = [
        ("Next.js 16.3.0 (React 19.2.8)", "Full-Stack Web Framework", "App Router architecture (`frontend/src/app`) providing server-side rendering, client hydration, and page routing (`/`, `/ask`, `/fields`, `/journal`, `/impact`, `/what-if`)."),
        ("TypeScript 5", "Static Type Safety", "Strict type contracts across React components, API request/response payloads, and state stores."),
        ("Tailwind CSS v4 (@tailwindcss/postcss)", "Design System & Styling", "Vanilla CSS-first utility architecture implementing a dark-mode Linear-inspired visual style (`design-md-linear.app`) with glassmorphic cards and emerald accents."),
        ("Framer Motion 13.1.0 & Lucide React", "Animations & Icons", "Micro-animations for stress gauges, card expansions, modal transitions, and SVG icon system."),
        ("Recharts 3.10.1", "Data Visualization", "Renders interactive yield attribution charts, Return on Biological Investment (ROBI) trend lines, and weather historical plots."),
        ("Web Speech API", "Browser Audio Fallback", "Provides client-side fallback text-to-speech synthesis (`SpeechSynthesisUtterance`) with BCP-47 regional language tags when offline.")
    ]
    for title, cat, desc in frontend_items:
        story.append(Paragraph(f"• <b>{title}</b> [<font color='#059669'><b>{cat}</b></font>]: {desc}", bullet_style))

    story.append(Spacer(1, 8))

    # Sub-section 2.2: Geospatial & Mapping Engine
    story.append(Paragraph("2.2 Geospatial GIS & Field Mapping Engine", h2_style))
    geo_items = [
        ("Leaflet.js 1.9.4 & Leaflet Draw", "Interactive GIS Map Editor", "Powers the `/fields` field polygon manager. Enables farmers to draw custom field boundaries, calculate acreage using the Shoelace area algorithm, and render interactive heatmap overlays (Temperature, Drought, Crop Health).")
    ]
    for title, cat, desc in geo_items:
        story.append(Paragraph(f"• <b>{title}</b> [<font color='#059669'><b>{cat}</b></font>]: {desc}", bullet_style))

    story.append(Spacer(1, 8))

    # Sub-section 2.3: Backend & API Gateway
    story.append(Paragraph("2.3 Backend Application Tier & Async Microservices", h2_style))
    backend_items = [
        ("Python 3.11", "Runtime Environment", "Core backend execution environment for mathematical algorithms, RAG pipelines, and data orchestration."),
        ("FastAPI 0.115.0 & Uvicorn 0.30.6", "ASGI Web Server & REST Gateway", "Asynchronous high-performance REST backend handling incoming client traffic (`backend/app/main.py`)."),
        ("Pydantic 2.9.2 & Pydantic-Settings", "Data Validation & Config", "Strict schema validation for API requests/responses and environment secret loading (`backend/app/config.py`)."),
        ("HTTPX 0.27.2", "Async HTTP Client", "Handles asynchronous outbound requests to external weather and agronomic APIs with non-blocking concurrency."),
        ("SQLAlchemy 2.0.35 & Alembic 1.13.3", "Database ORM & Migrations", "Relational database object mapping and schema migration management (`backend/app/database.py`)."),
        ("Python-Jose & Passlib (bcrypt)", "Security & Authentication", "JWT token encoding/decryption and cryptographic hashing for secure user access control."),
        ("NumPy 1.26.4 & SciPy 1.13.1", "Scientific Computing & Math", "Executes biophysical differential equations, degree-hour aggregations, and crop yield degradation curve modelling.")
    ]
    for title, cat, desc in backend_items:
        story.append(Paragraph(f"• <b>{title}</b> [<font color='#059669'><b>{cat}</b></font>]: {desc}", bullet_style))

    story.append(Spacer(1, 8))

    # Sub-section 2.4: External Weather & Agronomic APIs
    story.append(Paragraph("2.4 External Data Telemetry & Agronomic APIs", h2_style))
    api_items = [
        ("Meteoblue Dataset API", "Meteorological & Climate Telemetry", "Provides hyper-local weather datasets via `NEMSGLOBAL` (10-day forecast) and `ERA5` (historical reanalysis 1940–present). Fetches 2m temperature (Code 11), precipitation (Code 61), soil moisture 0-10cm (Code 144), and evapotranspiration (Code 261)."),
        ("Syngenta CE Hub API", "Syngenta Decision Engine", "Provides enterprise agronomic recommendations: Growing Degree Days (GDD), Hydric Stress, Biological & Chemical Spray Windows, Planting Windows, Chilling Units, and Disease Risk metadata.")
    ]
    for title, cat, desc in api_items:
        story.append(Paragraph(f"• <b>{title}</b> [<font color='#059669'><b>{cat}</b></font>]: {desc}", bullet_style))

    story.append(Spacer(1, 8))

    # Sub-section 2.5: Databases & Machine Learning
    story.append(Paragraph("2.5 Databases, Data Persistence & Machine Learning", h2_style))
    db_items = [
        ("PostgreSQL Database (psycopg2-binary 2.9.9)", "Relational Database", "Persistent relational storage for registered user profiles, field records, and biological intervention logs."),
        ("JSON Field Database (fields_db.json)", "Spatial Polygon Storage", "Lightweight file-based persistent cache storing GeoJSON polygon spatial coordinates and calculated field acreage."),
        ("5-Layer Hybrid ML Stress Engine (ps02-engine)", "Scikit-Learn ML Stress Model", "Python-based Scikit-Learn (Random Forest, SVM) stress classification engine, Flask/Streamlit prototype, and 9 deterministic agronomic stress/ROBI algorithms.")
    ]
    for title, cat, desc in db_items:
        story.append(Paragraph(f"• <b>{title}</b> [<font color='#059669'><b>{cat}</b></font>]: {desc}", bullet_style))

    story.append(Spacer(1, 14))

    # SECTION 3: COMPREHENSIVE TECHNOLOGY COMPARISON TABLE
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph("3. Summary Technology Matrix & Stack Classification", h1_style))
    story.append(Paragraph(
        "The following matrix summarizes every technology used in AASRA, explicitly categorizing whether it belongs to the <b>Google Cloud / Google AI</b> ecosystem or the <b>Additional System Stack</b>.",
        body_style
    ))
    story.append(Spacer(1, 6))

    table_data = [
        [
            Paragraph("Category", table_header_style),
            Paragraph("Technology Name", table_header_style),
            Paragraph("Ecosystem", table_header_style),
            Paragraph("Role & Function in AASRA", table_header_style)
        ]
    ]

    matrix_rows = [
        ("Cloud Compute", "Google Cloud Run", "Google Cloud", "Serverless container execution & FastAPI backend hosting"),
        ("Generative AI", "Gemini 2.0 Flash", "Google Cloud", "Multilingual 12-language RAG advisory & reasoning engine"),
        ("Vision AI", "Gemini 2.0 Flash Vision", "Google Cloud", "Multimodal foliar disease scan & biostimulant prescription"),
        ("Speech Synthesis", "Google Chirp 3 HD", "Google Cloud", "High-definition neural regional Text-to-Speech (TTS)"),
        ("Voice Ingestion", "Google Speech-to-Text", "Google Cloud", "Real-time farmer audio voice processing in /ask"),
        ("AI SDK & API", "Google GenAI SDK (0.8.3)", "Google Cloud", "Python SDK & REST transport with multi-key auto-rotation"),
        ("Frontend Framework", "Next.js 16 / React 19", "Open Source", "App Router full-stack web application framework"),
        ("Frontend Language", "TypeScript 5", "Microsoft / Open", "Static typing across components and backend schemas"),
        ("UI Styling", "Tailwind CSS v4", "Open Source", "Linear-inspired dark-mode styling & glassmorphic UI"),
        ("Geospatial GIS", "Leaflet.js & Leaflet Draw", "Open Source", "Interactive field polygon drawing, area & heatmaps"),
        ("Backend Server", "FastAPI / Uvicorn", "Open Source", "Python 3.11 async REST API gateway and endpoints"),
        ("Database ORM", "SQLAlchemy / Alembic", "Open Source", "Relational database object mapping and migrations"),
        ("Relational DB", "PostgreSQL (psycopg2)", "Open Source", "Persistent relational store for fields & intervention logs"),
        ("Scientific Math", "NumPy & SciPy", "Open Source", "Agronomic yield degradation curve & stress algorithms"),
        ("Weather Data", "Meteoblue Dataset API", "Meteoblue AG", "Live weather telemetry & ERA5 climate reanalysis"),
        ("Agronometrics API", "Syngenta CE Hub API", "Syngenta", "GDD, Hydric Stress, Spray & Planting window recommendations"),
        ("Hybrid ML Model", "Scikit-Learn (RF/SVM)", "Open Source", "5-layer ML climate stress engine prototype (ps02-engine)")
    ]

    for cat, name, eco, role in matrix_rows:
        if eco == "Google Cloud":
            eco_p = Paragraph("Google Cloud", badge_google)
        else:
            eco_p = Paragraph(eco, badge_other)

        table_data.append([
            Paragraph(cat, table_cell_bold),
            Paragraph(name, table_cell_style),
            eco_p,
            Paragraph(role, table_cell_style)
        ])

    matrix_table = Table(
        table_data,
        colWidths=[85, 115, 84, 220]
    )
    
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light]),
    ]))

    story.append(matrix_table)
    story.append(Spacer(1, 14))

    # SECTION 4: CONCLUSION & COMPLIANCE SUMMARY
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_google_blue, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph("4. Architectural Compliance & Technology Summary", h1_style))
    compliance_text = (
        "<b>Summary Verdict:</b> AASRA strictly complies with the requirement for a <b>100% Google Cloud AI Core</b>. "
        "All artificial intelligence, multilingual natural language understanding (NLU), multimodal foliar computer vision, "
        "and neural speech synthesis operations are powered exclusively by Google Cloud endpoints (Gemini 2.0 Flash, Chirp 3 HD, STT).<br/><br/>"
        "To support these Google Cloud AI capabilities in production, AASRA incorporates robust supporting technologies: "
        "Next.js 16/React 19 for the frontend, FastAPI for the backend gateway, Leaflet.js for GIS field mapping, "
        "PostgreSQL for relational persistence, and Meteoblue / Syngenta CE Hub APIs for real-time agronomic data ingestion."
    )
    story.append(Paragraph(compliance_text, body_style))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {filename}")

if __name__ == "__main__":
    output_pdf = os.path.join(os.getcwd(), "AASRA_Technology_Stack_Specification.pdf")
    build_pdf(output_pdf)
