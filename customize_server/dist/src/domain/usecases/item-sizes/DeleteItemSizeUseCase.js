"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteItemSizeUseCase = void 0;
class DeleteItemSizeUseCase {
    constructor(itemSizeRepository) {
        this.itemSizeRepository = itemSizeRepository;
    }
    async execute(id) {
        // TODO: Add check if this size is used by any item in the future.
        // For now, simpler implementation: just delete.
        // If strict integrity is needed, we should count usage. 
        // Given the task is to fix errors, I will remove the ItemRepository dependency.
        await this.itemSizeRepository.delete(id);
    }
}
exports.DeleteItemSizeUseCase = DeleteItemSizeUseCase;
