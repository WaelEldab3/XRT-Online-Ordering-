"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ImportController_1 = require("../controllers/ImportController");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
const importController = new ImportController_1.ImportController();
// All import routes require authentication and Super Admin role
router.use(auth_1.requireAuth);
// Parse and validate import file
router.post('/parse', upload_1.upload.single('file'), // Accept CSV or ZIP
importController.parseAndValidate);
// Get import session
router.get('/sessions/:id', importController.getSession);
// List import sessions
router.get('/sessions', importController.listSessions);
// Update import session (save draft)
router.put('/sessions/:id', importController.updateSession);
// Append file to session
router.post('/sessions/:id/append', upload_1.upload.single('file'), importController.appendFile);
// Final save to database
router.post('/sessions/:id/save', importController.finalSave);
// Discard import session
router.post('/sessions/:id/discard', importController.discardSession);
// Delete import session
router.delete('/sessions/:id', importController.deleteSession);
// Download errors as CSV
router.get('/sessions/:id/errors', importController.downloadErrors);
// Rollback import session
router.post('/sessions/:id/rollback', importController.rollbackSession);
// Clear import history
router.delete('/sessions', importController.clearHistory);
exports.default = router;
