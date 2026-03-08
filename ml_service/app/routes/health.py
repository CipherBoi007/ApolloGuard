from fastapi import APIRouter
import psutil
import os
from datetime import datetime

router = APIRouter()

@router.get("/")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "ML Service",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/detailed")
async def detailed_health():
    """Detailed health check with system metrics"""
    try:
        # Get system metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Check if models are loaded
        models_loaded = os.path.exists('models/patient_risk_model.pkl')
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu_usage": f"{cpu_percent}%",
                "memory_usage": f"{memory.percent}%",
                "memory_available": f"{memory.available / (1024**3):.2f} GB",
                "disk_usage": f"{disk.percent}%",
                "disk_free": f"{disk.free / (1024**3):.2f} GB"
            },
            "models": {
                "patient_risk_loaded": models_loaded,
                "disease_prediction_loaded": os.path.exists('models/disease_prediction_model.pkl')
            },
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }