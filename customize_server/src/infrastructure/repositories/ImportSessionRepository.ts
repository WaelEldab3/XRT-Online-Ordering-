import { IImportSessionRepository } from '../../domain/repositories/IImportSessionRepository';
import {
  ImportSession,
  CreateImportSessionDTO,
  UpdateImportSessionDTO,
} from '../../domain/entities/ImportSession';
import { ImportSessionModel, ImportSessionDocument } from '../database/models/ImportSessionModel';

export class ImportSessionRepository implements IImportSessionRepository {
  private toDomain(document: ImportSessionDocument): ImportSession {
    return {
      id: document._id.toString(),
      user_id: document.user_id,
      business_id: document.business_id,
      status: document.status,
      parsedData: document.parsedData as any,
      validationErrors: document.validationErrors || [],
      validationWarnings: document.validationWarnings || [],
      originalFiles: document.originalFiles || [],
      expires_at: document.expires_at,
      created_at: document.created_at,
      updated_at: document.updated_at,
    };
  }

  async create(data: CreateImportSessionDTO): Promise<ImportSession> {
    // Set expiration to 7 days from now
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);

    const sessionDoc = new ImportSessionModel({
      ...data,
      expires_at,
    });
    await sessionDoc.save();
    return this.toDomain(sessionDoc);
  }

  async findById(id: string, user_id?: string): Promise<ImportSession | null> {
    const query: any = { _id: id };
    if (user_id) {
      query.user_id = user_id;
    }
    const sessionDoc = await ImportSessionModel.findOne(query);
    return sessionDoc ? this.toDomain(sessionDoc) : null;
  }

  async findByUser(user_id: string, business_id?: string): Promise<ImportSession[]> {
    const query: any = { user_id };
    if (business_id) {
      query.business_id = business_id;
    }
    const sessionDocs = await ImportSessionModel.find(query).sort({ created_at: -1 });
    return sessionDocs.map((doc) => this.toDomain(doc));
  }

  async update(id: string, user_id: string, data: UpdateImportSessionDTO): Promise<ImportSession> {
    const sessionDoc = await ImportSessionModel.findOneAndUpdate({ _id: id, user_id }, data, {
      new: true,
      runValidators: true,
    });

    if (!sessionDoc) {
      throw new Error('Import session not found');
    }

    return this.toDomain(sessionDoc);
  }

  async delete(id: string, user_id: string): Promise<void> {
    const result = await ImportSessionModel.findOneAndDelete({ _id: id, user_id });
    if (!result) {
      throw new Error('Import session not found');
    }
  }

  async deleteAll(user_id: string, business_id?: string): Promise<void> {
    const query: any = { user_id };
    if (business_id) {
      query.business_id = business_id;
    }
    await ImportSessionModel.deleteMany(query);
  }

  async deleteExpired(): Promise<number> {
    const result = await ImportSessionModel.deleteMany({
      expires_at: { $lt: new Date() },
    });
    return result.deletedCount || 0;
  }
}
