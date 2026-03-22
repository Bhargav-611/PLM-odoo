const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env
dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const Product = require('./backend/models/Product');
const ProductVersion = require('./backend/models/ProductVersion');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/PLM_odoo')
    .then(async () => {
        const products = await Product.find().populate('currentVersionId').exec();
        let log = '--- PRODUCTS IMAGES ---\n';
        products.forEach(p => {
            log += `Product: ${p.name}\nImage: ${p.currentVersionId?.image || 'NULL'}\n\n`;
        });
        fs.writeFileSync('output.txt', log);
        console.log('Done');
        process.exit(0);
    })
    .catch(err => {
        fs.writeFileSync('output.txt', err.stack);
        process.exit(1);
    });
