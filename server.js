// server.js
const { app, server } = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { initializeAdminUser } = require('./config/adminSetup');

dotenv.config();

// Add connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000 // Wait up to 5 seconds
};

// This 'if' check is CRITICAL
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => {
      console.log('MongoDB connected successfully');
      initializeAdminUser(); 
      const PORT = process.env.PORT || 3000;
      server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
  });
}