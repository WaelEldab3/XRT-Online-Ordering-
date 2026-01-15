"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateModifierUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class CreateModifierUseCase {
    constructor(modifierRepository, modifierGroupRepository) {
        this.modifierRepository = modifierRepository;
        this.modifierGroupRepository = modifierGroupRepository;
    }
    async execute(data) {
        // Verify modifier group exists and is active
        const modifierGroup = await this.modifierGroupRepository.findActiveById(data.modifier_group_id);
        if (!modifierGroup) {
            throw new AppError_1.NotFoundError('Modifier Group');
        }
        // Check if name already exists in this group
        const nameExists = await this.modifierRepository.exists(data.name, data.modifier_group_id);
        if (nameExists) {
            throw new AppError_1.ValidationError('Modifier name already exists in this group');
        }
        // Validate max_quantity if provided
        if (data.max_quantity !== undefined && data.max_quantity < 1) {
            throw new AppError_1.ValidationError('max_quantity must be greater than or equal to 1');
        }
        // Validate display_order
        if (data.display_order !== undefined && data.display_order < 0) {
            throw new AppError_1.ValidationError('display_order must be greater than or equal to 0');
        }
        return await this.modifierRepository.create(data);
    }
}
exports.CreateModifierUseCase = CreateModifierUseCase;
