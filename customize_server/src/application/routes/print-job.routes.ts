import { Router } from 'express';
import { PrintJobController } from '../controllers/PrintJobController';

const router = Router();
const printJobController = new PrintJobController();

/**
 * Endpoints for the Local Print Agent
 */

// POST /api/print-jobs/claim
router.post('/claim', printJobController.claimJobs.bind(printJobController));

// PUT /api/print-jobs/:id/status
router.put('/:id/status', printJobController.updateStatus.bind(printJobController));

/**
 * Endpoints for Admin Dashboard
 */

// GET /api/print-jobs/:id
router.get('/:id', printJobController.getJob.bind(printJobController));

export default router;
