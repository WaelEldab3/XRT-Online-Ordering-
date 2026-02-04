"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSortOrderUseCase = void 0;
class UpdateSortOrderUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(items) {
        if (!items || items.length === 0) {
            return;
        }
        await this.repository.updateSortOrder(items);
    }
}
exports.UpdateSortOrderUseCase = UpdateSortOrderUseCase;
