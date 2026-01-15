import { Router } from 'express';
import { ModifierController } from '../controllers/ModifierController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const modifierController = new ModifierController();

// All modifier routes require authentication
router.use(requireAuth);

// Get all modifiers for a group - requires modifiers:read permission
router.get(
  '/modifier-groups/:groupId/modifiers',
  requirePermission('modifiers:read'),
  modifierController.getAll
);

// Create modifier - requires modifiers:create permission
router.post(
  '/modifier-groups/:groupId/modifiers',
  requirePermission('modifiers:create'),
  modifierController.create
);

// Update modifier - requires modifiers:update permission
router.put(
  '/modifier-groups/:groupId/modifiers/:id',
  requirePermission('modifiers:update'),
  modifierController.update
);

// Delete modifier - requires modifiers:delete permission
router.delete(
  '/modifier-groups/:groupId/modifiers/:id',
  requirePermission('modifiers:delete'),
  modifierController.delete
);

export default router;
