import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";


const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, setUserAfterLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Login successful!');
      // Get user from localStorage to determine role
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const role = userData.role;

      // Redirect based on role
      if (role === 'regulator') {
        navigate('/dashboard/regulator');
      } else if (role === 'vet') {
        navigate('/dashboard/vet');
      } else if (role === 'lab') {
        navigate('/dashboard/lab');
      } else {
        navigate('/dashboard/farmer');
      }
    } else {
      toast.error(result.message || 'Login failed');
    }

    setLoading(false);
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      
      if (!credentialResponse?.credential) {
        toast.error("Google authentication failed. Please try again.");
        return;
      }

      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google login decoded:', { email: decoded.email, name: decoded.name });

      // For login, don't send role - backend will find existing user
      const payload = {
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      };

      console.log('Sending Google login payload:', payload);

      // Use authAPI service which handles proxy correctly
      const response = await authAPI.googleAuth(payload);
      console.log('Google login response:', response.data);

      if (response.data && response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        // Update AuthContext state
        setUserAfterLogin(token, user);

        toast.success("Google login successful!");

        const role = user.role || "farmer";

        // Redirect based on role
        if (role === "vet") {
          navigate("/dashboard/vet");
        } else if (role === "lab") {
          navigate("/dashboard/lab");
        } else if (role === "regulator") {
          navigate("/dashboard/regulator");
        } else {
          navigate("/dashboard/farmer");
        }
      } else {
        toast.error(response.data?.message || "Google login failed");
      }
    } catch (err) {
      console.error('Google login error:', err);
      const errorMsg = err.response?.data?.message || err.message || "Google login failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-green">JeevSarthi</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-green focus:border-primary-green"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-green focus:border-primary-green"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google Login failed")}
            />
          )}
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="text-center text-sm text-gray-500 py-2">
              Google login is not configured
            </div>
          )}


          <div className="text-center">
            <Link to="/register" className="text-sm text-primary-green hover:underline">
              Don't have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

