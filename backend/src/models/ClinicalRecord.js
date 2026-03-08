import pool from '../config/database.js';

class ClinicalRecord {
  static async create(recordData) {
    const {
      patient_id, recorded_by,
      blood_pressure_systolic, blood_pressure_diastolic,
      heart_rate, respiratory_rate, temperature,
      oxygen_saturation, blood_sugar, cholesterol_total,
      cholesterol_hdl, cholesterol_ldl, triglycerides,
      symptoms, notes
    } = recordData;

    const query = `
      INSERT INTO clinical_records (
        patient_id, recorded_by,
        blood_pressure_systolic, blood_pressure_diastolic,
        heart_rate, respiratory_rate, temperature,
        oxygen_saturation, blood_sugar, cholesterol_total,
        cholesterol_hdl, cholesterol_ldl, triglycerides,
        symptoms, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      patient_id, recorded_by,
      blood_pressure_systolic, blood_pressure_diastolic,
      heart_rate, respiratory_rate, temperature,
      oxygen_saturation, blood_sugar, cholesterol_total,
      cholesterol_hdl, cholesterol_ldl, triglycerides,
      symptoms, notes
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByPatientId(patientId) {
    const query = `
      SELECT cr.*, 
             u.first_name || ' ' || u.last_name as recorded_by_name
      FROM clinical_records cr
      JOIN users u ON cr.recorded_by = u.id
      WHERE cr.patient_id = $1
      ORDER BY cr.record_date DESC
    `;
    const result = await pool.query(query, [patientId]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM clinical_records WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, recordData) {
    const {
      blood_pressure_systolic, blood_pressure_diastolic,
      heart_rate, respiratory_rate, temperature,
      oxygen_saturation, blood_sugar, cholesterol_total,
      cholesterol_hdl, cholesterol_ldl, triglycerides,
      symptoms, notes
    } = recordData;

    const query = `
      UPDATE clinical_records
      SET blood_pressure_systolic = $1,
          blood_pressure_diastolic = $2,
          heart_rate = $3,
          respiratory_rate = $4,
          temperature = $5,
          oxygen_saturation = $6,
          blood_sugar = $7,
          cholesterol_total = $8,
          cholesterol_hdl = $9,
          cholesterol_ldl = $10,
          triglycerides = $11,
          symptoms = $12,
          notes = $13
      WHERE id = $14
      RETURNING *
    `;

    const values = [
      blood_pressure_systolic, blood_pressure_diastolic,
      heart_rate, respiratory_rate, temperature,
      oxygen_saturation, blood_sugar, cholesterol_total,
      cholesterol_hdl, cholesterol_ldl, triglycerides,
      symptoms, notes, id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

export default ClinicalRecord;