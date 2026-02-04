"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateItemSizeUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class CreateItemSizeUseCase {
    constructor(itemSizeRepository) {
        this.itemSizeRepository = itemSizeRepository;
    }
    async execute(sizeData) {
        // Check if code already exists for this business
        const codeExists = await this.itemSizeRepository.exists(sizeData.code, sizeData.business_id);
        if (codeExists) {
            throw new AppError_1.ValidationError(`Size code '${sizeData.code}' already exists`);
        }
        const finalSizeData = {
            ...sizeData,
            display_order: sizeData.display_order ?? 0,
            is_active: sizeData.is_active ?? true,
        };
        return await this.itemSizeRepository.create(finalSizeData);
    }
}
exports.CreateItemSizeUseCase = CreateItemSizeUseCase;
