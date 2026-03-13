import { IPrintTemplateRepository } from '../../domain/repositories/IPrintTemplateRepository';
import {
  PrintTemplate,
  CreatePrintTemplateDTO,
  UpdatePrintTemplateDTO,
  PrintTemplateFilters,
} from '../../domain/entities/PrintTemplate';
import { PrintTemplateModel, PrintTemplateDocument } from '../database/models/PrintTemplateModel';
import { Types } from 'mongoose';

export class PrintTemplateRepository implements IPrintTemplateRepository {
  private toDomain(doc: PrintTemplateDocument): PrintTemplate {
    return {
      id: doc._id.toString(),
      name: doc.name,
      type: doc.type as PrintTemplate['type'],
      layout: doc.layout as PrintTemplate['layout'],
      paper_width: doc.paper_width as PrintTemplate['paper_width'],
      active: doc.active,
      autoCut: (doc as any).autoCut ?? false,
      sections: (doc as any).sections || [],
      created_by: doc.created_by ? doc.created_by.toString() : null,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  }

  async create(data: CreatePrintTemplateDTO): Promise<PrintTemplate> {
    const doc = await PrintTemplateModel.create(data);
    return this.toDomain(doc);
  }

  async findById(id: string): Promise<PrintTemplate | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await PrintTemplateModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(filters: PrintTemplateFilters): Promise<PrintTemplate[]> {
    const query: Record<string, unknown> = {};
    if (filters.type != null) query.type = filters.type;
    if (filters.active != null) query.active = filters.active;

    const docs = await PrintTemplateModel.find(query).sort({ updated_at: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async update(id: string, data: UpdatePrintTemplateDTO): Promise<PrintTemplate | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await PrintTemplateModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await PrintTemplateModel.findByIdAndDelete(id).exec();
    return result != null;
  }
}
