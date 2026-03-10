import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  UserCog,
  Activity,
  TrendingUp,
  Calendar,
  ChevronRight,
  DollarSign,
  FileText,
  RefreshCw,
  Stethoscope,
  HeartPulse,
  Clock,
  AlertCircle,
  BedDouble,
  Ambulance,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Shield,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    user_stats: { total_users: 0, doctor_count: 0, nurse_count: 0, patient_count: 0, admin_count: 0 },
    patient_demographics: { total_patients: 0, pediatric: 0, adult: 0, geriatric: 0 },
    prediction_stats: { total_predictions: 0, high_risk_count: 0, moderate_risk_count: 0, low_risk_count: 0, avg_confidence: 0 },
    revenue: { estimated: 0, patient_count: 0 },
    department_stats: [],
    monthly_trends: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/dashboard/stats');
      console.log('Dashboard data:', response.data);
      
      setStats(response.data);
      setRecentActivity(response.data.recent_activity || []);
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

  // Fixed calculations with proper number conversion
  const doctorCount = Number(stats.user_stats?.doctor_count || 0);
  const nurseCount = Number(stats.user_stats?.nurse_count || 0);
  const totalStaff = doctorCount + nurseCount;
  const staffBreakdown = `${doctorCount} Doctors • ${nurseCount} Nurses`;
  
  const statCards = [
    {
      title: 'Total Patients',
      value: stats.user_stats?.patient_count?.toLocaleString() || '0',
      subtext: `${stats.patient_demographics?.pediatric || 0} pediatric • ${stats.patient_demographics?.geriatric || 0} geriatric`,
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: '+12.3%',
      trendUp: true,
      link: '/admin/users?role=patient',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Medical Staff',
      value: totalStaff.toLocaleString(),
      subtext: staffBreakdown,
      icon: Stethoscope,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      trend: '+5',
      trendUp: true,
      link: '/admin/staff',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'AI Predictions',
      value: (stats.prediction_stats?.total_predictions || 0) >= 1000 
        ? `${(stats.prediction_stats?.total_predictions / 1000).toFixed(1)}K` 
        : (stats.prediction_stats?.total_predictions || 0).toString(),
      subtext: `${stats.prediction_stats?.high_risk_count || 0} high risk • ${stats.prediction_stats?.avg_confidence || 0}% accuracy`,
      icon: Sparkles,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trend: '+18.2%',
      trendUp: true,
      link: '/admin/analytics',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Est. Revenue',
      value: `$${((stats.revenue?.estimated || 0) / 1000).toFixed(1)}K`,
      subtext: `${stats.revenue?.patient_count || 0} active patients`,
      icon: DollarSign,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      trend: '+23.1%',
      trendUp: true,
      link: '/admin/analytics',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  // Prepare department occupancy data
  const departmentOccupancy = stats.department_stats?.map(dept => ({
    name: dept.department || 'General',
    occupied: dept.staff_count || 0,
    total: Math.max(dept.staff_count || 0, 20),
    percentage: Math.min(Math.round(((dept.staff_count || 0) / 20) * 100), 100)
  })) || [];

  // Mock chart data (replace with real data)
  const weeklyActivityData = [
    { day: 'Mon', patients: 24, predictions: 18 },
    { day: 'Tue', patients: 32, predictions: 24 },
    { day: 'Wed', patients: 28, predictions: 22 },
    { day: 'Thu', patients: 35, predictions: 28 },
    { day: 'Fri', patients: 42, predictions: 34 },
    { day: 'Sat', patients: 18, predictions: 12 },
    { day: 'Sun', patients: 12, predictions: 8 }
  ];

  const riskColors = {
    high: '#EF4444',
    moderate: '#F59E0B',
    low: '#22C55E'
  };

  const riskData = [
    { name: 'High Risk', value: stats.prediction_stats?.high_risk_count || 0, color: riskColors.high },
    { name: 'Moderate', value: stats.prediction_stats?.moderate_risk_count || 0, color: riskColors.moderate },
    { name: 'Low Risk', value: stats.prediction_stats?.low_risk_count || 0, color: riskColors.low }
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 text-sm mt-1">Welcome back, here's what's happening with your facility today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center space-x-2 text-sm bg-slate-100 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-slate-600">Last updated {format(lastUpdated, 'h:mm a')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.link}
                className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.iconBg} rounded-xl group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {stat.trend}
                    {stat.trendUp ? 
                      <ArrowUpRight className="w-3 h-3 ml-0.5" /> : 
                      <ArrowDownRight className="w-3 h-3 ml-0.5" />
                    }
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600 mb-2">{stat.title}</div>
                <div className="text-xs text-slate-500">{stat.subtext}</div>

                {/* Progress indicator for staff - FIXED CALCULATION */}
                {stat.title === 'Medical Staff' && totalStaff > 0 && (
                  <div className="mt-4">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ 
                          width: totalStaff > 0 
                            ? `${(doctorCount / totalStaff) * 100}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>Doctors: {doctorCount}</span>
                      <span>Nurses: {nurseCount}</span>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Weekly Activity</h2>
                <p className="text-sm text-slate-500 mt-1">Patient registrations and AI predictions</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Report →</button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData} barSize={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="patients" fill="#2563EB" radius={[4, 4, 0, 0]} name="Patients" />
                  <Bar dataKey="predictions" fill="#14B8A6" radius={[4, 4, 0, 0]} name="Predictions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Risk Distribution</h2>
                <p className="text-sm text-slate-500 mt-1">Patient risk levels</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Details →</button>
            </div>
            <div className="h-72 flex items-center justify-center">
              {riskData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#94A3B8', strokeWidth: 1 }}
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
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No risk data available</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
              {riskData.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }}></div>
                  <p className="text-xs font-medium text-slate-600">{item.name}</p>
                  <p className="text-sm font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Department Distribution & Recent Activity */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Distribution */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Department Staff Distribution</h2>
                <p className="text-sm text-slate-500 mt-1">Staff allocation across departments</p>
              </div>
              <Link to="/admin/staff" className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
                Manage Staff
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            {departmentOccupancy.length > 0 ? (
              <div className="space-y-5">
                {departmentOccupancy.slice(0, 5).map((dept, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-700">{dept.name}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{dept.occupied} staff</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No department data available</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                <Link to="/admin/analytics" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1.5 w-2 h-2 rounded-full ${
                        activity.type === 'emergency' ? 'bg-red-500 animate-pulse' :
                        activity.type === 'admission' ? 'bg-emerald-500' :
                        activity.type === 'discharge' ? 'bg-blue-500' :
                        activity.type === 'prediction' ? 'bg-purple-500' : 'bg-slate-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{activity.description}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(new Date(activity.created_at), 'h:mm a • MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        {Math.floor(Math.random() * 30)}m
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-8 py-6 pb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/users/new"
              className="group p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition-all border border-blue-100"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <p className="font-medium text-slate-900">Add New User</p>
              <p className="text-xs text-slate-500 mt-1">Create admin, doctor, or nurse</p>
            </Link>

            <Link
              to="/admin/staff"
              className="group p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl hover:shadow-md transition-all border border-emerald-100"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <UserCog className="w-5 h-5 text-white" />
              </div>
              <p className="font-medium text-slate-900">Manage Staff</p>
              <p className="text-xs text-slate-500 mt-1">Update staff information</p>
            </Link>

            <Link
              to="/admin/analytics"
              className="group p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all border border-purple-100"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="font-medium text-slate-900">View Analytics</p>
              <p className="text-xs text-slate-500 mt-1">Deep dive into metrics</p>
            </Link>

            <Link
              to="/admin/settings"
              className="group p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl hover:shadow-md transition-all border border-amber-100"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <p className="font-medium text-slate-900">System Settings</p>
              <p className="text-xs text-slate-500 mt-1">Configure preferences</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;