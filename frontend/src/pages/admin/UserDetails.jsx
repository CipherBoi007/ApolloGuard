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
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/users/${id}`);
      setUser(response.data);
      
      // Mock activity data - replace with actual API call
      setActivity([
        { id: 1, action: 'User logged in', timestamp: '2024-03-07 10:30 AM', ip: '192.168.1.1' },
        { id: 2, action: 'Profile updated', timestamp: '2024-03-06 02:15 PM', ip: '192.168.1.1' },
        { id: 3, action: 'Password changed', timestamp: '2024-03-05 09:45 AM', ip: '192.168.1.1' },
      ]);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Failed to load user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
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
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      doctor: 'bg-blue-100 text-blue-800 border-blue-200',
      nurse: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      patient: 'bg-amber-100 text-amber-800 border-amber-200'
    };
    return badges[role] || 'bg-slate-100 text-slate-800';
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(user.role);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Details</h1>
            <p className="text-sm text-slate-500 mt-1">View and manage user information</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
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
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit User
          </Link>
        </div>
      </div>

      {/* User Profile Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
              user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
              user.role === 'doctor' ? 'bg-blue-100 text-blue-600' :
              user.role === 'nurse' ? 'bg-emerald-100 text-emerald-600' :
              'bg-amber-100 text-amber-600'
            }`}>
              {getInitials()}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${
              user.is_active ? 'bg-emerald-500' : 'bg-slate-400'
            }`} />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-slate-900">
                {user.first_name} {user.last_name}
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                <RoleIcon className="w-3 h-3 inline mr-1" />
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
            <p className="text-slate-500 mt-1">{user.email}</p>
            <div className="flex items-center mt-3 space-x-4 text-sm">
              <div className="flex items-center text-slate-600">
                <Mail className="w-4 h-4 mr-1.5 text-slate-400" />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center text-slate-600">
                  <Phone className="w-4 h-4 mr-1.5 text-slate-400" />
                  {user.phone}
                </div>
              )}
              <div className="flex items-center text-slate-600">
                <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'activity', 'permissions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">First Name</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{user.first_name}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Last Name</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{user.last_name}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Email Address</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{user.email}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Phone Number</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{user.phone || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Role</p>
                  <p className="text-sm font-medium text-slate-900 mt-1 capitalize">{user.role}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className={`text-sm font-medium mt-1 ${user.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {/* Role-specific Information */}
            {user.role === 'patient' && user.patient_details && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Date of Birth</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {new Date(user.patient_details.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Gender</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{user.patient_details.gender}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Blood Group</p>
                    <p className="text-sm font-medium text-slate-900 mt-1 flex items-center">
                      <Droplet className="w-4 h-4 mr-1 text-red-500" />
                      {user.patient_details.blood_group}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Height</p>
                    <p className="text-sm font-medium text-slate-900 mt-1 flex items-center">
                      <Ruler className="w-4 h-4 mr-1 text-slate-500" />
                      {user.patient_details.height} cm
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Weight</p>
                    <p className="text-sm font-medium text-slate-900 mt-1 flex items-center">
                      <Weight className="w-4 h-4 mr-1 text-slate-500" />
                      {user.patient_details.weight} kg
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Emergency Contact</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{user.patient_details.emergency_contact}</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{user.patient_details.address}</p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {user.patient_details.city}, {user.patient_details.state} {user.patient_details.zip_code}
                  </p>
                </div>
                {user.patient_details.allergies && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-600 font-medium">Allergies</p>
                    <p className="text-sm text-amber-700 mt-1">{user.patient_details.allergies}</p>
                  </div>
                )}
                {user.patient_details.chronic_conditions && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Chronic Conditions</p>
                    <p className="text-sm text-blue-700 mt-1">{user.patient_details.chronic_conditions}</p>
                  </div>
                )}
              </div>
            )}

            {(user.role === 'doctor' || user.role === 'nurse') && user.staff_details && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Specialization</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{user.staff_details.specialization}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">License Number</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{user.staff_details.license_number}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{user.staff_details.department}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Experience</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{user.staff_details.experience_years} years</p>
                  </div>
                </div>
                {user.staff_details.qualification && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Qualifications</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{user.staff_details.qualification}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                  <Activity className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.action}</p>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.timestamp}
                      </span>
                      <span>•</span>
                      <span>IP: {item.ip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Role Permissions</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-900 mb-2">Role: {user.role}</p>
                <div className="grid grid-cols-2 gap-2">
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