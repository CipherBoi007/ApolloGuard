import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        {/* Top Navigation */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center flex-1">
            <div className="relative w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients, records, or reports..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-slate-200 shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                        <p className="text-sm text-slate-700">New patient record added</p>
                        <p className="text-xs text-slate-400 mt-1">5 minutes ago</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
              <button className="flex items-center space-x-1 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-slate-700">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;