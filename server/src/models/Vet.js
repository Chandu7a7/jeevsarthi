const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  from: {
    type: String,
    default: '09:00',
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format'],
  },
  to: {
    type: String,
    default: '18:00',
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format'],
  },
}, { _id: false });

const vetProfileSchema = new mongoose.Schema(
  {
    vetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vet ID is required'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    profilePhotoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    identityCardUrl: {
      type: String,
      default: '',
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    clinicName: {
      type: String,
      required: [true, 'Clinic name is required'],
      trim: true,
    },
    clinicAddress: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
        match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode'],
      },
      country: {
        type: String,
        default: 'India',
        trim: true,
      },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Location coordinates are required'],
        validate: {
          validator: function (coords) {
            return (
              Array.isArray(coords) &&
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 &&
              coords[1] >= -90 &&
              coords[1] <= 90
            );
          },
          message: 'Invalid coordinates. Must be [longitude, latitude]',
        },
      },
    },
    availability: {
      type: [availabilitySchema],
      default: [
        { day: 'Monday', isAvailable: true, from: '09:00', to: '18:00' },
        { day: 'Tuesday', isAvailable: true, from: '09:00', to: '18:00' },
        { day: 'Wednesday', isAvailable: true, from: '09:00', to: '18:00' },
        { day: 'Thursday', isAvailable: true, from: '09:00', to: '18:00' },
        { day: 'Friday', isAvailable: true, from: '09:00', to: '18:00' },
        { day: 'Saturday', isAvailable: true, from: '09:00', to: '18:00' },
        { day: 'Sunday', isAvailable: false, from: '09:00', to: '18:00' },
      ],
    },
    languages: {
      type: [String],
      default: ['English', 'Hindi'],
      validate: {
        validator: function (langs) {
          return langs.length > 0;
        },
        message: 'At least one language is required',
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    specialization: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      min: 0,
      default: 0,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Create 2dsphere index for geolocation queries
vetProfileSchema.index({ location: '2dsphere' });
vetProfileSchema.index({ vetId: 1 });
vetProfileSchema.index({ registrationNumber: 1 });
vetProfileSchema.index({ isVerified: 1, rating: -1 });

// Virtual for formatted address
vetProfileSchema.virtual('formattedAddress').get(function () {
  const addr = this.clinicAddress;
  if (!addr) return '';
  const parts = [addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean);
  return parts.join(', ');
});

module.exports = mongoose.model('VetProfile', vetProfileSchema);

