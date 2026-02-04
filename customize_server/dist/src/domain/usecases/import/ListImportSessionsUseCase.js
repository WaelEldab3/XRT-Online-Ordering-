"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListImportSessionsUseCase = void 0;
class ListImportSessionsUseCase {
    constructor(importSessionRepository) {
        this.importSessionRepository = importSessionRepository;
    }
    async execute(user_id, business_id) {
        return await this.importSessionRepository.findByUser(user_id, business_id);
    }
}
exports.ListImportSessionsUseCase = ListImportSessionsUseCase;
