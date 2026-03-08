import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.metrics import confusion_matrix, roc_auc_score
import xgboost as xgb
import joblib
import os
from typing import Tuple, Dict, Any, List
import warnings
warnings.filterwarnings('ignore')

class PatientRiskModel:
    """Patient risk prediction model using ensemble methods"""
    
    def __init__(self, model_type='xgboost'):
        self.model_type = model_type
        self.model = None
        self.feature_importance = None
        self.classes = ['low', 'moderate', 'high']
        self.version = "1.0.0"
        self.thresholds = {
            'low': 0.3,
            'moderate': 0.6,
            'high': 0.8
        }
        
    def _create_model(self):
        """Create model based on type"""
        if self.model_type == 'random_forest':
            return RandomForestClassifier(
                n_estimators=200,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                class_weight='balanced'
            )
        elif self.model_type == 'gradient_boosting':
            return GradientBoostingClassifier(
                n_estimators=150,
                max_depth=8,
                learning_rate=0.1,
                subsample=0.8,
                random_state=42
            )
        else:  # xgboost
            return xgb.XGBClassifier(
                n_estimators=200,
                max_depth=10,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                eval_metric='mlogloss'
            )
    
    def train(self, X: np.ndarray, y: np.ndarray, 
              validation_split: float = 0.2) -> Dict[str, float]:
        """Train the model"""
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=validation_split, random_state=42, stratify=y
        )
        
        # Create and train model
        self.model = self._create_model()
        self.model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = self.model.predict(X_val)
        y_proba = self.model.predict_proba(X_val)
        
        # Calculate metrics
        metrics = {
            'accuracy': accuracy_score(y_val, y_pred),
            'precision': precision_score(y_val, y_pred, average='weighted'),
            'recall': recall_score(y_val, y_pred, average='weighted'),
            'f1_score': f1_score(y_val, y_pred, average='weighted')
        }
        
        # Calculate ROC AUC for multiclass
        try:
            metrics['roc_auc'] = roc_auc_score(y_val, y_proba, multi_class='ovr')
        except:
            metrics['roc_auc'] = 0.0
        
        # Cross-validation score
        cv_scores = cross_val_score(self.model, X, y, cv=5)
        metrics['cv_mean'] = cv_scores.mean()
        metrics['cv_std'] = cv_scores.std()
        
        # Feature importance
        if hasattr(self.model, 'feature_importances_'):
            self.feature_importance = self.model.feature_importances_
        
        return metrics
    
    def predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Predict risk levels"""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Get predictions
        y_pred = self.model.predict(X)
        y_proba = self.model.predict_proba(X)
        
        return y_pred, y_proba
    
    def predict_with_confidence(self, X: np.ndarray) -> List[Dict[str, Any]]:
        """Predict with confidence scores and risk factors"""
        y_pred, y_proba = self.predict(X)
        
        results = []
        for i, (pred, proba) in enumerate(zip(y_pred, y_proba)):
            risk_level = self.classes[int(pred)]
            confidence = float(np.max(proba) * 100)
            
            # Identify key risk factors (simplified - in production use SHAP values)
            risk_factors = self._identify_risk_factors(X[i], risk_level)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(risk_level, risk_factors)
            
            results.append({
                'risk_level': risk_level,
                'confidence_score': round(confidence, 2),
                'risk_factors': risk_factors,
                'recommendations': recommendations,
                'probabilities': {
                    cls: float(prob) for cls, prob in zip(self.classes, proba)
                }
            })
        
        return results
    
    def _identify_risk_factors(self, features: np.ndarray, risk_level: str) -> List[Dict[str, Any]]:
        """Identify key risk factors contributing to prediction"""
        # This is a simplified version - in production use SHAP or LIME
        risk_factors = []
        
        if risk_level == 'high':
            risk_factors.append({
                'factor': 'Multiple abnormal vital signs',
                'severity': 'high',
                'description': 'Patient shows multiple abnormal vital signs requiring immediate attention'
            })
        elif risk_level == 'moderate':
            risk_factors.append({
                'factor': 'Some abnormal readings',
                'severity': 'moderate',
                'description': 'Some vital signs are outside normal range'
            })
        
        return risk_factors
    
    def _generate_recommendations(self, risk_level: str, 
                                   risk_factors: List[Dict]) -> List[str]:
        """Generate recommendations based on risk level"""
        recommendations = []
        
        if risk_level == 'high':
            recommendations.append('Immediate medical attention required')
            recommendations.append('Contact emergency services if symptoms worsen')
            recommendations.append('Admit to ICU for close monitoring')
            recommendations.append('Schedule follow-up within 24 hours')
        elif risk_level == 'moderate':
            recommendations.append('Schedule follow-up appointment within 1 week')
            recommendations.append('Monitor vital signs daily')
            recommendations.append('Medication review recommended')
            recommendations.append('Lifestyle modifications advised')
        else:
            recommendations.append('Continue regular monitoring')
            recommendations.append('Schedule routine check-up in 3 months')
            recommendations.append('Maintain healthy lifestyle habits')
            recommendations.append('Report any new symptoms promptly')
        
        return recommendations
    
    def save(self, path: str):
        """Save model to disk"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'model_type': self.model_type,
            'classes': self.classes,
            'version': self.version,
            'thresholds': self.thresholds,
            'feature_importance': self.feature_importance
        }, path)
    
    def load(self, path: str):
        """Load model from disk"""
        data = joblib.load(path)
        self.model = data['model']
        self.model_type = data['model_type']
        self.classes = data['classes']
        self.version = data['version']
        self.thresholds = data['thresholds']
        self.feature_importance = data.get('feature_importance')
        return self