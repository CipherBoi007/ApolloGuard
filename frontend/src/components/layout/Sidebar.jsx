import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCog,
  BarChart3,
  Stethoscope,
  HeartPulse,
  Calendar,
  Settings,
  LogOut,
  Activity,
  TrendingUp,
  Shield,
  FileText,
  Bell,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    const role = user?.role;
    
    const items = {
      admin: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, end: true },
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Staff Management', path: '/admin/staff', icon: UserCog },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ],
      doctor: [
        { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard, end: true },
        { name: 'Patients', path: '/doctor/patients', icon: Users },
        { name: 'Predictions', path: '/doctor/predictions', icon: TrendingUp },
        { name: 'Schedule', path: '/doctor/schedule', icon: Calendar },
        { name: 'Reports', path: '/doctor/reports', icon: FileText },
        { name: 'Settings', path: '/doctor/settings', icon: Settings },
      ],
      nurse: [
        { name: 'Dashboard', path: '/nurse/dashboard', icon: LayoutDashboard, end: true },
        { name: 'Patients', path: '/nurse/patients', icon: Users },
        { name: 'Clinical Records', path: '/nurse/records', icon: FileText },
        { name: 'Vitals', path: '/nurse/vitals', icon: Activity },
        { name: 'Schedule', path: '/nurse/schedule', icon: Calendar },
        { name: 'Settings', path: '/nurse/settings', icon: Settings },
      ],
      patient: [
        { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard, end: true },
        { name: 'My Records', path: '/patient/records', icon: FileText },
        { name: 'My Diagnosis', path: '/patient/diagnosis', icon: HeartPulse },
        // { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
        // { name: 'Messages', path: '/patient/messages', icon: Bell },
        { name: 'My Profile', path: '/patient/profile', icon: User },
      ],
    };
    
    return items[role] || [];
  };

  const navItems = getNavItems();

  // Get user initials
  const getInitials = () => {
    if (!user) return 'U';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  // Get role badge color
  const getRoleBadge = () => {
    const roles = {
      admin: 'bg-slate-900 text-white',
      doctor: 'bg-slate-700 text-white',
      nurse: 'bg-slate-600 text-white',
      patient: 'bg-slate-200 text-slate-900'
    };
    return roles[user?.role] || 'bg-slate-100 text-slate-700';
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo Section with subtle gradient */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50">
        <div className="flex items-center space-x-2">
          <HeartPulse className="w-6 h-6 text-slate-1000" /> 
          </div>
          <span className="font-semibold text-slate-900">ApolloGuard</span>
        </div>
      
      {/* User Profile Section */}
      <div className="px-4 py-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shadow-inner">
            <span className="text-sm font-semibold text-slate-700">{getInitials()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-slate-500 flex items-center mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${user?.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.end 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: active }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  isActive || active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
              <span>{item.name}</span>
              
              {/* Active indicator */}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      {/* Footer with Logout */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <button
          onClick={logout}
          className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 w-full transition-all group"
        >
          <LogOut className="w-5 h-5 mr-3 text-slate-400 group-hover:text-slate-600" />
          <span>Logout</span>
        </button>
        
        {/* Version info */}
        <div className="mt-3 px-3 text-xs text-slate-400">
          v2.1.0 • Enterprise
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;