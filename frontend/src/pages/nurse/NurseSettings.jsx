import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Save,
  Edit,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Clock,
  Key,
  Moon,
  Sun,
  Languages,
  RefreshCw,
  HeartPulse,
  Award,
  Calendar,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const NurseSettings = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [profile, setProfile] = useState(null);
  
  // Password form state (same as Doctor)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Password strength (same as Doctor)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLength: false,
    hasNumber: false,
    hasUpper: false,
    hasLower: false,
    hasSpecial: false
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    specialization: '',
    license_number: '',
    experience_years: '',
    qualification: '',
    bio: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/profile');
      console.log('Profile data:', response.data);
      setProfile(response.data);
      
      setProfileForm({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        department: response.data.staff_details?.department || '',
        specialization: response.data.staff_details?.specialization || '',
        license_number: response.data.staff_details?.license_number || '',
        experience_years: response.data.staff_details?.experience_years || '',
        qualification: response.data.staff_details?.qualification || '',
        bio: response.data.bio || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
    toast.success('Profile refreshed');
  };

  const handleEdit = () => {
    setProfileForm({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      department: profile.staff_details?.department || '',
      specialization: profile.staff_details?.specialization || '',
      license_number: profile.staff_details?.license_number || '',
      experience_years: profile.staff_details?.experience_years || '',
      qualification: profile.staff_details?.qualification || '',
      bio: profile.bio || ''
    });
    setEditing(true);
    setShowPasswordSection(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setShowPasswordSection(false);
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (name === 'new_password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    const strength = {
      hasLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    const score = Object.values(strength).filter(Boolean).length;
    setPasswordStrength({ ...strength, score });
  };

  const getStrengthColor = () => {
    const { score } = passwordStrength;
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    const { score } = passwordStrength;
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Moderate';
    return 'Strong';
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const submitData = {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone,
        staff_details: {
          department: profileForm.department,
          specialization: profileForm.specialization,
          license_number: profileForm.license_number,
          experience_years: profileForm.experience_years ? parseInt(profileForm.experience_years) : null,
          qualification: profileForm.qualification
        },
        bio: profileForm.bio
      };

      await axios.put('http://localhost:5000/api/profile', submitData);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordStrength.score < 3) {
      toast.error('Please choose a stronger password');
      return;
    }

    setSaving(true);
    try {
      await axios.post('http://localhost:5000/api/auth/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      
      toast.success('Password changed successfully');
      setShowPasswordSection(false);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    return `${profileForm.first_name?.[0] || ''}${profileForm.last_name?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/nurse/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nurse Settings</h1>
            <p className="text-gray-500 mt-1">Manage your profile and security settings</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {!editing && !showPasswordSection ? (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit Profile</span>
              </button>
              <button
                onClick={() => setShowPasswordSection(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span className="text-sm">Change Password</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Quick Info */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
                {getInitials()}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-4">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{profileForm.specialization || 'Nurse'}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Member Since</span>
                <span className="font-medium text-gray-900">
                  {profile?.created_at ? format(new Date(profile.created_at), 'MMM yyyy') : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Last Login</span>
                <span className="font-medium text-gray-900">
                  {profile?.last_login ? format(new Date(profile.last_login), 'MMM d, yyyy') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HeartPulse className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-600">License</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{profileForm.license_number || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-gray-600">Experience</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{profileForm.experience_years || '0'} years</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Qualification</span>
                </div>
                <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{profileForm.qualification || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Password Change Section - Same as Doctor */}
          {showPasswordSection && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-purple-600" />
                Change Password
              </h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Same password form as Doctor */}
                {/* ... */}
              </form>
            </div>
          )}

          {/* Edit Profile Section */}
          {editing ? (
            <form onSubmit={handleProfileSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={profileForm.first_name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={profileForm.last_name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={profileForm.department}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={profileForm.specialization}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input
                    type="text"
                    name="license_number"
                    value={profileForm.license_number}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={profileForm.experience_years}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                  <textarea
                    name="qualification"
                    value={profileForm.qualification}
                    onChange={handleProfileChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* View Profile Section */
            !showPasswordSection && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">First Name</p>
                      <p className="text-sm font-medium text-gray-900">{profile?.first_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Name</p>
                      <p className="text-sm font-medium text-gray-900">{profile?.last_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900">{profile?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{profile?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Department</p>
                      <p className="text-sm font-medium text-gray-900">{profileForm.department || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Specialization</p>
                      <p className="text-sm font-medium text-gray-900">{profileForm.specialization || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">License Number</p>
                      <p className="text-sm font-medium text-gray-900">{profileForm.license_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Experience</p>
                      <p className="text-sm font-medium text-gray-900">{profileForm.experience_years || '0'} years</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Qualifications</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{profileForm.qualification || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Bio</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{profileForm.bio || 'No bio provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseSettings;