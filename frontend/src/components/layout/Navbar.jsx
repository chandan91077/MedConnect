import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogOut, User, Calendar, FileText, Home } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <Activity className="h-8 w-8 text-primary-600" />
                            <span className="text-2xl font-bold text-gray-900">MediConnect</span>
                        </Link>

                        {isAuthenticated && user?.role === 'patient' && (
                            <div className="hidden md:ml-10 md:flex md:space-x-8">
                                <Link
                                    to="/patient/dashboard"
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/patient/dashboard')
                                            ? 'text-primary-600 border-b-2 border-primary-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Home className="h-4 w-4 mr-1" />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/patient/doctors"
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/patient/doctors')
                                            ? 'text-primary-600 border-b-2 border-primary-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Browse Doctors
                                </Link>
                                <Link
                                    to="/patient/appointments"
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/patient/appointments')
                                            ? 'text-primary-600 border-b-2 border-primary-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Appointments
                                </Link>
                                <Link
                                    to="/patient/prescriptions"
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/patient/prescriptions')
                                            ? 'text-primary-600 border-b-2 border-primary-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <FileText className="h-4 w-4 mr-1" />
                                    Prescriptions
                                </Link>
                            </div>
                        )}

                        {isAuthenticated && user?.role === 'admin' && (
                            <div className="hidden md:ml-10 md:flex md:space-x-8">
                                <Link
                                    to="/admin/dashboard"
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/admin/dashboard')
                                            ? 'text-primary-600 border-b-2 border-primary-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/admin/doctors"
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/admin/doctors')
                                            ? 'text-primary-600 border-b-2 border-primary-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Manage Doctors
                                </Link>
                                <Link
                                    to="/admin/appointments"
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive('/admin/appointments')
                                            ? 'text-primary-600 border-b-2 border-primary-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Appointments
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center space-x-2">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {user?.email}
                                    </span>
                                    <span className="badge badge-info">{user?.role}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-danger-600 hover:bg-danger-700"
                                >
                                    <LogOut className="h-4 w-4 mr-1" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="btn-secondary">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
