import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Droplet,
  Ruler,
  Weight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  Stethoscope,
  HeartPulse,
  UserCircle,
  Activity,
  Clock,
  FileText,
  Download,
  Award,
  Building2,
  Briefcase,
  GraduationCap,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/users/${id}`);
      console.log('User details:', response.data);
      setUser(response.data);
      setLastUpdated(new Date());
      
      // Mock activity data - replace with actual API call
      setActivity([
        { id: 1, action: 'User logged in', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), ip: '192.168.1.1' },
        { id: 2, action: 'Profile updated', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), ip: '192.168.1.1' },
        { id: 3, action: 'Password changed', timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), ip: '192.168.1.1' },
      ]);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Failed to load user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserDetails();
    setRefreshing(false);
    toast.success('User details updated');
  };

  const handleToggleStatus = async () => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}`, {
        is_active: !user.is_active
      });
      toast.success(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`);
      fetchUserDetails();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: Shield,
      doctor: Stethoscope,
      nurse: HeartPulse,
      patient: UserCircle
    };
    return icons[role] || UserCircle;
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-700 border border-purple-200',
      doctor: 'bg-blue-100 text-blue-700 border border-blue-200',
      nurse: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      patient: 'bg-amber-100 text-amber-700 border border-amber-200'
    };
    return badges[role] || 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  const getRoleGradient = (role) => {
    const gradients = {
      admin: 'from-purple-500 to-purple-600',
      doctor: 'from-blue-500 to-cyan-500',
      nurse: 'from-emerald-500 to-teal-500',
      patient: 'from-amber-500 to-orange-500'
    };
    return gradients[role] || 'from-slate-500 to-slate-600';
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center mt-4 text-slate-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(user.role);
  const roleBadge = getRoleBadge(user.role);
  const roleGradient = getRoleGradient(user.role);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">User Details</h1>
              <p className="text-slate-600 text-sm mt-1">View and manage user information</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center space-x-2 text-sm bg-slate-100 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-slate-600">Last updated {format(lastUpdated, 'h:mm a')}</span>
            </div>
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                user.is_active
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {user.is_active ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Deactivate User
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate User
                </>
              )}
            </button>
            <Link
              to={`/admin/users/${id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </Link>
          </div>
        </div>
      </div>

      {/* User Profile Header */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${roleGradient}`}></div>
          <div className="p-6">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${roleGradient} flex items-center justify-center text-white text-3xl font-bold shadow-sm`}>
                {getInitials()}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {user.first_name} {user.last_name}
                  </h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleBadge}`}>
                    <RoleIcon className="w-3 h-3 mr-1" />
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </span>
                </div>
                <p className="text-slate-500 mb-4">{user.email}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-slate-600">
                    <Mail className="w-4 h-4 mr-2 text-slate-400" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-slate-600">
                      <Phone className="w-4 h-4 mr-2 text-slate-400" />
                      {user.phone}
                    </div>
                  )}
                  <div className="flex items-center text-slate-600">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    Joined {user.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${
                user.is_active 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${
                  user.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                }`}></span>
                {user.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 border-b border-slate-200">
        <div className="flex space-x-6">
          {['overview', 'activity', 'permissions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-8 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-900">Basic Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">First Name</p>
                    <p className="text-sm font-medium text-slate-900">{user.first_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Last Name</p>
                    <p className="text-sm font-medium text-slate-900">{user.last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Email Address</p>
                    <p className="text-sm font-medium text-slate-900">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                    <p className="text-sm font-medium text-slate-900">{user.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Role</p>
                    <p className="text-sm font-medium text-slate-900 capitalize">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <p className={`text-sm font-medium ${user.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Information (if role is patient) */}
            {user.role === 'patient' && user.patient_details && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                  <h3 className="text-sm font-semibold text-slate-900">Patient Information</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Date of Birth</p>
                      <p className="text-sm font-medium text-slate-900">
                        {user.patient_details.date_of_birth ? format(new Date(user.patient_details.date_of_birth), 'MMMM d, yyyy') : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Gender</p>
                      <p className="text-sm font-medium text-slate-900">{user.patient_details.gender || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Blood Group</p>
                      <p className="text-sm font-medium text-slate-900 flex items-center">
                        <Droplet className="w-4 h-4 mr-1 text-red-500" />
                        {user.patient_details.blood_group || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Height</p>
                      <p className="text-sm font-medium text-slate-900 flex items-center">
                        <Ruler className="w-4 h-4 mr-1 text-slate-500" />
                        {user.patient_details.height || '—'} cm
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Weight</p>
                      <p className="text-sm font-medium text-slate-900 flex items-center">
                        <Weight className="w-4 h-4 mr-1 text-slate-500" />
                        {user.patient_details.weight || '—'} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Emergency Contact</p>
                      <p className="text-sm font-medium text-slate-900">{user.patient_details.emergency_contact || '—'}</p>
                    </div>
                  </div>

                  {user.patient_details.address && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Address</p>
                      <p className="text-sm text-slate-900">{user.patient_details.address}</p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {user.patient_details.city}, {user.patient_details.state} {user.patient_details.zip_code}
                      </p>
                    </div>
                  )}

                  {user.patient_details.allergies && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Allergies</p>
                      <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">{user.patient_details.allergies}</p>
                    </div>
                  )}

                  {user.patient_details.chronic_conditions && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Chronic Conditions</p>
                      <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">{user.patient_details.chronic_conditions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Staff Information (if role is doctor or nurse) */}
            {(user.role === 'doctor' || user.role === 'nurse') && user.staff_details && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                  <h3 className="text-sm font-semibold text-slate-900">Professional Information</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Specialization</p>
                      <p className="text-sm font-medium text-slate-900 flex items-center">
                        <Award className="w-4 h-4 mr-1 text-slate-500" />
                        {user.staff_details.specialization || 'General'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">License Number</p>
                      <p className="text-sm font-medium text-slate-900 flex items-center">
                        <GraduationCap className="w-4 h-4 mr-1 text-slate-500" />
                        {user.staff_details.license_number || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Department</p>
                      <p className="text-sm font-medium text-slate-900 flex items-center">
                        <Building2 className="w-4 h-4 mr-1 text-slate-500" />
                        {user.staff_details.department || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Experience</p>
                      <p className="text-sm font-medium text-slate-900 flex items-center">
                        <Briefcase className="w-4 h-4 mr-1 text-slate-500" />
                        {user.staff_details.experience_years || 0} years
                      </p>
                    </div>
                  </div>

                  {user.staff_details.qualification && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Qualifications</p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{user.staff_details.qualification}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {activity.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <Activity className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.action}</p>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(new Date(item.timestamp), 'h:mm a • MMM d, yyyy')}
                        </span>
                        <span>•</span>
                        <span>IP: {item.ip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-900">Role Permissions</h3>
            </div>
            <div className="p-6">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-900 mb-3">Role: {user.role}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {user.role === 'admin' && (
                    <>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Full system access
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        User management
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Analytics access
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        System configuration
                      </div>
                    </>
                  )}
                  {user.role === 'doctor' && (
                    <>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        View patients
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Create diagnoses
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        View predictions
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Prescribe medications
                      </div>
                    </>
                  )}
                  {user.role === 'nurse' && (
                    <>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Manage patients
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Record vitals
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Update clinical records
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <XCircle className="w-4 h-4 text-red-400 mr-2" />
                        Create diagnoses
                      </div>
                    </>
                  )}
                  {user.role === 'patient' && (
                    <>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        View own records
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        View diagnoses
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        View predictions
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <XCircle className="w-4 h-4 text-red-400 mr-2" />
                        Edit records
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;