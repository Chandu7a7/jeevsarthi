import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Chrome } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";


const RegisterPage = () => {
  const [role, setRole] = useState('farmer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await register({ ...formData, role });

    if (result.success) {
      toast.success('Registration successful!');
      // Get user from localStorage to determine role
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = userData.role || role;

      // Redirect based on role
      if (userRole === 'regulator') {
        navigate('/dashboard/regulator');
      } else if (userRole === 'vet') {
        navigate('/dashboard/vet');
      } else if (userRole === 'lab') {
        navigate('/dashboard/lab');
      } else {
        navigate('/dashboard/farmer');
      }
    } else {
      toast.error(result.message || 'Registration failed');
    }

    setLoading(false);
  };


  const handleGoogleRegister = async (credentialResponse) => {
    try {
      setLoading(true);
      
      if (!credentialResponse?.credential) {
        toast.error("Google authentication failed. Please try again.");
        return;
      }

      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google register decoded:', { email: decoded.email, name: decoded.name, role });

      const payload = {
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        role: role, // Include selected role for registration
      };

      console.log('Sending Google register payload:', payload);

      // Use authAPI service which handles proxy correctly
      const response = await authAPI.googleAuth(payload);
      console.log('Google register response:', response.data);

      if (response.data && response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Google registration successful!");

        const userRole = user.role || "farmer";

        // Redirect based on role
        if (userRole === "vet") navigate("/dashboard/vet");
        else if (userRole === "lab") navigate("/dashboard/lab");
        else if (userRole === "regulator") navigate("/dashboard/regulator");
        else navigate("/dashboard/farmer");
      } else {
        toast.error(response.data?.message || "Google registration failed");
      }
    } catch (err) {
      console.error('Google registration error:', err);
      const errorMsg = err.response?.data?.message || err.message || "Google registration failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <div className="flex min-h-screen">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#2E7D32] to-[#1976D2] p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>

          <div className="relative z-10 text-white max-w-md">
            <Logo size="large" />

            <h2 className="mt-8 mb-4 text-3xl font-bold">Join JEEVSARTHI</h2>

            <p className="text-white/90 mb-8 text-lg">
              Start your journey with AI + Blockchain powered livestock monitoring platform.
              Track Antimicrobial Usage (AMU) and Maximum Residue Limits (MRL) with ease.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-[12px] p-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Quick Registration</p>
                  <p className="text-white/70 text-sm">Just 3 simple steps to get started</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-[12px] p-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Secure & Protected</p>
                  <p className="text-white/70 text-sm">Your data is encrypted and safe</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-[24px] shadow-xl p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Create Account
                  </h3>
                  <p className="text-gray-500">
                    Register for JEEVSARTHI
                  </p>
                </div>
                <LanguageSwitcher />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-1">
                  <Label htmlFor="role">Select Role</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`flex flex-col items-center justify-center gap-1 px-1 py-1 rounded-[12px] border-2 transition-all ${role === 'farmer'
                          ? 'border-[#2E7D32] bg-[#2E7D32]/10 text-[#2E7D32] font-medium'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <span className="text-2xl">👨‍🌾</span>
                      <span className="text-sm">Farmer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('vet')}
                      className={`flex flex-col items-center justify-center gap-1 px-1 py-1 rounded-[12px] border-2 transition-all ${role === 'vet'
                          ? 'border-[#2E7D32] bg-[#2E7D32]/10 text-[#2E7D32] font-medium'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <span className="text-2xl">👨‍⚕️</span>
                      <span className="text-sm">Veterinarian</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('lab')}
                      className={`flex flex-col items-center justify-center gap-1 px-1 py-1 rounded-[12px] border-2 transition-all ${role === 'lab'
                          ? 'border-[#2E7D32] bg-[#2E7D32]/10 text-[#2E7D32] font-medium'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <span className="text-2xl">🧪</span>
                      <span className="text-sm">Lab Officer</span>
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 rounded-[12px]"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 rounded-[12px]"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] rounded-[12px]"
                  size="lg"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Google Register */}
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <GoogleLogin
                    onSuccess={handleGoogleRegister}
                    onError={() => toast.error("Google registration failed")}
                  />
                ) : (
                  <div className="text-center text-sm text-gray-500 py-2">
                    Google registration is not configured
                  </div>
                )}

              </form>

              {/* Toggle Login/Register */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-[#2E7D32] hover:underline font-medium"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
