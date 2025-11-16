# QR Scanner for Add Treatment - Documentation

## Overview

This feature allows users to scan animal QR tags to automatically load animal information and pre-fill the "Add Treatment" form. The system supports offline scanning with automatic sync when connectivity is restored.

## Architecture

### Backend

- **Endpoint**: `GET /api/animal/scan?tagId={tagId}&token={token}`
- **Rate Limiting**: 20 requests per 15 minutes per IP
- **Security**: HMAC token validation (optional)
- **Privacy**: Farmer PII is masked in responses

### Frontend

- **QR Scanner**: Uses `html5-qrcode` library
- **Offline Support**: IndexedDB for storing scans
- **Auto-sync**: Syncs pending scans when online

## Installation

### Backend Dependencies

Already installed:
- `express-rate-limit` - Rate limiting
- `crypto` - HMAC token generation

### Frontend Dependencies

Install required package:

```bash
cd client
npm install html5-qrcode
```

## Environment Variables

Add to `.env`:

```env
# HMAC Secret for QR token signing
HMAC_SECRET=your-secret-key-change-in-production

# Base URL for QR code generation
BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000/api
```

## Usage

### Scanning QR Code

1. Click "Scan QR Tag" button in Add Treatment page
2. Grant camera permissions
3. Point camera at QR code
4. Animal data is automatically loaded

### QR Code Format

QR codes can be in three formats:

1. **Full URL**: `https://example.com/scan?tagId=PASHU-123456&token=abc123`
2. **Relative URL**: `/scan?tagId=PASHU-123456&token=abc123`
3. **Plain Tag**: `PASHU-123456`

### Example QR Value

```
https://jeevsarthi.com/scan?tagId=PASHU-123456&token=a1b2c3d4e5f6...
```

### Example API Response

```json
{
  "success": true,
  "animal": {
    "_id": "507f1f77bcf86cd799439011",
    "pashuAadhaarId": "PASHU-123456",
    "tagId": "PASHU-123456",
    "animalName": "Lakshmi",
    "species": "cow",
    "breed": "Sahiwal",
    "age": 3,
    "ageUnit": "years",
    "healthStatus": "healthy",
    "farmerId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Rajesh Kumar",
      "email": "ra***@example.com",
      "phone": "****1234"
    },
    "latestTreatment": {
      "_id": "507f1f77bcf86cd799439013",
      "medicine": "Oxytetracycline",
      "dateGiven": "2024-01-15T00:00:00.000Z"
    }
  }
}
```

## API Endpoints

### GET /api/animal/scan

**Query Parameters:**
- `tagId` (required): Animal tag ID or Pashu Aadhaar ID
- `token` (optional): HMAC token for validation

**Response:**
```json
{
  "success": true,
  "animal": { ... }
}
```

**Errors:**
- `400`: Tag ID is required
- `401`: Invalid token
- `404`: Animal not found

### POST /api/animal/scan/log

**Body:**
```json
{
  "tagId": "PASHU-123456",
  "animalId": "507f1f77bcf86cd799439011",
  "scanType": "qr"
}
```

### PATCH /api/animal/:id/deactivateTag

Deactivates an animal tag (requires authentication).

## Offline Support

When offline:
1. Scans are stored in IndexedDB
2. User sees "Saved offline" message
3. Scans automatically sync when online
4. Sync happens on page load if online

## Security Features

1. **Rate Limiting**: Prevents abuse of scan endpoint
2. **HMAC Tokens**: Optional token validation for QR codes
3. **PII Masking**: Farmer sensitive data is masked
4. **Token Expiry**: Tokens can include timestamp for expiry

## Development

### Running Servers

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

### Testing

1. Create an animal with a tagId
2. Generate QR code for the animal
3. Scan QR code in Add Treatment page
4. Verify animal data loads correctly

## Troubleshooting

### Camera Permission Denied
- Check browser settings
- Ensure HTTPS (required for camera access)
- Try different browser

### QR Code Not Scanning
- Ensure good lighting
- Hold camera steady
- Check QR code is not damaged

### Offline Sync Not Working
- Check IndexedDB is enabled in browser
- Verify network status
- Check browser console for errors

## Future Enhancements

- [ ] NFC/RFID support
- [ ] Batch QR code generation
- [ ] QR code expiry management
- [ ] Advanced audit logging
- [ ] QR code analytics

