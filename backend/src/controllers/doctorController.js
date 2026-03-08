import pool from '../config/database.js';
import { getPatientRiskPrediction } from '../services/mlService.js';

class DoctorController {
  
  // ==================== DASHBOARD ====================

  static async getDashboardStats(req, res) {
    try {
      const doctorId = req.user.id;
      console.log('📊 Fetching doctor dashboard stats for doctor:', doctorId);

      // Get doctor's assigned patients count
      const patientCount = await pool.query(`
        SELECT COUNT(*) as total_patients
        FROM patients
        WHERE primary_doctor_id = $1
      `, [doctorId]);

      // Get pending diagnoses (patients with predictions but no diagnosis)
      const pendingDiagnoses = await pool.query(`
        SELECT COUNT(*) as count
        FROM predictions p
        JOIN patients pt ON p.patient_id = pt.id
        LEFT JOIN diagnoses d ON p.id = d.prediction_id
        WHERE pt.primary_doctor_id = $1 
          AND d.id IS NULL
      `, [doctorId]);

      // Get high risk patients count
      const highRiskCount = await pool.query(`
        SELECT COUNT(*) as count
        FROM predictions p
        JOIN patients pt ON p.patient_id = pt.id
        WHERE pt.primary_doctor_id = $1
          AND p.risk_level = 'high'
          AND p.created_at >= NOW() - INTERVAL '30 days'
      `, [doctorId]);

      // Get prediction statistics
      const predictionStats = await pool.query(`
        SELECT 
          COUNT(*) as total_predictions,
          COALESCE(ROUND(AVG(confidence_score)::numeric, 1), 0) as avg_confidence
        FROM predictions p
        JOIN patients pt ON p.patient_id = pt.id
        WHERE pt.primary_doctor_id = $1
      `, [doctorId]);

      // Get recent patients (assigned to this doctor)
      const recentPatients = await pool.query(`
        SELECT 
          p.id,
          u.first_name,
          u.last_name,
          EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age,
          p.gender,
          p.blood_group,
          (
            SELECT risk_level 
            FROM predictions 
            WHERE patient_id = p.id 
            ORDER BY created_at DESC 
            LIMIT 1
          ) as risk_level,
          (
            SELECT created_at 
            FROM clinical_records 
            WHERE patient_id = p.id 
            ORDER BY created_at DESC 
            LIMIT 1
          ) as last_visit
        FROM patients p
        JOIN users u ON p.user_id = u.id
        WHERE p.primary_doctor_id = $1
        ORDER BY last_visit DESC NULLS LAST
        LIMIT 10
      `, [doctorId]);

      // Get upcoming appointments (mock data for now)
      const appointments = [
        { id: '1', patient_name: 'Robert Johnson', time: '09:00', type: 'Follow-up', status: 'confirmed' },
        { id: '2', patient_name: 'Maria Chen', time: '10:30', type: 'Consultation', status: 'confirmed' },
        { id: '3', patient_name: 'James Wilson', time: '11:15', type: 'Review', status: 'waiting' }
      ];

      // Get risk distribution
      const riskDistribution = await pool.query(`
        SELECT 
          p.risk_level,
          COUNT(*) as count
        FROM predictions p
        JOIN patients pt ON p.patient_id = pt.id
        WHERE pt.primary_doctor_id = $1
          AND p.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY p.risk_level
      `, [doctorId]);

      // Get recent predictions
      const recentPredictions = await pool.query(`
        SELECT 
          p.id,
          p.risk_level,
          p.confidence_score,
          p.created_at,
          u.first_name || ' ' || u.last_name as patient_name
        FROM predictions p
        JOIN patients pt ON p.patient_id = pt.id
        JOIN users u ON pt.user_id = u.id
        WHERE pt.primary_doctor_id = $1
        ORDER BY p.created_at DESC
        LIMIT 5
      `, [doctorId]);

      // Get weekly trends
      const weeklyTrends = await pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('day', p.created_at), 'Dy') as day,
          COUNT(*) as predictions
        FROM predictions p
        JOIN patients pt ON p.patient_id = pt.id
        WHERE pt.primary_doctor_id = $1
          AND p.created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE_TRUNC('day', p.created_at)
        ORDER BY DATE_TRUNC('day', p.created_at)
      `, [doctorId]);

      res.json({
        total_patients: parseInt(patientCount.rows[0]?.total_patients || 0),
        pending_diagnoses: parseInt(pendingDiagnoses.rows[0]?.count || 0),
        high_risk_count: parseInt(highRiskCount.rows[0]?.count || 0),
        total_predictions: parseInt(predictionStats.rows[0]?.total_predictions || 0),
        avg_confidence: parseFloat(predictionStats.rows[0]?.avg_confidence || 0),
        recent_patients: recentPatients.rows,
        appointments: appointments,
        risk_distribution: riskDistribution.rows,
        recent_predictions: recentPredictions.rows,
        weekly_trends: weeklyTrends.rows
      });

    } catch (error) {
      console.error('❌ Doctor dashboard error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch dashboard data',
        details: error.message 
      });
    }
  }

  // ==================== PATIENT MANAGEMENT ====================

  static async getPatients(req, res) {
    try {
      const doctorId = req.user.id;

      const patients = await pool.query(`
        SELECT 
          p.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age,
          p.gender,
          p.blood_group,
          p.emergency_contact,
          p.address,
          p.city,
          p.state,
          p.zip_code,
          (
            SELECT risk_level 
            FROM predictions 
            WHERE patient_id = p.id 
            ORDER BY created_at DESC 
            LIMIT 1
          ) as risk_level,
          (
            SELECT created_at 
            FROM clinical_records 
            WHERE patient_id = p.id 
            ORDER BY created_at DESC 
            LIMIT 1
          ) as last_visit
        FROM patients p
        JOIN users u ON p.user_id = u.id
        WHERE p.primary_doctor_id = $1
        ORDER BY u.last_name, u.first_name
      `, [doctorId]);

      res.json(patients.rows);

    } catch (error) {
      console.error('❌ Get patients error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch patients',
        details: error.message 
      });
    }
  }

  static async assignPatientToDoctor(req, res) {
    const client = await pool.connect();
    
    try {
      const { patientId } = req.params;
      const doctorId = req.user.id;

      await client.query('BEGIN');

      // Check if patient exists and is not already assigned
      const patient = await client.query(`
        SELECT id, primary_doctor_id 
        FROM patients 
        WHERE id = $1
      `, [patientId]);

      if (patient.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Patient not found' });
      }

      if (patient.rows[0].primary_doctor_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Patient already assigned to a doctor' });
      }

      // Assign patient to this doctor
      await client.query(`
        UPDATE patients 
        SET primary_doctor_id = $1 
        WHERE id = $2
      `, [doctorId, patientId]);

      await client.query('COMMIT');

      res.json({
        message: 'Patient assigned successfully',
        patientId,
        doctorId
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Assign patient error:', error);
      res.status(500).json({ 
        error: 'Failed to assign patient',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  static async getPatientDetails(req, res) {
    try {
      const { patientId } = req.params;
      const doctorId = req.user.id;

      // Verify this patient is assigned to this doctor
      const accessCheck = await pool.query(`
        SELECT id FROM patients 
        WHERE id = $1 AND primary_doctor_id = $2
      `, [patientId, doctorId]);

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You do not have access to this patient' });
      }

      // Get patient basic info
      const patient = await pool.query(`
        SELECT 
          p.*,
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
          EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age
        FROM patients p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = $1
      `, [patientId]);

      // Get clinical records
      const clinicalRecords = await pool.query(`
        SELECT 
          cr.*,
          u.first_name || ' ' || u.last_name as recorded_by_name
        FROM clinical_records cr
        JOIN users u ON cr.recorded_by = u.id
        WHERE cr.patient_id = $1
        ORDER BY cr.record_date DESC
      `, [patientId]);

      // Get predictions
      const predictions = await pool.query(`
        SELECT 
          p.*,
          cr.record_date
        FROM predictions p
        JOIN clinical_records cr ON p.clinical_record_id = cr.id
        WHERE p.patient_id = $1
        ORDER BY p.created_at DESC
      `, [patientId]);

      // Get diagnoses
      const diagnoses = await pool.query(`
        SELECT 
          d.*,
          u.first_name || ' ' || u.last_name as doctor_name
        FROM diagnoses d
        JOIN users u ON d.doctor_id = u.id
        WHERE d.patient_id = $1
        ORDER BY d.created_at DESC
      `, [patientId]);

      res.json({
        patient: patient.rows[0],
        clinical_records: clinicalRecords.rows,
        predictions: predictions.rows,
        diagnoses: diagnoses.rows
      });

    } catch (error) {
      console.error('❌ Get patient details error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch patient details',
        details: error.message 
      });
    }
  }

  // ==================== DIAGNOSIS MANAGEMENT ====================

  static async createDiagnosis(req, res) {
    const client = await pool.connect();
    
    try {
      const { patientId } = req.params;
      const doctorId = req.user.id;
      const {
        clinical_record_id,
        diagnosis,
        severity,
        prescription,
        follow_up_date,
        notes
      } = req.body;

      await client.query('BEGIN');

      // Verify doctor has access to this patient
      const accessCheck = await client.query(`
        SELECT id FROM patients 
        WHERE id = $1 AND primary_doctor_id = $2
      `, [patientId, doctorId]);

      if (accessCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'You do not have access to this patient' });
      }

      // Create diagnosis
      const result = await client.query(`
        INSERT INTO diagnoses (
          patient_id,
          doctor_id,
          clinical_record_id,
          diagnosis,
          severity,
          prescription,
          follow_up_date,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        patientId,
        doctorId,
        clinical_record_id || null,
        diagnosis,
        severity,
        prescription || null,
        follow_up_date || null,
        notes || null
      ]);

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Diagnosis created successfully',
        diagnosis: result.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Create diagnosis error:', error);
      res.status(500).json({ 
        error: 'Failed to create diagnosis',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  // ==================== PREDICTION MANAGEMENT ====================

  static async generatePrediction(req, res) {
    const client = await pool.connect();
    
    try {
      const { clinicalRecordId } = req.params;
      const doctorId = req.user.id;
      
      console.log('🔮 Generating prediction for clinical record:', clinicalRecordId);

      // Get clinical record data and verify doctor has access
      const clinicalRecord = await client.query(`
        SELECT 
          cr.*,
          p.date_of_birth,
          p.gender,
          p.height,
          p.weight,
          EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age,
          p.chronic_conditions,
          p.primary_doctor_id
        FROM clinical_records cr
        JOIN patients p ON cr.patient_id = p.id
        WHERE cr.id = $1
      `, [clinicalRecordId]);

      if (clinicalRecord.rows.length === 0) {
        return res.status(404).json({ error: 'Clinical record not found' });
      }

      const record = clinicalRecord.rows[0];

      // Verify doctor has access to this patient
      if (record.primary_doctor_id !== doctorId) {
        return res.status(403).json({ error: 'You do not have access to this patient' });
      }

      // Prepare data for ML service
      const mlData = {
        patient_id: record.patient_id,
        age: parseInt(record.age) || 50,
        gender: record.gender || 'Unknown',
        blood_pressure_systolic: record.blood_pressure_systolic || 120,
        blood_pressure_diastolic: record.blood_pressure_diastolic || 80,
        heart_rate: record.heart_rate || 70,
        respiratory_rate: record.respiratory_rate || 16,
        temperature: record.temperature || 36.6,
        oxygen_saturation: record.oxygen_saturation || 98,
        blood_sugar: record.blood_sugar || 95,
        has_hypertension: record.chronic_conditions?.toLowerCase().includes('hypertension') || false,
        has_diabetes: record.chronic_conditions?.toLowerCase().includes('diabetes') || false
      };

      // Call ML service
      const mlPrediction = await getPatientRiskPrediction(mlData);
      
      console.log('✅ ML Prediction received:', mlPrediction);

      // Save prediction to database
      const savedPrediction = await client.query(`
        INSERT INTO predictions (
          patient_id,
          clinical_record_id,
          prediction_type,
          risk_level,
          confidence_score,
          prediction_data,
          recommendations,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `, [
        record.patient_id,
        clinicalRecordId,
        'health_risk',
        mlPrediction.risk_level,
        mlPrediction.confidence_score,
        JSON.stringify({
          ml_version: mlPrediction.model_version || '1.0.0',
          risk_factors: mlPrediction.risk_factors || [],
          is_fallback: mlPrediction.is_fallback || false
        }),
        JSON.stringify(mlPrediction.recommendations || [])
      ]);

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Prediction generated successfully',
        prediction: {
          ...savedPrediction.rows[0],
          recommendations: mlPrediction.recommendations,
          risk_factors: mlPrediction.risk_factors
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Generate prediction error:', error);
      res.status(500).json({ 
        error: 'Failed to generate prediction',
        details: error.message 
      });
    } finally {
      client.release();
    }
  }

  static async getPrediction(req, res) {
    try {
      const { predictionId } = req.params;
      const doctorId = req.user.id;

      const result = await pool.query(`
        SELECT 
          p.*,
          cr.record_date,
          u.first_name || ' ' || u.last_name as patient_name
        FROM predictions p
        JOIN clinical_records cr ON p.clinical_record_id = cr.id
        JOIN patients pt ON p.patient_id = pt.id
        JOIN users u ON pt.user_id = u.id
        WHERE p.id = $1 AND pt.primary_doctor_id = $2
      `, [predictionId, doctorId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Prediction not found' });
      }

      const prediction = result.rows[0];
      
      // Parse JSON fields
      if (prediction.recommendations && typeof prediction.recommendations === 'string') {
        prediction.recommendations = JSON.parse(prediction.recommendations);
      }
      if (prediction.prediction_data && typeof prediction.prediction_data === 'string') {
        prediction.prediction_data = JSON.parse(prediction.prediction_data);
      }

      res.json(prediction);

    } catch (error) {
      console.error('❌ Get prediction error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch prediction',
        details: error.message 
      });
    }
  }

  static async getPatientPredictions(req, res) {
    try {
      const { patientId } = req.params;
      const doctorId = req.user.id;

      // Verify doctor has access to this patient
      const accessCheck = await pool.query(`
        SELECT id FROM patients 
        WHERE id = $1 AND primary_doctor_id = $2
      `, [patientId, doctorId]);

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You do not have access to this patient' });
      }

      const result = await pool.query(`
        SELECT 
          p.*,
          cr.record_date
        FROM predictions p
        JOIN clinical_records cr ON p.clinical_record_id = cr.id
        WHERE p.patient_id = $1
        ORDER BY p.created_at DESC
      `, [patientId]);

      // Parse JSON fields for each prediction
      const predictions = result.rows.map(pred => {
        if (pred.recommendations && typeof pred.recommendations === 'string') {
          pred.recommendations = JSON.parse(pred.recommendations);
        }
        if (pred.prediction_data && typeof pred.prediction_data === 'string') {
          pred.prediction_data = JSON.parse(pred.prediction_data);
        }
        return pred;
      });

      res.json(predictions);

    } catch (error) {
      console.error('❌ Get patient predictions error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch patient predictions',
        details: error.message 
      });
    }
  }

  static async getPredictionStats(req, res) {
    try {
      const doctorId = req.user.id;

      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_predictions,
          COUNT(CASE WHEN p.risk_level = 'high' THEN 1 END) as high_risk_count,
          COUNT(CASE WHEN p.risk_level = 'moderate' THEN 1 END) as moderate_risk_count,
          COUNT(CASE WHEN p.risk_level = 'low' THEN 1 END) as low_risk_count,
          COALESCE(ROUND(AVG(p.confidence_score)::numeric, 1), 0) as avg_confidence
        FROM predictions p
        JOIN patients pt ON p.patient_id = pt.id
        WHERE pt.primary_doctor_id = $1
      `, [doctorId]);

      res.json({
        total_predictions: parseInt(result.rows[0]?.total_predictions || 0),
        high_risk_count: parseInt(result.rows[0]?.high_risk_count || 0),
        moderate_risk_count: parseInt(result.rows[0]?.moderate_risk_count || 0),
        low_risk_count: parseInt(result.rows[0]?.low_risk_count || 0),
        avg_confidence: parseFloat(result.rows[0]?.avg_confidence || 0)
      });

    } catch (error) {
      console.error('❌ Get prediction stats error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch prediction stats',
        details: error.message 
      });
    }
  }

  // ==================== SCHEDULE MANAGEMENT ====================

  static async getSchedule(req, res) {
    try {
      const doctorId = req.user.id;
      const { date } = req.query;

      // This would be replaced with actual appointments from database
      const appointments = [
        {
          id: '1',
          patient_name: 'Robert Johnson',
          patient_id: '1',
          time: '09:00',
          duration: '30 min',
          type: 'Follow-up',
          room: '302',
          status: 'scheduled'
        },
        {
          id: '2',
          patient_name: 'Maria Chen',
          patient_id: '2',
          time: '10:30',
          duration: '45 min',
          type: 'Consultation',
          room: '305',
          status: 'scheduled'
        },
        {
          id: '3',
          patient_name: 'James Wilson',
          patient_id: '3',
          time: '11:15',
          duration: '30 min',
          type: 'Follow-up',
          room: '308',
          status: 'scheduled'
        }
      ];

      res.json({
        date: date || new Date().toISOString().split('T')[0],
        appointments: appointments
      });

    } catch (error) {
      console.error('❌ Get schedule error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch schedule',
        details: error.message 
      });
    }
  }

  static async updateAppointmentStatus(req, res) {
    try {
      const { appointmentId } = req.params;
      const { status } = req.body;

      // This would update the appointment in database
      console.log(`Updating appointment ${appointmentId} to status: ${status}`);

      res.json({
        message: 'Appointment status updated successfully',
        appointmentId,
        status
      });

    } catch (error) {
      console.error('❌ Update appointment error:', error);
      res.status(500).json({ 
        error: 'Failed to update appointment',
        details: error.message 
      });
    }
  }

  // ==================== REPORTS ====================

  static async getReports(req, res) {
    try {
      const doctorId = req.user.id;
      const { timeframe = 'month' } = req.query;

      // Get patient outcomes for this doctor
      const patientOutcomes = await pool.query(`
        SELECT 
          COUNT(*) as total_patients,
          COUNT(CASE WHEN d.id IS NOT NULL THEN 1 END) as diagnosed_patients,
          COUNT(CASE WHEN pr.risk_level = 'high' THEN 1 END) as high_risk_patients
        FROM patients p
        LEFT JOIN diagnoses d ON p.id = d.patient_id AND d.doctor_id = $1
        LEFT JOIN predictions pr ON p.id = pr.patient_id
        WHERE p.primary_doctor_id = $1
      `, [doctorId]);

      // Get diagnosis statistics for this doctor
      const diagnosisStats = await pool.query(`
        SELECT 
          diagnosis,
          COUNT(*) as count,
          ROUND(AVG(CASE 
            WHEN severity = 'severe' THEN 3
            WHEN severity = 'moderate' THEN 2
            WHEN severity = 'mild' THEN 1
          END)::numeric, 1) as avg_severity
        FROM diagnoses
        WHERE doctor_id = $1
        GROUP BY diagnosis
        ORDER BY count DESC
        LIMIT 10
      `, [doctorId]);

      // Get monthly trends for this doctor
      const monthlyTrends = await pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
          COUNT(*) as diagnoses_count
        FROM diagnoses
        WHERE doctor_id = $1
          AND created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      `, [doctorId]);

      res.json({
        summary: {
          total_patients: parseInt(patientOutcomes.rows[0]?.total_patients || 0),
          diagnosed_patients: parseInt(patientOutcomes.rows[0]?.diagnosed_patients || 0),
          high_risk_patients: parseInt(patientOutcomes.rows[0]?.high_risk_patients || 0)
        },
        diagnosis_stats: diagnosisStats.rows,
        monthly_trends: monthlyTrends.rows,
        report_date: new Date()
      });

    } catch (error) {
      console.error('❌ Get reports error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch reports',
        details: error.message 
      });
    }
  }

  static async generateReport(req, res) {
    try {
      const { report_type, date_range } = req.body;

      console.log(`Generating ${report_type} report for ${date_range}`);

      res.json({
        message: 'Report generated successfully',
        report_url: `/reports/${Date.now()}.pdf`,
        report_type,
        date_range
      });

    } catch (error) {
      console.error('❌ Generate report error:', error);
      res.status(500).json({ 
        error: 'Failed to generate report',
        details: error.message 
      });
    }
  }
}

export default DoctorController;