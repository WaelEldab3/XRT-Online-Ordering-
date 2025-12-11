import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from customize_server root (parent of scripts)
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    // Dynamic imports to ensure env vars are loaded first
    const { default: Business } = await import('../models/Business.js');
    const { default: Location } = await import('../models/Location.js');
    const { default: User } = await import('../models/User.js');
    const { connectDB } = await import('../config/database.js');

    await connectDB();
    console.log('🔌 Connected to database');

    // Find or create a user to own the businesses
    let owner = await User.findOne({ email: 'owner@example.com' });

    if (!owner) {
      console.log('Creating dummy owner...');
      // Note: In a real scenario, you'd want to handle password hashing properly if not using the model method directly or rely on the pre-save hook
      owner = await User.create({
        name: 'Business Owner',
        email: 'owner@example.com',
        password: 'password123',
        role: 'client',
        isApproved: true,
      });
      console.log('✅ Dummy owner created');
    } else {
      console.log('Found existing dummy owner');
    }

    // Dummy Businesses
    const businesses = [
      {
        id: 'biz_001',
        owner: owner._id,
        name: 'Gourmet Burger Kitchen',
        legal_name: 'GBK Ltd',
        primary_content_name: 'John Doe',
        primary_content_email: 'john@gbk.com',
        primary_content_phone: '1234567890',
        description: 'Best burgers in town',
        isActive: true,
      },
      {
        id: 'biz_002',
        owner: owner._id,
        name: 'Pizza Express',
        legal_name: 'Pizza Express Inc',
        primary_content_name: 'Jane Smith',
        primary_content_email: 'jane@pizza.com',
        primary_content_phone: '0987654321',
        description: 'Authentic Italian pizza',
        isActive: true,
      },
    ];

    console.log('Creating businesses...');
    // We use a loop or Promise.all to ensure we get the created docs back with _ids
    const createdBusinesses = [];
    for (const bizData of businesses) {
      // Check if exists to avoid dupes if running multiple times
      let biz = await Business.findOne({ id: bizData.id });
      if (!biz) {
        biz = await Business.create(bizData);
        console.log(`✅ Created business: ${biz.name}`);
      } else {
        console.log(`ℹ️ Business already exists: ${biz.name}`);
      }
      createdBusinesses.push(biz);
    }

    // Dummy Locations
    // Linking to the first business
    const biz1 = createdBusinesses.find(b => b.id === 'biz_001');
    const biz2 = createdBusinesses.find(b => b.id === 'biz_002');

    const locations = [];

    if (biz1) {
      locations.push({
        id: 'loc_001',
        business_id: biz1._id,
        branch_name: 'GBK Downtown',
        address: {
          street: '123 Main St',
          city: 'Metropolis',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
        },
        contact: {
          phone: '111-222-3333',
          email: 'downtown@gbk.com',
        },
        longitude: -74.006,
        latitude: 40.7128,
        timeZone: 'America/New_York',
        opening: [
          { day_of_week: 'monday', open_time: '09:00', close_time: '22:00' },
          { day_of_week: 'tuesday', open_time: '09:00', close_time: '22:00' },
          { day_of_week: 'wednesday', open_time: '09:00', close_time: '22:00' },
          { day_of_week: 'thursday', open_time: '09:00', close_time: '22:00' },
          { day_of_week: 'friday', open_time: '09:00', close_time: '23:00' },
          { day_of_week: 'saturday', open_time: '10:00', close_time: '23:00' },
          { day_of_week: 'sunday', open_time: '10:00', close_time: '21:00' },
        ],
      });
    }

    if (biz2) {
      locations.push({
        id: 'loc_002',
        business_id: biz2._id,
        branch_name: 'Pizza Express Mall',
        address: {
          street: '456 Mall Ave',
          city: 'Gotham',
          state: 'NJ',
          zipCode: '07001',
          country: 'US',
        },
        contact: {
          phone: '444-555-6666',
          email: 'mall@pizza.com',
        },
        longitude: -74.123,
        latitude: 40.845,
        timeZone: 'America/New_York',
        opening: [
          { day_of_week: 'monday', open_time: '11:00', close_time: '22:00' },
          { day_of_week: 'tuesday', open_time: '11:00', close_time: '22:00' },
          { day_of_week: 'wednesday', open_time: '11:00', close_time: '22:00' },
          { day_of_week: 'thursday', open_time: '11:00', close_time: '22:00' },
          { day_of_week: 'friday', open_time: '11:00', close_time: '23:00' },
          { day_of_week: 'saturday', open_time: '11:00', close_time: '23:00' },
          { day_of_week: 'sunday', open_time: '12:00', close_time: '21:00' },
        ],
      });
    }

    console.log('Creating locations...');
    for (const locData of locations) {
      let loc = await Location.findOne({ id: locData.id });
      if (!loc) {
        loc = await Location.create(locData);
        console.log(`✅ Created location: ${loc.branch_name}`);
      } else {
        console.log(`ℹ️ Location already exists: ${loc.branch_name}`);
      }
    }

    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
