"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearImportHistoryUseCase = void 0;
class ClearImportHistoryUseCase {
    constructor(importSessionRepository) {
        this.importSessionRepository = importSessionRepository;
    }
    async execute(user_id, business_id) {
        await this.importSessionRepository.deleteAll(user_id, business_id);
    }
}
exports.ClearImportHistoryUseCase = ClearImportHistoryUseCase;
