/**
 * Script to update veterinarian location
 * Usage: node src/scripts/updateVetLocation.js <email> <latitude> <longitude>
 * Example: node src/scripts/updateVetLocation.js vet@example.com 28.6139 77.2090
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const updateVetLocation = async () => {
  try {
    // Connect to database
    await connectDB();

    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('Usage: node updateVetLocation.js <email> <latitude> <longitude>');
      console.log('Example: node updateVetLocation.js vet@example.com 28.6139 77.2090');
      process.exit(1);
    }

    const [email, lat, lng] = args;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      console.error('Error: Latitude and longitude must be valid numbers');
      process.exit(1);
    }

    // Find vet by email
    const vet = await User.findOne({ email, role: 'vet' });

    if (!vet) {
      console.error(`Error: Veterinarian with email ${email} not found`);
      process.exit(1);
    }

    // Update location
    vet.location = {
      type: 'Point',
      coordinates: [longitude, latitude], // MongoDB uses [lng, lat]
    };
    vet.isAvailable = true;
    vet.onlineStatus = true;

    await vet.save();

    console.log(`✅ Successfully updated location for ${vet.name} (${vet.email})`);
    console.log(`   Location: ${latitude}, ${longitude}`);
    console.log(`   Available: ${vet.isAvailable}`);
    console.log(`   Online: ${vet.onlineStatus}`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating vet location:', error);
    process.exit(1);
  }
};

updateVetLocation();

