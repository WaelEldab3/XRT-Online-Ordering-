"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetItemSizeUseCase = void 0;
class GetItemSizeUseCase {
    constructor(itemSizeRepository) {
        this.itemSizeRepository = itemSizeRepository;
    }
    async execute(id) {
        return await this.itemSizeRepository.findById(id);
    }
}
exports.GetItemSizeUseCase = GetItemSizeUseCase;
