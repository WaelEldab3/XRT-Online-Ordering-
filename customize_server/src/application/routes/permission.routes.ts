import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const permissionController = new PermissionController();

// All permission routes require authentication
router.use(requireAuth);

// Get all permissions - requires permissions:read
router.get(
    '/',
    requirePermission('permissions:read'),
    permissionController.getAllPermissions
);

// Get permissions grouped by module - requires permissions:read
router.get(
    '/grouped',
    requirePermission('permissions:read'),
    permissionController.getGroupedPermissions
);

// Get all modules - requires permissions:read
router.get(
    '/modules',
    requirePermission('permissions:read'),
    permissionController.getModules
);

// Get single permission - requires permissions:read
router.get(
    '/:id',
    requirePermission('permissions:read'),
    permissionController.getPermission
);

// Update permission (enable/disable) - requires permissions:update
router.patch(
    '/:id',
    requirePermission('permissions:update'),
    permissionController.updatePermission
);

export default router;
