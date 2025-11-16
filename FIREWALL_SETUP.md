# Windows Firewall Setup for Network Access

## Problem
When accessing the application via network IP (e.g., `192.168.0.102:3000`), API calls fail with `ERR_CONNECTION_REFUSED` because Windows Firewall is blocking port 5000.

## Solution: Add Firewall Rules

### Option 1: PowerShell (Run as Administrator)

1. **Open PowerShell as Administrator**
   - Right-click on PowerShell
   - Select "Run as Administrator"

2. **Run these commands:**

```powershell
# Allow inbound connections on port 5000 (Backend)
New-NetFirewallRule -DisplayName "JeevSarthi Backend Port 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow -Profile Domain,Private,Public

# Allow inbound connections on port 3000 (Frontend)
New-NetFirewallRule -DisplayName "JeevSarthi Frontend Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Domain,Private,Public
```

### Option 2: Windows Firewall GUI

1. **Open Windows Defender Firewall**
   - Press `Win + R`
   - Type: `wf.msc` and press Enter

2. **Create Inbound Rule for Port 5000**
   - Click "Inbound Rules" → "New Rule"
   - Select "Port" → Next
   - Select "TCP" and enter port `5000` → Next
   - Select "Allow the connection" → Next
   - Check all profiles (Domain, Private, Public) → Next
   - Name: "JeevSarthi Backend Port 5000" → Finish

3. **Create Inbound Rule for Port 3000**
   - Repeat steps above for port `3000`
   - Name: "JeevSarthi Frontend Port 3000"

### Option 3: Quick Fix - Use Localhost

If you're accessing from the same computer:
- Use `http://localhost:3000` instead of `http://192.168.0.102:3000`
- This will use the Vite proxy and work without firewall changes

## Verify Firewall Rules

```powershell
Get-NetFirewallRule -DisplayName "*JeevSarthi*" | Select-Object DisplayName, Enabled, Direction
```

## Test Connection

After adding firewall rules, test the connection:

```powershell
Test-NetConnection -ComputerName 192.168.0.102 -Port 5000
```

Or in browser:
- Backend: `http://192.168.0.102:5000/health`
- Should return: `{"success":true,"message":"JEEVSARTHI API is running",...}`

## Notes

- **Same Machine**: Use `localhost:3000` - no firewall changes needed
- **Mobile/Other Device**: Use `192.168.0.102:3000` - firewall rules required
- **Both devices must be on the same Wi-Fi network**

