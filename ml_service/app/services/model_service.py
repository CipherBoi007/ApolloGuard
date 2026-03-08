import os
import joblib
from pathlib import Path
from typing import Dict, Any
import sys

# Add parent directory to path to ensure imports work
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.models.patient_risk import PatientRiskModel
from app.models.disease_prediction import DiseasePredictionModel
from app.services.data_preprocessor import DataPreprocessor

class ModelService:
    """Service to manage ML models"""
    
    def __init__(self):
        # Get absolute path to models directory
        self.base_dir = Path(__file__).parent.parent.parent
        self.models_dir = self.base_dir / 'models'
        
        print(f"\n🔧 ModelService Initialized")
        print(f"   Base dir: {self.base_dir}")
        print(f"   Models dir: {self.models_dir}")
        print(f"   Models dir exists: {self.models_dir.exists()}")
        
        self.models = {}
        self.preprocessors = {}
        
        # Define model paths with absolute paths
        self.model_paths = {
            'patient_risk': self.models_dir / 'patient_risk_model.pkl',
            'disease_prediction': self.models_dir / 'disease_prediction_model.pkl'
        }
        
        self.preprocessor_paths = {
            'patient_risk': self.models_dir / 'patient_risk_preprocessor.pkl',
        }
        
        # Print all paths for debugging
        for name, path in self.model_paths.items():
            print(f"   {name} path: {path} (exists: {path.exists()})")
    
    def load_models(self):
        """Load all available models"""
        print("\n🔄 Loading models...")
        
        # Create models directory if it doesn't exist
        self.models_dir.mkdir(exist_ok=True)
        print(f"   Models directory: {self.models_dir}")
        
        for model_name, path in self.model_paths.items():
            try:
                print(f"\n   Checking {model_name} at: {path}")
                
                if path.exists():
                    print(f"   ✅ Found {model_name} model file")
                    
                    if model_name == 'patient_risk':
                        model = PatientRiskModel()
                        model.load(str(path))
                        print(f"   ✅ Loaded {model_name} model")
                        self.models[model_name] = model
                        
                        # Load preprocessor if exists
                        preprocessor_path = self.preprocessor_paths.get(model_name)
                        if preprocessor_path and preprocessor_path.exists():
                            preprocessor = DataPreprocessor()
                            preprocessor.load(str(preprocessor_path))
                            self.preprocessors[model_name] = preprocessor
                            print(f"   ✅ Loaded {model_name} preprocessor")
                        else:
                            print(f"   ⚠️  Preprocessor not found for {model_name}")
                    
                    elif model_name == 'disease_prediction':
                        model = DiseasePredictionModel()
                        model.load(str(path))
                        print(f"   ✅ Loaded {model_name} model")
                        self.models[model_name] = model
                    
                else:
                    print(f"   ❌ Model file not found: {path}")
                    
            except Exception as e:
                print(f"   ❌ Failed to load {model_name} model: {e}")
                import traceback
                traceback.print_exc()
        
        print(f"\n✅ Loaded {len(self.models)} models")
        return self.models
    
    def get_model(self, model_name: str):
        """Get model by name"""
        print(f"🔍 Getting model: {model_name}")
        
        if model_name not in self.models:
            print(f"   Model {model_name} not loaded, attempting to reload...")
            self.load_models()
            
        if model_name not in self.models:
            available = list(self.models.keys())
            error_msg = f"Model {model_name} not loaded. Available: {available}"
            print(f"   ❌ {error_msg}")
            raise ValueError(error_msg)
            
        print(f"   ✅ Found model: {model_name}")
        return self.models[model_name]
    
    def get_preprocessor(self, model_name: str):
        """Get preprocessor by name"""
        if model_name not in self.preprocessors:
            print(f"⚠️  Preprocessor for {model_name} not found, using default")
            return DataPreprocessor()
        return self.preprocessors[model_name]
    
    def reload_model(self, model_name: str):
        """Reload a specific model"""
        if model_name in self.model_paths:
            path = self.model_paths[model_name]
            if path.exists():
                if model_name == 'patient_risk':
                    model = PatientRiskModel()
                    model.load(str(path))
                elif model_name == 'disease_prediction':
                    model = DiseasePredictionModel()
                    model.load(str(path))
                
                self.models[model_name] = model
                return True
        return False