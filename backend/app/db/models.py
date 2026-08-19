from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text, JSON
from datetime import datetime
from app.db.database import Base

class CustomerRecord(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, unique=True, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    tenure = Column(Integer, nullable=False)
    usage_frequency = Column(Integer, nullable=False)
    support_calls = Column(Integer, nullable=False)
    payment_delay = Column(Integer, nullable=False)
    subscription_type = Column(String, nullable=False)
    contract_length = Column(String, nullable=False)
    total_spend = Column(Float, nullable=False)
    last_interaction = Column(Integer, nullable=False)
    churn = Column(Integer, nullable=True) # Target: 0 or 1, null for unscored new customers
    created_at = Column(DateTime, default=datetime.utcnow)

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, index=True, nullable=False)
    churn_prediction = Column(Integer, nullable=False) # 0 or 1
    churn_probability = Column(Float, nullable=False) # 0.0 to 1.0
    risk_level = Column(String, nullable=False) # LOW, MEDIUM, HIGH
    priority_label = Column(String, nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    priority_score = Column(Float, nullable=False)
    primary_risk_driver = Column(String, nullable=False)
    recommended_action = Column(Text, nullable=False)
    model_version = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ModelVersionRecord(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    model_name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    roc_auc = Column(Float, nullable=False)
    hyperparameters = Column(JSON, nullable=True)
    training_time_sec = Column(Float, nullable=True)
    is_active = Column(Boolean, default=False)
    trained_at = Column(DateTime, default=datetime.utcnow)

class RetentionOutcomeRecord(Base):
    __tablename__ = "retention_outcomes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, index=True, nullable=False)
    risk_level_at_intervention = Column(String, nullable=False)
    action_taken = Column(Text, nullable=False)
    owner = Column(String, default="Customer Success")
    outcome = Column(String, nullable=False) # Retained, Churned, Pending, No Response
    retained = Column(Boolean, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemSettingsRecord(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, default=1)
    low_risk_threshold = Column(Float, default=0.35)
    high_risk_threshold = Column(Float, default=0.70)
    active_model_name = Column(String, default="Random Forest")
    updated_at = Column(DateTime, default=datetime.utcnow)
