import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { PrinterRepository } from '../../infrastructure/repositories/PrinterRepository';
import { PrintJobRepository } from '../../infrastructure/repositories/PrintJobRepository';
import { createPrinterInstance } from '../../services/printer/printerFactory';
import { scanForPrinters, scanLAN, scanBluetooth } from '../../services/printer/printerScanner';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { NotFoundError } from '../../shared/errors/AppError';

const ESC_INIT = '\x1b\x40';

export class PrinterController {
  private repository: PrinterRepository;

  constructor() {
    this.repository = new PrinterRepository();
  }

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const active = req.query.active as string | undefined;
    const filters: any = {};
    if (active !== undefined) filters.active = active === 'true';
    const printers = await this.repository.findAll(filters);
    return sendSuccess(res, 'Printers retrieved', printers);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const printer = await this.repository.findById(id);
    if (!printer) throw new NotFoundError('Printer not found');
    return sendSuccess(res, 'Printer retrieved', printer);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const body = req.body;
    const created = await this.repository.create({
      name: body.name,
      connection_type: body.connection_type,
      interface: body.interface,
      assigned_template_ids: body.assigned_template_ids ?? [],
      kitchen_sections: body.kitchen_sections ?? [],
      active: body.active !== false,
    });
    return sendSuccess(res, 'Printer created', created, 201);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const printer = await this.repository.findById(id);
    if (!printer) throw new NotFoundError('Printer not found');
    const body = req.body;
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.connection_type !== undefined) updateData.connection_type = body.connection_type;
    if (body.interface !== undefined) updateData.interface = body.interface;
    if (body.assigned_template_ids !== undefined)
      updateData.assigned_template_ids = body.assigned_template_ids;
    if (body.kitchen_sections !== undefined) updateData.kitchen_sections = body.kitchen_sections;
    if (body.active !== undefined) updateData.active = body.active;
    const updated = await this.repository.update(id, updateData);
    if (!updated) throw new NotFoundError('Printer not found');
    return sendSuccess(res, 'Printer updated', updated);
  });

  /** POST /printers/:id/test-print — queue a minimal test line to the printer */
  testPrint = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const printer = await this.repository.findById(id);
    if (!printer) throw new NotFoundError('Printer not found');

    const testLine = 'Test print - ' + new Date().toISOString() + '\n';
    const buffer = Buffer.from(ESC_INIT + '\n' + testLine, 'utf8');

    const printJobRepository = new PrintJobRepository();

    await printJobRepository.create({
      orderId: `TEST-${Date.now()}`,
      printerId: printer.id,
      maxRetries: printer.maxRetries ?? 1,
      renderedTemplates: [
        {
          templateId: 'TEST_PRINT',
          renderedContent: buffer.toString('base64'),
          autoCut: true,
        },
      ],
    });

    return sendSuccess(res, 'Test print queued successfully', { printerId: id });
  });
  /** GET /printers/scan — scan local network for printers */
  scanWiFi = asyncHandler(async (req: AuthRequest, res: Response) => {
    const printers = await scanForPrinters(9100, 1500);
    return sendSuccess(res, 'Scanned network for printers', printers);
  });
  /** GET /printers/scan-lan — scan local network for LAN printers */
  scanLAN = asyncHandler(async (req: AuthRequest, res: Response) => {
    const printers = await scanLAN(9100, 1500);
    return sendSuccess(res, 'Scanned network for LAN printers', printers);
  });

  /** GET /printers/scan-bluetooth — scan locally paired bluetooth devices */
  scanBluetooth = asyncHandler(async (req: AuthRequest, res: Response) => {
    const devices = await scanBluetooth();
    return sendSuccess(res, 'Scanned for Bluetooth devices', devices);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundError('Printer not found');
    return sendSuccess(res, 'Printer deleted');
  });
}
