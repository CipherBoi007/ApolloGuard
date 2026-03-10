import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Stethoscope,
  HeartPulse,
  UserCircle,
  Calendar,
  MapPin,
  Home,
  Droplet,
  Ruler,
  Weight,
  AlertCircle,
  RotateCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    is_active: true,
    
    // Patient specific
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
    chronic_conditions: '',
    
    // Staff specific
    specialization: '',
    license_number: '',
    department: '',
    experience_years: '',
    qualification: ''
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setFetchLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/users/${id}`);
      const userData = response.data;
      setUser(userData);
      
      // Populate form
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || '',
        is_active: userData.is_active,
        
        // Patient fields
        date_of_birth: userData.patient_details?.date_of_birth || '',
        gender: userData.patient_details?.gender || '',
        blood_group: userData.patient_details?.blood_group || '',
        emergency_contact: userData.patient_details?.emergency_contact || '',
        address: userData.patient_details?.address || '',
        city: userData.patient_details?.city || '',
        state: userData.patient_details?.state || '',
        zip_code: userData.patient_details?.zip_code || '',
        height: userData.patient_details?.height || '',
        weight: userData.patient_details?.weight || '',
        allergies: userData.patient_details?.allergies || '',
        chronic_conditions: userData.patient_details?.chronic_conditions || '',
        
        // Staff fields
        specialization: userData.staff_details?.specialization || '',
        license_number: userData.staff_details?.license_number || '',
        department: userData.staff_details?.department || '',
        experience_years: userData.staff_details?.experience_years || '',
        qualification: userData.staff_details?.qualification || ''
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Failed to load user data');
      navigate('/admin/users');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        is_active: formData.is_active
      };

      // Add role-specific data
      if (formData.role === 'patient') {
        userData.patient_details = {
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          blood_group: formData.blood_group,
          emergency_contact: formData.emergency_contact,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          allergies: formData.allergies,
          chronic_conditions: formData.chronic_conditions
        };
      } else if (formData.role === 'doctor' || formData.role === 'nurse') {
        userData.staff_details = {
          specialization: formData.specialization,
          license_number: formData.license_number,
          department: formData.department,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
          qualification: formData.qualification
        };
      }

      await axios.put(`http://localhost:5000/api/admin/users/${id}`, userData);
      
      toast.success('User updated successfully!');
      navigate(`/admin/users/${id}`);
      
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
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

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(formData.role);

  return (
    <div className="px-8 py-6 max-w-4xl mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200 -mx-8 px-8 py-4 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/admin/users/${id}`)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit User</h1>
              <p className="text-sm text-slate-500 mt-1">Update user information and permissions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Live Indicator */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-slate-500">
                  Live • Updated {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
                title="Refresh data"
              >
                <RotateCw className={`w-4 h-4 text-slate-600 group-hover:text-slate-900 ${
                  refreshing ? 'animate-spin' : ''
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* User Info Header */}
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-200">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
            formData.role === 'admin' ? 'bg-purple-100 text-purple-600' :
            formData.role === 'doctor' ? 'bg-blue-100 text-blue-600' :
            formData.role === 'nurse' ? 'bg-emerald-100 text-emerald-600' :
            'bg-amber-100 text-amber-600'
          }`}>
            <RoleIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {formData.first_name} {formData.last_name}
            </h2>
            <p className="text-sm text-slate-600 capitalize">{formData.role}</p>
          </div>
          <div className="ml-auto">
            <label className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Active</span>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500/20 focus:ring-2"
              />
            </label>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                placeholder="Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Specific Fields */}
        {formData.role === 'patient' && (
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                >
                  <option value="" className="text-slate-500">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Blood Group
                </label>
                <div className="relative">
                  <Droplet className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                  >
                    <option value="" className="text-slate-500">Select Blood Group</option>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Address
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                    placeholder="123 Main St"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                  placeholder="10001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Height (cm)
                </label>
                <div className="relative">
                  <Ruler className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                    placeholder="175"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Weight (kg)
                </label>
                <div className="relative">
                  <Weight className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                    placeholder="70"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900 resize-none"
                  placeholder="List any known allergies (e.g., Penicillin, Peanuts)"
                />
                <p className="mt-1 text-xs text-slate-400">Separate multiple allergies with commas</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Chronic Conditions
                </label>
                <textarea
                  name="chronic_conditions"
                  value={formData.chronic_conditions}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900 resize-none"
                  placeholder="List any chronic conditions (e.g., Diabetes, Hypertension)"
                />
                <p className="mt-1 text-xs text-slate-400">Separate multiple conditions with commas</p>
              </div>
            </div>
          </div>
        )}

        {/* Staff Specific Fields */}
        {(formData.role === 'doctor' || formData.role === 'nurse') && (
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                  placeholder={formData.role === 'doctor' ? 'Cardiology' : 'ICU'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  License Number
                </label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                  placeholder="LIC12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                  placeholder="Cardiology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900"
                  placeholder="10"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Qualifications
                </label>
                <textarea
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-slate-900 resize-none"
                  placeholder="MD, Board Certified, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/admin/users/${id}`)}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[120px] justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
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
  );
};

export default EditUser;