# 🏥 ApolloGuard – Complete Hospital Management System

![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.x-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-24.x-2496ED?style=for-the-badge&logo=docker&logoColor=white)

ApolloGuard is a **production-grade Hospital Management System** designed for modern healthcare facilities.  
It provides **role-based access control**, **AI-powered disease prediction**, and **real-time analytics**.

---

## 📋 Overview
ApolloGuard enables efficient hospital operations through:
- Role-based dashboards
- AI-powered disease prediction
- Digital patient records
- Hospital analytics
- Secure authentication

---

## ✨ Key Features

### 🧑‍💼 Multi-Role Dashboard
Separate dashboards for:
- Admin
- Doctor
- Nurse
- Patient

### 🧠 AI-Powered Predictions
Machine learning models provide:
- Patient risk assessment
- Disease prediction
- Clinical insights

### 📊 Real-time Analytics
- Hospital activity metrics
- Staff insights
- Patient statistics

### 👨‍⚕️ Patient Management
- Patient registration
- Medical history tracking
- Clinical records

### 👩‍⚕️ Staff Management
- Doctor & nurse management
- Department allocation
- Staff role control

### 🩺 Clinical Records
- Vital signs
- Lab results
- Symptoms and observations

### 🔐 Security
- JWT authentication
- Role-based access control
- Password hashing
- Input validation

### 📱 Responsive UI
Modern responsive UI built with **React + Tailwind CSS**.

---

## 🏗 Project Structure
```
ApolloGuard/
├── backend/ # Node.js + Express API
├── frontend/ # React + Vite + Tailwind SPA
├── ml-service/ # FastAPI ML microservice
└── database/ # PostgreSQL schemas & migrations
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.10+
- PostgreSQL 15+
- Docker (optional)

---

## ⚙️ Installation

### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/apolloguard.git
cd apolloguard
```
### 2️⃣ Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```
### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
### 4️⃣ ML Service Setup
```bash
cd ml-service
python -m venv env

# Windows
env\Scripts\activate

# Linux / Mac
source env/bin/activate

pip install -r requirements.txt
python -m app.models.train
uvicorn app.main:app --reload --port 5001
```
## 🌐 Access the Application

**Frontend**  
http://localhost:5173

**Backend API**  
http://localhost:5000

**ML Service**  
http://localhost:5001

**API Docs**  
http://localhost:5001/api/docs

---

## 🐳 Docker Setup

```bash
docker-compose up --build -d
```

---

## 🎯 Features by Role

### 👑 Admin
- User management
- Staff management
- System analytics
- Department management
- System configuration

### 👨‍⚕️ Doctor
- Patient list with risk levels
- AI prediction generation
- Diagnosis management
- Prescription writing
- Patient history

### 👩‍⚕️ Nurse
- Patient registration
- Clinical records entry
- Vital signs monitoring
- Doctor assignment

### 🧑 Patient
- Personal dashboard
- Medical records
- Diagnoses
- AI predictions
- Appointment scheduling

---

## 🧠 ML Models

### Patient Risk Prediction
- **Model:** XGBoost / Random Forest  
- **Features:** Age, vitals, lab results  
- **Output:** Risk level (Low / Moderate / High)  
- **Accuracy:** ~94%

### Disease Prediction
- **Model:** Multi-output Random Forest  
- **Input:** Symptoms + clinical data  
- **Output:** Possible diseases with probabilities

---

## 🗄 Database Schema

**Core Tables**
- `users` – user accounts
- `patients` – patient medical data
- `staff_details` – doctor & nurse details
- `clinical_records` – vital signs
- `predictions` – AI predictions
- `diagnoses` – doctor diagnoses

---

## 🔒 Security Features
- JWT authentication
- bcrypt password hashing
- Role-based access control (RBAC)
- Input validation
- SQL injection protection
- XSS protection
- Rate limiting

---

## 🗺 Roadmap

### Version 1.0 (Current)
- Authentication & role management
- Patient management
- Clinical records
- AI predictions
- Admin dashboard

### Version 2.0 (Upcoming)
- Appointment scheduling
- Secure messaging
- Billing system
- Pharmacy integration
- Lab results

### Version 3.0 (Future)
- Telemedicine
- Wearable device sync
- Multi-language support
- Predictive epidemic analytics

---

## ⚡ Demo Credentials

| Role | Email | Password |
|-----|-----|-----|
| Admin | admin@hospital.com | Admin@123 |
| Doctor | doctor1@hospital.com | Doctor@123 |
| Nurse | nurse1@hospital.com | Nurse@123 |
| Patient | patient1@hospital.com | Patient@123 |

---

## 👨‍💻 Author
**Yogesh**  
Full Stack Developer (Frontend + Backend + ML + Database)

---

## 📝 License
MIT License

---

## ❤️ Acknowledgments
- FastAPI
- React
- Tailwind CSS
- Recharts

---

**Made with ❤️ for better healthcare**
