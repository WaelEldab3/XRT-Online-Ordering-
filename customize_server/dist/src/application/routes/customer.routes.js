"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CustomerController_1 = require("../controllers/CustomerController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const customerController = new CustomerController_1.CustomerController();
// All customer routes require authentication
router.use(auth_1.requireAuth);
// Get all customers - requires customers:read permission
router.get('/', (0, authorize_1.requirePermission)('customers:read'), customerController.getAll);
// Get single customer - requires customers:read permission
router.get('/:id', (0, authorize_1.requirePermission)('customers:read'), customerController.getById);
// Create customer - requires customers:create permission
router.post('/', (0, authorize_1.requirePermission)('customers:create'), customerController.create);
// Update customer - requires customers:update permission
router.put('/:id', (0, authorize_1.requirePermission)('customers:update'), customerController.update);
// Delete customer - requires customers:delete permission
router.delete('/:id', (0, authorize_1.requirePermission)('customers:delete'), customerController.delete);
exports.default = router;
