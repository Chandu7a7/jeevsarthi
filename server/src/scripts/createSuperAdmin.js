const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

/**
 * Create Super Admin account
 * Email: superadmin@jeevsarthi.gov.in
 * Password: Admin@123
 */
const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'superadmin@jeevsarthi.gov.in';
    const adminPassword = 'Admin@123';

    // Check if user with this email already exists
    let existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      console.log('⚠️  User with this email already exists. Updating to super_admin role...');
      
      // Update to super_admin role and password
      existingUser.role = 'super_admin';
      existingUser.password = adminPassword;
      existingUser.name = existingUser.name || 'Super Admin';
      existingUser.isActive = true;
      await existingUser.save();
      
      console.log('✅ Super Admin account updated successfully!');
      console.log('📧 Email:', existingUser.email);
      console.log('🔑 Password:', adminPassword);
      console.log('👤 Role:', existingUser.role);
    } else {
      // Create new super admin
      const admin = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin',
        isActive: true,
      });

      console.log('✅ Super Admin account created successfully!');
      console.log('📧 Email:', admin.email);
      console.log('🔑 Password:', adminPassword);
      console.log('👤 Role:', admin.role);
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  createSuperAdmin();
}

module.exports = createSuperAdmin;

