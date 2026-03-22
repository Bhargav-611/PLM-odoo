const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const Product = require('../backend/models/Product');
const ProductVersion = require('../backend/models/ProductVersion');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/plm')
    .then(async () => {
        console.log('Connected to DB');
        const products = await Product.find().populate('currentVersionId').exec();
        console.log('--- PRODUCTS IMAGES ---');
        products.forEach(p => {
            console.log(`Product: ${p.name}`);
            console.log(`Image: ${p.currentVersionId?.image}`);
        });
        mongoose.disconnect();
    })
    .catch(console.error);
