const cron = require('node-cron');
const alertService = require('../services/alertService');
const logger = require('../config/logger');

/**
 * Schedule alert checks
 * Runs every hour to check for withdrawal periods and violations
 */
const scheduleAlertChecks = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running scheduled alert checks...');

      // Check withdrawal periods
      const withdrawalResult = await alertService.checkWithdrawalPeriods();
      logger.info(`Withdrawal check: ${withdrawalResult.message}`);

      // Check overdose violations
      const overdoseResult = await alertService.checkOverdoseViolations();
      logger.info(`Overdose check: ${overdoseResult.message}`);
    } catch (error) {
      logger.error('Error in scheduled alert checks:', error);
    }
  });

  logger.info('Alert scheduler started. Will run every hour.');
};

module.exports = scheduleAlertChecks;

