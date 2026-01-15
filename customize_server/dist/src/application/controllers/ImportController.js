"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportController = void 0;
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
const ParseAndValidateImportUseCase_1 = require("../../domain/usecases/import/ParseAndValidateImportUseCase");
const UpdateImportSessionUseCase_1 = require("../../domain/usecases/import/UpdateImportSessionUseCase");
const FinalSaveImportUseCase_1 = require("../../domain/usecases/import/FinalSaveImportUseCase");
const GetImportSessionUseCase_1 = require("../../domain/usecases/import/GetImportSessionUseCase");
const ListImportSessionsUseCase_1 = require("../../domain/usecases/import/ListImportSessionsUseCase");
const DiscardImportSessionUseCase_1 = require("../../domain/usecases/import/DiscardImportSessionUseCase");
const ImportSessionRepository_1 = require("../../infrastructure/repositories/ImportSessionRepository");
const auditLogger_1 = require("../../shared/utils/auditLogger");
class ImportController {
    constructor() {
        this.parseAndValidate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // Super Admin only
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can perform imports', 403);
            }
            if (!req.file) {
                throw new AppError_1.ValidationError('CSV or ZIP file is required');
            }
            const business_id = req.body.business_id || req.user?.business_id;
            if (!business_id) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const session = await this.parseAndValidateUseCase.execute(req.file, req.user.id, business_id);
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_PARSE, req.user.id, business_id, session.id, { files: session.originalFiles, errors: session.validationErrors.length, warnings: session.validationWarnings.length });
            return (0, response_1.sendSuccess)(res, 'Import parsed and validated', session, 201);
        });
        this.getSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can access import sessions', 403);
            }
            const { id } = req.params;
            const session = await this.getSessionUseCase.execute(id, req.user.id);
            if (!session) {
                return (0, response_1.sendError)(res, 'Import session not found', 404);
            }
            return (0, response_1.sendSuccess)(res, 'Import session retrieved', session);
        });
        this.listSessions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can list import sessions', 403);
            }
            const business_id = req.query.business_id;
            const sessions = await this.listSessionsUseCase.execute(req.user.id, business_id);
            return (0, response_1.sendSuccess)(res, 'Import sessions retrieved', sessions);
        });
        this.updateSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can update import sessions', 403);
            }
            const { id } = req.params;
            const { parsedData, status } = req.body;
            const updateData = {};
            if (parsedData) {
                updateData.parsedData = parsedData;
            }
            if (status) {
                updateData.status = status;
            }
            const session = await this.updateSessionUseCase.execute(id, req.user.id, updateData);
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_SAVE_DRAFT, req.user.id, session.business_id, session.id, { status: session.status });
            return (0, response_1.sendSuccess)(res, 'Import session updated', session);
        });
        this.finalSave = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can save imports', 403);
            }
            const { id } = req.params;
            const session = await this.getSessionUseCase.execute(id, req.user.id);
            await this.finalSaveUseCase.execute(id, req.user.id);
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_FINAL_SAVE, req.user.id, session?.business_id || '', id, { items: session?.parsedData.items.length, itemSizes: session?.parsedData.itemSizes.length });
            return (0, response_1.sendSuccess)(res, 'Import saved to database successfully', null);
        });
        this.discardSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can discard import sessions', 403);
            }
            const { id } = req.params;
            const session = await this.getSessionUseCase.execute(id, req.user.id);
            await this.discardSessionUseCase.execute(id, req.user.id);
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_DISCARD, req.user.id, session?.business_id || '', id);
            return (0, response_1.sendSuccess)(res, 'Import session discarded', null);
        });
        this.downloadErrors = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can download errors', 403);
            }
            const { id } = req.params;
            const session = await this.getSessionUseCase.execute(id, req.user.id);
            if (!session) {
                return (0, response_1.sendError)(res, 'Import session not found', 404);
            }
            // Convert errors to CSV
            const csvRows = [
                ['file', 'row', 'entity', 'field', 'message', 'value'].join(','),
                ...session.validationErrors.map(err => [
                    `"${err.file}"`,
                    err.row,
                    `"${err.entity}"`,
                    `"${err.field}"`,
                    `"${err.message}"`,
                    `"${err.value || ''}"`,
                ].join(',')),
            ];
            const csvContent = csvRows.join('\n');
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_DOWNLOAD_ERRORS, req.user.id, session.business_id, id, { errorCount: session.validationErrors.length });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="import-errors-${id}.csv"`);
            res.send(csvContent);
        });
        const importSessionRepository = new ImportSessionRepository_1.ImportSessionRepository();
        this.parseAndValidateUseCase = new ParseAndValidateImportUseCase_1.ParseAndValidateImportUseCase(importSessionRepository);
        this.updateSessionUseCase = new UpdateImportSessionUseCase_1.UpdateImportSessionUseCase(importSessionRepository);
        this.finalSaveUseCase = new FinalSaveImportUseCase_1.FinalSaveImportUseCase(importSessionRepository);
        this.getSessionUseCase = new GetImportSessionUseCase_1.GetImportSessionUseCase(importSessionRepository);
        this.listSessionsUseCase = new ListImportSessionsUseCase_1.ListImportSessionsUseCase(importSessionRepository);
        this.discardSessionUseCase = new DiscardImportSessionUseCase_1.DiscardImportSessionUseCase(importSessionRepository);
    }
}
exports.ImportController = ImportController;
