from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import numpy as np

class ClinicalData(BaseModel):
    """Clinical data for prediction"""
    patient_id: Optional[str] = None
    age: int = Field(..., ge=0, le=120, description="Patient age in years")
    gender: str = Field(..., description="Patient gender (Male/Female/Other)")
    
    # Vital signs
    blood_pressure_systolic: int = Field(..., ge=60, le=250, description="Systolic blood pressure")
    blood_pressure_diastolic: int = Field(..., ge=40, le=150, description="Diastolic blood pressure")
    heart_rate: int = Field(..., ge=30, le=250, description="Heart rate in bpm")
    respiratory_rate: int = Field(..., ge=8, le=60, description="Respiratory rate")
    temperature: float = Field(..., ge=30.0, le=45.0, description="Body temperature in Celsius")
    oxygen_saturation: int = Field(..., ge=50, le=100, description="Oxygen saturation percentage")
    
    # Lab results
    blood_sugar: Optional[float] = Field(None, ge=20, le=600, description="Blood glucose level mg/dL")
    cholesterol_total: Optional[float] = Field(None, ge=100, le=400, description="Total cholesterol mg/dL")
    cholesterol_hdl: Optional[float] = Field(None, ge=20, le=100, description="HDL cholesterol mg/dL")
    cholesterol_ldl: Optional[float] = Field(None, ge=40, le=250, description="LDL cholesterol mg/dL")
    triglycerides: Optional[float] = Field(None, ge=30, le=500, description="Triglycerides mg/dL")
    
    # Medical history
    has_hypertension: Optional[bool] = False
    has_diabetes: Optional[bool] = False
    has_heart_disease: Optional[bool] = False
    has_copd: Optional[bool] = False
    smoking_status: Optional[str] = Field(None, description="Never, Former, Current")
    
    @validator('gender')
    def validate_gender(cls, v):
        if v not in ['Male', 'Female', 'Other']:
            raise ValueError('Gender must be Male, Female, or Other')
        return v
    
    @validator('smoking_status')
    def validate_smoking(cls, v):
        if v and v not in ['Never', 'Former', 'Current']:
            raise ValueError('Smoking status must be Never, Former, or Current')
        return v

class BatchPredictionRequest(BaseModel):
    """Batch prediction request"""
    records: List[ClinicalData]
    model_type: str = Field("patient_risk", description="Model to use for prediction")

class PredictionResponse(BaseModel):
    """Prediction response"""
    prediction_id: str
    patient_id: Optional[str]
    risk_level: str
    confidence_score: float
    risk_factors: List[Dict[str, Any]]
    recommendations: List[str]
    model_version: str
    timestamp: datetime

class TrainingData(BaseModel):
    """Training data schema"""
    features: List[List[float]]
    labels: List[int]
    model_type: str
    hyperparameters: Optional[Dict[str, Any]] = None

class TrainingResponse(BaseModel):
    """Training response"""
    model_id: str
    model_type: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    feature_importance: Dict[str, float]
    training_date: datetime
    version: str