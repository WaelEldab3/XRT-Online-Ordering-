"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateItemSizeUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class CreateItemSizeUseCase {
    constructor(itemSizeRepository, itemRepository) {
        this.itemSizeRepository = itemSizeRepository;
        this.itemRepository = itemRepository;
    }
    async execute(sizeData) {
        // Verify item exists and belongs to the restaurant
        const item = await this.itemRepository.findById(sizeData.item_id);
        if (!item) {
            throw new AppError_1.ValidationError('Item not found');
        }
        if (item.business_id !== sizeData.restaurant_id) {
            throw new AppError_1.ValidationError('Item does not belong to the specified restaurant');
        }
        // Verify item is sizable
        if (!item.is_sizeable) {
            throw new AppError_1.ValidationError('Cannot add sizes to a non-sizeable item. Set is_sizeable to true first.');
        }
        // Check if code already exists for this item
        const codeExists = await this.itemSizeRepository.exists(sizeData.code, sizeData.item_id);
        if (codeExists) {
            throw new AppError_1.ValidationError(`Size code '${sizeData.code}' already exists for this item`);
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
