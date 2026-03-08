import Prediction from '../models/Prediction.js';
import ClinicalRecord from '../models/ClinicalRecord.js';
import Patient from '../models/Patient.js';

class PredictionService {
  static async generatePrediction(clinicalRecordId) {
    const clinicalRecord = await ClinicalRecord.findById(clinicalRecordId);
    
    if (!clinicalRecord) {
      throw new Error('Clinical record not found');
    }

    const patient = await Patient.findById(clinicalRecord.patient_id);

    // Rule-based risk assessment
    const riskFactors = this.assessRiskFactors(clinicalRecord, patient);
    const riskLevel = this.determineRiskLevel(riskFactors);
    const confidenceScore = this.calculateConfidence(riskFactors);

    const predictionData = {
      risk_factors: riskFactors,
      vital_signs_analysis: this.analyzeVitalSigns(clinicalRecord),
      lab_results_analysis: this.analyzeLabResults(clinicalRecord),
      patient_demographics: {
        age: this.calculateAge(patient.date_of_birth),
        gender: patient.gender,
        bmi: this.calculateBMI(patient.height, patient.weight)
      }
    };

    const recommendations = this.generateRecommendations(riskLevel, predictionData);

    const prediction = await Prediction.create({
      patient_id: patient.id,
      clinical_record_id: clinicalRecordId,
      prediction_type: 'general_health_risk',
      risk_level: riskLevel,
      confidence_score: confidenceScore,
      prediction_data: predictionData,
      recommendations
    });

    return prediction;
  }

  static assessRiskFactors(clinicalRecord, patient) {
    const factors = [];
    
    // Blood pressure assessment
    if (clinicalRecord.blood_pressure_systolic) {
      if (clinicalRecord.blood_pressure_systolic >= 180 || 
          clinicalRecord.blood_pressure_diastolic >= 120) {
        factors.push({ factor: 'hypertension_crisis', severity: 'high' });
      } else if (clinicalRecord.blood_pressure_systolic >= 140 || 
                 clinicalRecord.blood_pressure_diastolic >= 90) {
        factors.push({ factor: 'hypertension', severity: 'moderate' });
      }
    }

    // Heart rate assessment
    if (clinicalRecord.heart_rate) {
      if (clinicalRecord.heart_rate > 120 || clinicalRecord.heart_rate < 40) {
        factors.push({ factor: 'arrhythmia_risk', severity: 'high' });
      } else if (clinicalRecord.heart_rate > 100 || clinicalRecord.heart_rate < 50) {
        factors.push({ factor: 'abnormal_heart_rate', severity: 'moderate' });
      }
    }

    // Blood sugar assessment
    if (clinicalRecord.blood_sugar) {
      if (clinicalRecord.blood_sugar > 300) {
        factors.push({ factor: 'severe_hyperglycemia', severity: 'high' });
      } else if (clinicalRecord.blood_sugar > 180) {
        factors.push({ factor: 'hyperglycemia', severity: 'moderate' });
      } else if (clinicalRecord.blood_sugar < 70) {
        factors.push({ factor: 'hypoglycemia', severity: 'high' });
      }
    }

    // Oxygen saturation
    if (clinicalRecord.oxygen_saturation) {
      if (clinicalRecord.oxygen_saturation < 90) {
        factors.push({ factor: 'severe_hypoxia', severity: 'high' });
      } else if (clinicalRecord.oxygen_saturation < 95) {
        factors.push({ factor: 'mild_hypoxia', severity: 'moderate' });
      }
    }

    return factors;
  }

  static determineRiskLevel(factors) {
    const highRiskCount = factors.filter(f => f.severity === 'high').length;
    const moderateRiskCount = factors.filter(f => f.severity === 'moderate').length;

    if (highRiskCount > 0) return 'high';
    if (moderateRiskCount > 1) return 'high';
    if (moderateRiskCount === 1) return 'moderate';
    if (factors.length > 0) return 'low';
    return 'low';
  }

  static calculateConfidence(factors) {
    // Simple confidence calculation based on data completeness
    const baseConfidence = 70;
    const factorBonus = Math.min(factors.length * 5, 25);
    return Math.min(baseConfidence + factorBonus, 95);
  }

  static analyzeVitalSigns(clinicalRecord) {
    return {
      blood_pressure: clinicalRecord.blood_pressure_systolic && clinicalRecord.blood_pressure_diastolic
        ? `${clinicalRecord.blood_pressure_systolic}/${clinicalRecord.blood_pressure_diastolic}`
        : 'Not recorded',
      heart_rate: clinicalRecord.heart_rate || 'Not recorded',
      temperature: clinicalRecord.temperature || 'Not recorded',
      oxygen_saturation: clinicalRecord.oxygen_saturation || 'Not recorded'
    };
  }

  static analyzeLabResults(clinicalRecord) {
    return {
      blood_sugar: clinicalRecord.blood_sugar || 'Not recorded',
      cholesterol: {
        total: clinicalRecord.cholesterol_total || 'Not recorded',
        hdl: clinicalRecord.cholesterol_hdl || 'Not recorded',
        ldl: clinicalRecord.cholesterol_ldl || 'Not recorded'
      }
    };
  }

  static calculateBMI(height, weight) {
    if (!height || !weight) return null;
    // height in cm, weight in kg
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }

  static calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  static generateRecommendations(riskLevel, predictionData) {
    const recommendations = [];

    switch (riskLevel) {
      case 'high':
        recommendations.push('Immediate medical attention required');
        recommendations.push('Contact emergency services if symptoms worsen');
        recommendations.push('Schedule follow-up appointment within 24 hours');
        break;
      case 'moderate':
        recommendations.push('Schedule follow-up appointment within 1 week');
        recommendations.push('Monitor symptoms and record any changes');
        recommendations.push('Maintain healthy lifestyle habits');
        break;
      case 'low':
        recommendations.push('Continue regular monitoring');
        recommendations.push('Schedule routine check-up within 3 months');
        recommendations.push('Maintain healthy diet and exercise routine');
        break;
    }

    // Add specific recommendations based on risk factors
    if (predictionData.vital_signs_analysis.blood_pressure !== 'Not recorded') {
      recommendations.push('Monitor blood pressure regularly');
    }

    if (predictionData.lab_results_analysis.blood_sugar !== 'Not recorded') {
      recommendations.push('Monitor blood sugar levels as advised');
    }

    return recommendations;
  }
}

export default PredictionService;