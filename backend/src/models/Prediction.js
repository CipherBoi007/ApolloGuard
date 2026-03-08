import pool from '../config/database.js';

class Prediction {
  static async create(predictionData) {
    const {
      patient_id, clinical_record_id, prediction_type,
      risk_level, confidence_score, prediction_data,
      recommendations
    } = predictionData;

    const query = `
      INSERT INTO predictions (
        patient_id, clinical_record_id, prediction_type,
        risk_level, confidence_score, prediction_data,
        recommendations
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      patient_id, clinical_record_id, prediction_type,
      risk_level, confidence_score, JSON.stringify(prediction_data),
      recommendations
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByPatientId(patientId) {
    const query = `
      SELECT p.*, cr.record_date
      FROM predictions p
      JOIN clinical_records cr ON p.clinical_record_id = cr.id
      WHERE p.patient_id = $1
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query, [patientId]);
    return result.rows;
  }

  static async findLatestByPatient(patientId) {
    const query = `
      SELECT p.*, cr.record_date
      FROM predictions p
      JOIN clinical_records cr ON p.clinical_record_id = cr.id
      WHERE p.patient_id = $1
      ORDER BY p.created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [patientId]);
    return result.rows[0];
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_predictions,
        COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_count,
        COUNT(CASE WHEN risk_level = 'moderate' THEN 1 END) as moderate_risk_count,
        COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_risk_count,
        AVG(confidence_score) as avg_confidence
      FROM predictions
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}

export default Prediction;