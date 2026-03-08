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
  Video,
  Phone,
  FileText,
  Activity
} from 'lucide-react';
import { format, addDays, subDays, isToday, isTomorrow, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const DoctorSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState('day'); // day, week
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    waiting: 0,
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
          patient_initials: 'RJ',
          time: '09:00',
          duration: '30 min',
          type: 'Follow-up',
          reason: 'Blood pressure check',
          room: '302',
          status: 'completed',
          vitals: { bp: '138/88', hr: 72 },
          notes: 'BP improving, continue medication'
        },
        {
          id: '2',
          patient_name: 'Maria Chen',
          patient_id: '2',
          patient_initials: 'MC',
          time: '10:30',
          duration: '45 min',
          type: 'Consultation',
          reason: 'Diabetes management',
          room: '305',
          status: 'in-progress',
          vitals: { bp: '128/82', hr: 68, glucose: 142 },
          notes: 'Review lab results'
        },
        {
          id: '3',
          patient_name: 'James Wilson',
          patient_id: '3',
          patient_initials: 'JW',
          time: '11:15',
          duration: '30 min',
          type: 'Follow-up',
          reason: 'Post-op check',
          room: '308',
          status: 'waiting',
          vitals: { bp: '118/76', hr: 70 },
          notes: 'Surgical wound healing well'
        },
        {
          id: '4',
          patient_name: 'Emily Thompson',
          patient_id: '4',
          patient_initials: 'ET',
          time: '13:00',
          duration: '60 min',
          type: 'New Patient',
          reason: 'Initial consultation',
          room: '310',
          status: 'scheduled',
          notes: 'New patient intake'
        },
        {
          id: '5',
          patient_name: 'David Kim',
          patient_id: '5',
          patient_initials: 'DK',
          time: '14:30',
          duration: '30 min',
          type: 'Follow-up',
          reason: 'Medication review',
          room: '315',
          status: 'scheduled',
          vitals: { bp: '125/80', hr: 68 },
          notes: 'Review current medications'
        },
        {
          id: '6',
          patient_name: 'Sarah Williams',
          patient_id: '6',
          patient_initials: 'SW',
          time: '15:45',
          duration: '30 min',
          type: 'Telehealth',
          reason: 'Virtual follow-up',
          room: 'Virtual',
          status: 'cancelled',
          notes: 'Patient cancelled, rescheduled for next week'
        }
      ];

      setAppointments(mockAppointments);
      
      // Calculate stats
      setStats({
        total: mockAppointments.length,
        completed: mockAppointments.filter(a => a.status === 'completed').length,
        inProgress: mockAppointments.filter(a => a.status === 'in-progress').length,
        waiting: mockAppointments.filter(a => a.status === 'waiting').length,
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
      
      // Update stats
      const updatedStats = { ...stats };
      const oldStatus = appointments.find(a => a.id === appointmentId)?.status;
      if (oldStatus) {
        updatedStats[oldStatus]--;
        updatedStats[newStatus]++;
        setStats(updatedStats);
      }
      
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed', icon: CheckCircle },
      'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress', icon: Activity },
      waiting: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Waiting', icon: AlertCircle },
      scheduled: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Scheduled', icon: Clock },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: XCircle }
    };
    return badges[status] || badges.scheduled;
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleJoinTelehealth = (appointment) => {
    toast.success('Telehealth session starting...');
    // Implement actual telehealth integration
  };

  const handleViewPatient = (patientId) => {
    // Navigate to patient details
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
            <p className="text-gray-500 mt-1">Manage your daily appointments and patient visits</p>
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
              <span className="text-sm">New Appointment</span>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Appointments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Waiting</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.waiting}</p>
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
                <div key={time} className="h-24 border-b border-gray-100 px-4 py-2">
                  <span className="text-sm font-medium text-gray-700">{time}</span>
                </div>
              ))}
            </div>

            {/* Appointments Column */}
            <div className="col-span-10">
              <div className="h-16 border-b border-gray-200 px-4 py-4 bg-gray-50">
                <span className="text-sm font-medium text-gray-600">Appointments</span>
              </div>
              {timeSlots.map((time) => {
                const slotAppointments = appointments.filter(apt => apt.time === time);
                
                return (
                  <div key={time} className="h-24 border-b border-gray-100 p-2 relative group hover:bg-blue-50/30 transition-colors">
                    {slotAppointments.length > 0 ? (
                      <div className="space-y-1">
                        {slotAppointments.map((apt) => {
                          const statusBadge = getStatusBadge(apt.status);
                          const StatusIcon = statusBadge.icon;
                          
                          return (
                            <div
                              key={apt.id}
                              className="p-2 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              style={{ borderLeftColor: 
                                apt.status === 'completed' ? '#10B981' :
                                apt.status === 'in-progress' ? '#3B82F6' :
                                apt.status === 'waiting' ? '#F59E0B' :
                                apt.status === 'cancelled' ? '#EF4444' : '#8B5CF6'
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {apt.patient_initials}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{apt.patient_name}</p>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      <span>{apt.type}</span>
                                      <span>•</span>
                                      <span>Room {apt.room}</span>
                                      {apt.vitals && (
                                        <>
                                          <span>•</span>
                                          <span>BP: {apt.vitals.bp}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusBadge.label}
                                  </span>
                                  {apt.type === 'Telehealth' && apt.status !== 'completed' && (
                                    <button
                                      onClick={() => handleJoinTelehealth(apt)}
                                      className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                      title="Join Telehealth"
                                    >
                                      <Video className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              {apt.notes && (
                                <p className="text-xs text-gray-500 mt-1">{apt.notes}</p>
                              )}
                              {(apt.status === 'waiting' || apt.status === 'scheduled') && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <button
                                    onClick={() => updateAppointmentStatus(apt.id, 'in-progress')}
                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                  >
                                    Start Appointment
                                  </button>
                                  <button
                                    onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                                    className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                                  >
                                    Mark Complete
                                  </button>
                                </div>
                              )}
                              {apt.status === 'in-progress' && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                                    className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                                  >
                                    Complete & Add Notes
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
                          + Add appointment
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

      {/* Summary Cards */}
      <div className="px-8 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Appointments Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
          <div className="space-y-3">
            {appointments
              .filter(apt => apt.status === 'scheduled' || apt.status === 'waiting')
              .slice(0, 3)
              .map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{apt.patient_name}</p>
                      <p className="text-xs text-gray-500">{apt.time} • {apt.type} • Room {apt.room}</p>
                    </div>
                  </div>
                  <Link
                    to={`/doctor/patients/${apt.patient_id}`}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    View
                  </Link>
                </div>
              ))}
          </div>
        </div>

        {/* Today's Stats */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Today's Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold">{stats.completed}</p>
              <p className="text-sm text-blue-100">Completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.inProgress + stats.waiting}</p>
              <p className="text-sm text-blue-100">Pending</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-blue-100">Total</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{Math.round((stats.completed / stats.total) * 100)}%</p>
              <p className="text-sm text-blue-100">Completion</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-500">
            <p className="text-sm text-blue-100">
              Next appointment in 15 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;