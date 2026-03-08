import pool from '../config/database.js';
import bcrypt from 'bcrypt';

class PatientController {
  
  // ==================== DASHBOARD ====================

  static async getDashboardStats(req, res) {
    try {
      const patientId = req.user.id;
      console.log('📊 Fetching patient dashboard for user:', patientId);

      // Get patient details
      const patient = await pool.query(`
        SELECT 
          p.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          p.date_of_birth,
          p.gender,
          p.blood_group,
          p.height,
          p.weight,
          p.allergies,
          p.chronic_conditions,
          p.primary_doctor_id,
          EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age,
          d.first_name as doctor_first_name,
          d.last_name as doctor_last_name
        FROM patients p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN users d ON p.primary_doctor_id = d.id
        WHERE u.id = $1
      `, [patientId]);

      if (patient.rows.length === 0) {
        return res.status(404).json({ error: 'Patient record not found' });
      }

      // Get recent clinical records
      const recentRecords = await pool.query(`
        SELECT 
          cr.*,
          u.first_name || ' ' || u.last_name as recorded_by_name
        FROM clinical_records cr
        JOIN users u ON cr.recorded_by = u.id
        WHERE cr.patient_id = $1
        ORDER BY cr.record_date DESC
        LIMIT 5
      `, [patient.rows[0].id]);

      // Get recent diagnoses
      const recentDiagnoses = await pool.query(`
        SELECT 
          d.*,
          u.first_name || ' ' || u.last_name as doctor_name
        FROM diagnoses d
        JOIN users u ON d.doctor_id = u.id
        WHERE d.patient_id = $1
        ORDER BY d.created_at DESC
        LIMIT 5
      `, [patient.rows[0].id]);

      // Get recent predictions
      const recentPredictions = await pool.query(`
        SELECT 
          p.*,
          cr.record_date
        FROM predictions p
        JOIN clinical_records cr ON p.clinical_record_id = cr.id
        WHERE p.patient_id = $1
        ORDER BY p.created_at DESC
        LIMIT 5
      `, [patient.rows[0].id]);

      // Get upcoming appointments (mock data for now)
      const upcomingAppointments = [
        {
          id: '1',
          doctor_name: 'Dr. Sarah Chen',
          specialty: 'Cardiology',
          date: new Date(Date.now() + 2 * 86400000).toISOString(),
          time: '10:30 AM',
          type: 'Follow-up',
          status: 'confirmed'
        },
        {
          id: '2',
          doctor_name: 'Dr. Michael Rodriguez',
          specialty: 'Endocrinology',
          date: new Date(Date.now() + 7 * 86400000).toISOString(),
          time: '02:15 PM',
          type: 'Consultation',
          status: 'scheduled'
        }
      ];

      // Get lab results summary
      const labResults = await pool.query(`
        SELECT 
          COUNT(*) as total_labs,
          MAX(record_date) as latest_lab_date
        FROM clinical_records
        WHERE patient_id = $1 AND blood_sugar IS NOT NULL
      `, [patient.rows[0].id]);

      res.json({
        patient_info: patient.rows[0],
        records_count: recentRecords.rows.length,
        diagnoses_count: recentDiagnoses.rows.length,
        predictions_count: recentPredictions.rows.length,
        recent_records: recentRecords.rows,
        recent_diagnoses: recentDiagnoses.rows,
        recent_predictions: recentPredictions.rows,
        upcoming_appointments: upcomingAppointments,
        lab_summary: {
          total: parseInt(labResults.rows[0]?.total_labs || 0),
          latest: labResults.rows[0]?.latest_lab_date || null
        },
        last_visit: recentRecords.rows[0]?.record_date || null
      });

    } catch (error) {
      console.error('❌ Patient dashboard error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch dashboard data',
        details: error.message 
      });
    }
  }

  // ==================== PROFILE MANAGEMENT ====================

  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      console.log('👤 Fetching patient profile for user:', userId);

      const profile = await pool.query(`
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
          u.created_at as member_since,
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
          d.email as doctor_email,
          sd.specialization as doctor_specialization,
          EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age
        FROM users u
        LEFT JOIN patients p ON u.id = p.user_id
        LEFT JOIN users d ON p.primary_doctor_id = d.id
        LEFT JOIN staff_details sd ON d.id = sd.user_id
        WHERE u.id = $1
      `, [userId]);

      if (profile.rows.length === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json(profile.rows[0]);

    } catch (error) {
      console.error('❌ Get profile error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch profile',
        details: error.message 
      });
    }
  }

  static async updateProfile(req, res) {
    const client = await pool.connect();
    
    try {
      const userId = req.user.id;
      const profileData = req.body;

      console.log('📝 Updating patient profile for user:', userId);

      await client.query('BEGIN');

      // Update user basic info
      await client.query(`
        UPDATE users 
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            phone = COALESCE($3, phone)
        WHERE id = $4
      `, [
        profileData.first_name,
        profileData.last_name,
        profileData.phone,
        userId
      ]);

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
            chronic_conditions = COALESCE($12, chronic_conditions)
        WHERE user_id = $13
      `, [
        profileData.date_of_birth,
        profileData.gender,
        profileData.blood_group,
        profileData.emergency_contact,
        profileData.address,
        profileData.city,
        profileData.state,
        profileData.zip_code,
        profileData.height ? parseFloat(profileData.height) : null,
        profileData.weight ? parseFloat(profileData.weight) : null,
        profileData.allergies,
        profileData.chronic_conditions,
        userId
      ]);

      await client.query('COMMIT');

      // Fetch updated profile
      const updatedProfile = await client.query(`
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
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
          p.chronic_conditions
        FROM users u
        LEFT JOIN patients p ON u.id = p.user_id
        WHERE u.id = $1
      `, [userId]);

      res.json({
        message: 'Profile updated successfully',
        profile: updatedProfile.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Update profile error:', error);
      res.status(500).json({ 
        error: 'Failed to update profile',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  // ==================== MEDICAL RECORDS ====================

  static async getMyClinicalRecords(req, res) {
    try {
      const userId = req.user.id;
      console.log('📋 Fetching clinical records for patient user:', userId);

      // Get patient ID
      const patient = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [userId]
      );

      if (patient.rows.length === 0) {
        return res.status(404).json({ error: 'Patient record not found' });
      }

      const patientId = patient.rows[0].id;

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

  static async getMyDiagnoses(req, res) {
    try {
      const userId = req.user.id;
      console.log('🔍 Fetching diagnoses for patient user:', userId);

      // Get patient ID
      const patient = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [userId]
      );

      if (patient.rows.length === 0) {
        return res.status(404).json({ error: 'Patient record not found' });
      }

      const patientId = patient.rows[0].id;

      const diagnoses = await pool.query(`
        SELECT 
          d.*,
          u.first_name || ' ' || u.last_name as doctor_name,
          sd.specialization as doctor_specialization
        FROM diagnoses d
        JOIN users u ON d.doctor_id = u.id
        LEFT JOIN staff_details sd ON u.id = sd.user_id
        WHERE d.patient_id = $1
        ORDER BY d.created_at DESC
      `, [patientId]);

      res.json(diagnoses.rows);

    } catch (error) {
      console.error('❌ Get diagnoses error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch diagnoses',
        details: error.message 
      });
    }
  }

  static async getMyPredictions(req, res) {
    try {
      const userId = req.user.id;
      console.log('🤖 Fetching predictions for patient user:', userId);

      // Get patient ID
      const patient = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [userId]
      );

      if (patient.rows.length === 0) {
        return res.status(404).json({ error: 'Patient record not found' });
      }

      const patientId = patient.rows[0].id;

      const predictions = await pool.query(`
        SELECT 
          p.*,
          cr.record_date,
          EXTRACT(YEAR FROM AGE(pt.date_of_birth)) as age,
          pt.gender,
          pt.blood_group
        FROM predictions p
        JOIN clinical_records cr ON p.clinical_record_id = cr.id
        JOIN patients pt ON p.patient_id = pt.id
        WHERE p.patient_id = $1
        ORDER BY p.created_at DESC
      `, [patientId]);

      // Parse JSON fields
      const formattedPredictions = predictions.rows.map(pred => ({
        ...pred,
        recommendations: typeof pred.recommendations === 'string' 
          ? JSON.parse(pred.recommendations) 
          : pred.recommendations || [],
        prediction_data: typeof pred.prediction_data === 'string'
          ? JSON.parse(pred.prediction_data)
          : pred.prediction_data || {}
      }));

      res.json(formattedPredictions);

    } catch (error) {
      console.error('❌ Get predictions error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch predictions',
        details: error.message 
      });
    }
  }

  static async getLatestPrediction(req, res) {
    try {
      const userId = req.user.id;
      console.log('⚡ Fetching latest prediction for patient user:', userId);

      // Get patient ID
      const patient = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [userId]
      );

      if (patient.rows.length === 0) {
        return res.status(404).json({ error: 'Patient record not found' });
      }

      const patientId = patient.rows[0].id;

      const prediction = await pool.query(`
        SELECT 
          p.*,
          cr.record_date,
          EXTRACT(YEAR FROM AGE(pt.date_of_birth)) as age,
          pt.gender,
          pt.blood_group
        FROM predictions p
        JOIN clinical_records cr ON p.clinical_record_id = cr.id
        JOIN patients pt ON p.patient_id = pt.id
        WHERE p.patient_id = $1
        ORDER BY p.created_at DESC
        LIMIT 1
      `, [patientId]);

      if (prediction.rows.length === 0) {
        return res.status(404).json({ error: 'No predictions found' });
      }

      const pred = prediction.rows[0];
      
      // Parse JSON fields
      const formattedPrediction = {
        ...pred,
        recommendations: typeof pred.recommendations === 'string' 
          ? JSON.parse(pred.recommendations) 
          : pred.recommendations || [],
        prediction_data: typeof pred.prediction_data === 'string'
          ? JSON.parse(pred.prediction_data)
          : pred.prediction_data || {}
      };

      res.json(formattedPrediction);

    } catch (error) {
      console.error('❌ Get latest prediction error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch latest prediction',
        details: error.message 
      });
    }
  }

  // ==================== APPOINTMENT MANAGEMENT ====================

  static async getMyAppointments(req, res) {
    try {
      const userId = req.user.id;
      console.log('📅 Fetching appointments for patient user:', userId);

      // This would be replaced with actual appointments table
      // For now, return mock data
      const appointments = [
        {
          id: '1',
          doctor_name: 'Dr. Sarah Chen',
          specialty: 'Cardiology',
          date: new Date(Date.now() + 2 * 86400000).toISOString(),
          time: '10:30 AM',
          duration: '30 min',
          type: 'Follow-up',
          status: 'confirmed',
          location: 'Room 302, Cardiology Wing',
          notes: 'Please bring your latest blood pressure readings'
        },
        {
          id: '2',
          doctor_name: 'Dr. Michael Rodriguez',
          specialty: 'Endocrinology',
          date: new Date(Date.now() + 7 * 86400000).toISOString(),
          time: '02:15 PM',
          duration: '45 min',
          type: 'Consultation',
          status: 'scheduled',
          location: 'Room 105, Diabetes Center',
          notes: 'Fast for 8 hours before appointment'
        },
        {
          id: '3',
          doctor_name: 'Dr. Emily Thompson',
          specialty: 'Internal Medicine',
          date: new Date(Date.now() - 7 * 86400000).toISOString(),
          time: '11:00 AM',
          duration: '30 min',
          type: 'Check-up',
          status: 'completed',
          location: 'Room 210',
          notes: 'Annual physical examination'
        }
      ];

      res.json(appointments);

    } catch (error) {
      console.error('❌ Get appointments error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch appointments',
        details: error.message 
      });
    }
  }

  static async createAppointment(req, res) {
    const client = await pool.connect();
    
    try {
      const userId = req.user.id;
      const appointmentData = req.body;

      console.log('📝 Creating appointment for patient user:', userId);
      console.log('Appointment data:', appointmentData);

      // Validate required fields
      if (!appointmentData.doctor_id || !appointmentData.date || !appointmentData.time) {
        return res.status(400).json({ error: 'Doctor, date, and time are required' });
      }

      // This would insert into appointments table
      // For now, return mock success
      await client.query('BEGIN');

      // Mock appointment creation
      const newAppointment = {
        id: Math.floor(Math.random() * 1000).toString(),
        ...appointmentData,
        status: 'scheduled',
        created_at: new Date().toISOString()
      };

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Appointment created successfully',
        appointment: newAppointment
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Create appointment error:', error);
      res.status(500).json({ 
        error: 'Failed to create appointment',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  static async cancelAppointment(req, res) {
    const client = await pool.connect();
    
    try {
      const { appointmentId } = req.params;
      const userId = req.user.id;

      console.log(`❌ Cancelling appointment ${appointmentId} for patient user:`, userId);

      await client.query('BEGIN');

      // This would update appointment status in database
      // For now, return mock success

      await client.query('COMMIT');

      res.json({
        message: 'Appointment cancelled successfully',
        appointmentId
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Cancel appointment error:', error);
      res.status(500).json({ 
        error: 'Failed to cancel appointment',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  static async rescheduleAppointment(req, res) {
    const client = await pool.connect();
    
    try {
      const { appointmentId } = req.params;
      const userId = req.user.id;
      const { new_date, new_time } = req.body;

      console.log(`🔄 Rescheduling appointment ${appointmentId} for patient user:`, userId);
      console.log('New date/time:', { new_date, new_time });

      if (!new_date || !new_time) {
        return res.status(400).json({ error: 'New date and time are required' });
      }

      await client.query('BEGIN');

      // This would update appointment in database
      // For now, return mock success

      await client.query('COMMIT');

      res.json({
        message: 'Appointment rescheduled successfully',
        appointmentId,
        new_date,
        new_time
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Reschedule appointment error:', error);
      res.status(500).json({ 
        error: 'Failed to reschedule appointment',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  // ==================== MESSAGES ====================

  static async getMyMessages(req, res) {
    try {
      const userId = req.user.id;
      console.log('💬 Fetching messages for patient user:', userId);

      // Mock messages data
      const messages = [
        {
          id: '1',
          from: 'Dr. Sarah Chen',
          from_id: 'doctor-1',
          subject: 'Your recent lab results',
          content: 'Your blood work came back normal. Continue with your current medications.',
          date: new Date(Date.now() - 2 * 86400000).toISOString(),
          read: true,
          attachments: []
        },
        {
          id: '2',
          from: 'Dr. Michael Rodriguez',
          from_id: 'doctor-2',
          subject: 'Appointment reminder',
          content: 'Reminder: You have an appointment tomorrow at 10:30 AM.',
          date: new Date(Date.now() - 1 * 86400000).toISOString(),
          read: false,
          attachments: []
        },
        {
          id: '3',
          from: 'Nurse Wilson',
          from_id: 'nurse-1',
          subject: 'Vital signs check',
          content: 'Please upload your blood pressure readings from this week.',
          date: new Date(Date.now() - 3 * 86400000).toISOString(),
          read: true,
          attachments: []
        }
      ];

      res.json(messages);

    } catch (error) {
      console.error('❌ Get messages error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch messages',
        details: error.message 
      });
    }
  }

  static async sendMessage(req, res) {
    const client = await pool.connect();
    
    try {
      const userId = req.user.id;
      const { to_id, subject, content } = req.body;

      console.log('📝 Sending message from patient user:', userId);
      console.log('To:', to_id, 'Subject:', subject);

      if (!to_id || !subject || !content) {
        return res.status(400).json({ error: 'Recipient, subject, and content are required' });
      }

      await client.query('BEGIN');

      // This would insert message into database
      // For now, return mock success

      const newMessage = {
        id: Math.floor(Math.random() * 1000).toString(),
        from_id: userId,
        to_id,
        subject,
        content,
        date: new Date().toISOString(),
        read: false
      };

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Message sent successfully',
        message_data: newMessage
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Send message error:', error);
      res.status(500).json({ 
        error: 'Failed to send message',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  static async markMessageAsRead(req, res) {
    const client = await pool.connect();
    
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      console.log(`✅ Marking message ${messageId} as read for patient user:`, userId);

      await client.query('BEGIN');

      // This would update message status in database
      // For now, return mock success

      await client.query('COMMIT');

      res.json({
        message: 'Message marked as read',
        messageId
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Mark message error:', error);
      res.status(500).json({ 
        error: 'Failed to mark message',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  // ==================== DOCTOR INFORMATION ====================

  static async getMyDoctor(req, res) {
    try {
      const userId = req.user.id;
      console.log('👨‍⚕️ Fetching primary doctor for patient user:', userId);

      const doctor = await pool.query(`
        SELECT 
          d.id,
          d.first_name,
          d.last_name,
          d.email,
          d.phone,
          sd.specialization,
          sd.department,
          sd.license_number,
          sd.experience_years,
          sd.qualification,
          (
            SELECT COUNT(*) 
            FROM patients 
            WHERE primary_doctor_id = d.id
          ) as total_patients
        FROM patients p
        JOIN users d ON p.primary_doctor_id = d.id
        LEFT JOIN staff_details sd ON d.id = sd.user_id
        WHERE p.user_id = $1
      `, [userId]);

      if (doctor.rows.length === 0) {
        return res.status(404).json({ error: 'No primary doctor assigned' });
      }

      res.json(doctor.rows[0]);

    } catch (error) {
      console.error('❌ Get doctor error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch doctor information',
        details: error.message 
      });
    }
  }

  // ==================== LAB RESULTS ====================

  static async getMyLabResults(req, res) {
    try {
      const userId = req.user.id;
      console.log('🧪 Fetching lab results for patient user:', userId);

      // Get patient ID
      const patient = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [userId]
      );

      if (patient.rows.length === 0) {
        return res.status(404).json({ error: 'Patient record not found' });
      }

      const patientId = patient.rows[0].id;

      const labResults = await pool.query(`
        SELECT 
          cr.id,
          cr.record_date,
          cr.blood_sugar,
          cr.cholesterol_total,
          cr.cholesterol_hdl,
          cr.cholesterol_ldl,
          cr.triglycerides,
          u.first_name || ' ' || u.last_name as ordered_by
        FROM clinical_records cr
        JOIN users u ON cr.recorded_by = u.id
        WHERE cr.patient_id = $1 
          AND (cr.blood_sugar IS NOT NULL 
               OR cr.cholesterol_total IS NOT NULL
               OR cr.cholesterol_hdl IS NOT NULL
               OR cr.cholesterol_ldl IS NOT NULL
               OR cr.triglycerides IS NOT NULL)
        ORDER BY cr.record_date DESC
      `, [patientId]);

      res.json(labResults.rows);

    } catch (error) {
      console.error('❌ Get lab results error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch lab results',
        details: error.message 
      });
    }
  }

  // ==================== PRESCRIPTIONS ====================

  static async getMyPrescriptions(req, res) {
    try {
      const userId = req.user.id;
      console.log('💊 Fetching prescriptions for patient user:', userId);

      // Get patient ID
      const patient = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [userId]
      );

      if (patient.rows.length === 0) {
        return res.status(404).json({ error: 'Patient record not found' });
      }

      const patientId = patient.rows[0].id;

      const prescriptions = await pool.query(`
        SELECT 
          d.id,
          d.diagnosis,
          d.prescription,
          d.created_at as prescribed_date,
          d.follow_up_date,
          u.first_name || ' ' || u.last_name as prescribed_by,
          sd.specialization as doctor_specialization
        FROM diagnoses d
        JOIN users u ON d.doctor_id = u.id
        LEFT JOIN staff_details sd ON u.id = sd.user_id
        WHERE d.patient_id = $1 AND d.prescription IS NOT NULL
        ORDER BY d.created_at DESC
      `, [patientId]);

      res.json(prescriptions.rows);

    } catch (error) {
      console.error('❌ Get prescriptions error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch prescriptions',
        details: error.message 
      });
    }
  }
}

export default PatientController;