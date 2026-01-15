"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetModifierGroupUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class GetModifierGroupUseCase {
    constructor(modifierGroupRepository) {
        this.modifierGroupRepository = modifierGroupRepository;
    }
    async execute(id, business_id) {
        const modifierGroup = await this.modifierGroupRepository.findById(id, business_id);
        if (!modifierGroup) {
            throw new AppError_1.NotFoundError('Modifier Group');
        }
        return modifierGroup;
    }
}
exports.GetModifierGroupUseCase = GetModifierGroupUseCase;
