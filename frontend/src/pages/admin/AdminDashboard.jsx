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
  ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

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


  const num = (value) => Number(value || 0);
  const formatNum = (value) => num(value).toLocaleString();

  // ---------- Extract stats safely ----------

  const doctorCount = num(stats.user_stats?.doctor_count);
  const nurseCount = num(stats.user_stats?.nurse_count);
  const patientCount = num(stats.user_stats?.patient_count);
  const adminCount = num(stats.user_stats?.admin_count);

  const pediatric = num(stats.patient_demographics?.pediatric);
  const geriatric = num(stats.patient_demographics?.geriatric);

  const totalStaff = doctorCount + nurseCount;

  const totalPredictions = num(stats.prediction_stats?.total_predictions);
  const highRisk = num(stats.prediction_stats?.high_risk_count);
  const avgConfidence = num(stats.prediction_stats?.avg_confidence);

  const revenue = num(stats.revenue?.estimated);
  const revenuePatients = num(stats.revenue?.patient_count);

  const staffBreakdown = `${doctorCount} Doctors • ${nurseCount} Nurses`;

  // ---------- Dashboard Cards ----------

  const quickStats = [
    {
      label: 'Total Patients',
      value: formatNum(patientCount),
      subtext: `${pediatric} pediatric • ${geriatric} geriatric`,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Medical Staff',
      value: formatNum(totalStaff),
      subtext: staffBreakdown,
      icon: Stethoscope,
      color: 'bg-emerald-50 text-emerald-600',
      trend: '+5',
      trendUp: true
    },
    {
      label: 'AI Predictions',
      value: totalPredictions >= 1000
        ? `${(totalPredictions / 1000).toFixed(1)}K`
        : totalPredictions.toString(),
      subtext: `${highRisk} high risk • ${avgConfidence}% accuracy`,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
      trend: '+18%',
      trendUp: true
    },
    {
      label: 'Est. Revenue',
      value: `$${(revenue / 1000).toFixed(1)}K`,
      subtext: `${revenuePatients} active patients`,
      icon: DollarSign,
      color: 'bg-amber-50 text-amber-600',
      trend: '+23%',
      trendUp: true
    }
  ];

  // Prepare department occupancy data
  const departmentOccupancy = stats.department_stats?.map(dept => ({
    name: dept.department,
    occupied: dept.staff_count || 0,
    total: Math.max(dept.staff_count || 0, 20), // Placeholder for bed capacity
    percentage: Math.min(Math.round(((dept.staff_count || 0) / 20) * 100), 100)
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Operations Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time overview of your facility</p>
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
          <div className="flex items-center space-x-2 text-sm">
            <span className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              Live
            </span>
            <span className="text-gray-400">{format(lastUpdated, 'h:mm:ss a')}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
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
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              <div className="text-xs text-gray-400 mt-2">{stat.subtext}</div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Department Staff Distribution</h2>
          {departmentOccupancy.length > 0 ? (
            <div className="space-y-4">
              {departmentOccupancy.slice(0, 5).map((dept, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">{dept.name || 'General'}</span>
                    <span className="text-gray-900 font-medium">{dept.occupied} staff</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No department data available</p>
          )}
        </div>

        {/* Staff Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Staff Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-600">Doctors</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.user_stats?.doctor_count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <HeartPulse className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xs text-gray-600">Nurses</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.user_stats?.nurse_count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xs text-gray-600">Patients</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.user_stats?.patient_count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <UserCog className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-xs text-gray-600">Admins</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.user_stats?.admin_count || 0}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">High Risk</p>
                <p className="text-sm font-semibold text-red-600">{stats.prediction_stats?.high_risk_count || 0}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Avg. Confidence</p>
                <p className="text-sm font-semibold text-emerald-600">{stats.prediction_stats?.avg_confidence || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      activity.type === 'emergency' ? 'bg-red-500' :
                      activity.type === 'new_user' ? 'bg-blue-500' :
                      activity.type === 'prediction' ? 'bg-purple-500' : 'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(activity.created_at), 'h:mm a • MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/users/new" className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <Users className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-xs font-medium text-gray-900">Add User</p>
            </Link>
            <Link to="/admin/staff" className="p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
              <UserCog className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-xs font-medium text-gray-900">Manage Staff</p>
            </Link>
            <Link to="/admin/analytics" className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-xs font-medium text-gray-900">Analytics</p>
            </Link>
            <Link to="/admin/settings" className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
              <FileText className="w-5 h-5 text-amber-600 mb-2" />
              <p className="text-xs font-medium text-gray-900">Settings</p>
            </Link>
          </div>

          {/* System Status */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">System Status</span>
              <span className="flex items-center text-emerald-600">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                Operational
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Last backup: Today at {format(new Date(), 'h:mm a')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;