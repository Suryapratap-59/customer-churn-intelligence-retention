import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import joblib
import os
from typing import Tuple, List, Optional

NUMERICAL_FEATURES = [
    "Age", "Tenure", "Usage Frequency", "Support Calls", 
    "Payment Delay", "Total Spend", "Last Interaction"
]

CATEGORICAL_FEATURES = [
    "Gender", "Subscription Type", "Contract Length"
]

class ChurnPreprocessor:
    def __init__(self):
        self.column_transformer: Optional[ColumnTransformer] = None
        self.feature_names: List[str] = []
        self.is_fitted: bool = False

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, Optional[np.ndarray], List[str]]:
        """
        Fits column transformer on training dataframe and returns X_transformed, y, feature_names.
        Excludes CustomerID from feature set.
        """
        df_copy = df.copy()

        # Extract target if present
        y = None
        if "Churn" in df_copy.columns:
            y = df_copy["Churn"].values
            df_copy = df_copy.drop(columns=["Churn"])

        # Exclude CustomerID
        if "CustomerID" in df_copy.columns:
            df_copy = df_copy.drop(columns=["CustomerID"])

        self.column_transformer = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), NUMERICAL_FEATURES),
                ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), CATEGORICAL_FEATURES)
            ],
            remainder="drop"
        )

        X_transformed = self.column_transformer.fit_transform(df_copy)

        # Reconstruct transformed feature names for explainability
        cat_encoder = self.column_transformer.named_transformers_["cat"]
        cat_feature_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
        self.feature_names = NUMERICAL_FEATURES + cat_feature_names
        self.is_fitted = True

        return X_transformed, y, self.feature_names

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """
        Transforms unseen inference dataset using fitted transformer.
        Excludes CustomerID and Churn if present.
        """
        if not self.is_fitted or self.column_transformer is None:
            raise ValueError("Preprocessor has not been fitted yet.")

        df_copy = df.copy()
        if "Churn" in df_copy.columns:
            df_copy = df_copy.drop(columns=["Churn"])
        if "CustomerID" in df_copy.columns:
            df_copy = df_copy.drop(columns=["CustomerID"])

        return self.column_transformer.transform(df_copy)

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self, filepath)

    @classmethod
    def load(cls, filepath: str) -> "ChurnPreprocessor":
        return joblib.load(filepath)
