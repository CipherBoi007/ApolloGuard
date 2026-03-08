import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import Analytics from './pages/admin/Analytics';
import StaffManagement from './pages/admin/StaffManagement';
import AddUser from './pages/admin/AddUser';
import AdminSettings from './pages/admin/AdminSettings';
import UserDetails from './pages/admin/UserDetails';
import EditUser from './pages/admin/EditUser';


// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientsList from './pages/doctor/PatientsList';
import PatientDetails from './pages/doctor/PatientDetails';
import Predictions from './pages/doctor/Predictions';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorReports from './pages/doctor/DoctorReports';
import DoctorSettings from './pages/doctor/DoctorSettings';

// Nurse Pages
import NurseDashboard from './pages/nurse/NurseDashboard';
import PatientManagement from './pages/nurse/PatientManagement';
import ClinicalRecords from './pages/nurse/ClinicalRecords';
import NewPatient from './pages/nurse/NewPatient';
import NurseSchedule from './pages/nurse/NurseSchedule';
import NurseVitals from './pages/nurse/NurseVitals';
import NurseRecords from './pages/nurse/NurseRecords';
import AssignDoctor from './pages/nurse/AssignDoctor'; 
import EditPatient from './pages/nurse/EditPatient';
import NurseSettings from './pages/nurse/NurseSettings';


// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import MyRecords from './pages/patient/MyRecords';
import MyDiagnosis from './pages/patient/MyDiagnosis';
// import PatientAppointments from './pages/patient/PatientAppointments';
// import PatientMessages from './pages/patient/PatientMessages';
import PatientProfile from './pages/patient/PatientProfile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes with Layout */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="users/new" element={<AddUser />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="users/:id/edit" element={<EditUser />} />

      </Route>
      
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<PatientsList />} />
        <Route path="patients/:id" element={<PatientDetails />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="schedule" element={<DoctorSchedule />} />
        <Route path="reports" element={<DoctorReports />} />
        <Route path="settings" element={<DoctorSettings />} />

      </Route>
      
      <Route path="/nurse" element={
        <ProtectedRoute allowedRoles={['nurse']}>
          <Layout />
        </ProtectedRoute>
      }>
          <Route path="dashboard" element={<NurseDashboard />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="patients/new" element={<NewPatient />} />
          <Route path="schedule" element={<NurseSchedule />} />
          <Route path="vitals" element={<NurseVitals />} />
          <Route path="records" element={<NurseRecords />} />
          <Route path="patients/:id/records/" element={<ClinicalRecords />} />
          <Route path="patients/:patientId/assign-doctor" element={<AssignDoctor />} />
          <Route path="patients/edit/:id/" element={<EditPatient />} /> 
          <Route path="settings" element={<NurseSettings />} />
        </Route>
      
      <Route path="/patient" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="records" element={<MyRecords />} />
        <Route path="diagnosis" element={<MyDiagnosis />} />
        {/* <Route path="appointments" element={<PatientAppointments />} />
        <Route path="messages" element={<PatientMessages />} />  */}
        <Route path="profile" element={<PatientProfile />} />
      </Route>
    </Routes>
  );
}

export default App;