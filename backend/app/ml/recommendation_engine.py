from typing import Dict, Any, List

class RecommendationEngine:
    @staticmethod
    def generate_recommendation(
        customer_raw: Dict[str, Any], risk_level: str, priority_label: str
    ) -> Dict[str, Any]:
        """
        Generates decision-support retention actions based on customer attributes and risk drivers.
        """
        payment_delay = customer_raw.get("Payment Delay", 0)
        support_calls = customer_raw.get("Support Calls", 0)
        usage_frequency = customer_raw.get("Usage Frequency", 0)
        contract_length = customer_raw.get("Contract Length", "")
        total_spend = customer_raw.get("Total Spend", 0)

        actions = []
        primary_driver = "General Behavioral Risk"

        if payment_delay >= 10:
            primary_driver = "High Payment Delay"
            actions.append(
                "Contact customer to resolve payment difficulties and offer flexible billing or structured payment-support options."
            )

        if support_calls >= 5:
            if primary_driver == "General Behavioral Risk":
                primary_driver = "Frequent Support Calls"
            actions.append(
                "Escalate unresolved ticket history to senior support management and assign a dedicated technical contact."
            )

        if usage_frequency <= 10:
            if primary_driver == "General Behavioral Risk":
                primary_driver = "Low Usage Frequency"
            actions.append(
                "Launch personalized product re-engagement campaign, offering tailored onboarding refreshers and feature walkthroughs."
            )

        if contract_length == "Monthly":
            if primary_driver == "General Behavioral Risk":
                primary_driver = "Low Commitment Contract"
            actions.append(
                "Evaluate suitability for contract migration and present a discounted annual or quarterly plan offer."
            )

        if priority_label == "CRITICAL" or (risk_level == "HIGH" and total_spend >= 600):
            primary_driver = "High-Value Account at Risk"
            actions.insert(0, "CRITICAL: Initiate immediate executive-level proactive outreach within 24 hours.")

        if not actions:
            primary_driver = "Low Risk Profile"
            actions.append("Maintain standard nurture communications and monitor ongoing account health.")

        recommended_action_text = " ".join(actions)

        return {
            "primary_driver": primary_driver,
            "recommended_action": recommended_action_text,
            "action_items": actions,
            "suggested_owner": "Customer Success Manager" if priority_label in ["CRITICAL", "HIGH"] else "Support Operations",
            "priority": priority_label
        }
