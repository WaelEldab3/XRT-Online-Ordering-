import Location from '../models/Location.js';
import Business from '../models/Business.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - id
 *         - business_id
 *         - branch_name
 *         - address
 *         - contact
 *         - longitude
 *         - latitude
 *         - timeZone
 *         - opening
 *       properties:
 *         id:
 *           type: string
 *           example: "loc-123456789"
 *           description: Location unique identifier
 *         business_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *           description: Reference to business model
 *         branch_name:
 *           type: string
 *           example: "Downtown Branch"
 *           description: Branch display name
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: "123 Main St"
 *             city:
 *               type: string
 *               example: "New York"
 *             state:
 *               type: string
 *               example: "NY"
 *             zipCode:
 *               type: string
 *               example: "10001"
 *             country:
 *               type: string
 *               example: "USA"
 *             building:
 *               type: string
 *               example: "Tower A"
 *             floor:
 *               type: string
 *               example: "5th Floor"
 *             landmark:
 *               type: string
 *               example: "Near Central Park"
 *         contact:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *               example: "+1234567890"
 *             email:
 *               type: string
 *               format: email
 *               example: "downtown@business.com"
 *             website:
 *               type: string
 *               example: "https://business.com/downtown"
 *         longitude:
 *           type: number
 *           example: -74.0060
 *           description: Location longitude coordinate
 *         latitude:
 *           type: number
 *           example: 40.7128
 *           description: Location latitude coordinate
 *         timeZone:
 *           type: string
 *           example: "America/New_York"
 *           description: Location timezone
 *         online_ordering:
 *           type: object
 *           properties:
 *             pickup:
 *               type: boolean
 *               example: true
 *             delivery:
 *               type: boolean
 *               example: true
 *         opening:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               day_of_week:
 *                 type: string
 *                 enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
 *               open_time:
 *                 type: string
 *                 example: "09:00"
 *               close_time:
 *                 type: string
 *                 example: "22:00"
 *               is_closed:
 *                 type: boolean
 *                 example: false
 *         isActive:
 *           type: boolean
 *           example: true
 *           description: Location active status
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Location creation timestamp
 */

// Generate unique location ID
const generateLocationId = () => {
  return `loc-${uuidv4().replace(/-/g, '').substring(0, 9)}`;
};

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Get all locations
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: business_id
 *         schema:
 *           type: string
 *         description: Filter by business ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search locations by branch name
 *     responses:
 *       200:
 *         description: List of locations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Location'
 */
export const getAllLocations = async (req, res) => {
  try {
    const { page = 1, limit = 10, business_id, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (business_id) {
      query.business_id = business_id;
    }
    if (search) {
      query.branch_name = { $regex: search, $options: 'i' };
    }

    const locations = await Location.find(query)
      .populate('business_id', 'name legal_name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    const total = await Location.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: locations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Get location by ID
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       404:
 *         description: Location not found
 */
export const getLocationById = async (req, res) => {
  try {
    const location = await Location.findOne({ id: req.params.id })
      .populate('business_id', 'name legal_name');

    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: location
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Create a new location
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_id
 *               - branch_name
 *               - address
 *               - contact
 *               - longitude
 *               - latitude
 *               - timeZone
 *               - opening
 *             properties:
 *               business_id:
 *                 type: string
 *                 description: Business ID
 *               branch_name:
 *                 type: string
 *                 description: Branch name
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *                   building:
 *                     type: string
 *                   floor:
 *                     type: string
 *                   landmark:
 *                     type: string
 *               contact:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   website:
 *                     type: string
 *               longitude:
 *                 type: number
 *               latitude:
 *                 type: number
 *               timeZone:
 *                 type: string
 *               online_ordering:
 *                 type: object
 *                 properties:
 *                   pickup:
 *                     type: boolean
 *                   delivery:
 *                     type: boolean
 *               opening:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day_of_week:
 *                       type: string
 *                     open_time:
 *                       type: string
 *                     close_time:
 *                       type: string
 *                     is_closed:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Location created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Business not found
 */
export const createLocation = async (req, res) => {
  try {
    const { business_id } = req.body;

    // Check if business exists
    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({
        status: 'error',
        message: 'Business not found'
      });
    }

    const locationData = {
      ...req.body,
      id: generateLocationId(),
      created_at: new Date()
    };

    const location = await Location.create(locationData);
    await location.populate('business_id', 'name legal_name');

    res.status(201).json({
      status: 'success',
      data: location
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/locations/{id}:
 *   put:
 *     summary: Update location by ID
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branch_name:
 *                 type: string
 *               address:
 *                 type: object
 *               contact:
 *                 type: object
 *               longitude:
 *                 type: number
 *               latitude:
 *                 type: number
 *               timeZone:
 *                 type: string
 *               online_ordering:
 *                 type: object
 *               opening:
 *                 type: array
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       404:
 *         description: Location not found
 */
export const updateLocation = async (req, res) => {
  try {
    const location = await Location.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('business_id', 'name legal_name');

    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: location
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     summary: Delete location by ID
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       204:
 *         description: Location deleted successfully
 *       404:
 *         description: Location not found
 */
export const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findOneAndDelete({ id: req.params.id });

    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/locations/{id}/activate:
 *   patch:
 *     summary: Activate location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       404:
 *         description: Location not found
 */
export const activateLocation = async (req, res) => {
  try {
    const location = await Location.findOneAndUpdate(
      { id: req.params.id },
      { isActive: true },
      { new: true }
    ).populate('business_id', 'name legal_name');

    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: location
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/locations/{id}/deactivate:
 *   patch:
 *     summary: Deactivate location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       404:
 *         description: Location not found
 */
export const deactivateLocation = async (req, res) => {
  try {
    const location = await Location.findOneAndUpdate(
      { id: req.params.id },
      { isActive: false },
      { new: true }
    ).populate('business_id', 'name legal_name');

    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: location
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/locations/business/{businessId}:
 *   get:
 *     summary: Get locations by business
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Locations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Location'
 */
export const getLocationsByBusiness = async (req, res) => {
  try {
    const locations = await Location.find({ business_id: req.params.businessId })
      .populate('business_id', 'name legal_name')
      .sort({ created_at: -1 });

    res.status(200).json({
      status: 'success',
      results: locations.length,
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * @swagger
 * /api/locations/nearby:
 *   get:
 *     summary: Get nearby locations
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: User longitude
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: User latitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in kilometers
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Nearby locations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Location'
 */
export const getNearbyLocations = async (req, res) => {
  try {
    const { longitude, latitude, radius = 10, limit = 10 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        status: 'error',
        message: 'Longitude and latitude are required'
      });
    }

    // Convert radius from kilometers to radians
    const radiusInRadians = radius / 6378.1;

    const locations = await Location.find({
      isActive: true,
      longitude: {
        $gte: parseFloat(longitude) - radiusInRadians,
        $lte: parseFloat(longitude) + radiusInRadians
      },
      latitude: {
        $gte: parseFloat(latitude) - radiusInRadians,
        $lte: parseFloat(latitude) + radiusInRadians
      }
    })
      .populate('business_id', 'name legal_name')
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    res.status(200).json({
      status: 'success',
      results: locations.length,
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
