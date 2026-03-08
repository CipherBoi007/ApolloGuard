import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Plus,
  Clock,
  Activity,
  Thermometer,
  Heart,
  Wind,
  Droplet,
  Beaker,
  FileText,
  Calendar,
  User,
  RefreshCw,
  AlertCircle,
  Stethoscope,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ClinicalRecords = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [patientRes, recordsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/nurse/patients/${id}`),
        axios.get(`http://localhost:5000/api/nurse/patients/${id}/clinical-records`)
      ]);
      
      console.log('Patient data:', patientRes.data);
      console.log('Records data:', recordsRes.data);
      
      setPatient(patientRes.data);
      setRecords(recordsRes.data);
    } catch (error) {
      console.error('Failed to fetch patient data:', error);
      toast.error('Failed to fetch patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatientData();
    setRefreshing(false);
    toast.success('Records updated');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    console.log('Submitting clinical record:', submitData);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/nurse/patients/${id}/clinical-records`, 
        submitData
      );
      
      console.log('Record created:', response.data);
      toast.success('Clinical record added successfully');
      setShowAddModal(false);
      resetForm();
      fetchPatientData(); // Refresh the list
    } catch (error) {
      console.error('Error adding record:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to add clinical record');
    } finally {
      setSubmitting(false);
    }
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
          <p className="text-gray-600">Loading patient records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/nurse/patients')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient?.first_name} {patient?.last_name}
              </h1>
              <p className="text-gray-500 mt-1">Clinical Records</p>
            </div>
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
              <span className="text-sm">Add Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Info Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Blood Group</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{patient?.blood_group || 'N/A'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Age</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{patient?.age || 'N/A'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Gender</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{patient?.gender || 'N/A'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Height</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{patient?.height || 'N/A'} cm</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Weight</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{patient?.weight || 'N/A'} kg</p>
          </div>
        </div>

        {/* Doctor Info */}
        {patient?.primary_doctor_id && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Primary Doctor</p>
                <p className="text-base font-medium text-gray-900">
                  Dr. {patient.doctor_first_name} {patient.doctor_last_name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="px-8 py-6">
        <div className="space-y-6">
          {records.length > 0 ? (
            records.map((record) => (
              <div key={record.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                {/* Record Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(record.record_date), 'MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(record.record_date), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    Recorded by {record.recorded_by_name}
                  </span>
                </div>

                {/* Vital Signs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className={`text-sm font-semibold ${getVitalStatus('bp_systolic', record.blood_pressure_systolic)}`}>
                        {record.blood_pressure_systolic || '--'}/{record.blood_pressure_diastolic || '--'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Blood Pressure</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className={`text-sm font-semibold ${getVitalStatus('heart_rate', record.heart_rate)}`}>
                        {record.heart_rate || '--'} bpm
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Heart Rate</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Thermometer className="w-4 h-4 text-amber-500" />
                      <span className={`text-sm font-semibold ${getVitalStatus('temperature', record.temperature)}`}>
                        {record.temperature || '--'}°C
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Temperature</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Wind className="w-4 h-4 text-purple-500" />
                      <span className={`text-sm font-semibold ${getVitalStatus('oxygen', record.oxygen_saturation)}`}>
                        {record.oxygen_saturation || '--'}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">O2 Saturation</p>
                  </div>
                </div>

                {/* Lab Results */}
                {(record.blood_sugar || record.cholesterol_total) && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Beaker className="w-4 h-4 mr-2 text-gray-500" />
                      Lab Results
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {record.blood_sugar && (
                        <div>
                          <p className="text-xs text-gray-500">Blood Sugar</p>
                          <p className="text-sm font-medium text-gray-900">{record.blood_sugar} mg/dL</p>
                        </div>
                      )}
                      {record.cholesterol_total && (
                        <div>
                          <p className="text-xs text-gray-500">Total Cholesterol</p>
                          <p className="text-sm font-medium text-gray-900">{record.cholesterol_total} mg/dL</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Symptoms and Notes */}
                {(record.symptoms || record.notes) && (
                  <div className="border-t border-gray-100 pt-4">
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
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No clinical records found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Add first record
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Clinical Record</h2>
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
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Record
                      </>
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

export default ClinicalRecords;