"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AttachmentController_1 = require("../controllers/AttachmentController");
const upload_1 = require("../middlewares/upload");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const attachmentController = new AttachmentController_1.AttachmentController();
// Use any() to allow dynamic field names (e.g. 'icon', 'image') passed from client
router.post('/', auth_1.requireAuth, (req, res, next) => {
    upload_1.uploadImage.any()(req, res, (err) => {
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
}, attachmentController.upload);
exports.default = router;
