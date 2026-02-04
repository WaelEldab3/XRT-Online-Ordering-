"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const KitchenSectionController_1 = require("../controllers/KitchenSectionController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const kitchenSectionController = new KitchenSectionController_1.KitchenSectionController();
router.get('/', auth_1.requireAuth, kitchenSectionController.getAll);
exports.default = router;
