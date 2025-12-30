import s3, { S3_BUCKET } from '../config/s3.js';
import { v4 as uuidv4 } from 'uuid';

class S3Service {
    // Upload file to S3
    static async uploadFile(file, folder = 'uploads') {
        try {
            const fileKey = `${folder}/${uuidv4()}-${file.originalname}`;

            const params = {
                Bucket: S3_BUCKET,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'private'
            };

            const result = await s3.upload(params).promise();

            return {
                key: fileKey,
                url: result.Location,
                bucket: S3_BUCKET
            };
        } catch (error) {
            console.error('S3 upload error:', error);
            throw new Error('Failed to upload file to S3');
        }
    }

    // Upload buffer (for PDFs)
    static async uploadBuffer(buffer, fileName, contentType, folder = 'prescriptions') {
        try {
            const fileKey = `${folder}/${uuidv4()}-${fileName}`;

            const params = {
                Bucket: S3_BUCKET,
                Key: fileKey,
                Body: buffer,
                ContentType: contentType,
                ACL: 'private'
            };

            const result = await s3.upload(params).promise();

            return {
                key: fileKey,
                url: result.Location,
                bucket: S3_BUCKET
            };
        } catch (error) {
            console.error('S3 buffer upload error:', error);
            throw new Error('Failed to upload buffer to S3');
        }
    }

    // Generate signed URL (24 hour expiry)
    static async getSignedUrl(fileKey, expiresIn = 86400) {
        try {
            const params = {
                Bucket: S3_BUCKET,
                Key: fileKey,
                Expires: expiresIn
            };

            const url = await s3.getSignedUrlPromise('getObject', params);
            return url;
        } catch (error) {
            console.error('S3 signed URL error:', error);
            throw new Error('Failed to generate signed URL');
        }
    }

    // Delete file from S3
    static async deleteFile(fileKey) {
        try {
            const params = {
                Bucket: S3_BUCKET,
                Key: fileKey
            };

            await s3.deleteObject(params).promise();
            return true;
        } catch (error) {
            console.error('S3 deletion error:', error);
            return false;
        }
    }

    // Extract file key from URL
    static extractKeyFromUrl(url) {
        try {
            // Extract key from S3 URL
            const urlParts = url.split('.com/');
            return urlParts[1] || url;
        } catch (error) {
            return url;
        }
    }
}

export default S3Service;
