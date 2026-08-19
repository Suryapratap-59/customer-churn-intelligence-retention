import pandas as pd
import numpy as np
import os
import joblib
from typing import Dict, Any, List, Optional, Tuple

from app.ml.data_validation import validate_dataset
from app.ml.preprocessor import ChurnPreprocessor
from app.ml.model_trainer import ModelTrainer
from app.ml.hyperparameter_tuner import HyperparameterTuner
from app.ml.explainability import ChurnExplainer
from app.ml.risk_engine import RiskEngine
from app.ml.recommendation_engine import RecommendationEngine

class PipelineManager:
    _instance: Optional["PipelineManager"] = None

    def __init__(self, data_path: str = "../customer_churn_dataset-testing-master.csv", artifacts_dir: str = "./ml_artifacts"):
        self.data_path = data_path
        self.artifacts_dir = artifacts_dir
        os.makedirs(self.artifacts_dir, exist_ok=True)

        self.dataset: Optional[pd.DataFrame] = None
        self.preprocessor: Optional[ChurnPreprocessor] = None
        self.active_model: Any = None
        self.active_model_name: str = ""
        self.model_trainer: Optional[ModelTrainer] = None
        self.explainer: Optional[ChurnExplainer] = None
        self.risk_engine: RiskEngine = RiskEngine()
        self.is_trained: bool = False

        self.evaluation_results: Dict[str, Dict[str, Any]] = {}
        self.tuning_results: Dict[str, Any] = {}
        self.data_validation_results: Dict[str, Any] = {}

    @classmethod
    def get_instance(cls, data_path: str = "../customer_churn_dataset-testing-master.csv") -> "PipelineManager":
        if cls._instance is None:
            cls._instance = cls(data_path=data_path)
            cls._instance.initialize_or_load()
        return cls._instance

    def load_dataset(self) -> pd.DataFrame:
        if not os.path.exists(self.data_path):
            # Fallback path if relative path varies
            alt_path = os.path.join(os.path.dirname(__file__), "../../../customer_churn_dataset-testing-master.csv")
            if os.path.exists(alt_path):
                self.data_path = alt_path
            else:
                raise FileNotFoundError(f"Dataset CSV not found at {self.data_path} or {alt_path}")

        self.dataset = pd.read_csv(self.data_path)
        self.data_validation_results = validate_dataset(self.dataset, is_training=True)
        return self.dataset

    def train_full_pipeline(self) -> Dict[str, Any]:
        """
        Executes end-to-end ML pipeline:
        Dataset Ingestion -> Validation -> Preprocessing -> Model Training & Evaluation -> Tuning -> Artifact Storage.
        """
        if self.dataset is None:
            self.load_dataset()

        # Preprocess dataset
        self.preprocessor = ChurnPreprocessor()
        X_transformed, y, feature_names = self.preprocessor.fit_transform(self.dataset)

        # Train & Evaluate 4 baseline models
        self.model_trainer = ModelTrainer(random_state=42)
        eval_results, best_name, X_train, X_test, y_train, y_test = self.model_trainer.train_and_evaluate_all(
            X_transformed, y
        )
        self.evaluation_results = eval_results

        # Hyperparameter Tuning on best model
        base_best_model = self.model_trainer.trained_models[best_name]
        tuner = HyperparameterTuner(random_state=42)
        tune_res = tuner.tune_model(best_name, base_best_model, X_train, y_train, X_test, y_test)

        self.active_model = tune_res["tuned_model"]
        self.active_model_name = best_name
        self.tuning_results = tune_res["tuning_results"]

        # Initialize Explainer
        self.explainer = ChurnExplainer(self.active_model, feature_names)

        # Save artifacts
        self.save_artifacts()
        self.is_trained = True

        return {
            "best_model": self.active_model_name,
            "evaluation": self.evaluation_results,
            "tuning": self.tuning_results,
            "validation": self.data_validation_results
        }

    def save_artifacts(self):
        if self.preprocessor:
            self.preprocessor.save(os.path.join(self.artifacts_dir, "preprocessor.joblib"))
        if self.active_model:
            joblib.dump(self.active_model, os.path.join(self.artifacts_dir, "active_model.joblib"))
        joblib.dump(
            {
                "active_model_name": self.active_model_name,
                "evaluation_results": self.evaluation_results,
                "tuning_results": self.tuning_results,
                "is_trained": True
            },
            os.path.join(self.artifacts_dir, "pipeline_meta.joblib")
        )

    def initialize_or_load(self):
        meta_path = os.path.join(self.artifacts_dir, "pipeline_meta.joblib")
        model_path = os.path.join(self.artifacts_dir, "active_model.joblib")
        prep_path = os.path.join(self.artifacts_dir, "preprocessor.joblib")

        try:
            if os.path.exists(self.data_path):
                self.load_dataset()

            if os.path.exists(meta_path) and os.path.exists(model_path) and os.path.exists(prep_path):
                meta = joblib.load(meta_path)
                self.active_model = joblib.load(model_path)
                self.preprocessor = ChurnPreprocessor.load(prep_path)
                self.active_model_name = meta["active_model_name"]
                self.evaluation_results = meta["evaluation_results"]
                self.tuning_results = meta["tuning_results"]
                self.is_trained = meta.get("is_trained", True)
                if self.preprocessor:
                    self.explainer = ChurnExplainer(self.active_model, self.preprocessor.feature_names)
            else:
                # Train automatically if dataset exists
                if self.dataset is not None:
                    self.train_full_pipeline()
        except Exception as e:
            print(f"[PipelineManager] Initialization warning: {e}")
            self.is_trained = False

    def predict_single(self, customer_raw: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs single customer inference pipeline.
        Returns prediction, probability, risk level, priority, drivers, and recommendations.
        """
        if not self.is_trained or self.active_model is None or self.preprocessor is None:
            raise ValueError("Model pipeline is not trained yet.")

        # Prepare DataFrame
        df_single = pd.DataFrame([customer_raw])
        X_single = self.preprocessor.transform(df_single)

        # Prediction & Probability
        pred = int(self.active_model.predict(X_single)[0])
        if hasattr(self.active_model, "predict_proba"):
            prob = float(self.active_model.predict_proba(X_single)[0, 1])
        else:
            prob = float(pred)

        prob = round(prob, 4)

        # Risk & Priority Engine
        risk_level = self.risk_engine.classify_risk(prob)
        priority_score, priority_label = self.risk_engine.calculate_priority(
            prob, float(customer_raw.get("Total Spend", 0))
        )

        # Explainability & Recommendations
        individual_drivers = self.explainer.get_individual_explanation(customer_raw, X_single)
        rec_data = RecommendationEngine.generate_recommendation(customer_raw, risk_level, priority_label)

        return {
            "customer_id": customer_raw.get("CustomerID", 0),
            "churn_prediction": pred,
            "churn_probability": prob,
            "churn_probability_pct": f"{round(prob * 100, 1)}%",
            "risk_level": risk_level,
            "priority_score": priority_score,
            "priority_label": priority_label,
            "primary_risk_driver": rec_data["primary_driver"],
            "recommended_action": rec_data["recommended_action"],
            "action_items": rec_data["action_items"],
            "risk_drivers": individual_drivers,
            "suggested_owner": rec_data["suggested_owner"],
            "model_version": self.active_model_name
        }

    def predict_batch(self, df_batch: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Executes vectorized batch scoring on uploaded CSV dataframe.
        """
        if not self.is_trained or self.active_model is None or self.preprocessor is None:
            raise ValueError("Model pipeline is not trained yet.")

        val_res = validate_dataset(df_batch, is_training=False)

        X_batch = self.preprocessor.transform(df_batch)
        preds = self.active_model.predict(X_batch)
        if hasattr(self.active_model, "predict_proba"):
            probs = self.active_model.predict_proba(X_batch)[:, 1]
        else:
            probs = preds.astype(float)

        results = []
        for idx, row in df_batch.iterrows():
            prob = round(float(probs[idx]), 4)
            pred = int(preds[idx])
            raw_dict = row.to_dict()

            risk_level = self.risk_engine.classify_risk(prob)
            p_score, p_label = self.risk_engine.calculate_priority(prob, float(raw_dict.get("Total Spend", 0)))
            rec_data = RecommendationEngine.generate_recommendation(raw_dict, risk_level, p_label)

            results.append({
                "CustomerID": raw_dict.get("CustomerID", idx + 1),
                "Churn Prediction": "Likely Churn" if pred == 1 else "Retained",
                "Churn Probability": prob,
                "Risk Level": risk_level,
                "Priority": p_label,
                "Priority Score": p_score,
                "Primary Driver": rec_data["primary_driver"],
                "Recommended Action": rec_data["recommended_action"]
            })

        df_scored = pd.DataFrame(results)
        return df_scored, val_res
