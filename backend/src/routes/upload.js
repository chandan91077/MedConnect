import multer from 'multer';
import express from 'express';
import S3Service from '../services/s3Service.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and PDFs
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
        }
    }
});

// Upload endpoint
router.post('/', authenticate, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const folder = req.body.folder || 'uploads';

        const result = await S3Service.uploadFile(req.file, folder);

        // Generate signed URL
        const signedUrl = await S3Service.getSignedUrl(result.key);

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                key: result.key,
                url: signedUrl
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: error.message
        });
    }
});

export default router;
