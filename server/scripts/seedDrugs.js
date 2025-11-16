/**
 * Drug seeding script for livestock medicines
 * Run with: node server/scripts/seedDrugs.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Drug = require('../src/models/Drug');
const connectDB = require('../src/config/db');

// Helper function to get risk level based on drug type
const getRiskLevel = (drugName, category, isBanned) => {
  if (isBanned) return 'Critical';
  
  const highRiskDrugs = [
    'CHLORAMPHENICOL', 'COLISTIN', 'NITROFURAZONE', 'FURAZOLIDONE',
    'STREPTOMYCIN', 'KANAMYCIN', 'GENTAMICIN', 'ENROFLOXACIN',
    'TETRACYCLINE', 'DICLOFENAC'
  ];
  
  if (highRiskDrugs.includes(drugName.toUpperCase())) return 'High';
  if (category === 'antibiotic') return 'Medium';
  return 'Low';
};

// Helper function to get withdrawal periods
const getWithdrawalPeriods = (drugName, category) => {
  const drugUpper = drugName.toUpperCase();
  
  // High withdrawal drugs
  if (['GENTAMICIN', 'STREPTOMYCIN', 'KANAMYCIN', 'AMIKACIN'].includes(drugUpper)) {
    return { milk: 5, meat: 14 };
  }
  
  // Medium withdrawal
  if (['ENROFLOXACIN', 'CIPROFLOXACIN', 'LEVOFLOXACIN', 'NORFLOXACIN'].includes(drugUpper)) {
    return { milk: 2, meat: 10 };
  }
  
  // Standard antibiotic withdrawal
  if (category === 'antibiotic') {
    return { milk: 3, meat: 7 };
  }
  
  // Anti-inflammatory
  if (['MELOXICAM', 'FLUNIXIN', 'KETOPROFEN'].includes(drugUpper)) {
    return { milk: 1, meat: 5 };
  }
  
  // Anthelmintics
  if (category === 'antiparasitic') {
    return { milk: 0, meat: 7 };
  }
  
  // Default
  return { milk: 0, meat: 0 };
};

const seedDrugs = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Define all drugs with their properties
    const drugs = [
      // Antibiotics
      { name: 'Oxytetracycline', category: 'antibiotic', safeDosage: 20, unit: 'mg/kg' },
      { name: 'Tetracycline', category: 'antibiotic', safeDosage: 20, unit: 'mg/kg', risk: 'High' },
      { name: 'Doxycycline', category: 'antibiotic', safeDosage: 10, unit: 'mg/kg' },
      { name: 'Amoxicillin', category: 'antibiotic', safeDosage: 15, unit: 'mg/kg' },
      { name: 'Ampicillin', category: 'antibiotic', safeDosage: 15, unit: 'mg/kg' },
      { name: 'Penicillin G', category: 'antibiotic', safeDosage: 20000, unit: 'units/kg', risk: 'High' },
      { name: 'Ceftriaxone', category: 'antibiotic', safeDosage: 20, unit: 'mg/kg' },
      { name: 'Cefotaxime', category: 'antibiotic', safeDosage: 20, unit: 'mg/kg' },
      { name: 'Cephalexin', category: 'antibiotic', safeDosage: 25, unit: 'mg/kg' },
      { name: 'Enrofloxacin', category: 'antibiotic', safeDosage: 5, unit: 'mg/kg', risk: 'High' },
      { name: 'Ciprofloxacin', category: 'antibiotic', safeDosage: 5, unit: 'mg/kg', risk: 'High' },
      { name: 'Levofloxacin', category: 'antibiotic', safeDosage: 5, unit: 'mg/kg', risk: 'High' },
      { name: 'Norfloxacin', category: 'antibiotic', safeDosage: 5, unit: 'mg/kg', risk: 'High' },
      { name: 'Gentamicin', category: 'antibiotic', safeDosage: 5, unit: 'mg/kg', risk: 'High' },
      { name: 'Neomycin', category: 'antibiotic', safeDosage: 10, unit: 'mg/kg' },
      { name: 'Streptomycin', category: 'antibiotic', safeDosage: 10, unit: 'mg/kg', risk: 'High' },
      { name: 'Sulphamethoxazole', category: 'antibiotic', safeDosage: 25, unit: 'mg/kg' },
      { name: 'Trimethoprim', category: 'antibiotic', safeDosage: 5, unit: 'mg/kg' },
      { name: 'Chloramphenicol', category: 'antibiotic', safeDosage: 0, unit: 'mg/kg', banned: true, risk: 'Critical' },
      { name: 'Florfenicol', category: 'antibiotic', safeDosage: 20, unit: 'mg/kg' },
      { name: 'Amikacin', category: 'antibiotic', safeDosage: 10, unit: 'mg/kg', risk: 'High' },
      { name: 'Kanamycin', category: 'antibiotic', safeDosage: 10, unit: 'mg/kg', risk: 'High' },
      { name: 'Azithromycin', category: 'antibiotic', safeDosage: 10, unit: 'mg/kg' },
      { name: 'Clarithromycin', category: 'antibiotic', safeDosage: 10, unit: 'mg/kg' },
      { name: 'Erythromycin', category: 'antibiotic', safeDosage: 10, unit: 'mg/kg' },
      { name: 'Colistin', category: 'antibiotic', safeDosage: 0, unit: 'mg/kg', banned: true, risk: 'Critical' },
      { name: 'Nitrofurazone', category: 'antibiotic', safeDosage: 0, unit: 'mg/kg', banned: true, risk: 'Critical' },
      { name: 'Furazolidone', category: 'antibiotic', safeDosage: 0, unit: 'mg/kg', banned: true, risk: 'Critical' },
      
      // Anthelmintics
      { name: 'Albendazole', category: 'antiparasitic', safeDosage: 10, unit: 'mg/kg' },
      { name: 'Fenbendazole', category: 'antiparasitic', safeDosage: 10, unit: 'mg/kg' },
      { name: 'Ivermectin', category: 'antiparasitic', safeDosage: 0.2, unit: 'mg/kg' },
      { name: 'Moxidectin', category: 'antiparasitic', safeDosage: 0.2, unit: 'mg/kg' },
      { name: 'Levamisole', category: 'antiparasitic', safeDosage: 7.5, unit: 'mg/kg' },
      { name: 'Praziquantel', category: 'antiparasitic', safeDosage: 25, unit: 'mg/kg' },
      { name: 'Closantel', category: 'antiparasitic', safeDosage: 10, unit: 'mg/kg' },
      { name: 'Oxyclozanide', category: 'antiparasitic', safeDosage: 15, unit: 'mg/kg' },
      { name: 'Niclosamide', category: 'antiparasitic', safeDosage: 50, unit: 'mg/kg' },
      { name: 'Doramectin', category: 'antiparasitic', safeDosage: 0.2, unit: 'mg/kg' },
      
      // Anti-inflammatory
      { name: 'Meloxicam', category: 'other', safeDosage: 0.5, unit: 'mg/kg' },
      { name: 'Flunixin Meglumine', category: 'other', safeDosage: 2.2, unit: 'mg/kg' },
      { name: 'Ketoprofen', category: 'other', safeDosage: 3, unit: 'mg/kg' },
      { name: 'Diclofenac', category: 'other', safeDosage: 0, unit: 'mg/kg', banned: true, risk: 'Critical' },
      { name: 'Carprofen', category: 'other', safeDosage: 1.4, unit: 'mg/kg' },
      { name: 'Paracetamol', category: 'other', safeDosage: 10, unit: 'mg/kg' },
      { name: 'Prednisolone', category: 'hormone', safeDosage: 1, unit: 'mg/kg' },
      { name: 'Dexamethasone', category: 'hormone', safeDosage: 0.1, unit: 'mg/kg' },
      { name: 'Ibuprofen', category: 'other', safeDosage: 10, unit: 'mg/kg' },
      { name: 'Phenylbutazone', category: 'other', safeDosage: 4.4, unit: 'mg/kg' },
      
      // Antipyretics
      { name: 'Analgin', category: 'other', safeDosage: 50, unit: 'mg/kg' },
      
      // Anti-parasitics (External)
      { name: 'Cypermethrin', category: 'antiparasitic', safeDosage: 0.1, unit: 'mg/kg' },
      { name: 'Permethrin', category: 'antiparasitic', safeDosage: 0.1, unit: 'mg/kg' },
      { name: 'Amitraz', category: 'antiparasitic', safeDosage: 0.025, unit: 'mg/kg' },
      { name: 'Fipronil', category: 'antiparasitic', safeDosage: 0.1, unit: 'mg/kg' },
      { name: 'Deltamethrin', category: 'antiparasitic', safeDosage: 0.05, unit: 'mg/kg' },
      { name: 'Fluralaner', category: 'antiparasitic', safeDosage: 0.1, unit: 'mg/kg' },
      { name: 'Sarolaner', category: 'antiparasitic', safeDosage: 0.1, unit: 'mg/kg' },
      
      // Anti-diarrheal
      { name: 'Metronidazole', category: 'antibiotic', safeDosage: 15, unit: 'mg/kg' },
      
      // Reproductive
      { name: 'Oxytocin', category: 'hormone', safeDosage: 10, unit: 'units/kg' },
      
      // Supportive
      { name: 'B-Complex Injection', category: 'vitamin', safeDosage: 5, unit: 'ml/kg' },
      { name: 'Multivitamin Liquid', category: 'vitamin', safeDosage: 10, unit: 'ml/kg' },
      { name: 'Calcium Borogluconate', category: 'vitamin', safeDosage: 50, unit: 'ml/kg' },
      
      // Respiratory
      { name: 'Bromhexine', category: 'other', safeDosage: 0.5, unit: 'mg/kg' },
      { name: 'Theophylline', category: 'other', safeDosage: 10, unit: 'mg/kg' },
      { name: 'Salbutamol', category: 'other', safeDosage: 0.1, unit: 'mg/kg' },
      { name: 'Doxophylline', category: 'other', safeDosage: 5, unit: 'mg/kg' },
    ];

    console.log(`\nSeeding ${drugs.length} drugs...`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const drugData of drugs) {
      try {
        const drugName = drugData.name.toUpperCase();
        const riskLevel = drugData.risk || getRiskLevel(drugData.name, drugData.category, drugData.banned || false);
        const withdrawal = getWithdrawalPeriods(drugData.name, drugData.category);
        
        // Ensure dosageUnit is a valid enum value
        const validDosageUnits = ['mg/kg', 'ml/kg', 'units/kg'];
        const dosageUnit = validDosageUnits.includes(drugData.unit) 
          ? drugData.unit 
          : 'mg/kg'; // Default fallback
        
        const drugDoc = {
          drugName,
          category: drugData.category,
          mrlLimit: drugData.banned ? 0 : 0.1,
          mrlLimitUnit: 'mg/kg',
          withdrawalPeriodMilk: withdrawal.milk,
          withdrawalPeriodMeat: withdrawal.meat,
          riskLevel,
          safeDosageMgKg: drugData.safeDosage,
          dosageUnit: dosageUnit, // Use validated unit
          allowed: !drugData.banned,
          banned: drugData.banned || false,
          toxicityByAge: {
            calves: drugData.banned ? 'unsafe' : 'safe',
            adults: drugData.banned ? 'unsafe' : 'safe',
            pregnant: drugData.banned ? 'unsafe' : 'caution',
          },
          description: `${drugData.name} - ${drugData.category} for livestock treatment`,
          isActive: true,
        };

        const existingDrug = await Drug.findOne({ drugName });
        
        if (existingDrug) {
          // Validate before update
          try {
            await Drug.updateOne({ drugName }, drugDoc);
            updated++;
            console.log(`✓ Updated: ${drugData.name} (${dosageUnit})`);
          } catch (updateError) {
            console.error(`✗ Update error for ${drugData.name}:`, updateError.message);
            // Try to delete and recreate if update fails
            try {
              await Drug.deleteOne({ drugName });
              await Drug.create(drugDoc);
              created++;
              console.log(`✓ Recreated: ${drugData.name} (${dosageUnit})`);
            } catch (recreateError) {
              console.error(`✗ Recreate error for ${drugData.name}:`, recreateError.message);
              skipped++;
            }
          }
        } else {
          // Validate before create
          try {
            await Drug.create(drugDoc);
            created++;
            console.log(`✓ Created: ${drugData.name} (${dosageUnit})`);
          } catch (createError) {
            console.error(`✗ Create error for ${drugData.name}:`, createError.message);
            console.error(`  dosageUnit value: "${dosageUnit}"`);
            console.error(`  Valid units: ${validDosageUnits.join(', ')}`);
            skipped++;
          }
        }
      } catch (error) {
        console.error(`✗ Error with ${drugData.name}:`, error.message);
        if (error.errors) {
          console.error(`  Validation errors:`, error.errors);
        }
        skipped++;
      }
    }

    console.log('\n✅ Drug seeding completed!');
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${created + updated}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding drugs:', error);
    process.exit(1);
  }
};

seedDrugs();

