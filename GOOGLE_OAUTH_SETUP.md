# Google OAuth Setup Guide

## Quick Setup for Google Login/Register

### Step 1: Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable **Google+ API** or **Google Identity Services**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
7. Authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
8. Copy the **Client ID**

### Step 2: Configure Frontend

Create/update `client/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### Step 3: Configure Backend (Optional - for server-side verification)

Create/update `server/.env`:
```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**Note:** Backend verification is optional. The frontend already verifies the token using Google's SDK. Server-side verification is recommended for production.

### Step 4: Restart Servers

```bash
# Restart frontend
cd client
npm run dev

# Restart backend
cd server
npm run dev
```

## How It Works

### Login Flow:
1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User selects Google account
4. Frontend receives credential token
5. Frontend decodes token and sends to backend
6. Backend finds existing user → Login
7. If user doesn't exist → Error (use registration)

### Registration Flow:
1. User selects role (Farmer/Vet/Lab)
2. User clicks "Sign in with Google"
3. Google OAuth popup appears
4. User selects Google account
5. Frontend receives credential token
6. Frontend decodes token and sends to backend with role
7. Backend creates new user → Registration successful

## Testing

1. **Test Login:**
   - Use an email that's already registered
   - Should log in and redirect to dashboard

2. **Test Registration:**
   - Use a new email
   - Select role (Farmer/Vet/Lab)
   - Should create account and redirect

3. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Check Console for debug logs
   - Look for: "Google login decoded", "Sending Google login payload", etc.

## Troubleshooting

### Google button not showing
- Check if `VITE_GOOGLE_CLIENT_ID` is set in `client/.env`
- Restart frontend server
- Check browser console for errors

### "Account not found" error on login
- User needs to register first using registration form
- Or use password login if account exists

### "Invalid Google credential token" error
- Check if `GOOGLE_CLIENT_ID` matches in both frontend and backend
- Ensure Google OAuth is enabled in Google Cloud Console
- Check authorized origins/redirect URIs in Google Console

### CORS errors
- Add your frontend URL to authorized origins in Google Console
- Include both `http://localhost:3000` and `https://yourdomain.com`

## Security Notes

- Frontend token verification is done by Google's SDK (secure)
- Backend verification adds extra security layer (recommended for production)
- Both Client IDs should match (frontend and backend)
- Never commit `.env` files to git

