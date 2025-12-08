import express from 'express';
import {
  createBusiness,
  getAllBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  activateBusiness,
  deactivateBusiness,
  getBusinessesByOwner,
  updateBusinessOwner,
} from '../controllers/businessController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Basic CRUD routes
router.post('/', createBusiness);
router.get('/', getAllBusinesses);
router.get('/owner/:ownerId', getBusinessesByOwner);
router.get('/:id', getBusinessById);
router.put('/:id', updateBusiness);
router.delete('/:id', deleteBusiness);

// Business status management routes
router.patch('/:id/activate', activateBusiness);
router.patch('/:id/deactivate', deactivateBusiness);

// Business owner management routes
router.patch('/:id/owner', updateBusinessOwner);

export default router;
