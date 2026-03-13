import { Router } from 'express';
import { PrintTemplateController } from '../controllers/PrintTemplateController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const printTemplateController = new PrintTemplateController();

router.get('/printable-fields', requireAuth, printTemplateController.getPrintableFields);
router.get('/', requireAuth, printTemplateController.getAll);
router.get('/:id', requireAuth, printTemplateController.getById);
router.post('/', requireAuth, printTemplateController.create);
router.put('/:id', requireAuth, printTemplateController.update);
router.delete('/:id', requireAuth, printTemplateController.delete);

export default router;
