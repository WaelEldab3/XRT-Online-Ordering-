import { IItemSizeRepository } from '../../repositories/IItemSizeRepository';
import { ItemSize } from '../../entities/ItemSize';

export class GetItemSizeUseCase {
  constructor(private itemSizeRepository: IItemSizeRepository) { }

  async execute(id: string, item_id?: string): Promise<ItemSize | null> {
    return await this.itemSizeRepository.findById(id, item_id);
  }
}
