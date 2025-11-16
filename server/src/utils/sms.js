const twilio = require('twilio');

// Initialize Twilio client if credentials are provided
let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

/**
 * Send SMS alert
 * @param {String} to - Recipient phone number
 * @param {String} message - Message to send
 * @returns {Promise<Object>} - Twilio response
 */
const sendSMS = async (to, message) => {
  if (!twilioClient) {
    console.warn('Twilio credentials not configured. SMS not sent.');
    return { success: false, message: 'SMS service not configured' };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: to,
    });

    return {
      success: true,
      sid: result.sid,
      message: 'SMS sent successfully',
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Send SMS alert for withdrawal period
 * @param {String} phone - Farmer phone number
 * @param {String} animalId - Animal ID
 * @param {Date} withdrawalEndDate - Withdrawal end date
 * @returns {Promise<Object>} - SMS result
 */
const sendWithdrawalAlert = async (phone, animalId, withdrawalEndDate) => {
  const message = `⚠️ JEEVSARTHI Alert: Withdrawal period ending for Animal ${animalId} on ${withdrawalEndDate.toLocaleDateString()}. Please do not sell milk/meat until then.`;
  return await sendSMS(phone, message);
};

/**
 * Send SMS alert for MRL violation
 * @param {String} phone - Farmer phone number
 * @param {String} animalId - Animal ID
 * @param {String} medicine - Medicine name
 * @returns {Promise<Object>} - SMS result
 */
const sendMRLViolationAlert = async (phone, animalId, medicine) => {
  const message = `❌ JEEVSARTHI Alert: MRL violation detected for Animal ${animalId}. Medicine: ${medicine}. Immediate action required - stop selling milk/meat.`;
  return await sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendWithdrawalAlert,
  sendMRLViolationAlert,
};

