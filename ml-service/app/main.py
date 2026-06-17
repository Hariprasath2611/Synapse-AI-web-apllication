from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from app.ml_engine import ml_engine

app = FastAPI(
  title="Synapse AI — Predictive Machine Learning Microservice",
  description="Python API for recommendations, fraud anomaly scans, churn predictions, and revenue forecasting.",
  version="1.0.0"
)

# --- PYDANTIC SCHEMAS ---
class RecommendRequest(BaseModel):
  userId: str
  category: Optional[str] = None

class ForecastRequest(BaseModel):
  history: List[float]

class AnomalyRequest(BaseModel):
  usageHistory: List[float]

class ChurnRequest(BaseModel):
  usageFrequency: float # conversations per week
  activeDays: float # active days in past month
  subscriptionAgeMonths: float

# --- ROUTER ENDPOINTS ---
@app.get("/")
def read_root():
  return {"service": "Synapse AI ML Service", "status": "online"}

@app.post("/recommend")
def get_recommendations(req: RecommendRequest):
  recommendations = ml_engine.recommend_agents(req.userId, req.category)
  return {"userId": req.userId, "recommendations": recommendations}

@app.post("/forecast")
def get_revenue_forecast(req: ForecastRequest):
  forecast = ml_engine.forecast_revenue(req.history)
  return {"history": req.history, "forecast": forecast}

@app.post("/anomalies")
def scan_anomalies(req: AnomalyRequest):
  anomalies = ml_engine.detect_anomalies(req.usageHistory)
  return {"usageHistory": req.usageHistory, "anomalies": anomalies}

@app.post("/churn")
def check_churn_risk(req: ChurnRequest):
  churn_prob = ml_engine.predict_churn(
    req.usageFrequency, 
    req.activeDays, 
    req.subscriptionAgeMonths
  )
  return {
    "churnProbability": churn_prob,
    "churnRisk": "High" if churn_prob > 0.6 else "Medium" if churn_prob > 0.3 else "Low"
  }
