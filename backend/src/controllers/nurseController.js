import User from '../models/User.js';
import Patient from '../models/Patient.js';
import ClinicalRecord from '../models/ClinicalRecord.js';
import pool from '../config/database.js';

class NurseController {
  // ==================== PATIENT MANAGEMENT ====================

  static async createPatient(req, res) {
  const client = await pool.connect();
  
  try {
    const patientData = req.body;
    
    console.log('👩‍⚕️ Creating new patient by nurse:', req.user.id);
    console.log('Patient data:', patientData);

    // Validate required fields
    if (!patientData.email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!patientData.first_name || !patientData.last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [patientData.email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const password = patientData.password || 'Patient@123';
    const bcrypt = (await import('bcrypt')).default;
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with patient role
    const newUser = await client.query(`
      INSERT INTO users (
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role, 
        phone, 
        is_active,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, email, first_name, last_name, role, phone, created_at
    `, [
      patientData.email,
      passwordHash,
      patientData.first_name,
      patientData.last_name,
      'patient',
      patientData.phone || null,
      true
    ]);

    // Handle doctor assignment
    let doctorId = null;
    if (patientData.primary_doctor_id) {
      const doctorCheck = await client.query(`
        SELECT id FROM users 
        WHERE id = $1 AND role = 'doctor'
      `, [patientData.primary_doctor_id]);

      if (doctorCheck.rows.length > 0) {
        doctorId = patientData.primary_doctor_id;
      }
    }

    // If no valid doctor provided, assign to first available doctor
    if (!doctorId) {
      const defaultDoctor = await client.query(`
        SELECT id FROM users 
        WHERE role = 'doctor' AND is_active = true
        ORDER BY created_at
        LIMIT 1
      `);

      if (defaultDoctor.rows.length > 0) {
        doctorId = defaultDoctor.rows[0].id;
      }
    }

    // Create patient record - NO created_at field here
    const patient = await client.query(`
      INSERT INTO patients (
        user_id,
        primary_doctor_id,
        date_of_birth,
        gender,
        blood_group,
        emergency_contact,
        address,
        city,
        state,
        zip_code,
        height,
        weight,
        allergies,
        chronic_conditions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      newUser.rows[0].id,
      doctorId,
      patientData.date_of_birth || null,
      patientData.gender || null,
      patientData.blood_group || null,
      patientData.emergency_contact || null,
      patientData.address || null,
      patientData.city || null,
      patientData.state || null,
      patientData.zip_code || null,
      patientData.height ? parseFloat(patientData.height) : null,
      patientData.weight ? parseFloat(patientData.weight) : null,
      patientData.allergies || null,
      patientData.chronic_conditions || null
    ]);

    await client.query('COMMIT');

    // Get doctor name for response
    const doctorInfo = doctorId ? await client.query(`
      SELECT first_name, last_name 
      FROM users 
      WHERE id = $1
    `, [doctorId]) : { rows: [] };

    res.status(201).json({
      message: 'Patient created successfully',
      patient: {
        ...newUser.rows[0],
        patient_details: patient.rows[0],
        primary_doctor: doctorInfo.rows[0] ? 
          `Dr. ${doctorInfo.rows[0].first_name} ${doctorInfo.rows[0].last_name}` : 
          'Not assigned'
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Create patient error:', error);
    
    res.status(500).json({ 
      error: 'Failed to create patient',
      details: error.message
    });
  } finally {
    client.release();
  }
}

static async getAllPatients(req, res) {
  try {
    const patients = await pool.query(`
      SELECT 
        p.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        u.created_at as patient_since,  -- Get created_at from users table
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.emergency_contact,
        p.address,
        p.city,
        p.state,
        p.zip_code,
        p.height,
        p.weight,
        p.allergies,
        p.chronic_conditions,
        p.primary_doctor_id,
        d.first_name as doctor_first_name,
        d.last_name as doctor_last_name,
        EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age,
        (
          SELECT COUNT(*) 
          FROM clinical_records 
          WHERE patient_id = p.id
        ) as records_count,
        (
          SELECT created_at 
          FROM clinical_records 
          WHERE patient_id = p.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_visit
      FROM patients p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN users d ON p.primary_doctor_id = d.id
      ORDER BY u.created_at DESC
    `);

    res.json(patients.rows);

  } catch (error) {
    console.error('❌ Get patients error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch patients',
      details: error.message 
    });
  }
}

static async getPatientById(req, res) {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching patient by ID:', id);

    const patient = await pool.query(`
      SELECT 
        p.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.emergency_contact,
        p.address,
        p.city,
        p.state,
        p.zip_code,
        p.height,
        p.weight,
        p.allergies,
        p.chronic_conditions,
        p.primary_doctor_id,
        d.first_name as doctor_first_name,
        d.last_name as doctor_last_name,
        EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age
      FROM patients p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN users d ON p.primary_doctor_id = d.id
      WHERE p.id = $1
    `, [id]);

    if (patient.rows.length === 0) {
      console.log('❌ Patient not found:', id);
      return res.status(404).json({ error: 'Patient not found' });
    }

    console.log('✅ Patient found:', patient.rows[0].first_name, patient.rows[0].last_name);
    res.json(patient.rows[0]);

  } catch (error) {
    console.error('❌ Get patient error - DETAILS:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch patient',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

  static async updatePatient(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      const patientData = req.body;

      await client.query('BEGIN');

      // Get user_id from patient
      const patientInfo = await client.query(
        'SELECT user_id FROM patients WHERE id = $1',
        [id]
      );

      if (patientInfo.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Patient not found' });
      }

      const userId = patientInfo.rows[0].user_id;

      // Update user basic info
      await client.query(`
        UPDATE users 
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            phone = COALESCE($3, phone),
            is_active = COALESCE($4, is_active)
        WHERE id = $5
      `, [
        patientData.first_name,
        patientData.last_name,
        patientData.phone,
        patientData.is_active,
        userId
      ]);

      // Handle doctor reassignment if provided
      let doctorId = patientData.primary_doctor_id;
      if (doctorId) {
        const doctorCheck = await client.query(`
          SELECT id FROM users 
          WHERE id = $1 AND role = 'doctor'
        `, [doctorId]);

        if (doctorCheck.rows.length === 0) {
          doctorId = null;
        }
      }

      // Update patient details
      await client.query(`
        UPDATE patients
        SET date_of_birth = COALESCE($1, date_of_birth),
            gender = COALESCE($2, gender),
            blood_group = COALESCE($3, blood_group),
            emergency_contact = COALESCE($4, emergency_contact),
            address = COALESCE($5, address),
            city = COALESCE($6, city),
            state = COALESCE($7, state),
            zip_code = COALESCE($8, zip_code),
            height = COALESCE($9, height),
            weight = COALESCE($10, weight),
            allergies = COALESCE($11, allergies),
            chronic_conditions = COALESCE($12, chronic_conditions),
            primary_doctor_id = COALESCE($13, primary_doctor_id)
        WHERE id = $14
      `, [
        patientData.date_of_birth,
        patientData.gender,
        patientData.blood_group,
        patientData.emergency_contact,
        patientData.address,
        patientData.city,
        patientData.state,
        patientData.zip_code,
        patientData.height ? parseFloat(patientData.height) : null,
        patientData.weight ? parseFloat(patientData.weight) : null,
        patientData.allergies,
        patientData.chronic_conditions,
        doctorId,
        id
      ]);

      await client.query('COMMIT');

      res.json({ 
        message: 'Patient updated successfully' 
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Update patient error:', error);
      res.status(500).json({ 
        error: 'Failed to update patient',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  static async deletePatient(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;

      await client.query('BEGIN');

      // Get user_id from patient
      const patientResult = await client.query(
        'SELECT user_id FROM patients WHERE id = $1',
        [id]
      );

      if (patientResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Patient not found' });
      }

      const userId = patientResult.rows[0].user_id;

      // Delete patient (will cascade to related records)
      await client.query('DELETE FROM patients WHERE id = $1', [id]);
      
      // Delete user
      await client.query('DELETE FROM users WHERE id = $1', [userId]);

      await client.query('COMMIT');

      res.json({ 
        message: 'Patient deleted successfully' 
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Delete patient error:', error);
      res.status(500).json({ 
        error: 'Failed to delete patient',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  // ==================== DOCTOR MANAGEMENT FOR ASSIGNMENT ====================

  static async getAvailableDoctors(req, res) {
    try {
      const doctors = await pool.query(`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          sd.specialization,
          sd.department,
          COUNT(p.id) as patient_count
        FROM users u
        LEFT JOIN staff_details sd ON u.id = sd.user_id
        LEFT JOIN patients p ON p.primary_doctor_id = u.id
        WHERE u.role = 'doctor' AND u.is_active = true
        GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, 
                 sd.specialization, sd.department
        ORDER BY u.last_name, u.first_name
      `);

      res.json(doctors.rows);

    } catch (error) {
      console.error('❌ Get doctors error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch doctors',
        details: error.message 
      });
    }
  }

static async assignDoctorToPatient(req, res) {
  const client = await pool.connect();
  
  try {
    const { patientId, doctorId } = req.params;

    console.log('📝 Assigning doctor to patient:', { patientId, doctorId });

    await client.query('BEGIN');

    // Verify patient exists
    const patient = await client.query(
      'SELECT id, primary_doctor_id FROM patients WHERE id = $1',
      [patientId]
    );

    if (patient.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Verify doctor exists and is actually a doctor
    const doctor = await client.query(`
      SELECT id, first_name, last_name FROM users 
      WHERE id = $1 AND role = 'doctor' AND is_active = true
    `, [doctorId]);

    if (doctor.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Doctor not found or inactive' });
    }

    // Get old doctor for logging (optional)
    const oldDoctorId = patient.rows[0].primary_doctor_id;

    // Assign doctor to patient
    await client.query(`
      UPDATE patients 
      SET primary_doctor_id = $1 
      WHERE id = $2
    `, [doctorId, patientId]);

    await client.query('COMMIT');

    console.log(`✅ Doctor reassigned: Patient ${patientId} from ${oldDoctorId || 'none'} to ${doctorId}`);

    res.json({
      message: 'Doctor assigned successfully',
      patientId,
      doctorId,
      doctorName: `Dr. ${doctor.rows[0].first_name} ${doctor.rows[0].last_name}`,
      previousDoctorId: oldDoctorId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Assign doctor error:', error);
    res.status(500).json({ 
      error: 'Failed to assign doctor',
      details: error.message 
    });
  } finally {
    client.release();
  }
}

  // ==================== CLINICAL RECORDS MANAGEMENT ====================

  static async createClinicalRecord(req, res) {
  const client = await pool.connect();
  
  try {
    const { patientId } = req.params;
    const recordData = req.body;

    console.log('📝 Creating clinical record for patient:', patientId);
    console.log('Record data:', recordData);

    // Verify patient exists
    const patient = await client.query(
      'SELECT id FROM patients WHERE id = $1',
      [patientId]
    );

    if (patient.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Helper function to safely parse numeric values
    const safeParseInt = (value) => {
      if (value === null || value === undefined || value === '') return null;
      const parsed = parseInt(value);
      return isNaN(parsed) ? null : parsed;
    };

    const safeParseFloat = (value) => {
      if (value === null || value === undefined || value === '') return null;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    };

    // Insert clinical record
    const result = await client.query(`
      INSERT INTO clinical_records (
        patient_id,
        recorded_by,
        record_date,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        heart_rate,
        respiratory_rate,
        temperature,
        oxygen_saturation,
        blood_sugar,
        cholesterol_total,
        cholesterol_hdl,
        cholesterol_ldl,
        triglycerides,
        symptoms,
        notes
      )
      VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      patientId,
      req.user.id,
      safeParseInt(recordData.blood_pressure_systolic),
      safeParseInt(recordData.blood_pressure_diastolic),
      safeParseInt(recordData.heart_rate),
      safeParseInt(recordData.respiratory_rate),
      safeParseFloat(recordData.temperature),
      safeParseInt(recordData.oxygen_saturation),
      safeParseFloat(recordData.blood_sugar),
      safeParseFloat(recordData.cholesterol_total),
      safeParseFloat(recordData.cholesterol_hdl),
      safeParseFloat(recordData.cholesterol_ldl),
      safeParseFloat(recordData.triglycerides),
      recordData.symptoms || null,
      recordData.notes || null
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Clinical record created successfully',
      clinical_record: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Create clinical record error:', error);
    res.status(500).json({ 
      error: 'Failed to create clinical record',
      details: error.message 
    });
  } finally {
    client.release();
  }
}

  static async getPatientClinicalRecords(req, res) {
    try {
      const { patientId } = req.params;

      const records = await pool.query(`
        SELECT 
          cr.*,
          u.first_name || ' ' || u.last_name as recorded_by_name
        FROM clinical_records cr
        JOIN users u ON cr.recorded_by = u.id
        WHERE cr.patient_id = $1
        ORDER BY cr.record_date DESC
      `, [patientId]);

      res.json(records.rows);

    } catch (error) {
      console.error('❌ Get clinical records error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch clinical records',
        details: error.message 
      });
    }
  }

  static async updateClinicalRecord(req, res) {
    const client = await pool.connect();
    
    try {
      const { recordId } = req.params;
      const recordData = req.body;

      // Helper function to safely parse numeric values
      const safeParseInt = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const parsed = parseInt(value);
        return isNaN(parsed) ? null : parsed;
      };

      const safeParseFloat = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      // Process numeric fields
      const processedData = {
        blood_pressure_systolic: safeParseInt(recordData.blood_pressure_systolic),
        blood_pressure_diastolic: safeParseInt(recordData.blood_pressure_diastolic),
        heart_rate: safeParseInt(recordData.heart_rate),
        respiratory_rate: safeParseInt(recordData.respiratory_rate),
        temperature: safeParseFloat(recordData.temperature),
        oxygen_saturation: safeParseInt(recordData.oxygen_saturation),
        blood_sugar: safeParseFloat(recordData.blood_sugar),
        cholesterol_total: safeParseFloat(recordData.cholesterol_total),
        cholesterol_hdl: safeParseFloat(recordData.cholesterol_hdl),
        cholesterol_ldl: safeParseFloat(recordData.cholesterol_ldl),
        triglycerides: safeParseFloat(recordData.triglycerides),
        symptoms: recordData.symptoms || null,
        notes: recordData.notes || null
      };

      const result = await client.query(`
        UPDATE clinical_records
        SET blood_pressure_systolic = COALESCE($1, blood_pressure_systolic),
            blood_pressure_diastolic = COALESCE($2, blood_pressure_diastolic),
            heart_rate = COALESCE($3, heart_rate),
            respiratory_rate = COALESCE($4, respiratory_rate),
            temperature = COALESCE($5, temperature),
            oxygen_saturation = COALESCE($6, oxygen_saturation),
            blood_sugar = COALESCE($7, blood_sugar),
            cholesterol_total = COALESCE($8, cholesterol_total),
            cholesterol_hdl = COALESCE($9, cholesterol_hdl),
            cholesterol_ldl = COALESCE($10, cholesterol_ldl),
            triglycerides = COALESCE($11, triglycerides),
            symptoms = COALESCE($12, symptoms),
            notes = COALESCE($13, notes)
        WHERE id = $14
        RETURNING *
      `, [
        processedData.blood_pressure_systolic,
        processedData.blood_pressure_diastolic,
        processedData.heart_rate,
        processedData.respiratory_rate,
        processedData.temperature,
        processedData.oxygen_saturation,
        processedData.blood_sugar,
        processedData.cholesterol_total,
        processedData.cholesterol_hdl,
        processedData.cholesterol_ldl,
        processedData.triglycerides,
        processedData.symptoms,
        processedData.notes,
        recordId
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Clinical record not found' });
      }

      await client.query('COMMIT');

      res.json({
        message: 'Clinical record updated successfully',
        clinical_record: result.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Update clinical record error:', error);
      res.status(500).json({ 
        error: 'Failed to update clinical record',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  static async deleteClinicalRecord(req, res) {
    const client = await pool.connect();
    
    try {
      const { recordId } = req.params;

      const result = await client.query(
        'DELETE FROM clinical_records WHERE id = $1 RETURNING id',
        [recordId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Clinical record not found' });
      }

      await client.query('COMMIT');

      res.json({ 
        message: 'Clinical record deleted successfully' 
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Delete clinical record error:', error);
      res.status(500).json({ 
        error: 'Failed to delete clinical record',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  // ==================== DASHBOARD STATS ====================

  static async getDashboardStats(req, res) {
  try {
    const nurseId = req.user.id;

    // Get today's records
    const todayRecords = await pool.query(`
      SELECT COUNT(*) as count
      FROM clinical_records
      WHERE recorded_by = $1
        AND DATE(created_at) = CURRENT_DATE
    `, [nurseId]);

    // Get total patients count
    const patientCount = await pool.query(`
      SELECT COUNT(*) as count FROM patients
    `);

    // Get recent patients (with last visit)
    const recentPatients = await pool.query(`
      SELECT 
        p.id,
        u.first_name,
        u.last_name,
        p.blood_group,
        p.gender,
        EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age,
        (
          SELECT created_at 
          FROM clinical_records 
          WHERE patient_id = p.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_record
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE EXISTS (
        SELECT 1 FROM clinical_records 
        WHERE patient_id = p.id
      )
      ORDER BY last_record DESC NULLS LAST
      LIMIT 5
    `);

    // Get patients without primary doctor
    const unassignedPatients = await pool.query(`
      SELECT COUNT(*) as count
      FROM patients
      WHERE primary_doctor_id IS NULL
    `);

    // Get recent clinical records by this nurse
    const recentRecords = await pool.query(`
      SELECT 
        cr.id,
        cr.created_at,
        u.first_name || ' ' || u.last_name as patient_name
      FROM clinical_records cr
      JOIN patients p ON cr.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE cr.recorded_by = $1
      ORDER BY cr.created_at DESC
      LIMIT 5
    `, [nurseId]);

    res.json({
      today_records: parseInt(todayRecords.rows[0]?.count || 0),
      total_patients: parseInt(patientCount.rows[0]?.count || 0),
      unassigned_patients: parseInt(unassignedPatients.rows[0]?.count || 0),
      recent_patients: recentPatients.rows,
      recent_records: recentRecords.rows
    });

  } catch (error) {
    console.error('❌ Nurse dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: error.message 
    });
  }
}

  // ==================== PATIENT SEARCH ====================

  static async searchPatients(req, res) {
    try {
      const { query } = req.query;

      if (!query || query.length < 2) {
        return res.json([]);
      }

      const patients = await pool.query(`
        SELECT 
          p.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          p.date_of_birth,
          p.blood_group,
          p.primary_doctor_id,
          d.first_name as doctor_first_name,
          d.last_name as doctor_last_name,
          EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age
        FROM patients p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN users d ON p.primary_doctor_id = d.id
        WHERE 
          u.first_name ILIKE $1 OR
          u.last_name ILIKE $1 OR
          u.email ILIKE $1 OR
          u.phone ILIKE $1
        LIMIT 20
      `, [`%${query}%`]);

      res.json(patients.rows);

    } catch (error) {
      console.error('❌ Search patients error:', error);
      res.status(500).json({ 
        error: 'Failed to search patients',
        details: error.message 
      });
    }
  }
}

export default NurseController;