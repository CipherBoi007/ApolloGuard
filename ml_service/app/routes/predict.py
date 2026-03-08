from fastapi import APIRouter, HTTPException, Depends
from typing import List
import uuid
from datetime import datetime
import numpy as np

from app.schemas.requests import ClinicalData, BatchPredictionRequest, PredictionResponse
from app.services.model_service import ModelService
from app.services.data_preprocessor import DataPreprocessor

router = APIRouter()
model_service = ModelService()

@router.post("/patient-risk", response_model=PredictionResponse)
async def predict_patient_risk(clinical_data: ClinicalData):
    """Predict patient risk level based on clinical data"""
    try:
        # Load model and preprocessor
        model = model_service.get_model('patient_risk')
        preprocessor = model_service.get_preprocessor('patient_risk')
        
        # Prepare data
        df = preprocessor.prepare_clinical_data(clinical_data.dict())
        X = preprocessor.transform(df)
        
        # Make prediction
        results = model.predict_with_confidence(X)
        result = results[0]
        
        return PredictionResponse(
            prediction_id=str(uuid.uuid4()),
            patient_id=clinical_data.patient_id,
            risk_level=result['risk_level'],
            confidence_score=result['confidence_score'],
            risk_factors=result['risk_factors'],
            recommendations=result['recommendations'],
            model_version=model.version,
            timestamp=datetime.now()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/batch", response_model=List[PredictionResponse])
async def batch_predict(request: BatchPredictionRequest):
    """Batch prediction for multiple patients"""
    try:
        model = model_service.get_model(request.model_type)
        preprocessor = model_service.get_preprocessor(request.model_type)
        
        results = []
        for record in request.records:
            df = preprocessor.prepare_clinical_data(record.dict())
            X = preprocessor.transform(df)
            pred_results = model.predict_with_confidence(X)
            
            for result in pred_results:
                results.append(PredictionResponse(
                    prediction_id=str(uuid.uuid4()),
                    patient_id=record.patient_id,
                    risk_level=result['risk_level'],
                    confidence_score=result['confidence_score'],
                    risk_factors=result['risk_factors'],
                    recommendations=result['recommendations'],
                    model_version=model.version,
                    timestamp=datetime.now()
                ))
        
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@router.post("/diseases")
async def predict_diseases(clinical_data: ClinicalData):
    """Predict potential diseases based on clinical data"""
    try:
        model = model_service.get_model('disease_prediction')
        preprocessor = model_service.get_preprocessor('disease_prediction')
        
        df = preprocessor.prepare_clinical_data(clinical_data.dict())
        X = preprocessor.transform(df)
        
        results = model.predict_diseases(X)
        
        return {
            "prediction_id": str(uuid.uuid4()),
            "patient_id": clinical_data.patient_id,
            "predictions": results[0],
            "model_version": model.version,
            "timestamp": datetime.now()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease prediction failed: {str(e)}")