"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKitchenSectionNameById = exports.getKitchenSectionIdByName = exports.KITCHEN_SECTIONS = void 0;
exports.KITCHEN_SECTIONS = [
    { label: 'Appetizers', value: 'KS_001' },
    { label: 'Main Course', value: 'KS_002' },
    { label: 'Desserts', value: 'KS_003' },
    { label: 'Beverages', value: 'KS_004' },
];
const getKitchenSectionIdByName = (name) => {
    const section = exports.KITCHEN_SECTIONS.find((s) => s.label.toLowerCase() === name.toLowerCase());
    return section?.value;
};
exports.getKitchenSectionIdByName = getKitchenSectionIdByName;
const getKitchenSectionNameById = (id) => {
    const section = exports.KITCHEN_SECTIONS.find((s) => s.value === id);
    return section?.label;
};
exports.getKitchenSectionNameById = getKitchenSectionNameById;
