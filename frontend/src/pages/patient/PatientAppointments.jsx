import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  RefreshCw,
  Calendar as CalendarIcon,
  MapPin,
  User,
  Video,
  XCircle,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import toast from 'react-hot-toast';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    new_date: '',
    new_time: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patient/appointments');
      console.log('Appointments data:', response.data);
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    toast.success('Appointments updated');
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    
    try {
      await axios.put(`http://localhost:5000/api/patient/appointments/${selectedAppointment.id}/cancel`);
      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleData.new_date || !rescheduleData.new_time) {
      toast.error('Please select new date and time');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/patient/appointments/${selectedAppointment.id}/reschedule`,
        rescheduleData
      );
      toast.success('Appointment rescheduled successfully');
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      setRescheduleData({ new_date: '', new_time: '' });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
      toast.error('Failed to reschedule appointment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Confirmed', icon: CheckCircle },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled', icon: CalendarIcon },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: XCircle },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending', icon: AlertCircle }
    };
    return badges[status] || badges.pending;
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'upcoming') {
      return apt.status !== 'completed' && apt.status !== 'cancelled' && new Date(apt.date) >= new Date();
    } else if (filter === 'past') {
      return apt.status === 'completed' || new Date(apt.date) < new Date();
    } else if (filter === 'cancelled') {
      return apt.status === 'cancelled';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-500 mt-1">Schedule and manage your appointments</p>
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
            <Link
              to="/patient/appointments/new"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">New Appointment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-8 py-6">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            {['upcoming', 'past', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${
                  filter === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab} Appointments
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="px-8 py-6">
        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const statusBadge = getStatusBadge(apt.status);
            const StatusIcon = statusBadge.icon;
            const appointmentDate = new Date(apt.date);
            const isUpcoming = appointmentDate >= new Date() && apt.status !== 'cancelled' && apt.status !== 'completed';
            
            return (
              <div
                key={apt.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{apt.doctor_name}</h3>
                          <p className="text-sm text-gray-500">{apt.specialty}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(appointmentDate, 'EEEE, MMMM d, yyyy')}
                            {isToday(appointmentDate) && (
                              <span className="ml-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Today
                              </span>
                            )}
                            {isTomorrow(appointmentDate) && (
                              <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                Tomorrow
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="text-sm font-medium text-gray-900">
                            {apt.time} ({apt.duration})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-900">{apt.location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {apt.notes && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium">Notes</p>
                        <p className="text-sm text-blue-700 mt-1">{apt.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {isUpcoming && (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowRescheduleModal(true);
                          }}
                          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowCancelModal(true);
                          }}
                          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No {filter} appointments found</p>
            {filter === 'upcoming' && (
              <Link
                to="/patient/appointments/new"
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 inline-block"
              >
                Schedule your first appointment
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Appointment</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your appointment with{' '}
              <span className="font-semibold">{selectedAppointment.doctor_name}</span> on{' '}
              <span className="font-semibold">
                {format(new Date(selectedAppointment.date), 'MMMM d, yyyy')}
              </span>
              at <span className="font-semibold">{selectedAppointment.time}</span>?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reschedule Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  value={rescheduleData.new_date}
                  onChange={(e) => setRescheduleData({...rescheduleData, new_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Time
                </label>
                <input
                  type="time"
                  value={rescheduleData.new_time}
                  onChange={(e) => setRescheduleData({...rescheduleData, new_time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setRescheduleData({ new_date: '', new_time: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;