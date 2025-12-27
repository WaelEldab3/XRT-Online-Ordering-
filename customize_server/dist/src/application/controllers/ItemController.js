"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemController = void 0;
const GetItemUseCase_1 = require("../../domain/usecases/items/GetItemUseCase");
const CreateItemUseCase_1 = require("../../domain/usecases/items/CreateItemUseCase");
const GetItemsUseCase_1 = require("../../domain/usecases/items/GetItemsUseCase");
const UpdateItemUseCase_1 = require("../../domain/usecases/items/UpdateItemUseCase");
const DeleteItemUseCase_1 = require("../../domain/usecases/items/DeleteItemUseCase");
const ItemRepository_1 = require("../../infrastructure/repositories/ItemRepository");
const CloudinaryStorage_1 = require("../../infrastructure/cloudinary/CloudinaryStorage");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
class ItemController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { name, description, sort_order, is_active, base_price, category_id, image, image_public_id, is_available, is_signature, max_per_order, } = req.body;
            const business_id = req.user?.business_id || req.body.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            if (!category_id) {
                throw new AppError_1.ValidationError('category_id is required');
            }
            try {
                const item = await this.createItemUseCase.execute({
                    business_id: business_id,
                    name,
                    description,
                    sort_order: sort_order ? parseInt(sort_order) : 0,
                    is_active: is_active === 'true' || is_active === true,
                    base_price: base_price ? parseFloat(base_price) : 0,
                    category_id,
                    image,
                    image_public_id,
                    is_available: is_available === 'true' || is_available === true,
                    is_signature: is_signature === 'true' || is_signature === true,
                    max_per_order: max_per_order ? parseInt(max_per_order) : undefined,
                }, req.files);
                return (0, response_1.sendSuccess)(res, 'Item created successfully', item, 201);
            }
            catch (error) {
                console.error('❌ Error in ItemController.create:', error);
                throw error;
            }
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const filters = {
                is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
                category_id: req.query.category_id,
                is_available: req.query.is_available ? req.query.is_available === 'true' : undefined,
                is_signature: req.query.is_signature ? req.query.is_signature === 'true' : undefined,
                search: req.query.search,
            };
            if (business_id) {
                filters.business_id = business_id;
            }
            const items = await this.getItemsUseCase.execute(filters);
            return (0, response_1.sendSuccess)(res, 'Items retrieved successfully', items);
        });
        this.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { name, description, sort_order, is_active, base_price, category_id, image, image_public_id, is_available, is_signature, max_per_order, } = req.body;
            const business_id = req.user?.business_id || req.body.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const item = await this.updateItemUseCase.execute(id, business_id, {
                name,
                description,
                sort_order: sort_order ? parseInt(sort_order) : undefined,
                is_active: is_active === 'true' || is_active === true,
                base_price: base_price ? parseFloat(base_price) : undefined,
                category_id,
                image,
                image_public_id,
                is_available: is_available === 'true' || is_available === true,
                is_signature: is_signature === 'true' || is_signature === true,
                max_per_order: max_per_order ? parseInt(max_per_order) : undefined,
            }, req.files);
            return (0, response_1.sendSuccess)(res, 'Item updated successfully', item);
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            let business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            if (!business_id && req.user?.role === roles_1.UserRole.SUPER_ADMIN) {
                business_id = undefined;
            }
            const item = await this.getItemUseCase.execute(id, business_id);
            return (0, response_1.sendSuccess)(res, 'Item retrieved successfully', item);
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            await this.deleteItemUseCase.execute(id, business_id);
            return (0, response_1.sendSuccess)(res, 'Item deleted successfully');
        });
        const itemRepository = new ItemRepository_1.ItemRepository();
        const imageStorage = new CloudinaryStorage_1.CloudinaryStorage();
        this.createItemUseCase = new CreateItemUseCase_1.CreateItemUseCase(itemRepository, imageStorage);
        this.getItemsUseCase = new GetItemsUseCase_1.GetItemsUseCase(itemRepository);
        this.updateItemUseCase = new UpdateItemUseCase_1.UpdateItemUseCase(itemRepository, imageStorage);
        this.deleteItemUseCase = new DeleteItemUseCase_1.DeleteItemUseCase(itemRepository, imageStorage);
        this.getItemUseCase = new GetItemUseCase_1.GetItemUseCase(itemRepository);
    }
}
exports.ItemController = ItemController;
