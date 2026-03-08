import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Brain,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Activity,
  Calendar,
  RefreshCw,
  SlidersHorizontal,
  X,
  Eye,
  Sparkles,
  Zap,
  Cpu
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
import toast from 'react-hot-toast';

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    riskLevel: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total_predictions: 0,
    high_risk_count: 0,
    moderate_risk_count: 0,
    low_risk_count: 0,
    avg_confidence: 0
  });
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [mlStatus, setMlStatus] = useState({ available: false, checking: true });

  useEffect(() => {
    checkMLService();
    fetchPredictions();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [predictions, searchTerm, filters]);

  const checkMLService = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/health', { timeout: 2000 });
      setMlStatus({ available: response.status === 200, checking: false });
    } catch (error) {
      setMlStatus({ available: false, checking: false });
    }
  };

  const fetchPredictions = async () => {
    try {
      // First get all patients
      const patientsRes = await axios.get('http://localhost:5000/api/doctor/patients');
      const patients = patientsRes.data;
      
      // Then get predictions for each patient
      const allPredictions = [];
      for (const patient of patients) {
        try {
          const predRes = await axios.get(`http://localhost:5000/api/doctor/patients/${patient.id}/predictions`);
          const patientPredictions = predRes.data.map(pred => ({
            ...pred,
            patient_name: `${patient.first_name} ${patient.last_name}`,
            patient_id: patient.id,
            patient_age: patient.age,
            patient_gender: patient.gender,
            recommendations: typeof pred.recommendations === 'string' 
              ? JSON.parse(pred.recommendations) 
              : pred.recommendations || [],
            prediction_data: typeof pred.prediction_data === 'string'
              ? JSON.parse(pred.prediction_data)
              : pred.prediction_data || {}
          }));
          allPredictions.push(...patientPredictions);
        } catch (error) {
          console.log(`No predictions for patient ${patient.id}`);
        }
      }

      // Sort by date (newest first)
      allPredictions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setPredictions(allPredictions);

    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      toast.error('Failed to load predictions');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctor/predictions/stats/overview');
      console.log('Prediction stats:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch prediction stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPredictions(), fetchStats()]);
    setRefreshing(false);
    toast.success('Predictions updated');
  };

  const applyFilters = () => {
    let filtered = [...predictions];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply risk filter
    if (filters.riskLevel !== 'all') {
      filtered = filtered.filter(p => p.risk_level === filters.riskLevel);
    }

    // Apply date filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (filters.dateRange === 'today') {
        cutoff.setHours(0, 0, 0, 0);
        filtered = filtered.filter(p => new Date(p.created_at) >= cutoff);
      } else if (filters.dateRange === 'week') {
        cutoff.setDate(now.getDate() - 7);
        filtered = filtered.filter(p => new Date(p.created_at) >= cutoff);
      } else if (filters.dateRange === 'month') {
        cutoff.setMonth(now.getMonth() - 1);
        filtered = filtered.filter(p => new Date(p.created_at) >= cutoff);
      }
    }

    setFilteredPredictions(filtered);
  };

  const clearFilters = () => {
    setFilters({
      riskLevel: 'all',
      dateRange: 'all'
    });
    setSearchTerm('');
  };

  const getRiskBadge = (risk) => {
    const badges = {
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High Risk', icon: AlertCircle },
      moderate: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Moderate', icon: TrendingUp },
      low: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Low Risk', icon: Activity }
    };
    return badges[risk] || badges.low;
  };

  // Chart data
  const riskDistributionData = [
    { name: 'High Risk', value: stats.high_risk_count, color: '#EF4444' },
    { name: 'Moderate Risk', value: stats.moderate_risk_count, color: '#F59E0B' },
    { name: 'Low Risk', value: stats.low_risk_count, color: '#10B981' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading predictions...</p>
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
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">AI Predictions</h1>
              {mlStatus.available ? (
                <span className="flex items-center text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  <Zap className="w-3 h-3 mr-1" />
                  ML Active
                </span>
              ) : (
                <span className="flex items-center text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  <Cpu className="w-3 h-3 mr-1" />
                  Fallback Mode
                </span>
              )}
            </div>
            <p className="text-gray-500 mt-1">AI-powered patient risk assessments</p>
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
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Predictions</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_predictions}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">High Risk</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.high_risk_count}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Moderate Risk</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.moderate_risk_count}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Low Risk</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.low_risk_count}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Avg. Confidence</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.avg_confidence}%</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Distribution Pie Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ML Status Card */}
          <div className={`rounded-xl p-6 ${
            mlStatus.available ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className="flex items-start space-x-4">
              {mlStatus.available ? (
                <Zap className="w-12 h-12 text-emerald-600" />
              ) : (
                <Cpu className="w-12 h-12 text-amber-600" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {mlStatus.available ? 'ML Service Active' : 'Fallback Mode Active'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {mlStatus.available 
                    ? 'AI predictions are being generated using the ML model for highest accuracy'
                    : 'Using rule-based predictions (ML service unavailable). Check if ML service is running on port 5001.'}
                </p>
                {!mlStatus.available && (
                  <button
                    onClick={checkMLService}
                    className="mt-3 px-3 py-1 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Retry Connection
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2.5 border rounded-lg transition-colors ${
                showFilters ? 'bg-purple-50 border-purple-200 text-purple-600' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm">Filters</span>
            </button>
            {(filters.riskLevel !== 'all' || filters.dateRange !== 'all' || searchTerm) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Risk Level</label>
                  <select
                    value={filters.riskLevel}
                    onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="high">High Risk</option>
                    <option value="moderate">Moderate Risk</option>
                    <option value="low">Low Risk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPredictions.map((prediction) => {
            const riskBadge = getRiskBadge(prediction.risk_level);
            const RiskIcon = riskBadge.icon;
            const isML = prediction.prediction_data?.ml_version && !prediction.prediction_data?.is_fallback;
            
            return (
              <div
                key={prediction.id}
                onClick={() => {
                  setSelectedPrediction(prediction);
                  setShowDetails(true);
                }}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {prediction.patient_name?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {prediction.patient_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {prediction.patient_age}y • {prediction.patient_gender}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${riskBadge.bg} ${riskBadge.text}`}>
                    <RiskIcon className="w-3 h-3" />
                    <span>{riskBadge.label}</span>
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Confidence</span>
                    <span className="text-gray-900 font-medium">{Math.round(prediction.confidence_score)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-900 flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      {format(new Date(prediction.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {isML && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Source</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        ML Model
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">View Details</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPredictions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No predictions found</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-purple-600 hover:text-purple-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Prediction Details Modal */}
      {showDetails && selectedPrediction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Prediction Details</h2>
                  <p className="text-gray-500 mt-1">Patient: {selectedPrediction.patient_name}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* ML Badge */}
              {selectedPrediction.prediction_data?.ml_version && !selectedPrediction.prediction_data?.is_fallback && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center">
                  <Zap className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm text-purple-700">
                    Generated using ML Model v{selectedPrediction.prediction_data.ml_version}
                  </span>
                </div>
              )}

              {selectedPrediction.prediction_data?.is_fallback && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center">
                  <Cpu className="w-5 h-5 text-amber-600 mr-2" />
                  <span className="text-sm text-amber-700">
                    Generated using rule-based fallback (ML service unavailable)
                  </span>
                </div>
              )}

              {/* Risk Level Banner */}
              <div className={`p-4 rounded-xl mb-6 ${
                selectedPrediction.risk_level === 'high' ? 'bg-red-50 border border-red-200' :
                selectedPrediction.risk_level === 'moderate' ? 'bg-amber-50 border border-amber-200' :
                'bg-emerald-50 border border-emerald-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Risk Assessment</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    selectedPrediction.risk_level === 'high' ? 'bg-red-500 text-white' :
                    selectedPrediction.risk_level === 'moderate' ? 'bg-amber-500 text-white' :
                    'bg-emerald-500 text-white'
                  }`}>
                    {selectedPrediction.risk_level.toUpperCase()}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Confidence Score</span>
                    <span className="font-bold text-gray-900">{Math.round(selectedPrediction.confidence_score)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedPrediction.confidence_score > 80 ? 'bg-emerald-500' :
                        selectedPrediction.confidence_score > 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedPrediction.confidence_score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500">Age / Gender</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedPrediction.patient_age} years • {selectedPrediction.patient_gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Prediction Date</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {format(new Date(selectedPrediction.created_at), 'MMMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              {selectedPrediction.prediction_data?.risk_factors && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Risk Factors</h3>
                  <div className="space-y-2">
                    {selectedPrediction.prediction_data.risk_factors.map((factor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{factor.factor}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          factor.severity === 'high' ? 'bg-red-100 text-red-700' :
                          factor.severity === 'moderate' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {factor.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {(selectedPrediction.recommendations || []).map((rec, idx) => (
                    <div key={idx} className="flex items-start p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-sm text-blue-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Link
                  to={`/doctor/patients/${selectedPrediction.patient_id}`}
                  className="flex-1 bg-purple-600 text-white text-center py-3 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  onClick={() => setShowDetails(false)}
                >
                  View Patient Profile
                </Link>
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;