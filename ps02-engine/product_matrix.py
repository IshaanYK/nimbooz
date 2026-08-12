"""
Syngenta Product Recommendation Matrix
Maps multi-dimensional weather stresses to specific product categories and application timings.
"""

# Severity levels mapped to numeric bounds
# 1 = Moderate, 2 = High, 3 = Critical
SEVERITY_THRESHOLDS = {
    "heat_score": {"Moderate": 1.0, "High": 3.0, "Critical": 5.0},
    "drought_score": {"Moderate": 1.0, "High": 3.0, "Critical": 5.0},
    "frost_score": {"Moderate": 1.0, "High": 3.0, "Critical": 5.0},
    "waterlog_score": {"Moderate": 1.0, "High": 3.0, "Critical": 5.0},
    "compound_score": {"Moderate": 1.0, "High": 3.0, "Critical": 5.0},
}

PRODUCT_MATRIX = {
    "heat_score": [
        {
            "severity": "Critical",
            "product_name": "Syngenta Quantis",
            "category": "Biostimulant",
            "rationale": "Extreme heat stress detected. Quantis preserves cell turgor and minimizes yield loss under severe heat.",
            "timing_advice": "Apply immediately early morning before 10 AM or late evening to avoid rapid evaporation."
        },
        {
            "severity": "High",
            "product_name": "Syngenta Quantis",
            "category": "Biostimulant",
            "rationale": "High heat stress approaching critical levels. Quantis boosts crop resilience.",
            "timing_advice": "Apply during cooler hours of the day."
        },
        {
            "severity": "Moderate",
            "product_name": "Syngenta Isabion",
            "category": "Amino Acid Supplement",
            "rationale": "Mild heat stress detected. Amino acids help rapid recovery and vegetative growth.",
            "timing_advice": "Apply within the next 48 hours."
        }
    ],
    "drought_score": [
        {
            "severity": "Critical",
            "product_name": "Syngenta VIXERAN",
            "category": "Biological Nutrient",
            "rationale": "Severe drought restricts nutrient uptake. Vixeran improves nitrogen efficiency under water scarcity.",
            "timing_advice": "Apply as a foliar spray early morning."
        },
        {
            "severity": "High",
            "product_name": "Syngenta Quantis",
            "category": "Biostimulant",
            "rationale": "Significant soil moisture deficit. Quantis helps maintain photosynthetic activity.",
            "timing_advice": "Apply before visible wilting occurs."
        }
    ],
    "waterlog_score": [
        {
            "severity": "Critical",
            "product_name": "Syngenta Amistar Top",
            "category": "Fungicide",
            "rationale": "High waterlogging creates ideal conditions for root rot and fungal diseases.",
            "timing_advice": "Apply preventatively as soon as field is accessible, or via aerial spray."
        },
        {
            "severity": "High",
            "product_name": "Syngenta Ridomil Gold",
            "category": "Fungicide",
            "rationale": "Excessive moisture increases risk of Downy Mildew / Phytophthora.",
            "timing_advice": "Apply immediately after rain stops."
        }
    ],
    "compound_score": [
        {
            "severity": "Critical",
            "product_name": "Syngenta EPIVIO",
            "category": "Seed Treatment / Biostimulant",
            "rationale": "Compound stress (Heat + Drought) detected. Epivio stimulates root architecture for survival.",
            "timing_advice": "Apply immediately. Urgent action required to prevent crop failure."
        }
    ]
}

def get_recommendations_for_day(daily_scores):
    """
    Evaluates the daily stress scores and returns a list of categorized product recommendations.
    """
    recommendations = []
    is_critical = False
    
    for stress_type, score in daily_scores.items():
        if score <= 0 or stress_type not in PRODUCT_MATRIX:
            continue
            
        # Determine severity
        severity = "Moderate"
        if score >= SEVERITY_THRESHOLDS[stress_type]["Critical"]:
            severity = "Critical"
            is_critical = True
        elif score >= SEVERITY_THRESHOLDS[stress_type]["High"]:
            severity = "High"
            
        # Find matching product in matrix
        for entry in PRODUCT_MATRIX[stress_type]:
            if entry["severity"] == severity:
                rec = entry.copy()
                rec["trigger_stress"] = stress_type
                recommendations.append(rec)
                break # Only take the highest matching severity for this stress
                
    return recommendations, is_critical
