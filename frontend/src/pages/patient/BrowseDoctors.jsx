// Browse Doctors Page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Stethoscope } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../lib/utils';

const BrowseDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const data = await api.get('/patients/doctors');
            setDoctors(data.doctors || []);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center">Loading doctors...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Doctors</h1>
                <p className="text-gray-600">Find and book appointments with qualified healthcare professionals</p>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by name or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10 w-full md:w-96"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                    <div key={doctor.id} className="card p-6 card-hover">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                                    <Stethoscope className="h-8 w-8 text-primary-600" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900">Dr. {doctor.name}</h3>
                                <p className="text-sm text-gray-600">{doctor.specialization}</p>
                                <p className="text-xs text-gray-500 mt-1">{doctor.experience} years experience</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-gray-700 line-clamp-2">{doctor.bio}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Consultation</p>
                                <p className="text-lg font-semibold text-gray-900">{formatCurrency(doctor.consultation_fee)}</p>
                            </div>
                            <Link
                                to={`/patient/doctors/${doctor.id}`}
                                className="btn-primary"
                            >
                                View Profile
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {filteredDoctors.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No doctors found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default BrowseDoctors;
