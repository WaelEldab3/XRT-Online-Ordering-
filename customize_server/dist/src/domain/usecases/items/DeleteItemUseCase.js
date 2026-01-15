"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteItemUseCase = void 0;
class DeleteItemUseCase {
    constructor(itemRepository, imageStorage, itemSizeRepository) {
        this.itemRepository = itemRepository;
        this.imageStorage = imageStorage;
        this.itemSizeRepository = itemSizeRepository;
    }
    async execute(id, business_id) {
        const item = await this.itemRepository.findById(id, business_id);
        if (!item) {
            throw new Error('Item not found');
        }
        // Delete all associated item sizes
        const sizes = await this.itemSizeRepository.findAll({ item_id: id });
        for (const size of sizes) {
            await this.itemSizeRepository.delete(size.id, id);
        }
        if (item.image_public_id) {
            await this.imageStorage.deleteImage(item.image_public_id);
        }
        await this.itemRepository.delete(id, business_id);
    }
}
exports.DeleteItemUseCase = DeleteItemUseCase;
