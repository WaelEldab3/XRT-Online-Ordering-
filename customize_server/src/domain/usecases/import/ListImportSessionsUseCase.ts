import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';
import { ImportSession } from '../../entities/ImportSession';

export class ListImportSessionsUseCase {
  constructor(private importSessionRepository: IImportSessionRepository) { }

  async execute(user_id: string, business_id?: string): Promise<ImportSession[]> {
    return await this.importSessionRepository.findByUser(user_id, business_id);
  }
}
