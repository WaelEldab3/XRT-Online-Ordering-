import { IItemSizeRepository } from '../../repositories/IItemSizeRepository';
import { IItemRepository } from '../../repositories/IItemRepository';
import { ItemSize, CreateItemSizeDTO } from '../../entities/ItemSize';
import { ValidationError } from '../../../shared/errors/AppError';

export class CreateItemSizeUseCase {
  constructor(
    private itemSizeRepository: IItemSizeRepository,
    private itemRepository: IItemRepository
  ) { }

  async execute(sizeData: CreateItemSizeDTO): Promise<ItemSize> {
    // Verify item exists and belongs to the restaurant
    const item = await this.itemRepository.findById(sizeData.item_id);
    if (!item) {
      throw new ValidationError('Item not found');
    }

    if (item.business_id !== sizeData.restaurant_id) {
      throw new ValidationError('Item does not belong to the specified restaurant');
    }

    // Verify item is sizable
    if (!item.is_sizeable) {
      throw new ValidationError('Cannot add sizes to a non-sizeable item. Set is_sizeable to true first.');
    }

    // Check if code already exists for this item
    const codeExists = await this.itemSizeRepository.exists(sizeData.code, sizeData.item_id);
    if (codeExists) {
      throw new ValidationError(`Size code '${sizeData.code}' already exists for this item`);
    }

    const finalSizeData: CreateItemSizeDTO = {
      ...sizeData,
      display_order: sizeData.display_order ?? 0,
      is_active: sizeData.is_active ?? true,
    };

    return await this.itemSizeRepository.create(finalSizeData);
  }
}
