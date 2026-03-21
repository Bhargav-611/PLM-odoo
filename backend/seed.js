require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
    { name: 'Smartphone Pro', version: 1, status: 'ACTIVE' },
    { name: 'Smartwatch X', version: 1, status: 'ACTIVE' },
    { name: 'Tablet Ultra', version: 1, status: 'ACTIVE' },
    { name: 'Old Phone G1', version: 3, status: 'ARCHIVED' },
    { name: 'Laptop Air', version: 2, status: 'ACTIVE' }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Product.deleteMany({});
        console.log('Existing products cleared');

        await Product.insertMany(products);
        console.log('Mock products seeded successfully');

        process.exit();
    } catch (err) {
        console.error('Error seeding products:', err);
        process.exit(1);
    }
};

seedProducts();
