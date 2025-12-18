import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  addRewards,
  redeemRewards,
  getCustomersByBusiness,
  getCustomersByLocation,
  getTopCustomersByRewards,
  importCustomers,
  exportCustomers,
} from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for CSV file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Apply authentication middleware to all routes
router.use(protect);

// Basic CRUD routes
router.post('/', createCustomer);
router.get('/', getAllCustomers);
router.get('/top-rewards', getTopCustomersByRewards);
router.get('/business/:businessId', getCustomersByBusiness);
router.get('/location/:locationId', getCustomersByLocation);
router.get('/:id', getCustomer);
router.patch('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

// Rewards management routes
router.patch('/:id/rewards/add', addRewards);
router.patch('/:id/rewards/redeem', redeemRewards);

// CSV import/export routes
router.post('/import', upload.single('file'), importCustomers);
router.post('/export', exportCustomers);

export default router;
