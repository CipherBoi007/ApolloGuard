import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Activity,
  Calendar,
  User,
  RefreshCw,
  Eye,
  Droplet
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PatientsList = () => {
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    moderateRisk: 0,
    lowRisk: 0
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctor/patients');
      console.log('Patients data:', response.data);
      
      const patientsData = response.data;
      setPatients(patientsData);
      
      // Calculate stats
      setStats({
        total: patientsData.length,
        highRisk: patientsData.filter(p => p.risk_level === 'high').length,
        moderateRisk: patientsData.filter(p => p.risk_level === 'moderate').length,
        lowRisk: patientsData.filter(p => p.risk_level === 'low').length
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
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply URL risk filter if present
    const riskFilter = searchParams.get('risk');
    if (riskFilter) {
      filtered = filtered.filter(p => p.risk_level === riskFilter);
    }

    setFilteredPatients(filtered);
  };

  const getRiskBadge = (risk) => {
    const badges = {
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High Risk', icon: AlertCircle },
      moderate: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Moderate', icon: TrendingUp },
      low: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Low Risk', icon: Activity }
    };
    return badges[risk] || badges.low;
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
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-500 mt-1">Manage and view all your patients</p>
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
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Patients</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">High Risk</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.highRisk}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Moderate</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.moderateRisk}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Low Risk</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.lowRisk}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
            />
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Age/Gender</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => {
                  const riskBadge = getRiskBadge(patient.risk_level);
                  const RiskIcon = riskBadge.icon;
                  
                  return (
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
                            <p className="text-xs text-gray-500">{patient.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{patient.age || 'N/A'}y • {patient.gender || 'N/A'}</span>
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
                        {patient.risk_level ? (
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${riskBadge.bg} ${riskBadge.text}`}>
                            <RiskIcon className="w-3 h-3" />
                            <span>{riskBadge.label}</span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Not assessed</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                          {patient.last_visit ? format(new Date(patient.last_visit), 'MMM d, yyyy') : 'Never'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/doctor/patients/${patient.id}`}
                          className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <span>View</span>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
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

export default PatientsList;