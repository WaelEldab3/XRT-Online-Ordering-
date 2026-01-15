"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSizeController = void 0;
const response_1 = require("../../shared/utils/response");
const CreateItemSizeUseCase_1 = require("../../domain/usecases/item-sizes/CreateItemSizeUseCase");
const UpdateItemSizeUseCase_1 = require("../../domain/usecases/item-sizes/UpdateItemSizeUseCase");
const GetItemSizesUseCase_1 = require("../../domain/usecases/item-sizes/GetItemSizesUseCase");
const GetItemSizeUseCase_1 = require("../../domain/usecases/item-sizes/GetItemSizeUseCase");
const DeleteItemSizeUseCase_1 = require("../../domain/usecases/item-sizes/DeleteItemSizeUseCase");
const ItemSizeRepository_1 = require("../../infrastructure/repositories/ItemSizeRepository");
const ItemRepository_1 = require("../../infrastructure/repositories/ItemRepository");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
class ItemSizeController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { itemId } = req.params;
            const business_id = req.user?.business_id || req.body.restaurant_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('restaurant_id is required');
            }
            const sizeData = {
                item_id: itemId,
                restaurant_id: business_id,
                name: req.body.name,
                code: req.body.code,
                price: req.body.price,
                display_order: req.body.display_order,
                is_active: req.body.is_active,
            };
            const itemSize = await this.createItemSizeUseCase.execute(sizeData);
            return (0, response_1.sendSuccess)(res, 'Item size created successfully', itemSize, 201);
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { itemId } = req.params;
            const business_id = req.user?.business_id;
            const filters = {
                item_id: itemId,
                restaurant_id: business_id,
                is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
            };
            const sizes = await this.getItemSizesUseCase.execute(filters);
            return (0, response_1.sendSuccess)(res, 'Item sizes retrieved successfully', sizes);
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { itemId, id } = req.params;
            const itemSize = await this.getItemSizeUseCase.execute(id, itemId);
            if (!itemSize) {
                return (0, response_1.sendError)(res, 'Item size not found', 404);
            }
            return (0, response_1.sendSuccess)(res, 'Item size retrieved successfully', itemSize);
        });
        this.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { itemId, id } = req.params;
            const updateData = {
                name: req.body.name,
                code: req.body.code,
                price: req.body.price,
                display_order: req.body.display_order,
                is_active: req.body.is_active,
            };
            // Remove undefined fields
            Object.keys(updateData).forEach((key) => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });
            const itemSize = await this.updateItemSizeUseCase.execute(id, itemId, updateData);
            return (0, response_1.sendSuccess)(res, 'Item size updated successfully', itemSize);
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { itemId, id } = req.params;
            await this.deleteItemSizeUseCase.execute(id, itemId);
            return (0, response_1.sendSuccess)(res, 'Item size deleted successfully', null, 200);
        });
        const itemSizeRepository = new ItemSizeRepository_1.ItemSizeRepository();
        const itemRepository = new ItemRepository_1.ItemRepository();
        this.createItemSizeUseCase = new CreateItemSizeUseCase_1.CreateItemSizeUseCase(itemSizeRepository, itemRepository);
        this.updateItemSizeUseCase = new UpdateItemSizeUseCase_1.UpdateItemSizeUseCase(itemSizeRepository);
        this.getItemSizesUseCase = new GetItemSizesUseCase_1.GetItemSizesUseCase(itemSizeRepository);
        this.getItemSizeUseCase = new GetItemSizeUseCase_1.GetItemSizeUseCase(itemSizeRepository);
        this.deleteItemSizeUseCase = new DeleteItemSizeUseCase_1.DeleteItemSizeUseCase(itemSizeRepository, itemRepository);
    }
}
exports.ItemSizeController = ItemSizeController;
