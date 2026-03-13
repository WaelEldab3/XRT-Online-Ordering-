import { Router } from 'express';
import { PrinterController } from '../controllers/PrinterController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const printerController = new PrinterController();

router.get('/', requireAuth, printerController.getAll);
router.get('/scan', requireAuth, printerController.scanWiFi);
router.get('/scan-lan', requireAuth, printerController.scanLAN);
router.get('/scan-bluetooth', requireAuth, printerController.scanBluetooth);
router.get('/:id', requireAuth, printerController.getById);
router.post('/', requireAuth, printerController.create);
router.put('/:id', requireAuth, printerController.update);
router.delete('/:id', requireAuth, printerController.delete);
router.post('/:id/test-print', requireAuth, printerController.testPrint);

export default router;
