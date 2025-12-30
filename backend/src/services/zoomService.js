import axios from 'axios';
import { zoomConfig } from '../config/zoom.js';

class ZoomService {
    // Generate JWT token for Zoom API (Server-to-Server OAuth)
    static async getAccessToken() {
        try {
            // For Server-to-Server OAuth (recommended by Zoom)
            const response = await axios.post(
                `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoomConfig.accountId}`,
                {},
                {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${zoomConfig.apiKey}:${zoomConfig.apiSecret}`).toString('base64')}`
                    }
                }
            );

            return response.data.access_token;
        } catch (error) {
            console.error('Zoom OAuth error:', error.response?.data || error.message);
            throw new Error('Failed to get Zoom access token');
        }
    }

    // Create scheduled meeting
    static async createScheduledMeeting(appointmentData) {
        try {
            const accessToken = await this.getAccessToken();

            const meetingData = {
                topic: `Medical Consultation - ${appointmentData.doctor_name}`,
                type: 2, // Scheduled meeting
                start_time: `${appointmentData.date}T${appointmentData.time}`,
                duration: appointmentData.duration || 30,
                timezone: 'Asia/Kolkata',
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: false,
                    mute_upon_entry: true,
                    waiting_room: false,
                    audio: 'both',
                    auto_recording: 'none'
                }
            };

            const response = await axios.post(
                'https://api.zoom.us/v2/users/me/meetings',
                meetingData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                meeting_id: response.data.id,
                join_url: response.data.join_url,
                start_url: response.data.start_url,
                password: response.data.password
            };
        } catch (error) {
            console.error('Zoom meeting creation error:', error.response?.data || error.message);
            throw new Error('Failed to create Zoom meeting');
        }
    }

    // Create instant meeting (for emergency appointments)
    static async createInstantMeeting(appointmentData) {
        try {
            const accessToken = await this.getAccessToken();

            const meetingData = {
                topic: `Emergency Consultation - ${appointmentData.doctor_name}`,
                type: 1, // Instant meeting
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: false,
                    mute_upon_entry: true,
                    waiting_room: false,
                    audio: 'both',
                    auto_recording: 'none'
                }
            };

            const response = await axios.post(
                'https://api.zoom.us/v2/users/me/meetings',
                meetingData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                meeting_id: response.data.id,
                join_url: response.data.join_url,
                start_url: response.data.start_url,
                password: response.data.password
            };
        } catch (error) {
            console.error('Zoom instant meeting creation error:', error.response?.data || error.message);
            throw new Error('Failed to create Zoom instant meeting');
        }
    }

    // Delete meeting
    static async deleteMeeting(meetingId) {
        try {
            const accessToken = await this.getAccessToken();

            await axios.delete(
                `https://api.zoom.us/v2/meetings/${meetingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            return true;
        } catch (error) {
            console.error('Zoom meeting deletion error:', error.response?.data || error.message);
            return false;
        }
    }
}

export default ZoomService;
