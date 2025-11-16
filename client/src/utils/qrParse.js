/**
 * Parse QR code decoded text into tagId and token
 * Supports:
 * - Full URL: https://example.com/scan?tagId=PASHU-123456&token=abc123
 * - Short URL: /scan?tagId=PASHU-123456&token=abc123
 * - Plain tag: PASHU-123456
 * @param {String} decodedText - Decoded QR text
 * @returns {Object} { tagId, token }
 */
export const parseQRText = (decodedText) => {
  if (!decodedText) {
    return { tagId: null, token: null };
  }

  // Try to parse as URL
  try {
    const url = new URL(decodedText, window.location.origin);
    const tagId = url.searchParams.get('tagId');
    const token = url.searchParams.get('token');
    
    if (tagId) {
      return { tagId, token };
    }
  } catch (e) {
    // Not a valid URL, continue
  }

  // Try to parse as relative URL
  if (decodedText.includes('tagId=')) {
    const params = new URLSearchParams(decodedText.split('?')[1] || decodedText);
    const tagId = params.get('tagId');
    const token = params.get('token');
    
    if (tagId) {
      return { tagId, token };
    }
  }

  // Assume plain tag ID (PASHU-xxxxxx format)
  if (decodedText.startsWith('PASHU-') || decodedText.match(/^[A-Z0-9-]+$/)) {
    return { tagId: decodedText.toUpperCase(), token: null };
  }

  return { tagId: null, token: null };
};

/**
 * Generate QR URL from tagId and token
 * @param {String} tagId - Animal tag ID
 * @param {String} token - Optional HMAC token
 * @returns {String} QR URL
 */
export const generateQRURL = (tagId, token = null) => {
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || window.location.origin;
  const params = new URLSearchParams({ tagId });
  if (token) {
    params.append('token', token);
  }
  return `${baseUrl}/scan?${params.toString()}`;
};

