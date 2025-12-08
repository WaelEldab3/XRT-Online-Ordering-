import Business from '../models/Business.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @swagger
 * components:
 *   schemas:
 *     Business:
 *       type: object
 *       required:
 *         - id
 *         - owner
 *         - name
 *         - legal_name
 *         - primary_content_name
 *         - primary_content_email
 *         - primary_content_phone
 *       properties:
 *         id:
 *           type: string
 *           description: Business unique identifier
 *           example: "biz-123456789"
 *         owner:
 *           type: string
 *           description: Reference to user who owns the business
 *           example: "user-123456789"
 *         name:
 *           type: string
 *           description: Business display name
 *           example: "Joe's Pizza Place"
 *         legal_name:
 *           type: string
 *           description: Legal business registration name
 *           example: "Joe's Pizza LLC"
 *         primary_content_name:
 *           type: string
 *           description: Primary contact person name
 *           example: "Joe Smith"
 *         primary_content_email:
 *           type: string
 *           format: email
 *           description: Primary contact email
 *           example: "joe@joespizza.com"
 *         primary_content_phone:
 *           type: string
 *           description: Primary contact phone number
 *           example: "+1234567890"
 *         isActive:
 *           type: boolean
 *           description: Business active status
 *           default: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Business creation timestamp
 *         description:
 *           type: string
 *           description: Business description
 *           example: "Best pizza in town!"
 *         website:
 *           type: string
 *           description: Business website URL
 *           example: "https://joespizza.com"
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
 *         logo:
 *           type: string
 *           description: Business logo URL
 *           example: "https://joespizza.com/logo.png"
 */

// Generate unique business ID
const generateBusinessId = () => {
  return `biz-${uuidv4().replace(/-/g, '').substring(0, 9)}`;
};

/**
 * @swagger
 * /api/businesses:
 *   get:
 *     summary: Get all businesses
 *     tags: [Businesses]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search businesses by name or legal name
 *     responses:
 *       200:
 *         description: List of businesses retrieved successfully
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
 *                     $ref: '#/components/schemas/Business'
 */
export const getAllBusinesses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { legal_name: { $regex: search, $options: 'i' } }
      ];
    }

    const businesses = await Business.find(query)
      .populate('owner', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    const total = await Business.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: businesses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: businesses
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
 * /api/businesses/{id}:
 *   get:
 *     summary: Get business by ID
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Business retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Business'
 *       404:
 *         description: Business not found
 */
export const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findOne({ id: req.params.id })
      .populate('owner', 'name email');

    if (!business) {
      return res.status(404).json({
        status: 'error',
        message: 'Business not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: business
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
 * /api/businesses:
 *   post:
 *     summary: Create a new business
 *     tags: [Businesses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - owner
 *               - name
 *               - legal_name
 *               - primary_content_name
 *               - primary_content_email
 *               - primary_content_phone
 *             properties:
 *               owner:
 *                 type: string
 *                 description: User ID of the business owner
 *               name:
 *                 type: string
 *                 description: Business display name
 *               legal_name:
 *                 type: string
 *                 description: Legal business name
 *               primary_content_name:
 *                 type: string
 *                 description: Primary contact name
 *               primary_content_email:
 *                 type: string
 *                 format: email
 *                 description: Primary contact email
 *               primary_content_phone:
 *                 type: string
 *                 description: Primary contact phone
 *               description:
 *                 type: string
 *                 description: Business description
 *               website:
 *                 type: string
 *                 description: Business website
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
 *               logo:
 *                 type: string
 *                 description: Business logo URL
 *     responses:
 *       201:
 *         description: Business created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Business'
 *       400:
 *         description: Bad request
 */
export const createBusiness = async (req, res) => {
  try {
    const businessData = {
      ...req.body,
      id: generateBusinessId(),
      created_at: new Date()
    };

    const business = await Business.create(businessData);
    await business.populate('owner', 'name email');

    res.status(201).json({
      status: 'success',
      data: business
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
 * /api/businesses/{id}:
 *   put:
 *     summary: Update business by ID
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Business display name
 *               legal_name:
 *                 type: string
 *                 description: Legal business name
 *               primary_content_name:
 *                 type: string
 *                 description: Primary contact name
 *               primary_content_email:
 *                 type: string
 *                 format: email
 *                 description: Primary contact email
 *               primary_content_phone:
 *                 type: string
 *                 description: Primary contact phone
 *               description:
 *                 type: string
 *                 description: Business description
 *               website:
 *                 type: string
 *                 description: Business website
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
 *               logo:
 *                 type: string
 *                 description: Business logo URL
 *               isActive:
 *                 type: boolean
 *                 description: Business active status
 *     responses:
 *       200:
 *         description: Business updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Business'
 *       404:
 *         description: Business not found
 */
export const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!business) {
      return res.status(404).json({
        status: 'error',
        message: 'Business not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: business
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
 * /api/businesses/{id}:
 *   delete:
 *     summary: Delete business by ID
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     responses:
 *       204:
 *         description: Business deleted successfully
 *       404:
 *         description: Business not found
 */
export const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findOneAndDelete({ id: req.params.id });

    if (!business) {
      return res.status(404).json({
        status: 'error',
        message: 'Business not found'
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
 * /api/businesses/{id}/activate:
 *   patch:
 *     summary: Activate business
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Business activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Business'
 *       404:
 *         description: Business not found
 */
export const activateBusiness = async (req, res) => {
  try {
    const business = await Business.findOneAndUpdate(
      { id: req.params.id },
      { isActive: true },
      { new: true }
    ).populate('owner', 'name email');

    if (!business) {
      return res.status(404).json({
        status: 'error',
        message: 'Business not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: business
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
 * /api/businesses/{id}/deactivate:
 *   patch:
 *     summary: Deactivate business
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Business deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Business'
 *       404:
 *         description: Business not found
 */
export const deactivateBusiness = async (req, res) => {
  try {
    const business = await Business.findOneAndUpdate(
      { id: req.params.id },
      { isActive: false },
      { new: true }
    ).populate('owner', 'name email');

    if (!business) {
      return res.status(404).json({
        status: 'error',
        message: 'Business not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: business
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
 * /api/businesses/owner/{ownerId}:
 *   get:
 *     summary: Get businesses by owner
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Owner user ID
 *     responses:
 *       200:
 *         description: Businesses retrieved successfully
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
 *                     $ref: '#/components/schemas/Business'
 */

/**
 * @swagger
 * /api/businesses/{id}/owner:
 *   patch:
 *     summary: Update business owner
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ownerId
 *             properties:
 *               ownerId:
 *                 type: string
 *                 description: New owner user ID
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Business owner updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Business'
 *       404:
 *         description: Business not found
 *       400:
 *         description: Invalid owner ID
 */
export const updateBusinessOwner = async (req, res) => {
  try {
    const { ownerId } = req.body;

    if (!ownerId) {
      return res.status(400).json({
        status: 'error',
        message: 'Owner ID is required'
      });
    }

    const business = await Business.findOneAndUpdate(
      { id: req.params.id },
      { owner: ownerId },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!business) {
      return res.status(404).json({
        status: 'error',
        message: 'Business not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: business
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getBusinessesByOwner = async (req, res) => {
  try {
    const businesses = await Business.find({ owner: req.params.ownerId })
      .populate('owner', 'name email')
      .sort({ created_at: -1 });

    res.status(200).json({
      status: 'success',
      results: businesses.length,
      data: businesses
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
