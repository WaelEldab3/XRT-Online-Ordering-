import 'dotenv/config'; // Load .env
import mongoose from 'mongoose';
import User from '../models/User.js';

const seedSuperAdmin = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to database...');
    // Ensure you have MONGODB_URI in your .env
    const MONGO_URI = process.env.MONGODB_URI;

    if (!MONGO_URI) {
      throw new Error('MONGODB_URI must be defined in .env');
    }

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Define Super Admin Data
    const superAdminData = {
      name: 'Andrew Azer',
      email: 'andrewazer18@gmail.com', // Change this if needed
      password: '21720015146', // Change this if needed
      role: 'super_admin',
      isApproved: true,
      isBanned: false,
    };

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email: superAdminData.email });

    if (existingUser) {
      console.log(`User with email ${superAdminData.email} already exists.`);

      // Optional: Update to super_admin if they exist but aren't super admin
      if (existingUser.role !== 'super_admin') {
        console.log('Updating existing user to super_admin role...');
        existingUser.role = 'super_admin';
        existingUser.setDefaultPermissions();
        await existingUser.save();
        console.log('✅ User updated to super_admin.');
      }
    } else {
      // 4. Create new Super Admin
      console.log('Creating new Super Admin user...');
      const user = new User(superAdminData);

      // Explicitly set default permissions (though pre-save hook handles it)
      user.setDefaultPermissions();

      await user.save();
      console.log('✅ Super Admin created successfully!');
    }

    // 5. Verify Permissions
    const admin = await User.findOne({ email: superAdminData.email });
    console.log(`Admin Role: ${admin.role}`);
    console.log(`Permissions count: ${admin.permissions.length}`);
  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
};

seedSuperAdmin();
