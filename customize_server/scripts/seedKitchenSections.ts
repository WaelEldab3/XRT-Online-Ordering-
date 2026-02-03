import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { KitchenSectionRepository } from '../src/infrastructure/repositories/KitchenSectionRepository';
import { KITCHEN_SECTIONS } from '../src/shared/constants/kitchen-sections';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

const seedKitchenSections = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Default business ID for seeding (or we can seed for all found businesses,
    // but typically seeding is done for a specific context or super admin defaults).
    // For now, let's just seed without a business_id if the schema allows,
    // OR we should find all businesses and seed for them.
    // However, the prompt says "seed some basic kitchen sections".
    // Let's seed for a demo business if needed, or just insert them.
    // KitchenSection schema likely requires business_id.
    // Let's assume we want to seed these as available for *usage*.

    const kitchenSectionRepo = new KitchenSectionRepository();

    // Strategy: Find all businesses and ensure they have these sections?
    // Or just seed for the main business if known.
    // Since I don't know the business ID, I'll fetch the first one found or all of them.

    const businesses = await mongoose.connection.db.collection('businesses').find({}).toArray();

    if (businesses.length === 0) {
      console.log('No businesses found to seed kitchen sections for.');
      return;
    }

    console.log(`Found ${businesses.length} businesses. Seeding kitchen sections...`);

    for (const business of businesses) {
      const businessId = business._id.toString();
      console.log(`Processing business: ${business.name} (${businessId})`);

      const existingSections = await kitchenSectionRepo.findAll({ business_id: businessId });
      const existingNames = new Set(existingSections.map((s) => s.name.toLowerCase()));

      for (const section of KITCHEN_SECTIONS) {
        if (!existingNames.has(section.label.toLowerCase())) {
          await kitchenSectionRepo.create({
            business_id: businessId,
            name: section.label,
            is_active: true,
          });
          console.log(`  + Created: ${section.label}`);
        } else {
          console.log(`  - Exists: ${section.label}`);
        }
      }
    }

    console.log('Kitchen Sections seeding completed!');
  } catch (error) {
    console.error('Error seeding kitchen sections:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedKitchenSections();
