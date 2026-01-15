"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateModifierUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class UpdateModifierUseCase {
    constructor(modifierRepository) {
        this.modifierRepository = modifierRepository;
    }
    async execute(id, modifier_group_id, data) {
        const existingModifier = await this.modifierRepository.findById(id, modifier_group_id);
        if (!existingModifier) {
            throw new AppError_1.NotFoundError('Modifier');
        }
        // Validate max_quantity if provided
        if (data.max_quantity !== undefined && data.max_quantity < 1) {
            throw new AppError_1.ValidationError('max_quantity must be greater than or equal to 1');
        }
        // Validate display_order
        if (data.display_order !== undefined && data.display_order < 0) {
            throw new AppError_1.ValidationError('display_order must be greater than or equal to 0');
        }
        // Check if name already exists in this group (excluding current modifier)
        if (data.name && data.name !== existingModifier.name) {
            const nameExists = await this.modifierRepository.exists(data.name, modifier_group_id, id);
            if (nameExists) {
                throw new AppError_1.ValidationError('Modifier name already exists in this group');
            }
        }
        return await this.modifierRepository.update(id, modifier_group_id, data);
    }
}
exports.UpdateModifierUseCase = UpdateModifierUseCase;
