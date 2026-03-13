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
  update(id: string, data: Partial<CreateKitchenSectionDTO>): Promise<KitchenSection | null>;
  delete(id: string): Promise<boolean>;
}
