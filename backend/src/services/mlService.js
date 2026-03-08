import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

/**
 * Get patient risk prediction from ML service
 * @param {Object} clinicalData - Patient clinical data
 * @returns {Promise<Object>} Prediction result
 */
export const getPatientRiskPrediction = async (clinicalData) => {
  try {
    console.log('🔮 Calling ML service for prediction...');
    console.log('   URL:', `${ML_SERVICE_URL}/api/predict/patient-risk`);
    console.log('   Data:', JSON.stringify(clinicalData, null, 2));
    
    const response = await axios.post(
      `${ML_SERVICE_URL}/api/predict/patient-risk`,
      clinicalData,
      {
        timeout: 5000, // 5 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ ML service response received');
    return response.data;
    
  } catch (error) {
    console.error('❌ ML Service error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   ML service is not running on port 5001');
      console.error('   Start it with: cd ml-service && uvicorn app.main:app --reload --port 5001');
    }
    
    // Fallback to rule-based prediction
    console.log('⚠️  Using fallback rule-based prediction');
    return fallbackPrediction(clinicalData);
  }
};

/**
 * Get disease predictions from ML service
 * @param {Object} clinicalData - Patient clinical data
 * @returns {Promise<Object>} Disease predictions
 */
export const getDiseasePredictions = async (clinicalData) => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/api/predict/diseases`,
      clinicalData,
      { timeout: 5000 }
    );
    
    return response.data;
    
  } catch (error) {
    console.error('Disease prediction error:', error.message);
    return fallbackDiseasePrediction(clinicalData);
  }
};

/**
 * Batch prediction for multiple patients
 * @param {Array} patientsData - Array of patient clinical data
 * @returns {Promise<Array>} Array of predictions
 */
export const getBatchPredictions = async (patientsData) => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/api/predict/batch`,
      {
        records: patientsData,
        model_type: 'patient_risk'
      },
      { timeout: 10000 }
    );
    
    return response.data;
    
  } catch (error) {
    console.error('Batch prediction error:', error.message);
    
    // Fallback to individual rule-based predictions
    return patientsData.map(data => fallbackPrediction(data));
  }
};

/**
 * Check if ML service is available
 * @returns {Promise<boolean>} True if service is available
 */
export const checkMLServiceHealth = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/health`, {
      timeout: 2000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Fallback rule-based prediction when ML service is unavailable
 */
const fallbackPrediction = (data) => {
  console.log('📊 Generating rule-based prediction...');
  
  let score = 0;
  const factors = [];
  
  // Age factor
  if (data.age > 60) {
    score += 2;
    factors.push({ factor: 'Advanced age', severity: 'moderate' });
  } else if (data.age > 40) {
    score += 1;
  }
  
  // Blood pressure
  if (data.blood_pressure_systolic > 140) {
    score += 3;
    factors.push({ factor: 'Elevated systolic BP', severity: 'high' });
  } else if (data.blood_pressure_systolic > 130) {
    score += 1;
    factors.push({ factor: 'Borderline BP', severity: 'low' });
  }
  
  // Heart rate
  if (data.heart_rate > 100) {
    score += 2;
    factors.push({ factor: 'Tachycardia', severity: 'moderate' });
  } else if (data.heart_rate < 50) {
    score += 2;
    factors.push({ factor: 'Bradycardia', severity: 'moderate' });
  }
  
  // Oxygen saturation
  if (data.oxygen_saturation < 90) {
    score += 3;
    factors.push({ factor: 'Severe hypoxemia', severity: 'high' });
  } else if (data.oxygen_saturation < 95) {
    score += 1;
    factors.push({ factor: 'Mild hypoxemia', severity: 'low' });
  }
  
  // Temperature
  if (data.temperature > 38.5) {
    score += 2;
    factors.push({ factor: 'High fever', severity: 'moderate' });
  } else if (data.temperature > 38.0) {
    score += 1;
  }
  
  // Blood sugar
  if (data.blood_sugar > 200) {
    score += 2;
    factors.push({ factor: 'Hyperglycemia', severity: 'moderate' });
  } else if (data.blood_sugar > 140) {
    score += 1;
  }
  
  // Determine risk level
  let riskLevel = 'low';
  if (score >= 8) {
    riskLevel = 'high';
  } else if (score >= 4) {
    riskLevel = 'moderate';
  }
  
  // Generate recommendations
  const recommendations = [];
  if (riskLevel === 'high') {
    recommendations.push('Immediate medical attention required');
    recommendations.push('Contact emergency services if symptoms worsen');
    recommendations.push('Admit for observation');
  } else if (riskLevel === 'moderate') {
    recommendations.push('Schedule follow-up within 1 week');
    recommendations.push('Monitor vital signs daily');
    recommendations.push('Medication review recommended');
  } else {
    recommendations.push('Continue regular monitoring');
    recommendations.push('Schedule routine check-up in 3 months');
  }
  
  return {
    risk_level: riskLevel,
    confidence_score: 85,
    risk_factors: factors,
    recommendations: recommendations,
    model_version: 'fallback-1.0.0',
    is_fallback: true
  };
};

const fallbackDiseasePrediction = (data) => {
  return {
    predictions: [],
    primary_concern: null,
    risk_level: 'unknown'
  };
};

export default {
  getPatientRiskPrediction,
  getDiseasePredictions,
  getBatchPredictions,
  checkMLServiceHealth
};