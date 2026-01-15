import { Router } from 'express';
import { ItemSizeController } from '../controllers/ItemSizeController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const itemSizeController = new ItemSizeController();

router.use(requireAuth);

// Get all sizes for an item
router.get(
  '/:itemId/sizes',
  requirePermission('items:read'),
  itemSizeController.getAll
);

// Get single item size
router.get(
  '/:itemId/sizes/:id',
  requirePermission('items:read'),
  itemSizeController.getById
);

// Create item size
router.post(
  '/:itemId/sizes',
  requirePermission('items:create'),
  itemSizeController.create
);

// Update item size
router.put(
  '/:itemId/sizes/:id',
  requirePermission('items:update'),
  itemSizeController.update
);

// Delete item size
router.delete(
  '/:itemId/sizes/:id',
  requirePermission('items:delete'),
  itemSizeController.delete
);

export default router;
