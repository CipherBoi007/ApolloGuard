import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.patient_risk import PatientRiskModel
from app.models.disease_prediction import DiseasePredictionModel
from app.services.data_preprocessor import DataPreprocessor
import joblib

def generate_synthetic_training_data(n_samples=10000):
    """Generate synthetic training data for demonstration"""
    np.random.seed(42)
    
    data = {
        'age': np.random.randint(18, 90, n_samples),
        'gender': np.random.choice(['Male', 'Female'], n_samples),
        'blood_pressure_systolic': np.random.randint(90, 200, n_samples),
        'blood_pressure_diastolic': np.random.randint(60, 120, n_samples),
        'heart_rate': np.random.randint(50, 140, n_samples),
        'respiratory_rate': np.random.randint(12, 30, n_samples),
        'temperature': np.random.uniform(36.0, 39.5, n_samples),
        'oxygen_saturation': np.random.randint(85, 100, n_samples),
        'blood_sugar': np.random.uniform(70, 300, n_samples),
        'cholesterol_total': np.random.uniform(150, 300, n_samples),
        'has_hypertension': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
        'has_diabetes': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
        'smoking_status': np.random.choice(['Never', 'Former', 'Current'], n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Generate target (risk level) based on features
    risk_score = (
        (df['blood_pressure_systolic'] > 140).astype(int) * 0.3 +
        (df['heart_rate'] > 100).astype(int) * 0.2 +
        (df['oxygen_saturation'] < 94).astype(int) * 0.3 +
        (df['temperature'] > 38).astype(int) * 0.2 +
        df['has_hypertension'] * 0.2 +
        df['has_diabetes'] * 0.2 +
        (df['age'] > 60).astype(int) * 0.1
    )
    
    # Convert to risk levels
    df['risk_level'] = pd.cut(
        risk_score,
        bins=[-np.inf, 0.3, 0.6, np.inf],
        labels=['low', 'moderate', 'high']
    )
    
    return df

def train_patient_risk_model():
    """Train patient risk prediction model"""
    print("🔄 Generating synthetic training data...")
    df = generate_synthetic_training_data(20000)
    
    print("🔄 Preprocessing data...")
    preprocessor = DataPreprocessor()
    
    # Prepare features and target
    target = 'risk_level'
    y = df[target].map({'low': 0, 'moderate': 1, 'high': 2}).values
    
    # Fit preprocessor
    preprocessor.fit(df, target)
    
    # Transform features
    X = preprocessor.transform(df)
    
    print("🔄 Training patient risk model...")
    model = PatientRiskModel(model_type='xgboost')
    metrics = model.train(X, y)
    
    print(f"✅ Model trained successfully!")
    print(f"   Accuracy: {metrics['accuracy']:.3f}")
    print(f"   Precision: {metrics['precision']:.3f}")
    print(f"   Recall: {metrics['recall']:.3f}")
    print(f"   F1 Score: {metrics['f1_score']:.3f}")
    
    # Save model and preprocessor
    os.makedirs('models', exist_ok=True)
    model.save('models/patient_risk_model.pkl')
    preprocessor.save('models/patient_risk_preprocessor.pkl')
    
    print("✅ Model and preprocessor saved to models/")
    
    return model, preprocessor

def train_disease_prediction_model():
    """Train disease prediction model"""
    print("🔄 Generating synthetic training data...")
    n_samples = 15000
    
    # Generate features
    X = np.random.randn(n_samples, 20)
    
    # Generate multi-label targets (simplified)
    y = np.random.choice([0, 1], size=(n_samples, 10), p=[0.85, 0.15])
    
    print("🔄 Training disease prediction model...")
    model = DiseasePredictionModel()
    metrics = model.train(X, y)
    
    print(f"✅ Model trained successfully!")
    print(f"   Train accuracy: {metrics['train_accuracy']:.3f}")
    
    # Save model
    model.save('models/disease_prediction_model.pkl')
    
    print("✅ Model saved to models/")
    
    return model

if __name__ == "__main__":
    print("🚀 Starting model training...")
    print("=" * 50)
    
    # Train patient risk model
    patient_risk_model, preprocessor = train_patient_risk_model()
    print("=" * 50)
    
    # Train disease prediction model
    disease_model = train_disease_prediction_model()
    print("=" * 50)
    
    print("✅ All models trained successfully!")