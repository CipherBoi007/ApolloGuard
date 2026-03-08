import pool from '../config/database.js';

class Patient {
  static async create(patientData) {
    const {
      user_id, date_of_birth, gender, blood_group,
      emergency_contact, address, city, state, zip_code,
      height, weight, allergies, chronic_conditions
    } = patientData;

    const query = `
      INSERT INTO patients (
        user_id, date_of_birth, gender, blood_group,
        emergency_contact, address, city, state, zip_code,
        height, weight, allergies, chronic_conditions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      user_id, date_of_birth, gender, blood_group,
      emergency_contact, address, city, state, zip_code,
      height, weight, allergies, chronic_conditions
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT p.*, u.email, u.first_name, u.last_name, u.phone
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT p.*, u.email, u.first_name, u.last_name, u.phone
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      SELECT p.*, u.email, u.first_name, u.last_name, u.phone, u.created_at
      FROM patients p
      JOIN users u ON p.user_id = u.id
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(id, patientData) {
    const {
      date_of_birth, gender, blood_group, emergency_contact,
      address, city, state, zip_code, height, weight,
      allergies, chronic_conditions
    } = patientData;

    const query = `
      UPDATE patients
      SET date_of_birth = $1, gender = $2, blood_group = $3,
          emergency_contact = $4, address = $5, city = $6,
          state = $7, zip_code = $8, height = $9, weight = $10,
          allergies = $11, chronic_conditions = $12
      WHERE id = $13
      RETURNING *
    `;

    const values = [
      date_of_birth, gender, blood_group, emergency_contact,
      address, city, state, zip_code, height, weight,
      allergies, chronic_conditions, id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getClinicalRecords(patientId) {
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
}

export default Patient;