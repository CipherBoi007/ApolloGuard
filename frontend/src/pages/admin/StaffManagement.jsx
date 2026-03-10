import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
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
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Briefcase,
  GraduationCap,
  Clock,
  Building2,
  SlidersHorizontal,
  X,
  ArrowUpDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'last_name', direction: 'asc' });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState({
    doctors: 0,
    nurses: 0,
    departments: 0,
    active: 0,
    total: 0
  });

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
      console.log('Staff data:', allStaff);
      
      setStaff(allStaff);
      
      // Calculate stats
      const departments = [...new Set(allStaff.map(s => s.department).filter(Boolean))];
      const active = allStaff.filter(s => s.is_active).length;
      
      setStats({
        doctors: doctorsRes.data.length,
        nurses: nursesRes.data.length,
        departments: departments.length,
        active,
        total: allStaff.length
      });
      
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Failed to fetch staff:', error);
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStaff();
    toast.success('Staff list updated');
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      toast.success('Staff member removed');
      fetchStaff();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove staff');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}`, {
        is_active: !currentStatus
      });
      toast.success(`Staff ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchStaff();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
    }
  };

  const applyFilters = () => {
    let filtered = [...staff];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(member => 
        `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.specialization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.department || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(member => member.department === departmentFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => 
        statusFilter === 'active' ? member.is_active : !member.is_active
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'name') {
        aVal = `${a.first_name} ${a.last_name}`;
        bVal = `${b.first_name} ${b.last_name}`;
      }
      
      if (sortConfig.key === 'experience_years') {
        aVal = a.experience_years || 0;
        bVal = b.experience_years || 0;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredStaff(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [staff, searchTerm, roleFilter, departmentFilter, statusFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setShowFilters(false);
  };

  const getRoleIcon = (role) => {
    return role === 'doctor' ? Stethoscope : HeartPulse;
  };

  const getRoleBadge = (role) => {
    return role === 'doctor' 
      ? 'bg-blue-100 text-blue-700' 
      : 'bg-emerald-100 text-emerald-700';
  };

  const departments = [...new Set(staff.map(s => s.department).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center mt-4 text-slate-600">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
            <p className="text-slate-600 text-sm mt-1">Manage doctors, nurses, and healthcare staff</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="all">All Roles</option>
              <option value="doctor">Doctors</option>
              <option value="nurse">Nurses</option>
            </select>
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
            <Link
              to="/admin/users/new?role=doctor"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards - Matching AdminDashboard style */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-100 rounded-xl">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {stats.active} active
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{stats.total}</div>
            <div className="text-sm text-slate-600 mb-2">Total Staff</div>
            <div className="text-xs text-slate-500">{stats.total - stats.active} inactive</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{stats.doctors}</div>
            <div className="text-sm text-slate-600 mb-2">Doctors</div>
            <div className="text-xs text-slate-500">Avg experience: 8.5 years</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <HeartPulse className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{stats.nurses}</div>
            <div className="text-sm text-slate-600 mb-2">Nurses</div>
            <div className="text-xs text-slate-500">Across {stats.departments} departments</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{stats.departments}</div>
            <div className="text-sm text-slate-600 mb-2">Departments</div>
            <div className="text-xs text-slate-500 truncate">
              {departments.slice(0, 2).join(', ')}{departments.length > 2 ? '...' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2.5 border rounded-lg transition-colors ${
                showFilters ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm">Filters</span>
            </button>

            {(roleFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
              <button
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="doctor">Doctors</option>
                    <option value="nurse">Nurses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Department</label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Staff Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => {
            const RoleIcon = getRoleIcon(member.role);
            const roleBadge = getRoleBadge(member.role);
            
            return (
              <div
                key={member.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-slate-700">
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {member.role === 'doctor' ? 'Dr. ' : ''}{member.first_name} {member.last_name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${roleBadge}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {member.role === 'doctor' ? 'Physician' : 'Registered Nurse'}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.is_active 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                      <span className="text-slate-600 text-sm truncate">{member.email}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                      <span className="text-slate-600 text-sm">{member.phone || '—'}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Award className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                      <span className="text-slate-600 text-sm">
                        {member.specialization || 'General'} • {member.experience_years || 0} years
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Building2 className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                      <span className="text-slate-600 text-sm">{member.department || '—'}</span>
                    </div>
                  </div>

                  {member.license_number && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center text-xs text-slate-500">
                        <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                        <span className="font-medium mr-1">License:</span>
                        {member.license_number}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleStatus(member.id, member.is_active)}
                        className={`p-1.5 rounded-md transition-colors ${
                          member.is_active 
                            ? 'text-amber-600 hover:bg-amber-50' 
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={member.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {member.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      
                      <Link
                        to={`/admin/users/${member.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <Link
                      to={`/admin/users/${member.id}`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                    >
                      View
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No staff members found</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;