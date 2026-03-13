import {
  Printer,
  CreatePrinterDTO,
  UpdatePrinterDTO,
  PrinterFilters,
} from '../entities/Printer';

export interface IPrinterRepository {
  create(data: CreatePrinterDTO): Promise<Printer>;
  findById(id: string): Promise<Printer | null>;
  findAll(filters: PrinterFilters): Promise<Printer[]>;
  update(id: string, data: UpdatePrinterDTO): Promise<Printer | null>;
  delete(id: string): Promise<boolean>;
}
