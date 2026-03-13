import { IKitchenSectionRepository } from '../../repositories/IKitchenSectionRepository';
import { CreateKitchenSectionDTO, KitchenSection } from '../../entities/KitchenSection';
import { ValidationError, NotFoundError } from '../../../shared/errors/AppError';

export class UpdateKitchenSectionUseCase {
  constructor(private repository: IKitchenSectionRepository) {}

  async execute(id: string, data: Partial<CreateKitchenSectionDTO>): Promise<KitchenSection> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Kitchen section not found.');
    }

    if (data.name && data.name.trim() !== existing.name) {
      const existingName = await this.repository.findByName(data.name, existing.business_id);
      if (existingName && existingName.id !== id) {
        throw new ValidationError('Another kitchen section with this name already exists.');
      }
    }

    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new NotFoundError('Kitchen section not found after update attempt.');
    }
    return updated;
  }
}
