"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateModifierSortOrderUseCase = void 0;
class UpdateModifierSortOrderUseCase {
    constructor(modifierRepository) {
        this.modifierRepository = modifierRepository;
    }
    async execute(items) {
        return this.modifierRepository.updateSortOrder(items);
    }
}
exports.UpdateModifierSortOrderUseCase = UpdateModifierSortOrderUseCase;
