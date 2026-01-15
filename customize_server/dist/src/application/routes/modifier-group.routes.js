"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ModifierGroupController_1 = require("../controllers/ModifierGroupController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const modifierGroupController = new ModifierGroupController_1.ModifierGroupController();
// All modifier group routes require authentication
router.use(auth_1.requireAuth);
// Get all modifier groups - requires modifier_groups:read permission
router.get('/', (0, authorize_1.requirePermission)('modifier_groups:read'), modifierGroupController.getAll);
// Get single modifier group - requires modifier_groups:read permission
router.get('/:id', (0, authorize_1.requirePermission)('modifier_groups:read'), modifierGroupController.getById);
// Create modifier group - requires modifier_groups:create permission
router.post('/', (0, authorize_1.requirePermission)('modifier_groups:create'), modifierGroupController.create);
// Update modifier group - requires modifier_groups:update permission
router.put('/:id', (0, authorize_1.requirePermission)('modifier_groups:update'), modifierGroupController.update);
// Delete modifier group - requires modifier_groups:delete permission
router.delete('/:id', (0, authorize_1.requirePermission)('modifier_groups:delete'), modifierGroupController.delete);
exports.default = router;
