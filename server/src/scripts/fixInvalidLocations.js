/**
 * Fix invalid location objects in User collection
 * Removes location field if it has type but no valid coordinates
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const fixInvalidLocations = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jeevsarthi';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find all users with location field
    const allUsers = await User.find({ 'location': { $exists: true } });
    console.log(`Found ${allUsers.length} users with location field`);
    
    // Filter users with invalid location (type exists but coordinates missing/invalid)
    const users = allUsers.filter(user => {
      const location = user.location;
      if (!location) return false;
      
      // Invalid if type exists but coordinates are missing or invalid
      const hasType = location.type && location.type === 'Point';
      const hasValidCoords = location.coordinates && 
                             Array.isArray(location.coordinates) && 
                             location.coordinates.length === 2 &&
                             typeof location.coordinates[0] === 'number' &&
                             typeof location.coordinates[1] === 'number';
      
      return hasType && !hasValidCoords;
    });

    console.log(`Found ${users.length} users with invalid location`);

    // Fix each user
    for (const user of users) {
      console.log(`Fixing user: ${user.email} (${user._id})`);
      user.location = undefined;
      await user.save();
      console.log(`✅ Fixed user: ${user.email}`);
    }

    console.log(`\n✅ Successfully fixed ${users.length} users`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing locations:', error);
    process.exit(1);
  }
};

// Run the fix
fixInvalidLocations();

