import PredictionService from '../services/predictionService.js';
import Prediction from '../models/Prediction.js';
import ClinicalRecord from '../models/ClinicalRecord.js';
import Patient from '../models/Patient.js';

class PredictionController {
  // Generate new prediction
  static async generatePrediction(req, res) {
    try {
      const { clinicalRecordId } = req.params;

      // Check if clinical record exists
      const clinicalRecord = await ClinicalRecord.findById(clinicalRecordId);
      if (!clinicalRecord) {
        return res.status(404).json({ error: 'Clinical record not found' });
      }

      // Generate prediction using rule-based service
      const prediction = await PredictionService.generatePrediction(clinicalRecordId);

      res.status(201).json({
        message: 'Prediction generated successfully',
        prediction
      });
    } catch (error) {
      console.error('Generate prediction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get prediction by ID
  static async getPredictionById(req, res) {
    try {
      const { id } = req.params;
      
      const prediction = await Prediction.findById(id);
      
      if (!prediction) {
        return res.status(404).json({ error: 'Prediction not found' });
      }

      res.json(prediction);
    } catch (error) {
      console.error('Get prediction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all predictions for a patient
  static async getPatientPredictions(req, res) {
    try {
      const { patientId } = req.params;
      
      const predictions = await Prediction.findByPatientId(patientId);
      
      res.json(predictions);
    } catch (error) {
      console.error('Get patient predictions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get latest prediction for a patient
  static async getLatestPatientPrediction(req, res) {
    try {
      const { patientId } = req.params;
      
      const prediction = await Prediction.findLatestByPatient(patientId);
      
      if (!prediction) {
        return res.status(404).json({ error: 'No predictions found for this patient' });
      }

      res.json(prediction);
    } catch (error) {
      console.error('Get latest prediction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get prediction statistics
  static async getPredictionStats(req, res) {
    try {
      const stats = await Prediction.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Get prediction stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Batch generate predictions for multiple patients
  static async batchGeneratePredictions(req, res) {
    try {
      const { patientIds } = req.body;
      
      if (!patientIds || !Array.isArray(patientIds)) {
        return res.status(400).json({ error: 'Please provide an array of patient IDs' });
      }

      const results = [];
      for (const patientId of patientIds) {
        try {
          // Get latest clinical record for patient
          const clinicalRecord = await ClinicalRecord.findLatestByPatient(patientId);
          if (clinicalRecord) {
            const prediction = await PredictionService.generatePrediction(clinicalRecord.id);
            results.push({
              patientId,
              success: true,
              prediction
            });
          } else {
            results.push({
              patientId,
              success: false,
              error: 'No clinical records found'
            });
          }
        } catch (error) {
          results.push({
            patientId,
            success: false,
            error: error.message
          });
        }
      }

      res.json({
        message: 'Batch prediction completed',
        results
      });
    } catch (error) {
      console.error('Batch prediction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default PredictionController;