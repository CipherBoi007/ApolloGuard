import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  Users,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Activity,
  Clock,
  BarChart3
} from 'lucide-react';
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
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalRecords: 0,
    avgConfidence: 0,
    growthRate: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/analytics?timeframe=${timeframe}`);
      console.log('Analytics data:', response.data);
      
      setData(response.data);
      
      // Calculate metrics
      const totalUsers = response.data.user_registration_trend?.reduce((acc, curr) => acc + (curr.new_users || 0), 0) || 0;
      const totalRecords = response.data.clinical_records_trend?.reduce((acc, curr) => acc + (curr.total_records || 0), 0) || 0;
      const avgConfidence = response.data.summary?.avg_confidence || 0;
      
      // Calculate growth rate
      const trends = response.data.user_registration_trend || [];
      const recent = trends.slice(-3).reduce((acc, curr) => acc + (curr.new_users || 0), 0);
      const previous = trends.slice(0, 3).reduce((acc, curr) => acc + (curr.new_users || 0), 0);
      const growthRate = previous ? Math.round(((recent - previous) / previous) * 100) : 0;
      
      setMetrics({
        totalUsers,
        totalRecords,
        avgConfidence,
        growthRate
      });

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    toast.success('Analytics updated');
  };

  const handleExport = () => {
    toast.success('Export started');
    // Implement export logic
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Format data for charts
  const userGrowthData = data?.user_registration_trend?.map(item => ({
    date: format(parseISO(item.date), 'MMM d'),
    patients: item.new_patients || 0,
    doctors: item.new_doctors || 0,
    nurses: item.new_nurses || 0,
    total: item.new_users || 0
  })) || [];

  const riskData = data?.risk_distribution?.map(item => ({
    name: item.risk_level?.charAt(0).toUpperCase() + item.risk_level?.slice(1) || 'Unknown',
    value: parseInt(item.count) || 0,
    color: item.risk_level === 'high' ? '#EF4444' :
           item.risk_level === 'moderate' ? '#F59E0B' : '#10B981'
  })) || [];

  const clinicalTrendData = data?.clinical_records_trend?.map(item => ({
    date: format(parseISO(item.date), 'MMM d'),
    records: item.total_records || 0,
    patients: item.unique_patients || 0
  })) || [];

  const deptData = data?.department_performance?.map(item => ({
    name: item.department,
    records: item.total_records || 0,
    diagnoses: item.total_diagnoses || 0,
    patients: item.total_patients || 0
  })) || [];

  const topDiagnoses = data?.top_diagnoses || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-500 text-sm mt-1">Deep dive into your hospital's performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">Last 12 months</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <div className="flex items-start justify-between mb-3">
            <Users className="w-5 h-5 opacity-90" />
            <span className="text-xs opacity-75">Total</span>
          </div>
          <div className="text-2xl font-bold mb-1">{metrics.totalUsers.toLocaleString()}</div>
          <div className="text-sm opacity-90">New Users</div>
          <div className="text-xs opacity-75 mt-2">
            {metrics.growthRate > 0 ? `+${metrics.growthRate}% vs previous` : `${metrics.growthRate}% vs previous`}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-5 text-white">
          <div className="flex items-start justify-between mb-3">
            <Activity className="w-5 h-5 opacity-90" />
            <span className="text-xs opacity-75">Records</span>
          </div>
          <div className="text-2xl font-bold mb-1">{metrics.totalRecords.toLocaleString()}</div>
          <div className="text-sm opacity-90">Clinical Records</div>
          <div className="text-xs opacity-75 mt-2">Across all departments</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5 text-white">
          <div className="flex items-start justify-between mb-3">
            <Brain className="w-5 h-5 opacity-90" />
            <span className="text-xs opacity-75">Accuracy</span>
          </div>
          <div className="text-2xl font-bold mb-1">{metrics.avgConfidence}%</div>
          <div className="text-sm opacity-90">AI Prediction Accuracy</div>
          <div className="text-xs opacity-75 mt-2">Based on {data?.risk_distribution?.reduce((acc, curr) => acc + (parseInt(curr.count) || 0), 0) || 0} predictions</div>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-5 text-white">
          <div className="flex items-start justify-between mb-3">
            <Clock className="w-5 h-5 opacity-90" />
            <span className="text-xs opacity-75">Period</span>
          </div>
          <div className="text-2xl font-bold mb-1 capitalize">{timeframe}</div>
          <div className="text-sm opacity-90">Time Range</div>
          <div className="text-xs opacity-75 mt-2">Click to change view</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">User Registration Trends</h2>
              <p className="text-xs text-gray-500 mt-0.5">New users over time</p>
            </div>
          </div>
          <div className="h-80">
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="patients" stroke="#3B82F6" strokeWidth={2} name="Patients" />
                  <Line type="monotone" dataKey="doctors" stroke="#10B981" strokeWidth={2} name="Doctors" />
                  <Line type="monotone" dataKey="nurses" stroke="#F59E0B" strokeWidth={2} name="Nurses" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available for this period
              </div>
            )}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Risk Distribution</h2>
              <p className="text-xs text-gray-500 mt-0.5">Patient risk levels</p>
            </div>
          </div>
          <div className="h-80 flex items-center justify-center">
            {riskData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute bg-white/80 backdrop-blur-sm p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Total: {riskData.reduce((acc, curr) => acc + curr.value, 0)}</p>
                </div>
              </>
            ) : (
              <div className="text-gray-400">No risk data available</div>
            )}
          </div>
        </div>

        {/* Clinical Records Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Clinical Records Trend</h2>
              <p className="text-xs text-gray-500 mt-0.5">Records and unique patients over time</p>
            </div>
          </div>
          <div className="h-80">
            {clinicalTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clinicalTrendData}>
                  <defs>
                    <linearGradient id="recordsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="patientsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="records" stroke="#3B82F6" fill="url(#recordsGradient)" name="Records" />
                  <Area type="monotone" dataKey="patients" stroke="#10B981" fill="url(#patientsGradient)" name="Patients" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No clinical records data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Diagnoses */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Diagnoses</h2>
          <div className="space-y-3">
            {topDiagnoses.length > 0 ? (
              topDiagnoses.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{item.diagnosis}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-gray-900">{item.count}</span>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${(item.count / (topDiagnoses[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">No diagnosis data available</p>
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white">
          <h2 className="text-sm font-semibold mb-4">Key Insights</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">↑</div>
              <div>
                <p className="text-sm">Patient volume {metrics.growthRate > 0 ? 'up' : 'down'} {Math.abs(metrics.growthRate)}%</p>
                <p className="text-xs text-gray-400 mt-0.5">Compared to previous period</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                {riskData.find(r => r.name === 'High')?.value || 0}
              </div>
              <div>
                <p className="text-sm">High risk patients: {riskData.find(r => r.name === 'High')?.value || 0}</p>
                <p className="text-xs text-gray-400 mt-0.5">Need immediate attention</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">✓</div>
              <div>
                <p className="text-sm">AI prediction accuracy: {metrics.avgConfidence}%</p>
                <p className="text-xs text-gray-400 mt-0.5">Above target threshold</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Period-over-Period</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">User Growth</span>
                <span className={metrics.growthRate > 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {metrics.growthRate > 0 ? '+' : ''}{metrics.growthRate}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${metrics.growthRate > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(metrics.growthRate), 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Record Creation</span>
                <span className="text-emerald-600">+15%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Target Achievement</span>
                <span className="text-amber-600">92%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Performance Table */}
      {deptData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Department Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Department</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">Records</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">Diagnoses</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">Patients</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deptData.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{dept.name}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{dept.records}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{dept.diagnoses}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{dept.patients}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-600">
                        {Math.round((dept.records / (deptData[0]?.records || 1)) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;