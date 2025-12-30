import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, Clock, AlertCircle, CheckCircle, Video, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { formatDate, formatTime } from '../../lib/utils';

const PatientDashboard = () => {
    const { user } = useAuthStore();
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        upcoming: 0,
        completed: 0,
        prescriptions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch upcoming appointments
            const appointmentsData = await api.get('/appointments/my');
            const upcomingAppts = appointmentsData.appointments?.filter(
                apt => apt.status !== 'cancelled' && apt.status !== 'completed'
            ) || [];

            setAppointments(upcomingAppts.slice(0, 5)); // Show only 5 recent

            // Calculate stats
            setStats({
                upcoming: upcomingAppts.length,
                completed: appointmentsData.appointments?.filter(apt => apt.status === 'completed').length || 0,
                prescriptions: 0 // Will be updated when prescriptions API is called
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
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
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                    Here's what's happening with your health today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Upcoming Appointments</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                        </div>
                        <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary-600" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Completed Visits</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                        </div>
                        <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-success-600" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Prescriptions</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.prescriptions}</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/patient/doctors" className="card p-6 card-hover text-center">
                        <Users className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900">Browse Doctors</h3>
                        <p className="text-sm text-gray-600 mt-1">Find specialists</p>
                    </Link>

                    <Link to="/patient/appointments" className="card p-6 card-hover text-center">
                        <Calendar className="h-8 w-8 text-success-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900">My Appointments</h3>
                        <p className="text-sm text-gray-600 mt-1">View all bookings</p>
                    </Link>

                    <Link to="/patient/prescriptions" className="card p-6 card-hover text-center">
                        <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900">Prescriptions</h3>
                        <p className="text-sm text-gray-600 mt-1">View records</p>
                    </Link>

                    <Link to="/patient/doctors" className="card p-6 card-hover text-center bg-danger-50 border-danger-200">
                        <AlertCircle className="h-8 w-8 text-danger-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-danger-900">Emergency</h3>
                        <p className="text-sm text-danger-700 mt-1">Book urgent care</p>
                    </Link>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
                    <Link to="/patient/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View All →
                    </Link>
                </div>

                {appointments.length === 0 ? (
                    <div className="card p-8 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4">No upcoming appointments</p>
                        <Link to="/patient/doctors" className="btn-primary">
                            Book an Appointment
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="card p-6 card-hover">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Users className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    Dr. {appointment.doctor_name}
                                                </h3>
                                                {getTypeBadge(appointment.type)}
                                                {getStatusBadge(appointment.status)}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {appointment.doctor_specialization}
                                            </p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {formatDate(appointment.appointment_date)}
                                                </span>
                                                <span className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {formatTime(appointment.appointment_time)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                        {appointment.is_chat_unlocked && (
                                            <Link
                                                to={`/patient/chat/${appointment.id}`}
                                                className="btn-secondary py-2 px-3 text-sm"
                                            >
                                                <MessageCircle className="h-4 w-4 mr-1 inline" />
                                                Chat
                                            </Link>
                                        )}
                                        {appointment.is_video_unlocked && appointment.zoom_join_url && (
                                            <a
                                                href={appointment.zoom_join_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-primary py-2 px-3 text-sm"
                                            >
                                                <Video className="h-4 w-4 mr-1 inline" />
                                                Join Call
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {!appointment.is_chat_unlocked && appointment.type === 'scheduled' && (
                                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <p className="text-sm text-yellow-800">
                                            <Clock className="h-4 w-4 inline mr-1" />
                                            Chat and video will unlock on {formatDate(appointment.appointment_date)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Health Tips Section */}
            <div className="mt-8 card p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
                <h3 className="font-semibold text-gray-900 mb-2">💡 Health Tip of the Day</h3>
                <p className="text-gray-700">
                    Stay hydrated! Aim to drink at least 8 glasses of water daily to maintain optimal health and energy levels.
                </p>
            </div>
        </div>
    );
};

export default PatientDashboard;
