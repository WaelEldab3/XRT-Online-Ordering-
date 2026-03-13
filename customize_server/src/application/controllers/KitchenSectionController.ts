import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth'; // Adjust path if needed
import { KitchenSectionRepository } from '../../infrastructure/repositories/KitchenSectionRepository';
import { GetKitchenSectionsUseCase } from '../../domain/usecases/kitchen-sections/GetKitchenSectionsUseCase';
import { CreateKitchenSectionUseCase } from '../../domain/usecases/kitchen-sections/CreateKitchenSectionUseCase';
import { UpdateKitchenSectionUseCase } from '../../domain/usecases/kitchen-sections/UpdateKitchenSectionUseCase';
import { DeleteKitchenSectionUseCase } from '../../domain/usecases/kitchen-sections/DeleteKitchenSectionUseCase';
import { GetKitchenSectionByIdUseCase } from '../../domain/usecases/kitchen-sections/GetKitchenSectionByIdUseCase';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError } from '../../shared/errors/AppError';
import { UserRole } from '../../shared/constants/roles';

export class KitchenSectionController {
  private getKitchenSectionsUseCase: GetKitchenSectionsUseCase;
  private createKitchenSectionUseCase: CreateKitchenSectionUseCase;
  private updateKitchenSectionUseCase: UpdateKitchenSectionUseCase;
  private deleteKitchenSectionUseCase: DeleteKitchenSectionUseCase;
  private getKitchenSectionByIdUseCase: GetKitchenSectionByIdUseCase;

  constructor() {
    const kitchenSectionRepository = new KitchenSectionRepository();
    this.getKitchenSectionsUseCase = new GetKitchenSectionsUseCase(kitchenSectionRepository);
    this.createKitchenSectionUseCase = new CreateKitchenSectionUseCase(kitchenSectionRepository);
    this.updateKitchenSectionUseCase = new UpdateKitchenSectionUseCase(kitchenSectionRepository);
    this.deleteKitchenSectionUseCase = new DeleteKitchenSectionUseCase(kitchenSectionRepository);
    this.getKitchenSectionByIdUseCase = new GetKitchenSectionByIdUseCase(kitchenSectionRepository);
  }

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business_id = req.user?.business_id || req.query.business_id || 'default';

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    // Allow looking up by specific business_id if provided, otherwise fail or restricted?
    // Using cast for simplicity as repository handles string
    const sections = await this.getKitchenSectionsUseCase.execute(business_id as string);

    return sendSuccess(res, 'Kitchen sections retrieved successfully', sections);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const section = await this.getKitchenSectionByIdUseCase.execute(id);
    return sendSuccess(res, 'Kitchen section retrieved', section);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business_id = req.user?.business_id || req.body.business_id || 'default';
    const payload = {
      ...req.body,
      business_id,
    };
    const section = await this.createKitchenSectionUseCase.execute(payload);
    return sendSuccess(res, 'Kitchen section created', section, 201);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const section = await this.updateKitchenSectionUseCase.execute(id, req.body);
    return sendSuccess(res, 'Kitchen section updated', section);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    await this.deleteKitchenSectionUseCase.execute(id);
    return sendSuccess(res, 'Kitchen section deleted carefully', null);
  });
}
