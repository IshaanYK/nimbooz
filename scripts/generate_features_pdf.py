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
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "AASRA — SYSTEM ARCHITECTURE & 9 CORE FEATURES GUIDE")
            self.setFont("Helvetica", 8)
            self.drawRightString(8.5 * inch - 54, 11 * inch - 36, "Precision Agronomy & Decision Support")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.75)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)
            
        # Running Footer (all pages)
        self.setFont("Helvetica-Bold", 8)
        self.drawString(54, 32, "AASRA | Syngenta Biologicals & Precision Agriculture Platform")
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
    c_emerald = colors.HexColor("#059669")    # Syngenta Emerald Green
    c_blue = colors.HexColor("#2563EB")       # Tech Blue
    c_amber = colors.HexColor("#D97706")      # Warning Amber
    c_purple = colors.HexColor("#7C3AED")     # Diagnostic Purple
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
        fontSize=20,
        leading=24,
        textColor=c_navy,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_emerald,
        spaceAfter=12
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
        fontSize=13,
        leading=17,
        textColor=c_navy,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=c_emerald,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_slate,
        spaceAfter=5
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
        leading=12.5,
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
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1E293B")
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=c_slate
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=c_navy
    )

    def create_callout(text, bg_color=c_bg_callout, border_color=c_border_green, text_color="#166534"):
        p = Paragraph(f"<font color='{text_color}'><b>Key Operational Insight:</b> {text}</font>", callout_text)
        t = Table([[p]], colWidths=[7.0 * inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_color),
            ('BOX', (0,0), (-1,-1), 1, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        return t

    def create_formula_box(title, formula, explanation):
        content = [
            Paragraph(f"<b>{title}</b>", body_bold),
            Spacer(1, 2),
            Paragraph(f"<font face='Courier' color='#1E293B'><b>{formula}</b></font>", code_style),
            Spacer(1, 2),
            Paragraph(f"<font color='#64748B'>{explanation}</font>", meta_style)
        ]
        t = Table([[content]], colWidths=[7.0 * inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
            ('BOX', (0,0), (-1,-1), 0.75, c_border),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return t

    story = []

    # ── HEADER & TITLE ──
    story.append(Paragraph("AASRA: Precision Agronomic Platform", title_style))
    story.append(Paragraph("How the 9 Core Features Work — Architectural & Operational Guide", subtitle_style))
    story.append(Paragraph(
        "<b>Document Target:</b> Agronomists, Developers, Product Evaluators & Farmers &nbsp;|&nbsp; "
        "<b>Standard:</b> ICAR NBSS&LUP & CIBRC Agronomic Protocols &nbsp;|&nbsp; "
        "<b>Version:</b> 2.4 (Production Verified)",
        meta_style
    ))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_emerald, spaceBefore=2, spaceAfter=8))

    # ── EXECUTIVE OVERVIEW ──
    story.append(Paragraph("1. Executive Summary & Core Philosophy", h1_style))
    story.append(Paragraph(
        "Modern agriculture often suffers from generic, one-size-fits-all recommendations. In reality, "
        "two neighbouring farmers growing the same crop in the same village may face drastically different risk profiles "
        "due to subtle differences in sowing dates, soil orders, canopy density, and irrigation methods. "
        "<b>AASRA transforms reactive guesswork into proactive, evidence-based precision decision support.</b>",
        body_style
    ))
    story.append(Paragraph(
        "The system strictly decouples <b>Problem Identification (Diagnostics)</b> from <b>Product Recommendation (Prescription)</b>, "
        "ensuring every recommendation provides transparent empirical justification ('Why?'), closes the loop via post-spray visual checks, "
        "and demonstrates verifiable economic cash Return on Biostimulant Investment (ROBI).",
        body_style
    ))
    story.append(Spacer(1, 4))

    # ── HIGH-LEVEL WORKFLOW TABLE ──
    pipeline_data = [
        [Paragraph("Pillar / Layer", table_header), Paragraph("Primary Core Features", table_header), Paragraph("Underlying Agronomic & Mathematical Logic", table_header)],
        [
            Paragraph("<b>Layer 1: Field Digital Twin</b>", table_cell_bold),
            Paragraph("Feature 1: Satellite Boundary & Soil Auto-Detection", table_cell),
            Paragraph("Calculates true acreage via Spherical Excess; detects ICAR Soil Order (Vertisol, Inceptisol, etc.) via GPS to solve farmer uncertainty.", table_cell)
        ],
        [
            Paragraph("<b>Layer 2: 16-Day Forecast</b>", table_cell_bold),
            Paragraph("Feature 2: Compound Climate Stress<br/>Feature 3: Month-Dependent Pests", table_cell),
            Paragraph("Open-Meteo & MeteoBlue telemetry; calculates VPD, HSI, DSI; aligns calendar month with pest oviposition and degree-day triggers.", table_cell)
        ],
        [
            Paragraph("<b>Layer 3: Diagnostics</b>", table_cell_bold),
            Paragraph("Feature 4: Clinical Diagnostic Mandate (Biotic & Abiotic)", table_cell),
            Paragraph("Calculates arrival time (days), biological mechanisms, and potential yield loss in quintals/acre before recommending any product.", table_cell)
        ],
        [
            Paragraph("<b>Layer 4: Decision Support</b>", table_cell_bold),
            Paragraph("Feature 5: Product Compatibility Engine with 3 'Why?' Reasons", table_cell),
            Paragraph("Filters 50 CIBRC Syngenta products across 8 criteria; provides field-specific dosage and 48-hour safe meteorological spray window.", table_cell)
        ],
        [
            Paragraph("<b>Layer 5: Closed-Loop & ROI</b>", table_cell_bold),
            Paragraph("Feature 6: Action Tracking<br/>Feature 7 & 8: Yield ROI<br/>Feature 9: Mandi Optimization", table_cell),
            Paragraph("Monitors risk drop (82% -> 51% -> 28%) with leaf appearance checklist; calculates net cash gain and optimizes APMC transport logistics.", table_cell)
        ]
    ]
    pipeline_table = Table(pipeline_data, colWidths=[1.7 * inch, 2.3 * inch, 3.0 * inch])
    pipeline_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(pipeline_table)
    story.append(Spacer(1, 8))
    story.append(create_callout(
        "AASRA operates on the principle that digital precision agriculture must empower farmers with actionable "
        "decision-support rather than serving as an opaque product sales funnel.",
        c_bg_callout, c_border_green, "#166534"
    ))

    # ── PAGE BREAK 1 -> 2 ──
    story.append(PageBreak())

    # ── FEATURE 1 ──
    story.append(Paragraph("2. Feature 1: Personalised Digital Field Twin & ICAR Soil Auto-Detection", h1_style))
    story.append(Paragraph(
        "<b>The Challenge:</b> Farmers often do not know their scientific soil order, or may incorrectly guess between Black Clay, "
        "Alluvial Loam, and Sandy Loam. Furthermore, static coordinates fail to account for field perimeter and true area.<br/>"
        "<b>The AASRA Solution:</b>",
        body_style
    ))
    story.append(Paragraph(
        "• <b>Geodesic Polygon Mapping:</b> Using high-resolution satellite imagery, the farmer plots field boundary pins. "
        "Leaflet calculates true geodesic area using the Spherical Excess formula, accurately computing acres and hectares without distortion.",
        bullet_style
    ))
    story.append(Paragraph(
        "• <b>Automated ICAR Soil Classification:</b> When coordinates are selected, AASRA queries Google Gemini AI grounded in "
        "ICAR NBSS&LUP datasets to automatically identify the precise soil order and typical pH range for that specific Indian district:<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>- Maharashtra / MP / Deccan:</b> <i>Vertisol (Medium to Deep Black Cotton Clay)</i>, pH 7.6 - 8.3.<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>- Punjab / Haryana / UP:</b> <i>Inceptisol (Deep Alluvial Sandy Loam)</i>, pH 7.2 - 7.9.<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>- Kerala / Western Ghats:</b> <i>Ultisol (Acidic Humid Laterite)</i>, pH 5.2 - 6.2.<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>- Rajasthan / Gujarat:</b> <i>Aridisol (Desert Sandy Loam)</i>, pH 8.0 - 8.6.",
        bullet_style
    ))
    story.append(Paragraph(
        "• <b>Farmer Reassurance & Cross-Check:</b> The interface displays a live badge "
        "<i>'[AI] Soil Auto-Detected: [Soil Type] (pH [X] • [Texture])'</i> and populates the dropdown with 4–6 local soil variants "
        "so the farmer can visually cross-verify and adjust if their specific plot is different.",
        bullet_style
    ))
    story.append(Spacer(1, 4))
    story.append(create_callout(
        "Boundary coordinates and detected soil chemistry are stored permanently in the database so that subsequent "
        "biophysical simulations and pesticide dosage calculations are customized to that exact field boundary.",
        c_bg_callout, c_border_green, "#166534"
    ))
    story.append(Spacer(1, 10))

    # ── FEATURE 2 ──
    story.append(Paragraph("3. Feature 2: 16-Day Forecast & Compound Climate Stress", h1_style))
    story.append(Paragraph(
        "AASRA ingests continuous 16-day hyper-local weather telemetry (Open-Meteo & MeteoBlue) for the field's GPS centroid: "
        "Daytime Max Temperature (TMax), Nighttime Minimum (TMin), Precipitation (mm), Relative Humidity (RH), Wind Speed, and Solar Radiation.",
        body_style
    ))
    story.append(create_formula_box(
        "Atmospheric Vapor Pressure Deficit (VPD) Calculation",
        "es = 0.6108 * exp((17.27 * T) / (T + 237.3))\nea = es * (RH_avg / 100)\nVPD = es - ea  [kPa]",
        "Where 'es' is saturated vapor pressure and 'ea' is actual vapor pressure. When VPD > 2.8 kPa, atmospheric moisture demand outstrips root hydraulic capacity."
    ))
    story.append(Spacer(1, 4))
    story.append(create_formula_box(
        "Compound Climate Stress Index (CS)",
        "CS = (0.6 * HSI + 0.4 * DSI) * (1 + 0.3 * HSI * DSI)",
        "HSI: Heat Stress Index (TMax & Night Temp vs crop threshold). DSI: Drought Stress Index (VPD, rainfall deficit, dry spell days). The interaction term accounts for catastrophic simultaneous heat + drought."
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<b>Nocturnal Heatwave Stress (High Night Temperature - HNT):</b> When night temperatures stay above crop tolerance "
        "(e.g., >24.5°C for Soybean, >18°C for Wheat), the plant is forced into accelerated dark mitochondrial respiration, "
        "burning sucrose instead of feeding ovaries, causing severe blossom abortion and flower drop.",
        body_style
    ))

    # ── PAGE BREAK 2 -> 3 ──
    story.append(PageBreak())

    # ── FEATURE 3 ──
    story.append(Paragraph("4. Feature 3: Calendar-Aware Pest & Disease Attack Forecaster", h1_style))
    story.append(Paragraph(
        "Insect pests and fungal pathogens do not appear at random; their emergence is strictly governed by "
        "<b>calendar month</b>, <b>crop phenological stage</b>, and <b>micro-climatic incubation windows</b>.",
        body_style
    ))
    story.append(Paragraph(
        "• <b>Month & Phenology Coupling:</b><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>- Soybean (July - September):</b> Semilooper & Spodoptera caterpillars strike during breaks in monsoon rainfall when high humidity combines with sunny spells.<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>- Cotton (August - November):</b> Pink Bollworm strikes at square and boll initiation.<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>- Wheat (December - February):</b> Yellow/Brown Rust strikes when dense morning dew aligns with 15–22°C temperatures.",
        bullet_style
    ))
    story.append(Paragraph(
        "• <b>Dynamic Pan-India AI Grounding:</b> For any crop in any district, AASRA evaluates real-time temperature, humidity, "
        "and consecutive dry days against CIBRC and ICAR entomological databases to output: "
        "the exact scientific and local pest name, incubation trigger, time-to-stress in days, early foliar symptoms, and economic threshold level (ETL).",
        bullet_style
    ))
    story.append(Spacer(1, 8))

    # ── FEATURE 4 & 5 ──
    story.append(Paragraph("5. Features 4 & 5: Diagnostic Approach & Product Compatibility Engine", h1_style))
    story.append(Paragraph(
        "AASRA maintains strict operational separation between <b>Problem Identification (Pillar 1)</b> and "
        "<b>Product Prescription (Pillar 2)</b>. The AI never acts as a black-box sales funnel.",
        body_style
    ))
    story.append(Paragraph("<b>Pillar 1: The Diagnostic Mandate</b>", h2_style))
    story.append(Paragraph(
        "Before considering any product, the engine answers three clinical diagnostic questions:<br/>"
        "1. <i>What stress is developing?</i> (e.g. Nocturnal Heat Stress, 82% probability)<br/>"
        "2. <i>When will it happen?</i> (e.g. Expected in 4 Days during peak thermal spike)<br/>"
        "3. <i>What is the severity and yield loss?</i> (e.g. 18% loss = 2.1 Quintals/Acre)",
        body_style
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Pillar 2: The 8-Point Product Compatibility Engine</b>", h2_style))
    story.append(Paragraph(
        "A candidate product (from a database of 50 CIBRC-registered Syngenta India formulations) is selected only if it satisfies all 8 compatibility criteria:",
        body_style
    ))
    compat_data = [
        [Paragraph("Criteria", table_header), Paragraph("Compatibility Check Rule", table_header), Paragraph("Agronomic Rationale", table_header)],
        [Paragraph("1. Target Stress", table_cell_bold), Paragraph("Directly targets diagnosed stress", table_cell), Paragraph("Osmoprotectant for abiotic heat; targeted insecticide for biotic pests.", table_cell)],
        [Paragraph("2. Crop Label", table_cell_bold), Paragraph("Approved on crop under CIBRC", table_cell), Paragraph("Prevents illegal off-label use and phytotoxicity risks.", table_cell)],
        [Paragraph("3. Growth Stage", table_cell_bold), Paragraph("Aligned with vegetative/bloom/pod", table_cell), Paragraph("Bio-stimulants during bloom; seed treatments strictly pre-sowing.", table_cell)],
        [Paragraph("4. Soil Condition", table_cell_bold), Paragraph("Matches soil moisture & pH buffer", table_cell), Paragraph("Ensures root absorption in heavy clays or avoids leaching in sands.", table_cell)],
        [Paragraph("5. Spray Feasibility", table_cell_bold), Paragraph("Wind <15 km/h, Rain Prob <20%", table_cell), Paragraph("Prevents chemical droplet drift and immediate rain washoff.", table_cell)],
        [Paragraph("6. Tank-Mix Safety", table_cell_bold), Paragraph("Zero chemical antagonism", table_cell), Paragraph("Explicitly forbids mixing with alkaline copper/sulfur that destabilize actives.", table_cell)],
        [Paragraph("7. Trial Efficacy", table_cell_bold), Paragraph("Peer-reviewed ICAR trial backing", table_cell), Paragraph("Requires verified trial citations (e.g. >92% efficacy in university trials).", table_cell)],
        [Paragraph("8. Economic Value", table_cell_bold), Paragraph("Positive net cash return (ROBI > 2.0)", table_cell), Paragraph("Ensures investment cost is heavily outweighed by protected harvest value.", table_cell)]
    ]
    compat_table = Table(compat_data, colWidths=[1.5 * inch, 2.5 * inch, 3.0 * inch])
    compat_table.setStyle(TableStyle([
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
    story.append(compat_table)

    # ── PAGE BREAK 3 -> 4 ──
    story.append(PageBreak())

    story.append(Paragraph("<b>The 3 'Why?' Reasons — Building Farmer Trust</b>", h2_style))
    story.append(Paragraph(
        "Farmers distrust arbitrary recommendations. Every AASRA prescription provides three concrete, transparent reasons:<br/>"
        "• <b>Reason 1 (Weather Telemetry):</b> <i>'Forecast detects peak night temperature of 26.2°C (>24.5°C threshold), triggering flower abortion.'</i><br/>"
        "• <b>Reason 2 (Crop Stage Sensitivity):</b> <i>'Your Soybean is at Flowering & Pod Formation (55 DAS), its most heat-vulnerable reproductive window.'</i><br/>"
        "• <b>Reason 3 (Biochemical Mode of Action):</b> <i>'Quantis supplies betaines and amino acids that up-regulate Heat Shock Proteins (HSP70) to prevent ethylene-induced flower drop.'</i>",
        body_style
    ))
    story.append(create_callout(
        "Actionable Prescription: 'Apply Syngenta Quantis® at 250 ml/acre (1.25 L for your 5 Acres) in 150 L water/acre "
        "using a fine hollow cone nozzle within the next 48 hours between 6:00 AM - 9:30 AM before heat peaks.'",
        c_bg_callout, c_border_green, "#166534"
    ))
    story.append(Spacer(1, 10))

    # ── FEATURE 6 ──
    story.append(Paragraph("6. Feature 6: Closed-Loop Intervention & Visual Crop Health Confirmation", h1_style))
    story.append(Paragraph(
        "Traditional advisory ends when a product is mentioned. AASRA closes the loop by connecting "
        "<b>Prediction -> Recommendation -> Actual Intervention -> Verification</b>.",
        body_style
    ))
    story.append(Paragraph(
        "• <b>Digital Field Action Logging:</b> The farmer confirms application (Yes/No), recording the date, exact dose, method, and treated area in the persistent Field Journal.",
        bullet_style
    ))
    story.append(Paragraph(
        "• <b>Dynamic Risk Trajectory:</b> The biophysical simulator tracks how risk declines over time:<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>- Before Intervention:</b> Stress Probability is <b>82%</b> (Critical Loss Threat).<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>- After 48 Hours:</b> Stress Probability declines to <b>51%</b> as actives stabilize physiology.<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>- After 7 Days:</b> Stress Probability resolves to <b>28%</b> (Normal Baseline).",
        bullet_style
    ))
    story.append(Paragraph(
        "• <b>Visual Confirmation Checklist:</b> The system tells the farmer exactly what the crop <i>should</i> look like:<br/>"
        "<i>'Ideally, 48–72 hours after applying Quantis, flower retention should rise to >92%. Flowers should not have blackened pedicels, "
        "and leaves should remain turgid and erect even under 1:00 PM peak sunlight.'</i><br/>"
        "If the farmer verifies healthy leaves -> Success confirmed. If abnormal symptoms persist -> Automated secondary advisory triggered.",
        bullet_style
    ))
    story.append(Spacer(1, 10))

    # ── FEATURE 7 & 8 ──
    story.append(Paragraph("7. Features 7 & 8: Verifiable Economic ROI & Yield Protection Prediction", h1_style))
    story.append(Paragraph(
        "To eliminate ambiguity, AASRA computes a complete <b>transparent cash balance sheet</b> for every recommendation:",
        body_style
    ))
    roi_data = [
        [Paragraph("Cost / Benefit Component", table_header), Paragraph("Calculation Basis (Example: 5 Acre Soybean Farm)", table_header), Paragraph("Financial Value (INR)", table_header)],
        [Paragraph("1. Product Investment", table_cell_bold), Paragraph("Dealer Price Rs. 1,150/L * 0.25 L/acre * 5 Acres", table_cell), Paragraph("Rs. 1,438", table_cell_bold)],
        [Paragraph("2. Spraying Labor Cost", table_cell_bold), Paragraph("Custom hiring rate of Rs. 250 / acre * 5 Acres", table_cell), Paragraph("Rs. 1,250", table_cell)],
        [Paragraph("3. Water & Mixing Cost", table_cell_bold), Paragraph("Rs. 50 / acre * 5 Acres", table_cell), Paragraph("Rs. 250", table_cell)],
        [Paragraph("<b>Total Out-of-Pocket Investment</b>", table_cell_bold), Paragraph("Product + Labor + Water costs", table_cell), Paragraph("<b>Rs. 2,938</b>", table_cell_bold)],
        [Paragraph("4. Protected Harvest Yield", table_cell_bold), Paragraph("2.1 Quintals/Acre prevented loss * 5 Acres", table_cell), Paragraph("10.5 Quintals", table_cell_bold)],
        [Paragraph("5. Live APMC Mandi Rate", table_cell_bold), Paragraph("Modal trading rate at Bhopal APMC Mandi", table_cell), Paragraph("Rs. 4,850 / Quintal", table_cell)],
        [Paragraph("<b>Gross Revenue Protected</b>", table_cell_bold), Paragraph("10.5 Quintals * Rs. 4,850 / Quintal", table_cell), Paragraph("<b>Rs. 50,925</b>", table_cell_bold)],
        [Paragraph("<b>Net Cash Profit</b>", table_cell_bold), Paragraph("Gross Revenue Protected - Total Investment", table_cell), Paragraph("<b>+ Rs. 47,987</b>", table_cell_bold)],
        [Paragraph("<b>ROBI Multiplier</b>", table_cell_bold), Paragraph("Gross Revenue Protected / Total Investment", table_cell), Paragraph("<b>17.3 x ROI</b>", table_cell_bold)]
    ]
    roi_table = Table(roi_data, colWidths=[2.2 * inch, 3.4 * inch, 1.4 * inch])
    roi_table.setStyle(TableStyle([
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
    story.append(roi_table)

    # ── PAGE BREAK 4 -> 5 ──
    story.append(PageBreak())

    # ── FEATURE 9 ──
    story.append(Paragraph("8. Feature 9: Mandi Price Intelligence & Net Realization Optimization", h1_style))
    story.append(Paragraph(
        "<b>The Transport Pitfall:</b> A neighboring mandi might quote Rs. 100/quintal higher, but transportation, loading fees, "
        "and mandi cess could wipe out the additional revenue.<br/>"
        "<b>AASRA Net Mandi Optimizer:</b> Calculates the <b>Net Realized Revenue</b> for the farmer's specific harvest volume:",
        body_style
    ))
    story.append(create_formula_box(
        "Net Mandi Realization Formula",
        "Net_Price = Modal_Price - ((Distance_km * Fuel_Trolley_Rate) / Total_Quintals + Cess + Labor)",
        "Ranks nearby APMC markets by true cash left in the farmer's pocket after fuel, tractor trolley transit, loading labor, and market fees."
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "• <b>Real-Time Modal Price Tracking:</b> Pulls authentic Agmarknet and APMC records, prioritizing the *modal price* "
        "(the most frequent clearing transaction price), rather than misleading mathematical averages.",
        bullet_style
    ))
    story.append(Paragraph(
        "• <b>Route & Logistics Guidance:</b> Recommends which mandi to visit, estimated travel time, fuel cost, and the exact "
        "net cash advantage over the nearest local yard.",
        bullet_style
    ))
    story.append(Spacer(1, 10))

    # ── SUMMARY & CONCLUSION ──
    story.append(Paragraph("9. Summary Architecture Matrix (The 9 Core Features)", h1_style))
    story.append(Paragraph(
        "The following matrix summarizes the 9 integrated features that make AASRA a complete industrial solution:",
        body_style
    ))
    matrix_data = [
        [Paragraph("Feature #", table_header), Paragraph("Feature Name", table_header), Paragraph("Key Inputs", table_header), Paragraph("Core Mathematical / Agronomic Engine", table_header), Paragraph("Deliverable Output", table_header)],
        [Paragraph("1", table_cell_bold), Paragraph("Digital Field Twin", table_cell_bold), Paragraph("Pins, Sowing Date, GPS", table_cell), Paragraph("Spherical Excess + ICAR NBSS&LUP", table_cell), Paragraph("Acreage, Soil Order, Cultivar Profile", table_cell)],
        [Paragraph("2", table_cell_bold), Paragraph("16-Day Forecast", table_cell_bold), Paragraph("TMax, TMin, RH, Rain, Wind", table_cell), Paragraph("Tetens VPD + Compound Stress (CS)", table_cell), Paragraph("16-day daily stress probabilities", table_cell)],
        [Paragraph("3", table_cell_bold), Paragraph("Pest Forecaster", table_cell_bold), Paragraph("Calendar month, humidity, rain break", table_cell), Paragraph("Oviposition degree-days & CIBRC labels", table_cell), Paragraph("Specific pest attack risk & ETL", table_cell)],
        [Paragraph("4", table_cell_bold), Paragraph("Stress Diagnostics", table_cell_bold), Paragraph("Compound stress, phenology stage", table_cell), Paragraph("Mitochondrial respiration & ABA models", table_cell), Paragraph("Time to peak stress & Qtl/acre loss", table_cell)],
        [Paragraph("5", table_cell_bold), Paragraph("Product Compatibility", table_cell_bold), Paragraph("50 Syngenta products, weather", table_cell), Paragraph("8-point compatibility + mode of action", table_cell), Paragraph("Actionable dose & 3 'Why?' reasons", table_cell)],
        [Paragraph("6", table_cell_bold), Paragraph("Closed-Loop Action", table_cell_bold), Paragraph("Farmer confirmation, spray date", table_cell), Paragraph("Biophysical recovery decay trajectory", table_cell), Paragraph("Risk drop (82%->28%) + leaf checklist", table_cell)],
        [Paragraph("7", table_cell_bold), Paragraph("Economic ROI", table_cell_bold), Paragraph("Product price, labor, water", table_cell), Paragraph("Investment vs protected yield value", table_cell), Paragraph("ROBI multiplier & net cash balance", table_cell)],
        [Paragraph("8", table_cell_bold), Paragraph("Yield Protection", table_cell_bold), Paragraph("ICAR baseline yield, acreage", table_cell), Paragraph("Phenological loss mitigation curves", table_cell), Paragraph("Total protected quintals harvest", table_cell)],
        [Paragraph("9", table_cell_bold), Paragraph("Mandi Optimization", table_cell_bold), Paragraph("APMC rates, distance, fuel rates", table_cell), Paragraph("Net realization logistics formula", table_cell), Paragraph("Best mandi to sell + net profit gain", table_cell)],
    ]
    matrix_table = Table(matrix_data, colWidths=[0.6 * inch, 1.4 * inch, 1.4 * inch, 2.0 * inch, 1.6 * inch])
    matrix_table.setStyle(TableStyle([
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
    story.append(matrix_table)
    story.append(Spacer(1, 12))

    story.append(create_callout(
        "AASRA is live and deployed in production. Every algorithm described in this document is executable and verifiable "
        "via live GPS queries across all 28 states of India at: https://frontend-phi-flame-21.vercel.app",
        c_bg_callout, c_border_green, "#166534"
    ))

    import shutil
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

    # Copy to secondary destinations
    for p in target_paths[1:]:
        os.makedirs(os.path.dirname(os.path.abspath(p)), exist_ok=True)
        shutil.copyfile(primary_path, p)
        print(f"Successfully copied PDF to: {p}")

if __name__ == "__main__":
    paths = [
        "D:\\Projects\\DriveF-Projects\\hyperion\\AASRA_Features_and_Architecture_Guide.pdf",
        "D:\\Projects\\DriveF-Projects\\hyperion\\frontend\\public\\AASRA_Features_and_Architecture_Guide.pdf"
    ]
    build_pdf(paths)

