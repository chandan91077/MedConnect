import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Stethoscope, Award, DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const CreateDoctor = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        qualification: '',
        experience: '',
        bio: '',
        consultation_fee: '',
        emergency_fee: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (parseInt(formData.experience) < 0) {
            setError('Experience cannot be negative');
            return;
        }

        if (parseInt(formData.emergency_fee) <= parseInt(formData.consultation_fee)) {
            setError('Emergency fee must be higher than consultation fee');
            return;
        }

        try {
            setLoading(true);

            await api.post('/admin/doctors', {
                ...formData,
                experience: parseInt(formData.experience),
                consultation_fee: parseInt(formData.consultation_fee),
                emergency_fee: parseInt(formData.emergency_fee)
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/doctors');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Failed to create doctor account');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16">
                <div className="card p-8 text-center">
                    <CheckCircle className="h-16 w-16 text-success-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Account Created!</h2>
                    <p className="text-gray-600">Redirecting to manage doctors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Doctor Account</h1>
                <p className="text-gray-600">Add a new doctor to the MediConnect platform</p>
            </div>

            <form onSubmit={handleSubmit} className="card p-8">
                {error && (
                    <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded-lg flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Personal Information */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="input"
                                placeholder="Dr. John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="input"
                                placeholder="doctor@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password *
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                placeholder="Minimum 6 characters"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="input"
                                placeholder="+91 1234567890"
                            />
                        </div>
                    </div>
                </div>

                {/* Professional Information */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Stethoscope className="h-5 w-5 mr-2" />
                        Professional Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Specialization *
                            </label>
                            <input
                                type="text"
                                name="specialization"
                                required
                                value={formData.specialization}
                                onChange={handleChange}
                                className="input"
                                placeholder="Cardiologist, Dermatologist, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Experience (years) *
                            </label>
                            <input
                                type="number"
                                name="experience"
                                required
                                min="0"
                                value={formData.experience}
                                onChange={handleChange}
                                className="input"
                                placeholder="10"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Qualification *
                            </label>
                            <input
                                type="text"
                                name="qualification"
                                required
                                value={formData.qualification}
                                onChange={handleChange}
                                className="input"
                                placeholder="MBBS, MD, Specialized certifications"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bio / About
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="input"
                                rows="3"
                                placeholder="Brief description about the doctor..."
                            />
                        </div>
                    </div>
                </div>

                {/* Consultation Fees */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Consultation Fees
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Scheduled Consultation Fee (₹) *
                            </label>
                            <input
                                type="number"
                                name="consultation_fee"
                                required
                                min="0"
                                value={formData.consultation_fee}
                                onChange={handleChange}
                                className="input"
                                placeholder="500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Fee for scheduled appointments
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Emergency Consultation Fee (₹) *
                            </label>
                            <input
                                type="number"
                                name="emergency_fee"
                                required
                                min="0"
                                value={formData.emergency_fee}
                                onChange={handleChange}
                                className="input"
                                placeholder="1000"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Must be higher than scheduled fee
                            </p>
                        </div>
                    </div>
                </div>

                {/* Information Note */}
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 text-sm mb-2">
                        <FileText className="h-4 w-4 inline mr-1" />
                        Important Notes
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Doctor account will be created with "pending" approval status</li>
                        <li>• You can approve the doctor from the "Manage Doctors" page</li>
                        <li>• Doctor credentials will be sent to their email (feature coming soon)</li>
                        <li>• Doctor can login after approval</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/doctors')}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <span className="spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                                Creating...
                            </span>
                        ) : (
                            <>
                                <User className="h-4 w-4 inline mr-2" />
                                Create Doctor Account
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateDoctor;
