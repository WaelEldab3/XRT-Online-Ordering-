"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
const memoryStorage = multer_1.default.memoryStorage();
exports.uploadImage = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
// Memory storage for CSV/ZIP imports (no need to save to cloud)
const importFileFilter = (req, file, cb) => {
    // Allow CSV and ZIP files
    if (file.mimetype === 'text/csv' ||
        file.mimetype === 'application/csv' ||
        file.mimetype === 'application/zip' ||
        file.originalname.endsWith('.csv') ||
        file.originalname.endsWith('.zip')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only CSV or ZIP files are allowed for imports'));
    }
};
exports.upload = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter: importFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB for imports
    },
});
