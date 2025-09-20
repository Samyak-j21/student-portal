const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// This single middleware correctly handles all CORS issues
app.use(cors({
    origin: 'https://student-portal-zeta-ashen.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token']
}));

// Essential Middleware - Order is critical!
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully!');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};
connectDB();

// Define all API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/files', require('./routes/files'));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});