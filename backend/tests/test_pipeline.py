import pytest
import pandas as pd
import numpy as np
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ml.data_validation import validate_dataset
from app.ml.preprocessor import ChurnPreprocessor
from app.ml.risk_engine import RiskEngine
from app.ml.recommendation_engine import RecommendationEngine
from app.ml.pipeline_manager import PipelineManager

@pytest.fixture
def sample_raw_customer():
    return {
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

def test_data_validation_missing_columns():
    df_invalid = pd.DataFrame([{"Age": 30, "Gender": "Male"}])
    res = validate_dataset(df_invalid, is_training=True)
    assert not res["is_valid"]
    assert len(res["issues"]) > 0

def test_data_validation_valid():
    df_valid = pd.DataFrame([{
        "CustomerID": 1, "Age": 22, "Gender": "Female", "Tenure": 9,
        "Usage Frequency": 12, "Support Calls": 2, "Payment Delay": 0,
        "Subscription Type": "Basic", "Contract Length": "Annual",
        "Total Spend": 500, "Last Interaction": 5, "Churn": 0
    }])
    res = validate_dataset(df_valid, is_training=True)
    assert res["is_valid"]

def test_preprocessor_excludes_customer_id(sample_raw_customer):
    df = pd.DataFrame([sample_raw_customer])
    df["Churn"] = 1
    prep = ChurnPreprocessor()
    X, y, feature_names = prep.fit_transform(df)
    
    assert "CustomerID" not in feature_names
    assert "Churn" not in feature_names
    assert X.shape[0] == 1
    assert y[0] == 1

def test_risk_engine():
    engine = RiskEngine(low_threshold=0.35, high_threshold=0.70)
    assert engine.classify_risk(0.20) == "LOW"
    assert engine.classify_risk(0.50) == "MEDIUM"
    assert engine.classify_risk(0.85) == "HIGH"
    
    score, label = engine.calculate_priority(0.85, 750.0)
    assert label == "CRITICAL"

def test_recommendation_engine(sample_raw_customer):
    rec = RecommendationEngine.generate_recommendation(sample_raw_customer, "HIGH", "CRITICAL")
    assert "payment" in rec["recommended_action"].lower() or "support" in rec["recommended_action"].lower()
    assert rec["priority"] == "CRITICAL"

def test_pipeline_single_prediction(sample_raw_customer):
    pm = PipelineManager.get_instance("../customer_churn_dataset-testing-master.csv")
    res = pm.predict_single(sample_raw_customer)
    
    assert "churn_prediction" in res
    assert 0.0 <= res["churn_probability"] <= 1.0
    assert res["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert res["priority_label"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    assert "recommended_action" in res
    assert len(res["risk_drivers"]) > 0
