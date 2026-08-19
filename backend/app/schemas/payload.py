from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CustomerInputSchema(BaseModel):
    CustomerID: Optional[int] = Field(default=99999, description="Customer Identifier")
    Age: int = Field(..., ge=18, le=100, example=42)
    Gender: str = Field(..., example="Female")
    Tenure: int = Field(..., ge=0, le=120, example=24)
    Usage_Frequency: int = Field(alias="Usage Frequency", default=15, ge=0, le=100, example=12)
    Support_Calls: int = Field(alias="Support Calls", default=3, ge=0, le=50, example=6)
    Payment_Delay: int = Field(alias="Payment Delay", default=5, ge=0, le=90, example=18)
    Subscription_Type: str = Field(alias="Subscription Type", default="Standard", example="Standard")
    Contract_Length: str = Field(alias="Contract Length", default="Monthly", example="Monthly")
    Total_Spend: float = Field(alias="Total Spend", default=500.0, ge=0, example=650.0)
    Last_Interaction: int = Field(alias="Last Interaction", default=15, ge=0, le=365, example=22)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "CustomerID": 10293,
                "Age": 45,
                "Gender": "Female",
                "Tenure": 12,
                "Usage Frequency": 6,
                "Support Calls": 8,
                "Payment Delay": 22,
                "Subscription Type": "Standard",
                "Contract Length": "Monthly",
                "Total Spend": 720.0,
                "Last Interaction": 25
            }
        }

class RiskThresholdsSchema(BaseModel):
    low_risk_threshold: float = Field(default=0.35, ge=0.05, le=0.50)
    high_risk_threshold: float = Field(default=0.70, ge=0.51, le=0.95)

class RetentionOutcomeCreate(BaseModel):
    customer_id: int
    risk_level: str
    action_taken: str
    owner: str = "Customer Success"
    outcome: str # Retained, Churned, Pending, No Response
    notes: Optional[str] = ""
