import { Router } from 'express';
import { KitchenSectionController } from '../controllers/KitchenSectionController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const kitchenSectionController = new KitchenSectionController();

router.get('/', requireAuth, kitchenSectionController.getAll);

export default router;
