const LabTest = require('../models/LabTest');
const Animal = require('../models/Animal');
const Alert = require('../models/Alert');
const BlockchainRecord = require('../models/BlockchainRecord');
const { generateHash } = require('../config/blockchain');
const { sendMRLViolationAlert } = require('../utils/sms');
const { sendMRLViolationEmail } = require('../utils/email');
const User = require('../models/User');

/**
 * Upload lab test result
 */
const uploadTestResult = async (testData) => {
  const {
    sampleId,
    animalId,
    farmerId,
    labOfficerId,
    medicineTested,
    mrlValue,
    allowedLimit,
    reportUrl,
    notes,
  } = testData;

  // Determine status
  const status = mrlValue > allowedLimit ? 'fail' : 'pass';

  // Create lab test
  const labTest = await LabTest.create({
    sampleId,
    animalId,
    farmerId,
    labOfficerId,
    medicineTested,
    mrlValue,
    allowedLimit,
    status,
    reportUrl,
    notes,
  });

  // Generate blockchain hash
  const hashData = {
    type: 'labtest',
    testId: labTest._id,
    sampleId: labTest.sampleId,
    animalId: labTest.animalId,
    medicineTested: labTest.medicineTested,
    mrlValue: labTest.mrlValue,
    allowedLimit: labTest.allowedLimit,
    status: labTest.status,
    timestamp: new Date(),
  };

  const blockchainHash = generateHash(hashData);
  labTest.blockchainHash = blockchainHash;
  await labTest.save();

  // Save to blockchain record
  await BlockchainRecord.create({
    hash: blockchainHash,
    type: 'labtest',
    referenceId: labTest._id,
    referenceModel: 'LabTest',
    data: hashData,
  });

  // Create alert if MRL violation
  if (status === 'fail') {
    await Alert.create({
      farmerId,
      animalId,
      labTestId: labTest._id,
      type: 'violation',
      title: 'MRL Violation Detected',
      message: `MRL violation for ${medicineTested}. Detected: ${mrlValue} mg/kg, Allowed: ${allowedLimit} mg/kg. Stop selling milk/meat immediately.`,
      severity: 'critical',
      actionRequired: true,
    });

    // Send notifications
    await sendViolationNotifications(farmerId, animalId, {
      medicine: medicineTested,
      mrlValue,
      allowedLimit,
    });
  } else {
    // Safe alert
    await Alert.create({
      farmerId,
      animalId,
      labTestId: labTest._id,
      type: 'safe',
      title: 'MRL Test Passed',
      message: `MRL test passed for ${medicineTested}. Value: ${mrlValue} mg/kg within safe limits.`,
      severity: 'low',
    });
  }

  return {
    success: true,
    message: 'Test result uploaded successfully',
    data: labTest,
  };
};

/**
 * Get lab tests
 */
const getLabTests = async (filters = {}) => {
  const query = {};

  if (filters.animalId) {
    query.animalId = filters.animalId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.farmerId) {
    query.farmerId = filters.farmerId;
  }

  const labTests = await LabTest.find(query)
    .populate('animalId', 'pashuAadhaarId species')
    .populate('farmerId', 'name email phone')
    .populate('labOfficerId', 'name email')
    .sort({ testDate: -1 });

  return {
    success: true,
    data: labTests,
  };
};

/**
 * Get lab dashboard stats
 */
const getLabDashboard = async (labOfficerId) => {
  const totalTests = await LabTest.countDocuments({ labOfficerId });
  const pendingTests = 0; // Can be implemented with a status field
  const passedTests = await LabTest.countDocuments({
    labOfficerId,
    status: 'pass',
  });
  const failedTests = await LabTest.countDocuments({
    labOfficerId,
    status: 'fail',
  });

  return {
    success: true,
    data: {
      stats: {
        totalTests,
        pendingTests,
        passedTests,
        failedTests,
      },
    },
  };
};

/**
 * Send violation notifications
 */
const sendViolationNotifications = async (farmerId, animalId, data) => {
  try {
    const farmer = await User.findById(farmerId);

    if (!farmer) return;

    // SMS
    if (farmer.phone) {
      await sendMRLViolationAlert(farmer.phone, animalId, data.medicine);
    }

    // Email
    if (farmer.email) {
      await sendMRLViolationEmail(farmer.email, animalId, data.medicine);
    }
  } catch (error) {
    console.error('Notification sending error:', error);
  }
};

module.exports = {
  uploadTestResult,
  getLabTests,
  getLabDashboard,
};

