import { IKitchenSectionRepository } from '../../repositories/IKitchenSectionRepository';
import { NotFoundError } from '../../../shared/errors/AppError';

export class DeleteKitchenSectionUseCase {
  constructor(private repository: IKitchenSectionRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Kitchen section not found.');
    }

    await this.repository.delete(id);
  }
}
