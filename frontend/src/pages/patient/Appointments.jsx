import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Video, MessageCircle, FileText, Filter, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { formatDate, formatTime, formatCurrency } from '../../lib/utils';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [filter, appointments]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await api.get('/appointments/my');
            setAppointments(data.appointments || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        if (filter === 'all') {
            setFilteredAppointments(appointments);
        } else if (filter === 'upcoming') {
            setFilteredAppointments(
                appointments.filter(apt =>
                    apt.status !== 'cancelled' && apt.status !== 'completed'
                )
            );
        } else if (filter === 'completed') {
            setFilteredAppointments(
                appointments.filter(apt => apt.status === 'completed')
            );
        } else if (filter === 'cancelled') {
            setFilteredAppointments(
                appointments.filter(apt => apt.status === 'cancelled')
            );
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            await api.patch(`/appointments/${appointmentId}/cancel`);
            fetchAppointments(); // Refresh list
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment. Please try again.');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { class: 'badge-warning', text: 'Pending' },
            confirmed: { class: 'badge-success', text: 'Confirmed' },
            in_progress: { class: 'badge-info', text: 'In Progress' },
            completed: { class: 'badge-success', text: 'Completed' },
            cancelled: { class: 'badge-danger', text: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <span className={`badge ${config.class}`}>{config.text}</span>;
    };

    const getTypeBadge = (type) => {
        return type === 'emergency' ? (
            <span className="badge badge-danger">Emergency</span>
        ) : (
            <span className="badge badge-info">Scheduled</span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spin h-12 w-12 mx-auto mb-4 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-600">Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
                <p className="text-gray-600">Manage and track all your medical appointments</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2">
                <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All ({appointments.length})
                </button>
                <button
                    onClick={() => setFilter('upcoming')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === 'upcoming'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Upcoming ({appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed').length})
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === 'completed'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Completed ({appointments.filter(a => a.status === 'completed').length})
                </button>
                <button
                    onClick={() => setFilter('cancelled')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === 'cancelled'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
                </button>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <div className="card p-12 text-center">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No {filter !== 'all' ? filter : ''} appointments
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {filter === 'all'
                            ? "You haven't booked any appointments yet."
                            : `You don't have any ${filter} appointments.`}
                    </p>
                    <Link to="/patient/doctors" className="btn-primary">
                        Book an Appointment
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                        <div key={appointment.id} className="card p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Appointment Info */}
                                <div className="flex items-start space-x-4 flex-1">
                                    <div className="h-14 w-14 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Users className="h-7 w-7 text-primary-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center flex-wrap gap-2 mb-2">
                                            <h3 className="font-semibold text-lg text-gray-900">
                                                Dr. {appointment.doctor_name}
                                            </h3>
                                            {getTypeBadge(appointment.type)}
                                            {getStatusBadge(appointment.status)}
                                        </div>

                                        <p className="text-gray-600 mb-3">{appointment.doctor_specialization}</p>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1.5" />
                                                {formatDate(appointment.appointment_date)}
                                            </span>
                                            <span className="flex items-center">
                                                <Clock className="h-4 w-4 mr-1.5" />
                                                {formatTime(appointment.appointment_time)}
                                            </span>
                                        </div>

                                        {appointment.symptoms && (
                                            <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-700">
                                                    <strong>Symptoms:</strong> {appointment.symptoms}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col space-y-2 lg:ml-4">
                                    {appointment.is_video_unlocked && appointment.zoom_join_url && (
                                        <a
                                            href={appointment.zoom_join_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary text-center whitespace-nowrap"
                                        >
                                            <Video className="h-4 w-4 inline mr-2" />
                                            Join Video Call
                                        </a>
                                    )}

                                    {appointment.is_chat_unlocked && (
                                        <Link
                                            to={`/patient/chat/${appointment.id}`}
                                            className="btn-secondary text-center whitespace-nowrap"
                                        >
                                            <MessageCircle className="h-4 w-4 inline mr-2" />
                                            Open Chat
                                        </Link>
                                    )}

                                    {appointment.status === 'completed' && (
                                        <button className="btn-secondary text-center whitespace-nowrap">
                                            <FileText className="h-4 w-4 inline mr-2" />
                                            View Prescription
                                        </button>
                                    )}

                                    {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                        <button
                                            onClick={() => handleCancelAppointment(appointment.id)}
                                            className="btn-danger text-center whitespace-nowrap"
                                        >
                                            Cancel Appointment
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Unlock Notice */}
                            {!appointment.is_chat_unlocked && appointment.type === 'scheduled' && appointment.status !== 'cancelled' && (
                                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-900">Chat and video locked</p>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Access will be unlocked at midnight on {formatDate(appointment.appointment_date)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {appointment.type === 'emergency' && appointment.doctor_phone && (
                                <div className="mt-4 bg-danger-50 border border-danger-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-danger-900">Emergency Contact</p>
                                    <p className="text-sm text-danger-700 mt-1">
                                        Doctor's Phone: <a href={`tel:${appointment.doctor_phone}`} className="font-semibold underline">{appointment.doctor_phone}</a>
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Appointments;
