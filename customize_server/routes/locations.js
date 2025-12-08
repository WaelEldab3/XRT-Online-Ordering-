import express from 'express';
import {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  activateLocation,
  deactivateLocation,
  getLocationsByBusiness,
  getNearbyLocations,
} from '../controllers/locationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Basic CRUD routes
router.post('/', createLocation);
router.get('/', getAllLocations);
router.get('/nearby', getNearbyLocations);
router.get('/business/:businessId', getLocationsByBusiness);
router.get('/:id', getLocationById);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

// Location status management routes
router.patch('/:id/activate', activateLocation);
router.patch('/:id/deactivate', deactivateLocation);

export default router;
