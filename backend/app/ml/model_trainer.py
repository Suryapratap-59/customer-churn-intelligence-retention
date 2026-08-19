import numpy as np
import pandas as pd
import time
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    roc_auc_score, confusion_matrix
)
from typing import Dict, Any, Tuple, List

class ModelTrainer:
    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.trained_models: Dict[str, Any] = {}
        self.evaluation_results: Dict[str, Dict[str, Any]] = {}
        self.best_model_name: str = ""

    def get_baseline_models(self) -> Dict[str, Any]:
        """
        Initializes the 4 baseline classifiers requested by PRD.
        Uses SGD log-loss / Calibrated linear estimator for scalable SVM on 50k+ rows.
        """
        return {
            "Logistic Regression": LogisticRegression(
                max_iter=1000, 
                random_state=self.random_state, 
                solver="lbfgs"
            ),
            "Random Forest": RandomForestClassifier(
                n_estimators=100, 
                max_depth=12,
                random_state=self.random_state, 
                n_jobs=-1
            ),
            "Support Vector Machine": CalibratedClassifierCV(
                estimator=SGDClassifier(
                    loss="log_loss", 
                    penalty="l2", 
                    random_state=self.random_state,
                    max_iter=1000
                ),
                cv=3
            ),
            "K-Nearest Neighbors": KNeighborsClassifier(
                n_neighbors=5, 
                weights="uniform", 
                n_jobs=-1
            )
        }

    def train_and_evaluate_all(
        self, X: np.ndarray, y: np.ndarray
    ) -> Tuple[Dict[str, Dict[str, Any]], str, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Performs 80/20 stratified split, fits 4 baseline models, computes metrics, and selects best model.
        Returns evaluation dict, best model name, X_train, X_test, y_train, y_test.
        """
        # Stratified 80/20 Train-Test Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=self.random_state, stratify=y
        )

        models = self.get_baseline_models()
        self.evaluation_results = {}
        self.trained_models = {}

        best_score = -1.0
        best_name = ""

        for name, model in models.items():
            start_time = time.time()
            model.fit(X_train, y_train)
            train_time = round(time.time() - start_time, 3)

            y_pred = model.predict(X_test)
            if hasattr(model, "predict_proba"):
                y_prob = model.predict_proba(X_test)[:, 1]
            else:
                y_prob = y_pred.astype(float)

            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, pos_label=1, zero_division=0))
            rec = float(recall_score(y_test, y_pred, pos_label=1, zero_division=0))
            f1 = float(f1_score(y_test, y_pred, pos_label=1, zero_division=0))
            try:
                auc = float(roc_auc_score(y_test, y_prob))
            except Exception:
                auc = 0.5

            cm = confusion_matrix(y_test, y_pred).tolist()

            # Selection Composite Score emphasizing Churn Recall (40%) and F1 (30%)
            composite_score = (rec * 0.40) + (f1 * 0.30) + (prec * 0.15) + (acc * 0.15)

            self.trained_models[name] = model
            self.evaluation_results[name] = {
                "model_name": name,
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "roc_auc": round(auc, 4),
                "confusion_matrix": cm, # [[TN, FP], [FN, TP]]
                "training_time_sec": train_time,
                "composite_score": round(composite_score, 4)
            }

            if composite_score > best_score:
                best_score = composite_score
                best_name = name

        self.best_model_name = best_name
        return self.evaluation_results, self.best_model_name, X_train, X_test, y_train, y_test
