import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Prediction from '../models/Prediction.js';
import ClinicalRecord from '../models/ClinicalRecord.js';
import Diagnosis from '../models/Diagnosis.js';
import pool from '../config/database.js';
import bcrypt from 'bcrypt';

class AdminController {
  // ==================== DASHBOARD STATS ====================
  
  static async getDashboardStats(req, res) {
    try {
      console.log('📊 Fetching admin dashboard stats...');
      
      // Get user counts
      const userCounts = await pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
          COUNT(CASE WHEN role = 'doctor' THEN 1 END) as doctor_count,
          COUNT(CASE WHEN role = 'nurse' THEN 1 END) as nurse_count,
          COUNT(CASE WHEN role = 'patient' THEN 1 END) as patient_count
        FROM users
        WHERE is_active = true
      `);

      // Get patient demographics
      const patientStats = await pool.query(`
        SELECT 
          COUNT(*) as total_patients,
          COUNT(CASE WHEN date_part('year', age(date_of_birth)) < 18 THEN 1 END) as pediatric,
          COUNT(CASE WHEN date_part('year', age(date_of_birth)) BETWEEN 18 AND 60 THEN 1 END) as adult,
          COUNT(CASE WHEN date_part('year', age(date_of_birth)) > 60 THEN 1 END) as geriatric
        FROM patients
      `);

      // Get prediction statistics
      const predictionStats = await pool.query(`
        SELECT 
          COUNT(*) as total_predictions,
          COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_count,
          COUNT(CASE WHEN risk_level = 'moderate' THEN 1 END) as moderate_risk_count,
          COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_risk_count,
          COALESCE(AVG(confidence_score), 0) as avg_confidence
        FROM predictions
      `);

      // Get recent activity (last 10 activities across all types)
      const recentActivity = await pool.query(`
        (SELECT 
          'new_user' as type,
          created_at,
          first_name || ' ' || last_name as description,
          'user' as category
         FROM users
         WHERE created_at >= NOW() - INTERVAL '30 days'
         ORDER BY created_at DESC
         LIMIT 3)
        UNION ALL
        (SELECT 
          'clinical_record' as type,
          created_at,
          'New clinical record added' as description,
          'record' as category
         FROM clinical_records
         WHERE created_at >= NOW() - INTERVAL '30 days'
         ORDER BY created_at DESC
         LIMIT 3)
        UNION ALL
        (SELECT 
          'prediction' as type,
          created_at,
          'AI prediction generated' as description,
          'prediction' as category
         FROM predictions
         WHERE created_at >= NOW() - INTERVAL '30 days'
         ORDER BY created_at DESC
         LIMIT 2)
        UNION ALL
        (SELECT 
          'diagnosis' as type,
          created_at,
          'New diagnosis recorded' as description,
          'diagnosis' as category
         FROM diagnoses
         WHERE created_at >= NOW() - INTERVAL '30 days'
         ORDER BY created_at DESC
         LIMIT 2)
        ORDER BY created_at DESC
        LIMIT 10
      `);

      // Get revenue data (simplified - based on patient count)
      const revenueData = await pool.query(`
        SELECT 
          COUNT(*) * 850 as estimated_revenue,
          COUNT(*) as patient_count
        FROM patients
      `);

      // Get department distribution
      const departmentStats = await pool.query(`
        SELECT 
          COALESCE(department, 'General') as department,
          COUNT(*) as staff_count,
          COUNT(CASE WHEN role = 'doctor' THEN 1 END) as doctors,
          COUNT(CASE WHEN role = 'nurse' THEN 1 END) as nurses
        FROM staff_details sd
        JOIN users u ON sd.user_id = u.id
        WHERE u.is_active = true
        GROUP BY department
        ORDER BY staff_count DESC
      `);

      // Get monthly trends
      const monthlyTrends = await pool.query(`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as registrations
        FROM users
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `);

      res.json({
        success: true,
        user_stats: userCounts.rows[0],
        patient_demographics: patientStats.rows[0],
        prediction_stats: {
          ...predictionStats.rows[0],
          total_predictions: parseInt(predictionStats.rows[0].total_predictions || 0),
          high_risk_count: parseInt(predictionStats.rows[0].high_risk_count || 0),
          moderate_risk_count: parseInt(predictionStats.rows[0].moderate_risk_count || 0),
          low_risk_count: parseInt(predictionStats.rows[0].low_risk_count || 0),
          avg_confidence: parseFloat(predictionStats.rows[0].avg_confidence || 0).toFixed(1)
        },
        recent_activity: recentActivity.rows,
        revenue: {
          estimated: revenueData.rows[0]?.estimated_revenue || 0,
          patient_count: revenueData.rows[0]?.patient_count || 0
        },
        department_stats: departmentStats.rows,
        monthly_trends: monthlyTrends.rows,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Dashboard stats error:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  // ==================== ANALYTICS ====================

  static async getDetailedAnalytics(req, res) {
    try {
      const { timeframe = 'month' } = req.query;
      
      let interval;
      let groupBy;
      switch (timeframe) {
        case 'week':
          interval = '7 days';
          groupBy = 'day';
          break;
        case 'month':
          interval = '30 days';
          groupBy = 'day';
          break;
        case 'quarter':
          interval = '90 days';
          groupBy = 'week';
          break;
        case 'year':
          interval = '12 months';
          groupBy = 'month';
          break;
        default:
          interval = '30 days';
          groupBy = 'day';
      }

      console.log(`📊 Fetching analytics for timeframe: ${timeframe}, interval: ${interval}, groupBy: ${groupBy}`);

      // User registration trend
      const userTrend = await pool.query(`
        SELECT 
          DATE_TRUNC('${groupBy}', created_at) as date,
          COUNT(*) as new_users,
          COUNT(CASE WHEN role = 'patient' THEN 1 END) as new_patients,
          COUNT(CASE WHEN role = 'doctor' THEN 1 END) as new_doctors,
          COUNT(CASE WHEN role = 'nurse' THEN 1 END) as new_nurses,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as new_admins
        FROM users
        WHERE created_at >= NOW() - INTERVAL '${interval}'
        GROUP BY DATE_TRUNC('${groupBy}', created_at)
        ORDER BY date ASC
      `);

      // Clinical records trend
      const clinicalTrend = await pool.query(`
        SELECT 
          DATE_TRUNC('${groupBy}', created_at) as date,
          COUNT(*) as total_records,
          COUNT(DISTINCT patient_id) as unique_patients
        FROM clinical_records
        WHERE created_at >= NOW() - INTERVAL '${interval}'
        GROUP BY DATE_TRUNC('${groupBy}', created_at)
        ORDER BY date ASC
      `);

      // Risk distribution
      const riskDistribution = await pool.query(`
        SELECT 
          risk_level,
          COUNT(*) as count,
          ROUND(AVG(confidence_score)::numeric, 1) as avg_confidence
        FROM predictions
        WHERE created_at >= NOW() - INTERVAL '${interval}'
        GROUP BY risk_level
      `);

      // Top diagnoses
      const topDiagnoses = await pool.query(`
        SELECT 
          diagnosis,
          COUNT(*) as count,
          ROUND(AVG(CASE 
            WHEN severity = 'severe' THEN 3
            WHEN severity = 'moderate' THEN 2
            WHEN severity = 'mild' THEN 1
          END)::numeric, 1) as avg_severity_score
        FROM diagnoses
        WHERE created_at >= NOW() - INTERVAL '${interval}'
        GROUP BY diagnosis
        ORDER BY count DESC
        LIMIT 10
      `);

      // Department performance
      const deptPerformance = await pool.query(`
        SELECT 
          COALESCE(sd.department, 'General') as department,
          COUNT(DISTINCT cr.id) as total_records,
          COUNT(DISTINCT d.id) as total_diagnoses,
          COUNT(DISTINCT p.id) as total_patients
        FROM staff_details sd
        FULL JOIN clinical_records cr ON cr.recorded_by = sd.user_id
        FULL JOIN diagnoses d ON d.doctor_id = sd.user_id
        FULL JOIN patients p ON p.id = cr.patient_id
        WHERE cr.created_at >= NOW() - INTERVAL '${interval}' OR cr.created_at IS NULL
        GROUP BY sd.department
        ORDER BY total_records DESC
      `);

      // Patient demographics trend
      const demographicsTrend = await pool.query(`
        SELECT 
          DATE_TRUNC('${groupBy}', u.created_at) as date,
          COUNT(CASE WHEN p.gender = 'Male' THEN 1 END) as male,
          COUNT(CASE WHEN p.gender = 'Female' THEN 1 END) as female,
          AVG(EXTRACT(YEAR FROM AGE(p.date_of_birth))) as avg_age
        FROM users u
        JOIN patients p ON u.id = p.user_id
        WHERE u.created_at >= NOW() - INTERVAL '${interval}'
        GROUP BY DATE_TRUNC('${groupBy}', u.created_at)
        ORDER BY date ASC
      `);

      // Monthly revenue estimate (simplified)
      const revenueTrend = await pool.query(`
        SELECT 
          DATE_TRUNC('month', cr.created_at) as month,
          COUNT(DISTINCT cr.patient_id) * 150 as estimated_revenue,
          COUNT(cr.id) as total_visits
        FROM clinical_records cr
        WHERE cr.created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', cr.created_at)
        ORDER BY month ASC
      `);

      // Calculate summary statistics
      const totalUsers = userTrend.rows.reduce((acc, row) => acc + parseInt(row.new_users || 0), 0);
      const totalRecords = clinicalTrend.rows.reduce((acc, row) => acc + parseInt(row.total_records || 0), 0);
      const avgConfidence = riskDistribution.rows.length > 0 
        ? riskDistribution.rows.reduce((acc, row) => acc + parseFloat(row.avg_confidence || 0), 0) / riskDistribution.rows.length
        : 0;

      res.json({
        success: true,
        timeframe,
        user_registration_trend: userTrend.rows,
        clinical_records_trend: clinicalTrend.rows,
        risk_distribution: riskDistribution.rows,
        top_diagnoses: topDiagnoses.rows,
        department_performance: deptPerformance.rows,
        demographics_trend: demographicsTrend.rows,
        revenue_trend: revenueTrend.rows,
        summary: {
          total_users: totalUsers,
          total_records: totalRecords,
          avg_confidence: Math.round(avgConfidence * 10) / 10
        }
      });

    } catch (error) {
      console.error('❌ Analytics error:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  // ==================== USER MANAGEMENT ====================

  static async createUser(req, res) {
    try {
      const userData = req.body;
      
      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const newUser = await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, email, first_name, last_name, role, phone, is_active, created_at
      `, [
        userData.email,
        hashedPassword,
        userData.first_name,
        userData.last_name,
        userData.role,
        userData.phone || null,
        true
      ]);

      // If user is patient, create patient record
      if (userData.role === 'patient' && userData.patient_details) {
        await pool.query(`
          INSERT INTO patients (
            user_id, date_of_birth, gender, blood_group, emergency_contact,
            address, city, state, zip_code, height, weight, allergies, chronic_conditions
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          newUser.rows[0].id,
          userData.patient_details.date_of_birth || null,
          userData.patient_details.gender || null,
          userData.patient_details.blood_group || null,
          userData.patient_details.emergency_contact || null,
          userData.patient_details.address || null,
          userData.patient_details.city || null,
          userData.patient_details.state || null,
          userData.patient_details.zip_code || null,
          userData.patient_details.height || null,
          userData.patient_details.weight || null,
          userData.patient_details.allergies || null,
          userData.patient_details.chronic_conditions || null
        ]);
      }

      // If user is doctor or nurse, create staff details
      if ((userData.role === 'doctor' || userData.role === 'nurse') && userData.staff_details) {
        await pool.query(`
          INSERT INTO staff_details (
            user_id, specialization, license_number, department, experience_years, qualification
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          newUser.rows[0].id,
          userData.staff_details.specialization || null,
          userData.staff_details.license_number || null,
          userData.staff_details.department || null,
          userData.staff_details.experience_years || null,
          userData.staff_details.qualification || null
        ]);
      }

      res.status(201).json({
        message: 'User created successfully',
        user: newUser.rows[0]
      });

    } catch (error) {
      console.error('❌ Create user error:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const { role } = req.query;
      
      let query = `
        SELECT 
          u.id, u.email, u.first_name, u.last_name, u.role, u.phone, 
          u.is_active, u.created_at, u.last_login,
          sd.specialization, sd.license_number, sd.department, sd.experience_years,
          p.date_of_birth, p.gender, p.blood_group, p.emergency_contact,
          p.address, p.city, p.state, p.zip_code, p.height, p.weight,
          p.allergies, p.chronic_conditions
        FROM users u
        LEFT JOIN staff_details sd ON u.id = sd.user_id
        LEFT JOIN patients p ON u.id = p.user_id
        WHERE 1=1
      `;
      
      const values = [];
      
      if (role) {
        query += ' AND u.role = $1';
        values.push(role);
      }
      
      query += ' ORDER BY u.created_at DESC';
      
      const result = await pool.query(query, values);
      
      res.json(result.rows);
    } catch (error) {
      console.error('❌ Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(`
        SELECT 
          u.*,
          sd.specialization, sd.license_number, sd.department, sd.experience_years, sd.qualification,
          p.date_of_birth, p.gender, p.blood_group, p.emergency_contact,
          p.address, p.city, p.state, p.zip_code, p.height, p.weight,
          p.allergies, p.chronic_conditions
        FROM users u
        LEFT JOIN staff_details sd ON u.id = sd.user_id
        LEFT JOIN patients p ON u.id = p.user_id
        WHERE u.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      
      // Structure the response
      const response = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        phone: user.phone,
        is_active: user.is_active,
        created_at: user.created_at,
        last_login: user.last_login
      };

      // Add role-specific details
      if (user.role === 'patient') {
        response.patient_details = {
          date_of_birth: user.date_of_birth,
          gender: user.gender,
          blood_group: user.blood_group,
          emergency_contact: user.emergency_contact,
          address: user.address,
          city: user.city,
          state: user.state,
          zip_code: user.zip_code,
          height: user.height,
          weight: user.weight,
          allergies: user.allergies,
          chronic_conditions: user.chronic_conditions
        };
      } else if (user.role === 'doctor' || user.role === 'nurse') {
        response.staff_details = {
          specialization: user.specialization,
          license_number: user.license_number,
          department: user.department,
          experience_years: user.experience_years,
          qualification: user.qualification
        };
      }

      res.json(response);
    } catch (error) {
      console.error('❌ Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;

      // Update user basic info
      await pool.query(`
        UPDATE users 
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            phone = COALESCE($3, phone),
            is_active = COALESCE($4, is_active)
        WHERE id = $5
      `, [
        userData.first_name,
        userData.last_name,
        userData.phone,
        userData.is_active,
        id
      ]);

      // Update role-specific details
      if (userData.role === 'patient' && userData.patient_details) {
        await pool.query(`
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
          userData.patient_details.date_of_birth,
          userData.patient_details.gender,
          userData.patient_details.blood_group,
          userData.patient_details.emergency_contact,
          userData.patient_details.address,
          userData.patient_details.city,
          userData.patient_details.state,
          userData.patient_details.zip_code,
          userData.patient_details.height,
          userData.patient_details.weight,
          userData.patient_details.allergies,
          userData.patient_details.chronic_conditions,
          id
        ]);
      } else if ((userData.role === 'doctor' || userData.role === 'nurse') && userData.staff_details) {
        await pool.query(`
          UPDATE staff_details
          SET specialization = COALESCE($1, specialization),
              license_number = COALESCE($2, license_number),
              department = COALESCE($3, department),
              experience_years = COALESCE($4, experience_years),
              qualification = COALESCE($5, qualification)
          WHERE user_id = $6
        `, [
          userData.staff_details.specialization,
          userData.staff_details.license_number,
          userData.staff_details.department,
          userData.staff_details.experience_years,
          userData.staff_details.qualification,
          id
        ]);
      }

      res.json({ message: 'User updated successfully' });

    } catch (error) {
      console.error('❌ Update user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Prevent deleting yourself
      if (id === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });

    } catch (error) {
      console.error('❌ Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async promoteToAdmin(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(`
        UPDATE users 
        SET role = 'admin' 
        WHERE id = $1 AND role != 'admin'
        RETURNING id, email, role
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found or already admin' });
      }

      res.json({
        message: 'User promoted to admin successfully',
        user: result.rows[0]
      });

    } catch (error) {
      console.error('❌ Promote user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ==================== PROFILE MANAGEMENT ====================

  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await pool.query(`
        SELECT 
          u.id, u.email, u.first_name, u.last_name, u.role, u.phone, u.is_active,
          sd.department, sd.specialization, sd.qualification,
          p.date_of_birth, p.gender, p.blood_group, p.emergency_contact,
          p.address, p.city, p.state, p.zip_code, p.height, p.weight,
          p.allergies, p.chronic_conditions
        FROM users u
        LEFT JOIN staff_details sd ON u.id = sd.user_id
        LEFT JOIN patients p ON u.id = p.user_id
        WHERE u.id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      
      // Format response to match frontend expectations
      const profile = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        phone: user.phone,
        is_active: user.is_active,
        department: user.department || 'Administration',
        title: user.specialization || (user.role === 'doctor' ? 'Doctor' : 
               user.role === 'nurse' ? 'Nurse' : 'System Administrator'),
        bio: user.qualification || ''
      };

      // Add role-specific details
      if (user.role === 'patient') {
        profile.patient_details = {
          date_of_birth: user.date_of_birth,
          gender: user.gender,
          blood_group: user.blood_group,
          emergency_contact: user.emergency_contact,
          address: user.address,
          city: user.city,
          state: user.state,
          zip_code: user.zip_code,
          height: user.height,
          weight: user.weight,
          allergies: user.allergies,
          chronic_conditions: user.chronic_conditions
        };
      } else {
        profile.staff_details = {
          department: user.department,
          specialization: user.specialization,
          qualification: user.qualification
        };
      }

      res.json(profile);

    } catch (error) {
      console.error('❌ Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const profileData = req.body;

      console.log('📝 Updating profile for user:', userId, profileData);

      // Start a transaction
      await pool.query('BEGIN');

      // Update basic info in users table
      await pool.query(`
        UPDATE users 
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            phone = COALESCE($3, phone)
        WHERE id = $4
      `, [
        profileData.first_name || null,
        profileData.last_name || null,
        profileData.phone || null,
        userId
      ]);

      // For admin/doctor/nurse, update staff_details
      if (req.user.role === 'admin' || req.user.role === 'doctor' || req.user.role === 'nurse') {
        // Check if staff record exists
        const staffExists = await pool.query(
          'SELECT 1 FROM staff_details WHERE user_id = $1',
          [userId]
        );

        if (staffExists.rows.length > 0) {
          // Update existing staff record
          await pool.query(`
            UPDATE staff_details
            SET department = COALESCE($1, department),
                specialization = COALESCE($2, specialization),
                qualification = COALESCE($3, qualification)
            WHERE user_id = $4
          `, [
            profileData.department || null,
            profileData.title || null,
            profileData.bio || null,
            userId
          ]);
          console.log('✅ Updated staff_details for user:', userId);
        } else {
          // Insert new staff record
          await pool.query(`
            INSERT INTO staff_details (user_id, department, specialization, qualification)
            VALUES ($1, $2, $3, $4)
          `, [
            userId,
            profileData.department || null,
            profileData.title || null,
            profileData.bio || null
          ]);
          console.log('✅ Created staff_details for user:', userId);
        }
      }

      await pool.query('COMMIT');

      // Fetch updated complete profile
      const updatedProfile = await pool.query(`
        SELECT 
          u.id, u.email, u.first_name, u.last_name, u.role, u.phone, u.is_active,
          sd.department, sd.specialization, sd.qualification
        FROM users u
        LEFT JOIN staff_details sd ON u.id = sd.user_id
        WHERE u.id = $1
      `, [userId]);

      console.log('✅ Profile updated successfully for user:', userId);

      // Format response
      const user = updatedProfile.rows[0];
      const response = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        phone: user.phone,
        is_active: user.is_active,
        department: user.department || 'Administration',
        title: user.specialization || 'System Administrator',
        bio: user.qualification || ''
      };

      res.json({
        message: 'Profile updated successfully',
        user: response
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('❌ Update profile error:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  static async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      const userId = req.user.id;

      console.log('🔐 Changing password for user:', userId);

      // Validate input
      if (!current_password || !new_password) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (new_password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      // Get current password hash from database
      const userResult = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const currentHash = userResult.rows[0].password_hash;
      console.log('Current hash retrieved from DB');

      // Verify current password
      const isValid = await bcrypt.compare(current_password, currentHash);
      console.log('Password verification result:', isValid);

      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(new_password, 10);
      console.log('New password hashed successfully');

      // Update password in database
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, userId]
      );

      console.log('✅ Password changed successfully for user:', userId);
      res.json({ message: 'Password changed successfully' });

    } catch (error) {
      console.error('❌ Change password error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
      });
    }
  }

  // ==================== SETTINGS ====================

  static async getSettings(req, res) {
    try {
      // For now, return default settings
      // You can extend this to fetch from a settings table later
      res.json({
        notifications: {
          email_notifications: true,
          push_notifications: true,
          sms_alerts: false,
          weekly_report: true,
          security_alerts: true,
          marketing_emails: false
        },
        preferences: {
          language: 'en',
          timezone: 'America/New_York',
          dark_mode: false
        }
      });
    } catch (error) {
      console.error('❌ Get settings error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateSettings(req, res) {
    try {
      const settings = req.body;
      console.log('📝 Updating settings:', settings);
      
      // Here you would save settings to database
      // For now, just return success
      
      res.json({ 
        message: 'Settings updated successfully', 
        settings 
      });
    } catch (error) {
      console.error('❌ Update settings error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AdminController;