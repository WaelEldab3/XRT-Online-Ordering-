import { IKitchenSectionRepository } from '../../repositories/IKitchenSectionRepository';
import { CreateKitchenSectionDTO, KitchenSection } from '../../entities/KitchenSection';
import { ValidationError } from '../../../shared/errors/AppError';

export class CreateKitchenSectionUseCase {
  constructor(private repository: IKitchenSectionRepository) {}

  async execute(data: CreateKitchenSectionDTO): Promise<KitchenSection> {
    if (!data.name || !data.name.trim()) {
      throw new ValidationError('Kitchen section name is required.');
    }
    if (!data.business_id) {
      throw new ValidationError('Business ID is required.');
    }

    const existingName = await this.repository.findByName(data.name, data.business_id);
    if (existingName) {
      throw new ValidationError('Kitchen section with this name already exists.');
    }

    return this.repository.create(data);
  }
}
