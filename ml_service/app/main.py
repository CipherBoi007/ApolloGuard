from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from app.routes import predict, train, health
from app.services.model_service import ModelService

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Hospital Management System ML Service",
    description="Machine Learning services for patient risk assessment and disease prediction",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model service
model_service = ModelService()

# Include routers
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(predict.router, prefix="/api/predict", tags=["Prediction"])
app.include_router(train.router, prefix="/api/train", tags=["Training"])

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    print("\n" + "="*60)
    print("🚀 STARTING ML SERVICE")
    print("="*60)
    
    # Print current working directory
    import os
    from pathlib import Path
    cwd = Path.cwd()
    print(f"📁 Current working directory: {cwd}")
    print(f"📁 Absolute path: {cwd.absolute()}")
    
    # List contents of current directory
    print(f"\n📋 Contents of {cwd}:")
    for f in cwd.glob("*"):
        if f.is_dir():
            print(f"   📁 {f.name}/")
        else:
            print(f"   📄 {f.name}")
    
    # Check models directory specifically
    models_dir = cwd / "models"
    print(f"\n📁 Models directory: {models_dir}")
    print(f"   Exists: {models_dir.exists()}")
    
    if models_dir.exists():
        print(f"   Contents:")
        for f in models_dir.glob("*"):
            size = f.stat().st_size / 1024
            print(f"      - {f.name} ({size:.1f} KB)")
    
    # Load models
    try:
        global model_service
        model_service = ModelService()
        loaded_models = model_service.load_models()
        print(f"\n✅ Models loaded successfully: {list(loaded_models.keys())}")
    except Exception as e:
        print(f"\n⚠️  Warning: Could not load models: {e}")
        import traceback
        traceback.print_exc()
        print("\n   Models will be loaded on first request")
    
    print("="*60 + "\n")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("👋 Shutting down ML service")

@app.get("/")
async def root():
    return {
        "service": "Hospital Management System ML Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/health",
            "predict": "/api/predict",
            "train": "/api/train",
            "docs": "/api/docs"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=5001,
        reload=True,
        log_level="info"
    )