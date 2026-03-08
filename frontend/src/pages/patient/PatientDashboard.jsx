import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Heart,
  Activity,
  Calendar,
  FileText,
  Brain,
  ChevronRight,
  RefreshCw,
  User,
  Clock,
  AlertCircle,
  Pill,
  Beaker,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    patient_info: {},
    records_count: 0,
    diagnoses_count: 0,
    predictions_count: 0,
    recent_records: [],
    recent_diagnoses: [],
    recent_predictions: [],
    upcoming_appointments: [],
    lab_summary: { total: 0, latest: null },
    last_visit: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patient/dashboard');
      console.log('Dashboard data:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    toast.success('Dashboard updated');
  };

  const getRiskBadge = (risk) => {
    const badges = {
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High Risk' },
      moderate: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Moderate' },
      low: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Low Risk' }
    };
    return badges[risk] || badges.low;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const patient = dashboardData.patient_info;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {patient?.first_name}
            </h1>
            <p className="text-gray-500 mt-1">Here's your health overview</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm text-gray-600">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Info Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Age / Gender</p>
                <p className="text-sm font-medium text-gray-900">
                  {patient?.age || 'N/A'}y • {patient?.gender || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Blood Group</p>
                <p className="text-sm font-medium text-gray-900">{patient?.blood_group || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Height / Weight</p>
                <p className="text-sm font-medium text-gray-900">
                  {patient?.height || 'N/A'} cm / {patient?.weight || 'N/A'} kg
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Visit</p>
                <p className="text-sm font-medium text-gray-900">
                  {dashboardData.last_visit ? format(new Date(dashboardData.last_visit), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Doctor Info */}
        {patient?.primary_doctor_id && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Primary Doctor</p>
                  <p className="text-base font-medium text-gray-900">
                    Dr. {patient.doctor_first_name} {patient.doctor_last_name}
                  </p>
                </div>
              </div>
              <Link
                to="/patient/my-doctor"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View Details →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/patient/records"
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.records_count}</p>
                <p className="text-sm text-gray-500">Clinical Records</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Link>

          <Link
            to="/patient/diagnoses"
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.diagnoses_count}</p>
                <p className="text-sm text-gray-500">Diagnoses</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Heart className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Link>

          <Link
            to="/patient/predictions"
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.predictions_count}</p>
                <p className="text-sm text-gray-500">AI Predictions</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Link>

          <Link
            to="/patient/lab-results"
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.lab_summary.total}</p>
                <p className="text-sm text-gray-500">Lab Tests</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Beaker className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Records */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Records</h2>
              <Link to="/patient/records" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {dashboardData.recent_records?.length > 0 ? (
                dashboardData.recent_records.map((record) => (
                  <div key={record.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(record.record_date), 'MMMM d, yyyy')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Recorded by {record.recorded_by_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700">
                          {record.blood_pressure_systolic && 
                            `${record.blood_pressure_systolic}/${record.blood_pressure_diastolic}`
                          }
                        </p>
                      </div>
                    </div>
                    {record.symptoms && (
                      <p className="text-xs text-gray-500 mt-2 italic">"{record.symptoms}"</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No recent records
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link to="/patient/appointments" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {dashboardData.upcoming_appointments?.length > 0 ? (
                dashboardData.upcoming_appointments.map((apt) => (
                  <div key={apt.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{apt.doctor_name}</p>
                        <p className="text-xs text-gray-500 mt-1">{apt.specialty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(apt.date), 'MMM d')}
                        </p>
                        <p className="text-xs text-gray-500">{apt.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No upcoming appointments
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Predictions */}
      {dashboardData.recent_predictions?.length > 0 && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Predictions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.recent_predictions.map((pred) => {
                const riskBadge = getRiskBadge(pred.risk_level);
                return (
                  <div key={pred.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        {format(new Date(pred.created_at), 'MMM d, yyyy')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${riskBadge.bg} ${riskBadge.text}`}>
                        {riskBadge.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Confidence: {pred.confidence_score}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-8 pb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/patient/appointments/new"
              className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center"
            >
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Book Appointment</p>
            </Link>
            <Link
              to="/patient/messages"
              className="p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors text-center"
            >
              <MessageSquare className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Message Doctor</p>
            </Link>
            <Link
              to="/patient/prescriptions"
              className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center"
            >
              <Pill className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">My Prescriptions</p>
            </Link>
            <Link
              to="/patient/profile"
              className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-center"
            >
              <User className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">My Profile</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;