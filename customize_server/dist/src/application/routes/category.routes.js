"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CategoryController_1 = require("../controllers/CategoryController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
const categoryController = new CategoryController_1.CategoryController();
// All category routes require authentication
router.use(auth_1.requireAuth);
// Sort order update - specific route before generic /:id routes
router.post('/sort-order', auth_1.requireAuth, categoryController.updateSortOrder);
// Export categories - requires categories:read permission
router.get('/export', (0, authorize_1.requirePermission)('categories:read'), categoryController.exportCategories);
// Import categories - requires categories:create (and potentially update) permission
router.post('/import', (0, authorize_1.requirePermission)('categories:create'), upload_1.uploadImage.single('csv'), // Using single file upload with key 'csv'
categoryController.importCategories);
// Get all categories - requires categories:read permission
router.get('/', (0, authorize_1.requirePermission)('categories:read'), categoryController.getAll);
// Get single category - requires categories:read permission
router.get('/:id', (0, authorize_1.requirePermission)('categories:read'), categoryController.getById);
// Create category - requires categories:create permission
router.post('/', (0, authorize_1.requirePermission)('categories:create'), (req, res, next) => {
    console.log(`[Category Create] Starting upload`); // Adjusted log for POST /
    upload_1.uploadImage.fields([
        { name: 'image', maxCount: 1 },
        { name: 'icon', maxCount: 1 },
    ])(req, res, (err) => {
        if (err) {
            console.error('[Category Create] Multer Error:', err); // Adjusted log for POST /
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File too large (Max 5MB)' });
            }
            return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
        }
        console.log('[Category Create] Upload completed'); // Adjusted log for POST /
        next();
    });
}, categoryController.create);
// Update category - requires categories:update permission
router.put('/:id', (0, authorize_1.requirePermission)('categories:update'), (req, res, next) => {
    upload_1.uploadImage.fields([
        { name: 'image', maxCount: 1 },
        { name: 'icon', maxCount: 1 },
    ])(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 5MB.',
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file',
            });
        }
        next();
    });
}, categoryController.update);
// Delete category - requires categories:delete permission
router.delete('/:id', (0, authorize_1.requirePermission)('categories:delete'), categoryController.delete);
exports.default = router;
