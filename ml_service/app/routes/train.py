from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import asyncio
import os

from app.models.train import train_patient_risk_model, train_disease_prediction_model

router = APIRouter()

# Store training status
training_status = {
    'is_training': False,
    'last_trained': None,
    'progress': 0,
    'current_model': None,
    'error': None
}

@router.post("/start")
async def start_training(background_tasks: BackgroundTasks, model_type: str = "all"):
    """Start model training in background"""
    global training_status
    
    if training_status['is_training']:
        raise HTTPException(status_code=400, detail="Training already in progress")
    
    training_status['is_training'] = True
    training_status['progress'] = 0
    training_status['error'] = None
    training_status['current_model'] = model_type
    
    background_tasks.add_task(run_training, model_type)
    
    return {"message": f"Training started for model: {model_type}", "status": "running"}

async def run_training(model_type: str):
    """Run training in background"""
    global training_status
    
    try:
        if model_type in ['all', 'patient_risk']:
            training_status['progress'] = 25
            await asyncio.sleep(1)  # Simulate progress
            train_patient_risk_model()
            
        if model_type in ['all', 'disease_prediction']:
            training_status['progress'] = 75
            await asyncio.sleep(1)
            train_disease_prediction_model()
        
        training_status['progress'] = 100
        training_status['is_training'] = False
        training_status['last_trained'] = str(datetime.now())
        
    except Exception as e:
        training_status['error'] = str(e)
        training_status['is_training'] = False

@router.get("/status")
async def get_training_status():
    """Get current training status"""
    return training_status

@router.post("/retrain")
async def retrain_model(model_name: str):
    """Retrain a specific model"""
    try:
        if model_name == 'patient_risk':
            model, preprocessor = train_patient_risk_model()
        elif model_name == 'disease_prediction':
            model = train_disease_prediction_model()
        else:
            raise HTTPException(status_code=400, detail="Unknown model type")
        
        return {"message": f"Model {model_name} retrained successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))