const Treatment = require('../models/Treatment');
const Animal = require('../models/Animal');
const Drug = require('../models/Drug');
const Alert = require('../models/Alert');
const BlockchainRecord = require('../models/BlockchainRecord');
const User = require('../models/User');
const { generateHash } = require('../config/blockchain');
const { emitAlert } = require('../sockets/alertSocket');

/**
 * Calculate withdrawal end date
 */
const calculateWithdrawalEndDate = (dateGiven, withdrawalPeriodDays) => {
  const endDate = new Date(dateGiven);
  endDate.setDate(endDate.getDate() + withdrawalPeriodDays);
  return endDate;
};

/**
 * Check for drug interactions
 */
const checkDrugInteractions = async (animalId, newMedicine) => {
  try {
    // Get last 2 treatments for this animal
    const recentTreatments = await Treatment.find({
      animalId,
      status: 'active',
      dateGiven: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    })
      .sort({ dateGiven: -1 })
      .limit(2)
      .select('medicine');

    if (recentTreatments.length === 0) return null;

    // Get drug details for new medicine
    const newDrug = await Drug.findOne({ drugName: newMedicine.toUpperCase() });
    if (!newDrug || !newDrug.interactions || newDrug.interactions.length === 0) {
      return null;
    }

    // Check if any recent medicine interacts with new medicine
    const interactions = [];
    for (const treatment of recentTreatments) {
      const recentDrug = await Drug.findOne({
        drugName: treatment.medicine.toUpperCase(),
      });
      if (recentDrug) {
        // Check if new drug is in recent drug's interactions
        if (recentDrug.interactions.includes(newMedicine.toUpperCase())) {
          interactions.push({
            medicine: treatment.medicine,
            conflict: newMedicine,
          });
        }
        // Check if recent drug is in new drug's interactions
        if (newDrug.interactions.includes(treatment.medicine.toUpperCase())) {
          interactions.push({
            medicine: treatment.medicine,
            conflict: newMedicine,
          });
        }
      }
    }

    return interactions.length > 0 ? interactions : null;
  } catch (error) {
    console.error('Error checking drug interactions:', error);
    return null;
  }
};

/**
 * Calculate risk score
 */
const calculateRiskScore = (drug, dosage, animalAge, animalAgeUnit) => {
  let riskScore = 0;

  // Base risk from drug risk level
  const riskLevelScores = {
    Low: 10,
    Medium: 30,
    High: 60,
    Critical: 90,
  };
  riskScore += riskLevelScores[drug.riskLevel] || 30;

  // Dosage factor (if exceeds safe dosage)
  if (dosage > drug.safeDosageMgKg) {
    const overdoseRatio = dosage / drug.safeDosageMgKg;
    if (overdoseRatio > 2) {
      riskScore += 30; // Severe overdose
    } else if (overdoseRatio > 1.5) {
      riskScore += 20; // Moderate overdose
    } else {
      riskScore += 10; // Mild overdose
    }
  }

  // Frequency factor (higher frequency = higher risk)
  // This will be handled in the main function

  // Age toxicity factor
  const ageInMonths =
    animalAgeUnit === 'years' ? animalAge * 12 : animalAge;
  if (ageInMonths < 6) {
    // Calves
    if (drug.toxicityByAge?.calves === 'unsafe') {
      riskScore += 20;
    } else if (drug.toxicityByAge?.calves === 'caution') {
      riskScore += 10;
    }
  }

  // Cap at 100
  return Math.min(riskScore, 100);
};

/**
 * Add treatment with comprehensive checks
 */
