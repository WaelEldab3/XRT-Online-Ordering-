import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const settingsController = new SettingsController();

// All settings routes require authentication
router.use(requireAuth);

// Get settings - requires settings:read permission
router.get(
    '/',
    requirePermission('settings:read'),
    settingsController.getSettings
);

// Update settings - requires settings:update permission
router.patch(
    '/',
    requirePermission('settings:update'),
    settingsController.updateSettings
);

export default router;
