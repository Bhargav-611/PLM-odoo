require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const ecoRoutes = require('./routes/ecoRoutes');
const reportRoutes = require('./routes/reportRoutes');
const bomRoutes = require('./routes/bomRoutes');

const app = express();
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/eco', ecoRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/bom', bomRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
