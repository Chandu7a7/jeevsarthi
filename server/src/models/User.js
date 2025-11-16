const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['farmer', 'vet', 'lab', 'regulator'],
      required: [true, 'Role is required'],
    },
    phone: {
      type: String,
      trim: true,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Location for GeoJSON queries (for vets)
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function(coords) {
            // If coordinates are provided, must be [longitude, latitude] with 2 numbers
            if (!coords) return true; // Optional
            return Array.isArray(coords) && coords.length === 2 && 
                   typeof coords[0] === 'number' && typeof coords[1] === 'number';
          },
          message: 'Coordinates must be [longitude, latitude] array with 2 numbers'
        },
      },
    },
    // Availability status (for vets)
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Online status
    onlineStatus: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Create GeoJSON index for location-based queries (sparse index - only indexes documents with valid location)
userSchema.index({ location: '2dsphere' }, { sparse: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Clean up invalid location objects before saving
userSchema.pre('save', function (next) {
  // If location exists but coordinates are missing or invalid, remove location
  if (this.location) {
    if (!this.location.coordinates || 
        !Array.isArray(this.location.coordinates) || 
        this.location.coordinates.length !== 2 ||
        !this.location.type) {
      // Remove invalid location - set to undefined so it's not saved
      this.location = undefined;
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

