import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  ClipboardList,
  UserPlus,
  Clock,
  Calendar,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  UserCheck,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const NurseDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    today_records: 0,
    total_patients: 0,
    unassigned_patients: 0,
    recent_patients: [],
    recent_records: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/nurse/dashboard/stats');
      console.log('Dashboard data:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  const statCards = [
    {
      title: 'Total Patients',
      value: dashboardData.total_patients,
      icon: Users,
      color: 'bg-blue-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      link: '/nurse/patients'
    },
    {
      title: "Today's Records",
      value: dashboardData.today_records,
      icon: ClipboardList,
      color: 'bg-emerald-500',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      link: '/nurse/records'
    },
    {
      title: 'Unassigned Patients',
      value: dashboardData.unassigned_patients,
      icon: UserCheck,
      color: 'bg-amber-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      link: '/nurse/patients?unassigned=true'
    },
    {
      title: 'Pending Tasks',
      value: dashboardData.recent_records?.length || 0,
      icon: Clock,
      color: 'bg-purple-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      link: '/nurse/tasks'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nurse Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back, {user?.first_name} {user?.last_name}
            </p>
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
            <Link
              to="/nurse/patients/new"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">New Patient</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.link}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 ${stat.iconBg} rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
              <Link to="/nurse/patients" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {dashboardData.recent_patients?.length > 0 ? (
                dashboardData.recent_patients.map((patient) => (
                  <Link
                    key={patient.id}
                    to={`/nurse/patients/${patient.id}/records`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {patient.first_name?.[0]}{patient.last_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                          <span>{patient.age || 'N/A'}y • {patient.gender || 'N/A'}</span>
                          {patient.blood_group && (
                            <>
                              <span>•</span>
                              <span>Blood: {patient.blood_group}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {patient.last_record && (
                      <div className="text-xs text-gray-400">
                        {format(new Date(patient.last_record), 'MMM d')}
                      </div>
                    )}
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No recent patients
                </div>
              )}
            </div>
          </div>

          {/* Recent Records */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Records</h2>
              <Link to="/nurse/records" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {dashboardData.recent_records?.length > 0 ? (
                dashboardData.recent_records.map((record) => (
                  <div
                    key={record.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{record.patient_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {format(new Date(record.created_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {format(new Date(record.created_at), 'MMM d')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No recent records
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-8 pb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/nurse/patients/new"
              className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center"
            >
              <UserPlus className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Patient</p>
            </Link>
            <Link
              to="/nurse/patients"
              className="p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors text-center"
            >
              <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">View Patients</p>
            </Link>
            <Link
              to="/nurse/records"
              className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center"
            >
              <ClipboardList className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Clinical Records</p>
            </Link>
            <Link
              to="/nurse/patients?unassigned=true"
              className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-center"
            >
              <UserCheck className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Assign Doctors</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Unassigned Patients Alert */}
      {dashboardData.unassigned_patients > 0 && (
        <div className="px-8 pb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {dashboardData.unassigned_patients} patient(s) need doctor assignment
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Please assign a primary doctor to these patients
                  </p>
                </div>
              </div>
              <Link
                to="/nurse/patients?unassigned=true"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                View →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseDashboard;