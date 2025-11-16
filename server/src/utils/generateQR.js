const QRCode = require('qrcode');
const os = require('os');

/**
 * Get network IP address for QR code (to make it accessible from mobile devices)
 * @returns {String} - Network IP address or localhost
 */
const getNetworkIP = () => {
  // If FRONTEND_URL is set and not localhost, use it
  if (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost')) {
    return process.env.FRONTEND_URL;
  }

  // Get network interfaces
  const interfaces = os.networkInterfaces();
  
  // Try to find a non-internal IPv4 address
  // Prefer Ethernet/WiFi adapters over virtual adapters
  const preferredNames = ['Wi-Fi', 'Ethernet', 'eth0', 'wlan0'];
  const allIPs = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        allIPs.push({ name, address: iface.address });
      }
    }
  }
  
  // First, try to find preferred adapter (WiFi/Ethernet)
  for (const preferredName of preferredNames) {
    const found = allIPs.find(ip => ip.name.toLowerCase().includes(preferredName.toLowerCase()));
    if (found) {
      return `http://${found.address}:3000`;
    }
  }
  
  // If no preferred adapter found, use first available (but skip 192.168.137.x which is often virtual)
  const nonVirtual = allIPs.find(ip => !ip.address.startsWith('192.168.137.'));
  if (nonVirtual) {
    return `http://${nonVirtual.address}:3000`;
  }
  
  // Fallback to any available IP
  if (allIPs.length > 0) {
    return `http://${allIPs[0].address}:3000`;
  }

  // Fallback to localhost
  return 'http://localhost:3000';
};

/**
 * Generate QR code for animal
 * @param {String} data - Data to encode (animal ID, hash, etc.)
 * @param {Object} options - QR code options
 * @returns {String} - Base64 encoded QR code image
 */
const generateQRCode = async (data, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#2E7D32',
        light: '#FFFFFF',
      },
      width: 300,
      ...options,
    };

    const qrCodeDataURL = await QRCode.toDataURL(data, defaultOptions);
    return qrCodeDataURL;
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error.message}`);
  }
};

/**
 * Generate QR code URL for API endpoint
 * @param {String} baseUrl - Base URL of the API (optional, will auto-detect if not provided)
 * @param {String} endpoint - Endpoint path
 * @param {String} id - ID to verify
 * @returns {String} - Full URL
 */
const generateQRURL = (baseUrl, endpoint, id) => {
  const url = baseUrl || getNetworkIP();
  // Remove /api from the URL if it's already there, as we're adding it
  const cleanUrl = url.replace(/\/api$/, '');
  return `${cleanUrl}/verify/${id}`;
};

module.exports = {
  generateQRCode,
  generateQRURL,
};
