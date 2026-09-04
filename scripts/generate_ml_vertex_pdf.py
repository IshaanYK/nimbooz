import os
import sys
import shutil
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
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "AASRA — ML MODELS SPECIFICATION & GOOGLE VERTEX AI DEPLOYMENT")
            self.setFont("Helvetica", 8)
            self.drawRightString(8.5 * inch - 54, 11 * inch - 36, "Hack Core 2026: PS-02 + PS-03 + PS-04 + PS-07")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.75)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)
            
        # Running Footer (all pages)
        self.setFont("Helvetica-Bold", 8)
        self.drawString(54, 32, "AASRA | Specialised Agronomic ML Suite & Google Cloud AI Integration")
        self.setFont("Helvetica", 8)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 32, page_text)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(54, 44, 8.5 * inch - 54, 44)
        self.restoreState()

def build_pdf(target_paths):
    styles = getSampleStyleSheet()
    
    # Palette (Stripe & Precision Ag inspired)
    c_navy = colors.HexColor("#0F172A")       # Dark Navy
    c_blue = colors.HexColor("#1A73E8")       # Google Cloud Blue
    c_emerald = colors.HexColor("#059669")    # Syngenta Emerald
    c_purple = colors.HexColor("#7C3AED")     # Diagnostic Purple
    c_amber = colors.HexColor("#D97706")      # Warning Amber
    c_slate = colors.HexColor("#334155")      # Slate Body Text
    c_muted = colors.HexColor("#64748B")      # Muted Label
    c_bg_light = colors.HexColor("#F8FAFC")   # Light Card BG
    c_bg_callout = colors.HexColor("#F0FDF4") # Pale Emerald Card BG
    c_border = colors.HexColor("#E2E8F0")     # Border Grey
    c_border_green = colors.HexColor("#86EFAC")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=19,
        leading=23,
        textColor=c_navy,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=c_blue,
        spaceAfter=10
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=c_muted
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16,
        textColor=c_navy,
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13.5,
        textColor=c_emerald,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=c_slate,
        spaceAfter=4
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
        fontSize=8.5,
        leading=12,
        textColor=c_slate,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    callout_text = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#166534")
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#1E293B")
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10.5,
        textColor=c_slate
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10.5,
        textColor=c_navy
    )

    def create_callout(text, bg_color=c_bg_callout, border_color=c_border_green, text_color="#166534"):
        p = Paragraph(f"<font color='{text_color}'><b>Architectural Mandate:</b> {text}</font>", callout_text)
        t = Table([[p]], colWidths=[7.0 * inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_color),
            ('BOX', (0,0), (-1,-1), 1, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 9),
            ('RIGHTPADDING', (0,0), (-1,-1), 9),
        ]))
        return t

    def create_code_box(title, code_lines):
        formatted_code = "<br/>".join([f"&nbsp;&nbsp;{line}" for line in code_lines])
        content = [
            Paragraph(f"<b>{title}</b>", body_bold),
            Spacer(1, 2),
            Paragraph(f"<font face='Courier' color='#1E293B'>{formatted_code}</font>", code_style)
        ]
        t = Table([[content]], colWidths=[7.0 * inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
            ('BOX', (0,0), (-1,-1), 0.75, c_border),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return t

    story = []

    # ═════════════════════════════════════════════════════════════════════
    # PAGE 1: SCOPE, CORE PRINCIPLES & SYSTEM ARCHITECTURE
    # ═════════════════════════════════════════════════════════════════════
    story.append(Paragraph("AASRA: Agronomic ML Architecture & Vertex AI Guide", title_style))
    story.append(Paragraph("Specialised ML Models for PS-02 + PS-03 + PS-04 + PS-07 & Google Cloud Deployment", subtitle_style))
    story.append(Paragraph(
        "<b>Scope Alignment:</b> Hack Core 2026 Problem Statements (PS-02, PS-03, PS-04, PS-07) &nbsp;|&nbsp; "
        "<b>Cloud Stack:</b> Google Vertex AI / Cloud Run + Next.js &nbsp;|&nbsp; "
        "<b>Version:</b> 1.0 Production Blueprint",
        meta_style
    ))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_blue, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("1. System Architecture & The Modular ML Principle", h1_style))
    story.append(Paragraph(
        "A foundational principle defined by the hackathon organizers is: "
        "<b>'The selected solution should use specialised ML models for risk, recommendation, yield and causal attribution, "
        "while Gemini acts as the multilingual conversational layer. We should NOT train one giant model.'</b>",
        body_style
    ))
    story.append(Paragraph(
        "Training a single monolithic model fails in agriculture because physical biophysics, chemical label safety, and causal economics "
        "require different learning paradigms. AASRA implements a modular, decoupled architecture where each model has an explicit, "
        "verifiable role and feeds structured outputs into the Gemini conversational layer and website UI.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Master Models Table
    model_matrix = [
        [Paragraph("Problem Statement", table_header), Paragraph("Model / Component", table_header), Paragraph("Core Algorithm / Type", table_header), Paragraph("Target Output & Purpose", table_header)],
        [
            Paragraph("<b>PS-02</b>", table_cell_bold),
            Paragraph("Climate Stress Prediction", table_cell_bold),
            Paragraph("XGBoost / LightGBM Classifier", table_cell),
            Paragraph("Predicts upcoming heat, drought, heavy rain probability (0-100%), time window (days) and severity.", table_cell)
        ],
        [
            Paragraph("<b>PS-02</b>", table_cell_bold),
            Paragraph("Biological Intervention Readiness", table_cell_bold),
            Paragraph("Hybrid Rule Engine + Scorer", table_cell),
            Paragraph("Converts risk to action: Readiness Score (0-100), APPLY NOW / WAIT / AVOID status, 36h spray window.", table_cell)
        ],
        [
            Paragraph("<b>PS-03</b>", table_cell_bold),
            Paragraph("Biological Product Ranking", table_cell_bold),
            Paragraph("Hard Filter + LGBM Ranker", table_cell),
            Paragraph("Ranks 50 Syngenta biologicals for crop, stage, soil, and stress compatibility with fit score.", table_cell)
        ],
        [
            Paragraph("<b>PS-03 / PS-07</b>", table_cell_bold),
            Paragraph("Expected Product Response", table_cell_bold),
            Paragraph("Treatment-Response Regressor", table_cell),
            Paragraph("Estimates stress reduction range (23-35%) and expected yield impact (+5-9%) with uncertainty.", table_cell)
        ],
        [
            Paragraph("<b>PS-07</b>", table_cell_bold),
            Paragraph("Field Yield Prediction", table_cell_bold),
            Paragraph("Gradient-Boosted Regressor", table_cell),
            Paragraph("Predicts expected field-level yield (e.g. 20.4 q/acre; range 18.7-22.1) and confidence.", table_cell)
        ],
        [
            Paragraph("<b>PS-07</b>", table_cell_bold),
            Paragraph("Causal Biological Impact / ROI", table_cell_bold),
            Paragraph("Causal ML Meta-Learner (T-Learner)", table_cell),
            Paragraph("Counterfactual lift: true incremental yield directly attributable to biological (+2.2 q/acre) & ROBI.", table_cell)
        ],
        [
            Paragraph("<b>PS-04</b>", table_cell_bold),
            Paragraph("Gemini Multilingual Layer", table_cell_bold),
            Paragraph("Gemini 2.5 Flash + Tool Calling", table_cell),
            Paragraph("Understands farmer voice/text in local languages, orchestrates specialised models, explains 'Why?'.", table_cell)
        ]
    ]
    t_model_matrix = Table(model_matrix, colWidths=[0.8 * inch, 2.0 * inch, 1.8 * inch, 2.4 * inch])
    t_model_matrix.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_model_matrix)
    story.append(Spacer(1, 6))

    story.append(create_callout(
        "Gemini acts as the intelligent orchestration, reasoning, and explanation bridge. It translates farmer queries, "
        "triggers the specialised ML models via structured JSON parameters, and narrates model outputs with transparent 'Why?' explanations.",
        c_bg_callout, c_border_green, "#166534"
    ))

    # ═════════════════════════════════════════════════════════════════════
    # PAGE 2: PS-02 CLIMATE STRESS & INTERVENTION READINESS
    # ═════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("2. PS-02: Climate Stress Prediction & Intervention Timing", h1_style))
    
    story.append(Paragraph("Model 1: Climate Stress Prediction Model (PS-02)", h2_style))
    story.append(Paragraph(
        "<b>Purpose:</b> Predict the probability, timing, and severity of climate-related crop stress for a specific field.<br/>"
        "<b>Inputs:</b> Location (lat/lon, district), crop, crop stage, sowing date, daily TMax, TMin, humidity, rainfall, wind, "
        "solar radiation, volumetric soil moisture (0-28cm), soil texture/pH, historical weather anomalies, and season/month.<br/>"
        "<b>Outputs:</b> Stress type, probability (0-100%), arrival window (days), severity level, confidence score.<br/>"
        "<b>Example Output:</b> <i>Heat Stress -> 78% probability -> Expected in 6-9 days -> Moderate severity.</i>",
        body_style
    ))
    story.append(Paragraph(
        "• <b>Recommended Algorithm:</b> LightGBM or XGBoost Classifier. We construct rolling feature windows over 3, 7, and 14 days: "
        "consecutive dry spell days, Heat Stress Index (HSI), and Vapor Pressure Deficit (VPD).<br/>"
        "• <b>Training Target:</b> Ground-truth stress events or defensible biophysical proxy labels: "
        "Thermal spike ($T_{\\text{night}} \\ge 24.5^\\circ\\text{C}$ or $T_{\\max} \\ge 35^\\circ\\text{C}$), Drought ($\text{VPD} \\ge 2.8\\text{ kPa}$ & Soil Moisture $<25\\%$), "
        "and Waterlogging ($>50\\text{ mm}$ rainfall on heavy clay).",
        bullet_style
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Model 2: Biological Intervention Timing / Readiness Model (PS-02)", h2_style))
    story.append(Paragraph(
        "<b>Purpose:</b> Convert climate risk predictions and environmental conditions into an actionable biological intervention window.<br/>"
        "<b>Core Philosophy:</b> A biological intervention must be applied <i>proactively before</i> the crop reaches irreversible cellular damage, "
        "but strictly under safe application conditions (avoiding wind drift or rain washoff).",
        body_style
    ))
    
    readiness_data = [
        [Paragraph("Condition Evaluated", table_header), Paragraph("Threshold / Rule", table_header), Paragraph("Readiness Impact", table_header)],
        [Paragraph("Spray Rain Feasibility", table_cell_bold), Paragraph("Precipitation probability < 20% in next 6h", table_cell), Paragraph("Rain >5mm washes foliar actives off leaf surface (AVOID/WAIT).", table_cell)],
        [Paragraph("Wind Drift Limit", table_cell_bold), Paragraph("Wind speed < 15 km/h", table_cell), Paragraph("Wind >15 km/h causes droplet drift and uneven canopy coverage.", table_cell)],
        [Paragraph("Heat Evaporation Cap", table_cell_bold), Paragraph("Temperature at spray time < 35°C", table_cell), Paragraph("High ambient heat evaporates droplets before stomatal absorption.", table_cell)],
        [Paragraph("Phenological Vulnerability", table_cell_bold), Paragraph("Crop at flowering / pod-set / squaring", table_cell), Paragraph("Reproductive window provides highest biostimulant response.", table_cell)],
        [Paragraph("Optimal Diurnal Window", table_cell_bold), Paragraph("6:00 AM - 9:30 AM or 4:30 PM - 6:30 PM", table_cell), Paragraph("Stomata are open and transpiration pull is optimal.", table_cell)]
    ]
    t_readiness = Table(readiness_data, colWidths=[1.8 * inch, 2.5 * inch, 2.7 * inch])
    t_readiness.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_readiness)
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<b>Model Architecture:</b> Hybrid Model = Deterministic Agronomic Guardrails (Hard Constraints) + "
        "Trained Scoring Regressor (LightGBM) outputting `readiness_score` (0-100).<br/>"
        "<b>Output Example:</b> <i>Readiness Score 84/100 -> Status: APPLY NOW -> Optimal Window: Next 36 Hours (6:00 AM - 9:30 AM).</i>",
        body_style
    ))
    story.append(Spacer(1, 4))
    story.append(create_callout(
        "By pairing Climate Stress Prediction with Intervention Readiness, AASRA never gives a generic alert. "
        "It tells the farmer exactly: What stress is coming, whether today is safe to spray, and the exact 36-hour operational window.",
        c_bg_callout, c_border_green, "#166534"
    ))

    # ═════════════════════════════════════════════════════════════════════
    # PAGE 3: PS-03 & PS-07 RECOMMENDATION, YIELD & CAUSAL ROI
    # ═════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("3. PS-03 & PS-07: Product Ranking, Yield & Causal Impact", h1_style))

    story.append(Paragraph("Model 3: Biological Product Recommendation & Ranking (PS-03)", h2_style))
    story.append(Paragraph(
        "<b>Purpose:</b> Rank the best biological product for a specific farmer, crop, soil, growth stage, and observed stress context.<br/>"
        "<b>Two-Stage Architecture:</b><br/>"
        "1. <b>Hard Disqualifier Filters:</b> Disqualifies products by wrong crop label, incompatible phenology stage, invalid application method, "
        "or known chemical antagonism (e.g. never mix biologicals with alkaline copper fungicides).<br/>"
        "2. <b>ML Ranking Engine (LGBMRanker):</b> Scores candidate products based on: stress suitability, crop compatibility, "
        "growth stage match, soil moisture/pH, historical trial efficacy, and expected net economic return.",
        body_style
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Model 4: Expected Product Response Model (PS-03 / PS-07)", h2_style))
    story.append(Paragraph(
        "<b>Mandate:</b> <i>Show ranges and uncertainty. Do not present an expected response as a guaranteed effect.</i><br/>"
        "<b>Inputs:</b> Field conditions, crop, stage, stress severity, weather, product dose, and application method.<br/>"
        "<b>Outputs:</b> Expected stress reduction range (e.g. <i>23-35%</i>), expected yield impact range (e.g. <i>+5-9%</i>), and Confidence: <i>Medium (84%)</i>.",
        body_style
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Model 5: Field-Level Yield Prediction Model (PS-07)", h2_style))
    story.append(Paragraph(
        "<b>Purpose:</b> Predict expected yield for a specific field accounting for crop variety, sowing date, weather trajectory, "
        "soil characteristics, satellite vegetation indices (NDVI/NDWI), and farmer interventions.<br/>"
        "<b>Model:</b> Gradient-boosted regression (XGBoost) with <i>field/season-aware cross-validation</i> to prevent spatial data leakage.<br/>"
        "<b>Output Example:</b> <i>Expected Yield: 20.4 q/acre; Range: 18.7 - 22.1 q/acre; Confidence: 82%.</i>",
        body_style
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Model 6: Causal Biological Impact / ROI Model (PS-07)", h2_style))
    story.append(Paragraph(
        "<b>The Core Challenge:</b> Before/after or simple treated-vs-untreated averages are NOT causal attribution. "
        "Treated fields often receive better water or fertilizer, creating severe confounding bias. "
        "The system must answer: <i>What would the yield have been WITHOUT the biological versus WITH the biological under identical conditions?</i>",
        body_style
    ))
    
    # Causal Box
    story.append(create_code_box(
        "Causal ML Formulation: T-Learner (Two-Learner Meta-Model)",
        [
            "# Train Base Learner 0 on Control (Untreated) Fields: mu0(X) = E[Y | X, Treatment=0]",
            "# Train Base Learner 1 on Treated Fields: mu1(X) = E[Y | X, Treatment=1]",
            "counterfactual_yield = model_mu0.predict(field_features)   # e.g. 18.2 q/acre",
            "factual_yield        = model_mu1.predict(field_features)   # e.g. 20.4 q/acre",
            "causal_treatment_effect (CATE) = factual_yield - counterfactual_yield  # +2.2 q/acre (+12.1%)",
            "net_causal_profit = (2.2 * mandi_price_per_qtl) - biological_product_cost"
        ]
    ))
    story.append(Spacer(1, 6))
    story.append(create_callout(
        "The T-Learner isolates the true incremental lift produced by the biological product, mathematically proving "
        "to the farmer and judges that the yield gain was caused by the intervention, not random weather luck.",
        c_bg_callout, c_border_green, "#166534"
    ))

    # ═════════════════════════════════════════════════════════════════════
    # PAGE 4: GEMINI LAYER, TRAINING RECORD & PYTHON SCRIPT
    # ═════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("4. PS-04: Gemini Conversational Layer & Training Pipeline", h1_style))

    story.append(Paragraph("Model 7: Gemini Conversational Layer (PS-04)", h2_style))
    story.append(Paragraph(
        "<b>Role:</b> The user-facing multilingual voice and chat interface. "
        "We use <b>Gemini 2.5 Flash</b> with structured tool/function calling rather than training a generic LLM from scratch.<br/>"
        "<b>Responsibilities:</b><br/>"
        "1. <b>Multilingual Understanding:</b> Handles Hindi, Marathi, Punjabi, Telugu, English, and regional dialects.<br/>"
        "2. <b>Intent & Entity Extraction:</b> Extracts field location, crop type, sowing date, and observed symptoms.<br/>"
        "3. <b>Model Orchestration:</b> Calls PS-02 Stress Model, PS-03 Recommendation Model, and PS-07 Causal Model.<br/>"
        "4. <b>Empirical Explanation:</b> Explains model outputs in simple, actionable farmer language (answering <i>'Why am I getting this recommendation?'</i>).",
        body_style
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Core Training Record Specification", h2_style))
    story.append(Paragraph(
        "According to the hackathon dataset standard, every observation in our training matrix follows this unified schema:",
        body_style
    ))
    
    schema_data = [
        [Paragraph("Category", table_header), Paragraph("Features Ingested", table_header), Paragraph("Data Source", table_header)],
        [Paragraph("Field Profile", table_cell_bold), Paragraph("Field ID, lat/lon, district, area (acres), crop, variety, sowing date, irrigation status", table_cell), Paragraph("AASRA Field Store / Polygon GPS", table_cell)],
        [Paragraph("Soil Properties", table_cell_bold), Paragraph("Texture (sand/clay %), moisture (0-28cm), pH, EC (salinity), Organic Carbon, N, P, K", table_cell), Paragraph("ISRIC SoilGrids 2.0 & NASA SMAP", table_cell)],
        [Paragraph("Weather Telemetry", table_cell_bold), Paragraph("TMax, TMin, humidity, rainfall, wind, solar radiation, VPD, GDD, 16-day forecast", table_cell), Paragraph("Open-Meteo & ERA5-Land (ECMWF)", table_cell)],
        [Paragraph("Crop State", table_cell_bold), Paragraph("Growth stage (vegetative/bloom/pod), DAS, NDVI, NDWI, historical stress days", table_cell), Paragraph("Sentinel-2 L2A & FAO-56 Phenology", table_cell)],
        [Paragraph("Intervention", table_cell_bold), Paragraph("Product applied (Quantis/Ampligo), application date, dose/acre, method, area treated", table_cell), Paragraph("AASRA Field Action Journal", table_cell)],
        [Paragraph("Outcome Labels", table_cell_bold), Paragraph("Observed stress (type/severity), response confirmation, final harvest yield (q/acre)", table_cell), Paragraph("ICAR AICRP Trials & Field Verifications", table_cell)]
    ]
    t_schema = Table(schema_data, colWidths=[1.3 * inch, 3.7 * inch, 2.0 * inch])
    t_schema.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_schema)
    story.append(Spacer(1, 6))

    story.append(Paragraph("Python Training Script Architecture (`scripts/train_hackathon_models.py`)", h2_style))
    story.append(create_code_box(
        "Python Model Pipeline (LightGBM, XGBoost, Causal T-Learner)",
        [
            "from lightgbm import LGBMClassifier, LGBMRegressor",
            "from xgboost import XGBRegressor",
            "# 1. PS-02: Climate Stress Classifier",
            "stress_model = LGBMClassifier(n_estimators=150, learning_rate=0.05, max_depth=6)",
            "stress_model.fit(X_train, y_stress_labels)",
            "# 2. PS-07: Causal T-Learner for Biological Lift",
            "X_control = X[treatment == 0]; y_control = y[treatment == 0]",
            "X_treated = X[treatment == 1]; y_treated = y[treatment == 1]",
            "mu0_model = XGBRegressor().fit(X_control, y_control)  # Yield under No Product",
            "mu1_model = XGBRegressor().fit(X_treated, y_treated)  # Yield under Biological Product",
            "joblib.dump({'stress': stress_model, 'mu0': mu0_model, 'mu1': mu1_model}, 'models/aasra_ml_suite.joblib')"
        ]
    ))

    # ═════════════════════════════════════════════════════════════════════
    # PAGE 5: DEPLOYMENT TO GOOGLE VERTEX AI & LIVE WEBSITE
    # ═════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("5. Google Cloud Deployment & Next.js Website Integration", h1_style))

    story.append(Paragraph("Cloud Architecture Comparison: Vertex AI vs Google Cloud Run", h2_style))
    story.append(Paragraph(
        "Google Cloud Platform provides two methods to serve these models online with a public HTTPS endpoint:",
        body_style
    ))

    deploy_comp = [
        [Paragraph("Feature / Metric", table_header), Paragraph("Google Vertex AI Endpoint", table_header), Paragraph("Google Cloud Run (Serverless Container)", table_header)],
        [Paragraph("Deployment Model", table_cell_bold), Paragraph("Managed Vertex AI Model Registry + Node Endpoint", table_cell), Paragraph("Serverless FastAPI Docker Container on GCP", table_cell)],
        [Paragraph("Billing Structure", table_cell_bold), Paragraph("24/7 VM reservation (minimum ~$50-70/month)", table_cell), Paragraph("Scales to 0 when idle ($0 cost when not querying!)", table_cell_bold)],
        [Paragraph("Latency / Response", table_cell_bold), Paragraph("15-30ms dedicated inference", table_cell), Paragraph("25-45ms inference (sub-50ms)", table_cell)],
        [Paragraph("API Protocols", table_cell_bold), Paragraph("Google gRPC & Vertex REST (requires IAM token)", table_cell), Paragraph("Standard HTTPS JSON REST (native for Next.js fetch)", table_cell_bold)],
        [Paragraph("Recommendation", table_cell_bold), Paragraph("Best for enterprise 24/7 high-throughput fleets", table_cell), Paragraph("RECOMMENDED for Hackathon & Web Launch", table_cell_bold)]
    ]
    t_comp = Table(deploy_comp, colWidths=[1.5 * inch, 2.7 * inch, 2.8 * inch])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 4))

    story.append(Paragraph("Step-by-Step Deployment Commands (GCP)", h2_style))
    story.append(create_code_box(
        "Deploying the Model Suite to Google Cloud (One-Command Deployment)",
        [
            "# Step 1: Package FastAPI app with trained .joblib models into Docker container",
            "# Step 2: Deploy container directly to Google Cloud Run (Asia South - Mumbai):",
            "gcloud run deploy aasra-ml-suite \\",
            "    --source . \\",
            "    --region asia-south1 \\",
            "    --memory 2Gi \\",
            "    --cpu 2 \\",
            "    --min-instances 0 \\",
            "    --allow-unauthenticated",
            "# Result: Live HTTPS Endpoint -> https://aasra-ml-suite-xxxxxx.a.run.app/predict"
        ]
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Live Website Integration (Next.js Frontend)", h2_style))
    story.append(Paragraph(
        "The live Next.js website connects to the Google Cloud ML service via a secure server route "
        "(`frontend/src/app/api/ml/predict/route.ts`). "
        "If Google Cloud is cold-starting or unreachable, the system automatically falls back to our calibrated biophysical engine, "
        "guaranteeing <b>100% uptime with zero crashes</b> for farmers and evaluators.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Priority Roadmap
    story.append(Paragraph("Hackathon Execution Priority Roadmap", h2_style))
    priority_data = [
        [Paragraph("Priority", table_header), Paragraph("Milestone & Components", table_header), Paragraph("Deliverables", table_header)],
        [Paragraph("P0 — Core", table_cell_bold), Paragraph("PS-02 Climate Stress + PS-03 Product Ranking + PS-04 Gemini + PS-07 Causal ROI", table_cell), Paragraph("Trained LightGBM & T-Learner models, live Next.js API integration.", table_cell)],
        [Paragraph("P1 — Strong", table_cell_bold), Paragraph("Yield Prediction + Biological Readiness Scorer + Syngenta Product KB", table_cell), Paragraph("36h spray window calculation, field-aware cross-validation.", table_cell)],
        [Paragraph("P2 — Extension", table_cell_bold), Paragraph("Crop-Photo Intelligence (Gemini Vision) + Advanced Response Calibration", table_cell), Paragraph("Visual foliar verification and multi-year economic balance sheet.", table_cell)]
    ]
    t_prio = Table(priority_data, colWidths=[1.1 * inch, 3.4 * inch, 2.5 * inch])
    t_prio.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_prio)
    story.append(Spacer(1, 8))

    story.append(create_callout(
        "The complete live web application is accessible at: https://frontend-phi-flame-21.vercel.app. "
        "This document serves as the official technical architecture guide for all Hack Core 2026 problem statements.",
        c_bg_callout, c_border_green, "#166534"
    ))

    # Build primary and secondary paths
    primary_path = target_paths[0]
    os.makedirs(os.path.dirname(os.path.abspath(primary_path)), exist_ok=True)
    doc = SimpleDocTemplate(
        primary_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated master PDF at: {primary_path}")

    for p in target_paths[1:]:
        os.makedirs(os.path.dirname(os.path.abspath(p)), exist_ok=True)
        shutil.copyfile(primary_path, p)
        print(f"Successfully copied PDF to: {p}")

if __name__ == "__main__":
    paths = [
        "D:\\Projects\\DriveF-Projects\\hyperion\\AASRA_ML_Models_and_Vertex_AI_Deployment_Guide.pdf",
        "D:\\Projects\\DriveF-Projects\\hyperion\\frontend\\public\\AASRA_ML_Models_and_Vertex_AI_Deployment_Guide.pdf"
    ]
    build_pdf(paths)
