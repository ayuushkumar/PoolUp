// config/adminSetup.js
const User = require('../models/User');

module.exports.initializeAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      await User.create({ 
        email: process.env.ADMIN_EMAIL, 
        password: process.env.ADMIN_PASSWORD, 
        role: 'admin', 
        name: 'Admin User' 
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (err) {
    console.error('Error creating admin:', err.message);
  }
};