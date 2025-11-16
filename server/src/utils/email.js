// Email utility (can be integrated with Nodemailer, SendGrid, etc.)
// For now, it's a placeholder that can be extended

/**
 * Send email alert
 * @param {String} to - Recipient email
 * @param {String} subject - Email subject
 * @param {String} html - Email HTML content
 * @returns {Promise<Object>} - Email result
 */
const sendEmail = async (to, subject, html) => {
  // TODO: Implement email service (Nodemailer, SendGrid, etc.)
  console.log(`Email would be sent to ${to}: ${subject}`);
  return {
    success: true,
    message: 'Email service not yet configured',
  };
};

/**
 * Send email alert for withdrawal period
 * @param {String} email - Farmer email
 * @param {String} animalId - Animal ID
 * @param {Date} withdrawalEndDate - Withdrawal end date
 * @returns {Promise<Object>} - Email result
 */
const sendWithdrawalEmail = async (email, animalId, withdrawalEndDate) => {
  const subject = '⚠️ Withdrawal Period Ending Soon';
  const html = `
    <h2>JEEVSARTHI Alert</h2>
    <p>Withdrawal period ending for Animal <strong>${animalId}</strong> on ${withdrawalEndDate.toLocaleDateString()}.</p>
    <p>Please do not sell milk or meat until the withdrawal period ends.</p>
  `;
  return await sendEmail(email, subject, html);
};

/**
 * Send email alert for MRL violation
 * @param {String} email - Farmer email
 * @param {String} animalId - Animal ID
 * @param {String} medicine - Medicine name
 * @returns {Promise<Object>} - Email result
 */
const sendMRLViolationEmail = async (email, animalId, medicine) => {
  const subject = '❌ MRL Violation Detected';
  const html = `
    <h2>JEEVSARTHI Critical Alert</h2>
    <p>MRL violation detected for Animal <strong>${animalId}</strong>.</p>
    <p>Medicine: <strong>${medicine}</strong></p>
    <p><strong>Immediate action required:</strong> Stop selling milk and meat immediately.</p>
  `;
  return await sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendWithdrawalEmail,
  sendMRLViolationEmail,
};

