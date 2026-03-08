import pool from '../config/database.js';

class Diagnosis {
  static async create(diagnosisData) {
    const {
      patient_id, doctor_id, clinical_record_id,
      prediction_id, diagnosis, severity,
      prescription, follow_up_date, notes
    } = diagnosisData;

    const query = `
      INSERT INTO diagnoses (
        patient_id, doctor_id, clinical_record_id,
        prediction_id, diagnosis, severity,
        prescription, follow_up_date, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      patient_id, doctor_id, clinical_record_id,
      prediction_id, diagnosis, severity,
      prescription, follow_up_date, notes
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByPatientId(patientId) {
    const query = `
      SELECT d.*, 
             u.first_name || ' ' || u.last_name as doctor_name,
             p.risk_level as prediction_risk
      FROM diagnoses d
      JOIN users u ON d.doctor_id = u.id
      LEFT JOIN predictions p ON d.prediction_id = p.id
      WHERE d.patient_id = $1
      ORDER BY d.created_at DESC
    `;
    const result = await pool.query(query, [patientId]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT d.*, 
             u.first_name || ' ' || u.last_name as doctor_name
      FROM diagnoses d
      JOIN users u ON d.doctor_id = u.id
      WHERE d.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, diagnosisData) {
    const {
      diagnosis, severity, prescription,
      follow_up_date, notes
    } = diagnosisData;

    const query = `
      UPDATE diagnoses
      SET diagnosis = $1,
          severity = $2,
          prescription = $3,
          follow_up_date = $4,
          notes = $5
      WHERE id = $6
      RETURNING *
    `;

    const values = [diagnosis, severity, prescription, follow_up_date, notes, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

export default Diagnosis;