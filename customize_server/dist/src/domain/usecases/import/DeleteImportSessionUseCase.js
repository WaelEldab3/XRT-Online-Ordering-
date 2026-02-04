"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteImportSessionUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class DeleteImportSessionUseCase {
    constructor(importSessionRepository) {
        this.importSessionRepository = importSessionRepository;
    }
    async execute(sessionId, user_id) {
        const session = await this.importSessionRepository.findById(sessionId, user_id);
        if (!session) {
            throw new AppError_1.ValidationError('Import session not found');
        }
        await this.importSessionRepository.delete(sessionId, user_id);
    }
}
exports.DeleteImportSessionUseCase = DeleteImportSessionUseCase;
