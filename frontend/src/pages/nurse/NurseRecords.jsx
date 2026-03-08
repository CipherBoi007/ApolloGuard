import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Download,
  RefreshCw,
  ChevronRight,
  Eye,
  Plus,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Droplet,
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

const NurseRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientFilter, setPatientFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Patient search states
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    patient_id: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    respiratory_rate: '',
    temperature: '',
    oxygen_saturation: '',
    blood_sugar: '',
    cholesterol_total: '',
    cholesterol_hdl: '',
    cholesterol_ldl: '',
    triglycerides: '',
    symptoms: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, patientFilter, dateFilter]);

  // Filter patients based on search term
  useEffect(() => {
    if (patientSearchTerm.length >= 2) {
      const filtered = patients.filter(patient => 
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        patient.phone?.includes(patientSearchTerm) ||
        patient.blood_group?.toLowerCase().includes(patientSearchTerm.toLowerCase())
      );
      setFilteredPatients(filtered.slice(0, 10)); // Limit to 10 results
      setShowPatientDropdown(true);
    } else {
      setFilteredPatients([]);
      setShowPatientDropdown(false);
    }
  }, [patientSearchTerm, patients]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all patients
      const patientsRes = await axios.get('http://localhost:5000/api/nurse/patients');
      setPatients(patientsRes.data);
      
      // Fetch all clinical records
      const allRecords = [];
      for (const patient of patientsRes.data.slice(0, 10)) { // Limit to 10 patients for performance
        try {
          const recordsRes = await axios.get(`http://localhost:5000/api/nurse/patients/${patient.id}/clinical-records`);
          const patientRecords = recordsRes.data.map(record => ({
            ...record,
            patient_name: `${patient.first_name} ${patient.last_name}`,
            patient_id: patient.id,
            patient_initials: `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`
          }));
          allRecords.push(...patientRecords);
        } catch (error) {
          console.log(`No records for patient ${patient.id}`);
        }
      }
      
      // Sort by date (newest first)
      allRecords.sort((a, b) => new Date(b.record_date) - new Date(a.record_date));
      setRecords(allRecords);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Records updated');
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply patient filter
    if (patientFilter !== 'all') {
      filtered = filtered.filter(r => r.patient_id === patientFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = subDays(now, 7);
      const monthAgo = subDays(now, 30);

      if (dateFilter === 'today') {
        filtered = filtered.filter(r => new Date(r.record_date) >= today);
      } else if (dateFilter === 'week') {
        filtered = filtered.filter(r => new Date(r.record_date) >= weekAgo);
      } else if (dateFilter === 'month') {
        filtered = filtered.filter(r => new Date(r.record_date) >= monthAgo);
      }
    }

    setFilteredRecords(filtered);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      ...formData,
      patient_id: patient.id
    });
    setPatientSearchTerm(`${patient.first_name} ${patient.last_name}`);
    setShowPatientDropdown(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      heart_rate: '',
      respiratory_rate: '',
      temperature: '',
      oxygen_saturation: '',
      blood_sugar: '',
      cholesterol_total: '',
      cholesterol_hdl: '',
      cholesterol_ldl: '',
      triglycerides: '',
      symptoms: '',
      notes: ''
    });
    setSelectedPatient(null);
    setPatientSearchTerm('');
    setFilteredPatients([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }

    setSubmitting(true);
    
    // Convert empty strings to null for numeric fields
    const submitData = {
      blood_pressure_systolic: formData.blood_pressure_systolic === '' ? null : Number(formData.blood_pressure_systolic),
      blood_pressure_diastolic: formData.blood_pressure_diastolic === '' ? null : Number(formData.blood_pressure_diastolic),
      heart_rate: formData.heart_rate === '' ? null : Number(formData.heart_rate),
      respiratory_rate: formData.respiratory_rate === '' ? null : Number(formData.respiratory_rate),
      temperature: formData.temperature === '' ? null : Number(formData.temperature),
      oxygen_saturation: formData.oxygen_saturation === '' ? null : Number(formData.oxygen_saturation),
      blood_sugar: formData.blood_sugar === '' ? null : Number(formData.blood_sugar),
      cholesterol_total: formData.cholesterol_total === '' ? null : Number(formData.cholesterol_total),
      cholesterol_hdl: formData.cholesterol_hdl === '' ? null : Number(formData.cholesterol_hdl),
      cholesterol_ldl: formData.cholesterol_ldl === '' ? null : Number(formData.cholesterol_ldl),
      triglycerides: formData.triglycerides === '' ? null : Number(formData.triglycerides),
      symptoms: formData.symptoms || null,
      notes: formData.notes || null
    };

    try {
      await axios.post(
        `http://localhost:5000/api/nurse/patients/${formData.patient_id}/clinical-records`,
        submitData
      );
      
      toast.success('Clinical record added successfully');
      setShowAddModal(false);
      resetForm();
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error adding record:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to add clinical record');
    } finally {
      setSubmitting(false);
    }
  };

  const getRecordIcon = (record) => {
    if (record.blood_pressure_systolic) return Activity;
    if (record.blood_sugar) return Droplet;
    return FileText;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading records...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Clinical Records</h1>
            <p className="text-gray-500 mt-1">View and manage all patient clinical records</p>
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
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">New Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{records.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {records.filter(r => new Date(r.record_date).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">This Week</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {records.filter(r => new Date(r.record_date) >= subDays(new Date(), 7)).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">This Month</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {records.filter(r => new Date(r.record_date) >= subDays(new Date(), 30)).length}
            </p>
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
                placeholder="Search records by patient name or symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="all">All Patients</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="px-8 py-6">
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const RecordIcon = getRecordIcon(record);
            
            return (
              <div
                key={record.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform">
                      <RecordIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {record.patient_name}
                        </h3>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500">Room {record.room || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {format(new Date(record.record_date), 'h:mm a')}
                        </div>
                        <span className="text-sm text-gray-400">•</span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(record.record_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/nurse/patients/${record.patient_id}/records`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                  </Link>
                </div>

                {/* Vital Signs Preview */}
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
                      <p className="text-xs text-gray-500">O2 Sat</p>
                      <p className={`text-sm font-semibold ${getVitalStatus('oxygen', record.oxygen_saturation)}`}>
                        {record.oxygen_saturation}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Symptoms/Notes */}
                {record.symptoms && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Symptoms</p>
                    <p className="text-sm text-blue-700 mt-1">{record.symptoms}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No records found</p>
          </div>
        )}
      </div>

      {/* Add Record Modal with Patient Search */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Clinical Record</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Search with Autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Patient <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={patientSearchTerm}
                      onChange={(e) => setPatientSearchTerm(e.target.value)}
                      placeholder="Type patient name, email, phone, or blood group..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                      autoComplete="off"
                    />
                    
                    {/* Patient Search Dropdown */}
                    {showPatientDropdown && filteredPatients.length > 0 && (
                      <div 
                        ref={dropdownRef}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {filteredPatients.map(patient => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => handlePatientSelect(patient)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center justify-between group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {patient.first_name?.[0]}{patient.last_name?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {patient.first_name} {patient.last_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {patient.blood_group || 'No blood group'} • {patient.age || '?'}y
                                </p>
                              </div>
                            </div>
                            {selectedPatient?.id === patient.id && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Patient Display */}
                  {selectedPatient && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700">
                          Selected: <span className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatient(null);
                          setPatientSearchTerm('');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                {/* Vital Signs */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Systolic BP (mmHg)
                      </label>
                      <input
                        type="number"
                        name="blood_pressure_systolic"
                        value={formData.blood_pressure_systolic}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                        placeholder="120"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diastolic BP (mmHg)
                      </label>
                      <input
                        type="number"
                        name="blood_pressure_diastolic"
                        value={formData.blood_pressure_diastolic}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heart Rate (bpm)
                      </label>
                      <input
                        type="number"
                        name="heart_rate"
                        value={formData.heart_rate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                        placeholder="72"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Respiratory Rate (/min)
                      </label>
                      <input
                        type="number"
                        name="respiratory_rate"
                        value={formData.respiratory_rate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                        placeholder="16"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                        placeholder="36.6"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        O2 Saturation (%)
                      </label>
                      <input
                        type="number"
                        name="oxygen_saturation"
                        value={formData.oxygen_saturation}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                        placeholder="98"
                      />
                    </div>
                  </div>
                </div>

                {/* Lab Results */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lab Results (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Sugar (mg/dL)
                      </label>
                      <input
                        type="number"
                        name="blood_sugar"
                        value={formData.blood_sugar}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                        placeholder="95"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Cholesterol (mg/dL)
                      </label>
                      <input
                        type="number"
                        name="cholesterol_total"
                        value={formData.cholesterol_total}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                        placeholder="180"
                      />
                    </div>
                  </div>
                </div>

                {/* Clinical Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Notes</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Symptoms
                      </label>
                      <textarea
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                        placeholder="Describe patient symptoms..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                        placeholder="Any additional observations..."
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.patient_id}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Record'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseRecords;