import dotenv from 'dotenv';

dotenv.config();

export const zoomConfig = {
    apiKey: process.env.ZOOM_API_KEY,
    apiSecret: process.env.ZOOM_API_SECRET,
    accountId: process.env.ZOOM_ACCOUNT_ID
};

export default zoomConfig;
