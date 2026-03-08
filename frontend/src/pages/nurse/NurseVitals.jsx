import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplet,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  User,
  Download
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import toast from 'react-hot-toast';

const NurseVitals = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitalsData, setVitalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchVitalsData(selectedPatient.id);
    }
  }, [selectedPatient, timeRange]);

  const fetchPatients = async () => {
    try {
      // Mock data - replace with API call
      const mockPatients = [
        { id: '1', first_name: 'Robert', last_name: 'Johnson', room: '302', age: 67, gender: 'Male', blood_group: 'O+' },
        { id: '2', first_name: 'Maria', last_name: 'Chen', room: '305', age: 52, gender: 'Female', blood_group: 'A+' },
        { id: '3', first_name: 'James', last_name: 'Wilson', room: '308', age: 71, gender: 'Male', blood_group: 'B+' },
        { id: '4', first_name: 'Emily', last_name: 'Thompson', room: '310', age: 45, gender: 'Female', blood_group: 'AB+' },
        { id: '5', first_name: 'David', last_name: 'Kim', room: '315', age: 58, gender: 'Male', blood_group: 'O-' },
      ];
      setPatients(mockPatients);
      if (mockPatients.length > 0) {
        setSelectedPatient(mockPatients[0]);
      }

      // Mock alerts
      setAlerts([
        { id: '1', patient: 'Robert Johnson', vital: 'Blood Pressure', value: '165/95', severity: 'high', time: '5 min ago' },
        { id: '2', patient: 'Maria Chen', vital: 'Heart Rate', value: '118 bpm', severity: 'moderate', time: '15 min ago' },
        { id: '3', patient: 'James Wilson', vital: 'Temperature', value: '38.5°C', severity: 'high', time: '25 min ago' },
      ]);

    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchVitalsData = async (patientId) => {
    try {
      // Mock data - replace with API call
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const mockData = [];
      
      for (let i = days; i >= 0; i--) {
        const date = subDays(new Date(), i);
        mockData.push({
          date: format(date, 'MMM d'),
          bp_systolic: 120 + Math.floor(Math.random() * 30),
          bp_diastolic: 80 + Math.floor(Math.random() * 15),
          heart_rate: 70 + Math.floor(Math.random() * 20),
          temperature: 36.5 + (Math.random() * 1.5),
          oxygen: 95 + Math.floor(Math.random() * 4),
          respiratory: 14 + Math.floor(Math.random() * 6)
        });
      }
      
      setVitalsData(mockData);
    } catch (error) {
      console.error('Failed to fetch vitals:', error);
      toast.error('Failed to load vital signs');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (selectedPatient) {
      await fetchVitalsData(selectedPatient.id);
    }
    setRefreshing(false);
    toast.success('Vitals updated');
  };

  const getVitalStatus = (type, value) => {
    const ranges = {
      bp_systolic: { low: 90, high: 140, critical: 160 },
      bp_diastolic: { low: 60, high: 90, critical: 100 },
      heart_rate: { low: 60, high: 100, critical: 120 },
      temperature: { low: 36.1, high: 37.5, critical: 38.5 },
      oxygen: { low: 95, high: 100, critical: 90 },
    };

    const range = ranges[type];
    if (!range) return 'normal';

    if (value >= range.critical) return 'critical';
    if (value > range.high || value < range.low) return 'abnormal';
    return 'normal';
  };

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.room?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center mt-4 text-gray-600">Loading vital signs...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Vital Signs Monitoring</h1>
            <p className="text-gray-500 mt-1">Track patient vital signs in real-time</p>
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
              <span className="text-sm">Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-700">Critical Alerts ({alerts.length})</span>
              </div>
              <button className="text-sm text-red-600 hover:text-red-700">View all</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="text-sm font-medium text-gray-900">{alert.patient}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.vital}: {alert.value}</p>
                  <p className="text-xs text-red-600 mt-1">{alert.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient List Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                    selectedPatient?.id === patient.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {patient.first_name[0]}{patient.last_name[0]}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className="text-xs text-gray-500">Room {patient.room}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Vitals Display */}
          <div className="lg:col-span-3 space-y-6">
            {selectedPatient && (
              <>
                {/* Patient Info & Current Vitals */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </h2>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-gray-500">Room {selectedPatient.room}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-sm text-gray-500">{selectedPatient.age}y • {selectedPatient.gender}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-sm text-gray-500">Blood Group: {selectedPatient.blood_group}</span>
                      </div>
                    </div>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                    </select>
                  </div>

                  {/* Current Vitals Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {vitalsData.length > 0 && (
                      <>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className={`text-sm font-semibold ${
                              getVitalStatus('bp_systolic', vitalsData[vitalsData.length - 1]?.bp_systolic) === 'critical' ? 'text-red-600' :
                              getVitalStatus('bp_systolic', vitalsData[vitalsData.length - 1]?.bp_systolic) === 'abnormal' ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              {vitalsData[vitalsData.length - 1]?.bp_systolic}/{vitalsData[vitalsData.length - 1]?.bp_diastolic}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Blood Pressure</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <span className={`text-sm font-semibold ${
                              getVitalStatus('heart_rate', vitalsData[vitalsData.length - 1]?.heart_rate) === 'critical' ? 'text-red-600' :
                              getVitalStatus('heart_rate', vitalsData[vitalsData.length - 1]?.heart_rate) === 'abnormal' ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              {vitalsData[vitalsData.length - 1]?.heart_rate} bpm
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Heart Rate</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Thermometer className="w-4 h-4 text-amber-500" />
                            <span className={`text-sm font-semibold ${
                              getVitalStatus('temperature', vitalsData[vitalsData.length - 1]?.temperature) === 'critical' ? 'text-red-600' :
                              getVitalStatus('temperature', vitalsData[vitalsData.length - 1]?.temperature) === 'abnormal' ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              {vitalsData[vitalsData.length - 1]?.temperature.toFixed(1)}°C
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Temperature</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Wind className="w-4 h-4 text-purple-500" />
                            <span className={`text-sm font-semibold ${
                              getVitalStatus('oxygen', vitalsData[vitalsData.length - 1]?.oxygen) === 'critical' ? 'text-red-600' :
                              getVitalStatus('oxygen', vitalsData[vitalsData.length - 1]?.oxygen) === 'abnormal' ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              {vitalsData[vitalsData.length - 1]?.oxygen}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">O2 Saturation</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Wind className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-gray-900">
                              {vitalsData[vitalsData.length - 1]?.respiratory}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Respiratory Rate</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Vitals Charts */}
                  <div className="space-y-6">
                    {/* Blood Pressure Chart */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Blood Pressure Trend</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={vitalsData}>
                            <defs>
                              <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="diastolicGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="date" stroke="#94A3B8" />
                            <YAxis stroke="#94A3B8" />
                            <Tooltip />
                            <Area type="monotone" dataKey="bp_systolic" stroke="#EF4444" fill="url(#systolicGradient)" name="Systolic" />
                            <Area type="monotone" dataKey="bp_diastolic" stroke="#F59E0B" fill="url(#diastolicGradient)" name="Diastolic" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Heart Rate & Temperature Chart */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Heart Rate</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={vitalsData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="date" stroke="#94A3B8" />
                              <YAxis stroke="#94A3B8" />
                              <Tooltip />
                              <Line type="monotone" dataKey="heart_rate" stroke="#3B82F6" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Temperature</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={vitalsData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="date" stroke="#94A3B8" />
                              <YAxis stroke="#94A3B8" />
                              <Tooltip />
                              <Line type="monotone" dataKey="temperature" stroke="#F59E0B" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                      to={`/nurse/patients/${selectedPatient.id}/records`}
                      className="p-4 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition-colors"
                    >
                      <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <span className="text-xs text-gray-700">Add Vitals</span>
                    </Link>
                    <button className="p-4 bg-emerald-50 rounded-xl text-center hover:bg-emerald-100 transition-colors">
                      <AlertCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                      <span className="text-xs text-gray-700">Set Alert</span>
                    </button>
                    <button className="p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition-colors">
                      <Download className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <span className="text-xs text-gray-700">Export</span>
                    </button>
                    <Link
                      to={`/nurse/patients/${selectedPatient.id}`}
                      className="p-4 bg-amber-50 rounded-xl text-center hover:bg-amber-100 transition-colors"
                    >
                      <User className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                      <span className="text-xs text-gray-700">View Profile</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseVitals;