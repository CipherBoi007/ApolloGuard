import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Stethoscope,
  HeartPulse,
  Mail,
  Phone,
  Calendar,
  Award,
  MapPin,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [stats, setStats] = useState({ doctors: 0, nurses: 0, departments: 0 });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const [doctorsRes, nursesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/users?role=doctor'),
        axios.get('http://localhost:5000/api/admin/users?role=nurse')
      ]);
      
      const allStaff = [...doctorsRes.data, ...nursesRes.data];
      setStaff(allStaff);
      
      // Calculate stats
      const departments = [...new Set(allStaff.map(s => s.department).filter(Boolean))];
      setStats({
        doctors: doctorsRes.data.length,
        nurses: nursesRes.data.length,
        departments: departments.length
      });
      
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      toast.error('Failed to load staff data');
      
      // Fallback mock data
      const mockStaff = [
        { id: '1', first_name: 'John', last_name: 'Smith', role: 'doctor', email: 'john.smith@hospital.com', phone: '555-0101', department: 'Cardiology', specialization: 'Cardiologist', experience_years: 12, is_active: true },
        { id: '2', first_name: 'Sarah', last_name: 'Chen', role: 'doctor', email: 'sarah.chen@hospital.com', phone: '555-0102', department: 'Neurology', specialization: 'Neurologist', experience_years: 8, is_active: true },
        { id: '3', first_name: 'Michael', last_name: 'Rodriguez', role: 'doctor', email: 'michael.rodriguez@hospital.com', phone: '555-0103', department: 'Pediatrics', specialization: 'Pediatrician', experience_years: 15, is_active: true },
        { id: '4', first_name: 'Mary', last_name: 'Wilson', role: 'nurse', email: 'mary.wilson@hospital.com', phone: '555-0201', department: 'ICU', specialization: 'Critical Care', experience_years: 10, is_active: true },
        { id: '5', first_name: 'James', last_name: 'Brown', role: 'nurse', email: 'james.brown@hospital.com', phone: '555-0202', department: 'Emergency', specialization: 'Emergency Care', experience_years: 6, is_active: true },
      ];
      setStaff(mockStaff);
      setStats({
        doctors: 3,
        nurses: 2,
        departments: 4
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      toast.success('Staff member removed');
      fetchStaff();
    } catch (error) {
      toast.error('Failed to remove staff');
    }
  };

  const getRoleIcon = (role) => {
    return role === 'doctor' ? Stethoscope : HeartPulse;
  };

  const getRoleBadge = (role) => {
    return role === 'doctor' 
      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  };

  const departments = [...new Set(staff.map(s => s.department).filter(Boolean))];

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.specialization || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesDept = departmentFilter === 'all' || member.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesDept;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500 mt-1">Manage doctors, nurses, and healthcare staff</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStaff}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
          <Link
            to="/admin/users/new?role=doctor"
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Doctors</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.doctors}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-full">
            +2 this month
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Nurses</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.nurses}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <HeartPulse className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-full">
            +5 this month
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Departments</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.departments}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded-full">
            Fully staffed
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
          >
            <option value="all">All Roles</option>
            <option value="doctor">Doctors</option>
            <option value="nurse">Nurses</option>
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => {
          const RoleIcon = getRoleIcon(member.role);
          const roleBadge = getRoleBadge(member.role);
          
          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                        <span className="text-xl font-semibold text-slate-700">
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        member.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Dr. {member.first_name} {member.last_name}
                      </h3>
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-2 ${roleBadge}`}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {member.role === 'doctor' ? 'Physician' : 'Registered Nurse'}
                      </div>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-slate-400 mr-3" />
                    <span className="text-slate-600">{member.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-slate-400 mr-3" />
                    <span className="text-slate-600">{member.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Award className="w-4 h-4 text-slate-400 mr-3" />
                    <span className="text-slate-600">
                      {member.specialization || 'General'} • {member.experience_years || 0} yrs exp
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-slate-400 mr-3" />
                    <span className="text-slate-600">{member.department || 'Not assigned'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.is_active 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-slate-400">
                      ID: {member.id.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No staff members found</p>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;