"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ItemSizeController_1 = require("../controllers/ItemSizeController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const itemSizeController = new ItemSizeController_1.ItemSizeController();
router.use(auth_1.requireAuth);
// Get all sizes for an item
router.get('/:itemId/sizes', (0, authorize_1.requirePermission)('items:read'), itemSizeController.getAll);
// Get single item size
router.get('/:itemId/sizes/:id', (0, authorize_1.requirePermission)('items:read'), itemSizeController.getById);
// Create item size
router.post('/:itemId/sizes', (0, authorize_1.requirePermission)('items:create'), itemSizeController.create);
// Update item size
router.put('/:itemId/sizes/:id', (0, authorize_1.requirePermission)('items:update'), itemSizeController.update);
// Delete item size
router.delete('/:itemId/sizes/:id', (0, authorize_1.requirePermission)('items:delete'), itemSizeController.delete);
exports.default = router;
