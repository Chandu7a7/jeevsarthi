/**
 * Calculate withdrawal end date based on start date and withdrawal period
 * @param {Date} startDate - Treatment start date
 * @param {Number} withdrawalPeriod - Withdrawal period in days
 * @returns {Date} - Withdrawal end date
 */
const calculateWithdrawalEndDate = (startDate, withdrawalPeriod) => {
  const start = new Date(startDate);
  const endDate = new Date(start);
  endDate.setDate(start.getDate() + withdrawalPeriod);
  return endDate;
};

/**
 * Get withdrawal period in days for a specific medicine
 * Default withdrawal periods (in days) for common medicines
 */
const DEFAULT_WITHDRAWAL_PERIODS = {
  oxytetracycline: 28,
  penicillin: 0, // Not allowed for food animals
  streptomycin: 30,
  neomycin: 30,
  erythromycin: 30,
  tylosin: 21,
  lincomycin: 7,
  'sulfa-drugs': 10,
  ivermectin: 28,
  albendazole: 14,
  fenbendazole: 7,
  levamisole: 3,
  default: 28, // Default 28 days for unknown medicines
};

/**
 * Get withdrawal period for a medicine
 * @param {String} medicineName - Name of the medicine
 * @returns {Number} - Withdrawal period in days
 */
const getWithdrawalPeriod = (medicineName) => {
  const medicine = medicineName.toLowerCase();
  
  // Check for specific medicine
  for (const [key, value] of Object.entries(DEFAULT_WITHDRAWAL_PERIODS)) {
    if (medicine.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return DEFAULT_WITHDRAWAL_PERIODS.default;
};

/**
 * Check if withdrawal period has ended
 * @param {Date} withdrawalEndDate - Withdrawal end date
 * @returns {Boolean} - True if withdrawal period has ended
 */
const isWithdrawalPeriodEnded = (withdrawalEndDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(withdrawalEndDate);
  endDate.setHours(0, 0, 0, 0);
  return endDate <= today;
};

/**
 * Get days remaining until withdrawal period ends
 * @param {Date} withdrawalEndDate - Withdrawal end date
 * @returns {Number} - Days remaining (negative if ended)
 */
const getDaysUntilWithdrawalEnds = (withdrawalEndDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(withdrawalEndDate);
  endDate.setHours(0, 0, 0, 0);
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

module.exports = {
  calculateWithdrawalEndDate,
  getWithdrawalPeriod,
  isWithdrawalPeriodEnded,
  getDaysUntilWithdrawalEnds,
};

