import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Clock, User } from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../lib/utils';

const Prescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const data = await api.get('/prescriptions/my');
            setPrescriptions(data.prescriptions || []);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (prescriptionId, pdfUrl) => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        } else {
            alert('PDF not available yet. Please try again later.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spin h-12 w-12 mx-auto mb-4 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-600">Loading prescriptions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Prescriptions</h1>
                <p className="text-gray-600">View and download your digital prescriptions</p>
            </div>

            {/* Prescriptions List */}
            {prescriptions.length === 0 ? (
                <div className="card p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No prescriptions yet</h3>
                    <p className="text-gray-600">
                        Your prescriptions will appear here after your consultations
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {prescriptions.map((prescription) => (
                        <div key={prescription.id} className="card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-4">
                                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            Prescription #{prescription.id}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            <User className="h-4 w-4 inline mr-1" />
                                            Dr. {prescription.doctor_name}
                                        </p>
                                    </div>
                                </div>

                                <span className="badge badge-success">Digital</span>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>Prescribed on {formatDate(prescription.created_at)}</span>
                                </div>

                                {prescription.appointment_date && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>Appointment: {formatDate(prescription.appointment_date)}</span>
                                    </div>
                                )}
                            </div>

                            {prescription.medications && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Medications</h4>
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {prescription.medications}
                                    </div>
                                </div>
                            )}

                            {prescription.instructions && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <h4 className="font-semibold text-blue-900 text-sm mb-2">Instructions</h4>
                                    <p className="text-sm text-blue-800">{prescription.instructions}</p>
                                </div>
                            )}

                            {prescription.diagnosis && (
                                <div className="text-sm mb-4">
                                    <span className="font-semibold text-gray-700">Diagnosis:</span>
                                    <p className="text-gray-600 mt-1">{prescription.diagnosis}</p>
                                </div>
                            )}

                            <button
                                onClick={() => handleDownload(prescription.id, prescription.pdf_url)}
                                className="w-full btn-primary"
                                disabled={!prescription.pdf_url}
                            >
                                <Download className="h-4 w-4 mr-2 inline" />
                                {prescription.pdf_url ? 'Download PDF' : 'PDF Generating...'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Note */}
            <div className="mt-8 card p-6 bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">📋 About Prescriptions</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                    <li>• All prescriptions are digitally signed by your doctor</li>
                    <li>• You can download PDFs anytime for your records</li>
                    <li>• Prescriptions are automatically shared in your appointment chat</li>
                    <li>• Keep your prescriptions safe for future reference</li>
                </ul>
            </div>
        </div>
    );
};

export default Prescriptions;
