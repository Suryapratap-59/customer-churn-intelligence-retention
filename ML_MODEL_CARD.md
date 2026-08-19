# Model Card: Customer Churn Prediction Engine

## Model Details

* **Model Developer**: Platform ML Engineering Team
* **Model Date**: August 2026
* **Model Version**: 2.0.0 (Random Forest / Tuned Ensemble)
* **Model Type**: Supervised Binary Classification (`Scikit-Learn RandomForestClassifier` / `CalibratedClassifierCV`)

---

## Intended Use

* **Primary Use Case**: Enterprise customer retention decision-support tool.
* **Target Users**: Retention Managers, Customer Success Operations, Customer Support Managers, Business Intelligence Analysts.
* **Out-of-Scope Uses**: Automated financial account suspension, automatic contract termination, or non-human automated credit scoring without human oversight.

---

## Training Data

* **Dataset Size**: 64,374 customer records (51,499 training split / 12,875 test split).
* **Target Distribution**: ~52.6% Retained ($y=0$), ~47.4% Churned ($y=1$).
* **Features Included**: Age, Gender, Tenure, Usage Frequency, Support Calls, Payment Delay, Subscription Type, Contract Length, Total Spend, Last Interaction.
* **Features Excluded**: `CustomerID` (Excluded to prevent artificial row-ordering leakage).

---

## Performance Metrics (Unseen Test Set)

* **Accuracy**: ~84.2%
* **Precision (Churn Class)**: ~81.5%
* **Recall (Churn Class)**: ~86.1%
* **F1-Score**: ~83.7%
* **ROC-AUC**: ~0.912

---

## Risk Considerations & Limitations

1. **Probability Interpretation**: Churn probabilities reflect empirical likelihood based on historical behavioral patterns. They are decision-support estimates, not absolute guarantees.
2. **Dataset-Specific Observations**: Payment delay and support call frequency demonstrate the highest predictive weight in this dataset. Rules should be periodically re-evaluated as business dynamics change.
