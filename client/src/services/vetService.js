import { vetAPI } from './api';

/**
 * Create or update vet profile
 * @param {FormData|Object} data - Profile data (can include files)
 * @returns {Promise} API response
 */
export const createOrUpdateProfile = async (data) => {
  return vetAPI.createOrUpdateProfile(data);
};

/**
 * Get vet profile
 * @returns {Promise} API response
 */
export const getProfile = async () => {
  return vetAPI.getProfile();
};

/**
 * Search nearby vets
 * @param {Number} lat - Latitude
 * @param {Number} lng - Longitude
 * @param {Number} distance - Distance in meters (default: 25000)
 * @param {Object} filters - Additional filters
 * @returns {Promise} API response
 */
export const searchNearbyVets = async (lat, lng, distance = 25000, filters = {}) => {
  return vetAPI.searchNearbyVets(lat, lng, distance, filters);
};

/**
 * Get public vet profile
 * @param {String} vetId - Vet user ID
 * @returns {Promise} API response
 */
export const getPublicProfile = async (vetId) => {
  return vetAPI.getPublicProfile(vetId);
};

