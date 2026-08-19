import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple

FEATURE_DISPLAY_NAMES = {
    "Age": "Customer Age",
    "Tenure": "Tenure (Months)",
    "Usage Frequency": "Usage Frequency",
    "Support Calls": "Support Calls Count",
    "Payment Delay": "Payment Delay (Days)",
    "Total Spend": "Total Spend ($)",
    "Last Interaction": "Last Interaction (Days Ago)",
    "Gender_Male": "Gender: Male",
    "Subscription Type_Premium": "Subscription: Premium",
    "Subscription Type_Standard": "Subscription: Standard",
    "Contract Length_Monthly": "Contract: Monthly",
    "Contract Length_Quarterly": "Contract: Quarterly"
}

class ChurnExplainer:
    def __init__(self, model: Any, feature_names: List[str]):
        self.model = model
        self.feature_names = feature_names

    def get_global_importance(self) -> List[Dict[str, Any]]:
        """
        Returns feature importance scores ranked from highest to lowest.
        Supports Tree models (feature_importances_) and Linear models (coef_).
        """
        importances = []
        raw_model = self.model

        # Extract base model if wrapped in CalibratedClassifierCV
        if hasattr(raw_model, "calibrated_classifiers_") and len(raw_model.calibrated_classifiers_) > 0:
            raw_model = raw_model.calibrated_classifiers_[0].estimator

        if hasattr(raw_model, "feature_importances_"):
            scores = raw_model.feature_importances_
        elif hasattr(raw_model, "coef_"):
            coef = raw_model.coef_
            if coef.ndim > 1:
                coef = coef[0]
            scores = np.abs(coef)
        else:
            # Fallback uniform
            scores = np.ones(len(self.feature_names)) / len(self.feature_names)

        # Normalize to sum to 100%
        total = np.sum(scores) if np.sum(scores) > 0 else 1.0
        normalized = (scores / total) * 100.0

        for name, score in zip(self.feature_names, normalized):
            display_name = FEATURE_DISPLAY_NAMES.get(name, name)
            importances.append({
                "feature": name,
                "display_name": display_name,
                "importance": round(float(score), 2)
            })

        importances.sort(key=lambda x: x["importance"], reverse=True)
        return importances

    def get_individual_explanation(
        self, customer_raw: Dict[str, Any], x_single_transformed: np.ndarray
    ) -> List[Dict[str, Any]]:
        """
        Calculates individual customer-specific risk drivers.
        Analyzes raw customer behavioral signals against domain risk benchmarks.
        """
        drivers = []

        payment_delay = customer_raw.get("Payment Delay", 0)
        support_calls = customer_raw.get("Support Calls", 0)
        usage_frequency = customer_raw.get("Usage Frequency", 0)
        contract_length = customer_raw.get("Contract Length", "")
        tenure = customer_raw.get("Tenure", 0)
        last_interaction = customer_raw.get("Last Interaction", 0)

        # Driver 1: Payment Delay
        if payment_delay >= 15:
            drivers.append({
                "factor": "Payment Delay",
                "impact": "High Risk Driver",
                "severity": "HIGH",
                "description": f"Severe payment delay of {payment_delay} days observed (threshold >= 15 days)."
            })
        elif payment_delay >= 7:
            drivers.append({
                "factor": "Payment Delay",
                "impact": "Moderate Risk Driver",
                "severity": "MEDIUM",
                "description": f"Moderate payment delay of {payment_delay} days."
            })

        # Driver 2: Support Calls
        if support_calls >= 6:
            drivers.append({
                "factor": "Support Calls",
                "impact": "High Risk Driver",
                "severity": "HIGH",
                "description": f"Excessive support contact ({support_calls} calls), signaling potential customer dissatisfaction."
            })
        elif support_calls >= 4:
            drivers.append({
                "factor": "Support Calls",
                "impact": "Moderate Risk Driver",
                "severity": "MEDIUM",
                "description": f"Elevated support calls count ({support_calls} calls)."
            })

        # Driver 3: Usage Frequency
        if usage_frequency <= 8:
            drivers.append({
                "factor": "Usage Frequency",
                "impact": "High Risk Driver",
                "severity": "HIGH",
                "description": f"Low usage frequency ({usage_frequency} sessions/mo), indicating declining product engagement."
            })
        elif usage_frequency <= 14:
            drivers.append({
                "factor": "Usage Frequency",
                "impact": "Moderate Risk Driver",
                "severity": "MEDIUM",
                "description": f"Below-average usage frequency ({usage_frequency} sessions/mo)."
            })

        # Driver 4: Contract Commitment
        if contract_length == "Monthly":
            drivers.append({
                "factor": "Contract Commitment",
                "impact": "Risk Driver",
                "severity": "MEDIUM",
                "description": "Monthly contract provides low commitment barrier to cancellation."
            })

        # Driver 5: Tenure
        if tenure <= 6:
            drivers.append({
                "factor": "New Customer Tenure",
                "impact": "Risk Driver",
                "severity": "MEDIUM",
                "description": f"Recent onboarding ({tenure} months tenure) exhibits higher early-stage churn propensity."
            })

        # Fallback if no specific high drivers triggered
        if not drivers:
            drivers.append({
                "factor": "Overall Profile",
                "impact": "Stable Signal",
                "severity": "LOW",
                "description": "Customer metrics align closely with low-churn baseline patterns."
            })

        return drivers
