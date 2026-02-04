"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const sync_1 = require("csv-parse/sync");
const GetCategoryByIdUseCase_1 = require("../../domain/usecases/categories/GetCategoryByIdUseCase");
const CreateCategoryUseCase_1 = require("../../domain/usecases/categories/CreateCategoryUseCase");
const GetCategoriesUseCase_1 = require("../../domain/usecases/categories/GetCategoriesUseCase");
const UpdateCategoryUseCase_1 = require("../../domain/usecases/categories/UpdateCategoryUseCase");
const DeleteCategoryUseCase_1 = require("../../domain/usecases/categories/DeleteCategoryUseCase");
const CategoryRepository_1 = require("../../infrastructure/repositories/CategoryRepository");
const ItemRepository_1 = require("../../infrastructure/repositories/ItemRepository");
const KitchenSectionRepository_1 = require("../../infrastructure/repositories/KitchenSectionRepository");
const CloudinaryStorage_1 = require("../../infrastructure/cloudinary/CloudinaryStorage");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
class CategoryController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { name, description, details, kitchen_section_id, sort_order, is_active, image, image_public_id, icon, icon_public_id, language, modifier_groups, } = req.body;
            const business_id = req.user?.business_id || req.body.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            // Parse modifier_groups if it's a string (common in form data)
            let parsedModifierGroups = undefined;
            if (modifier_groups !== undefined) {
                try {
                    parsedModifierGroups =
                        typeof modifier_groups === 'string' ? JSON.parse(modifier_groups) : modifier_groups;
                }
                catch (error) {
                    throw new AppError_1.ValidationError('Invalid modifier_groups format. Expected JSON array.');
                }
            }
            try {
                const category = await this.createCategoryUseCase.execute({
                    business_id: business_id,
                    name,
                    description: description || details,
                    kitchen_section_id,
                    sort_order: sort_order ? parseInt(sort_order) : 0,
                    is_active: is_active === 'true' || is_active === true,
                    image,
                    image_public_id,
                    icon,
                    icon_public_id,
                    language,
                    modifier_groups: parsedModifierGroups,
                    apply_modifier_groups_to_items: req.body.apply_modifier_groups_to_items === 'true' ||
                        req.body.apply_modifier_groups_to_items === true,
                }, req.files);
                return (0, response_1.sendSuccess)(res, 'Category created successfully', category, 201);
            }
            catch (error) {
                console.error('❌ Error in CategoryController.create:', error);
                throw error;
            }
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business_id = req.user?.business_id || req.query.business_id;
            // For super admins, allow getting all categories if no business_id is provided
            // For other users, business_id is required
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const filters = {
                is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
                kitchen_section_id: req.query.kitchen_section_id,
            };
            // Only add business_id filter if it's provided
            if (business_id) {
                filters.business_id = business_id;
            }
            const categories = await this.getCategoriesUseCase.execute(filters);
            return (0, response_1.sendSuccess)(res, 'Categories retrieved successfully', categories);
        });
        this.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { name, description, details, kitchen_section_id, sort_order, is_active, image, image_public_id, icon, icon_public_id, language, modifier_groups, delete_icon, // Extract flag
             } = req.body;
            console.log('--- UPDATE CATEGORY REQUEST ---');
            console.log('Payload Body Keys:', Object.keys(req.body));
            console.log('Files:', req.files);
            console.log('Modifier Groups (Raw):', modifier_groups);
            // @ts-ignore
            console.log('Apply to Items Flag (Raw):', req.body.apply_modifier_groups_to_items);
            console.log('-------------------------------');
            const business_id = req.user?.business_id || req.body.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            // Parse modifier_groups if it's a string (common in form data)
            let parsedModifierGroups = undefined;
            if (modifier_groups !== undefined) {
                try {
                    parsedModifierGroups =
                        typeof modifier_groups === 'string' ? JSON.parse(modifier_groups) : modifier_groups;
                }
                catch (error) {
                    throw new AppError_1.ValidationError('Invalid modifier_groups format. Expected JSON array.');
                }
            }
            const category = await this.updateCategoryUseCase.execute(id, business_id, {
                name,
                description: description || details,
                kitchen_section_id,
                ...(sort_order !== undefined && { sort_order: Number(sort_order) }),
                is_active: is_active === 'true' || is_active === true,
                image,
                image_public_id,
                icon,
                icon_public_id,
                language,
                modifier_groups: parsedModifierGroups,
                apply_modifier_groups_to_items: req.body.apply_modifier_groups_to_items === 'true' ||
                    req.body.apply_modifier_groups_to_items === true,
                delete_icon: delete_icon === 'true' || delete_icon === true,
            }, req.files);
            return (0, response_1.sendSuccess)(res, 'Category updated successfully', category);
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            let business_id = req.user?.business_id || req.query.business_id;
            // For super admins, if no business_id, they can get any category
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            if (!business_id && req.user?.role === roles_1.UserRole.SUPER_ADMIN) {
                business_id = undefined;
            }
            const category = await this.getCategoryByIdUseCase.execute(id, business_id);
            return (0, response_1.sendSuccess)(res, 'Category retrieved successfully', category);
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            await this.deleteCategoryUseCase.execute(id, business_id);
            return (0, response_1.sendSuccess)(res, 'Category deleted successfully');
        });
        this.updateSortOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { items } = req.body;
            if (!items || !Array.isArray(items)) {
                throw new AppError_1.ValidationError('items array is required');
            }
            const repo = new CategoryRepository_1.CategoryRepository();
            await repo.updateSortOrder(items);
            return (0, response_1.sendSuccess)(res, 'Category sort order updated successfully');
        });
        this.exportCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const filters = {
                is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
                kitchen_section_id: req.query.kitchen_section_id,
            };
            if (business_id) {
                filters.business_id = business_id;
            }
            // Use default limit of 1000 for export to get all/most categories
            // Or we should modify GetCategoriesUseCase to accept 'limit: -1' or similar for no limit.
            // For now, let's assume pagination and just get a large number.
            filters.limit = 1000;
            filters.page = 1;
            const result = await this.getCategoriesUseCase.execute(filters);
            const categories = result.data || result; // Handle both paginated and non-paginated responses
            // Convert to CSV
            const csvRows = [
                ['name', 'description', 'is_active', 'sort_order'].join(','),
                ...categories.map((cat) => [
                    `"${(cat.name || '').replace(/"/g, '""')}"`,
                    `"${(cat.description || '').replace(/"/g, '""')}"`,
                    cat.is_active,
                    cat.sort_order,
                ].join(',')),
            ];
            const csvContent = csvRows.join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="categories-export.csv"`);
            res.send(csvContent);
        });
        this.importCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.file) {
                throw new AppError_1.ValidationError('CSV file is required');
            }
            const business_id = req.user?.business_id || req.body.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const csvContent = req.file.buffer.toString('utf-8');
            const records = (0, sync_1.parse)(csvContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });
            const results = {
                created: 0,
                updated: 0,
                errors: [],
            };
            // Need to get all categories to check for existence/updates efficiently
            const existingResult = await this.getCategoriesUseCase.execute({
                business_id: business_id,
                limit: 1000,
                page: 1,
            });
            const existingCategories = existingResult.data || existingResult;
            for (const record of records) {
                try {
                    if (!record.name) {
                        results.errors.push(`Skipping record with missing name: ${JSON.stringify(record)}`);
                        continue;
                    }
                    const categoryData = {
                        business_id: business_id,
                        name: record.name,
                        description: record.description,
                        is_active: record.is_active === 'true' || record.is_active === true || record.is_active === '1',
                        sort_order: parseInt(record.sort_order || '0'),
                    };
                    const existingCategory = existingCategories.find((c) => c.name.toLowerCase() === record.name.toLowerCase());
                    if (existingCategory) {
                        // Update
                        await this.updateCategoryUseCase.execute(existingCategory.id, business_id, categoryData, {} // No files for simpler import
                        );
                        results.updated++;
                    }
                    else {
                        // Create
                        await this.createCategoryUseCase.execute(categoryData, {} // No files
                        );
                        results.created++;
                    }
                }
                catch (error) {
                    results.errors.push(`Error processing ${record.name}: ${error.message}`);
                }
            }
            return (0, response_1.sendSuccess)(res, 'Import completed', results);
        });
        const categoryRepository = new CategoryRepository_1.CategoryRepository();
        const itemRepository = new ItemRepository_1.ItemRepository();
        const imageStorage = new CloudinaryStorage_1.CloudinaryStorage();
        this.kitchenSectionRepository = new KitchenSectionRepository_1.KitchenSectionRepository();
        this.createCategoryUseCase = new CreateCategoryUseCase_1.CreateCategoryUseCase(categoryRepository, imageStorage);
        this.getCategoriesUseCase = new GetCategoriesUseCase_1.GetCategoriesUseCase(categoryRepository);
        this.updateCategoryUseCase = new UpdateCategoryUseCase_1.UpdateCategoryUseCase(categoryRepository, imageStorage, itemRepository);
        this.deleteCategoryUseCase = new DeleteCategoryUseCase_1.DeleteCategoryUseCase(categoryRepository, imageStorage);
        this.getCategoryByIdUseCase = new GetCategoryByIdUseCase_1.GetCategoryByIdUseCase(categoryRepository);
    }
}
exports.CategoryController = CategoryController;
