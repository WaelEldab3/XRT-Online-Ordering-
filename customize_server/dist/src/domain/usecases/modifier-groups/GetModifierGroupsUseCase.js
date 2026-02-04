"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetModifierGroupsUseCase = void 0;
class GetModifierGroupsUseCase {
    constructor(modifierGroupRepository) {
        this.modifierGroupRepository = modifierGroupRepository;
    }
    async execute(filters) {
        return await this.modifierGroupRepository.findAll(filters);
    }
}
exports.GetModifierGroupsUseCase = GetModifierGroupsUseCase;
