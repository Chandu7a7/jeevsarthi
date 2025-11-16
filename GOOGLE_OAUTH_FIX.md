# Google OAuth Authorization Error Fix

## Problem: "Access blocked: Authorization Error"

Yeh error tab aata hai jab Google OAuth properly configure nahi hai.

## Solution Steps:

### Step 1: Google Cloud Console me Settings Check Karein

1. [Google Cloud Console](https://console.cloud.google.com/) me jayein
2. Apna project select karein
3. **APIs & Services** → **Credentials** me jayein
4. Apna **OAuth 2.0 Client ID** select karein

### Step 2: Authorized JavaScript Origins Add Karein

**Authorized JavaScript origins** me yeh add karein:
```
http://localhost:3000
http://127.0.0.1:3000
http://192.168.0.102:3000
```

### Step 3: Authorized Redirect URIs Add Karein

**Authorized redirect URIs** me yeh add karein:
```
http://localhost:3000
http://127.0.0.1:3000
http://192.168.0.102:3000
```

### Step 4: OAuth Consent Screen Configure Karein

1. **APIs & Services** → **OAuth consent screen** me jayein
2. **User Type**: **External** select karein (development ke liye)
3. **App name**: JeevSarthi (ya kuch bhi)
4. **User support email**: Apna email
5. **Developer contact information**: Apna email
6. **Scopes**: Add karein:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
7. **Test users**: Agar External user type hai, to test users add karein (apna email)

### Step 5: Verify Client ID

1. **Credentials** page se apna Client ID copy karein
2. `client/.env` file me verify karein:
   ```
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```

### Step 6: Restart Servers

```bash
# Frontend restart
cd jeevsarthi/client
npm run dev

# Backend restart (if needed)
cd jeevsarthi/server
npm run dev
```

## Quick Checklist:

- ✅ Client ID sahi hai `.env` file me
- ✅ Authorized JavaScript origins me `http://localhost:3000` hai
- ✅ Authorized redirect URIs me `http://localhost:3000` hai
- ✅ OAuth consent screen configured hai
- ✅ Test users add kiye gaye hain (agar External user type hai)
- ✅ Servers restart kiye gaye hain

## Common Issues:

### Issue 1: "Error 400: redirect_uri_mismatch"
**Solution**: Authorized redirect URIs me exact URL add karein jo browser me dikh raha hai

### Issue 2: "Access blocked: This app's request is invalid"
**Solution**: OAuth consent screen properly configure karein aur test users add karein

### Issue 3: "Error 403: access_denied"
**Solution**: 
- OAuth consent screen me app name aur email add karein
- Test users me apna email add karein (agar External user type hai)

## Development Mode (Quick Fix):

Agar aap development me hain, to:

1. **OAuth consent screen** me:
   - **Publishing status**: **Testing** rakhein
   - **Test users** me apna email add karein
   - **Scopes** me email aur profile add karein

2. **Credentials** me:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000`

3. Browser me same Google account use karein jo test user me add kiya hai

## Production Mode:

Production ke liye:
1. OAuth consent screen ko **Publish** karein
2. All users ko access dene ke liye verification process complete karein
3. Production domain add karein authorized origins me