const addTreatment = async (treatmentData, io = null) => {
  const {
    farmerId,
    animalId,
    vetId,
    medicine,
    dosage,
    frequency,
    duration,
    dateGiven,
    notes,
    symptoms,
    images,
  } = treatmentData;

  // Get animal
  const animal = await Animal.findById(animalId).populate('farmerId');
  if (!animal || animal.farmerId._id.toString() !== farmerId.toString()) {
    throw new Error('Animal not found or access denied');
  }

  // Get drug from database
  const drug = await Drug.findOne({
    drugName: medicine.toUpperCase(),
    isActive: true,
  });

  if (!drug) {
    throw new Error(
      `Medicine "${medicine}" not found in database. Please use a valid medicine name.`
    );
  }

  // Check if drug is banned
  if (drug.banned) {
    // Create instant violation alert
    await Alert.create({
      farmerId,
      animalId,
      type: 'violation',
      title: 'Banned Drug Detected',
      message: `The drug "${medicine}" is banned and cannot be used. Please contact a veterinarian immediately.`,
      severity: 'critical',
      actionRequired: true,
      metadata: {
        drug: medicine,
        reason: 'Banned drug',
      },
    });

    // Emit socket alert
    if (io) {
      emitAlert(io, farmerId, {
        type: 'violation',
        title: 'Banned Drug Detected',
        message: `The drug "${medicine}" is banned.`,
        severity: 'critical',
      });
    }

    throw new Error(`The drug "${medicine}" is banned and cannot be used.`);
  }

  // Check if drug is allowed
  if (!drug.allowed) {
    await Alert.create({
      farmerId,
      animalId,
      type: 'warning',
      title: 'Restricted Drug Usage',
      message: `The drug "${medicine}" is restricted. Please ensure proper authorization.`,
      severity: 'high',
      actionRequired: true,
    });
  }

  // Calculate withdrawal period (use milk withdrawal for dairy animals)
  const isDairyAnimal = animal.farmType === 'dairy' || animal.species === 'cow' || animal.species === 'buffalo';
  const withdrawalPeriodDays = isDairyAnimal
    ? drug.withdrawalPeriodMilk
    : drug.withdrawalPeriodMeat;

  // Calculate withdrawal end date
  const treatmentDate = dateGiven ? new Date(dateGiven) : new Date();
  const withdrawalEndDate = calculateWithdrawalEndDate(
    treatmentDate,
    withdrawalPeriodDays
  );

  // Check for drug interactions
  const interactions = await checkDrugInteractions(animalId, medicine);
  if (interactions) {
    await Alert.create({
      farmerId,
      animalId,
      type: 'warning',
      title: 'Drug Interaction Warning',
      message: `Warning: ${medicine} may interact with recently administered drugs: ${interactions.map(i => i.medicine).join(', ')}. Please consult a veterinarian.`,
      severity: 'high',
      actionRequired: true,
      metadata: {
        interactions,
      },
    });
  }

  // Check for overdose
  let overdoseDetected = false;
  if (dosage > drug.safeDosageMgKg) {
    overdoseDetected = true;
    await Alert.create({
      farmerId,
      animalId,
      type: 'violation',
      title: 'Overdose Detected',
      message: `High dosage detected for ${medicine}. Dosage: ${dosage} ${drug.dosageUnit} exceeds safe limit of ${drug.safeDosageMgKg} ${drug.dosageUnit}.`,
      severity: 'critical',
      actionRequired: true,
      metadata: {
        dosage,
        safeLimit: drug.safeDosageMgKg,
        unit: drug.dosageUnit,
      },
    });
  }

  // Calculate risk score
  const riskScore = calculateRiskScore(
    drug,
    dosage,
    animal.age,
    animal.ageUnit
  );

  // Frequency factor for risk score
  const frequencyFactors = {
    once: 0,
    twice: 5,
    thrice: 10,
    daily: 15,
    weekly: 5,
  };
  const finalRiskScore = Math.min(
    riskScore + (frequencyFactors[frequency] || 0),
    100
  );

  // MRL risk prediction
  let mrlRiskAlert = null;
  if (drug.riskLevel === 'High' || drug.riskLevel === 'Critical') {
    mrlRiskAlert = await Alert.create({
      farmerId,
      animalId,
      type: 'warning',
      title: 'High MRL Risk',
      message: `The drug "${medicine}" has a high MRL risk (${drug.riskLevel}). Ensure proper withdrawal period is followed. MRL Limit: ${drug.mrlLimit} ${drug.mrlLimitUnit}.`,
      severity: drug.riskLevel === 'Critical' ? 'critical' : 'high',
      actionRequired: true,
      metadata: {
        mrlLimit: drug.mrlLimit,
        mrlLimitUnit: drug.mrlLimitUnit,
        riskLevel: drug.riskLevel,
      },
    });
  }

  // Convert Drug dosageUnit to Treatment dosageUnit format
  // Drug has: 'mg/kg', 'ml/kg', 'units/kg'
  // Treatment expects: 'mg', 'ml', 'units'
  const convertDosageUnit = (drugUnit) => {
    if (drugUnit === 'mg/kg') return 'mg';
    if (drugUnit === 'ml/kg') return 'ml';
    if (drugUnit === 'units/kg') return 'units';
    // Fallback: try to extract the base unit
    if (drugUnit.includes('mg')) return 'mg';
    if (drugUnit.includes('ml')) return 'ml';
    if (drugUnit.includes('units')) return 'units';
    return 'mg'; // Default fallback
  };

  const treatmentDosageUnit = convertDosageUnit(drug.dosageUnit);

  // Create treatment
  const treatment = await Treatment.create({
    farmerId,
    animalId,
    vetId: vetId || null,
    medicine,
    drugType: drug.category,
    dosage,
    dosageUnit: treatmentDosageUnit, // Use converted unit
    frequency,
    duration: duration || 1,
    durationUnit: 'days',
    dateGiven: treatmentDate,
    withdrawalPeriod: withdrawalPeriodDays,
    withdrawalPeriodUnit: 'days',
    withdrawalEndDate,
    status: vetId ? 'active' : 'pending', // If no vet, mark as pending
    notes,
    symptoms,
    images: images || [],
    riskScore: finalRiskScore,
  });

  // Generate blockchain hash
  const hashData = {
    type: 'treatment',
    treatmentId: treatment._id,
    animalId: treatment.animalId,
    farmerId: treatment.farmerId,
    medicine: treatment.medicine,
    dosage: treatment.dosage,
    dateGiven: treatment.dateGiven,
    withdrawalEndDate: treatment.withdrawalEndDate,
    riskScore: treatment.riskScore,
    timestamp: new Date(),
  };

  const blockchainHash = generateHash(hashData);
  treatment.blockchainHash = blockchainHash;
  await treatment.save();

  // Save to blockchain record
  await BlockchainRecord.create({
    hash: blockchainHash,
    type: 'treatment',
    referenceId: treatment._id,
    referenceModel: 'Treatment',
    data: hashData,
  });

  // Alert vet if farmer added treatment without vet approval
  if (!vetId) {
    // Find nearby vets or assigned vets
    const alertMessage = await Alert.create({
      farmerId,
      animalId,
      treatmentId: treatment._id,
      type: 'warning',
      title: 'Treatment Added Without Vet Approval',
      message: `A treatment for ${medicine} has been added by farmer. Please review and verify.`,
      severity: 'medium',
      actionRequired: true,
      metadata: {
        treatmentId: treatment._id,
        medicine,
        farmerId,
      },
    });

    // Emit socket event to vets (you can implement vet notification logic here)
    if (io) {
      // Notify all vets (or implement a better targeting mechanism)
      io.emit('treatment:new', {
        treatmentId: treatment._id,
        farmerId,
        animalId,
        medicine,
        message: 'New treatment requires vet verification',
      });
    }
  }

  // Create withdrawal period alert (will be checked by scheduler)
  await Alert.create({
    farmerId,
    animalId,
    treatmentId: treatment._id,
    type: 'warning',
    title: 'Withdrawal Period Active',
    message: `Withdrawal period for ${medicine} ends on ${withdrawalEndDate.toLocaleDateString()}. Do not sell milk/meat until then.`,
    severity: 'high',
    actionRequired: true,
    metadata: {
      withdrawalEndDate,
      medicine,
    },
  });

  // Emit socket alerts
  if (io) {
    // Emit to farmer
    emitAlert(io, farmerId, {
      type: overdoseDetected ? 'violation' : 'warning',
      title: overdoseDetected ? 'Overdose Detected' : 'Treatment Added',
      message: overdoseDetected
        ? `Overdose detected for ${medicine}`
        : `Treatment for ${medicine} added successfully. Withdrawal period ends on ${withdrawalEndDate.toLocaleDateString()}.`,
      severity: overdoseDetected ? 'critical' : 'medium',
    });

    // Emit to vet if assigned
    if (vetId) {
      emitAlert(io, vetId, {
        type: 'safe',
        title: 'Treatment Added',
        message: `Treatment for ${medicine} has been added.`,
        severity: 'low',
      });
    }
  }

  return {
    success: true,
    message: 'Treatment added successfully',
    data: {
      treatment,
      withdrawalEndDate,
      blockchainHash,
      riskScore: finalRiskScore,
      alerts: {
        overdose: overdoseDetected,
        interactions: interactions !== null,
        mrlRisk: mrlRiskAlert !== null,
        banned: false,
      },
    },
  };
};

