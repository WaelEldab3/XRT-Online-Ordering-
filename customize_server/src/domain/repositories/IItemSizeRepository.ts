import {
  ItemSize,
  CreateItemSizeDTO,
  UpdateItemSizeDTO,
  ItemSizeFilters,
} from '../entities/ItemSize';

export interface IItemSizeRepository {
  create(data: CreateItemSizeDTO): Promise<ItemSize>;
  findById(id: string, item_id?: string): Promise<ItemSize | null>;
  findAll(filters: ItemSizeFilters): Promise<ItemSize[]>;
  findByItemId(item_id: string): Promise<ItemSize[]>;
  update(id: string, item_id: string, data: UpdateItemSizeDTO): Promise<ItemSize>;
  delete(id: string, item_id: string): Promise<void>;
  exists(code: string, item_id: string, excludeId?: string): Promise<boolean>;
  countByItemId(item_id: string): Promise<number>;
}
