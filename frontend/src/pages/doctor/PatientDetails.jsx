import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  User,
  Calendar,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Brain,
  FileText,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Ruler,
  Weight,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patient, setPatient] = useState(null);
  const [clinicalRecords, setClinicalRecords] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [vitalTrends, setVitalTrends] = useState([]);
  const [showAddDiagnosis, setShowAddDiagnosis] = useState(false);
  const [showGeneratePrediction, setShowGeneratePrediction] = useState(false);
  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: '',
    severity: 'moderate',
    prescription: '',
    follow_up_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/doctor/patients/${id}`);
      console.log('Patient details:', response.data);
      
      const data = response.data;
      setPatient(data.patient);
      setClinicalRecords(data.clinical_records || []);
      setPredictions(data.predictions || []);
      setDiagnoses(data.diagnoses || []);
      
      // Generate vital trends
      if (data.clinical_records?.length > 0) {
        const trends = data.clinical_records.slice(-7).map(record => ({
          date: format(new Date(record.record_date), 'MMM d'),
          bp_systolic: record.blood_pressure_systolic,
          bp_diastolic: record.blood_pressure_diastolic,
          heart_rate: record.heart_rate,
          temperature: record.temperature,
          oxygen: record.oxygen_saturation
        }));
        setVitalTrends(trends);
      }

    } catch (error) {
      console.error('Failed to fetch patient:', error);
      toast.error('Failed to load patient data');
      navigate('/doctor/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatientData();
    setRefreshing(false);
    toast.success('Patient data updated');
  };

  const handleGeneratePrediction = async () => {
    if (!clinicalRecords || clinicalRecords.length === 0) {
      toast.error('No clinical records available for prediction');
      return;
    }

    try {
      const latestRecord = clinicalRecords[0];
      const response = await axios.post(
        `http://localhost:5000/api/doctor/predictions/${latestRecord.id}/generate`
      );
      
      toast.success('Prediction generated successfully');
      setShowGeneratePrediction(false);
      fetchPatientData();
    } catch (error) {
      console.error('Failed to generate prediction:', error);
      toast.error(error.response?.data?.error || 'Failed to generate prediction');
    }
  };

  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const latestRecord = clinicalRecords[0];
      await axios.post(
        `http://localhost:5000/api/doctor/patients/${id}/diagnoses`,
        {
          ...diagnosisForm,
          clinical_record_id: latestRecord?.id
        }
      );
      
      toast.success('Diagnosis created successfully');
      setShowAddDiagnosis(false);
      setDiagnosisForm({
        diagnosis: '',
        severity: 'moderate',
        prescription: '',
        follow_up_date: '',
        notes: ''
      });
      fetchPatientData();
    } catch (error) {
      console.error('Failed to create diagnosis:', error);
      toast.error(error.response?.data?.error || 'Failed to create diagnosis');
    }
  };

  const getRiskBadge = (risk) => {
    const badges = {
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High Risk', icon: TrendingUp },
      moderate: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Moderate', icon: Minus },
      low: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Low Risk', icon: TrendingDown }
    };
    return badges[risk] || badges.low;
  };

  const getVitalStatus = (type, value) => {
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
          <p className="text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Patient not found</p>
          <button
            onClick={() => navigate('/doctor/patients')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Patients
          </button>
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
              onClick={() => navigate('/doctor/patients')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.first_name} {patient.last_name}
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm text-gray-500">ID: {patient.id?.substring(0, 8)}...</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-sm text-gray-500">
                  {patient.gender || 'N/A'} • {patient.age || 'N/A'}y
                </span>
              </div>
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
              onClick={() => setShowGeneratePrediction(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Brain className="w-4 h-4" />
              <span className="text-sm">Generate Prediction</span>
            </button>
            <button
              onClick={() => setShowAddDiagnosis(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Diagnosis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Info Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="text-sm font-medium text-gray-900">
                  {patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Droplets className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Blood Group</p>
                <p className="text-sm font-medium text-gray-900">{patient.blood_group || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Phone className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Emergency Contact</p>
                <p className="text-sm font-medium text-gray-900">{patient.emergency_contact || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900">
                  {patient.city || 'N/A'}, {patient.state || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Height / Weight</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {patient.height || 'N/A'} cm / {patient.weight || 'N/A'} kg
            </p>
            <p className="text-xs text-gray-400 mt-1">
              BMI: {patient.height && patient.weight ? (patient.weight / ((patient.height / 100) ** 2)).toFixed(1) : 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Latest BP</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {clinicalRecords[0]?.blood_pressure_systolic || 'N/A'}/{clinicalRecords[0]?.blood_pressure_diastolic || 'N/A'}
            </p>
            <p className={`text-xs mt-1 ${
              clinicalRecords[0]?.blood_pressure_systolic > 140 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              {clinicalRecords[0]?.blood_pressure_systolic > 140 ? 'Elevated' : 'Normal'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Heart Rate</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {clinicalRecords[0]?.heart_rate || 'N/A'} bpm
            </p>
            <p className={`text-xs mt-1 ${
              clinicalRecords[0]?.heart_rate > 100 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              {clinicalRecords[0]?.heart_rate > 100 ? 'Tachycardia' : 'Normal'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">O2 Saturation</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {clinicalRecords[0]?.oxygen_saturation || 'N/A'}%
            </p>
            <p className={`text-xs mt-1 ${
              clinicalRecords[0]?.oxygen_saturation < 95 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              {clinicalRecords[0]?.oxygen_saturation < 95 ? 'Low' : 'Normal'}
            </p>
          </div>
        </div>
      </div>

      {/* Vital Trends Chart */}
      {vitalTrends.length > 0 && (
        <div className="px-8 py-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="bp_systolic" stroke="#EF4444" name="Systolic BP" strokeWidth={2} />
                  <Line type="monotone" dataKey="bp_diastolic" stroke="#F59E0B" name="Diastolic BP" strokeWidth={2} />
                  <Line type="monotone" dataKey="heart_rate" stroke="#3B82F6" name="Heart Rate" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Medical History */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Chronic Conditions</p>
                <p className="text-sm text-gray-600 mt-1">{patient.chronic_conditions || 'None reported'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Allergies</p>
                <p className="text-sm text-gray-600 mt-1">{patient.allergies || 'No known allergies'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{patient.email || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{patient.phone || 'N/A'}</span>
              </div>
              <div className="flex items-start text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                <span className="text-gray-600">
                  {patient.address || 'N/A'}<br />
                  {patient.city || 'N/A'}, {patient.state || 'N/A'} {patient.zip_code || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions Section */}
      {predictions.length > 0 && (
        <div className="px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Predictions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.map((prediction) => {
              const riskBadge = getRiskBadge(prediction.risk_level);
              const RiskIcon = riskBadge.icon;
              
              return (
                <div key={prediction.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${riskBadge.bg}`}>
                        <RiskIcon className={`w-5 h-5 ${riskBadge.text}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {format(new Date(prediction.created_at), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${riskBadge.bg} ${riskBadge.text}`}>
                      {riskBadge.label}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Confidence Score</span>
                      <span className="font-medium text-gray-900">{prediction.confidence_score}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          prediction.confidence_score > 80 ? 'bg-emerald-500' :
                          prediction.confidence_score > 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${prediction.confidence_score}%` }}
                      />
                    </div>
                  </div>

                  {prediction.recommendations && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {(typeof prediction.recommendations === 'string' 
                          ? JSON.parse(prediction.recommendations) 
                          : prediction.recommendations || []
                        ).map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Diagnoses Section */}
      {diagnoses.length > 0 && (
        <div className="px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnoses</h2>
          <div className="space-y-4">
            {diagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{diagnosis.diagnosis}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Dr. {diagnosis.doctor_name} • {format(new Date(diagnosis.created_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    diagnosis.severity === 'severe' ? 'bg-red-100 text-red-700' :
                    diagnosis.severity === 'moderate' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {diagnosis.severity}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Prescription</p>
                    <p className="text-sm text-gray-900">{diagnosis.prescription || 'None'}</p>
                  </div>
                  {diagnosis.notes && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-900">{diagnosis.notes}</p>
                    </div>
                  )}
                </div>

                {diagnosis.follow_up_date && (
                  <div className="mt-4 flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Follow-up: {format(new Date(diagnosis.follow_up_date), 'MMMM d, yyyy')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Diagnosis Modal */}
      {showAddDiagnosis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Diagnosis</h3>
            <form onSubmit={handleDiagnosisSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={diagnosisForm.diagnosis}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, diagnosis: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  placeholder="e.g., Hypertension"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={diagnosisForm.severity}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, severity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prescription</label>
                <textarea
                  value={diagnosisForm.prescription}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, prescription: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  placeholder="Enter prescription details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={diagnosisForm.follow_up_date}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, follow_up_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={diagnosisForm.notes}
                  onChange={(e) => setDiagnosisForm({...diagnosisForm, notes: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Diagnosis
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDiagnosis(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Prediction Modal */}
      {showGeneratePrediction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Generate AI Prediction</h3>
            <p className="text-gray-600 mb-6">
              This will generate a new risk prediction based on the latest clinical records for this patient.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleGeneratePrediction}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Generate
              </button>
              <button
                type="button"
                onClick={() => setShowGeneratePrediction(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;