# Vet Location Setup Guide

## Problem
If you're seeing "No veterinarians found within 25km" even when farmer and vet are in the same area (like Indore), it's likely because:
1. Vets don't have their location set in the database
2. Vets have `onlineStatus: false`
3. Location format is incorrect

## Quick Fix

### Step 1: Check Current Vet Locations
```bash
cd jeevsarthi/server
npm run check-vet-locations
```

This will show:
- Which vets have location set
- Which vets don't have location
- Vets near Indore

### Step 2: Set Vet Location from Address

#### Option A: Using Address (Automatic Geocoding)
```bash
npm run set-vet-location <vet-email> "Musakhedi, Indore, Madhya Pradesh 452001"
```

Example:
```bash
npm run set-vet-location vet@example.com "Musakhedi, Indore, Madhya Pradesh 452001"
```

#### Option B: Using Coordinates Directly
```bash
npm run update-vet-location <vet-email> <latitude> <longitude>
```

Example for Indore:
```bash
npm run update-vet-location vet@example.com 22.7196 75.8577
```

### Step 3: Verify Location is Set
```bash
npm run check-vet-locations
```

## Indore Coordinates
- **Latitude**: 22.7196
- **Longitude**: 75.8577
- **Musakhedi Area**: Approximately 22.72, 75.86

## Common Locations in Indore
- **Indore City Center**: 22.7196, 75.8577
- **Musakhedi**: 22.72, 75.86
- **Vijay Nagar**: 22.73, 75.88
- **Palasia**: 22.72, 75.85

## Important Notes

1. **Location Format**: MongoDB stores location as `[longitude, latitude]` (note the order!)
2. **Online Status**: The query now works even if `onlineStatus` is not set to `true`
3. **Available Status**: Vets should have `isAvailable: true` (or not set to false)

## Testing

After setting locations, test the search:
1. Go to consultation request page
2. Allow location access (or manually enter Indore coordinates)
3. You should see nearby vets

## Troubleshooting

If vets still don't show up:
1. Check if location is set: `npm run check-vet-locations`
2. Check MongoDB indexes: The `2dsphere` index should exist on `users.location`
3. Check server logs for errors
4. Verify coordinates are correct (lat should be ~22.7, lng should be ~75.8 for Indore)

