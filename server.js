// server.js
const { app, server } = require('./app'); // Import the app and server
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Import User for admin creation

// Load environment variables
dotenv.config();

// Admin creation function
const createAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (!adminExists) {
            await User.create({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin', name: 'Admin User' });
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (err) {
        console.error('Error creating admin:', err.message);
    }
};

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected successfully');
    
    // Create admin user *after* DB is connected
    createAdmin();
    
    // Start Server *after* DB is connected
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
});