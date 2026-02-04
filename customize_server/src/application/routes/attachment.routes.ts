import { Router } from 'express';
import { AttachmentController } from '../controllers/AttachmentController';
import { uploadImage } from '../middlewares/upload';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const attachmentController = new AttachmentController();

// Use any() to allow dynamic field names (e.g. 'icon', 'image') passed from client
router.post(
  '/',
  requireAuth,
  (req, res, next) => {
    uploadImage.any()(req, res, (err) => {
      if (err) {
        console.error('Multer Upload Error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.',
            error: 'LIMIT_FILE_SIZE',
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'Error uploading file',
          error: err.name || 'UploadError',
        });
      }
      next();
    });
  },
  attachmentController.upload
);

export default router;
