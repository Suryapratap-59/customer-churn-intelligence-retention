import pandas as pd
import numpy as np
from typing import Dict, Any, List

EXPECTED_COLUMNS = [
    "CustomerID", "Age", "Gender", "Tenure", "Usage Frequency", 
    "Support Calls", "Payment Delay", "Subscription Type", 
    "Contract Length", "Total Spend", "Last Interaction", "Churn"
]

VALID_CATEGORIES = {
    "Gender": ["Female", "Male"],
    "Subscription Type": ["Basic", "Standard", "Premium"],
    "Contract Length": ["Monthly", "Quarterly", "Annual"]
}

NUMERICAL_RANGES = {
    "Age": (18, 100),
    "Tenure": (0, 120),
    "Usage Frequency": (0, 100),
    "Support Calls": (0, 50),
    "Payment Delay": (0, 90),
    "Total Spend": (0, 100000),
    "Last Interaction": (0, 365)
}

def validate_dataset(df: pd.DataFrame, is_training: bool = True) -> Dict[str, Any]:
    """
    Validates dataset quality, checking columns, types, missing values,
    duplicates, ranges, and target distribution.
    """
    issues = []
    warnings = []
    summary = {}

    summary["total_rows"] = len(df)
    summary["total_columns"] = len(df.columns)
    summary["column_names"] = list(df.columns)

    # 1. Required & Missing Columns
    target_cols = EXPECTED_COLUMNS if is_training else [c for c in EXPECTED_COLUMNS if c != "Churn"]
    missing_cols = [col for col in target_cols if col not in df.columns]
    if missing_cols:
        issues.append(f"Missing required columns: {missing_cols}")

    # 2. Missing Values
    missing_counts = df.isnull().sum().to_dict()
    total_missing = sum(missing_counts.values())
    summary["missing_values"] = missing_counts
    if total_missing > 0:
        warnings.append(f"Found {total_missing} missing value(s) across dataset.")

    # 3. Duplicate Rows
    exact_duplicates = int(df.duplicated().sum())
    summary["exact_duplicate_rows"] = exact_duplicates
    if exact_duplicates > 0:
        warnings.append(f"Found {exact_duplicates} exact duplicate row(s).")

    # 4. Duplicate CustomerIDs
    if "CustomerID" in df.columns:
        duplicate_ids = int(df["CustomerID"].duplicated().sum())
        summary["duplicate_customer_ids"] = duplicate_ids
        if duplicate_ids > 0:
            warnings.append(f"Found {duplicate_ids} duplicate CustomerID(s).")

    # 5. Invalid Categorical Values
    categorical_checks = {}
    for cat_col, valid_vals in VALID_CATEGORIES.items():
        if cat_col in df.columns:
            invalid = set(df[cat_col].dropna().unique()) - set(valid_vals)
            categorical_checks[cat_col] = {
                "unique_values": list(df[cat_col].unique()),
                "invalid_values": list(invalid)
            }
            if invalid:
                issues.append(f"Invalid values in '{cat_col}': {list(invalid)}")
    summary["categorical_checks"] = categorical_checks

    # 6. Numerical Range Checks
    numerical_outliers = {}
    for num_col, (min_val, max_val) in NUMERICAL_RANGES.items():
        if num_col in df.columns and pd.api.types.is_numeric_dtype(df[num_col]):
            out_of_bounds = int(((df[num_col] < min_val) | (df[num_col] > max_val)).sum())
            numerical_outliers[num_col] = out_of_bounds
            if out_of_bounds > 0:
                warnings.append(f"'{num_col}' has {out_of_bounds} values outside range [{min_val}, {max_val}].")
    summary["numerical_outliers"] = numerical_outliers

    # 7. Target Distribution & Class Imbalance (Training mode)
    if is_training and "Churn" in df.columns:
        counts = df["Churn"].value_counts().to_dict()
        total = len(df["Churn"].dropna())
        proportions = {str(k): round(v / total, 4) for k, v in counts.items()}
        summary["target_distribution"] = {
            "counts": {str(k): int(v) for k, v in counts.items()},
            "proportions": proportions
        }
        # Check imbalance (< 20% or > 80%)
        minority_prop = min(proportions.values()) if proportions else 0
        if minority_prop < 0.20:
            warnings.append(f"Class imbalance detected: minority class ratio is {minority_prop:.2%}.")
        summary["class_imbalance"] = minority_prop < 0.20

    is_valid = len(issues) == 0
    return {
        "is_valid": is_valid,
        "issues": issues,
        "warnings": warnings,
        "summary": summary
    }
