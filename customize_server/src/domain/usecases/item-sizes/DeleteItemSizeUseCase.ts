import { IItemSizeRepository } from '../../repositories/IItemSizeRepository';
import { IItemRepository } from '../../repositories/IItemRepository';
import { ValidationError } from '../../../shared/errors/AppError';

export class DeleteItemSizeUseCase {
  constructor(
    private itemSizeRepository: IItemSizeRepository,
    private itemRepository: IItemRepository
  ) { }

  async execute(id: string, item_id: string): Promise<void> {
    // Check if this size is set as default for the item
    const item = await this.itemRepository.findById(item_id);
    if (item && item.default_size_id === id) {
      throw new ValidationError('Cannot delete a size that is set as the default size. Update the item\'s default_size_id first.');
    }

    // Get remaining active sizes count
    const remainingCount = await this.itemSizeRepository.countByItemId(item_id);
    
    // If this is the last size, prevent deletion if item is sizable
    if (remainingCount <= 1 && item?.is_sizeable) {
      throw new ValidationError('Cannot delete the last size. A sizable item must have at least one size. Either add another size first or set is_sizeable to false.');
    }

    await this.itemSizeRepository.delete(id, item_id);
  }
}
