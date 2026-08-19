import numpy as np
import time
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from typing import Dict, Any, Tuple

class HyperparameterTuner:
    def __init__(self, random_state: int = 42):
        self.random_state = random_state

    def get_param_grid(self, model_name: str) -> Dict[str, Any]:
        if model_name == "Random Forest":
            return {
                "n_estimators": [100, 150],
                "max_depth": [10, 15, None],
                "min_samples_split": [2, 5]
            }
        elif model_name == "Logistic Regression":
            return {
                "C": [0.01, 0.1, 1.0, 10.0],
                "penalty": ["l2"]
            }
        elif model_name == "Support Vector Machine":
            return {
                "estimator__alpha": [1e-4, 1e-3, 1e-2]
            }
        elif model_name == "K-Nearest Neighbors":
            return {
                "n_neighbors": [3, 5, 9],
                "weights": ["uniform", "distance"]
            }
        return {}

    def tune_model(
        self, model_name: str, base_model: Any, X_train: np.ndarray, y_train: np.ndarray, X_test: np.ndarray, y_test: np.ndarray
    ) -> Dict[str, Any]:
        """
        Executes GridSearchCV on the candidate model, records best params and test metrics improvement.
        """
        param_grid = self.get_param_grid(model_name)
        if not param_grid:
            # Fallback if no params grid
            return {"tuned_model": base_model, "tuning_results": {"improvement": 0.0, "best_params": {}}}

        start_time = time.time()
        grid = GridSearchCV(
            estimator=base_model,
            param_grid=param_grid,
            cv=3,
            scoring="f1",
            n_jobs=-1
        )

        grid.fit(X_train, y_train)
        tuning_time = round(time.time() - start_time, 3)

        best_model = grid.best_estimator_

        # Baseline Test Score
        y_base_pred = base_model.predict(X_test)
        base_f1 = float(f1_score(y_test, y_base_pred, pos_label=1, zero_division=0))

        # Tuned Test Score
        y_tuned_pred = best_model.predict(X_test)
        if hasattr(best_model, "predict_proba"):
            y_tuned_prob = best_model.predict_proba(X_test)[:, 1]
        else:
            y_tuned_prob = y_tuned_pred.astype(float)

        acc = float(accuracy_score(y_test, y_tuned_pred))
        prec = float(precision_score(y_test, y_tuned_pred, pos_label=1, zero_division=0))
        rec = float(recall_score(y_test, y_tuned_pred, pos_label=1, zero_division=0))
        tuned_f1 = float(f1_score(y_test, y_tuned_pred, pos_label=1, zero_division=0))
        try:
            auc = float(roc_auc_score(y_test, y_tuned_prob))
        except Exception:
            auc = 0.5

        f1_improvement = round(tuned_f1 - base_f1, 4)

        return {
            "tuned_model": best_model,
            "tuning_results": {
                "model_name": model_name,
                "baseline_f1": round(base_f1, 4),
                "tuned_f1": round(tuned_f1, 4),
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "roc_auc": round(auc, 4),
                "f1_improvement": f1_improvement,
                "best_params": grid.best_params_,
                "best_cv_score": round(float(grid.best_score_), 4),
                "tuning_time_sec": tuning_time
            }
        }
