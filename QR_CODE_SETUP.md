# QR Code Setup Guide for Mobile Scanning

## Problem
When QR codes contain `localhost` URLs, they cannot be scanned from mobile devices because `localhost` refers to the mobile device itself, not your development server.

## Solution

### Option 1: Auto-Detection (Recommended)
The backend now automatically detects your network IP address and uses it for QR codes. Check your server console when registering an animal - it will show the QR code URL being used.

### Option 2: Set Environment Variable

#### For Backend (Server):
1. Find your computer's network IP address:
   - **Windows**: Open PowerShell and run:
     ```powershell
     ipconfig
     ```
     Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.x.x.x)
   
   - **Mac/Linux**: Run:
     ```bash
     ifconfig | grep "inet "
     ```
     or
     ```bash
     ip addr show
     ```

2. Create or update `server/.env` file:
   ```env
   FRONTEND_URL=http://YOUR_IP_ADDRESS:3000
   ```
   Example:
   ```env
   FRONTEND_URL=http://192.168.1.100:3000
   ```

3. Restart your server

#### For Frontend (Client):
1. Create or update `client/.env` file:
   ```env
   VITE_NETWORK_IP=YOUR_IP_ADDRESS
   ```
   Example:
   ```env
   VITE_NETWORK_IP=192.168.1.100
   ```

2. Restart your Vite dev server

### Option 3: Use ngrok (For Testing)
If you want a public URL that works from anywhere:

1. Install ngrok: https://ngrok.com/download
2. Run:
   ```bash
   ngrok http 3000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Set in `server/.env`:
   ```env
   FRONTEND_URL=https://abc123.ngrok.io
   ```

## Important Notes

1. **Same Network**: Your mobile device and computer must be on the same Wi-Fi network
2. **Firewall**: Make sure your firewall allows connections on port 3000
3. **Port**: Ensure port 3000 is accessible (check if Vite is running on 3000)
4. **HTTPS**: For production, use HTTPS URLs

## Testing

1. Register a new animal
2. Check the server console for the QR code URL
3. Scan the QR code from your mobile device
4. The animal details page should load

## Troubleshooting

- **"This site cannot be reached"**: 
  - Check if IP address is correct
  - Ensure both devices are on same network
  - Verify server is running on port 3000
  - Check firewall settings

- **QR code shows localhost**:
  - Set `FRONTEND_URL` in server `.env`
  - Restart server
  - Register a new animal (existing QR codes won't update)

