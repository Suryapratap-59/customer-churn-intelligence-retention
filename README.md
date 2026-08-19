# Customer Churn Intelligence & Retention Platform

> **Predict churn. Understand why. Retain customers.**
> 
> *Core Engine Flow: Predict → Explain → Prioritize → Act → Learn*

The **Customer Churn Intelligence & Retention Platform** is an enterprise-grade, machine-learning-powered decision-support SaaS application. It helps businesses transform raw customer behavioral metrics into actionable retention strategies, identifying high-risk accounts early, explaining underlying risk drivers, prioritizing interventions by business value, and recommending targeted human retention actions.

---

## Key Features

1. **Executive Intelligence Dashboard**: Real-time KPI telemetry (Total Customers, Overall Churn Rate, High-Risk Accounts, Retained Customers), global churn driver ranking, risk tier distribution, contract/subscription analytics, and immediate attention account queues.
2. **Customer Risk Queue**: Prioritized operational table with quick filters (*All, High Risk, Medium Risk, Low Risk, High Value + High Risk*), search by Customer ID, column sorting, pagination, and one-click CSV export.
3. **Customer Intelligence Profiles**: Deep-dive account view featuring raw demographics, behavioral metrics, churn probability gauge, individual risk driver attributions, decision-support retention actions, and an intervention outcome recording workflow.
4. **Interactive Predictor Engine**: Live single-customer evaluator translating input parameters into calibrated probabilities, risk tiers, and tailored action plans in sub-second latency.
5. **Machine Learning Pipeline Hub**: Comparative benchmarking across 4 baseline classifiers (**Logistic Regression**, **Random Forest**, **Support Vector Machine**, **K-Nearest Neighbors**), 80/20 stratified test evaluation, Confusion Matrix visualization, and **GridSearchCV** hyperparameter tuning.
6. **Dual-Layer Explainability**: Global feature importance ranking (Gini reduction / coefficient weights) paired with individual customer attribution breakdown.
7. **Bulk CSV Batch Scoring Workbench**: Drag-and-drop CSV batch upload supporting vectorized scoring and downloadable scored CSV results.
8. **Data Quality & Ingestion Audit**: Real-time schema validation layer checking missing values, duplicate rows, CustomerID anomalies, range bounds, and class distribution.
9. **Model Management Registry**: Production model status, version history log, and manual/automated retraining triggers.
10. **Configurable Risk Engine**: Dynamic risk probability thresholds (*Low < 0.35, High >= 0.70*) and historical retention intervention audit log.

---

## Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts.
* **Backend**: Python 3.14, FastAPI, SQLAlchemy ORM, Pydantic v2.
* **Machine Learning**: Scikit-Learn, Pandas, NumPy, Joblib, Calibration Tools.
* **Database**: SQLite (Local Dev) / PostgreSQL ready.

---

## Directory Structure

```
Customer Churn Intelligence & Retention Platform/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI Router & REST Endpoints
│   │   ├── core/         # Settings & Configuration
│   │   ├── db/           # SQLAlchemy Engine & ORM Models
│   │   ├── ml/           # Data Validation, Preprocessing, ML Trainer, Risk & Recommendation Engines
│   │   ├── schemas/      # Pydantic Input Validation
│   │   └── main.py       # Application Server Entrypoint
│   ├── tests/            # Pytest Suite
│   └── ml_artifacts/     # Serialized Models & Preprocessor
├── frontend/
│   ├── src/
│   │   ├── components/   # Sidebar, Header, KPICard, RiskBadge
│   │   ├── pages/        # 11 Enterprise SaaS Views
│   │   ├── services/     # API Client Layer
│   │   ├── types/        # TypeScript Interfaces
│   │   └── App.tsx       # Router & Page Container
│   └── vite.config.ts
├── customer_churn_dataset-testing-master.csv
├── README.md
├── ARCHITECTURE.md
└── ML_MODEL_CARD.md
```

---

## Quickstart & Installation Instructions

### 1. Prerequisites
* Python 3.10+
* Node.js v18+ & NPM

### 2. Backend Setup
```bash
cd backend
pip install fastapi uvicorn pandas numpy scikit-learn sqlalchemy pydantic joblib pytest
python -m uvicorn app.main:app --reload --port 8000
```
* API Documentation: `http://localhost:8000/docs`
* Health Check: `http://localhost:8000/api/v1/health`

### 3. Frontend Setup
```bash
cd frontend
npm install
node node_modules/vite/bin/vite.js --port 3000
```
* Access Web Application at `http://localhost:3000`

### 4. Running Tests
```bash
cd backend
python -m pytest tests/
```

---

## ML Methodology & Safety Limitations

* **Target Leakage Prevention**: `CustomerID` has a pseudo-correlation of `+0.53` due to raw file row ordering. The preprocessing pipeline strictly drops `CustomerID` from features and applies stratified 80/20 random splitting (`random_state=42`).
* **Model Selection**: Models are ranked using a composite score emphasizing Churn-class Recall (40%) and F1-score (30%) to prevent costly false negatives.
* **Decision Support**: Predictions are probabilities and estimates, not absolute guarantees. All retention actions remain subject to human review.
