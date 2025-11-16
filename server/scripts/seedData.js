/**
 * Dummy data seeding script for testing
 * Run with: node server/scripts/seedData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Animal = require('../src/models/Animal');
const Treatment = require('../src/models/Treatment');
const LabTest = require('../src/models/LabTest');
const connectDB = require('../src/config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Animal.deleteMany({});
    await Treatment.deleteMany({});
    await LabTest.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const farmer1 = await User.create({
      name: 'Ram Singh',
      email: 'farmer1@example.com',
      password: 'password123',
      role: 'farmer',
      phone: '+919876543210',
    });

    const farmer2 = await User.create({
      name: 'Shyam Prasad',
      email: 'farmer2@example.com',
      password: 'password123',
      role: 'farmer',
      phone: '+919876543211',
    });

    const vet = await User.create({
      name: 'Dr. Rajanish Kumar',
      email: 'vet@example.com',
      password: 'password123',
      role: 'vet',
      phone: '+919876543212',
    });

    const labOfficer = await User.create({
      name: 'Lab Officer John',
      email: 'lab@example.com',
      password: 'password123',
      role: 'lab',
      phone: '+919876543213',
    });

    const regulator = await User.create({
      name: 'Regulator Officer',
      email: 'regulator@example.com',
      password: 'password123',
      role: 'regulator',
      phone: '+919876543214',
    });

    console.log('Created users');

    // Create animals
    const animals = [];
    for (let i = 1; i <= 5; i++) {
      const animal = await Animal.create({
        farmerId: farmer1._id,
        pashuAadhaarId: `PASHU-2025-${String(i).padStart(4, '0')}`,
        species: i % 2 === 0 ? 'cow' : 'buffalo',
        breed: 'Holstein',
        age: 3 + i,
        ageUnit: 'years',
        gender: i % 2 === 0 ? 'female' : 'male',
        healthStatus: i % 2 === 0 ? 'healthy' : 'under_treatment',
        weight: 300 + i * 20,
        weightUnit: 'kg',
        location: {
          village: 'Village ' + i,
          district: 'District A',
          state: 'Madhya Pradesh',
        },
      });
      animals.push(animal);
    }

    console.log('Created animals');

    // Create treatments
    for (let i = 0; i < 3; i++) {
      const withdrawalEndDate = new Date();
      withdrawalEndDate.setDate(withdrawalEndDate.getDate() + (i + 1) * 7);

      await Treatment.create({
        farmerId: farmer1._id,
        animalId: animals[i]._id,
        vetId: vet._id,
        medicine: ['Oxytetracycline', 'Penicillin', 'Streptomycin'][i],
        drugType: 'antibiotic',
        dosage: 50 + i * 10,
        dosageUnit: 'mg',
        frequency: ['once', 'twice', 'once'][i],
        duration: 5 + i,
        durationUnit: 'days',
        dateGiven: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        withdrawalPeriod: 21 + i * 7,
        withdrawalPeriodUnit: 'days',
        withdrawalEndDate,
        status: 'active',
        notes: `Treatment notes for animal ${i + 1}`,
      });
    }

    console.log('Created treatments');

    // Create lab tests
    for (let i = 0; i < 3; i++) {
      await LabTest.create({
        sampleId: `SAMPLE-2025-${String(i + 1).padStart(4, '0')}`,
        animalId: animals[i]._id,
        farmerId: farmer1._id,
        labOfficerId: labOfficer._id,
        medicineTested: ['Oxytetracycline', 'Penicillin', 'Streptomycin'][i],
        mrlValue: i === 0 ? 0.02 : i === 1 ? 0.15 : 0.03, // Second one fails
        mrlUnit: 'mg/kg',
        allowedLimit: 0.04,
        status: i === 1 ? 'fail' : 'pass',
        testDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        notes: `Test notes for sample ${i + 1}`,
      });
    }

    console.log('Created lab tests');

    console.log('\n✅ Seed data created successfully!');
    console.log('\nTest credentials:');
    console.log('Farmer: farmer1@example.com / password123');
    console.log('Vet: vet@example.com / password123');
    console.log('Lab: lab@example.com / password123');
    console.log('Regulator: regulator@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

