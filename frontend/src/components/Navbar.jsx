import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Bell, User, LogOut, Menu, X } from 'lucide-react';
import { notificationAPI } from '../services/api';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user?.role === 'patient') return '/patient/dashboard';
    if (user?.role === 'doctor') return '/doctor/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <nav data-testid="navbar" className="glass-effect sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              MedConnect
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/doctors"
                  data-testid="browse-doctors-link"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Browse Doctors
                </Link>
                <Link
                  to={getDashboardPath()}
                  data-testid="dashboard-link"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      data-testid="notifications-button"
                      className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Bell className="w-6 h-6 text-gray-700" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-2">
                      <h3 className="font-semibold mb-2">Notifications</h3>
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500">No notifications</p>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {notifications.slice(0, 5).map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3 rounded-lg text-sm ${
                                notif.is_read ? 'bg-gray-50' : 'bg-blue-50'
                              }`}
                            >
                              <p className="font-medium">{notif.title}</p>
                              <p className="text-gray-600">{notif.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      data-testid="user-menu-button"
                      className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user?.full_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1 capitalize">
                        {user?.role}
                      </p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} data-testid="logout-button">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/doctors" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Find Doctors
                </Link>
                <Link
                  to="/login"
                  data-testid="login-link"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link to="/register" data-testid="register-link">
                  <Button className="btn-primary">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            data-testid="mobile-menu-button"
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4">
          <div className="px-4 space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/doctors"
                  className="block text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Doctors
                </Link>
                <Link
                  to={getDashboardPath()}
                  className="block text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/doctors"
                  className="block text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Doctors
                </Link>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="btn-primary w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;