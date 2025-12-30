import PDFDocument from 'pdfkit';
import S3Service from './s3Service.js';

class PDFService {
    // Generate prescription PDF
    static async generatePrescriptionPDF(prescriptionData) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks = [];

                // Collect PDF data
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', async () => {
                    try {
                        const pdfBuffer = Buffer.concat(chunks);

                        // Upload to S3
                        const fileName = `prescription-${prescriptionData.prescriptionId}-${Date.now()}.pdf`;
                        const uploadResult = await S3Service.uploadBuffer(
                            pdfBuffer,
                            fileName,
                            'application/pdf',
                            'prescriptions'
                        );

                        // Generate signed URL
                        const signedUrl = await S3Service.getSignedUrl(uploadResult.key);

                        resolve({
                            key: uploadResult.key,
                            url: uploadResult.url,
                            signedUrl: signedUrl
                        });
                    } catch (error) {
                        reject(error);
                    }
                });

                // Header
                doc.fontSize(24).font('Helvetica-Bold').text('MediConnect', { align: 'center' });
                doc.fontSize(12).font('Helvetica').text('Digital Prescription', { align: 'center' });
                doc.moveDown();

                // Doctor Information
                doc.fontSize(10).font('Helvetica-Bold').text('Doctor Information:');
                doc.font('Helvetica')
                    .text(`Name: Dr. ${prescriptionData.doctorName}`)
                    .text(`Specialization: ${prescriptionData.specialization}`)
                    .text(`Date: ${new Date(prescriptionData.createdAt).toLocaleDateString()}`)
                    .moveDown();

                // Patient Information
                doc.font('Helvetica-Bold').text('Patient Information:');
                doc.font('Helvetica')
                    .text(`Name: ${prescriptionData.patientName}`)
                    .text(`Patient ID: ${prescriptionData.patientId}`)
                    .moveDown();

                // Diagnosis
                doc.font('Helvetica-Bold').text('Diagnosis:');
                doc.font('Helvetica').text(prescriptionData.diagnosis || 'N/A').moveDown();

                // Medications
                doc.font('Helvetica-Bold').fontSize(12).text('Prescribed Medications:');
                doc.moveDown(0.5);

                if (prescriptionData.medications && prescriptionData.medications.length > 0) {
                    prescriptionData.medications.forEach((med, index) => {
                        doc.font('Helvetica').fontSize(10)
                            .text(`${index + 1}. ${med.name}`)
                            .text(`   Dosage: ${med.dosage}`)
                            .text(`   Frequency: ${med.frequency}`)
                            .text(`   Duration: ${med.duration}`)
                            .moveDown(0.5);
                    });
                } else {
                    doc.text('No medications prescribed').moveDown();
                }

                // Instructions
                if (prescriptionData.instructions) {
                    doc.font('Helvetica-Bold').fontSize(12).text('Additional Instructions:');
                    doc.font('Helvetica').fontSize(10).text(prescriptionData.instructions).moveDown();
                }

                // Footer
                doc.moveDown(2);
                doc.fontSize(8).text('This is a computer-generated prescription from MediConnect.', {
                    align: 'center'
                });
                doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

                // Finalize PDF
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Generate appointment receipt PDF
    static async generateReceiptPDF(receiptData) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks = [];

                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', async () => {
                    try {
                        const pdfBuffer = Buffer.concat(chunks);

                        const fileName = `receipt-${receiptData.appointmentId}-${Date.now()}.pdf`;
                        const uploadResult = await S3Service.uploadBuffer(
                            pdfBuffer,
                            fileName,
                            'application/pdf',
                            'receipts'
                        );

                        const signedUrl = await S3Service.getSignedUrl(uploadResult.key);

                        resolve({
                            key: uploadResult.key,
                            url: uploadResult.url,
                            signedUrl: signedUrl
                        });
                    } catch (error) {
                        reject(error);
                    }
                });

                // Header
                doc.fontSize(24).font('Helvetica-Bold').text('MediConnect', { align: 'center' });
                doc.fontSize(14).text('Payment Receipt', { align: 'center' });
                doc.moveDown(2);

                // Receipt details
                doc.fontSize(10).font('Helvetica-Bold').text('Receipt Information:');
                doc.font('Helvetica')
                    .text(`Receipt ID: ${receiptData.transactionId}`)
                    .text(`Date: ${new Date(receiptData.createdAt).toLocaleDateString()}`)
                    .moveDown();

                doc.font('Helvetica-Bold').text('Patient Information:');
                doc.font('Helvetica').text(`Name: ${receiptData.patientName}`).moveDown();

                doc.font('Helvetica-Bold').text('Doctor Information:');
                doc.font('Helvetica')
                    .text(`Name: Dr. ${receiptData.doctorName}`)
                    .text(`Specialization: ${receiptData.specialization}`)
                    .moveDown();

                doc.font('Helvetica-Bold').text('Appointment Details:');
                doc.font('Helvetica')
                    .text(`Date: ${receiptData.appointmentDate}`)
                    .text(`Time: ${receiptData.appointmentTime}`)
                    .text(`Type: ${receiptData.appointmentType}`)
                    .moveDown();

                doc.font('Helvetica-Bold').fontSize(12).text('Payment Summary:');
                doc.font('Helvetica').fontSize(10)
                    .text(`Consultation Fee: ₹${receiptData.amount}`)
                    .text(`Payment Method: ${receiptData.paymentMethod}`)
                    .text(`Status: ${receiptData.status}`)
                    .moveDown(2);

                doc.fontSize(8).text('Thank you for using MediConnect!', { align: 'center' });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default PDFService;
