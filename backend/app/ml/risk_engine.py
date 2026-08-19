from typing import Dict, Any, Tuple

class RiskEngine:
    def __init__(self, low_threshold: float = 0.35, high_threshold: float = 0.70):
        self.low_threshold = low_threshold
        self.high_threshold = high_threshold

    def classify_risk(self, probability: float) -> str:
        """
        Classifies churn probability into LOW, MEDIUM, or HIGH risk categories
        using configurable thresholds.
        """
        if probability < self.low_threshold:
            return "LOW"
        elif probability < self.high_threshold:
            return "MEDIUM"
        else:
            return "HIGH"

    def calculate_priority(self, probability: float, total_spend: float) -> Tuple[float, str]:
        """
        Calculates business retention priority score and label.
        Formula: Churn Probability * (Total Spend / 1000) * Risk Weight
        """
        # Normalize spend ratio (capped at max spend scale $1000)
        spend_factor = min(max(total_spend / 1000.0, 0.1), 1.5)
        
        # Risk weight
        risk_level = self.classify_risk(probability)
        weight_map = {"HIGH": 1.5, "MEDIUM": 1.1, "LOW": 0.8}
        weight = weight_map.get(risk_level, 1.0)

        priority_score = round(probability * spend_factor * weight, 4)

        if priority_score >= 0.50 or (probability >= 0.70 and total_spend >= 500):
            priority_label = "CRITICAL"
        elif priority_score >= 0.30 or probability >= 0.60:
            priority_label = "HIGH"
        elif priority_score >= 0.15 or probability >= 0.35:
            priority_label = "MEDIUM"
        else:
            priority_label = "LOW"

        return priority_score, priority_label
