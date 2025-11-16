/**
 * Script to check vet locations in database
 * Run with: node server/scripts/checkVetLocations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

const checkVetLocations = async () => {
  try {
    await connectDB();
    console.log('Connected to database\n');

    // Get all vets
    const allVets = await User.find({ role: 'vet' }).select('name email phone location isAvailable onlineStatus');
    
    console.log(`Total vets in database: ${allVets.length}\n`);

    // Check vets with valid location
    const vetsWithLocation = allVets.filter((vet) => {
      return (
        vet.location &&
        vet.location.type === 'Point' &&
        vet.location.coordinates &&
        Array.isArray(vet.location.coordinates) &&
        vet.location.coordinates.length === 2 &&
        !isNaN(vet.location.coordinates[0]) &&
        !isNaN(vet.location.coordinates[1])
      );
    });

    console.log(`Vets with valid location: ${vetsWithLocation.length}`);
    console.log(`Vets without location: ${allVets.length - vetsWithLocation.length}\n`);

    // Show details
    console.log('=== Vets with location ===');
    vetsWithLocation.forEach((vet, index) => {
      const [lng, lat] = vet.location.coordinates;
      console.log(`${index + 1}. ${vet.name} (${vet.email})`);
      console.log(`   Location: ${lat}, ${lng}`);
      console.log(`   Available: ${vet.isAvailable !== false ? 'Yes' : 'No'}`);
      console.log(`   Online: ${vet.onlineStatus === true ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Show vets without location
    const vetsWithoutLocation = allVets.filter((vet) => !vetsWithLocation.includes(vet));
    if (vetsWithoutLocation.length > 0) {
      console.log('=== Vets without location ===');
      vetsWithoutLocation.forEach((vet, index) => {
        console.log(`${index + 1}. ${vet.name} (${vet.email})`);
        console.log(`   Location: ${vet.location ? 'Invalid format' : 'Not set'}`);
        console.log('');
      });
    }

    // Test Indore coordinates (Musakhedi, Indore)
    const indoreLat = 22.7196; // Approximate Indore latitude
    const indoreLng = 75.8577; // Approximate Indore longitude
    console.log(`\n=== Testing search near Indore (${indoreLat}, ${indoreLng}) ===`);
    
    const nearbyVets = vetsWithLocation.filter((vet) => {
      const [vetLng, vetLat] = vet.location.coordinates;
      // Simple distance check (rough calculation)
      const distance = Math.sqrt(
        Math.pow((vetLat - indoreLat) * 111000, 2) + 
        Math.pow((vetLng - indoreLng) * 111000 * Math.cos(vetLat * Math.PI / 180), 2)
      );
      return distance <= 25000; // 25km
    });

    console.log(`Vets within 25km of Indore: ${nearbyVets.length}`);
    nearbyVets.forEach((vet, index) => {
      const [lng, lat] = vet.location.coordinates;
      console.log(`${index + 1}. ${vet.name} - Location: ${lat}, ${lng}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking vet locations:', error);
    process.exit(1);
  }
};

checkVetLocations();

