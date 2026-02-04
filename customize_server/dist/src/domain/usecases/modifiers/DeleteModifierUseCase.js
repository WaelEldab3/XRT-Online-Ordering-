"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteModifierUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class DeleteModifierUseCase {
    constructor(modifierRepository) {
        this.modifierRepository = modifierRepository;
    }
    async execute(id, modifier_group_id) {
        const modifier = await this.modifierRepository.findById(id, modifier_group_id);
        if (!modifier) {
            throw new AppError_1.NotFoundError('Modifier');
        }
        await this.modifierRepository.delete(id, modifier_group_id);
    }
}
exports.DeleteModifierUseCase = DeleteModifierUseCase;
