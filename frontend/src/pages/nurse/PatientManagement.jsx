import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ClipboardList,
  User,
  Mail,
  Phone,
  Droplet,
  RefreshCw,
  Filter,
  ChevronRight,
  AlertCircle,
  UserCheck,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PatientManagement = () => {
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(
    searchParams.get('unassigned') === 'true'
  );
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    unassigned: 0
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, showUnassignedOnly]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/nurse/patients');
      console.log('Patients data:', response.data);
      
      const patientsData = response.data;
      setPatients(patientsData);
      
      // Calculate stats
      const assigned = patientsData.filter(p => p.primary_doctor_id).length;
      setStats({
        total: patientsData.length,
        assigned,
        unassigned: patientsData.length - assigned
      });
      
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
    toast.success('Patient list updated');
  };

  const filterPatients = () => {
    let filtered = [...patients];

    if (searchTerm) {
      filtered = filtered.filter(p => 
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm)
      );
    }

    if (showUnassignedOnly) {
      filtered = filtered.filter(p => !p.primary_doctor_id);
    }

    setFilteredPatients(filtered);
  };

  const handleDelete = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/nurse/patients/${patientId}`);
      toast.success('Patient deleted successfully');
      fetchPatients();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete patient');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
            <p className="text-gray-500 mt-1">Manage all patient records</p>
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
            <Link
              to="/nurse/patients/new"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Patient</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Patients</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Assigned to Doctor</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.assigned}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Unassigned</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.unassigned}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showUnassignedOnly}
                onChange={(e) => setShowUnassignedOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span>Show unassigned only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Primary Doctor</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {patient.first_name?.[0]}{patient.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{patient.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {patient.blood_group ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <Droplet className="w-3 h-3 mr-1" />
                          {patient.blood_group}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {patient.primary_doctor_id ? (
                        <span className="inline-flex items-center text-sm text-gray-900">
                          <UserCheck className="w-4 h-4 mr-1 text-emerald-600" />
                          Dr. {patient.doctor_first_name} {patient.doctor_last_name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-sm text-amber-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {patient.last_visit ? format(new Date(patient.last_visit), 'MMM d, yyyy') : 'Never'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/nurse/patients/${patient.id}/records`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Records"
                        >
                          <ClipboardList className="w-4 h-4" />
                        </Link>
                        <Link
                            to={`/nurse/patients/edit/${patient.id}`}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Patient"
                          >
                            <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/nurse/patients/${patient.id}/assign-doctor`}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Assign Doctor"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No patients found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;