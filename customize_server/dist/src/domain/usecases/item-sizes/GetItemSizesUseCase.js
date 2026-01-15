"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetItemSizesUseCase = void 0;
class GetItemSizesUseCase {
    constructor(itemSizeRepository) {
        this.itemSizeRepository = itemSizeRepository;
    }
    async execute(filters) {
        return await this.itemSizeRepository.findAll(filters);
    }
}
exports.GetItemSizesUseCase = GetItemSizesUseCase;
