import cron from 'node-cron';
import Appointment from '../models/Appointment.js';

// Cron job to unlock chat and video for appointments on appointment day
// Runs every day at 00:00 (midnight)
const unlockAppointmentsJob = cron.schedule('0 0 * * *', async () => {
    try {
        console.log('⏰ Running unlock appointments cron job...');

        const unlockedCount = await Appointment.unlockForToday();

        console.log(`✅ Unlocked ${unlockedCount} appointments for today`);
    } catch (error) {
        console.error('❌ Unlock appointments cron job error:', error);
    }
}, {
    scheduled: false, // Don't start immediately
    timezone: 'Asia/Kolkata'
});

// Start the cron job
export const startCronJobs = () => {
    unlockAppointmentsJob.start();
    console.log('📅 Cron jobs started');
};

// Stop the cron job (for graceful shutdown)
export const stopCronJobs = () => {
    unlockAppointmentsJob.stop();
    console.log('📅 Cron jobs stopped');
};

export default unlockAppointmentsJob;
