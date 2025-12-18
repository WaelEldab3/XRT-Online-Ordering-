import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from customize_server root (parent of scripts)
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    // Dynamic imports to ensure env vars are loaded first
    const { default: Customer } = await import('../models/Customer.js');
    const { default: Business } = await import('../models/Business.js');
    const { default: Location } = await import('../models/Location.js');
    const { default: User } = await import('../models/User.js');
    const { connectDB } = await import('../config/database.js');

    await connectDB();
    console.log('🔌 Connected to database');

    // Find required relations
    let owner = await User.findOne({ email: 'owner@example.com' });
    if (!owner) {
      console.log('Owner not found, searching for super_admin...');
      owner = await User.findOne({ role: 'super_admin' });
    }

    if (!owner) {
      console.log('No owner or super admin found. Creating owner...');
      owner = await User.create({
        name: 'Business Owner',
        email: 'owner@example.com',
        password: 'password123',
        role: 'client',
        isApproved: true,
      });
    }

    console.log(`Using user: ${owner.email} (${owner._id})`);

    const business = await Business.findOne({ id: 'biz_001' });
    if (!business) {
      throw new Error('Business biz_001 not found. Please run seedBusinesses.js first.');
    }

    const location = await Location.findOne({ id: 'loc_001' });
    if (!location) {
      throw new Error('Location loc_001 not found. Please run seedBusinesses.js first.');
    }

    // Dummy Customers
    const customers = [
      {
        name: 'Alice Wonderland',
        email: 'alice@example.com',
        phoneNumber: '555-0101',
        business_id: business._id,
        location_id: location._id,
        createdBy: owner._id,
        rewards: 150,
        preferences: {
          dietary: ['vegetarian'],
          favoriteItems: ['Kale Salad', 'Veggie Burger'],
        },
        loyaltyTier: 'bronze',
        totalSpent: 150,
        totalOrders: 5,
      },
      {
        name: 'Bob Builder',
        email: 'bob@example.com',
        phoneNumber: '555-0102',
        business_id: business._id,
        location_id: location._id,
        createdBy: owner._id,
        rewards: 550,
        preferences: {
          favoriteItems: ['Double Cheeseburger'],
        },
        loyaltyTier: 'gold',
        totalSpent: 600,
        totalOrders: 20,
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        phoneNumber: '555-0103',
        business_id: business._id,
        location_id: location._id,
        createdBy: owner._id,
        rewards: 0,
        preferences: {
          allergies: ['peanuts'],
        },
        loyaltyTier: 'bronze',
        totalSpent: 50,
        totalOrders: 2,
      },
    ];

    console.log('Creating customers...');
    for (const customerData of customers) {
      // Check if exists by email to avoid dupes
      let customer = await Customer.findOne({ email: customerData.email });
      if (!customer) {
        customer = await Customer.create(customerData);
        console.log(`✅ Created customer: ${customer.name}`);
      } else {
        console.log(`ℹ️ Customer already exists: ${customer.name}`);
      }
    }

    console.log('🎉 Customer seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
