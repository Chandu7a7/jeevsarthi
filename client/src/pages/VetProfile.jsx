import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createOrUpdateProfile, getProfile } from '../services/vetService';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  X,
  Clock,
  Globe,
  Award,
  Building,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;


const VetProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const profilePhotoInputRef = useRef(null);
  const identityCardInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.phone || '',
    profilePhotoUrl: '',
    identityCardUrl: '',
    registrationNumber: '',
    clinicName: '',
    clinicAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    latitude: '',
    longitude: '',
    availability: [
      { day: 'Monday', isAvailable: true, from: '09:00', to: '18:00' },
      { day: 'Tuesday', isAvailable: true, from: '09:00', to: '18:00' },
      { day: 'Wednesday', isAvailable: true, from: '09:00', to: '18:00' },
      { day: 'Thursday', isAvailable: true, from: '09:00', to: '18:00' },
      { day: 'Friday', isAvailable: true, from: '09:00', to: '18:00' },
      { day: 'Saturday', isAvailable: true, from: '09:00', to: '18:00' },
      { day: 'Sunday', isAvailable: false, from: '09:00', to: '18:00' },
    ],
    languages: ['English', 'Hindi'],
    specialization: [],
    experience: 0,
    bio: '',
  });

  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [identityCardPreview, setIdentityCardPreview] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [identityCardFile, setIdentityCardFile] = useState(null);

  const availableLanguages = [
    'English',
    'Hindi',
    'Bengali',
    'Telugu',
    'Marathi',
    'Tamil',
    'Gujarati',
    'Kannada',
    'Malayalam',
    'Punjabi',
    'Urdu',
    'Odia',
    'Assamese',
    'Nepali',
    'Sanskrit',
  ];

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  useEffect(() => {
    if (user && user.role === 'vet') {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.data.success && response.data.data) {
        const profile = response.data.data;
        setFormData({
          name: profile.name || user?.name || '',
          email: profile.email || user?.email || '',
          mobile: profile.mobile || user?.phone || '',
          profilePhotoUrl: profile.profilePhotoUrl || '',
          identityCardUrl: profile.identityCardUrl || '',
          registrationNumber: profile.registrationNumber || '',
          clinicName: profile.clinicName || '',
          clinicAddress: profile.clinicAddress || {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
          },
          latitude: profile.location?.coordinates?.[1] || '',
          longitude: profile.location?.coordinates?.[0] || '',
          availability: profile.availability || formData.availability,
          languages: profile.languages || ['English', 'Hindi'],
          specialization: profile.specialization || [],
          experience: profile.experience || 0,
          bio: profile.bio || '',
        });

        if (profile.profilePhotoUrl) {
          setProfilePhotoPreview(profile.profilePhotoUrl);
        }
        if (profile.identityCardUrl) {
          setIdentityCardPreview(profile.identityCardUrl);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Profile doesn't exist yet, that's okay
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('clinicAddress.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        clinicAddress: {
          ...prev.clinicAddress,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'profilePhoto') {
        setProfilePhotoPreview(reader.result);
        setProfilePhotoFile(file);
      } else if (type === 'identityCard') {
        setIdentityCardPreview(reader.result);
        setIdentityCardFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (type) => {
    if (type === 'profilePhoto') {
      setProfilePhotoPreview('');
      setProfilePhotoFile(null);
      setFormData((prev) => ({ ...prev, profilePhotoUrl: '' }));
    } else if (type === 'identityCard') {
      setIdentityCardPreview('');
      setIdentityCardFile(null);
      setFormData((prev) => ({ ...prev, identityCardUrl: '' }));
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.loading('Getting your location...', { id: 'location' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
        toast.success('Location captured successfully!', { id: 'location' });
      },
      (error) => {
        toast.error('Failed to get location. Please enter manually.', { id: 'location' });
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.map((avail) =>
        avail.day === day ? { ...avail, [field]: value } : avail
      ),
    }));
  };

  const toggleDayAvailability = (day) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.map((avail) =>
        avail.day === day ? { ...avail, isAvailable: !avail.isAvailable } : avail
      ),
    }));
  };

  const handleLanguageChange = (language) => {
    setFormData((prev) => {
      const languages = prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language];
      return { ...prev, languages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.registrationNumber) {
      toast.error('Registration number is required');
      return;
    }

    if (!formData.clinicName) {
      toast.error('Clinic name is required');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error('Please set your location');
      return;
    }

    if (formData.languages.length === 0) {
      toast.error('Please select at least one language');
      return;
    }

    try {
      setSaving(true);

      // Create FormData for file uploads
      const submitData = new FormData();

      // Add text fields
      Object.keys(formData).forEach((key) => {
        if (key === 'clinicAddress') {
          submitData.append('clinicAddress', JSON.stringify(formData.clinicAddress));
        } else if (key === 'availability') {
          submitData.append('availability', JSON.stringify(formData.availability));
        } else if (key === 'languages') {
          submitData.append('languages', JSON.stringify(formData.languages));
        } else if (key === 'specialization') {
          submitData.append('specialization', JSON.stringify(formData.specialization));
        } else if (key !== 'profilePhotoUrl' && key !== 'identityCardUrl') {
          submitData.append(key, formData[key]);
        }
      });

      // Add location
      submitData.append('latitude', formData.latitude);
      submitData.append('longitude', formData.longitude);

      // Add files
      if (profilePhotoFile) {
        submitData.append('profilePhoto', profilePhotoFile);
      }
      if (identityCardFile) {
        submitData.append('identityCard', identityCardFile);
      }

      const response = await createOrUpdateProfile(submitData);

      if (response.data.success) {
        toast.success('Profile saved successfully!');
        // Reload profile to get updated URLs
        await loadProfile();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to save profile';
      toast.error(errorMessage);
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Veterinarian Profile</h1>
          <p className="text-gray-600">Complete your profile to help farmers find you</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  pattern="[6-9][0-9]{9}"
                  required
                />
              </div>
              <div>
                <Label htmlFor="registrationNumber">Registration Number *</Label>
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="VET-123456"
                />
              </div>
            </div>

            {/* Profile Photo */}
            <div className="mt-4">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4 mt-2">
                {profilePhotoPreview && (
                  <div className="relative">
                    <img
                      src={profilePhotoPreview}
                      alt="Profile"
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto('profilePhoto')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div>
                  <input
                    ref={profilePhotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'profilePhoto')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => profilePhotoInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {profilePhotoPreview ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Identity Card */}
            <div className="mt-4">
              <Label>Identity Card (Veterinary License)</Label>
              <div className="flex items-center gap-4 mt-2">
                {identityCardPreview && (
                  <div className="relative">
                    <img
                      src={identityCardPreview}
                      alt="Identity Card"
                      className="w-32 h-20 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto('identityCard')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div>
                  <input
                    ref={identityCardInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'identityCard')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => identityCardInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {identityCardPreview ? 'Change Card' : 'Upload Identity Card'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Clinic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Clinic Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clinicName">Clinic Name *</Label>
                <Input
                  id="clinicName"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinicAddress.street">Street Address</Label>
                  <Input
                    id="clinicAddress.street"
                    name="clinicAddress.street"
                    value={formData.clinicAddress.street}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="clinicAddress.city">City</Label>
                  <Input
                    id="clinicAddress.city"
                    name="clinicAddress.city"
                    value={formData.clinicAddress.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="clinicAddress.state">State</Label>
                  <Input
                    id="clinicAddress.state"
                    name="clinicAddress.state"
                    value={formData.clinicAddress.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="clinicAddress.pincode">Pincode</Label>
                  <Input
                    id="clinicAddress.pincode"
                    name="clinicAddress.pincode"
                    value={formData.clinicAddress.pincode}
                    onChange={handleInputChange}
                    pattern="[0-9]{6}"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location *
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseMyLocation}
                  className="flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Use My Location
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    required
                    placeholder="28.6139"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    required
                    placeholder="77.2090"
                  />
                </div>
              </div>
              {formData.latitude && formData.longitude && (
                <div className="mt-4">
                  <iframe
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${formData.latitude},${formData.longitude}`}
                  ></iframe>
                </div>
              )}
            </div>
          </Card>

          {/* Availability Schedule */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Availability Schedule
            </h2>
            <div className="space-y-3">
              {formData.availability.map((avail) => (
                <div
                  key={avail.day}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 w-32">
                    <input
                      type="checkbox"
                      checked={avail.isAvailable}
                      onChange={() => toggleDayAvailability(avail.day)}
                      className="w-4 h-4 text-[#2E7D32]"
                    />
                    <Label className="font-medium">{avail.day}</Label>
                  </div>
                  {avail.isAvailable && (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={avail.from}
                        onChange={(e) =>
                          handleAvailabilityChange(avail.day, 'from', e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={avail.to}
                        onChange={(e) =>
                          handleAvailabilityChange(avail.day, 'to', e.target.value)
                        }
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Languages */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Languages Spoken *
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    formData.languages.includes(lang)
                      ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#2E7D32]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            {formData.languages.length > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                Selected: {formData.languages.join(', ')}
              </p>
            )}
          </Card>

          {/* Additional Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  name="experience"
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
                  placeholder="Tell farmers about your expertise and experience..."
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/1000 characters
                </p>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="min-w-[150px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VetProfile;

