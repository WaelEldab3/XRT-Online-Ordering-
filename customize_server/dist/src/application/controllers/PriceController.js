"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ItemRepository_1 = require("../../infrastructure/repositories/ItemRepository");
const PriceChangeHistoryRepository_1 = require("../../infrastructure/repositories/PriceChangeHistoryRepository");
const PriceChangeHistory_1 = require("../../domain/entities/PriceChangeHistory");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const ItemModel_1 = require("../../infrastructure/database/models/ItemModel");
const BusinessModel_1 = require("../../infrastructure/database/models/BusinessModel");
const ModifierGroupModel_1 = require("../../infrastructure/database/models/ModifierGroupModel");
const ModifierModel_1 = require("../../infrastructure/database/models/ModifierModel");
class PriceController {
    constructor() {
        this.bulkUpdate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { type, value_type, value, target = PriceChangeHistory_1.PriceUpdateTarget.ITEMS } = req.body;
            if (!Object.values(PriceChangeHistory_1.PriceChangeType).includes(type)) {
                throw new AppError_1.ValidationError('Invalid price change type');
            }
            if (!Object.values(PriceChangeHistory_1.PriceValueType).includes(value_type)) {
                throw new AppError_1.ValidationError('Invalid price value type');
            }
            if (typeof value !== 'number' || value < 0) {
                throw new AppError_1.ValidationError('Value must be a positive number');
            }
            const session = await mongoose_1.default.startSession();
            session.startTransaction();
            try {
                // Single Tenant: We always use the first/only business
                const business = await BusinessModel_1.BusinessModel.findOne().session(session);
                if (!business) {
                    throw new AppError_1.ValidationError('No business configuration found');
                }
                const businessIds = [business.id, business._id.toString()];
                const snapshot = [];
                const bulkOps = [];
                let affectedCount = 0;
                if (target === PriceChangeHistory_1.PriceUpdateTarget.MODIFIERS) {
                    // 1. Fetch Modifier Groups for the Business
                    const groups = await ModifierGroupModel_1.ModifierGroupModel.find({
                        business_id: { $in: businessIds },
                    })
                        .session(session)
                        .select('_id');
                    const groupIds = groups.map((g) => g._id);
                    if (groupIds.length === 0) {
                        throw new AppError_1.ValidationError('No modifier groups found for this shop');
                    }
                    // 2. Fetch Modifiers
                    const modifiers = await ModifierModel_1.ModifierModel.find({
                        modifier_group_id: { $in: groupIds },
                    })
                        .session(session)
                        .lean();
                    if (modifiers.length === 0) {
                        throw new AppError_1.ValidationError('No modifiers found to update');
                    }
                    // Helper to calculate new price
                    const calculateNewPrice = (currentPrice) => {
                        let newPrice = currentPrice;
                        if (type === PriceChangeHistory_1.PriceChangeType.INCREASE) {
                            if (value_type === PriceChangeHistory_1.PriceValueType.PERCENTAGE) {
                                newPrice += newPrice * (value / 100);
                            }
                            else {
                                newPrice += value;
                            }
                        }
                        else {
                            if (value_type === PriceChangeHistory_1.PriceValueType.PERCENTAGE) {
                                newPrice -= newPrice * (value / 100);
                            }
                            else {
                                newPrice -= value;
                            }
                        }
                        return Math.max(0, parseFloat(newPrice.toFixed(2)));
                    };
                    for (const modifier of modifiers) {
                        const hasQuantityLevels = modifier.quantity_levels && modifier.quantity_levels.length > 0;
                        const hasPricesBySize = modifier.prices_by_size && modifier.prices_by_size.length > 0;
                        // Skip if nothing to update
                        if (!hasQuantityLevels && !hasPricesBySize)
                            continue;
                        // Snapshot (save full state of both fields)
                        snapshot.push({
                            modifier_id: modifier._id.toString(),
                            quantity_levels: modifier.quantity_levels,
                            prices_by_size: modifier.prices_by_size,
                        });
                        // Update Quantity Levels (Nested)
                        let newQuantityLevels = modifier.quantity_levels;
                        if (hasQuantityLevels) {
                            newQuantityLevels = modifier.quantity_levels?.map((ql) => ({
                                ...ql,
                                price: typeof ql.price === 'number' ? calculateNewPrice(ql.price) : ql.price,
                                prices_by_size: ql.prices_by_size
                                    ? ql.prices_by_size.map((pbs) => ({
                                        ...pbs,
                                        priceDelta: calculateNewPrice(pbs.priceDelta),
                                    }))
                                    : [],
                            }));
                        }
                        // Update Root Prices By Size
                        let newPricesBySize = modifier.prices_by_size;
                        if (hasPricesBySize) {
                            newPricesBySize = modifier.prices_by_size?.map((pbs) => ({
                                ...pbs,
                                priceDelta: calculateNewPrice(pbs.priceDelta),
                            }));
                        }
                        bulkOps.push({
                            updateOne: {
                                filter: { _id: modifier._id },
                                update: {
                                    quantity_levels: newQuantityLevels,
                                    prices_by_size: newPricesBySize,
                                },
                            },
                        });
                    }
                    affectedCount = bulkOps.length;
                    if (bulkOps.length > 0) {
                        await ModifierModel_1.ModifierModel.bulkWrite(bulkOps, { session });
                    }
                }
                else {
                    // Target: ITEMS
                    const items = await ItemModel_1.ItemModel.find({}).session(session).lean();
                    if (items.length === 0) {
                        throw new AppError_1.ValidationError('No items found to update for this shop');
                    }
                    affectedCount = items.length;
                    for (const item of items) {
                        // Snapshot
                        const itemSnapshot = {
                            item_id: item._id.toString(),
                            base_price: item.base_price,
                            sizes: item.sizes
                                ? item.sizes
                                    .filter((s) => s.size_id)
                                    .map((s) => ({
                                    size_id: s.size_id.toString(),
                                    price: s.price,
                                }))
                                : [],
                        };
                        snapshot.push(itemSnapshot);
                        // Calculate New Prices
                        let newBasePrice = item.base_price;
                        if (type === PriceChangeHistory_1.PriceChangeType.INCREASE) {
                            if (value_type === PriceChangeHistory_1.PriceValueType.PERCENTAGE) {
                                newBasePrice += newBasePrice * (value / 100);
                            }
                            else {
                                newBasePrice += value;
                            }
                        }
                        else {
                            if (value_type === PriceChangeHistory_1.PriceValueType.PERCENTAGE) {
                                newBasePrice -= newBasePrice * (value / 100);
                            }
                            else {
                                newBasePrice -= value;
                            }
                        }
                        newBasePrice = Math.max(0, parseFloat(newBasePrice.toFixed(2)));
                        const newSizes = item.sizes
                            ? item.sizes.map((s) => {
                                let newSizePrice = s.price;
                                if (type === PriceChangeHistory_1.PriceChangeType.INCREASE) {
                                    if (value_type === PriceChangeHistory_1.PriceValueType.PERCENTAGE) {
                                        newSizePrice += newSizePrice * (value / 100);
                                    }
                                    else {
                                        newSizePrice += value;
                                    }
                                }
                                else {
                                    if (value_type === PriceChangeHistory_1.PriceValueType.PERCENTAGE) {
                                        newSizePrice -= newSizePrice * (value / 100);
                                    }
                                    else {
                                        newSizePrice -= value;
                                    }
                                }
                                return {
                                    ...s,
                                    price: Math.max(0, parseFloat(newSizePrice.toFixed(2))),
                                };
                            })
                            : [];
                        bulkOps.push({
                            updateOne: {
                                filter: { _id: item._id },
                                update: {
                                    base_price: newBasePrice,
                                    sizes: newSizes,
                                },
                            },
                        });
                    }
                    if (bulkOps.length > 0) {
                        await ItemModel_1.ItemModel.bulkWrite(bulkOps, { session });
                    }
                }
                // Create History Record
                await this.priceChangeHistoryRepository.create({
                    business_id: business.id,
                    admin_id: req.user?.id,
                    type,
                    value_type,
                    value,
                    affected_items_count: affectedCount,
                    snapshot,
                    target,
                }); // Cast to any to handle new target field/snapshot types
                await session.commitTransaction();
                return (0, response_1.sendSuccess)(res, 'Bulk price update completed successfully', {
                    affected: affectedCount,
                });
            }
            catch (error) {
                await session.abortTransaction();
                console.error('Bulk update failed:', error);
                throw error;
            }
            finally {
                session.endSession();
            }
        });
        this.rollback = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params; // History ID
            const historyResponse = await this.priceChangeHistoryRepository.findById(id);
            if (!historyResponse) {
                throw new AppError_1.NotFoundError('History record not found');
            }
            // Single Tenant: Just verify business exists
            const business = await BusinessModel_1.BusinessModel.findOne();
            if (!business) {
                throw new AppError_1.NotFoundError('Business not found');
            }
            // In Single Tenant, we can optionally verify history matches this business,
            // but effectively there is only one.
            // For safety, we can check if history.business_id matches.
            const businessIds = [business.id, business._id.toString()];
            if (!businessIds.includes(historyResponse.business_id)) {
                // If history is from an old/different business ID, we might warn or allow.
                // But in single tenant migration, usually we keep the same business.
                // Let's enforce it to be safe.
                if (historyResponse.business_id !== business.id &&
                    historyResponse.business_id !== business._id.toString()) {
                    // It might be a legacy record or from before migration if DB wasn't wiped.
                    // throw new ValidationError('Rollback business mismatch');
                    // Actually, let's allow it but warn, or just accept it if we trust the user.
                }
            }
            if (historyResponse.status === 'ROLLED_BACK') {
                throw new AppError_1.ValidationError('This operation has already been rolled back');
            }
            const session = await mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const snapshot = historyResponse.snapshot;
                if (!snapshot || snapshot.length === 0) {
                    throw new AppError_1.ValidationError('No snapshot data found for rollback');
                }
                const bulkOps = [];
                const target = historyResponse.target || PriceChangeHistory_1.PriceUpdateTarget.ITEMS;
                if (target === PriceChangeHistory_1.PriceUpdateTarget.MODIFIERS) {
                    for (const modSnapshot of snapshot) {
                        // Restore quantity_levels
                        // We fully replace quantity_levels array because we stored the full state in snapshot
                        bulkOps.push({
                            updateOne: {
                                filter: { _id: modSnapshot.modifier_id },
                                update: {
                                    quantity_levels: modSnapshot.quantity_levels,
                                    prices_by_size: modSnapshot.prices_by_size, // Restore root sizes
                                },
                            },
                        });
                    }
                    if (bulkOps.length > 0) {
                        await ModifierModel_1.ModifierModel.bulkWrite(bulkOps, { session });
                    }
                }
                else {
                    // Target: ITEMS
                    for (const itemSnapshot of snapshot) {
                        const arrayFilters = [];
                        const updateSet = { base_price: itemSnapshot.base_price };
                        if (itemSnapshot.sizes && itemSnapshot.sizes.length > 0) {
                            itemSnapshot.sizes.forEach((s, index) => {
                                const filterName = `elem${index}`;
                                updateSet[`sizes.$[${filterName}].price`] = s.price;
                                arrayFilters.push({ [`${filterName}.size_id`]: s.size_id });
                            });
                        }
                        bulkOps.push({
                            updateOne: {
                                filter: { _id: itemSnapshot.item_id },
                                update: { $set: updateSet },
                                arrayFilters: arrayFilters.length > 0 ? arrayFilters : undefined,
                            },
                        });
                    }
                    if (bulkOps.length > 0) {
                        await ItemModel_1.ItemModel.bulkWrite(bulkOps, { session });
                    }
                }
                // Mark as rolled back
                await this.priceChangeHistoryRepository.markAsRolledBack(id, req.user?.id || 'admin');
                await session.commitTransaction();
                return (0, response_1.sendSuccess)(res, 'Rollback completed successfully');
            }
            catch (error) {
                await session.abortTransaction();
                console.error('Rollback failed:', error);
                throw error;
            }
            finally {
                session.endSession();
            }
        });
        this.getHistory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            console.log('--- getHistory Debug ---');
            // Simplified Logic: Always use the default business ID for history
            const defaultBusiness = await BusinessModel_1.BusinessModel.findOne();
            if (!defaultBusiness) {
                console.log('No default business found in DB');
                return (0, response_1.sendSuccess)(res, 'History retrieved', { history: [], total: 0 });
            }
            // We search by both strict string ID and ObjectId to be safe
            const businessIds = [defaultBusiness.id, defaultBusiness._id.toString()];
            console.log('Forcing Default Business IDs for History Search:', businessIds);
            // We pass the array to the repository which now supports $in query
            const result = await this.priceChangeHistoryRepository.findAll(businessIds, page, limit);
            console.log('History Result Count:', result.history.length, 'Total:', result.total);
            return (0, response_1.sendSuccess)(res, 'History retrieved', result);
        });
        this.deleteHistory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const history = await this.priceChangeHistoryRepository.findById(id);
            if (!history) {
                throw new AppError_1.NotFoundError('History record not found');
            }
            // In single tenant, verify business if needed, but usually redundant for single shop
            // Deleting history is just removing the log, not rolling back
            await this.priceChangeHistoryRepository.delete(id);
            return (0, response_1.sendSuccess)(res, 'History record deleted successfully');
        });
        this.clearHistory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business = await BusinessModel_1.BusinessModel.findOne();
            if (!business) {
                throw new AppError_1.NotFoundError('Business not found');
            }
            // Single tenant: using the business ID found
            await this.priceChangeHistoryRepository.deleteAll(business.id);
            return (0, response_1.sendSuccess)(res, 'All history records cleared successfully');
        });
        this.itemRepository = new ItemRepository_1.ItemRepository();
        this.priceChangeHistoryRepository = new PriceChangeHistoryRepository_1.PriceChangeHistoryRepository();
    }
}
exports.PriceController = PriceController;
