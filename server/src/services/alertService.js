const Alert = require('../models/Alert');
const Treatment = require('../models/Treatment');
const { getDaysUntilWithdrawalEnds } = require('../utils/calculateWithdrawal');
const { sendWithdrawalAlert, sendMRLViolationAlert } = require('../utils/sms');
const { sendWithdrawalEmail } = require('../utils/email');
const User = require('../models/User');

/**
 * Check withdrawal periods and create alerts
 */
const checkWithdrawalPeriods = async () => {
  try {
    // Get all active treatments
    const activeTreatments = await Treatment.find({
      status: 'active',
    }).populate('animalId', 'pashuAadhaarId').populate('farmerId', 'name email phone');

    const now = new Date();
    const alertsCreated = [];

    for (const treatment of activeTreatments) {
      const daysRemaining = getDaysUntilWithdrawalEnds(treatment.withdrawalEndDate);

      // Alert if withdrawal period ends in 24 hours or less
      if (daysRemaining <= 1 && daysRemaining > 0) {
        // Check if alert already exists
        const existingAlert = await Alert.findOne({
          treatmentId: treatment._id,
          type: 'warning',
          readStatus: false,
        });

        if (!existingAlert) {
          const alert = await Alert.create({
            farmerId: treatment.farmerId._id || treatment.farmerId,
            animalId: treatment.animalId._id || treatment.animalId,
            treatmentId: treatment._id,
            type: 'warning',
            title: 'Withdrawal Period Ending Soon',
            message: `Withdrawal period ending for Animal ${treatment.animalId?.pashuAadhaarId || treatment.animalId} on ${treatment.withdrawalEndDate.toLocaleDateString()}. Please do not sell milk/meat until then.`,
            severity: daysRemaining === 0 ? 'high' : 'medium',
            actionRequired: true,
            metadata: {
              daysRemaining,
              withdrawalEndDate: treatment.withdrawalEndDate,
            },
          });

          alertsCreated.push(alert);

          // Send notifications
          const farmer = treatment.farmerId;
          if (farmer && farmer.phone) {
            await sendWithdrawalAlert(
              farmer.phone,
              treatment.animalId?.pashuAadhaarId || treatment.animalId.toString(),
              treatment.withdrawalEndDate
            );
          }

          if (farmer && farmer.email) {
            await sendWithdrawalEmail(
              farmer.email,
              treatment.animalId?.pashuAadhaarId || treatment.animalId.toString(),
              treatment.withdrawalEndDate
            );
          }
        }
      }

      // Update treatment status if withdrawal period has ended
      if (treatment.withdrawalEndDate <= now) {
        treatment.status = 'completed';
        await treatment.save();
      }
    }

    return {
      success: true,
      message: `Checked ${activeTreatments.length} treatments. Created ${alertsCreated.length} alerts.`,
      alertsCreated: alertsCreated.length,
    };
  } catch (error) {
    console.error('Error checking withdrawal periods:', error);
    throw error;
  }
};

/**
 * Check for overdose violations
 */
const checkOverdoseViolations = async () => {
  try {
    const treatments = await Treatment.find({
      dateGiven: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      status: 'active',
    })
      .populate('animalId', 'pashuAadhaarId')
      .populate('farmerId', 'name email phone');

    const safeDosageLimit = 100; // mg/kg
    const alertsCreated = [];

    for (const treatment of treatments) {
      if (treatment.dosage > safeDosageLimit) {
        const existingAlert = await Alert.findOne({
          treatmentId: treatment._id,
          type: 'violation',
          title: 'Overdose Detected',
        });

        if (!existingAlert) {
          const alert = await Alert.create({
            farmerId: treatment.farmerId._id || treatment.farmerId,
            animalId: treatment.animalId._id || treatment.animalId,
            treatmentId: treatment._id,
            type: 'violation',
            title: 'Overdose Detected',
            message: `High dosage detected for ${treatment.medicine}. Dosage: ${treatment.dosage} mg/kg exceeds safe limit of ${safeDosageLimit} mg/kg.`,
            severity: 'critical',
            actionRequired: true,
            metadata: {
              dosage: treatment.dosage,
              safeLimit: safeDosageLimit,
              medicine: treatment.medicine,
            },
          });

          alertsCreated.push(alert);

          // Send notifications
          const farmer = treatment.farmerId;
          if (farmer && farmer.phone) {
            await sendMRLViolationAlert(
              farmer.phone,
              treatment.animalId?.pashuAadhaarId || treatment.animalId.toString(),
              treatment.medicine
            );
          }
        }
      }
    }

    return {
      success: true,
      message: `Checked ${treatments.length} treatments. Created ${alertsCreated.length} overdose alerts.`,
      alertsCreated: alertsCreated.length,
    };
  } catch (error) {
    console.error('Error checking overdose violations:', error);
    throw error;
  }
};

module.exports = {
  checkWithdrawalPeriods,
  checkOverdoseViolations,
};

