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
        console.error('Multer Middleware Error:', err);
        // Return 400 with the specific error message from Multer/Storage
        return res.status(400).json({
          success: false,
          message: `Upload Error: ${err.message}`,
          error: err,
        });
      }
      next();
    });
  },
  attachmentController.upload
);

export default router;
