import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stethoscope, Award, Calendar, Clock, Phone, Star, MapPin, Video, MessageSquare, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../lib/utils';

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDoctorProfile();
    }, [id]);

    const fetchDoctorProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.get(`/patients/doctors/${id}`);
            setDoctor(data.doctor);
            setAvailability(data.doctor.availability || []);
        } catch (err) {
            setError(err.message || 'Failed to load doctor profile');
        } finally {
            setLoading(false);
        }
    };

    const handleBookScheduled = () => {
        navigate(`/patient/book/${id}`);
    };

    const handleBookEmergency = async () => {
        if (!window.confirm('Emergency consultation fee is higher. Do you want to proceed?')) {
            return;
        }

        try {
            const symptoms = prompt('Please describe your symptoms:');
            if (!symptoms) return;

            const data = await api.post('/appointments/emergency', {
                doctor_id: parseInt(id),
                symptoms
            });

            alert('Emergency appointment booked successfully! You can now chat and join the video call.');
            navigate('/patient/appointments');
        } catch (error) {
            alert(error.message || 'Failed to book emergency appointment');
        }
    };

    const getDayName = (day) => {
        const days = {
            1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
            4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday'
        };
        return days[day] || day;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spin h-12 w-12 mx-auto mb-4 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-600">Loading doctor profile...</p>
                </div>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="card p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-danger-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
                    <p className="text-gray-600 mb-4">{error || 'Doctor not found'}</p>
                    <button onClick={() => navigate('/patient/doctors')} className="btn-primary">
                        Back to Doctors
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Doctor Header Card */}
            <div className="card p-8 mb-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                        <div className="h-32 w-32 bg-primary-100 rounded-full flex items-center justify-center">
                            {doctor.profile_image ? (
                                <img
                                    src={doctor.profile_image}
                                    alt={doctor.name}
                                    className="h-32 w-32 rounded-full object-cover"
                                />
                            ) : (
                                <Stethoscope className="h-16 w-16 text-primary-600" />
                            )}
                        </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Dr. {doctor.name}
                                </h1>
                                <p className="text-xl text-gray-600 mb-3">{doctor.specialization}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <Award className="h-4 w-4 mr-1" />
                                        {doctor.experience} years experience
                                    </span>
                                    {doctor.phone && (
                                        <span className="flex items-center">
                                            <Phone className="h-4 w-4 mr-1" />
                                            Emergency Contact Available
                                        </span>
                                    )}
                                </div>
                            </div>

                            <span className="badge badge-success">Approved</span>
                        </div>

                        {doctor.qualification && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-900 mb-1">Qualifications</h3>
                                <p className="text-gray-700">{doctor.qualification}</p>
                            </div>
                        )}

                        {doctor.bio && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">About</h3>
                                <p className="text-gray-700">{doctor.bio}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Consultation Fees */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Consultation Fees</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <Calendar className="h-5 w-5 text-primary-600 mr-2" />
                                    <h3 className="font-semibold text-gray-900">Scheduled Consultation</h3>
                                </div>
                                <p className="text-3xl font-bold text-primary-600 mb-2">
                                    {formatCurrency(doctor.consultation_fee)}
                                </p>
                                <p className="text-sm text-gray-600 mb-3">
                                    Book an appointment for a future date
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                                    <li>✓ Choose your preferred time</li>
                                    <li>✓ Video consultation</li>
                                    <li>✓ Chat with doctor</li>
                                    <li>✓ Digital prescription</li>
                                </ul>
                                <button
                                    onClick={handleBookScheduled}
                                    className="w-full btn-primary"
                                >
                                    Book Scheduled Appointment
                                </button>
                            </div>

                            <div className="border border-danger-200 rounded-lg p-4 bg-danger-50">
                                <div className="flex items-center mb-2">
                                    <AlertCircle className="h-5 w-5 text-danger-600 mr-2" />
                                    <h3 className="font-semibold text-gray-900">Emergency Consultation</h3>
                                </div>
                                <p className="text-3xl font-bold text-danger-600 mb-2">
                                    {formatCurrency(doctor.emergency_fee)}
                                </p>
                                <p className="text-sm text-gray-600 mb-3">
                                    Immediate consultation for urgent cases
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                                    <li>✓ Instant video call access</li>
                                    <li>✓ Immediate chat unlocked</li>
                                    <li>✓ Doctor's phone number</li>
                                    <li>✓ Priority treatment</li>
                                </ul>
                                <button
                                    onClick={handleBookEmergency}
                                    className="w-full btn-danger"
                                >
                                    Book Emergency Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Availability Schedule */}
                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Schedule</h2>
                        {availability.length === 0 ? (
                            <p className="text-gray-600">Schedule not available. Please book an emergency consultation or check back later.</p>
                        ) : (
                            <div className="space-y-3">
                                {availability.map((slot, index) => (
                                    <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-3">
                                        <div className="flex items-center">
                                            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                                            <span className="font-medium text-gray-900">
                                                {getDayName(slot.day_of_week)}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="h-4 w-4 mr-2" />
                                            <span>
                                                {slot.start_time} - {slot.end_time}
                                            </span>
                                            <span className="ml-3 text-sm text-gray-500">
                                                ({slot.slot_duration} min slots)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Services Offered */}
                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start">
                                <Video className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Video Consultation</h3>
                                    <p className="text-sm text-gray-600">Secure Zoom video calls</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <MessageSquare className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Chat Support</h3>
                                    <p className="text-sm text-gray-600">Real-time messaging</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Award className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Digital Prescription</h3>
                                    <p className="text-sm text-gray-600">Download anytime</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Phone className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Emergency Support</h3>
                                    <p className="text-sm text-gray-600">Direct phone contact</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Info */}
                    <div className="card p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Quick Info</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-600 mb-1">Specialization</p>
                                <p className="font-semibold text-gray-900">{doctor.specialization}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Experience</p>
                                <p className="font-semibold text-gray-900">{doctor.experience} years</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Consultation Fee</p>
                                <p className="font-semibold text-gray-900">{formatCurrency(doctor.consultation_fee)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Emergency Fee</p>
                                <p className="font-semibold text-danger-600">{formatCurrency(doctor.emergency_fee)}</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Card */}
                    <div className="card p-6 bg-primary-50 border-primary-200">
                        <h3 className="font-bold text-gray-900 mb-2">Need immediate help?</h3>
                        <p className="text-sm text-gray-700 mb-4">
                            Book an emergency consultation for instant access to Dr. {doctor.name}
                        </p>
                        <button
                            onClick={handleBookEmergency}
                            className="w-full btn-danger"
                        >
                            Book Emergency
                        </button>
                    </div>

                    {/* Safety Info */}
                    <div className="card p-6 bg-blue-50 border-blue-200">
                        <h3 className="font-bold text-gray-900 mb-2">🔒 Safe & Secure</h3>
                        <p className="text-sm text-gray-700">
                            All consultations are private and HIPAA compliant. Your medical data is protected.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
