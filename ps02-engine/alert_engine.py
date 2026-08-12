"""
Alert Engine — Plain Language Formatter

Converts the complex decision engine output into simple, jargon-free
actionable alerts for the farmer.
"""

from typing import Dict, Any

class AlertEngine:
    """
    Translates decision engine recommendations into farmer-friendly,
    plain-language intervention alerts with clear actions.
    """

    @staticmethod
    def generate_alert(decision_output: Dict[str, Any]) -> Dict[str, str]:
        """
        Convert the structured decision output into a simple alert.
        Removes all technical jargon, scores, and raw metrics.
        """
        product = decision_output.get("recommended_product")
        urgency = decision_output.get("urgency", "low").title()
        timing = decision_output.get("when_to_apply", "Unable to determine timing")
        duration = decision_output.get("duration", "Unable to determine duration")
        
        # Format the product name nicely
        if product:
            formatted_product = product.replace("_", " ").title()
        else:
            formatted_product = "None"

        # Handle case where no product is recommended (low stress)
        if not product or urgency == "Low":
            return {
                "message": "Your field looks healthy and conditions are good.",
                "action": "Continue normal monitoring. No immediate action is required right now.",
                "product": "None",
                "timing": "N/A",
                "duration": "N/A",
                "urgency": "Low"
            }

        # Build simple language message
        if urgency == "Critical":
            message = f"Immediate attention needed! Your crop is facing severe stress."
        elif urgency == "High":
            message = f"Your crop is showing clear signs of stress that could impact yield."
        else:
            message = f"We noticed some mild stress in your field."

        message += f" We recommend applying {formatted_product} to help the crop recover."

        action = f"Apply {formatted_product} {timing.lower()}."

        return {
            "message": message,
            "action": action,
            "product": formatted_product,
            "timing": timing,
            "duration": duration,
            "urgency": urgency
        }

