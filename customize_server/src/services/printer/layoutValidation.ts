import { TemplateLayout, TemplateLayoutBlock } from '../../domain/entities/PrintTemplate';
import {
  PRINTABLE_FIELD_KEYS,
  PRINTABLE_ITEM_COLUMNS,
} from '../../shared/constants/printableFields';

const VALID_FIELD_SET = new Set<string>(PRINTABLE_FIELD_KEYS);
const VALID_ITEM_COLUMN_SET = new Set<string>(PRINTABLE_ITEM_COLUMNS);

export interface LayoutValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a template layout before save.
 * - field blocks: value must be a known printable field key.
 * - itemsTable blocks: columns must be known item column keys.
 */
export function validateLayout(layout: TemplateLayout): LayoutValidationResult {
  const errors: string[] = [];

  const processBlocks = (blocks: TemplateLayoutBlock[] | undefined, section: string) => {
    if (!Array.isArray(blocks)) return;
    blocks.forEach((block, i) => {
      if (block.type === 'field') {
        const value = (block as { type: 'field'; value: string }).value;
        if (!value || typeof value !== 'string') {
          errors.push(`${section}[${i}]: field block must have a non-empty "value"`);
        } else if (!VALID_FIELD_SET.has(value)) {
          errors.push(`${section}[${i}]: unknown field "${value}"`);
        }
      } else if (block.type === 'itemsTable') {
        const columns = (block as { type: 'itemsTable'; columns: string[] }).columns;
        if (!Array.isArray(columns)) {
          errors.push(`${section}[${i}]: itemsTable block must have "columns" array`);
        } else {
          columns.forEach((col, j) => {
            if (!VALID_ITEM_COLUMN_SET.has(col)) {
              errors.push(`${section}[${i}].columns[${j}]: unknown column "${col}"`);
            }
          });
        }
      }
    });
  };

  processBlocks(layout.header, 'header');
  processBlocks(layout.body, 'body');
  processBlocks(layout.footer, 'footer');

  return {
    valid: errors.length === 0,
    errors,
  };
}
