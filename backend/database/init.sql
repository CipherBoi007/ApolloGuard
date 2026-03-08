-- Create database
CREATE DATABASE apollo;

-- Connect to database
\c apollo;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'patient')),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Staff details (for doctors and nurses)
CREATE TABLE staff_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255),
    license_number VARCHAR(100),
    department VARCHAR(100),
    joining_date DATE,
    qualification TEXT,
    experience_years INTEGER,
    UNIQUE(user_id)
);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    allergies TEXT,
    chronic_conditions TEXT,
    UNIQUE(user_id)
);

-- Clinical records
CREATE TABLE clinical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES users(id),
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Vital signs
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    temperature DECIMAL(4,2),
    oxygen_saturation INTEGER,
    
    -- Lab results
    blood_sugar DECIMAL(6,2),
    cholesterol_total DECIMAL(6,2),
    cholesterol_hdl DECIMAL(6,2),
    cholesterol_ldl DECIMAL(6,2),
    triglycerides DECIMAL(6,2),
    
    -- Symptoms and notes
    symptoms TEXT,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predictions table
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    clinical_record_id UUID REFERENCES clinical_records(id),
    prediction_type VARCHAR(100),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'high')),
    confidence_score DECIMAL(5,2),
    prediction_data JSONB,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diagnoses table
CREATE TABLE diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id),
    clinical_record_id UUID REFERENCES clinical_records(id),
    prediction_id UUID REFERENCES predictions(id),
    diagnosis TEXT NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
    prescription TEXT,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_clinical_records_patient ON clinical_records(patient_id);
CREATE INDEX idx_predictions_patient ON predictions(patient_id);
CREATE INDEX idx_predictions_risk ON predictions(risk_level);
CREATE INDEX idx_diagnoses_patient ON diagnoses(patient_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diagnoses_updated_at BEFORE UPDATE ON diagnoses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: Admin@123)
INSERT INTO users (email, password_hash, first_name, last_name, role) 
VALUES ('admin@hospital.com', '$2b$10$YourHashedPasswordHere', 'System', 'Admin', 'admin');