import 'dotenv/config';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { ItemModel } from '../src/infrastructure/database/models/ItemModel';
import { CategoryModel } from '../src/infrastructure/database/models/CategoryModel';
import { BusinessModel } from '../src/infrastructure/database/models/BusinessModel';
import { Types } from 'mongoose';

const seedItems = async (): Promise<void> => {
    try {
        console.log('Connecting to database...');
        await connectDatabase();
        console.log('✅ Connected to MongoDB');

        // 1. Get Business
        let business = await BusinessModel.findOne({ id: 'biz_001' });
        if (!business) {
            business = await BusinessModel.findOne();
        }

        if (!business) {
            console.error('❌ No business found. Please run seedBusinesses first.');
            process.exit(1);
        }

        const businessId = business.id;
        console.log(`Using Business ID: ${businessId}`);

        // 2. Get Categories
        const categories = await CategoryModel.find({ business_id: businessId });
        if (categories.length === 0) {
            console.error('❌ No categories found. Please run seedCategories first.');
            process.exit(1);
        }

        console.log(`Found ${categories.length} categories.`);

        // 3. Clear existing items
        console.log('🧹 Clearing existing items...');
        await ItemModel.deleteMany({ business_id: businessId });

        // 4. Generate Items
        const items = [];
        const adjectives = ['Spicy', 'Sweet', 'Savory', 'Crispy', 'Fresh', 'Grilled', 'Roasted', 'Steamed', 'Fried', 'Baked'];
        const nouns = ['Burger', 'Pizza', 'Salad', 'Pasta', 'Soup', 'Sandwich', 'Wrap', 'Taco', 'Sushi', 'Steak'];

        for (let i = 0; i < 20; i++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
            const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

            const is_active = Math.random() > 0.3; // 70% chance of being active
            const is_available = Math.random() > 0.2; // 80% chance of being available

            items.push({
                business_id: businessId,
                category_id: randomCategory._id,
                name: `${randomAdjective} ${randomNoun} ${i + 1}`,
                base_price: parseFloat((Math.random() * 20 + 5).toFixed(2)), // Random price between 5 and 25
                description: `A delicious ${randomAdjective.toLowerCase()} ${randomNoun.toLowerCase()} made with fresh ingredients.`,
                is_active: is_active,
                is_available: is_available,
                is_signature: Math.random() > 0.8, // 20% chance of being signature
                image: 'https://placehold.co/400x300', // Placeholder image
                code: `ITEM_${i + 100}`,
                unit: 'piece',
                max_per_order: 10,
                min_per_order: 1,
            });
        }

        // 5. Insert Items
        console.log(`Seeding ${items.length} items...`);
        await ItemModel.insertMany(items);
        console.log('🎉 Items seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding items:', error);
        process.exit(1);
    } finally {
        const mongoose = await import('mongoose');
        await mongoose.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};

seedItems();
