import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
import joblib
import os
from typing import Tuple, Dict, Any, List

class DataPreprocessor:
    """Handles data preprocessing for ML models"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.imputer = SimpleImputer(strategy='median')
        self.feature_columns = None
        
    def fit(self, df: pd.DataFrame, target_column: str = None):
        """Fit preprocessor on training data"""
        # Handle categorical variables
        categorical_cols = df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            if col != target_column:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                self.label_encoders[col] = le
        
        # Select features (exclude target and non-feature columns)
        exclude_cols = [target_column, 'patient_id', 'created_at'] if target_column else []
        feature_cols = [col for col in df.columns if col not in exclude_cols]
        self.feature_columns = feature_cols
        
        # Fit imputer and scaler
        X = df[feature_cols].values
        self.imputer.fit(X)
        X_imputed = self.imputer.transform(X)
        self.scaler.fit(X_imputed)
        
        return self
    
    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transform data for prediction"""
        df_copy = df.copy()
        
        # Apply label encoding
        for col, le in self.label_encoders.items():
            if col in df_copy.columns:
                # Handle unknown categories
                df_copy[col] = df_copy[col].map(
                    lambda x: le.transform([x])[0] if x in le.classes_ else -1
                )
        
        # Ensure all feature columns exist
        for col in self.feature_columns:
            if col not in df_copy.columns:
                df_copy[col] = np.nan
        
        # Select and order features
        X = df_copy[self.feature_columns].values
        
        # Impute missing values
        X = self.imputer.transform(X)
        
        # Scale features
        X = self.scaler.transform(X)
        
        return X
    
    def inverse_transform_target(self, y: np.ndarray, encoder: LabelEncoder) -> np.ndarray:
        """Inverse transform target labels"""
        return encoder.inverse_transform(y.astype(int))
    
    def save(self, path: str):
        """Save preprocessor to disk"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'imputer': self.imputer,
            'feature_columns': self.feature_columns
        }, path)
    
    def load(self, path: str):
        """Load preprocessor from disk"""
        data = joblib.load(path)
        self.scaler = data['scaler']
        self.label_encoders = data['label_encoders']
        self.imputer = data['imputer']
        self.feature_columns = data['feature_columns']
        return self
    
    def prepare_clinical_data(self, clinical_data: Dict[str, Any]) -> pd.DataFrame:
        """Convert clinical data dictionary to DataFrame"""
        df = pd.DataFrame([clinical_data])
        
        # Calculate derived features
        if 'blood_pressure_systolic' in df.columns and 'blood_pressure_diastolic' in df.columns:
            df['bp_ratio'] = df['blood_pressure_systolic'] / df['blood_pressure_diastolic']
            df['map'] = df['blood_pressure_diastolic'] + (df['blood_pressure_systolic'] - df['blood_pressure_diastolic']) / 3
        
        if 'height' in df.columns and 'weight' in df.columns:
            df['bmi'] = df['weight'] / ((df['height'] / 100) ** 2)
        
        # Create risk flags
        df['high_bp_flag'] = (df['blood_pressure_systolic'] >= 140) | (df['blood_pressure_diastolic'] >= 90)
        df['high_hr_flag'] = df['heart_rate'] >= 100
        df['low_o2_flag'] = df['oxygen_saturation'] <= 94
        df['high_temp_flag'] = df['temperature'] >= 38.0
        
        return df