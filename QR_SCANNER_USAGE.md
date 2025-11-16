# QR Scanner Usage Guide

## Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
cd client
npm install html5-qrcode
```

**Backend:**
Dependencies are already installed (`express-rate-limit`, `crypto`)

### 2. Set Environment Variables

Add to `server/.env`:
```env
HMAC_SECRET=your-secret-key-change-in-production
BASE_URL=http://localhost:3000
```

### 3. Run Servers

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

## Usage Example

### Sample QR Code Value

```
https://jeevsarthi.com/scan?tagId=PASHU-123456&token=a1b2c3d4e5f6...
```

Or plain tag:
```
PASHU-123456
```

### Expected API Response

**Request:**
```
GET /api/animal/scan?tagId=PASHU-123456&token=a1b2c3d4e5f6...
```

**Response:**
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

## Features

✅ QR Code Scanning with camera
✅ Offline support with IndexedDB
✅ Auto-sync when online
✅ Rate limiting (20 requests/15min)
✅ HMAC token validation
✅ PII masking for privacy
✅ Error handling
✅ Mobile-friendly UI

## Testing

1. Create an animal with a tagId
2. Navigate to Add Treatment page
3. Click "Scan QR Tag" button
4. Grant camera permissions
5. Scan the QR code
6. Animal data loads automatically

## Troubleshooting

- **Camera not working**: Ensure HTTPS or localhost
- **QR not scanning**: Check lighting and camera focus
- **Offline sync issues**: Check IndexedDB is enabled
- **Rate limit errors**: Wait 15 minutes or check IP

