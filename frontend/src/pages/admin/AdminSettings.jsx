import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Camera,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Clock,
  LogOut,
  Key,
  Moon,
  Sun,
  Languages,
  Download,
  Trash2,
  Fingerprint,
  History,
  RefreshCw,
  Building2,
  Award,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Password form state
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

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    title: '',
    bio: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_alerts: false,
    weekly_report: true,
    security_alerts: true,
    marketing_emails: false
  });

  // Preferences
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/New_York');
  const [sessionHistory, setSessionHistory] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchSessionHistory();
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
        department: response.data.staff_details?.department || 'Administration',
        title: response.data.staff_details?.specialization || 'System Administrator',
        bio: response.data.bio || 'Hospital administrator with full system access.'
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionHistory = async () => {
    // Mock data - replace with actual API call
    setSessionHistory([
      { 
        id: 1, 
        device: 'Chrome on Windows', 
        location: 'New York, USA', 
        ip: '192.168.1.1', 
        lastActive: new Date().toISOString(), 
        current: true 
      },
      { 
        id: 2, 
        device: 'Safari on iPhone', 
        location: 'New York, USA', 
        ip: '192.168.1.2', 
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), 
        current: false 
      },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
    toast.success('Settings refreshed');
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (name === 'new_password') {
      checkPasswordStrength(value);
    }
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
          specialization: profileForm.title
        },
        bio: profileForm.bio
      };

      await axios.put('http://localhost:5000/api/profile', submitData);
      toast.success('Profile updated successfully');
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

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      setSessionHistory(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Session revoked');
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm('This will log you out from all devices. Continue?')) {
      toast.success('Logged out from all other devices');
      setSessionHistory(prev => prev.filter(s => s.current));
    }
  };

  const getInitials = () => {
    return `${profileForm.first_name?.[0] || ''}${profileForm.last_name?.[0] || ''}`.toUpperCase();
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Globe },
    { id: 'sessions', name: 'Sessions', icon: History }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center mt-4 text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header - Matching AdminDashboard */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-600 text-sm mt-1">Manage your account settings and preferences</p>
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
          </div>
        </div>

        {/* Tabs - Navigation */}
        <div className="flex space-x-6 mt-6 border-b border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start space-x-6 mb-8">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-sm">
                      {getInitials()}
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
                      <Camera className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {profileForm.first_name} {profileForm.last_name}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">{profileForm.title}</p>
                    <div className="flex items-center mt-3 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={profileForm.first_name}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={profileForm.last_name}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm bg-slate-50"
                          disabled
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Department
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          name="department"
                          value={profileForm.department}
                          onChange={handleProfileChange}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Job Title
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          name="title"
                          value={profileForm.title}
                          onChange={handleProfileChange}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={profileForm.bio}
                        onChange={handleProfileChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center shadow-sm"
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
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Security Settings</h2>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                  <h3 className="text-sm font-medium text-slate-700">Change Password</h3>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordChange}
                        className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {passwordForm.new_password && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">Password Strength</span>
                          <span className="text-xs font-medium" style={{ 
                            color: passwordStrength.score <= 2 ? '#EF4444' : 
                                   passwordStrength.score <= 4 ? '#F59E0B' : '#22C55E' 
                          }}>
                            {getStrengthText()}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${getStrengthColor()}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-5 gap-1 mt-2">
                          {[
                            { key: 'hasLength', label: '8+ chars' },
                            { key: 'hasNumber', label: 'Number' },
                            { key: 'hasUpper', label: 'Uppercase' },
                            { key: 'hasLower', label: 'Lowercase' },
                            { key: 'hasSpecial', label: 'Special' }
                          ].map((item) => (
                            <div key={item.key} className="flex items-center text-xs">
                              <CheckCircle className={`w-3 h-3 mr-1 ${passwordStrength[item.key] ? 'text-green-500' : 'text-slate-300'}`} />
                              <span className={passwordStrength[item.key] ? 'text-slate-700' : 'text-slate-400'}>{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm_password"
                        value={passwordForm.confirm_password}
                        onChange={handlePasswordChange}
                        className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
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

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>

                {/* Two-Factor Authentication */}
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h3 className="text-sm font-medium text-slate-700 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <Fingerprint className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                      Setup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {key === 'email_notifications' && 'Receive email updates about your account'}
                          {key === 'push_notifications' && 'Get push notifications in your browser'}
                          {key === 'sms_alerts' && 'Receive SMS alerts for urgent matters'}
                          {key === 'weekly_report' && 'Weekly summary of hospital activities'}
                          {key === 'security_alerts' && 'Immediate alerts for security events'}
                          {key === 'marketing_emails' && 'Receive product updates and announcements'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Display Preferences</h2>
                
                <div className="space-y-4">
                  {/* Dark Mode */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-3">
                      {darkMode ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-slate-600" />}
                      <div>
                        <p className="text-sm font-medium text-slate-900">Dark Mode</p>
                        <p className="text-xs text-slate-500">Switch between light and dark themes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Language */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <Languages className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Language</p>
                        <p className="text-xs text-slate-500">Select your preferred language</p>
                      </div>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  {/* Timezone */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Timezone</p>
                        <p className="text-xs text-slate-500">Set your local timezone</p>
                      </div>
                    </div>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
                    >
                      <option value="America/New_York">Eastern Time (EST)</option>
                      <option value="America/Chicago">Central Time (CST)</option>
                      <option value="America/Denver">Mountain Time (MST)</option>
                      <option value="America/Los_Angeles">Pacific Time (PST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">Active Sessions</h2>
                  <button
                    onClick={handleLogoutAll}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Log out all devices
                  </button>
                </div>

                <div className="space-y-4">
                  {sessionHistory.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg border ${
                        session.current ? 'border-blue-200 bg-blue-50' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            session.current ? 'bg-blue-100' : 'bg-slate-100'
                          }`}>
                            <Globe className={`w-4 h-4 ${
                              session.current ? 'text-blue-600' : 'text-slate-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {session.device}
                              {session.current && (
                                <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {session.location} • IP: {session.ip}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Last active: {format(new Date(session.lastActive), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                        {!session.current && (
                          <button
                            onClick={() => handleRevokeSession(session.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Data & Privacy */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-medium text-slate-900 mb-3">Data & Privacy</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <Download className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-600">Download Data</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600">Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;