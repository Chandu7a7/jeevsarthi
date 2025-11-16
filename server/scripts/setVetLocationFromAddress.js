/**
 * Set vet location from address using geocoding
 * Run with: node server/scripts/setVetLocationFromAddress.js <email> <address>
 * Example: node server/scripts/setVetLocationFromAddress.js vet@example.com "Musakhedi, Indore, Madhya Pradesh 452001"
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');
const axios = require('axios');

// Simple geocoding function (using Nominatim OpenStreetMap API - free)
const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'JEEVSARTHI-Vet-Location-Setter',
      },
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
};

const setVetLocationFromAddress = async () => {
  try {
    await connectDB();
    console.log('Connected to database\n');

    const args = process.argv.slice(2);

    if (args.length < 2) {
      console.log('Usage: node setVetLocationFromAddress.js <email> <address>');
      console.log('Example: node setVetLocationFromAddress.js vet@example.com "Musakhedi, Indore, Madhya Pradesh 452001"');
      process.exit(1);
    }

    const [email, ...addressParts] = args;
    const address = addressParts.join(' ');

    console.log(`Looking up address: ${address}`);
    const geocodeResult = await geocodeAddress(address);

    if (!geocodeResult) {
      console.error('Error: Could not geocode address. Please check the address.');
      process.exit(1);
    }

    console.log(`Found location: ${geocodeResult.lat}, ${geocodeResult.lng}`);
    console.log(`Address: ${geocodeResult.displayName}\n`);

    // Find vet by email
    const vet = await User.findOne({ email, role: 'vet' });

    if (!vet) {
      console.error(`Error: Veterinarian with email ${email} not found`);
      process.exit(1);
    }

    // Update location
    vet.location = {
      type: 'Point',
      coordinates: [geocodeResult.lng, geocodeResult.lat], // MongoDB uses [lng, lat]
    };
    vet.isAvailable = true;
    vet.onlineStatus = true;

    await vet.save();

    console.log(`✅ Successfully updated location for ${vet.name} (${vet.email})`);
    console.log(`   Location: ${geocodeResult.lat}, ${geocodeResult.lng}`);
    console.log(`   Address: ${geocodeResult.displayName}`);
    console.log(`   Available: ${vet.isAvailable}`);
    console.log(`   Online: ${vet.onlineStatus}`);

    process.exit(0);
  } catch (error) {
    console.error('Error setting vet location:', error);
    process.exit(1);
  }
};

setVetLocationFromAddress();

