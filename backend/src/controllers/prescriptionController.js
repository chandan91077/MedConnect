import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';
import Doctor from '../models/Doctor.js';
import PDFService from '../services/pdfService.js';

class PrescriptionController {
    // Create prescription
    static async createPrescription(req, res) {
        try {
            const { appointment_id, diagnosis, medications, instructions } = req.body;

            if (!appointment_id || !diagnosis || !medications) {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment ID, diagnosis, and medications are required'
                });
            }

            // Get appointment details
            const appointment = await Appointment.findById(appointment_id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Get doctor details
            const doctor = await Doctor.findByUserId(req.user.id);

            // Create prescription record
            const prescriptionId = await Prescription.create({
                appointment_id,
                doctor_id: appointment.doctor_id,
                patient_id: appointment.patient_id,
                diagnosis,
                medications,
                instructions
            });

            // Generate PDF
            try {
                const pdfData = await PDFService.generatePrescriptionPDF({
                    prescriptionId,
                    doctorName: appointment.doctor_name,
                    specialization: appointment.doctor_specialization,
                    patientName: appointment.patient_name,
                    patientId: appointment.patient_id,
                    diagnosis,
                    medications,
                    instructions,
                    createdAt: new Date()
                });

                // Update prescription with PDF URL
                await Prescription.updatePdfUrl(prescriptionId, pdfData.signedUrl);

                // Share prescription in chat
                await Message.create({
                    appointment_id,
                    sender_id: req.user.id,
                    message_text: 'Prescription shared',
                    file_url: pdfData.signedUrl,
                    file_type: 'prescription'
                });

            } catch (pdfError) {
                console.error('PDF generation error:', pdfError);
                // Continue even if PDF fails
            }

            const prescription = await Prescription.findById(prescriptionId);

            res.status(201).json({
                success: true,
                message: 'Prescription created successfully',
                prescription
            });
        } catch (error) {
            console.error('Create prescription error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create prescription',
                error: error.message
            });
        }
    }

    // Get prescriptions by patient
    static async getPatientPrescriptions(req, res) {
        try {
            const prescriptions = await Prescription.findByPatient(req.user.id);

            res.json({
                success: true,
                prescriptions
            });
        } catch (error) {
            console.error('Get patient prescriptions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch prescriptions',
                error: error.message
            });
        }
    }

    // Get prescription by ID
    static async getPrescription(req, res) {
        try {
            const { id } = req.params;

            const prescription = await Prescription.findById(id);

            if (!prescription) {
                return res.status(404).json({
                    success: false,
                    message: 'Prescription not found'
                });
            }

            // Authorization check
            if (
                req.user.role === 'patient' && prescription.patient_id !== req.user.id
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.json({
                success: true,
                prescription
            });
        } catch (error) {
            console.error('Get prescription error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch prescription',
                error: error.message
            });
        }
    }

    // Get prescriptions by appointment
    static async getAppointmentPrescriptions(req, res) {
        try {
            const { appointment_id } = req.params;

            const prescriptions = await Prescription.findByAppointment(appointment_id);

            res.json({
                success: true,
                prescriptions
            });
        } catch (error) {
            console.error('Get appointment prescriptions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch prescriptions',
                error: error.message
            });
        }
    }
}

export default PrescriptionController;
