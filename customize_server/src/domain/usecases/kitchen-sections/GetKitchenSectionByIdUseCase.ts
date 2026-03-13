import { IKitchenSectionRepository } from '../../repositories/IKitchenSectionRepository';
import { KitchenSection } from '../../entities/KitchenSection';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetKitchenSectionByIdUseCase {
  constructor(private repository: IKitchenSectionRepository) {}

  async execute(id: string): Promise<KitchenSection> {
    const section = await this.repository.findById(id);
    if (!section) {
      throw new NotFoundError('Kitchen section not found.');
    }
    return section;
  }
}
