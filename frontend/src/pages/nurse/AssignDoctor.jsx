import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Stethoscope,
  User,
  CheckCircle,
  Search,
  RefreshCw,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AssignDoctor = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Check if patientId exists and is valid
    if (!patientId || patientId === 'undefined') {
      setError('Invalid patient ID');
      setLoading(false);
      toast.error('Invalid patient ID');
      return;
    }
    
    fetchData();
  }, [patientId]);

  // Filter doctors based on search term
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = doctors.filter(doctor => 
        `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(filtered.slice(0, 10));
      setShowDropdown(true);
    } else {
      setFilteredDoctors([]);
      setShowDropdown(false);
    }
  }, [searchTerm, doctors]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data for patient ID:', patientId);
      
      // Fetch patient data
      const patientRes = await axios.get(`http://localhost:5000/api/nurse/patients/${patientId}`);
      console.log('Patient data received:', patientRes.data);
      setPatient(patientRes.data);

      // Fetch doctors data
      const doctorsRes = await axios.get('http://localhost:5000/api/nurse/doctors/available');
      console.log('Doctors data received:', doctorsRes.data.length, 'doctors');
      setDoctors(doctorsRes.data);
      
      // If patient already has a doctor, preselect it
      if (patientRes.data.primary_doctor_id) {
        const currentDoctor = doctorsRes.data.find(
          d => d.id === patientRes.data.primary_doctor_id
        );
        if (currentDoctor) {
          setSelectedDoctor(currentDoctor);
          setSearchTerm(`Dr. ${currentDoctor.first_name} ${currentDoctor.last_name}`);
        }
      }

    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(error.response?.data?.error || 'Failed to load data');
      toast.error(error.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSearchTerm(`Dr. ${doctor.first_name} ${doctor.last_name}`);
    setShowDropdown(false);
  };

  const handleAssign = async () => {
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/nurse/patients/${patientId}/assign-doctor/${selectedDoctor.id}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success(`Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name} assigned successfully`);
      
      // Navigate back to patients list after successful assignment
      setTimeout(() => {
        navigate('/nurse/patients');
      }, 1500);
      
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error(error.response?.data?.error || 'Failed to assign doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchData();
  };

  if (!patientId || patientId === 'undefined') {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h2 className="text-xl font-bold text-red-800">Invalid Patient ID</h2>
          </div>
          <p className="text-red-700 mb-4">The patient ID is missing or invalid.</p>
          <button
            onClick={() => navigate('/nurse/patients')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h2 className="text-xl font-bold text-red-800">Error Loading Data</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/nurse/patients')}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              Back to Patients
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient and doctor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/nurse/patients')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assign Primary Doctor</h1>
            <p className="text-gray-500 mt-1">Search and select a doctor for patient care coordination</p>
          </div>
        </div>
      </div>

      {/* Patient Info Card */}
      {patient && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {patient.first_name?.[0]}{patient.last_name?.[0]}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">
                {patient.first_name} {patient.last_name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Age: {patient.age || 'N/A'} • {patient.gender || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {patient.email || 'No email'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {patient.phone || 'No phone'}
                </div>
              </div>
            </div>
          </div>

          {patient.primary_doctor_id && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Currently assigned to: <strong className="ml-1">
                  Dr. {patient.doctor_first_name} {patient.doctor_last_name}
                </strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Doctor Selection with Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search and Select a Doctor</h2>
        
        {/* Search Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Doctor <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type doctor name, specialization, or department..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              autoComplete="off"
            />
            
            {/* Doctor Search Dropdown */}
            {showDropdown && filteredDoctors.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {filteredDoctors.map(doctor => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => handleDoctorSelect(doctor)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {doctor.first_name?.[0]}{doctor.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doctor.specialization || 'General'} • {doctor.department || 'No department'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {doctor.patient_count || 0} patients currently assigned
                        </p>
                      </div>
                    </div>
                    {selectedDoctor?.id === doctor.id && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {showDropdown && filteredDoctors.length === 0 && searchTerm.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                <p className="text-sm text-gray-500">No doctors found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
          
          {/* Selected Doctor Display */}
          {selectedDoctor && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Selected: Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selectedDoctor.specialization || 'General'} • {selectedDoctor.department || 'No department'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDoctor(null);
                  setSearchTerm('');
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => navigate('/nurse/patients')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedDoctor}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Assigning...
              </>
            ) : (
              'Assign Doctor'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignDoctor;