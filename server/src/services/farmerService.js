const Animal = require('../models/Animal');
const Treatment = require('../models/Treatment');
const Alert = require('../models/Alert');
const LabTest = require('../models/LabTest');
const FarmerProfile = require('../models/FarmerProfile');
const User = require('../models/User');
const { generateQRCode, generateQRURL } = require('../utils/generateQR');
const { generateHash } = require('../config/blockchain');

/**
 * Generate Pashu Aadhaar ID
 */
const generatePashuAadhaarId = () => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digit random number
  return `PASHU-${randomDigits}`;
};

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let years = today.getFullYear() - birthDate.getFullYear();
  const months = today.getMonth() - birthDate.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
  }
  
  const totalMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                      (today.getMonth() - birthDate.getMonth());
  
  if (totalMonths < 12) {
    return { age: totalMonths, ageUnit: 'months' };
  }
  return { age: years, ageUnit: 'years' };
};

/**
 * Register new animal
 */
const registerAnimal = async (farmerId, animalData) => {
  // Generate Pashu Aadhaar ID if not provided
  if (!animalData.pashuAadhaarId) {
    let pashuAadhaarId;
    let isUnique = false;
    while (!isUnique) {
      pashuAadhaarId = generatePashuAadhaarId();
      const existing = await Animal.findOne({ pashuAadhaarId });
      if (!existing) {
        isUnique = true;
      }
    }
    animalData.pashuAadhaarId = pashuAadhaarId;
  }

  // Calculate age from date of birth if provided
  if (animalData.dateOfBirth && !animalData.age) {
    const ageData = calculateAge(animalData.dateOfBirth);
    if (ageData) {
      animalData.age = ageData.age;
      animalData.ageUnit = ageData.ageUnit;
    }
  }

  // Generate tagId if not provided (use Pashu Aadhaar ID as default)
  if (!animalData.tagId && animalData.pashuAadhaarId) {
    animalData.tagId = animalData.pashuAadhaarId;
  }

  // Generate QR code URL
  const { generateQRToken } = require('../utils/hmac');
  const BASE_URL = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  const token = generateQRToken(animalData.tagId || animalData.pashuAadhaarId);
  animalData.qrCodeUrl = `${BASE_URL}/scan?tagId=${animalData.tagId || animalData.pashuAadhaarId}&token=${token}`;

  const animal = await Animal.create({
    ...animalData,
    farmerId,
  });

  // Generate QR code (will auto-detect network IP if FRONTEND_URL not set)
  const qrData = generateQRURL(
    process.env.FRONTEND_URL, // Pass undefined to auto-detect network IP
    'verify',
    animal.pashuAadhaarId
  );
  
  // Log QR code URL for debugging (first animal only)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📱 QR Code URL: ${qrData}`);
    console.log(`💡 To scan from mobile, ensure your phone is on the same network and use this URL`);
  }
  
  const qrCode = await generateQRCode(qrData);

  animal.qrCode = qrCode;
  await animal.save();

  return {
    success: true,
    message: 'Animal registered successfully',
    data: animal,
  };
};

/**
 * Get farmer's animals
 */
const getFarmerAnimals = async (farmerId) => {
  const animals = await Animal.find({ farmerId, isActive: true })
    .populate('farmerId', 'name email')
    .sort({ createdAt: -1 });

  return {
    success: true,
    data: animals,
  };
};

/**
 * Get animal by Pashu Aadhaar ID (public access for QR scanning)
 */
const getAnimalByPashuAadhaarId = async (pashuAadhaarId) => {
  const animal = await Animal.findOne({ pashuAadhaarId, isActive: true })
    .populate('farmerId', 'name email phone');

  if (!animal) {
    return {
      success: false,
      message: 'Animal not found',
    };
  }

  return {
    success: true,
    data: animal,
  };
};

/**
 * Get farmer dashboard stats
 */
const getFarmerDashboard = async (farmerId) => {
  // Get animals count
  const totalAnimals = await Animal.countDocuments({ farmerId, isActive: true });

  // Get active treatments
  const activeTreatments = await Treatment.countDocuments({
    farmerId,
    status: 'active',
  });

  // Get unread alerts
  const unreadAlerts = await Alert.countDocuments({
    farmerId,
    readStatus: false,
  });

  // Get MRL compliance (from lab tests)
  const totalTests = await LabTest.countDocuments({ farmerId });
  const passedTests = await LabTest.countDocuments({
    farmerId,
    status: 'pass',
  });
  const complianceRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 100;

  // Get AMU usage (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const treatments = await Treatment.find({
    farmerId,
    dateGiven: { $gte: thirtyDaysAgo },
  }).select('medicine dosage dateGiven drugType');

  // Calculate daily AMU usage
  const dailyUsage = {};
  treatments.forEach((treatment) => {
    const date = new Date(treatment.dateGiven).toISOString().split('T')[0];
    if (!dailyUsage[date]) {
      dailyUsage[date] = 0;
    }
    dailyUsage[date] += treatment.dosage || 0;
  });

  // Get drug distribution
  const drugDistribution = {};
  treatments.forEach((treatment) => {
    const drug = treatment.drugType || 'other';
    drugDistribution[drug] = (drugDistribution[drug] || 0) + 1;
  });

  return {
    success: true,
    data: {
      stats: {
        totalAnimals,
        activeTreatments,
        unreadAlerts,
        complianceRate: Math.round(complianceRate),
      },
      dailyUsage,
      drugDistribution,
    },
  };
};

/**
 * Get farmer alerts
 */
const getFarmerAlerts = async (farmerId, filters = {}) => {
  const query = { farmerId };

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.readStatus !== undefined) {
    query.readStatus = filters.readStatus === 'true';
  }

  const alerts = await Alert.find(query)
    .populate('animalId', 'pashuAadhaarId species')
    .populate('treatmentId', 'medicine dosage')
    .sort({ createdAt: -1 })
    .limit(50);

  return {
    success: true,
    data: alerts,
  };
};

/**
 * Mark alert as read
 */
const markAlertAsRead = async (alertId, farmerId) => {
  const alert = await Alert.findOne({ _id: alertId, farmerId });

  if (!alert) {
    throw new Error('Alert not found');
  }

  alert.readStatus = true;
  alert.readAt = new Date();
  await alert.save();

  return {
    success: true,
    message: 'Alert marked as read',
    data: alert,
  };
};

/**
 * Get farmer profile
 */
const getFarmerProfile = async (farmerId) => {
  let profile = await FarmerProfile.findOne({ farmerId }).populate('farmerId', 'name email phone');

  // If profile doesn't exist, create a default one
  if (!profile) {
    const user = await User.findById(farmerId);
    profile = await FarmerProfile.create({
      farmerId,
      fullName: user?.name || '',
      mobileNumber: user?.phone || '',
    });
  }

  // Get total animals count
  const totalAnimals = await Animal.countDocuments({ farmerId, isActive: true });

  // Calculate AMU compliance score from treatments and lab tests
  const treatments = await Treatment.find({ farmerId });
  const labTests = await LabTest.find({ farmerId });
  
  let complianceScore = 100;
  if (labTests.length > 0) {
    const passedTests = labTests.filter(test => test.status === 'pass').length;
    complianceScore = Math.round((passedTests / labTests.length) * 100);
  }

  // Get violations history from alerts
  const alerts = await Alert.find({ farmerId });
  const violationsHistory = {
    safe: alerts.filter(a => a.type === 'safe').length,
    warning: alerts.filter(a => a.type === 'warning').length,
    violation: alerts.filter(a => a.type === 'violation').length,
  };

  // Get user email
  const user = await User.findById(farmerId).select('email');

  return {
    success: true,
    data: {
      ...profile.toObject(),
      email: user?.email || '',
      totalAnimals,
      amuComplianceScore: complianceScore,
      violationsHistory,
    },
  };
};

/**
 * Update farmer profile
 */
const updateFarmerProfile = async (farmerId, profileData) => {
  // Remove fields that shouldn't be updated directly (computed fields)
  const { 
    totalAnimals, 
    amuComplianceScore, 
    violationsHistory,
    email, // Email comes from User model, not profile
    ...updateData 
  } = profileData;

  // Clean up empty strings and convert to undefined for optional fields
  // Keep aadhaarNumber even if empty string (user might want to clear it)
  // For photos, only update if a non-empty value is provided (to avoid overwriting with empty string)
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === '' && key !== 'aadhaarNumber') {
      if (key === 'profilePhoto' || key === 'farmPhoto') {
        // Don't update photos if empty string is sent (preserve existing)
        delete updateData[key];
      } else {
        updateData[key] = undefined;
      }
    }
  });

  // Update or create profile
  let profile = await FarmerProfile.findOne({ farmerId });

  if (profile) {
    // Update existing profile - only update provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        profile[key] = updateData[key];
      }
    });
    await profile.save();
  } else {
    // Create new profile - filter out undefined values
    const profileToCreate = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        profileToCreate[key] = updateData[key];
      }
    });
    profile = await FarmerProfile.create({
      farmerId,
      ...profileToCreate,
    });
  }

  // Also update user's name and phone if provided
  if (updateData.fullName || updateData.mobileNumber) {
    const user = await User.findById(farmerId);
    if (user) {
      if (updateData.fullName) user.name = updateData.fullName;
      if (updateData.mobileNumber) user.phone = updateData.mobileNumber;
      await user.save();
    }
  }

  // Return updated profile
  const updatedProfile = await FarmerProfile.findOne({ farmerId });
  
  return {
    success: true,
    message: 'Profile updated successfully',
    data: updatedProfile,
  };
};

/**
 * Get MRL Usage Overview
 */
const getMRLOverview = async (farmerId) => {
  try {
    // Get all lab tests
    const tests = await LabTest.find({ farmerId })
      .populate('animalId', 'pashuAadhaarId animalName species tagId')
      .sort({ testDate: -1 })
      .lean();

    // Get all treatments for withdrawal calculation (include completed ones too for history)
    const treatments = await Treatment.find({
      farmerId,
      $or: [
        { status: 'active', withdrawalEndDate: { $gte: new Date() } },
        { status: 'active', withdrawalEndDate: { $lt: new Date() } }, // Recently completed
      ],
    })
      .populate('animalId', 'pashuAadhaarId animalName tagId')
      .sort({ withdrawalEndDate: 1 })
      .lean();

  // Calculate stats
  const totalTests = tests.length;
  const passedTests = tests.filter((t) => t.status === 'pass').length;
  const failedTests = tests.filter((t) => t.status === 'fail').length;
  const passPercentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100;
  const failPercentage = totalTests > 0 ? Math.round((failedTests / totalTests) * 100) : 0;

  // Calculate average withdrawal days remaining
  let totalWithdrawalDays = 0;
  let activeWithdrawals = 0;
  treatments.forEach((treatment) => {
    const daysRemaining = Math.ceil(
      (new Date(treatment.withdrawalEndDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (daysRemaining > 0) {
      totalWithdrawalDays += daysRemaining;
      activeWithdrawals++;
    }
  });
  const avgWithdrawalDays = activeWithdrawals > 0 
    ? (totalWithdrawalDays / activeWithdrawals).toFixed(1) 
    : 0;

  // Get drug-wise distribution from tests
  const drugDistribution = {};
  tests.forEach((test) => {
    const drug = test.medicineTested;
    if (!drugDistribution[drug]) {
      drugDistribution[drug] = { total: 0, passed: 0, failed: 0 };
    }
    drugDistribution[drug].total++;
    if (test.status === 'pass') {
      drugDistribution[drug].passed++;
    } else {
      drugDistribution[drug].failed++;
    }
  });

    // Get last 6 tests for trend (or all if less than 6)
    const last6Tests = tests.slice(0, 6).reverse();

    // Calculate AI Risk Prediction (simple algorithm)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentFailures = tests.filter(
      (t) => t.status === 'fail' && new Date(t.testDate) > thirtyDaysAgo
    ).length;
    const recentTests = tests.filter(
      (t) => new Date(t.testDate) > thirtyDaysAgo
    ).length;
    const recentFailureRate = recentTests > 0 ? (recentFailures / recentTests) * 100 : 0;
    
    // Risk score calculation (more nuanced)
    let riskScore = 20; // Default low risk
    if (recentFailureRate > 50) riskScore = 85;
    else if (recentFailureRate > 30) riskScore = 65;
    else if (recentFailureRate > 10) riskScore = 45;
    else if (recentFailureRate > 0) riskScore = 30;
    
    // Add withdrawal period risk
    const activeWithdrawalsNearEnd = treatments.filter((t) => {
      const daysRemaining = Math.ceil(
        (new Date(t.withdrawalEndDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return daysRemaining > 0 && daysRemaining <= 2;
    }).length;
    
    if (activeWithdrawalsNearEnd > 0) {
      riskScore = Math.min(100, riskScore + (activeWithdrawalsNearEnd * 5));
    }

    // Get most problematic drug
    let mostProblematicDrug = null;
    let maxFailures = 0;
    Object.entries(drugDistribution).forEach(([drug, data]) => {
      if (data.failed > maxFailures) {
        maxFailures = data.failed;
        mostProblematicDrug = drug;
      }
    });

    // Generate recommendation
    let recommendation = '✅ All MRL levels are within safe limits. Continue following proper withdrawal periods.';
    if (mostProblematicDrug && maxFailures > 0) {
      recommendation = `⚠️ Reduce ${mostProblematicDrug} usage. ${maxFailures} test(s) failed. Consider alternative medications and ensure proper withdrawal periods.`;
    } else if (recentFailureRate > 10) {
      recommendation = '⚠️ Monitor MRL levels closely. Some recent tests are showing elevated values. Review treatment protocols.';
    } else if (activeWithdrawalsNearEnd > 0) {
      recommendation = `⚠️ ${activeWithdrawalsNearEnd} animal(s) have withdrawal periods ending soon. Do not sell milk/meat until withdrawal period completes.`;
    } else if (recentFailureRate > 0 && recentFailureRate <= 10) {
      recommendation = '✅ MRL compliance is good. Minor issues detected. Continue monitoring.';
    }

    return {
      success: true,
      data: {
        stats: {
          totalTests,
          passPercentage,
          failPercentage,
          avgWithdrawalDays: parseFloat(avgWithdrawalDays),
        },
        tests: tests.map((test) => ({
          ...test,
          _id: test._id.toString(),
          animalId: test.animalId ? {
            ...test.animalId,
            _id: test.animalId._id.toString(),
          } : null,
        })),
        treatments: treatments.map((treatment) => ({
          ...treatment,
          _id: treatment._id.toString(),
          animalId: treatment.animalId ? {
            ...treatment.animalId,
            _id: treatment.animalId._id.toString(),
          } : null,
        })),
        drugDistribution,
        trendData: last6Tests.length > 0
          ? last6Tests.map((test) => ({
              date: new Date(test.testDate).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
              }),
              mrlValue: test.mrlValue,
              status: test.status,
              drug: test.medicineTested,
            }))
          : [
              {
                date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                mrlValue: 0,
                status: 'pass',
                drug: 'No tests',
              },
            ],
        aiPrediction: {
          riskScore: Math.round(riskScore),
          riskLevel: riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low',
          recommendation,
        },
      },
    };
  } catch (error) {
    console.error('Error in getMRLOverview:', error);
    throw new Error('Failed to fetch MRL overview data');
  }
};

module.exports = {
  registerAnimal,
  getFarmerAnimals,
  getAnimalByPashuAadhaarId,
  getFarmerDashboard,
  getFarmerAlerts,
  markAlertAsRead,
  getFarmerProfile,
  updateFarmerProfile,
  getMRLOverview,
};

