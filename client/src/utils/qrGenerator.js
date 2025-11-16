import { generateQRToken } from '../services/api';
import { generateQRURL } from './qrParse';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || window.location.origin;

/**
 * Generate secure QR code URL for animal
 * @param {String} tagId - Animal tag ID
 * @returns {String} Secure QR URL with token
 */
export const generateSecureQRURL = async (tagId) => {
  try {
    // In production, get token from backend
    // For now, generate URL without token (backend will handle)
    return generateQRURL(tagId);
  } catch (error) {
    console.error('Error generating QR URL:', error);
    return generateQRURL(tagId);
  }
};

/**
 * Generate QR code data URL (for display/download)
 * @param {String} text - Text to encode
 * @returns {Promise<String>} Data URL of QR code image
 */
export const generateQRCodeImage = async (text) => {
  try {
    // Dynamic import of qrcode library
    const QRCode = await import('qrcode');
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code image:', error);
    throw error;
  }
};

/**
 * Download QR code as PNG
 * @param {String} text - Text to encode
 * @param {String} filename - Filename for download
 */
export const downloadQRCode = async (text, filename = 'qrcode.png') => {
  try {
    const dataUrl = await generateQRCodeImage(text);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw error;
  }
};

