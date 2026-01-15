import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { CreateItemSizeUseCase } from '../../domain/usecases/item-sizes/CreateItemSizeUseCase';
import { UpdateItemSizeUseCase } from '../../domain/usecases/item-sizes/UpdateItemSizeUseCase';
import { GetItemSizesUseCase } from '../../domain/usecases/item-sizes/GetItemSizesUseCase';
import { GetItemSizeUseCase } from '../../domain/usecases/item-sizes/GetItemSizeUseCase';
import { DeleteItemSizeUseCase } from '../../domain/usecases/item-sizes/DeleteItemSizeUseCase';
import { ItemSizeRepository } from '../../infrastructure/repositories/ItemSizeRepository';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository';
import { CreateItemSizeDTO, UpdateItemSizeDTO, ItemSizeFilters } from '../../domain/entities/ItemSize';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError } from '../../shared/errors/AppError';
import { UserRole } from '../../shared/constants/roles';

export class ItemSizeController {
  private createItemSizeUseCase: CreateItemSizeUseCase;
  private updateItemSizeUseCase: UpdateItemSizeUseCase;
  private getItemSizesUseCase: GetItemSizesUseCase;
  private getItemSizeUseCase: GetItemSizeUseCase;
  private deleteItemSizeUseCase: DeleteItemSizeUseCase;

  constructor() {
    const itemSizeRepository = new ItemSizeRepository();
    const itemRepository = new ItemRepository();

    this.createItemSizeUseCase = new CreateItemSizeUseCase(itemSizeRepository, itemRepository);
    this.updateItemSizeUseCase = new UpdateItemSizeUseCase(itemSizeRepository);
    this.getItemSizesUseCase = new GetItemSizesUseCase(itemSizeRepository);
    this.getItemSizeUseCase = new GetItemSizeUseCase(itemSizeRepository);
    this.deleteItemSizeUseCase = new DeleteItemSizeUseCase(itemSizeRepository, itemRepository);
  }

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const business_id = req.user?.business_id || req.body.restaurant_id;

    if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ValidationError('restaurant_id is required');
    }

    const sizeData: CreateItemSizeDTO = {
      item_id: itemId,
      restaurant_id: business_id,
      name: req.body.name,
      code: req.body.code,
      price: req.body.price,
      display_order: req.body.display_order,
      is_active: req.body.is_active,
    };

    const itemSize = await this.createItemSizeUseCase.execute(sizeData);

    return sendSuccess(res, 'Item size created successfully', itemSize, 201);
  });

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const business_id = req.user?.business_id;

    const filters: ItemSizeFilters = {
      item_id: itemId,
      restaurant_id: business_id,
      is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
    };

    const sizes = await this.getItemSizesUseCase.execute(filters);

    return sendSuccess(res, 'Item sizes retrieved successfully', sizes);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { itemId, id } = req.params;

    const itemSize = await this.getItemSizeUseCase.execute(id, itemId);

    if (!itemSize) {
      return sendError(res, 'Item size not found', 404);
    }

    return sendSuccess(res, 'Item size retrieved successfully', itemSize);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { itemId, id } = req.params;

    const updateData: UpdateItemSizeDTO = {
      name: req.body.name,
      code: req.body.code,
      price: req.body.price,
      display_order: req.body.display_order,
      is_active: req.body.is_active,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof UpdateItemSizeDTO] === undefined) {
        delete updateData[key as keyof UpdateItemSizeDTO];
      }
    });

    const itemSize = await this.updateItemSizeUseCase.execute(id, itemId, updateData);

    return sendSuccess(res, 'Item size updated successfully', itemSize);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { itemId, id } = req.params;

    await this.deleteItemSizeUseCase.execute(id, itemId);

    return sendSuccess(res, 'Item size deleted successfully', null, 200);
  });
}
