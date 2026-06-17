import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest
import random

class SynapseMLEngine:
  def __init__(self):
    # Seed values
    self.base_agents = ['a1', 'a2', 'a3', 'a4', 'a5']

  def recommend_agents(self, user_id, active_category=None):
    """
    Simulated collaborative filtering recommendation logic.
    Recommends agent IDs based on user profile and categories.
    """
    pool = [
      {"id": "a1", "score": 0.95},
      {"id": "a2", "score": 0.88},
      {"id": "a3", "score": 0.92},
      {"id": "a4", "score": 0.76},
      {"id": "a5", "score": 0.81}
    ]
    # Scramble scores slightly to simulate live inference
    for p in pool:
      p["score"] = float(np.clip(p["score"] + np.random.normal(0, 0.05), 0.1, 1.0))
    
    return sorted(pool, key=lambda x: x["score"], reverse=True)

  def forecast_revenue(self, history_values):
    """
    Uses Scikit-learn LinearRegression to forecast the next 3 months of SaaS revenue.
    """
    if len(history_values) < 2:
      return [val * 1.1 for val in history_values]
    
    X = np.array(range(len(history_values))).reshape(-1, 1)
    y = np.array(history_values)
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Predict next 3 steps
    next_steps = np.array([len(history_values), len(history_values) + 1, len(history_values) + 2]).reshape(-1, 1)
    predictions = model.predict(next_steps)
    return [float(p) for p in predictions]

  def detect_anomalies(self, usage_history):
    """
    Uses IsolationForest to flag suspicious conversation traffic spikes or transaction counts.
    """
    if len(usage_history) < 5:
      # Simple threshold fallback
      return [bool(x > 500) for x in usage_history]

    data = np.array(usage_history).reshape(-1, 1)
    clf = IsolationForest(contamination=0.1, random_state=42)
    clf.fit(data)
    
    predictions = clf.predict(data)
    # -1 represents an anomaly in IsolationForest
    return [bool(p == -1) for p in predictions]

  def predict_churn(self, usage_frequency, active_days, subscription_age_months):
    """
    Determines churn probability. High usage frequency + active days yields low churn.
    """
    # Simple logistic function emulation: probability increases as usage decreases
    score = (10 - usage_frequency) * 0.4 + (30 - active_days) * 0.05 - (subscription_age_months * 0.02)
    prob = 1.0 / (1.0 + np.exp(-score))
    return float(np.clip(prob, 0.0, 1.0))

ml_engine = SynapseMLEngine()
