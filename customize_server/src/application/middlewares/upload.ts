import multer from 'multer';
import { Request } from 'express';

import { storage } from '../../infrastructure/cloudinary/CloudinaryStorage';

// const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'icon' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Memory storage for CSV/ZIP imports (no need to save to cloud)
const memoryStorage = multer.memoryStorage();

const importFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow CSV and ZIP files
  if (
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/csv' ||
    file.mimetype === 'application/zip' ||
    file.originalname.endsWith('.csv') ||
    file.originalname.endsWith('.zip')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV or ZIP files are allowed for imports'));
  }
};

export const upload = multer({
  storage: memoryStorage,
  fileFilter: importFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for imports
  },
});
