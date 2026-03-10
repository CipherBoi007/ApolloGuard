import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  ChevronRight,
  Stethoscope,
  HeartPulse,
  Brain,
  RefreshCw,
  UserPlus,
  Activity,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
    total_patients: 0,
    pending_diagnoses: 0,
    high_risk_count: 0,
    total_predictions: 0,
    avg_confidence: 0,
    recent_patients: [],
    appointments: [],
    risk_distribution: [],
    recent_predictions: [],
    weekly_trends: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctor/dashboard/stats');
      console.log('Dashboard data:', response.data);
      setDashboardData(response.data);
      setLastUpdated(new Date());
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

  const getRiskBadge = (risk) => {
    const badges = {
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High Risk' },
      moderate: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Moderate' },
      low: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Low Risk' }
    };
    return badges[risk] || badges.low;
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: dashboardData.total_patients,
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      link: '/doctor/patients'
    },
    {
      title: 'Pending Reviews',
      value: dashboardData.pending_diagnoses,
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      link: '/doctor/predictions'
    },
    {
      title: 'High Risk',
      value: dashboardData.high_risk_count,
      icon: AlertCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      link: '/doctor/patients?risk=high'
    },
    {
      title: 'AI Predictions',
      value: dashboardData.total_predictions,
      subtitle: `${dashboardData.avg_confidence}% avg confidence`,
      icon: Brain,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      link: '/doctor/predictions'
    }
  ];

  const riskColors = {
    high: '#EF4444',
    moderate: '#F59E0B',
    low: '#10B981'
  };

  const riskData = dashboardData.risk_distribution.map(item => ({
    name: item.risk_level.charAt(0).toUpperCase() + item.risk_level.slice(1),
    value: parseInt(item.count),
    color: riskColors[item.risk_level]
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, Dr. {user?.last_name || 'Smith'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Live Indicator */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-slate-500">
                  Live • Updated {format(lastUpdated, 'h:mm:ss a')}
                </span>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
                title="Refresh dashboard"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 group-hover:text-slate-900 ${
                  refreshing ? 'animate-spin' : ''
                }`} />
              </button>
            </div>
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
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.iconBg} rounded-xl group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-600 mt-1">{stat.title}</p>
                {stat.subtitle && (
                  <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Patients */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-900">Recent Patients</h2>
                <Link 
                  to="/doctor/patients" 
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium"
                >
                  View all
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {dashboardData.recent_patients.map((patient) => {
                  const riskBadge = getRiskBadge(patient.risk_level);
                  return (
                    <Link
                      key={patient.id}
                      to={`/doctor/patients/${patient.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                            {patient.first_name?.[0]}{patient.last_name?.[0]}
                          </div>
                          {patient.risk_level && (
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              patient.risk_level === 'high' ? 'bg-red-500' :
                              patient.risk_level === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {patient.first_name} {patient.last_name}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm text-slate-500 mt-1">
                            <span>{patient.age || 'N/A'}y • {patient.gender || 'N/A'}</span>
                            {patient.last_visit && (
                              <>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {format(new Date(patient.last_visit), 'MMM d')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {patient.risk_level && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${riskBadge.bg} ${riskBadge.text}`}>
                          {riskBadge.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Weekly Trends */}
            {dashboardData.weekly_trends.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Weekly Activity</h2>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Activity className="w-4 h-4" />
                    <span>Last 7 days</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.weekly_trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="day" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 12 }} />
                      <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                      />
                      <Bar dataKey="predictions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50/50">
                <h2 className="text-lg font-semibold text-slate-900">Today's Schedule</h2>
                <p className="text-sm text-slate-600 mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
              </div>
              <div className="divide-y divide-slate-100">
                {dashboardData.appointments.length > 0 ? (
                  dashboardData.appointments.map((apt) => (
                    <div key={apt.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{apt.patient_name}</p>
                          <p className="text-sm text-slate-500 mt-1">{apt.type}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                            apt.status === 'waiting' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {apt.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No appointments today</p>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                <Link 
                  to="/doctor/schedule" 
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center font-medium"
                >
                  View full schedule
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Risk Distribution */}
            {riskData.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Risk Distribution</h2>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  {riskData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-slate-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Predictions */}
            {dashboardData.recent_predictions.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Predictions</h2>
                <div className="space-y-3">
                  {dashboardData.recent_predictions.map((pred) => {
                    const riskBadge = getRiskBadge(pred.risk_level);
                    return (
                      <Link
                        key={pred.id}
                        to={`/doctor/predictions/${pred.id}`}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                            {pred.patient_name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {format(new Date(pred.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${riskBadge.bg} ${riskBadge.text}`}>
                            {riskBadge.label}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">{pred.confidence_score}% confidence</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Link 
                    to="/doctor/predictions" 
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center font-medium"
                  >
                    View all predictions
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;