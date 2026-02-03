import { IKitchenSectionRepository } from '../../repositories/IKitchenSectionRepository';
import { KitchenSection } from '../../entities/KitchenSection';

export class GetKitchenSectionsUseCase {
  constructor(private kitchenSectionRepository: IKitchenSectionRepository) {}

  async execute(business_id: string): Promise<KitchenSection[]> {
    return this.kitchenSectionRepository.findAll({ business_id });
  }
}
