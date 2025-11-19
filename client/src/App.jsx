import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { DarkModeProvider } from "./context/DarkModeContext";
import { RouterContent } from "./router";
import { Toaster } from "react-hot-toast";

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Check if client ID is placeholder value
  if (googleClientId && (googleClientId.includes('your-google-client-id') || googleClientId.includes('placeholder'))) {
    console.warn('⚠️ Google Client ID is not configured properly. Please update VITE_GOOGLE_CLIENT_ID in .env file with your actual Client ID from Google Cloud Console.');
  }

  // Always wrap with GoogleOAuthProvider to avoid "must be used within provider" errors
  // Use empty string if not configured - GoogleLogin components will handle this
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <DarkModeProvider>
        <AuthProvider>
          <RouterContent />
          <Toaster position="top-right" />
        </AuthProvider>
      </DarkModeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
