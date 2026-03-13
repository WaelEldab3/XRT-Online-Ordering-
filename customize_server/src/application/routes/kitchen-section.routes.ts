import { Router } from 'express';
import { KitchenSectionController } from '../controllers/KitchenSectionController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const kitchenSectionController = new KitchenSectionController();

router.get('/', requireAuth, kitchenSectionController.getAll);
router.post('/', requireAuth, kitchenSectionController.create);
router.get('/:id', requireAuth, kitchenSectionController.getById);
router.put('/:id', requireAuth, kitchenSectionController.update);
router.delete('/:id', requireAuth, kitchenSectionController.delete);

export default router;
