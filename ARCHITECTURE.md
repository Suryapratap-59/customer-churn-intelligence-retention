# System Architecture Documentation

## Overview

The **Customer Churn Intelligence & Retention Platform** adopts a decoupled 3-tier architecture separating presentation, REST API orchestration, and ML pipeline engines.

```
┌─────────────────────────────────────────────────────────┐
│              React 19 + TypeScript Frontend             │
│   (Sidebar, Executive Dashboard, Risk Queue, Profiles)  │
└────────────────────────────┬────────────────────────────┘
                             │  HTTP / REST API (JSON)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Server                       │
│    ├── API Router (/api/v1)                             │
│    ├── Data Validation & Ingestion                      │
│    └── DB Session Manager (SQLAlchemy)                  │
└────────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌────────────────────────┐       ┌────────────────────────┐
│   ML Pipeline Engine   │       │   SQLite / Postgres    │
│ ├── DataPreprocessor   │       │ ├── customers          │
│ ├── ModelTrainer       │       │ ├── predictions        │
│ ├── HyperparameterTuner│       │ ├── model_versions     │
│ ├── RiskEngine         │       │ └── retention_outcomes │
│ └── RecommendEngine    │       └────────────────────────┘
└────────────────────────┘
```

---

## Preprocessing & Pipeline Specification

1. **Feature Separation**:
   * Predictors ($X$): `Age`, `Tenure`, `Usage Frequency`, `Support Calls`, `Payment Delay`, `Total Spend`, `Last Interaction`, `Gender`, `Subscription Type`, `Contract Length`.
   * Identifier (Excluded): `CustomerID`.
   * Target ($y$): `Churn` ($0 = \text{Retained}, 1 = \text{Churned}$).

2. **Transformers**:
   * Numerical: `StandardScaler()` applied to continuous/discrete integer signals.
   * Categorical: `OneHotEncoder(drop='first', sparse_output=False)` applied to `Gender`, `Subscription Type`, `Contract Length`.

3. **Risk & Priority Formula**:
   $$\text{Priority Score} = P(\text{Churn}) \times \min\left(\max\left(\frac{\text{Total Spend}}{1000}, 0.1\right), 1.5\right) \times W_{\text{risk}}$$
   Where $W_{\text{risk}} = 1.5$ for High Risk, $1.1$ for Medium Risk, $0.8$ for Low Risk.
