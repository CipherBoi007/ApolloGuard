import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FileText,
  Calendar,
  Clock,
  Download,
  Search,
  Filter,
  ChevronRight,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Droplet,
  Eye,
  Printer,
  Share2,
  RefreshCw,
  AlertCircle,
  Beaker
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

const MyRecords = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    vitals: 0,
    labs: 0
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, dateFilter]);

  const fetchRecords = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patient/clinical-records');
      console.log('Records data:', response.data);
      
      const recordsData = response.data;
      setRecords(recordsData);
      
      // Calculate stats
      setStats({
        total: recordsData.length,
        vitals: recordsData.filter(r => r.blood_pressure_systolic).length,
        labs: recordsData.filter(r => r.blood_sugar || r.cholesterol_total).length
      });
      
    } catch (error) {
      console.error('Failed to fetch records:', error);
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
    toast.success('Records updated');
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.recorded_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const monthAgo = subDays(now, 30);
      const threeMonthsAgo = subDays(now, 90);
      const yearAgo = subDays(now, 365);

      if (dateFilter === 'month') {
        filtered = filtered.filter(r => new Date(r.record_date) >= monthAgo);
      } else if (dateFilter === '3months') {
        filtered = filtered.filter(r => new Date(r.record_date) >= threeMonthsAgo);
      } else if (dateFilter === 'year') {
        filtered = filtered.filter(r => new Date(r.record_date) >= yearAgo);
      }
    }

    setFilteredRecords(filtered);
  };

  const getVitalStatus = (type, value) => {
    if (!value) return null;
    
    const ranges = {
      bp_systolic: { low: 90, high: 140 },
      bp_diastolic: { low: 60, high: 90 },
      heart_rate: { low: 60, high: 100 },
      temperature: { low: 36.1, high: 37.5 },
      oxygen: { low: 95, high: 100 }
    };

    if (type === 'bp_systolic' && value > ranges.bp_systolic.high) return 'text-red-600';
    if (type === 'bp_diastolic' && value > ranges.bp_diastolic.high) return 'text-red-600';
    if (type === 'heart_rate' && (value < ranges.heart_rate.low || value > ranges.heart_rate.high)) return 'text-amber-600';
    if (type === 'temperature' && (value < ranges.temperature.low || value > ranges.temperature.high)) return 'text-amber-600';
    if (type === 'oxygen' && value < ranges.oxygen.low) return 'text-red-600';
    
    return 'text-emerald-600';
  };

  const handleDownload = (recordId) => {
    toast.success('Download started');
    // Implement actual download logic
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your records...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">My Medical Records</h1>
            <p className="text-gray-500 mt-1">View your complete medical history</p>
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
              <span className="text-sm">Download All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Vital Signs</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.vitals}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Lab Results</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.labs}</p>
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
                placeholder="Search by doctor, symptoms, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="all">All Time</option>
              <option value="month">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Timeline */}
      <div className="px-8 py-6">
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {format(new Date(record.record_date), 'MMMM d, yyyy')}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {record.recorded_by_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {format(new Date(record.record_date), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(record.id)}
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
                </div>
              </div>

              {/* Vital Signs */}
              {record.blood_pressure_systolic && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Blood Pressure</p>
                    <p className={`text-sm font-semibold ${getVitalStatus('bp_systolic', record.blood_pressure_systolic)}`}>
                      {record.blood_pressure_systolic}/{record.blood_pressure_diastolic}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Heart Rate</p>
                    <p className={`text-sm font-semibold ${getVitalStatus('heart_rate', record.heart_rate)}`}>
                      {record.heart_rate} bpm
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Temperature</p>
                    <p className={`text-sm font-semibold ${getVitalStatus('temperature', record.temperature)}`}>
                      {record.temperature}°C
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">O2 Saturation</p>
                    <p className={`text-sm font-semibold ${getVitalStatus('oxygen', record.oxygen_saturation)}`}>
                      {record.oxygen_saturation}%
                    </p>
                  </div>
                </div>
              )}

              {/* Lab Results */}
              {(record.blood_sugar || record.cholesterol_total) && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Beaker className="w-4 h-4 mr-2 text-gray-500" />
                    Lab Results
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {record.blood_sugar && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Blood Sugar</p>
                        <p className="text-sm font-medium text-gray-900">{record.blood_sugar} mg/dL</p>
                      </div>
                    )}
                    {record.cholesterol_total && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Total Cholesterol</p>
                        <p className="text-sm font-medium text-gray-900">{record.cholesterol_total} mg/dL</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Symptoms and Notes */}
              {(record.symptoms || record.notes) && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  {record.symptoms && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Symptoms</p>
                      <p className="text-sm text-gray-700">{record.symptoms}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-700">{record.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecords;