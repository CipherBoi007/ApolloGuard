import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
import joblib
import os
from typing import List, Dict, Any, Tuple

class DiseasePredictionModel:
    """Multi-label disease prediction model"""
    
    def __init__(self):
        self.model = None
        self.disease_classes = [
            'hypertension', 'diabetes', 'heart_disease', 
            'copd', 'asthma', 'kidney_disease', 'liver_disease',
            'anemia', 'thyroid_disorder', 'arthritis'
        ]
        self.version = "1.0.0"
        
    def train(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """Train multi-label disease prediction model"""
        # Create base classifier
        base_model = RandomForestClassifier(
            n_estimators=150,
            max_depth=12,
            min_samples_split=5,
            random_state=42
        )
        
        # Wrap in multi-output classifier
        self.model = MultiOutputClassifier(base_model, n_jobs=-1)
        self.model.fit(X, y)
        
        # Calculate metrics (simplified)
        train_score = self.model.score(X, y)
        
        return {
            'train_accuracy': train_score,
            'n_classes': len(self.disease_classes),
            'model_type': 'multi_output_random_forest'
        }
    
    def predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Predict diseases and probabilities"""
        if self.model is None:
            raise ValueError("Model not trained")
        
        # Get predictions
        y_pred = self.model.predict(X)
        
        # Get probabilities (simplified - average of estimators)
        y_proba = np.array([est.predict_proba(X) for est in self.model.estimators_])
        y_proba = np.mean(y_proba, axis=0)
        
        return y_pred, y_proba
    
    def predict_diseases(self, X: np.ndarray, threshold: float = 0.5) -> List[Dict[str, Any]]:
        """Predict diseases with confidence scores"""
        y_pred, y_proba = self.predict(X)
        
        results = []
        for i in range(len(X)):
            predicted_diseases = []
            
            for j, disease in enumerate(self.disease_classes):
                prob = y_proba[i][j] if y_proba.ndim > 2 else y_proba[j][i][1] if y_proba[j].shape[1] > 1 else y_proba[j][i][0]
                
                if prob >= threshold:
                    predicted_diseases.append({
                        'disease': disease,
                        'probability': float(prob),
                        'severity': self._estimate_severity(prob)
                    })
            
            # Sort by probability
            predicted_diseases.sort(key=lambda x: x['probability'], reverse=True)
            
            results.append({
                'predicted_diseases': predicted_diseases,
                'primary_concern': predicted_diseases[0]['disease'] if predicted_diseases else None,
                'risk_level': self._calculate_overall_risk(predicted_diseases)
            })
        
        return results
    
    def _estimate_severity(self, probability: float) -> str:
        """Estimate disease severity based on probability"""
        if probability >= 0.8:
            return 'high'
        elif probability >= 0.5:
            return 'moderate'
        else:
            return 'low'
    
    def _calculate_overall_risk(self, diseases: List[Dict]) -> str:
        """Calculate overall patient risk based on predicted diseases"""
        if not diseases:
            return 'low'
        
        max_severity = max([d['severity'] for d in diseases], key=lambda x: 
                          {'high': 3, 'moderate': 2, 'low': 1}.get(x, 0))
        
        return max_severity
    
    def save(self, path: str):
        """Save model to disk"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'disease_classes': self.disease_classes,
            'version': self.version
        }, path)
    
    def load(self, path: str):
        """Load model from disk"""
        data = joblib.load(path)
        self.model = data['model']
        self.disease_classes = data['disease_classes']
        self.version = data['version']
        return self