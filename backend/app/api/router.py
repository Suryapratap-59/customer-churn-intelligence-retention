from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
import pandas as pd
import io
from typing import Dict, Any, List, Optional

from app.db.database import get_db, engine, Base
from app.db import models
from app.ml.pipeline_manager import PipelineManager
from app.schemas.payload import CustomerInputSchema, RiskThresholdsSchema, RetentionOutcomeCreate

# Ensure DB tables are created
Base.metadata.create_all(bind=engine)

router = APIRouter()

def get_pipeline():
    return PipelineManager.get_instance()

@router.get("/health")
def health_check():
    pm = get_pipeline()
    return {
        "status": "healthy",
        "model_trained": pm.is_trained,
        "active_model": pm.active_model_name,
        "dataset_loaded": pm.dataset is not None
    }

@router.get("/dashboard/summary")
def get_dashboard_summary(pm: PipelineManager = Depends(get_pipeline)):
    """
    Returns Executive Dashboard KPIs and high-level charts.
    """
    if pm.dataset is None:
        raise HTTPException(status_code=400, detail="Dataset not loaded.")

    df = pm.dataset
    total_customers = len(df)
    churned_count = int((df["Churn"] == 1).sum()) if "Churn" in df.columns else 0
    retained_count = total_customers - churned_count
    churn_rate = round((churned_count / total_customers) * 100, 2) if total_customers > 0 else 0.0

    # Risk Distribution estimate on dataset sample if needed
    high_risk_est = int((df["Payment Delay"] >= 15).sum())
    med_risk_est = int(((df["Payment Delay"] >= 5) & (df["Payment Delay"] < 15)).sum())
    low_risk_est = max(0, total_customers - high_risk_est - med_risk_est)

    # Churn Drivers (Global Importance)
    global_importance = pm.explainer.get_global_importance() if pm.explainer else []

    # Breakdown by Contract Length
    contract_churn = []
    if "Contract Length" in df.columns:
        for c_type, group in df.groupby("Contract Length"):
            total_g = len(group)
            churn_g = int((group["Churn"] == 1).sum())
            contract_churn.append({
                "contract": c_type,
                "total": total_g,
                "churned": churn_g,
                "churn_rate": round((churn_g / total_g) * 100, 1)
            })

    # Breakdown by Subscription Type
    sub_churn = []
    if "Subscription Type" in df.columns:
        for s_type, group in df.groupby("Subscription Type"):
            total_g = len(group)
            churn_g = int((group["Churn"] == 1).sum())
            sub_churn.append({
                "subscription": s_type,
                "total": total_g,
                "churned": churn_g,
                "churn_rate": round((churn_g / total_g) * 100, 1)
            })

    # Top Immediate Attention Required (High-Risk sample)
    sample_high_risk = []
    high_risk_rows = df[df["Payment Delay"] >= 15].head(5)
    for _, row in high_risk_rows.iterrows():
        raw_dict = row.to_dict()
        try:
            pred_res = pm.predict_single(raw_dict)
            sample_high_risk.append(pred_res)
        except Exception:
            pass

    return {
        "kpis": {
            "total_customers": total_customers,
            "churned_customers": churned_count,
            "retained_customers": retained_count,
            "churn_rate_pct": churn_rate,
            "high_risk_count": high_risk_est,
            "medium_risk_count": med_risk_est,
            "low_risk_count": low_risk_est
        },
        "risk_distribution": [
            {"name": "Low Risk", "value": low_risk_est, "color": "#10B981"},
            {"name": "Medium Risk", "value": med_risk_est, "color": "#F59E0B"},
            {"name": "High Risk", "value": high_risk_est, "color": "#EF4444"}
        ],
        "churn_drivers": global_importance[:6],
        "churn_by_contract": contract_churn,
        "churn_by_subscription": sub_churn,
        "immediate_attention": sample_high_risk
    }

@router.get("/customers")
def get_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    risk_filter: Optional[str] = None,
    contract_filter: Optional[str] = None,
    search: Optional[str] = None,
    high_value_high_risk: bool = False,
    pm: PipelineManager = Depends(get_pipeline)
):
    """
    Returns paginated customer risk queue with filtering and sorting.
    """
    if pm.dataset is None:
        raise HTTPException(status_code=400, detail="Dataset not loaded.")

    df = pm.dataset
    if search:
        try:
            search_id = int(search)
            df = df[df["CustomerID"] == search_id]
        except ValueError:
            pass

    if contract_filter and contract_filter != "All":
        df = df[df["Contract Length"] == contract_filter]

    # Pre-score / sample score for queue pagination
    offset = (page - 1) * limit
    page_df = df.iloc[offset:offset + limit]

    scored_list = []
    for idx, row in page_df.iterrows():
        raw_dict = row.to_dict()
        try:
            res = pm.predict_single(raw_dict)
            scored_list.append(res)
        except Exception:
            pass

    if risk_filter and risk_filter != "All":
        scored_list = [c for c in scored_list if c["risk_level"] == risk_filter]

    if high_value_high_risk:
        scored_list = [c for c in scored_list if c["priority_label"] == "CRITICAL" or (c["risk_level"] == "HIGH" and c.get("Total Spend", 0) >= 500)]

    # Default sort by churn probability descending
    scored_list.sort(key=lambda x: x["churn_probability"], reverse=True)

    return {
        "total_count": len(df),
        "page": page,
        "limit": limit,
        "customers": scored_list
    }

