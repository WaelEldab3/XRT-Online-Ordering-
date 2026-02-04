"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ItemSizeController_1 = require("../controllers/ItemSizeController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const itemSizeController = new ItemSizeController_1.ItemSizeController();
router.use(auth_1.requireAuth);
// Sort order update - specific route before generic /:id routes
router.post('/sort-order', auth_1.requireAuth, itemSizeController.updateSortOrder);
// Export sizes - requires items:read permission
router.get('/export', (0, authorize_1.requirePermission)('items:read'), itemSizeController.exportSizes);
// Get all sizes (Global per business)
router.get('/', // Was /:itemId/sizes - now mounted at /api/sizes likely, or need to check mount point
(0, authorize_1.requirePermission)('items:read'), itemSizeController.getAll);
// Get single item size
router.get('/:id', (0, authorize_1.requirePermission)('items:read'), itemSizeController.getById);
// Create item size
router.post('/', (0, authorize_1.requirePermission)('items:create'), itemSizeController.create);
// Update item size
router.put('/:id', (0, authorize_1.requirePermission)('items:update'), itemSizeController.update);
// Delete item size
router.delete('/:id', (0, authorize_1.requirePermission)('items:delete'), itemSizeController.delete);
exports.default = router;
