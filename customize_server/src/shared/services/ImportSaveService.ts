import mongoose from 'mongoose';
import { ParsedImportData } from '../../domain/entities/ImportSession';
import { IItemRepository } from '../../domain/repositories/IItemRepository';
import { IItemSizeRepository } from '../../domain/repositories/IItemSizeRepository';
import { IModifierGroupRepository } from '../../domain/repositories/IModifierGroupRepository';
import { IModifierRepository } from '../../domain/repositories/IModifierRepository';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { CreateItemDTO } from '../../domain/entities/Item';
import { CreateItemSizeDTO } from '../../domain/entities/ItemSize';
import { CreateModifierGroupDTO } from '../../domain/entities/ModifierGroup';
import { CreateModifierDTO } from '../../domain/entities/Modifier';
import { ValidationError } from '../errors/AppError';

export class ImportSaveService {
  constructor(
    private itemRepository: IItemRepository,
    private itemSizeRepository: IItemSizeRepository,
    private modifierGroupRepository: IModifierGroupRepository,
    private modifierRepository: IModifierRepository,
    private categoryRepository: ICategoryRepository
  ) { }

  /**
   * Save all import data in a single transaction
   */
  async saveAll(data: ParsedImportData, business_id: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Maps to track created entities
      const itemKeyToId = new Map<string, string>();
      const groupKeyToId = new Map<string, string>();
      const modifierKeyToId = new Map<string, string>();
      const itemIdToDefaultSizeId = new Map<string, string>();

      // 1. Create/Update Modifier Groups first (no dependencies)
      for (const groupData of data.modifierGroups) {
        // Check if group exists by name
        const existingGroups = await this.modifierGroupRepository.findAll({
          business_id,
          name: groupData.name,
          page: 1,
          limit: 1,
        });

        const existingGroup = existingGroups.modifierGroups.length > 0 ? existingGroups.modifierGroups[0] : null;

        if (existingGroup) {
          groupKeyToId.set(groupData.group_key, existingGroup.id);
        } else {
          const createGroupDTO: CreateModifierGroupDTO = {
            business_id,
            name: groupData.name,
            display_type: groupData.display_type,
            min_select: groupData.min_select,
            max_select: groupData.max_select,
            applies_per_quantity: groupData.applies_per_quantity,
            is_active: groupData.is_active ?? true,
            sort_order: groupData.sort_order ?? 0,
            quantity_levels: groupData.quantity_levels,
            prices_by_size: groupData.prices_by_size,
          };

          const createdGroup = await this.modifierGroupRepository.create(createGroupDTO);
          groupKeyToId.set(groupData.group_key, createdGroup.id);
        }
      }

      // 2. Create Modifiers (depends on Modifier Groups)
      for (const modifierData of data.modifiers) {
        const groupId = groupKeyToId.get(modifierData.group_key);
        if (!groupId) {
          throw new ValidationError(`ModifierGroup with group_key '${modifierData.group_key}' not found`);
        }

        // Check if modifier exists by name in group
        const existingModifiers = await this.modifierRepository.findAll({
          modifier_group_id: groupId,
          name: modifierData.name,
        });

        const existingModifier = existingModifiers.length > 0 ? existingModifiers[0] : null;

        if (existingModifier) {
          modifierKeyToId.set(`${modifierData.group_key}:${modifierData.modifier_key}`, existingModifier.id);
        } else {
          const createModifierDTO: CreateModifierDTO = {
            modifier_group_id: groupId,
            name: modifierData.name,
            is_default: modifierData.is_default,
            max_quantity: modifierData.max_quantity,
            display_order: modifierData.display_order ?? 0,
            is_active: modifierData.is_active ?? true,
          };

          const createdModifier = await this.modifierRepository.create(createModifierDTO);
          modifierKeyToId.set(`${modifierData.group_key}:${modifierData.modifier_key}`, createdModifier.id);
        }
      }

      // 3. Resolve category IDs
      const categoryNameToId = new Map<string, string>();
      // Get all categories for the business
      const allCategories = await this.categoryRepository.findAll({
        business_id,
      });
      // Build name to ID map
      for (const category of allCategories) {
        categoryNameToId.set(category.name.toLowerCase(), category.id);
      }

      // 4. Create Items
      for (const itemData of data.items) {
        let categoryId = itemData.category_id;
        if (!categoryId && itemData.category_name) {
          categoryId = categoryNameToId.get(itemData.category_name.toLowerCase());
        }
        if (!categoryId) {
          throw new ValidationError(`Category not found for item_key: ${itemData.item_key}. Provide category_id or category_name.`);
        }

        const createItemDTO: CreateItemDTO = {
          business_id,
          name: itemData.name,
          description: itemData.description,
          base_price: itemData.base_price ?? 0,
          category_id: categoryId,
          is_sizeable: itemData.is_sizeable,
          is_customizable: itemData.is_customizable ?? false,
          is_active: itemData.is_active ?? true,
          is_available: itemData.is_available ?? true,
          is_signature: itemData.is_signature ?? false,
          max_per_order: itemData.max_per_order,
          sort_order: itemData.sort_order ?? 0,
        };

        const createdItem = await this.itemRepository.create(createItemDTO);
        itemKeyToId.set(itemData.item_key, createdItem.id);
      }

      // 5. Create Item Sizes (depends on Items)
      for (const sizeData of data.itemSizes) {
        const itemId = itemKeyToId.get(sizeData.item_key);
        if (!itemId) {
          throw new ValidationError(`Item with item_key '${sizeData.item_key}' not found`);
        }

        const createSizeDTO: CreateItemSizeDTO = {
          item_id: itemId,
          restaurant_id: business_id,
          name: sizeData.name,
          code: sizeData.size_code,
          price: sizeData.price,
          display_order: sizeData.display_order ?? 0,
          is_active: sizeData.is_active ?? true,
        };

        const createdSize = await this.itemSizeRepository.create(createSizeDTO);
        
        // Track default size
        if (sizeData.is_default) {
          itemIdToDefaultSizeId.set(itemId, createdSize.id);
        }
      }

      // 6. Set default_size_id for items
      for (const [itemId, defaultSizeId] of itemIdToDefaultSizeId.entries()) {
        await this.itemRepository.update(itemId, business_id, {
          default_size_id: defaultSizeId,
        });
      }

      // 7. Link Items to Modifier Groups and apply overrides
      for (const itemData of data.items) {
        const itemId = itemKeyToId.get(itemData.item_key);
        if (!itemId) continue;

        // Find overrides for this item
        const itemOverrides = data.itemModifierOverrides.filter(
          o => o.item_key === itemData.item_key
        );

        // Group overrides by group_key
        const overridesByGroup = new Map<string, typeof itemOverrides>();
        for (const override of itemOverrides) {
          if (!overridesByGroup.has(override.group_key)) {
            overridesByGroup.set(override.group_key, []);
          }
          overridesByGroup.get(override.group_key)!.push(override);
        }

        // Build modifier_groups array
        const modifierGroups = Array.from(overridesByGroup.keys()).map((group_key, index) => {
          const groupId = groupKeyToId.get(group_key);
          if (!groupId) return null;

          const groupOverrides = overridesByGroup.get(group_key)!;
          const modifierOverrides = groupOverrides.map(override => {
            const modifierId = modifierKeyToId.get(`${override.group_key}:${override.modifier_key}`);
            if (!modifierId) return null;

            return {
              modifier_id: modifierId,
              max_quantity: override.max_quantity,
              is_default: override.is_default,
              prices_by_size: override.prices_by_size,
              quantity_levels: override.quantity_levels,
            };
          }).filter(o => o !== null) as any[];

          return {
            modifier_group_id: groupId,
            display_order: index,
            modifier_overrides: modifierOverrides.length > 0 ? modifierOverrides : undefined,
          };
        }).filter(g => g !== null) as any[];

        // Update item with modifier groups
        if (modifierGroups.length > 0) {
          await this.itemRepository.update(itemId, business_id, {
            modifier_groups: modifierGroups,
          });
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
