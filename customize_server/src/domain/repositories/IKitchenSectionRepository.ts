import {
  KitchenSection,
  CreateKitchenSectionDTO,
  KitchenSectionFilters,
} from '../entities/KitchenSection';

export interface IKitchenSectionRepository {
  create(data: CreateKitchenSectionDTO): Promise<KitchenSection>;
  findAll(filters: KitchenSectionFilters): Promise<KitchenSection[]>;
  findByName(name: string, business_id: string): Promise<KitchenSection | null>;
  findById(id: string): Promise<KitchenSection | null>;
}
