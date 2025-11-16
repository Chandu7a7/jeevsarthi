# Google OAuth Authorization Error - Quick Fix

## Problem: "Access blocked: Authorization Error"

Yeh error Google Cloud Console me settings missing hone se aata hai.

## ⚡ Quick Fix (5 Minutes):

### Step 1: Google Cloud Console me Jao
1. [Google Cloud Console](https://console.cloud.google.com/) open karein
2. Apna project select karein

### Step 2: OAuth Consent Screen Setup
1. Left sidebar me **APIs & Services** → **OAuth consent screen** click karein
2. **User Type**: **External** select karein (development ke liye)
3. **App name**: `JeevSarthi` (ya kuch bhi)
4. **User support email**: Apna email select karein
5. **Developer contact information**: Apna email dalen
6. **Save and Continue** click karein

### Step 3: Scopes Add Karein
1. **Scopes** page me **Add or Remove Scopes** click karein
2. Ye scopes select karein:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid`
3. **Update** click karein
4. **Save and Continue** click karein

### Step 4: Test Users Add Karein (Important!)
1. **Test users** page me **+ ADD USERS** click karein
2. Apna Google email address dalen (jis email se login karna hai)
3. **Add** click karein
4. **Save and Continue** click karein

### Step 5: Credentials me URLs Add Karein
1. **APIs & Services** → **Credentials** me jao
2. Apna **OAuth 2.0 Client ID** click karein (edit karein)

3. **Authorized JavaScript origins** me yeh add karein:
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```
   (Agar network IP use kar rahe ho to: `http://192.168.0.102:3000` bhi add karein)

4. **Authorized redirect URIs** me yeh add karein:
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```
   (Agar network IP use kar rahe ho to: `http://192.168.0.102:3000` bhi add karein)

5. **SAVE** click karein

### Step 6: Client ID Copy Karein
1. Same page pe **Client ID** copy karein
2. Format: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

### Step 7: .env File me Add Karein
1. `jeevsarthi/client/.env` file open karein
2. Line add/update karein:
   ```
   VITE_GOOGLE_CLIENT_ID=your-copied-client-id-here
   ```
3. Save karein

### Step 8: Restart Frontend Server
```bash
# Stop server (Ctrl+C)
cd jeevsarthi/client
npm run dev
```

### Step 9: Test Karein
1. Browser me `http://localhost:3000/login` open karein
2. **Sign in with Google** button click karein
3. Same Google account use karein jo test users me add kiya hai

## ✅ Checklist:

- [ ] OAuth consent screen configured hai
- [ ] Scopes add kiye gaye hain (email, profile, openid)
- [ ] Test users me apna email add kiya hai
- [ ] Authorized JavaScript origins me `http://localhost:3000` hai
- [ ] Authorized redirect URIs me `http://localhost:3000` hai
- [ ] Client ID `.env` file me correctly set hai
- [ ] Frontend server restart kiya hai
- [ ] Browser me same Google account use kar rahe ho jo test user me add kiya hai

## 🔴 Common Mistakes:

1. ❌ Test users me email add nahi kiya → **FIX**: Test users me apna email add karein
2. ❌ Authorized origins me URL missing → **FIX**: `http://localhost:3000` add karein
3. ❌ Different Google account use kiya → **FIX**: Same account use karein jo test user me hai
4. ❌ Server restart nahi kiya → **FIX**: Frontend server restart karein

## 📝 Important Notes:

- Development mode me **External** user type use karein
- **Test users** me apna email add karna **zaroori** hai
- Browser me **same Google account** use karein jo test user me add kiya hai
- Agar network IP use kar rahe ho, to wo bhi authorized origins me add karein

## 🚀 After Fix:

1. Google login button click karein
2. Google account select karein
3. Permission allow karein
4. Successfully login ho jayega!

