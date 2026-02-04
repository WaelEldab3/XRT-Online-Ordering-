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
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
class ItemSizeController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business_id = req.user?.business_id || req.body.business_id || req.body.restaurant_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('restaurant_id is required');
            }
            const sizeData = {
                business_id: business_id,
                name: req.body.name,
                code: req.body.code,
                display_order: req.body.display_order,
                is_active: req.body.is_active,
            };
            const itemSize = await this.createItemSizeUseCase.execute(sizeData);
            return (0, response_1.sendSuccess)(res, 'Item size created successfully', itemSize, 201);
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // Use user's business_id when set, otherwise allow query param (e.g. admin sending business_id)
            const business_id = req.user?.business_id ||
                req.query.business_id ||
                undefined;
            const filters = {
                business_id: business_id || undefined,
                is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
            };
            const sizes = await this.getItemSizesUseCase.execute(filters);
            return (0, response_1.sendSuccess)(res, 'Item sizes retrieved successfully', sizes);
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            // TODO: Verify business ownership logic if strict
            // For now assuming ID lookup is enough or UseCase handles it
            const itemSize = await this.getItemSizeUseCase.execute(id);
            if (!itemSize) {
                return (0, response_1.sendError)(res, 'Item size not found', 404);
            }
            return (0, response_1.sendSuccess)(res, 'Item size retrieved successfully', itemSize);
        });
        this.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const updateData = {
                name: req.body.name,
                code: req.body.code,
                display_order: req.body.display_order,
                is_active: req.body.is_active,
            };
            // Remove undefined fields
            Object.keys(updateData).forEach((key) => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });
            const itemSize = await this.updateItemSizeUseCase.execute(id, updateData);
            return (0, response_1.sendSuccess)(res, 'Item size updated successfully', itemSize);
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.deleteItemSizeUseCase.execute(id);
            return (0, response_1.sendSuccess)(res, 'Item size deleted successfully', null, 200);
        });
        this.updateSortOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { items } = req.body;
            if (!items || !Array.isArray(items)) {
                throw new AppError_1.ValidationError('items array is required');
            }
            const repo = new ItemSizeRepository_1.ItemSizeRepository();
            await repo.updateSortOrder(items);
            return (0, response_1.sendSuccess)(res, 'Item size sort order updated successfully');
        });
        this.exportSizes = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business_id = req.user?.business_id;
            const filters = {
                business_id: business_id,
            };
            const result = await this.getItemSizesUseCase.execute(filters);
            const sizes = Array.isArray(result) ? result : [];
            // Convert to CSV
            const csvRows = [
                ['name', 'code', 'display_order', 'is_active'].join(','),
                ...sizes.map((size) => [
                    `"${(size.name || '').replace(/"/g, '""')}"`,
                    `"${(size.code || '').replace(/"/g, '""')}"`,
                    size.display_order || 0,
                    size.is_active,
                ].join(',')),
            ];
            const csvContent = csvRows.join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="sizes-export.csv"`);
            res.send(csvContent);
        });
        const itemSizeRepository = new ItemSizeRepository_1.ItemSizeRepository();
        this.createItemSizeUseCase = new CreateItemSizeUseCase_1.CreateItemSizeUseCase(itemSizeRepository);
        this.updateItemSizeUseCase = new UpdateItemSizeUseCase_1.UpdateItemSizeUseCase(itemSizeRepository);
        this.getItemSizesUseCase = new GetItemSizesUseCase_1.GetItemSizesUseCase(itemSizeRepository);
        this.getItemSizeUseCase = new GetItemSizeUseCase_1.GetItemSizeUseCase(itemSizeRepository);
        this.deleteItemSizeUseCase = new DeleteItemSizeUseCase_1.DeleteItemSizeUseCase(itemSizeRepository);
    }
}
exports.ItemSizeController = ItemSizeController;
