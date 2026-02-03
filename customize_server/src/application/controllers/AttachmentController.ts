import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';

export class AttachmentController {
  upload = asyncHandler(async (req: Request, res: Response) => {
    // Ensure files is always an array (multer.any() may vary by version)
    const rawFiles = req.files as Express.Multer.File[] | Express.Multer.File | undefined;
    const files = Array.isArray(rawFiles) ? rawFiles : rawFiles ? [rawFiles] : [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded (req.files is empty)',
      });
    }

    const attachments = files.map((file: any) => ({
      id: file.filename || file.public_id || file.originalname,
      thumbnail: file.path || file.secure_url || file.url,
      original: file.path || file.secure_url || file.url,
    }));

    return sendSuccess(res, 'Files uploaded successfully', attachments);
  });
}
