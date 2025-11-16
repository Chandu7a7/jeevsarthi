# QR Code Mobile Access - Complete Troubleshooting Guide

## Problem: Mobile se QR code scan करने पर access नहीं हो रहा

## Step-by-Step Solution:

### Step 1: Find Your Network IP Address

**Windows PowerShell में:**
```powershell
ipconfig
```

Look for "IPv4 Address" under your WiFi adapter:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.0.102
```

**Note करें:** `192.168.0.102` (यह आपका IP है, अलग हो सकता है)

### Step 2: Update Environment Variables

**Create/Update `server/.env`:**
```env
FRONTEND_URL=http://192.168.0.102:3000
PORT=5000
```

**Create/Update `client/.env`:**
```env
VITE_NETWORK_IP=192.168.0.102
VITE_API_URL=http://192.168.0.102:5000/api
```

(अपना actual IP address use करें)

### Step 3: Restart Both Servers

**Terminal 1 - Backend:**
```bash
cd jeevsarthi/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd jeevsarthi/client
npm run dev
```

### Step 4: Check Server Console Output

**Backend console में दिखना चाहिए:**
```
📱 Network IPs for mobile access:
   Wi-Fi: http://192.168.0.102:5000
```

**Frontend console में दिखना चाहिए:**
```
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.0.102:3000/
```

### Step 5: Test Direct Access from Mobile

**Mobile browser में manually type करें:**
```
http://192.168.0.102:3000
```

अगर page load होता है, तो QR code भी काम करेगा।

### Step 6: Configure Windows Firewall

**Option A - PowerShell (Run as Administrator):**
```powershell
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Node Server" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

**Option B - GUI:**
1. Windows Settings → Update & Security → Windows Security → Firewall & network protection
2. Advanced settings → Inbound Rules → New Rule
3. Port → TCP → Specific local ports: `3000,5000` → Allow connection
4. Name: "JeevSarthi Dev Servers"

### Step 7: Register New Animal and Check QR Code

1. New animal register करें
2. Server console में check करें:
   ```
   📱 QR Code URL: http://192.168.0.102:3000/verify/PASHU-XXXXXX
   ```
3. यह localhost नहीं होना चाहिए

### Step 8: Test QR Code

1. Mobile को same WiFi पर connect करें
2. QR code scan करें
3. Animal data show होना चाहिए

## Common Issues & Solutions:

### Issue 1: "This site cannot be reached"
**Solution:**
- Check firewall settings (Step 6)
- Verify both devices on same WiFi
- Try accessing `http://192.168.0.102:3000` directly in mobile browser

### Issue 2: QR code still shows localhost
**Solution:**
- Check server console for QR URL
- Verify `.env` files are correct
- Restart both servers
- Register a NEW animal (old QR codes won't update)

### Issue 3: CORS Error
**Solution:**
- Backend CORS updated है, restart करें
- Check `FRONTEND_URL` in server `.env`

### Issue 4: Page loads but API calls fail
**Solution:**
- Check `VITE_API_URL` in client `.env`
- Should be: `http://192.168.0.102:5000/api`
- Restart Vite server

## Quick Test Commands:

**Test if port 3000 is accessible:**
```powershell
Test-NetConnection -ComputerName localhost -Port 3000
```

**Test if port 5000 is accessible:**
```powershell
Test-NetConnection -ComputerName localhost -Port 5000
```

**Find your IP:**
```powershell
ipconfig | findstr "IPv4"
```

## Verification Checklist:

- [ ] Network IP found and noted
- [ ] `server/.env` updated with `FRONTEND_URL`
- [ ] `client/.env` updated with `VITE_NETWORK_IP` and `VITE_API_URL`
- [ ] Both servers restarted
- [ ] Firewall rules added for ports 3000 and 5000
- [ ] Mobile can access `http://YOUR_IP:3000` directly
- [ ] New animal registered
- [ ] Server console shows network IP in QR URL (not localhost)
- [ ] QR code scanned from mobile
- [ ] Animal data displayed

## Still Not Working?

1. **Check Network Connection:**
   - Both devices on same WiFi?
   - WiFi password correct?

2. **Check IP Address:**
   - IP address changed? (DHCP can change it)
   - Run `ipconfig` again to verify

3. **Check Server Status:**
   - Both servers running?
   - No errors in console?

4. **Try Alternative:**
   - Use ngrok for public URL (see QR_CODE_SETUP.md)

