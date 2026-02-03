import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';

export class ClearImportHistoryUseCase {
  constructor(private importSessionRepository: IImportSessionRepository) {}

  async execute(user_id: string, business_id?: string): Promise<void> {
    await this.importSessionRepository.deleteAll(user_id, business_id);
  }
}
