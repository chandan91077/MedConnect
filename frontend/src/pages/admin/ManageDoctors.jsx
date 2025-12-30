import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX, Clock, Search, Filter } from 'lucide-react';
import api from '../../services/api';

const ManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [filter, setFilter] = useState('all'); // all, approved, pending
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        filterDoctors();
    }, [filter, searchTerm, doctors]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/doctors');
            setDoctors(data.doctors || []);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterDoctors = () => {
        let result = doctors;

        // Filter by approval status
        if (filter === 'approved') {
            result = result.filter(d => d.is_approved);
        } else if (filter === 'pending') {
            result = result.filter(d => !d.is_approved);
        }

        // Filter by search term
        if (searchTerm) {
            result = result.filter(d =>
                d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDoctors(result);
    };

    const handleApprove = async (doctorId) => {
        if (!window.confirm('Are you sure you want to approve this doctor?')) {
            return;
        }

        try {
            await api.patch(`/admin/doctors/${doctorId}/approve`);
            fetchDoctors(); // Refresh list
        } catch (error) {
            console.error('Error approving doctor:', error);
            alert('Failed to approve doctor. Please try again.');
        }
    };

    const handleReject = async (doctorId) => {
        if (!window.confirm('Are you sure you want to reject/unapprove this doctor?')) {
            return;
        }

        try {
            await api.patch(`/admin/doctors/${doctorId}/reject`);
            fetchDoctors(); // Refresh list
        } catch (error) {
            console.error('Error rejecting doctor:', error);
            alert('Failed to reject doctor. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spin h-12 w-12 mx-auto mb-4 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-600">Loading doctors...</p>
                </div>
            </div>
        );
    }

    const pendingCount = doctors.filter(d => !d.is_approved).length;
    const approvedCount = doctors.filter(d => d.is_approved).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Doctors</h1>
                    <p className="text-gray-600">Approve and manage doctor accounts</p>
                </div>
                <Link to="/admin/doctors/create" className="btn-primary mt-4 md:mt-0">
                    + Create Doctor
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Doctors</p>
                            <p className="text-3xl font-bold text-gray-900">{doctors.length}</p>
                        </div>
                        <Users className="h-12 w-12 text-blue-600" />
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Approved</p>
                            <p className="text-3xl font-bold text-success-600">{approvedCount}</p>
                        </div>
                        <UserCheck className="h-12 w-12 text-success-600" />
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
                            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                        </div>
                        <Clock className="h-12 w-12 text-yellow-600" />
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="card p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by name, specialization, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>

                    {/* Filter */}
                    <div className="flex items-center space-x-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All ({doctors.length})
                        </button>
                        <button
                            onClick={() => setFilter('approved')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'approved'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Approved ({approvedCount})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Pending ({pendingCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Doctors List */}
            {filteredDoctors.length === 0 ? (
                <div className="card p-12 text-center">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm
                            ? 'Try adjusting your search criteria'
                            : 'Create your first doctor account to get started'}
                    </p>
                    {!searchTerm && (
                        <Link to="/admin/doctors/create" className="btn-primary">
                            Create Doctor
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredDoctors.map((doctor) => (
                        <div key={doctor.id} className="card p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex items-start space-x-4 flex-1">
                                    <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Users className="h-8 w-8 text-primary-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="font-semibold text-lg text-gray-900">
                                                Dr. {doctor.name}
                                            </h3>
                                            {doctor.is_approved ? (
                                                <span className="badge badge-success">Approved</span>
                                            ) : (
                                                <span className="badge badge-warning">Pending</span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Email:</span> {doctor.email}
                                            </div>
                                            <div>
                                                <span className="font-medium">Specialization:</span> {doctor.specialization}
                                            </div>
                                            <div>
                                                <span className="font-medium">Experience:</span> {doctor.experience} years
                                            </div>
                                            <div>
                                                <span className="font-medium">Phone:</span> {doctor.phone || 'N/A'}
                                            </div>
                                            <div>
                                                <span className="font-medium">Consultation Fee:</span> ₹{doctor.consultation_fee}
                                            </div>
                                            <div>
                                                <span className="font-medium">Emergency Fee:</span> ₹{doctor.emergency_fee}
                                            </div>
                                        </div>

                                        {doctor.qualification && (
                                            <div className="mt-3 text-sm">
                                                <span className="font-medium text-gray-700">Qualifications:</span>
                                                <p className="text-gray-600">{doctor.qualification}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-2 lg:ml-4">
                                    {!doctor.is_approved ? (
                                        <button
                                            onClick={() => handleApprove(doctor.id)}
                                            className="btn-success whitespace-nowrap"
                                        >
                                            <UserCheck className="h-4 w-4 inline mr-2" />
                                            Approve
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleReject(doctor.id)}
                                            className="btn-danger whitespace-nowrap"
                                        >
                                            <UserX className="h-4 w-4 inline mr-2" />
                                            Unapprove
                                        </button>
                                    )}

                                    <button className="btn-secondary whitespace-nowrap">
                                        Set Availability
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageDoctors;
