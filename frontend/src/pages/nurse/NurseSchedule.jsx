import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  Filter,
  Download,
  Bell
} from 'lucide-react';
import { format, addDays, subDays, isToday, isTomorrow, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const NurseSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState('day'); // day, week
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockAppointments = [
        {
          id: '1',
          patient_name: 'Robert Johnson',
          patient_id: '1',
          time: '09:00',
          type: 'Vitals Check',
          room: '302',
          status: 'completed',
          notes: 'Regular checkup'
        },
        {
          id: '2',
          patient_name: 'Maria Chen',
          patient_id: '2',
          time: '10:30',
          type: 'Medication Administration',
          room: '305',
          status: 'in-progress',
          notes: 'Insulin administration'
        },
        {
          id: '3',
          patient_name: 'James Wilson',
          patient_id: '3',
          time: '11:15',
          type: 'Wound Dressing',
          room: '308',
          status: 'pending',
          notes: 'Post-surgery dressing change'
        },
        {
          id: '4',
          patient_name: 'Emily Thompson',
          patient_id: '4',
          time: '13:00',
          type: 'New Admission',
          room: '310',
          status: 'pending',
          notes: 'Admit from ER'
        },
        {
          id: '5',
          patient_name: 'David Kim',
          patient_id: '5',
          time: '14:30',
          type: 'Vitals Check',
          room: '315',
          status: 'pending',
          notes: 'Post-op check'
        },
        {
          id: '6',
          patient_name: 'Sarah Williams',
          patient_id: '6',
          time: '15:45',
          type: 'Medication Administration',
          room: '318',
          status: 'cancelled',
          notes: 'Patient discharged'
        }
      ];

      setAppointments(mockAppointments);
      
      // Calculate stats
      setStats({
        total: mockAppointments.length,
        completed: mockAppointments.filter(a => a.status === 'completed').length,
        pending: mockAppointments.filter(a => a.status === 'pending' || a.status === 'in-progress').length,
        cancelled: mockAppointments.filter(a => a.status === 'cancelled').length
      });

    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSchedule();
    setRefreshing(false);
    toast.success('Schedule updated');
  };

  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      // Mock update - replace with API call
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed', icon: CheckCircle },
      'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress', icon: Clock },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending', icon: AlertCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: XCircle }
    };
    return badges[status] || badges.pending;
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <p className="text-center mt-4 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Schedule</h1>
            <p className="text-gray-500 mt-1">Manage your daily tasks and appointments</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm text-gray-600">Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePreviousDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView('day')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-0">
            {/* Time Column */}
            <div className="col-span-2 border-r border-gray-200 bg-gray-50">
              <div className="h-16 border-b border-gray-200 px-4 py-4">
                <span className="text-sm font-medium text-gray-600">Time</span>
              </div>
              {timeSlots.map((time) => (
                <div key={time} className="h-20 border-b border-gray-100 px-4 py-2">
                  <span className="text-sm font-medium text-gray-700">{time}</span>
                </div>
              ))}
            </div>

            {/* Appointments Column */}
            <div className="col-span-10">
              <div className="h-16 border-b border-gray-200 px-4 py-4 bg-gray-50">
                <span className="text-sm font-medium text-gray-600">Appointments & Tasks</span>
              </div>
              {timeSlots.map((time) => {
                const slotAppointments = appointments.filter(apt => apt.time === time);
                
                return (
                  <div key={time} className="h-20 border-b border-gray-100 p-2 relative group hover:bg-blue-50/30 transition-colors">
                    {slotAppointments.length > 0 ? (
                      <div className="space-y-1">
                        {slotAppointments.map((apt) => {
                          const statusBadge = getStatusBadge(apt.status);
                          const StatusIcon = statusBadge.icon;
                          
                          return (
                            <div
                              key={apt.id}
                              className="p-2 rounded-lg border-l-4 border-blue-500 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              style={{ borderLeftColor: 
                                apt.status === 'completed' ? '#10B981' :
                                apt.status === 'in-progress' ? '#3B82F6' :
                                apt.status === 'cancelled' ? '#EF4444' : '#F59E0B'
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{apt.patient_name}</p>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                                    <span>{apt.type}</span>
                                    <span>•</span>
                                    <span>Room {apt.room}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusBadge.label}
                                  </span>
                                </div>
                              </div>
                              {apt.notes && (
                                <p className="text-xs text-gray-500 mt-1">{apt.notes}</p>
                              )}
                              {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <button
                                    onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                                    className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                                  >
                                    Mark Complete
                                  </button>
                                  <button
                                    onClick={() => updateAppointmentStatus(apt.id, 'in-progress')}
                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                  >
                                    Start
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-xs text-gray-400 hover:text-blue-600">
                          + Add task
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks Summary */}
      <div className="px-8 pb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h2>
          <div className="space-y-3">
            {appointments
              .filter(apt => apt.status === 'pending')
              .slice(0, 3)
              .map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{apt.patient_name}</p>
                      <p className="text-xs text-gray-500">{apt.type} • Room {apt.room} • {apt.time}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateAppointmentStatus(apt.id, 'in-progress')}
                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    Start
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseSchedule;