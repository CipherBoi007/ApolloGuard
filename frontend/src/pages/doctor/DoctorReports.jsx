import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Heart,
  Brain,
  BarChart3,
  PieChart,
  LineChart,
  Printer,
  Share2,
  Eye
} from 'lucide-react';
import { format, subDays, subMonths, subYears } from 'date-fns';
import {
  LineChart as ReLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import toast from 'react-hot-toast';

const DoctorReports = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('clinical');
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    newPatients: 0,
    followUps: 0,
    procedures: 0,
    avgWaitTime: 0,
    satisfaction: 0
  });

  // Mock data for charts
  const patientVolumeData = [
    { month: 'Jan', patients: 145, new: 32, followup: 113 },
    { month: 'Feb', patients: 152, new: 35, followup: 117 },
    { month: 'Mar', patients: 168, new: 38, followup: 130 },
    { month: 'Apr', patients: 175, new: 42, followup: 133 },
    { month: 'May', patients: 182, new: 45, followup: 137 },
    { month: 'Jun', patients: 190, new: 48, followup: 142 }
  ];

  const diagnosisData = [
    { name: 'Hypertension', value: 245, color: '#EF4444' },
    { name: 'Diabetes', value: 189, color: '#F59E0B' },
    { name: 'Hyperlipidemia', value: 156, color: '#3B82F6' },
    { name: 'Asthma', value: 98, color: '#10B981' },
    { name: 'Arthritis', value: 87, color: '#8B5CF6' }
  ];

  const outcomesData = [
    { month: 'Jan', improved: 85, stable: 12, declined: 3 },
    { month: 'Feb', improved: 87, stable: 10, declined: 3 },
    { month: 'Mar', improved: 88, stable: 9, declined: 3 },
    { month: 'Apr', improved: 90, stable: 8, declined: 2 },
    { month: 'May', improved: 91, stable: 7, declined: 2 },
    { month: 'Jun', improved: 92, stable: 6, declined: 2 }
  ];

  const mockReports = [
    {
      id: '1',
      name: 'Monthly Patient Summary',
      type: 'Clinical',
      date: subDays(new Date(), 2).toISOString(),
      format: 'PDF',
      size: '2.4 MB',
      url: '#'
    },
    {
      id: '2',
      name: 'Diagnosis Distribution Q2 2024',
      type: 'Analytics',
      date: subDays(new Date(), 5).toISOString(),
      format: 'Excel',
      size: '1.8 MB',
      url: '#'
    },
    {
      id: '3',
      name: 'Patient Outcome Metrics',
      type: 'Clinical',
      date: subDays(new Date(), 7).toISOString(),
      format: 'PDF',
      size: '3.1 MB',
      url: '#'
    },
    {
      id: '4',
      name: 'Prescription Report',
      type: 'Medication',
      date: subDays(new Date(), 10).toISOString(),
      format: 'CSV',
      size: '856 KB',
      url: '#'
    },
    {
      id: '5',
      name: 'Follow-up Compliance',
      type: 'Analytics',
      date: subDays(new Date(), 12).toISOString(),
      format: 'PDF',
      size: '1.2 MB',
      url: '#'
    }
  ];

  useEffect(() => {
    fetchReports();
  }, [dateRange, reportType]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReports(mockReports);
      setStats({
        totalPatients: 1052,
        newPatients: 248,
        followUps: 804,
        procedures: 156,
        avgWaitTime: 8.5,
        satisfaction: 94
      });

    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
    toast.success('Reports updated');
  };

  const handleDownload = (report) => {
    toast.success(`Downloading ${report.name}`);
    // Implement actual download logic
  };

  const handleGenerateReport = () => {
    toast.success('Generating new report...');
    // Implement report generation
  };

  const getFormatIcon = (format) => {
    switch(format) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'Excel':
        return <FileText className="w-5 h-5 text-emerald-500" />;
      case 'CSV':
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center mt-4 text-gray-600">Loading reports...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-500 mt-1">Generate and view clinical reports</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm text-gray-600">Refresh</span>
            </button>
            <button
              onClick={handleGenerateReport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Patients</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalPatients}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">New Patients</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{stats.newPatients}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Follow-ups</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{stats.followUps}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Procedures</p>
            <p className="text-xl font-bold text-purple-600 mt-1">{stats.procedures}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Avg Wait Time</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{stats.avgWaitTime} min</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Satisfaction</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{stats.satisfaction}%</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="clinical">Clinical Reports</option>
              <option value="analytics">Analytics</option>
              <option value="medication">Medication Reports</option>
              <option value="financial">Financial Reports</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Volume Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Patient Volume</h2>
              <select className="text-sm border border-gray-200 rounded-lg px-2 py-1">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="new" fill="#3B82F6" name="New Patients" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="followup" fill="#10B981" name="Follow-ups" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Diagnosis Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Diagnoses</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">View Details →</button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={diagnosisData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {diagnosisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Patient Outcomes */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Patient Outcomes</h2>
              <div className="flex items-center space-x-2">
                <span className="flex items-center text-xs">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full mr-1"></span>
                  Improved
                </span>
                <span className="flex items-center text-xs">
                  <span className="w-3 h-3 bg-amber-500 rounded-full mr-1"></span>
                  Stable
                </span>
                <span className="flex items-center text-xs">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                  Declined
                </span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={outcomesData}>
                  <defs>
                    <linearGradient id="improvedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip />
                  <Area type="monotone" dataKey="improved" stackId="1" stroke="#10B981" fill="url(#improvedGradient)" name="Improved" />
                  <Area type="monotone" dataKey="stable" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} name="Stable" />
                  <Area type="monotone" dataKey="declined" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Declined" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {reports.map((report) => (
              <div key={report.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getFormatIcon(report.format)}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{report.name}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-500">{report.type}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-xs text-gray-500">{format(new Date(report.date), 'MMM d, yyyy')}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-xs text-gray-500">{report.format} • {report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(report)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Print">
                      <Printer className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Share">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorReports;