"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionController = void 0;
const GetPermissionsUseCase_1 = require("../../domain/usecases/permissions/GetPermissionsUseCase");
const PermissionRepository_1 = require("../../infrastructure/repositories/PermissionRepository");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
class PermissionController {
    constructor() {
        /**
         * Get all permissions
         * GET /api/permissions
         */
        this.getAllPermissions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { module, isActive, search } = req.query;
            const permissions = await this.getPermissionsUseCase.execute({
                module: module,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                search: search,
            });
            return (0, response_1.sendSuccess)(res, 'Permissions retrieved successfully', {
                permissions,
                total: permissions.length,
            });
        });
        /**
         * Get permissions grouped by module
         * GET /api/permissions/grouped
         */
        this.getGroupedPermissions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const grouped = await this.getPermissionsUseCase.executeGrouped();
            const modules = await this.getPermissionsUseCase.getModules();
            return (0, response_1.sendSuccess)(res, 'Permissions retrieved successfully', {
                permissionsByModule: grouped,
                modules,
            });
        });
        /**
         * Get a single permission by ID
         * GET /api/permissions/:id
         */
        this.getPermission = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const permission = await this.permissionRepository.findById(req.params.id);
            if (!permission) {
                throw new AppError_1.NotFoundError('Permission not found');
            }
            return (0, response_1.sendSuccess)(res, 'Permission retrieved successfully', { permission });
        });
        /**
         * Update a permission (enable/disable)
         * PATCH /api/permissions/:id
         * Only super_admin can do this
         */
        this.updatePermission = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // Only super_admin can update permissions
            if (req.user?.role !== roles_1.SYSTEM_ROLES.SUPER_ADMIN) {
                throw new AppError_1.ForbiddenError('Only super_admin can update permissions');
            }
            const { id } = req.params;
            const { isActive, description } = req.body;
            const existingPermission = await this.permissionRepository.findById(id);
            if (!existingPermission) {
                throw new AppError_1.NotFoundError('Permission not found');
            }
            const updated = await this.permissionRepository.update(id, {
                isActive,
                description,
            });
            return (0, response_1.sendSuccess)(res, 'Permission updated successfully', { permission: updated });
        });
        /**
         * Get all available modules
         * GET /api/permissions/modules
         */
        this.getModules = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const modules = await this.getPermissionsUseCase.getModules();
            return (0, response_1.sendSuccess)(res, 'Modules retrieved successfully', { modules });
        });
        this.permissionRepository = new PermissionRepository_1.PermissionRepository();
        this.getPermissionsUseCase = new GetPermissionsUseCase_1.GetPermissionsUseCase(this.permissionRepository);
    }
}
exports.PermissionController = PermissionController;
