import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { PrintTemplateRepository } from '../../infrastructure/repositories/PrintTemplateRepository';
import { getPrintableFieldsStructured } from '../../shared/constants/printableFields';
import { validateLayout } from '../../services/printer/layoutValidation';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError, NotFoundError } from '../../shared/errors/AppError';

export class PrintTemplateController {
  private repository: PrintTemplateRepository;

  constructor() {
    this.repository = new PrintTemplateRepository();
  }

  /** GET /printable-fields — structured list for Template Builder */
  getPrintableFields = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const structured = getPrintableFieldsStructured();
    return sendSuccess(res, 'Printable fields retrieved', structured);
  });

  /** GET /templates — list templates (optional: type, active) */
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const type = req.query.type as string | undefined;
    const active = req.query.active as string | undefined;

    const filters: any = {};
    if (type) filters.type = type;
    if (active !== undefined) filters.active = active === 'true';

    const templates = await this.repository.findAll(filters);
    return sendSuccess(res, 'Templates retrieved', templates);
  });

  /** GET /templates/:id */
  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const template = await this.repository.findById(id);
    if (!template) throw new NotFoundError('Template not found');
    return sendSuccess(res, 'Template retrieved', template);
  });

  /** POST /templates — create with layout validation */
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const body = req.body;
    const layout = body.layout;
    if (!layout || typeof layout !== 'object') {
      throw new ValidationError('layout is required and must be an object');
    }

    const { valid, errors } = validateLayout(layout);
    if (!valid) {
      throw new ValidationError(`Invalid layout: ${errors.join('; ')}`);
    }

    const created = await this.repository.create({
      name: body.name,
      type: body.type,
      layout: body.layout,
      paper_width: body.paper_width || '80mm',
      active: body.active !== false,
      created_by: (req.user as any)?.id ?? null,
    });
    return sendSuccess(res, 'Template created', created, 201);
  });

  /** PUT /templates/:id — update with layout validation if layout provided */
  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const body = req.body;

    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Template not found');

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.paper_width !== undefined) updateData.paper_width = body.paper_width;
    if (body.active !== undefined) updateData.active = body.active;

    if (body.layout !== undefined) {
      const { valid, errors } = validateLayout(body.layout);
      if (!valid) throw new ValidationError(`Invalid layout: ${errors.join('; ')}`);
      updateData.layout = body.layout;
    }

    const updated = await this.repository.update(id, updateData);
    if (!updated) throw new NotFoundError('Template not found');
    return sendSuccess(res, 'Template updated', updated);
  });

  /** DELETE /templates/:id */
  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Template not found');
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundError('Template not found');
    return sendSuccess(res, 'Template deleted', { deleted: true });
  });
}
