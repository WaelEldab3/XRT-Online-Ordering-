import Customer from '../models/Customer.js';
import Business from '../models/Business.js';
import Location from '../models/Location.js';
import fs from 'fs';
import path from 'path';
import { parse as parseCSV, stringify as stringifyCSV } from 'csv';

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phoneNumber
 *         - business_id
 *         - location_id
 *       properties:
 *         id:
 *           type: string
 *           description: Customer unique identifier
 *         name:
 *           type: string
 *           description: Customer full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Customer email address
 *           example: "john@example.com"
 *         phoneNumber:
 *           type: string
 *           description: Customer phone number
 *           example: "+1234567890"
 *         business_id:
 *           type: string
 *           description: Reference to business model
 *         location_id:
 *           type: string
 *           description: Reference to location model
 *         rewards:
 *           type: number
 *           description: Customer rewards points
 *           default: 0
 *         isActive:
 *           type: boolean
 *           description: Customer active status
 *           default: true
 *         last_order_at:
 *           type: string
 *           format: date-time
 *           description: Date of last order
 *         preferences:
 *           type: object
 *           properties:
 *             dietary:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [vegetarian, vegan, gluten-free, dairy-free, nut-free, halal, kosher]
 *             allergies:
 *               type: array
 *               items:
 *                 type: string
 *             favoriteItems:
 *               type: array
 *               items:
 *                 type: string
 *             specialInstructions:
 *               type: string
 *         addresses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [home, work, other]
 *                 default: home
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *         loyaltyTier:
 *           type: string
 *           enum: [bronze, silver, gold, platinum]
 *           default: bronze
 *         totalOrders:
 *           type: number
 *           default: 0
 *         totalSpent:
 *           type: number
 *           default: 0
 *         notes:
 *           type: string
 *           description: Additional notes about customer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phoneNumber
 *               - business_id
 *               - location_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               business_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               location_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               rewards:
 *                 type: number
 *                 default: 0
 *               preferences:
 *                 type: object
 *               addresses:
 *                 type: array
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer:
 *                       $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Business or Location not found
 */
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phoneNumber, business_id, location_id, preferences, addresses, notes } =
      req.body;

    // Validate required fields
    if (!name || !email || !phoneNumber || !business_id || !location_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, phone number, business ID, and location ID are required',
      });
    }

    // Check if business exists
    const business = await Business.findById(business_id);
    if (!business) {
      return res.status(404).json({
        status: 'error',
        message: 'Business not found',
      });
    }

    // Check if location exists and belongs to the business
    const location = await Location.findOne({ _id: location_id, business_id });
    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found or does not belong to the specified business',
      });
    }

    // Create customer
    const customer = await Customer.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      business_id,
      location_id,
      preferences,
      addresses,
      notes,
      createdBy: req.user.id,
    });

    // Populate references
    await customer.populate(['business_id', 'location_id']);

    res.status(201).json({
      status: 'success',
      data: {
        customer,
      },
    });
  } catch (err) {
    console.error('Create customer error:', err);

    // Handle duplicate email error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        status: 'error',
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        status: 'error',
        message: errors.join(', '),
      });
    }

    res.status(400).json({
      status: 'error',
      message: err.message || 'Failed to create customer',
    });
  }
};

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers (with optional filtering)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: business_id
 *         schema:
 *           type: string
 *         description: Filter by business ID
 *       - in: query
 *         name: location_id
 *         schema:
 *           type: string
 *         description: Filter by location ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
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
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     customers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Customer'
 */
export const getAllCustomers = async (req, res) => {
  try {
    const { business_id, location_id, page = 1, limit = 10, search } = req.query;

    // Build query
    const query = {};

    if (business_id) query.business_id = business_id;
    if (location_id) query.location_id = location_id;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const customers = await Customer.find(query)
      .populate(['business_id', 'location_id'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: customers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: {
        customers,
      },
    });
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get a single customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer:
 *                       $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 */
export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate([
      'business_id',
      'location_id',
    ]);

    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        customer,
      },
    });
  } catch (err) {
    console.error('Get customer error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * @swagger
 * /customers/{id}:
 *   patch:
 *     summary: Update a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               business_id:
 *                 type: string
 *               location_id:
 *                 type: string
 *               rewards:
 *                 type: number
 *               preferences:
 *                 type: object
 *               addresses:
 *                 type: array
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer:
 *                       $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 */
export const updateCustomer = async (req, res) => {
  try {
    const { business_id, location_id, ...updateData } = req.body;

    // If updating business_id or location_id, validate them
    if (business_id) {
      const business = await Business.findById(business_id);
      if (!business) {
        return res.status(404).json({
          status: 'error',
          message: 'Business not found',
        });
      }
      updateData.business_id = business_id;
    }

    if (location_id) {
      const query = { _id: location_id };
      if (updateData.business_id) {
        query.business_id = updateData.business_id;
      } else {
        // If not updating business_id, check if location belongs to current business
        const currentCustomer = await Customer.findById(req.params.id);
        if (currentCustomer) {
          query.business_id = currentCustomer.business_id;
        }
      }

      const location = await Location.findOne(query);
      if (!location) {
        return res.status(404).json({
          status: 'error',
          message: 'Location not found or does not belong to the specified business',
        });
      }
      updateData.location_id = location_id;
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate(['business_id', 'location_id']);

    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        customer,
      },
    });
  } catch (err) {
    console.error('Update customer error:', err);

    // Handle duplicate email error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        status: 'error',
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        status: 'error',
        message: errors.join(', '),
      });
    }

    res.status(400).json({
      status: 'error',
      message: err.message || 'Failed to update customer',
    });
  }
};

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Delete a customer (soft delete)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       204:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 */
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * @swagger
 * /customers/{id}/rewards/add:
 *   patch:
 *     summary: Add rewards points to a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - points
 *             properties:
 *               points:
 *                 type: number
 *                 minimum: 1
 *                 description: Number of points to add
 *     responses:
 *       200:
 *         description: Rewards added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer:
 *                       $ref: '#/components/schemas/Customer'
 */
