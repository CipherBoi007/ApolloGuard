import bcrypt from 'bcrypt';
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    console.log('🔐 Generating password hashes...');

    // Generate actual bcrypt hashes for all passwords
    const adminPasswordHash = await hashPassword('Admin@123');
    const doctorPasswordHash = await hashPassword('Doctor@123');
    const nursePasswordHash = await hashPassword('Nurse@123');
    const patientPasswordHash = await hashPassword('Patient@123');

    console.log('✓ Password hashes generated');
    console.log(`  Admin hash: ${adminPasswordHash.substring(0, 30)}...`);
    console.log(`  Doctor hash: ${doctorPasswordHash.substring(0, 30)}...`);
    console.log(`  Nurse hash: ${nursePasswordHash.substring(0, 30)}...`);
    console.log(`  Patient hash: ${patientPasswordHash.substring(0, 30)}...`);

    // Clear existing data (optional - be careful!)
    console.log('🗑️  Clearing existing data...');
    await pool.query('TRUNCATE TABLE diagnoses, predictions, clinical_records, patients, staff_details, users RESTART IDENTITY CASCADE;');
    console.log('✓ Existing data cleared');

    // Create 1 admin
    console.log('👤 Creating admin user...');
    const adminResult = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, role
    `, ['admin@hospital.com', adminPasswordHash, 'System', 'Admin', 'admin', true]);
    console.log(`✓ Admin created: ${adminResult.rows[0].email}`);

    // Create 3 doctors
    console.log('👨‍⚕️ Creating 3 doctors...');
    const doctorFirstNames = ['John', 'Sarah', 'Michael'];
    const doctorLastNames = ['Smith', 'Chen', 'Rodriguez'];
    const doctorSpecializations = ['Cardiology', 'Neurology', 'Pediatrics'];
    const doctorDepartments = ['Cardiology', 'Neurology', 'Pediatrics'];
    
    for (let i = 1; i <= 3; i++) {
      const doctorResult = await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        `doctor${i}@hospital.com`, 
        doctorPasswordHash, 
        doctorFirstNames[i-1], 
        doctorLastNames[i-1], 
        'doctor', 
        `555-01${i.toString().padStart(2, '0')}`,
        true,
        new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
      ]);

      // Add doctor details
      await pool.query(`
        INSERT INTO staff_details (user_id, specialization, license_number, department, experience_years)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        doctorResult.rows[0].id,
        doctorSpecializations[i-1],
        `LIC${Math.floor(Math.random() * 100000)}`,
        doctorDepartments[i-1],
        Math.floor(Math.random() * 15 + 5) // 5-20 years experience
      ]);
    }
    console.log('✓ 3 doctors created');

    // Create 5 nurses
    console.log('👩‍⚕️ Creating 5 nurses...');
    const nurseFirstNames = ['Emily', 'James', 'Maria', 'David', 'Lisa'];
    const nurseLastNames = ['Wilson', 'Garcia', 'Brown', 'Martinez', 'Taylor'];
    const nurseSpecializations = ['ICU', 'Emergency', 'Surgical', 'Pediatric', 'General'];
    const nurseDepartments = ['ICU', 'Emergency', 'Surgery', 'Pediatrics', 'General Ward'];
    
    for (let i = 1; i <= 5; i++) {
      const nurseResult = await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        `nurse${i}@hospital.com`, 
        nursePasswordHash, 
        nurseFirstNames[i-1], 
        nurseLastNames[i-1], 
        'nurse', 
        `555-02${i.toString().padStart(2, '0')}`,
        true,
        new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
      ]);

      // Add nurse details
      await pool.query(`
        INSERT INTO staff_details (user_id, specialization, license_number, department, experience_years)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        nurseResult.rows[0].id,
        nurseSpecializations[i-1],
        `NUR${Math.floor(Math.random() * 100000)}`,
        nurseDepartments[i-1],
        Math.floor(Math.random() * 12 + 2) // 2-14 years experience
      ]);
    }
    console.log('✓ 5 nurses created');

    // Create 10 patients
    console.log('🧑 Creating 10 patients...');
    const patientFirstNames = [
      'James', 'Mary', 'Robert', 'Patricia', 'John', 
      'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'
    ];
    const patientLastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
      'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'
    ];
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
    const states = ['NY', 'CA', 'IL', 'TX', 'AZ'];
    
    for (let i = 1; i <= 10; i++) {
      const patientResult = await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        `patient${i}@email.com`, 
        patientPasswordHash, 
        patientFirstNames[i-1], 
        patientLastNames[i-1], 
        'patient', 
        `555-03${i.toString().padStart(2, '0')}`,
        true,
        new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      ]);

      // Calculate age between 18-85
      const ageYears = Math.floor(Math.random() * 67) + 18; // 18-85 years
      const dob = new Date(Date.now() - ageYears * 365 * 24 * 60 * 60 * 1000);
      
      // Generate realistic height and weight
      const isMale = Math.random() > 0.5;
      const height = isMale ? 
        Math.round((Math.random() * 25 + 165) * 10) / 10 : // 165-190 cm for males
        Math.round((Math.random() * 20 + 152) * 10) / 10;  // 152-172 cm for females
      
      const weight = Math.round((Math.random() * 40 + 55) * 10) / 10; // 55-95 kg
      
      // Random allergies and conditions
      const allergies = [
        'None', 'Penicillin', 'Sulfa', 'Pollen', 'Dust', 
        'Penicillin, Sulfa', 'Latex', 'None', 'None', 'Peanuts'
      ];
      
      const chronicConditions = [
        'None', 'Hypertension', 'Diabetes Type 2', 'Asthma', 'Arthritis',
        'Hypertension, Diabetes', 'None', 'None', 'COPD', 'Hypothyroidism'
      ];
      
      await pool.query(`
        INSERT INTO patients (
          user_id, date_of_birth, gender, blood_group, emergency_contact, 
          address, city, state, zip_code, height, weight, allergies, chronic_conditions
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        patientResult.rows[0].id,
        dob,
        isMale ? 'Male' : 'Female',
        bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
        `555-${Math.floor(Math.random() * 900 + 100)}`,
        `${Math.floor(Math.random() * 1000 + 100)} ${['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd'][Math.floor(Math.random() * 5)]}`,
        cities[Math.floor(Math.random() * cities.length)],
        states[Math.floor(Math.random() * states.length)],
        (Math.floor(Math.random() * 90000) + 10000).toString(),
        height,
        weight,
        allergies[Math.floor(Math.random() * allergies.length)],
        chronicConditions[Math.floor(Math.random() * chronicConditions.length)]
      ]);
    }
    console.log('✓ 10 patients created');

    // Create clinical records for patients
    console.log('📋 Creating clinical records...');
    const patients = await pool.query('SELECT id FROM patients');
    const nurses = await pool.query('SELECT id FROM users WHERE role = \'nurse\'');
    
    for (const patient of patients.rows) {
      // Create 2-3 records per patient
      const recordCount = Math.floor(Math.random() * 2) + 2; // 2-3 records
      for (let j = 0; j < recordCount; j++) {
        const recordDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
        const nurse = nurses.rows[Math.floor(Math.random() * nurses.rows.length)];
        
        // Generate realistic vital signs
        const bpSystolic = Math.floor(Math.random() * 60 + 100); // 100-160
        const bpDiastolic = Math.floor(Math.random() * 30 + 60); // 60-90
        const heartRate = Math.floor(Math.random() * 40 + 60); // 60-100
        const respiratoryRate = Math.floor(Math.random() * 12 + 12); // 12-24
        const temperature = Math.round((Math.random() * 2 + 36.5) * 10) / 10; // 36.5-38.5
        const oxygenSat = Math.floor(Math.random() * 5 + 95); // 95-100
        const bloodSugar = Math.floor(Math.random() * 150 + 70); // 70-220
        
        const symptoms = [
          'Regular checkup, no complaints',
          'Mild headache, fatigue',
          'Chest pain, shortness of breath',
          'Joint pain, stiffness',
          'Cough, fever',
          'Dizziness, nausea',
          'Follow-up visit, feeling well'
        ];
        
        const notes = [
          'Vitals normal',
          'Patient reports feeling better',
          'Follow-up in 3 months',
          'Medication working well',
          'Labs ordered',
          'Referred to specialist',
          'Continue current treatment'
        ];
        
        await pool.query(`
          INSERT INTO clinical_records (
            patient_id, recorded_by, record_date,
            blood_pressure_systolic, blood_pressure_diastolic,
            heart_rate, respiratory_rate, temperature,
            oxygen_saturation, blood_sugar, symptoms, notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          patient.id,
          nurse.id,
          recordDate,
          bpSystolic,
          bpDiastolic,
          heartRate,
          respiratoryRate,
          temperature,
          oxygenSat,
          bloodSugar,
          symptoms[Math.floor(Math.random() * symptoms.length)],
          notes[Math.floor(Math.random() * notes.length)]
        ]);
      }
    }
    console.log('✓ Clinical records created');

    // Create predictions
    console.log('🤖 Creating AI predictions...');
    const clinicalRecords = await pool.query('SELECT id, patient_id, record_date FROM clinical_records');
    
    for (const record of clinicalRecords.rows) {
      if (Math.random() > 0.3) { // 70% of records have predictions
        const riskLevels = ['low', 'moderate', 'high'];
        const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
        const confidence = Math.round((Math.random() * 20 + 75) * 10) / 10; // 75-95%
        
        let recommendations;
        if (risk === 'high') {
          recommendations = [
            'Immediate follow-up required',
            'Schedule appointment within 48 hours',
            'Monitor vital signs closely',
            'Consider specialist consultation'
          ];
        } else if (risk === 'moderate') {
          recommendations = [
            'Schedule follow-up within 2 weeks',
            'Continue current medications',
            'Lifestyle modifications advised',
            'Monitor symptoms'
          ];
        } else {
          recommendations = [
            'Continue regular monitoring',
            'Schedule routine check-up in 3 months',
            'Maintain healthy lifestyle',
            'Report any new symptoms'
          ];
        }
        
        await pool.query(`
          INSERT INTO predictions (
            patient_id, clinical_record_id, prediction_type,
            risk_level, confidence_score, prediction_data, recommendations, created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          record.patient_id,
          record.id,
          'health_risk',
          risk,
          confidence,
          JSON.stringify({
            risk_factors: [
              { factor: 'Blood Pressure', severity: Math.random() > 0.7 ? 'high' : 'moderate' },
              { factor: 'Heart Rate', severity: Math.random() > 0.8 ? 'high' : 'low' },
              { factor: 'Age', severity: 'moderate' }
            ]
          }),
          JSON.stringify(recommendations),
          new Date(new Date(record.record_date).getTime() + 24 * 60 * 60 * 1000)
        ]);
      }
    }
    console.log('✓ AI predictions created');

    // Create diagnoses
    console.log('📝 Creating diagnoses...');
    const doctors = await pool.query('SELECT id FROM users WHERE role = \'doctor\'');
    const predictionsData = await pool.query('SELECT id, patient_id, clinical_record_id FROM predictions');
    
    const diagnosisList = [
      'Hypertension', 'Type 2 Diabetes', 'Upper Respiratory Infection', 
      'Hyperlipidemia', 'Asthma', 'Arthritis', 'Anxiety', 'Depression',
      'GERD', 'Hypothyroidism'
    ];
    
    const prescriptions = [
      'Lisinopril 10mg daily',
      'Metformin 500mg twice daily',
      'Amoxicillin 500mg three times daily',
      'Atorvastatin 20mg daily',
      'Albuterol inhaler as needed',
      'Sertraline 50mg daily',
      'Omeprazole 20mg daily',
      'Levothyroxine 50mcg daily'
    ];
    
    for (const prediction of predictionsData.rows) {
      if (Math.random() > 0.5) { // 50% of predictions have diagnoses
        const doctor = doctors.rows[Math.floor(Math.random() * doctors.rows.length)];
        const severity = ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)];
        
        await pool.query(`
          INSERT INTO diagnoses (
            patient_id, doctor_id, clinical_record_id, prediction_id,
            diagnosis, severity, prescription, follow_up_date, notes, created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          prediction.patient_id,
          doctor.id,
          prediction.clinical_record_id,
          prediction.id,
          diagnosisList[Math.floor(Math.random() * diagnosisList.length)],
          severity,
          prescriptions[Math.floor(Math.random() * prescriptions.length)],
          new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
          severity === 'severe' ? 'Urgent follow-up required' : 'Continue current management',
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        ]);
      }
    }
    console.log('✓ Diagnoses created');

    // Get counts
    const counts = await pool.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
      ORDER BY 
        CASE role
          WHEN 'admin' THEN 1
          WHEN 'doctor' THEN 2
          WHEN 'nurse' THEN 3
          WHEN 'patient' THEN 4
        END
    `);

    console.log('\n📊 User counts:');
    counts.rows.forEach(row => {
      console.log(`   ${row.role}: ${row.count}`);
    });

    // Get additional stats
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM clinical_records) as clinical_records,
        (SELECT COUNT(*) FROM predictions) as predictions,
        (SELECT COUNT(*) FROM diagnoses) as diagnoses
    `);
    
    console.log('\n📊 Additional stats:');
    console.log(`   Clinical Records: ${stats.rows[0].clinical_records}`);
    console.log(`   AI Predictions: ${stats.rows[0].predictions}`);
    console.log(`   Diagnoses: ${stats.rows[0].diagnoses}`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login Credentials (all working):');
    console.log('┌─────────┬─────────────────────────┬─────────────┐');
    console.log('│ Role    │ Email                   │ Password    │');
    console.log('├─────────┼─────────────────────────┼─────────────┤');
    console.log('│ Admin   │ admin@hospital.com      │ Admin@123   │');
    console.log('│ Doctor  │ doctor1@hospital.com    │ Doctor@123  │');
    console.log('│ Doctor  │ doctor2@hospital.com    │ Doctor@123  │');
    console.log('│ Doctor  │ doctor3@hospital.com    │ Doctor@123  │');
    console.log('│ Nurse   │ nurse1@hospital.com     │ Nurse@123   │');
    console.log('│ Nurse   │ nurse2@hospital.com     │ Nurse@123   │');
    console.log('│ Nurse   │ nurse3@hospital.com     │ Nurse@123   │');
    console.log('│ Nurse   │ nurse4@hospital.com     │ Nurse@123   │');
    console.log('│ Nurse   │ nurse5@hospital.com     │ Nurse@123   │');
    console.log('│ Patient │ patient1@email.com      │ Patient@123 │');
    console.log('│ ...     │ ...                     │ ...         │');
    console.log('│ Patient │ patient10@email.com     │ Patient@123 │');
    console.log('└─────────┴─────────────────────────┴─────────────┘');

  } catch (error) {
    console.error('❌ Seed error:', error);
    console.error('Error details:', error.message);
  } finally {
    await pool.end();
  }
}

seedDatabase();