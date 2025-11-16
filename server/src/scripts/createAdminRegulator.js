const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

/**
 * Create admin regulator account
 * Email: chandu7a7@gmail.com
 * Password: Chandu@123
 */
const createAdminRegulator = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'chandu7a7@gmail.com';
    const adminPassword = 'Chandu@123';

    // Check if user with this email already exists (regardless of role)
    let existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      console.log('User with this email already exists. Updating to regulator role...');
      
      // Update to regulator role and password
      existingUser.role = 'regulator';
      existingUser.password = adminPassword;
      existingUser.name = existingUser.name || 'Admin Regulator';
      existingUser.isActive = true;
      await existingUser.save();
      
      console.log('Admin regulator account updated successfully');
      console.log('Email:', existingUser.email);
      console.log('Role:', existingUser.role);
    } else {
      // Create new admin regulator
      const admin = await User.create({
        name: 'Admin Regulator',
        email: adminEmail,
        password: adminPassword,
        role: 'regulator',
        isActive: true,
      });

      console.log('Admin regulator account created successfully');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin regulator:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  createAdminRegulator();
}

module.exports = createAdminRegulator;

