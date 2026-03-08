import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Heart,
  Calendar,
  Clock,
  Download,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pill,
  FileText,
  User,
  RefreshCw
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

const MyDiagnosis = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [filteredDiagnoses, setFilteredDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    severe: 0,
    moderate: 0,
    mild: 0
  });

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  useEffect(() => {
    filterDiagnoses();
  }, [diagnoses, searchTerm, severityFilter, dateFilter]);

  const fetchDiagnoses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patient/diagnoses');
      console.log('Diagnoses data:', response.data);
      
      const diagnosesData = response.data;
      setDiagnoses(diagnosesData);
      
      // Calculate stats
      setStats({
        total: diagnosesData.length,
        severe: diagnosesData.filter(d => d.severity === 'severe').length,
        moderate: diagnosesData.filter(d => d.severity === 'moderate').length,
        mild: diagnosesData.filter(d => d.severity === 'mild').length
      });
      
    } catch (error) {
      console.error('Failed to fetch diagnoses:', error);
      toast.error('Failed to load diagnoses');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDiagnoses();
    setRefreshing(false);
    toast.success('Diagnoses updated');
  };

  const filterDiagnoses = () => {
    let filtered = [...diagnoses];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(d => d.severity === severityFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const threeMonthsAgo = subDays(now, 90);
      const sixMonthsAgo = subDays(now, 180);
      const yearAgo = subDays(now, 365);

      if (dateFilter === '3months') {
        filtered = filtered.filter(d => new Date(d.created_at) >= threeMonthsAgo);
      } else if (dateFilter === '6months') {
        filtered = filtered.filter(d => new Date(d.created_at) >= sixMonthsAgo);
      } else if (dateFilter === 'year') {
        filtered = filtered.filter(d => new Date(d.created_at) >= yearAgo);
      }
    }

    setFilteredDiagnoses(filtered);
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      severe: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
      moderate: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle },
      mild: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle }
    };
    return badges[severity] || badges.mild;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading diagnosis history...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">My Diagnoses</h1>
            <p className="text-gray-500 mt-1">View your complete diagnosis history</p>
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
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm">Download History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Diagnoses</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Severe</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.severe}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Moderate</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.moderate}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Mild</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.mild}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by diagnosis or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition bg-white"
            >
              <option value="all">All Severities</option>
              <option value="severe">Severe</option>
              <option value="moderate">Moderate</option>
              <option value="mild">Mild</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition bg-white"
            >
              <option value="all">All Time</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Diagnoses List */}
      <div className="px-8 py-6">
        <div className="space-y-4">
          {filteredDiagnoses.map((diagnosis) => {
            const severityBadge = getSeverityBadge(diagnosis.severity);
            const SeverityIcon = severityBadge.icon;
            
            return (
              <div
                key={diagnosis.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{diagnosis.diagnosis}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${severityBadge.bg} ${severityBadge.text}`}>
                        <SeverityIcon className="w-3 h-3 mr-1" />
                        {diagnosis.severity}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Diagnosed By</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">Dr. {diagnosis.doctor_name}</p>
                        {diagnosis.doctor_specialization && (
                          <p className="text-xs text-gray-500 mt-0.5">{diagnosis.doctor_specialization}</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {format(new Date(diagnosis.created_at), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    {/* Prescription */}
                    {diagnosis.prescription && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Pill className="w-4 h-4 text-blue-600" />
                          <p className="text-sm font-medium text-blue-900">Prescription</p>
                        </div>
                        <p className="text-sm text-blue-700">{diagnosis.prescription}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {diagnosis.notes && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Clinical Notes</p>
                        <p className="text-sm text-gray-700">{diagnosis.notes}</p>
                      </div>
                    )}

                    {/* Follow-up */}
                    {diagnosis.follow_up_date && (
                      <div className="mt-4 flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-600">Follow-up scheduled:</span>
                        <span className="font-medium text-gray-900">
                          {format(new Date(diagnosis.follow_up_date), 'MMMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDiagnoses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No diagnoses found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDiagnosis;