import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Droplet,
  Ruler,
  Weight,
  Edit,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Camera,
  Stethoscope,
  FileText,
  Clock,
  Lock,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const PatientProfile = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [doctor, setDoctor] = useState(null);
  
  // Password form state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLength: false,
    hasNumber: false,
    hasUpper: false,
    hasLower: false,
    hasSpecial: false
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    emergency_contact: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    height: '',
    weight: '',
    allergies: '',
    chronic_conditions: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchDoctor();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patient/profile');
      console.log('Profile data:', response.data);
      setProfile(response.data);
      setEditForm({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        date_of_birth: response.data.date_of_birth ? response.data.date_of_birth.split('T')[0] : '',
        gender: response.data.gender || '',
        blood_group: response.data.blood_group || '',
        emergency_contact: response.data.emergency_contact || '',
        address: response.data.address || '',
        city: response.data.city || '',
        state: response.data.state || '',
        zip_code: response.data.zip_code || '',
        height: response.data.height || '',
        weight: response.data.weight || '',
        allergies: response.data.allergies || '',
        chronic_conditions: response.data.chronic_conditions || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctor = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patient/my-doctor');
      console.log('Doctor data:', response.data);
      setDoctor(response.data);
    } catch (error) {
      console.log('No primary doctor assigned');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchDoctor()]);
    setRefreshing(false);
    toast.success('Profile updated');
  };

  const handleEdit = () => {
    setEditForm({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
      gender: profile.gender || '',
      blood_group: profile.blood_group || '',
      emergency_contact: profile.emergency_contact || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      zip_code: profile.zip_code || '',
      height: profile.height || '',
      weight: profile.weight || '',
      allergies: profile.allergies || '',
      chronic_conditions: profile.chronic_conditions || ''
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

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
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

    const submitData = {
      ...editForm,
      height: editForm.height === '' ? null : Number(editForm.height),
      weight: editForm.weight === '' ? null : Number(editForm.weight),
      date_of_birth: editForm.date_of_birth || null
    };

    try {
      await axios.put('http://localhost:5000/api/patient/profile', submitData);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
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

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information and security</p>
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

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Quick Info */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-4">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="text-sm text-gray-500">Member since {profile?.member_since ? format(new Date(profile.member_since), 'MMMM yyyy') : 'N/A'}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Age</span>
                <span className="font-medium text-gray-900">{calculateAge(profile?.date_of_birth)} years</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Gender</span>
                <span className="font-medium text-gray-900">{profile?.gender || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Blood Group</span>
                <span className="font-medium text-gray-900">{profile?.blood_group || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Primary Doctor Card */}
          {doctor && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Doctor</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {doctor.first_name?.[0]}{doctor.last_name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Dr. {doctor.first_name} {doctor.last_name}</p>
                  <p className="text-sm text-gray-500">{doctor.specialization || 'General Practice'}</p>
                  <p className="text-xs text-gray-400 mt-1">{doctor.department || 'General Medicine'}</p>
                </div>
              </div>
              {doctor.phone && (
                <div className="mt-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4 inline mr-1" /> {doctor.phone}
                </div>
              )}
              {doctor.email && (
                <div className="mt-1 text-sm text-gray-600">
                  <Mail className="w-4 h-4 inline mr-1" /> {doctor.email}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Password Change Section */}
          {showPasswordSection && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-purple-600" />
                Change Password
              </h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="current_password"
                      value={passwordForm.current_password}
                      onChange={handlePasswordChange}
                      className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="new_password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {passwordForm.new_password && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Password Strength</span>
                        <span className="text-xs font-medium" style={{ 
                          color: passwordStrength.score <= 2 ? '#EF4444' : 
                                 passwordStrength.score <= 4 ? '#F59E0B' : '#10B981' 
                        }}>
                          {getStrengthText()}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${getStrengthColor()}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-1 mt-2">
                        <div className="flex items-center text-xs">
                          <CheckCircle className={`w-3 h-3 mr-1 ${passwordStrength.hasLength ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={passwordStrength.hasLength ? 'text-gray-700' : 'text-gray-400'}>8+ chars</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <CheckCircle className={`w-3 h-3 mr-1 ${passwordStrength.hasNumber ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={passwordStrength.hasNumber ? 'text-gray-700' : 'text-gray-400'}>Number</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <CheckCircle className={`w-3 h-3 mr-1 ${passwordStrength.hasUpper ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={passwordStrength.hasUpper ? 'text-gray-700' : 'text-gray-400'}>Uppercase</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <CheckCircle className={`w-3 h-3 mr-1 ${passwordStrength.hasLower ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={passwordStrength.hasLower ? 'text-gray-700' : 'text-gray-400'}>Lowercase</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <CheckCircle className={`w-3 h-3 mr-1 ${passwordStrength.hasSpecial ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={passwordStrength.hasSpecial ? 'text-gray-700' : 'text-gray-400'}>Special</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordChange}
                      className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordForm.new_password && passwordForm.confirm_password && (
                    <div className="mt-2">
                      {passwordForm.new_password === passwordForm.confirm_password ? (
                        <p className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Passwords match
                        </p>
                      ) : (
                        <p className="text-xs text-red-600 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setPasswordForm({
                        current_password: '',
                        new_password: '',
                        confirm_password: ''
                      });
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Profile Section */}
          {editing ? (
            <form onSubmit={handleProfileSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
              
              {/* Personal Information */}
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={editForm.first_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={editForm.last_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={editForm.date_of_birth}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-md font-medium text-gray-700 mb-3">Medical Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Blood Group</label>
                    <select
                      name="blood_group"
                      value={editForm.blood_group}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={editForm.height}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={editForm.weight}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs text-gray-500 mb-1">Allergies</label>
                  <textarea
                    name="allergies"
                    value={editForm.allergies}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    placeholder="List any known allergies"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-xs text-gray-500 mb-1">Chronic Conditions</label>
                  <textarea
                    name="chronic_conditions"
                    value={editForm.chronic_conditions}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    placeholder="List any chronic conditions"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-md font-medium text-gray-700 mb-3">Emergency Contact</h4>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    name="emergency_contact"
                    value={editForm.emergency_contact}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    placeholder="Name and relationship"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-md font-medium text-gray-700 mb-3">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={editForm.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={editForm.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={editForm.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zip_code"
                      value={editForm.zip_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
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
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.date_of_birth ? format(new Date(profile.date_of_birth), 'MMMM d, yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Gender</p>
                      <p className="text-sm font-medium text-gray-900">{profile?.gender || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Blood Group</p>
                      <p className="text-sm font-medium text-gray-900">{profile?.blood_group || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Height</p>
                      <p className="text-sm font-medium text-gray-900">{profile?.height || 'N/A'} cm</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Weight</p>
                      <p className="text-sm font-medium text-gray-900">{profile?.weight || 'N/A'} kg</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">Allergies</p>
                    <p className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {profile?.allergies || 'No known allergies'}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">Chronic Conditions</p>
                    <p className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {profile?.chronic_conditions || 'No chronic conditions'}
                    </p>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Emergency Contact</p>
                    <p className="text-sm font-medium text-gray-900">{profile?.emergency_contact || 'Not provided'}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-900">{profile?.address || 'No address provided'}</p>
                    <p className="text-sm text-gray-600">
                      {profile?.city && profile?.state 
                        ? `${profile.city}, ${profile.state} ${profile.zip_code || ''}`
                        : 'N/A'}
                    </p>
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

export default PatientProfile;