@router.get("/customers/{customer_id}")
def get_customer_by_id(customer_id: int, pm: PipelineManager = Depends(get_pipeline)):
    """
    Deep-dive profile for a specific customer.
    """
    if pm.dataset is None:
        raise HTTPException(status_code=400, detail="Dataset not loaded.")

    df = pm.dataset
    cust_rows = df[df["CustomerID"] == customer_id]
    if len(cust_rows) == 0:
        raise HTTPException(status_code=404, detail=f"Customer ID {customer_id} not found.")

    raw_dict = cust_rows.iloc[0].to_dict()
    prediction = pm.predict_single(raw_dict)

    return {
        "raw_attributes": raw_dict,
        "intelligence": prediction
    }

@router.post("/predict")
def predict_single_customer(payload: CustomerInputSchema, pm: PipelineManager = Depends(get_pipeline)):
    """
    Single customer interactive prediction endpoint.
    """
    try:
        raw_dict = payload.model_dump(by_alias=True)
        res = pm.predict_single(raw_dict)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-predict")
async def batch_predict_csv(file: UploadFile = File(...), pm: PipelineManager = Depends(get_pipeline)):
    """
    CSV Batch Scoring endpoint.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV format.")

    content = await file.read()
    df_upload = pd.read_csv(io.BytesIO(content))

    scored_df, validation_summary = pm.predict_batch(df_upload)

    return {
        "total_rows": len(scored_df),
        "validation_summary": validation_summary,
        "scored_preview": scored_df.head(50).to_dict(orient="records")
    }

@router.get("/analytics/churn")
def get_churn_analytics(pm: PipelineManager = Depends(get_pipeline)):
    """
    Detailed analytics plots comparing features vs churn.
    """
    if pm.dataset is None:
        raise HTTPException(status_code=400, detail="Dataset not loaded.")

    df = pm.dataset

    # Payment Delay vs Churn
    payment_churn = df.groupby(["Payment Delay", "Churn"]).size().unstack(fill_value=0).reset_index().to_dict(orient="records")

    # Support Calls vs Churn
    support_churn = df.groupby(["Support Calls", "Churn"]).size().unstack(fill_value=0).reset_index().to_dict(orient="records")

    # Usage Frequency vs Churn
    usage_churn = df.groupby(["Usage Frequency", "Churn"]).size().unstack(fill_value=0).reset_index().to_dict(orient="records")

    # Contract Length vs Churn
    contract_churn = df.groupby(["Contract Length", "Churn"]).size().unstack(fill_value=0).reset_index().to_dict(orient="records")

    return {
        "payment_delay_vs_churn": payment_churn,
        "support_calls_vs_churn": support_churn,
        "usage_frequency_vs_churn": usage_churn,
        "contract_length_vs_churn": contract_churn
    }

@router.get("/model/performance")
def get_model_performance(pm: PipelineManager = Depends(get_pipeline)):
    """
    Returns 4 baseline models comparison matrix, ROC curves data, and hyperparameter tuning results.
    """
    return {
        "active_model": pm.active_model_name,
        "evaluation_matrix": pm.evaluation_results,
        "hyperparameter_tuning": pm.tuning_results,
        "selection_rationale": "The active model was selected by composite weighting prioritizing Churn-class Recall (40%) and F1-score (30%) to minimize costly false negatives."
    }

@router.get("/model/explainability")
def get_explainability(pm: PipelineManager = Depends(get_pipeline)):
    """
    Global feature importance & explainability.
    """
    if pm.explainer is None:
        raise HTTPException(status_code=400, detail="Explainability engine not ready.")

    return {
        "global_importance": pm.explainer.get_global_importance(),
        "methodology": "Model-based feature attribution (Tree Gini Reduction / Scaled Coefficients) normalized to percentage influence."
    }

@router.post("/model/train")
@router.post("/model/retrain")
def retrain_model(pm: PipelineManager = Depends(get_pipeline)):
    """
    Triggers full ML training pipeline.
    """
    try:
        res = pm.train_full_pipeline()
        return {
            "status": "success",
            "message": f"Successfully retrained models. Selected best model: {res['best_model']}",
            "details": res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.get("/data-quality")
def get_data_quality(pm: PipelineManager = Depends(get_pipeline)):
    """
    Data quality audit dashboard endpoint.
    """
    if pm.dataset is None:
        raise HTTPException(status_code=400, detail="Dataset not loaded.")

    return pm.data_validation_results

@router.post("/retention/outcome")
def record_retention_outcome(
    outcome: RetentionOutcomeCreate, db: Session = Depends(get_db)
):
    """
    Records human intervention outcome for feedback tracking.
    """
    rec = models.RetentionOutcomeRecord(
        customer_id=outcome.customer_id,
        risk_level_at_intervention=outcome.risk_level,
        action_taken=outcome.action_taken,
        owner=outcome.owner,
        outcome=outcome.outcome,
        retained=(outcome.outcome == "Retained"),
        notes=outcome.notes
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    return {"status": "success", "recorded_outcome_id": rec.id}

@router.get("/retention/outcomes")
def list_retention_outcomes(db: Session = Depends(get_db)):
    outcomes = db.query(models.RetentionOutcomeRecord).order_by(models.RetentionOutcomeRecord.id.desc()).all()
    return outcomes

@router.get("/settings")
def get_settings(pm: PipelineManager = Depends(get_pipeline)):
    return {
        "low_risk_threshold": pm.risk_engine.low_threshold,
        "high_risk_threshold": pm.risk_engine.high_threshold,
        "active_model_name": pm.active_model_name
    }

@router.post("/settings")
def update_settings(payload: RiskThresholdsSchema, pm: PipelineManager = Depends(get_pipeline)):
    pm.risk_engine.low_threshold = payload.low_risk_threshold
    pm.risk_engine.high_threshold = payload.high_risk_threshold
    return {
        "status": "updated",
        "low_risk_threshold": pm.risk_engine.low_threshold,
        "high_risk_threshold": pm.risk_engine.high_threshold
    }
