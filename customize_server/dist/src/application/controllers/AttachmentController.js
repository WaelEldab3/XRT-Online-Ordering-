"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentController = void 0;
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const response_1 = require("../../shared/utils/response");
class AttachmentController {
    constructor() {
        this.upload = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // Ensure files is always an array (multer.any() may vary by version)
            const rawFiles = req.files;
            const files = Array.isArray(rawFiles) ? rawFiles : rawFiles ? [rawFiles] : [];
            if (files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded (req.files is empty)',
                });
            }
            const attachments = files.map((file) => {
                // Prioritize Cloudinary secure_url, fall back to path or url
                const url = file.secure_url || file.path || file.url;
                return {
                    id: file.filename || file.public_id || file.originalname, // use public_id for Cloudinary
                    thumbnail: url,
                    original: url,
                    file_name: file.originalname, // Standardize return of original filename
                };
            });
            return (0, response_1.sendSuccess)(res, 'Files uploaded successfully', attachments);
        });
    }
}
exports.AttachmentController = AttachmentController;
