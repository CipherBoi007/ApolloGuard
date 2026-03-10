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
  Shield,
  Stethoscope,
  HeartPulse,
  UserCircle,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  Award,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    doctors: 0,
    nurses: 0,
    patients: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users');
      console.log('Users data:', response.data);
      
      const usersData = response.data;
      setUsers(usersData);
      
      // Calculate stats
      const active = usersData.filter(u => u.is_active).length;
      setStats({
        total: usersData.length,
        active,
        admins: usersData.filter(u => u.role === 'admin').length,
        doctors: usersData.filter(u => u.role === 'doctor').length,
        nurses: usersData.filter(u => u.role === 'nurse').length,
        patients: usersData.filter(u => u.role === 'patient').length
      });
      
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
    toast.success('User list updated');
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}`, {
        is_active: !currentStatus
      });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update user status');
    }
  };

  const handlePromote = async (userId) => {
    if (!window.confirm('Are you sure you want to promote this user to admin?')) return;
    
    try {
      await axios.post(`http://localhost:5000/api/admin/users/${userId}/promote`);
      toast.success('User promoted to admin');
      fetchUsers();
    } catch (error) {
      console.error('Promote error:', error);
      toast.error('Failed to promote user');
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(user => 
        `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone || '').includes(searchTerm)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
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
      
      if (sortConfig.key === 'created_at') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, roleFilter, statusFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setShowFilters(false);
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
      admin: 'bg-purple-100 text-purple-700',
      doctor: 'bg-blue-100 text-blue-700',
      nurse: 'bg-emerald-100 text-emerald-700',
      patient: 'bg-amber-100 text-amber-700'
    };
    return badges[role] || 'bg-slate-100 text-slate-700';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center mt-4 text-slate-600">Loading users...</p>
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
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-600 text-sm mt-1">Manage system users, roles, and permissions</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="patient">Patient</option>
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
              to="/admin/users/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
            <div className="text-sm text-slate-600">Total Users</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{stats.admins}</div>
            <div className="text-sm text-slate-600">Admins</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{stats.doctors}</div>
            <div className="text-sm text-slate-600">Doctors</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <HeartPulse className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{stats.nurses}</div>
            <div className="text-sm text-slate-600">Nurses</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <UserCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{stats.patients}</div>
            <div className="text-sm text-slate-600">Patients</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-100 rounded-xl">
                <Award className="w-6 h-6 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{stats.active}</div>
            <div className="text-sm text-slate-600">Active Users</div>
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
                placeholder="Search by name, email, or phone..."
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

            {(roleFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="patient">Patient</option>
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

      {/* Users Table */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 text-xs font-medium text-slate-600 uppercase tracking-wider hover:text-slate-900"
                    >
                      <span>User</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('role')}
                      className="flex items-center space-x-1 text-xs font-medium text-slate-600 uppercase tracking-wider hover:text-slate-900"
                    >
                      <span>Role</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('is_active')}
                      className="flex items-center space-x-1 text-xs font-medium text-slate-600 uppercase tracking-wider hover:text-slate-900"
                    >
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center space-x-1 text-xs font-medium text-slate-600 uppercase tracking-wider hover:text-slate-900"
                    >
                      <span>Created</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  const roleBadge = getRoleBadge(user.role);
                  
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-slate-700">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.phone ? (
                          <span className="text-sm text-slate-600 flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.is_active)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.is_active 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            user.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}></span>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/users/${user.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handlePromote(user.id)}
                              className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                              title="Promote to Admin"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No users found</p>
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
    </div>
  );
};

export default UsersManagement;