const User = require('../models/User');
const { generateToken } = require('../utils/token');
const { LOGIN_SUCCESS, REGISTER_SUCCESS, INVALID_CREDENTIALS } = require('../constants/messages');

/**
 * Register new user
 */
const registerUser = async (userData) => {
  const { name, email, password, role, phone } = userData;

  // Block regulator registration - only admin can have regulator role
  if (role === 'regulator') {
    throw new Error('Regulator role cannot be registered. Please contact administrator.');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Generate name from email if not provided
  const userName = name || email.split('@')[0] || 'User';

  // Create user - don't set location if not provided (prevents GeoJSON errors)
  const userPayload = {
    name: userName,
    email,
    password,
    role,
    phone: phone || '',
  };
  
  // Only add location if coordinates are provided
  // Don't set location field at all for regular users
  
  const user = await User.create(userPayload);

  // Generate token
  const token = generateToken(user._id);

  return {
    success: true,
    message: REGISTER_SUCCESS,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
    },
  };
};

/**
 * Login user
 */
const loginUser = async (email, password) => {
  // Find user with password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new Error(INVALID_CREDENTIALS);
  }

  if (!user.isActive) {
    throw new Error('User account is deactivated');
  }

  // Generate token
  const token = generateToken(user._id);

  return {
    success: true,
    message: LOGIN_SUCCESS,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
      token,
    },
  };
};

/**
 * Get current user
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    throw new Error('User not found');
  }

  return {
    success: true,
    data: user,
  };
};

/**
 * Google OAuth login/register
 * Accepts either:
 * - { credential, role } - JWT token to verify
 * - { googleId, email, name, picture, role } - Decoded payload (from frontend)
 */
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (data) => {
  let email, name, picture, sub, role;
  const isRegistration = data.role !== undefined && data.role !== null; // If role is provided, it's registration

  // Check if we received credential token or decoded payload
  if (data.credential) {
    // Backend verification (if GOOGLE_CLIENT_ID is configured)
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error("Google OAuth is not configured on the server. Please configure GOOGLE_CLIENT_ID.");
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: data.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      sub = payload.sub;
      role = data.role;
    } catch (error) {
      console.error('Google token verification error:', error);
      throw new Error("Invalid Google credential token");
    }
  } else if (data.googleId && data.email) {
    // Accept decoded payload from frontend (already decoded JWT)
    // Frontend already verified the token using Google's SDK
    email = data.email;
    name = data.name || email.split('@')[0];
    picture = data.picture || '';
    sub = data.googleId;
    role = data.role; // Can be undefined for login
  } else {
    throw new Error("Invalid Google authentication data. Missing googleId or email.");
  }

  if (!email) {
    throw new Error("Email is required for Google authentication");
  }

  // Find existing user
  let user = await User.findOne({ email });

  // If user exists (LOGIN scenario)
  if (user) {
    // If user registered with password, allow Google login but link accounts
    if (user.password && !user.googleId) {
      // Link Google account to existing password account
      user.googleId = sub;
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();
    } else if (!user.googleId) {
      // Update googleId if missing
      user.googleId = sub;
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();
    } else if (user.googleId !== sub) {
      // Google ID mismatch - security issue
      throw new Error("This email is associated with a different Google account");
    } else {
      // Update avatar if changed
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        await user.save();
      }
    }
  } 
  // New user (REGISTRATION scenario)
  else {
    // Registration requires role - if no role, it's a login attempt for non-existent user
    if (!isRegistration || !role) {
      throw new Error(
        "Account not found. Please register first using the registration form."
      );
    }

    // Regulator cannot self-register
    if (role === "regulator") {
      throw new Error(
        "Regulator accounts cannot be created via Google. Contact administrator."
      );
    }

    // Default to farmer if invalid role provided
    const userRole = ['farmer', 'vet', 'lab'].includes(role) ? role : 'farmer';

    // Create user without location (prevents GeoJSON errors)
    const newUserPayload = {
      name: name || email.split("@")[0],
      email,
      googleId: sub,
      avatar: picture || '',
      role: userRole,
      phone: "",
      password: undefined, // Google users don't need password
    };
    
    // Don't set location field - it will be set later when vet updates profile
    user = await User.create(newUserPayload);
  }

  if (!user.isActive) {
    throw new Error("User account is deactivated");
  }

  // Generate JWT
  const token = generateToken(user._id);

  // Final response
  return {
    success: true,
    message: user.password ? LOGIN_SUCCESS : REGISTER_SUCCESS,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
      token,
    },
  };
};





module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  googleAuth,
};

