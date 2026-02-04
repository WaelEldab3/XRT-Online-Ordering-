"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PermissionController_1 = require("../controllers/PermissionController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const permissionController = new PermissionController_1.PermissionController();
// All permission routes require authentication
router.use(auth_1.requireAuth);
// Get all permissions - requires permissions:read
router.get('/', (0, authorize_1.requirePermission)('permissions:read'), permissionController.getAllPermissions);
// Get permissions grouped by module - requires permissions:read
router.get('/grouped', (0, authorize_1.requirePermission)('permissions:read'), permissionController.getGroupedPermissions);
// Get all modules - requires permissions:read
router.get('/modules', (0, authorize_1.requirePermission)('permissions:read'), permissionController.getModules);
// Get single permission - requires permissions:read
router.get('/:id', (0, authorize_1.requirePermission)('permissions:read'), permissionController.getPermission);
// Update permission (enable/disable) - requires permissions:update
router.patch('/:id', (0, authorize_1.requirePermission)('permissions:update'), permissionController.updatePermission);
exports.default = router;
