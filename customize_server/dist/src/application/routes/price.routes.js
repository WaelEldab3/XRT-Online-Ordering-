"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PriceController_1 = require("../controllers/PriceController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const roles_1 = require("../../shared/constants/roles");
const router = express_1.default.Router();
const priceController = new PriceController_1.PriceController();
// Only Super Admin and Business Admin can access these
router.post('/bulk-update', auth_1.requireAuth, (0, authorize_1.authorizeRoles)(roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.BUSINESS_ADMIN), priceController.bulkUpdate);
router.post('/rollback/:id', auth_1.requireAuth, (0, authorize_1.authorizeRoles)(roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.BUSINESS_ADMIN), priceController.rollback);
router.get('/history', auth_1.requireAuth, (0, authorize_1.authorizeRoles)(roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.BUSINESS_ADMIN), priceController.getHistory);
router.delete('/history/:id', auth_1.requireAuth, (0, authorize_1.authorizeRoles)(roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.BUSINESS_ADMIN), priceController.deleteHistory);
router.delete('/history', auth_1.requireAuth, (0, authorize_1.authorizeRoles)(roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.BUSINESS_ADMIN), priceController.clearHistory);
exports.default = router;
