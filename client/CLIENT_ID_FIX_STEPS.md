# Google Client ID Fix - Step by Step

## ❌ Current Problem:
```
Error: The given client ID is not found.
```

## ✅ Solution:

### Step 1: Google Cloud Console me Jao
1. Open: https://console.cloud.google.com/
2. Apna project select karein
3. Left sidebar me **APIs & Services** → **Credentials** click karein

### Step 2: Client ID Copy Karein
1. **OAuth 2.0 Client IDs** section me apna client ID dikhega
2. **Client ID** copy karein
3. Format hoga: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

### Step 3: .env File Update Karein
1. `jeevsarthi/client/.env` file open karein
2. Yeh line find karein:
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
   ```
3. Replace karein with actual Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```
   (Apni actual Client ID paste karein)

4. **Save** karein (Ctrl+S)

### Step 4: Frontend Server Restart Karein
1. Current server **stop** karein (Ctrl+C)
2. Restart karein:
   ```bash
   cd jeevsarthi/client
   npm run dev
   ```

### Step 5: Browser me Test Karein
1. Browser **hard refresh** karein (Ctrl+Shift+R)
2. `http://localhost:3000/login` open karein
3. **Sign in with Google** button click karein
4. Ab error nahi aana chahiye!

## ⚠️ Important Notes:

- Client ID format: `numbers-letters.apps.googleusercontent.com`
- `.env` file me extra spaces na hone den
- Frontend server **restart zaroori hai** (env variables load karne ke liye)
- Browser cache clear karein agar zarurat ho

## ✅ Verification:

1. Browser console (F12) me check karein
2. Error nahi aana chahiye
3. Google login button properly show hona chahiye
4. Click karne pe Google popup aana chahiye

## 🔴 Agar Abhi Bhi Error Aaye:

1. Client ID sahi paste hua hai? (no spaces, correct format)
2. .env file save hua hai?
3. Frontend server restart kiya?
4. Browser hard refresh kiya?
5. Google Cloud Console me Client ID active hai?

