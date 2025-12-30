import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = await login({ email, password });

            if (data.user.role !== 'admin') {
                setError('Access denied. Admin credentials required.');
                return;
            }

            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4">
            <div className="max-w-md w-full">
                <div className="card p-8 border-t-4 border-t-primary-600 fade-in">
                    <div className="text-center">
                        <Shield className="mx-auto h-12 w-12 text-primary-600" />
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Admin Portal
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Secure access for administrators only
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded-lg flex items-center">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Admin Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input pl-10"
                                        placeholder="admin@mediconnect.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input pl-10"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 text-base font-semibold"
                        >
                            {loading ? 'Signing in...' : 'Sign In to Admin Portal'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        <p>Default credentials: admin@mediconnect.com / Password@1</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
