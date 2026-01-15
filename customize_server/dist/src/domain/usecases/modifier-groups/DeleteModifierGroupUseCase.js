"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteModifierGroupUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class DeleteModifierGroupUseCase {
    constructor(modifierGroupRepository) {
        this.modifierGroupRepository = modifierGroupRepository;
    }
    async execute(id, business_id) {
        const modifierGroup = await this.modifierGroupRepository.findById(id, business_id);
        if (!modifierGroup) {
            throw new AppError_1.NotFoundError('Modifier Group');
        }
        // Check if modifier group is used by any items
        const isUsed = await this.modifierGroupRepository.isUsedByItems(id);
        if (isUsed) {
            throw new AppError_1.ValidationError('Cannot delete modifier group that is assigned to items. Please remove all item assignments first.');
        }
        await this.modifierGroupRepository.delete(id, business_id);
    }
}
exports.DeleteModifierGroupUseCase = DeleteModifierGroupUseCase;
