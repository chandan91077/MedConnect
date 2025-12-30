import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX, Calendar, DollarSign, TrendingUp, Clock, Activity } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../lib/utils';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalDoctors: 0,
        approvedDoctors: 0,
        pendingDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        completedAppointments: 0,
        totalRevenue: 0,
        todayAppointments: 0
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch statistics
            const statsData = await api.get('/admin/stats');
            setStats(statsData.stats);

            // Fetch recent appointments
            const appointmentsData = await api.get('/admin/appointments');
            setRecentAppointments((appointmentsData.appointments || []).slice(0, 10));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spin h-12 w-12 mx-auto mb-4 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Doctors',
            value: stats.totalDoctors,
            icon: Users,
            color: 'bg-blue-100 text-blue-600',
            trend: `${stats.approvedDoctors} approved`
        },
        {
            title: 'Pending Approvals',
            value: stats.pendingDoctors,
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-600',
            link: '/admin/doctors'
        },
        {
            title: 'Total Patients',
            value: stats.totalPatients,
            icon: Activity,
            color: 'bg-green-100 text-green-600',
        },
        {
            title: 'Total Appointments',
            value: stats.totalAppointments,
            icon: Calendar,
            color: 'bg-purple-100 text-purple-600',
            trend: `${stats.completedAppointments} completed`
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
            color: 'bg-success-100 text-success-600',
        },
        {
            title: "Today's Appointments",
            value: stats.todayAppointments,
            icon: TrendingUp,
            color: 'bg-primary-100 text-primary-600',
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Monitor and manage your MediConnect platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const CardContent = (
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                {stat.trend && (
                                    <span className="text-xs text-gray-500">{stat.trend}</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    );

                    return stat.link ? (
                        <Link key={index} to={stat.link} className="card-hover">
                            {CardContent}
                        </Link>
                    ) : (
                        <div key={index}>{CardContent}</div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/admin/doctors/create" className="card p-6 card-hover text-center">
                        <Users className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900">Create Doctor</h3>
                        <p className="text-sm text-gray-600 mt-1">Add new doctor</p>
                    </Link>

                    <Link to="/admin/doctors" className="card p-6 card-hover text-center">
                        <UserCheck className="h-8 w-8 text-success-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900">Manage Doctors</h3>
                        <p className="text-sm text-gray-600 mt-1">Approve & manage</p>
                    </Link>

                    <Link to="/admin/appointments" className="card p-6 card-hover text-center">
                        <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900">All Appointments</h3>
                        <p className="text-sm text-gray-600 mt-1">View bookings</p>
                    </Link>

                    <div className="card p-6 text-center bg-gray-50">
                        <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-700">Revenue Report</h3>
                        <p className="text-sm text-gray-500 mt-1">Coming soon</p>
                    </div>
                </div>
            </div>

            {/* Recent Appointments */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Recent Appointments</h2>
                    <Link to="/admin/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View All →
                    </Link>
                </div>

                {recentAppointments.length === 0 ? (
                    <div className="card p-8 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No appointments yet</p>
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Patient
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Doctor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentAppointments.map((appointment) => (
                                        <tr key={appointment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {appointment.patient_name || appointment.patient_email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">Dr. {appointment.doctor_name}</div>
                                                <div className="text-sm text-gray-500">{appointment.doctor_specialization}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{appointment.appointment_date}</div>
                                                <div className="text-sm text-gray-500">{appointment.appointment_time}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`badge ${appointment.type === 'emergency' ? 'badge-danger' : 'badge-info'}`}>
                                                    {appointment.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`badge ${appointment.status === 'completed' ? 'badge-success' :
                                                        appointment.status === 'cancelled' ? 'badge-danger' :
                                                            appointment.status === 'in_progress' ? 'badge-info' :
                                                                'badge-warning'
                                                    }`}>
                                                    {appointment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Platform Health */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 bg-success-50 border-success-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-success-800 mb-1">Approved Doctors</p>
                            <p className="text-2xl font-bold text-success-900">{stats.approvedDoctors}</p>
                        </div>
                        <UserCheck className="h-10 w-10 text-success-600" />
                    </div>
                    <div className="mt-3">
                        <div className="w-full bg-success-200 rounded-full h-2">
                            <div
                                className="bg-success-600 h-2 rounded-full"
                                style={{ width: `${(stats.approvedDoctors / stats.totalDoctors * 100) || 0}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-success-700 mt-1">
                            {Math.round((stats.approvedDoctors / stats.totalDoctors * 100) || 0)}% of total doctors
                        </p>
                    </div>
                </div>

                <div className="card p-6 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-800 mb-1">Pending Approval</p>
                            <p className="text-2xl font-bold text-yellow-900">{stats.pendingDoctors}</p>
                        </div>
                        <UserX className="h-10 w-10 text-yellow-600" />
                    </div>
                    {stats.pendingDoctors > 0 && (
                        <div className="mt-3">
                            <Link to="/admin/doctors" className="text-sm text-yellow-700 hover:text-yellow-800 font-medium">
                                Review pending doctors →
                            </Link>
                        </div>
                    )}
                </div>

                <div className="card p-6 bg-primary-50 border-primary-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-primary-800 mb-1">Active Patients</p>
                            <p className="text-2xl font-bold text-primary-900">{stats.totalPatients}</p>
                        </div>
                        <Activity className="h-10 w-10 text-primary-600" />
                    </div>
                    <p className="text-xs text-primary-700 mt-3">
                        Total registered patients on platform
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
