import {
  PrintTemplate,
  CreatePrintTemplateDTO,
  UpdatePrintTemplateDTO,
  PrintTemplateFilters,
} from '../entities/PrintTemplate';

export interface IPrintTemplateRepository {
  create(data: CreatePrintTemplateDTO): Promise<PrintTemplate>;
  findById(id: string): Promise<PrintTemplate | null>;
  findAll(filters: PrintTemplateFilters): Promise<PrintTemplate[]>;
  update(id: string, data: UpdatePrintTemplateDTO): Promise<PrintTemplate | null>;
  delete(id: string): Promise<boolean>;
}
