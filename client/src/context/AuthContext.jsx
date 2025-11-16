import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getMe();
        if (response.data && response.data.success && response.data.data) {
          setUser(response.data.data);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Only clear auth if it's an auth error, not a network error
      if (error.response?.status === 401 || error.isNetworkError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data && response.data.success && response.data.data) {
        const { token, user: userData } = response.data.data;
        
        if (!token || !userData) {
          throw new Error('Invalid response: missing token or user data');
        }
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      
      // Handle network errors specifically
      let errorMessage = 'Login failed';
      if (error.isNetworkError) {
        errorMessage = error.message || 'Cannot connect to server. Please ensure the server is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.data && response.data.success && response.data.data) {
        const { token, user: newUser } = response.data.data;
        
        if (!token || !newUser) {
          throw new Error('Invalid response: missing token or user data');
        }
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Registration failed');
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      
      // Handle network errors specifically
      let errorMessage = 'Registration failed';
      if (error.isNetworkError) {
        errorMessage = error.message || 'Cannot connect to server. Please ensure the server is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const setUserAfterLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    setUserAfterLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

