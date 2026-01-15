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
// Get all categories - requires categories:read permission
router.get('/', (0, authorize_1.requirePermission)('categories:read'), categoryController.getAll);
// Get single category - requires categories:read permission
router.get('/:id', (0, authorize_1.requirePermission)('categories:read'), categoryController.getById);
// Create category - requires categories:create permission
router.post('/', (0, authorize_1.requirePermission)('categories:create'), upload_1.uploadImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
]), categoryController.create);
// Update category - requires categories:update permission
router.put('/:id', (0, authorize_1.requirePermission)('categories:update'), upload_1.uploadImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
]), categoryController.update);
// Delete category - requires categories:delete permission
router.delete('/:id', (0, authorize_1.requirePermission)('categories:delete'), categoryController.delete);
exports.default = router;
