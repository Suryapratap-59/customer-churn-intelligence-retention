import os
from dataclasses import dataclass

@dataclass
class Settings:
    PROJECT_NAME: str = "Customer Churn Intelligence & Retention Platform"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./churn_platform.db")
    
    # Dataset Config
    DATASET_PATH: str = os.getenv("DATASET_PATH", "../customer_churn_dataset-testing-master.csv")
    
    # Risk Thresholds (Configurable)
    LOW_RISK_THRESHOLD: float = 0.35
    HIGH_RISK_THRESHOLD: float = 0.70
    
    # Model Artifacts Directory
    MODEL_DIR: str = "./ml_artifacts"

settings = Settings()
