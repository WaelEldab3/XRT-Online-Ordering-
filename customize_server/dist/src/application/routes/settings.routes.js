"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SettingsController_1 = require("../controllers/SettingsController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const settingsController = new SettingsController_1.SettingsController();
// All settings routes require authentication
router.use(auth_1.requireAuth);
// Get settings - requires settings:read permission
router.get('/', (0, authorize_1.requirePermission)('settings:read'), settingsController.getSettings);
// Update settings - requires settings:update permission
router.patch('/', (0, authorize_1.requirePermission)('settings:update'), settingsController.updateSettings);
exports.default = router;