/**
 * Get drug by name
 */
const getDrugByName = async (drugName) => {
  const drug = await Drug.findOne({
    drugName: drugName.toUpperCase(),
    isActive: true,
  });
  return drug;
};

/**
 * Search drugs
 */
const searchDrugs = async (searchTerm) => {
  // Clean and prepare search term
  const cleanTerm = searchTerm.trim();
  if (!cleanTerm) {
    return {
      success: true,
      data: [],
    };
  }

  // Escape special regex characters
  const escapedTerm = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create regex patterns - prioritize matches from start
  const startsWithPattern = new RegExp(`^${escapedTerm}`, 'i');
  const containsPattern = new RegExp(escapedTerm, 'i');
  
  const drugs = await Drug.find({
    isActive: true,
    $or: [
      { drugName: startsWithPattern }, // Match from start (higher priority)
      { drugName: containsPattern }, // Match anywhere
      { description: containsPattern },
      { category: containsPattern },
    ],
  })
    .sort({ 
      // Sort: exact matches first, then starts with, then contains
      drugName: 1 
    })
    .limit(30) // Increased limit for better results
    .select('drugName category mrlLimit withdrawalPeriodMilk withdrawalPeriodMeat riskLevel safeDosageMgKg dosageUnit toxicityByAge allowed banned interactions alternatives description');

  return {
    success: true,
    data: drugs,
  };
};

/**
 * Get treatments
 */
const getTreatments = async (userId, userRole, filters = {}) => {
  const query = {};

  if (userRole === 'farmer') {
    query.farmerId = userId;
  } else if (userRole === 'vet') {
    query.vetId = userId;
  }

  if (filters.animalId) {
    query.animalId = filters.animalId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const treatments = await Treatment.find(query)
    .populate('animalId', 'pashuAadhaarId animalName species')
    .populate('farmerId', 'name email phone')
    .populate('vetId', 'name email')
    .sort({ dateGiven: -1 });

  return {
    success: true,
    data: treatments,
  };
};

module.exports = {
  addTreatment,
  getTreatments,
  getDrugByName,
  searchDrugs,
};
