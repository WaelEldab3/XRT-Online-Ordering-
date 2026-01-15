"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetImportSessionUseCase = void 0;
class GetImportSessionUseCase {
    constructor(importSessionRepository) {
        this.importSessionRepository = importSessionRepository;
    }
    async execute(sessionId, user_id) {
        return await this.importSessionRepository.findById(sessionId, user_id);
    }
}
exports.GetImportSessionUseCase = GetImportSessionUseCase;
