"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const KitchenSectionRepository_1 = require("../src/infrastructure/repositories/KitchenSectionRepository");
const kitchen_sections_1 = require("../src/shared/constants/kitchen-sections");
const path_1 = __importDefault(require("path"));
// Load env vars
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env file');
    process.exit(1);
}
const seedKitchenSections = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        // Default business ID for seeding (or we can seed for all found businesses,
        // but typically seeding is done for a specific context or super admin defaults).
        // For now, let's just seed without a business_id if the schema allows,
        // OR we should find all businesses and seed for them.
        // However, the prompt says "seed some basic kitchen sections".
        // Let's seed for a demo business if needed, or just insert them.
        // KitchenSection schema likely requires business_id.
        // Let's assume we want to seed these as available for *usage*.
        const kitchenSectionRepo = new KitchenSectionRepository_1.KitchenSectionRepository();
        // Strategy: Find all businesses and ensure they have these sections?
        // Or just seed for the main business if known.
        // Since I don't know the business ID, I'll fetch the first one found or all of them.
        const businesses = await mongoose_1.default.connection.db.collection('businesses').find({}).toArray();
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
            for (const section of kitchen_sections_1.KITCHEN_SECTIONS) {
                if (!existingNames.has(section.label.toLowerCase())) {
                    await kitchenSectionRepo.create({
                        business_id: businessId,
                        name: section.label,
                        is_active: true,
                    });
                    console.log(`  + Created: ${section.label}`);
                }
                else {
                    console.log(`  - Exists: ${section.label}`);
                }
            }
        }
        console.log('Kitchen Sections seeding completed!');
    }
    catch (error) {
        console.error('Error seeding kitchen sections:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};
seedKitchenSections();
