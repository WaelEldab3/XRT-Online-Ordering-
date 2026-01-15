import { Router } from 'express';
import { ImportController } from '../controllers/ImportController';
import { requireAuth } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();
const importController = new ImportController();

// All import routes require authentication and Super Admin role
router.use(requireAuth);

// Parse and validate import file
router.post(
  '/parse',
  upload.single('file'), // Accept CSV or ZIP
  importController.parseAndValidate
);

// Get import session
router.get(
  '/sessions/:id',
  importController.getSession
);

// List import sessions
router.get(
  '/sessions',
  importController.listSessions
);

// Update import session (save draft)
router.put(
  '/sessions/:id',
  importController.updateSession
);

// Final save to database
router.post(
  '/sessions/:id/save',
  importController.finalSave
);

// Discard import session
router.delete(
  '/sessions/:id',
  importController.discardSession
);

// Download errors as CSV
router.get(
  '/sessions/:id/errors',
  importController.downloadErrors
);

export default router;
