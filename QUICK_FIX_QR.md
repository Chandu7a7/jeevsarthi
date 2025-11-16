# Quick Fix for QR Code Mobile Scanning

## Problem
QR code scan करने पर mobile पर data show नहीं हो रहा, भले ही mobile और laptop same WiFi पर हैं।

## Solution Steps:

### Step 1: Restart Vite Dev Server
Vite config update हो गया है, अब restart करें:

```bash
cd jeevsarthi/client
npm run dev
```

अब Vite console में आपको दिखेगा:
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.0.102:3000/
```

**Network URL** को note करें (यह आपका network IP है)।

### Step 2: Set Network IP in Environment (Optional but Recommended)

Create `client/.env` file:
```env
VITE_NETWORK_IP=192.168.0.102
```
(अपना actual IP address use करें - Vite console में दिखेगा)

### Step 3: Restart Both Servers

**Client:**
```bash
cd jeevsarthi/client
npm run dev
```

**Server:**
```bash
cd jeevsarthi/server
npm run dev
```

### Step 4: Register New Animal
- New animal register करें
- Server console में QR code URL check करें
- यह `http://192.168.0.102:3000/verify/PASHU-XXXXXX` जैसा होना चाहिए (localhost नहीं)

### Step 5: Test from Mobile
1. Mobile को same WiFi पर connect करें
2. QR code scan करें
3. Animal data show होना चाहिए

## Troubleshooting

### अगर अभी भी काम नहीं कर रहा:

1. **Check Firewall:**
   - Windows Firewall में port 3000 allow करें
   - Settings → Firewall → Advanced Settings → Inbound Rules → New Rule → Port → 3000

2. **Verify Network IP:**
   ```powershell
   ipconfig
   ```
   "IPv4 Address" check करें (WiFi adapter के under)

3. **Test Direct Access:**
   Mobile browser में manually type करें:
   ```
   http://192.168.0.102:3000
   ```
   अगर page load होता है, तो QR code भी काम करेगा

4. **Check Server Console:**
   Animal register करते समय server console में QR URL check करें:
   ```
   📱 QR Code URL: http://192.168.0.102:3000/verify/PASHU-XXXXXX
   ```

## Important Notes:
- ✅ Mobile और laptop same WiFi पर होने चाहिए
- ✅ Vite server `0.0.0.0` पर listen कर रहा है (network accessible)
- ✅ New animals register करें (old QR codes update नहीं होंगे)
- ✅ Firewall port 3000 allow करें