export const addRewards = async (req, res) => {
  try {
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Points must be a positive number',
      });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found',
      });
    }

    await customer.addRewards(points);
    await customer.populate(['business_id', 'location_id']);

    res.status(200).json({
      status: 'success',
      data: {
        customer,
      },
    });
  } catch (err) {
    console.error('Add rewards error:', err);
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * @swagger
 * /customers/{id}/rewards/redeem:
 *   patch:
 *     summary: Redeem rewards points from a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - points
 *             properties:
 *               points:
 *                 type: number
 *                 minimum: 1
 *                 description: Number of points to redeem
 *     responses:
 *       200:
 *         description: Rewards redeemed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer:
 *                       $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Insufficient rewards points
 */
export const redeemRewards = async (req, res) => {
  try {
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Points must be a positive number',
      });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found',
      });
    }

    try {
      await customer.redeemRewards(points);
      await customer.populate(['business_id', 'location_id']);

      res.status(200).json({
        status: 'success',
        data: {
          customer,
        },
      });
    } catch (redeemError) {
      return res.status(400).json({
        status: 'error',
        message: redeemError.message,
      });
    }
  } catch (err) {
    console.error('Redeem rewards error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * @swagger
 * /customers/business/{businessId}:
 *   get:
 *     summary: Get customers by business ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     customers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Customer'
 */
export const getCustomersByBusiness = async (req, res) => {
  try {
    const customers = await Customer.findByBusiness(req.params.businessId)
      .populate(['business_id', 'location_id'])
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: customers.length,
      data: {
        customers,
      },
    });
  } catch (err) {
    console.error('Get customers by business error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * @swagger
 * /customers/location/{locationId}:
 *   get:
 *     summary: Get customers by location ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     customers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Customer'
 */
export const getCustomersByLocation = async (req, res) => {
  try {
    const customers = await Customer.findByLocation(req.params.locationId)
      .populate(['business_id', 'location_id'])
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: customers.length,
      data: {
        customers,
      },
    });
  } catch (err) {
    console.error('Get customers by location error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * @swagger
 * /customers/top-rewards:
 *   get:
 *     summary: Get top customers by rewards points
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top customers to return
 *     responses:
 *       200:
 *         description: Top customers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     customers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Customer'
 */
export const getTopCustomersByRewards = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const customers = await Customer.getTopCustomersByRewards(parseInt(limit)).populate([
      'business_id',
      'location_id',
    ]);

    res.status(200).json({
      status: 'success',
      results: customers.length,
      data: {
        customers,
      },
    });
  } catch (err) {
    console.error('Get top customers error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * @swagger
 * /customers/import:
 *   post:
 *     summary: Import customers from CSV file
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - business_id
 *               - location_id
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file to import
 *               business_id:
 *                 type: string
 *                 description: Business ID to assign customers to
 *               location_id:
 *                 type: string
 *                 description: Location ID to assign customers to
 *     responses:
 *       200:
 *         description: Customers imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 imported:
 *                   type: integer
 *                   description: Number of customers imported
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Array of import errors
 *       400:
 *         description: Bad request - validation error
 */
export const importCustomers = async (req, res) => {
  try {
    const { customers } = req.body;

    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Customers array is required and must not be empty',
      });
    }

    const imported = [];
    const errors = [];

    for (let i = 0; i < customers.length; i++) {
      const record = customers[i];

      try {
        // Validate required fields including business_id and location_id
        if (!record.name || !record.email || !record.phoneNumber) {
          errors.push({
            row: i + 1,
            error: 'Missing required fields (name, email, phoneNumber)',
            data: record,
          });
          continue;
        }

        if (!record.business_id || !record.location_id) {
          errors.push({
            row: i + 1,
            error: 'Missing business or location assignment',
            data: record,
          });
          continue;
        }

        // Validate business exists
        const business = await Business.findById(record.business_id);
        if (!business) {
          errors.push({
            row: i + 1,
            error: 'Business not found',
            data: record,
          });
          continue;
        }

        // Validate location exists and belongs to business
        const location = await Location.findOne({
          _id: record.location_id,
          business_id: record.business_id,
        });
        if (!location) {
          errors.push({
            row: i + 1,
            error: 'Location not found or does not belong to the specified business',
            data: record,
          });
          continue;
        }

        // Check for duplicate email in current batch
        const duplicateInBatch = imported.find(c => c.email === record.email.toLowerCase().trim());
        if (duplicateInBatch) {
          errors.push({
            row: i + 1,
            error: 'Duplicate email in this batch',
            data: record,
          });
          continue;
        }

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({
          email: record.email.toLowerCase().trim(),
          business_id: record.business_id,
          location_id: record.location_id,
        });

        if (existingCustomer) {
          errors.push({
            row: i + 1,
            error: 'Customer with this email already exists at this location',
            data: record,
          });
          continue;
        }

        // Create customer
        const customer = await Customer.create({
          name: record.name.trim(),
          email: record.email.toLowerCase().trim(),
          phoneNumber: record.phoneNumber.trim(),
          business_id: record.business_id,
          location_id: record.location_id,
          rewards: parseInt(record.rewards) || 0,
          notes: record.notes?.trim() || undefined,
          createdBy: req.user?.id,
        });

        imported.push(customer);
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error.message,
          data: record,
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        imported: imported.length,
        total: customers.length,
        errors,
      },
    });
  } catch (err) {
    console.error('Import customers error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * @swagger
 * /customers/export:
 *   post:
 *     summary: Export customers to CSV file
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               business_id:
 *                 type: string
 *                 description: Filter by business ID (optional)
 *               location_id:
 *                 type: string
 *                 description: Filter by location ID (optional)
 *               format:
 *                 type: string
 *                 enum: [csv]
 *                 default: csv
 *     responses:
 *       200:
 *         description: Customers exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Bad request
 */
export const exportCustomers = async (req, res) => {
  try {
    const { business_id, location_id, format = 'csv' } = req.body;

    // Build query - don't filter by isActive since model middleware handles it
    // and isActive has select: false which can cause issues with explicit queries
    const query = {};
    if (business_id) query.business_id = business_id;
    if (location_id) query.location_id = location_id;

    console.log('Export query:', JSON.stringify(query));

    const customers = await Customer.find(query)
      .populate(['business_id', 'location_id'])
      .sort({ createdAt: -1 });

    console.log('Found customers for export:', customers.length);

    if (customers.length === 0) {
      // Return empty CSV with headers instead of JSON error
      const headers =
        'Customer Name,Email Address,Phone Number,Business,Location,Reward Points,Loyalty Tier,Total Orders,Total Spent,Last Order Date,Notes,Created Date\n';
      const filename = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(headers);
    }

    // Helper function to format date
    const formatDate = date => {
      if (!date) return '';
      const d = new Date(date);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return d.toLocaleDateString('en-US', options);
    };

    // Helper function to format currency
    const formatCurrency = amount => {
      if (!amount && amount !== 0) return '$0.00';
      return `$${Number(amount).toFixed(2)}`;
    };

    // Prepare CSV data with clean, readable format
    const csvData = customers.map(customer => ({
      'Customer Name': customer.name || '',
      'Email Address': customer.email || '',
      'Phone Number': customer.phoneNumber || '',
      Business: customer.business_id?.name || '',
      Location: customer.location_id?.branch_name || customer.location_id?.name || '',
      'Reward Points': customer.rewards || 0,
      'Loyalty Tier':
        (customer.loyaltyTier || 'bronze').charAt(0).toUpperCase() +
        (customer.loyaltyTier || 'bronze').slice(1),
      'Total Orders': customer.totalOrders || 0,
      'Total Spent': formatCurrency(customer.totalSpent),
      'Last Order Date': formatDate(customer.last_order_at),
      Notes: customer.notes || '',
      'Created Date': formatDate(customer.createdAt),
    }));

    // Convert to CSV with readable headers
    stringifyCSV(
      csvData,
      {
        header: true,
        columns: [
          'Customer Name',
          'Email Address',
          'Phone Number',
          'Business',
          'Location',
          'Reward Points',
          'Loyalty Tier',
          'Total Orders',
          'Total Spent',
          'Last Order Date',
          'Notes',
          'Created Date',
        ],
      },
      (err, csv) => {
        if (err) {
          return res.status(500).json({
            status: 'error',
            message: 'Failed to generate CSV',
          });
        }

        // Set response headers for CSV download
        const filename = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        res.status(200).send(csv);
      }
    );
  } catch (err) {
    console.error('Export customers error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
