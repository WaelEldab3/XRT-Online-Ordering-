"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscardImportSessionUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class DiscardImportSessionUseCase {
    constructor(importSessionRepository) {
        this.importSessionRepository = importSessionRepository;
    }
    async execute(sessionId, user_id) {
        const session = await this.importSessionRepository.findById(sessionId, user_id);
        if (!session) {
            throw new AppError_1.ValidationError('Import session not found');
        }
        if (session.status === 'confirmed') {
            throw new AppError_1.ValidationError('Cannot discard a confirmed import session');
        }
        await this.importSessionRepository.update(sessionId, user_id, {
            status: 'discarded',
        });
    }
}
exports.DiscardImportSessionUseCase = DiscardImportSessionUseCase;
