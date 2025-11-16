import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { farmerAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  X,
  Camera,
  Save,
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

const FarmerProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [totalAnimals, setTotalAnimals] = useState(0);

  const [formData, setFormData] = useState({
    // Personal Information
    fullName: user?.name || '',
    email: user?.email || '',
    mobileNumber: user?.phone || '',
    aadhaarNumber: '',
    profilePhoto: '', // Store URL/base64 string
    profilePhotoFile: null, // Temporary file object for new uploads
    languagesSpoken: [],

    // Address
    state: '',
    district: '',
    blockTehsil: '',
    village: '',
    pinCode: '',

    // Farm Details
    farmType: '',
    farmRegistrationId: '',
    farmPhoto: '', // Store URL/base64 string
    farmPhotoFile: null, // Temporary file object for new uploads

    // Compliance
    amuComplianceScore: 85,
    violationsHistory: {
      safe: 0,
      warning: 0,
      violation: 0,
    },
    kycStatus: 'Pending',
    pashuMitraName: '',
    pashuMitraContact: '',
  });

  const [aadhaarDisplay, setAadhaarDisplay] = useState('XXXX-XXXX-XXXX');
  const [isAadhaarEditing, setIsAadhaarEditing] = useState(false);
  
  // Indian States list
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];
  
  const [stateSuggestions, setStateSuggestions] = useState([]);
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);

  useEffect(() => {
    if (user) {
      loadFarmerData();
      loadTotalAnimals();
    }
  }, [user]);

  const loadFarmerData = async () => {
    try {
      const response = await farmerAPI.getProfile();
      if (response.data.success) {
        const profileData = response.data.data;
        setFormData((prev) => ({
          ...prev,
          fullName: profileData.fullName || user?.name || '',
          email: user?.email || '',
          mobileNumber: profileData.mobileNumber || user?.phone || '',
          aadhaarNumber: profileData.aadhaarNumber || '',
          profilePhoto: profileData.profilePhoto || '',
          profilePhotoFile: null, // Reset file object on load
          languagesSpoken: profileData.languagesSpoken || [],
          state: profileData.state || '',
          district: profileData.district || '',
          blockTehsil: profileData.blockTehsil || '',
          village: profileData.village || '',
          pinCode: profileData.pinCode || '',
          farmType: profileData.farmType || '',
          farmRegistrationId: profileData.farmRegistrationId || '',
          farmPhoto: profileData.farmPhoto || '',
          farmPhotoFile: null, // Reset file object on load
          amuComplianceScore: profileData.amuComplianceScore || 85,
          violationsHistory: profileData.violationsHistory || { safe: 0, warning: 0, violation: 0 },
          kycStatus: profileData.kycStatus || 'Pending',
          pashuMitraName: profileData.pashuMitraName || '',
          pashuMitraContact: profileData.pashuMitraContact || '',
        }));
        
        // Set aadhaar display (masked - show only last 4 digits after save)
        if (profileData.aadhaarNumber) {
          const aadhaar = profileData.aadhaarNumber.replace(/\D/g, '');
          if (aadhaar.length >= 4) {
            setAadhaarDisplay('XXXX-XXXX-' + aadhaar.slice(-4));
          } else {
            setAadhaarDisplay('XXXX-XXXX-XXXX');
          }
        } else {
          setAadhaarDisplay('XXXX-XXXX-XXXX');
        }
        setIsAadhaarEditing(false);
      }
    } catch (error) {
      console.error('Failed to load farmer data:', error);
      toast.error('Failed to load profile data');
    }
  };

  const loadTotalAnimals = async () => {
    try {
      const response = await farmerAPI.getAnimals();
      if (response.data.success) {
        setTotalAnimals(response.data.data?.length || 0);
      }
    } catch (error) {
      console.error('Failed to load animals:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Handle state autocomplete
    if (name === 'state') {
      if (value.length > 0) {
        const filtered = indianStates.filter(state =>
          state.toLowerCase().includes(value.toLowerCase())
        );
        setStateSuggestions(filtered);
        setShowStateSuggestions(true);
      } else {
        setStateSuggestions([]);
        setShowStateSuggestions(false);
      }
    }
  };
  
  const handleStateSelect = (state) => {
    setFormData((prev) => ({
      ...prev,
      state: state,
    }));
    setShowStateSuggestions(false);
    setStateSuggestions([]);
  };

  const handleAadhaarChange = (e) => {
    const inputValue = e.target.value;
    // Remove all non-digits
    const value = inputValue.replace(/\D/g, '');
    
    if (value.length <= 12) {
      // Store actual aadhaar number (unmasked) in formData
      setFormData((prev) => ({
        ...prev,
        aadhaarNumber: value,
      }));
      
      // While editing, show the actual number being typed
      // Format as XXXX-XXXX-XXXX while typing
      if (value.length > 0) {
        let formatted = '';
        if (value.length <= 4) {
          formatted = value;
        } else if (value.length <= 8) {
          formatted = value.slice(0, 4) + '-' + value.slice(4);
        } else {
          formatted = value.slice(0, 4) + '-' + value.slice(4, 8) + '-' + value.slice(8);
        }
        setAadhaarDisplay(formatted);
      } else {
        setAadhaarDisplay('');
      }
    }
  };

  const handleAadhaarBlur = () => {
    // When user finishes editing, mask it (show only last 4 digits)
    if (formData.aadhaarNumber && formData.aadhaarNumber.length === 12) {
      const masked = 'XXXX-XXXX-' + formData.aadhaarNumber.slice(-4);
      setAadhaarDisplay(masked);
      setIsAadhaarEditing(false);
    } else if (formData.aadhaarNumber && formData.aadhaarNumber.length > 0) {
      // If not complete, still mask what we have
      const masked = 'XXXX-XXXX-' + formData.aadhaarNumber.slice(-4);
      setAadhaarDisplay(masked);
      setIsAadhaarEditing(false);
    } else {
      setAadhaarDisplay('XXXX-XXXX-XXXX');
      setIsAadhaarEditing(false);
    }
  };

  const handleAadhaarFocus = () => {
    // When user starts editing, show the actual number
    setIsAadhaarEditing(true);
    if (formData.aadhaarNumber) {
      const value = formData.aadhaarNumber;
      let formatted = '';
      if (value.length <= 4) {
        formatted = value;
      } else if (value.length <= 8) {
        formatted = value.slice(0, 4) + '-' + value.slice(4);
      } else {
        formatted = value.slice(0, 4) + '-' + value.slice(4, 8) + '-' + value.slice(8);
      }
      setAadhaarDisplay(formatted);
    } else {
      setAadhaarDisplay('');
    }
  };

  const handleLanguageChange = (value) => {
    setFormData((prev) => {
      const languages = prev.languagesSpoken || [];
      if (languages.includes(value)) {
        return {
          ...prev,
          languagesSpoken: languages.filter((lang) => lang !== value),
        };
      } else {
        return {
          ...prev,
          languagesSpoken: [...languages, value],
        };
      }
    });
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({
          ...prev,
          [type]: base64String, // Store base64 string
          [type + 'File']: file, // Keep file object for preview
        }));
        toast.success(`${type === 'profilePhoto' ? 'Profile' : 'Farm'} photo uploaded`);
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Prepare data for API (exclude computed fields and file objects)
      const { 
        totalAnimals, 
        amuComplianceScore, 
        violationsHistory,
        profilePhotoFile, // Temporary file object
        farmPhotoFile, // Temporary file object
        ...profileData 
      } = formData;
      
      // Prepare data to send
      // profilePhoto and farmPhoto are already base64 strings in formData
      const dataToSend = {
        ...profileData,
        // Send actual aadhaar number (unmasked) if it exists
        aadhaarNumber: formData.aadhaarNumber || '',
      };
      
      // Only include photo fields if they have values (to preserve existing photos if not updated)
      if (formData.profilePhoto) {
        dataToSend.profilePhoto = formData.profilePhoto;
      }
      if (formData.farmPhoto) {
        dataToSend.farmPhoto = formData.farmPhoto;
      }

      console.log('Saving profile data:', dataToSend);

      const response = await farmerAPI.updateProfile(dataToSend);
      
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        // Mask Aadhaar after successful save
        if (formData.aadhaarNumber && formData.aadhaarNumber.length >= 4) {
          setAadhaarDisplay('XXXX-XXXX-' + formData.aadhaarNumber.slice(-4));
        }
        setIsAadhaarEditing(false);
        // Reload data to get updated values from server
        await loadFarmerData();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      
      // Better error handling
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error('Network error: Please check if the backend server is running on port 5000');
      } else if (error.response) {
        // Server responded with error status
        toast.error(error.response.data?.message || `Error: ${error.response.status} - ${error.response.statusText}`);
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    toast.info('Changes cancelled');
    // Reload original data
    loadFarmerData();
  };

  const handleDownloadPDF = () => {
    toast.info('PDF download feature coming soon');
    // TODO: Generate and download PDF
  };

  const compliancePercentage = formData.amuComplianceScore;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (compliancePercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Profile</h1>
          <p className="text-gray-600">Manage your personal information and farm details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1️⃣ Personal Information Card */}
          <Card className="p-6 rounded-[16px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#2E7D32]/10 rounded-lg">
                <User className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>

            <div className="space-y-4">
              {/* Profile Photo */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {formData.profilePhoto || formData.profilePhotoFile ? (
                      <img
                        src={formData.profilePhoto || (formData.profilePhotoFile ? URL.createObjectURL(formData.profilePhotoFile) : '')}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-[#2E7D32] text-white rounded-full cursor-pointer hover:bg-[#1B5E20] transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'profilePhoto')}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Profile Photo</p>
                  <p className="text-xs text-gray-500">JPG, PNG up to 2MB</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-10 rounded-[12px]"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="pl-10 rounded-[12px] bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="pl-10 rounded-[12px]"
                    placeholder="+91 1234567890"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Aadhaar Number */}
              <div>
                <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                <div className="relative mt-1">
                  <Input
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    value={aadhaarDisplay}
                    onChange={handleAadhaarChange}
                    onFocus={handleAadhaarFocus}
                    onBlur={handleAadhaarBlur}
                    className="rounded-[12px]"
                    placeholder="Enter 12 digit Aadhaar number"
                    maxLength={14}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isAadhaarEditing 
                    ? 'Enter 12 digits. After saving, only last 4 digits will be visible.' 
                    : 'Last 4 digits visible for security. Click to edit full number.'}
                </p>
              </div>

              {/* Languages Spoken */}
              <div>
                <Label>Languages Spoken</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Hindi', 'English', 'Marathi', 'Gujarati', 'Punjabi', 'Telugu'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors ${
                        formData.languagesSpoken?.includes(lang)
                          ? 'bg-[#2E7D32] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 2️⃣ Address / Location Card */}
          <Card className="p-6 rounded-[16px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#1976D2]/10 rounded-lg">
                <MapPin className="w-5 h-5 text-[#1976D2]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Address / Location</h2>
            </div>

            <div className="space-y-4">
              {/* State */}
              <div className="relative">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  onFocus={() => {
                    if (formData.state.length > 0) {
                      const filtered = indianStates.filter(state =>
                        state.toLowerCase().includes(formData.state.toLowerCase())
                      );
                      setStateSuggestions(filtered);
                      setShowStateSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow click
                    setTimeout(() => setShowStateSuggestions(false), 200);
                  }}
                  className="rounded-[12px] mt-1"
                  placeholder="Type to search state (e.g., Andhra Pradesh)"
                  autoComplete="off"
                />
                {showStateSuggestions && stateSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[12px] shadow-lg max-h-60 overflow-y-auto">
                    {stateSuggestions.map((state, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleStateSelect(state)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors first:rounded-t-[12px] last:rounded-b-[12px]"
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                )}
                {showStateSuggestions && formData.state.length > 0 && stateSuggestions.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[12px] shadow-lg p-4">
                    <p className="text-sm text-gray-500">No state found</p>
                  </div>
                )}
              </div>

              {/* District */}
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="rounded-[12px] mt-1"
                  placeholder="Enter district"
                />
              </div>

              {/* Block / Tehsil */}
              <div>
                <Label htmlFor="blockTehsil">Block / Tehsil</Label>
                <Input
                  id="blockTehsil"
                  name="blockTehsil"
                  value={formData.blockTehsil}
                  onChange={handleChange}
                  className="rounded-[12px] mt-1"
                  placeholder="Enter block/tehsil"
                />
              </div>

              {/* Village */}
              <div>
                <Label htmlFor="village">Village</Label>
                <Input
                  id="village"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="rounded-[12px] mt-1"
                  placeholder="Enter village"
                />
              </div>

              {/* PIN Code */}
              <div>
                <Label htmlFor="pinCode">PIN Code</Label>
                <Input
                  id="pinCode"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  className="rounded-[12px] mt-1"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>

              {/* Farm Location Map */}
              <div className="mt-4">
                <Label>Farm Location Map</Label>
                <div className="mt-2 h-48 bg-gray-100 rounded-[12px] overflow-hidden border-2 border-gray-300">
                  {formData.state && formData.district && formData.village ? (
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        `${formData.village}, ${formData.district}, ${formData.state}, India${formData.pinCode ? ' ' + formData.pinCode : ''}`
                      )}&output=embed`}
                      title="Farm Location"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Fill address details to view location on map</p>
                        <p className="text-xs text-gray-400 mt-1">Enter State, District, and Village</p>
                      </div>
                    </div>
                  )}
                </div>
                {formData.state && formData.district && formData.village && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${formData.village}, ${formData.district}, ${formData.state}, India${formData.pinCode ? ' ' + formData.pinCode : ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1976D2] hover:underline mt-2 inline-block"
                  >
                    Open in Google Maps →
                  </a>
                )}
              </div>
            </div>
          </Card>

          {/* 3️⃣ Farm Details Card */}
          <Card className="p-6 rounded-[16px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#FF9800]/10 rounded-lg">
                <Home className="w-5 h-5 text-[#FF9800]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Farm Details</h2>
            </div>

            <div className="space-y-4">
              {/* Farm Type */}
              <div>
                <Label htmlFor="farmType">Farm Type</Label>
                <Select
                  value={formData.farmType}
                  onValueChange={(value) => setFormData({ ...formData, farmType: value })}
                >
                  <SelectTrigger id="farmType" className="rounded-[12px] mt-1">
                    <SelectValue placeholder="Select Farm Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[12px]">
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="poultry">Poultry</SelectItem>
                    <SelectItem value="goat">Goat</SelectItem>
                    <SelectItem value="sheep">Sheep</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total Animals (Auto-fetched) */}
              <div>
                <Label>Total Animals</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-[12px] border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">{totalAnimals}</span>
                    <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Auto-fetched from database</p>
                </div>
              </div>

              {/* Farm Registration ID */}
              <div>
                <Label htmlFor="farmRegistrationId">Farm Registration ID (Optional)</Label>
                <Input
                  id="farmRegistrationId"
                  name="farmRegistrationId"
                  value={formData.farmRegistrationId}
                  onChange={handleChange}
                  className="rounded-[12px] mt-1"
                  placeholder="Enter registration ID"
                />
              </div>

              {/* Farm Photo Upload */}
              <div>
                <Label>Farm Photo</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-[12px] cursor-pointer hover:bg-gray-50 transition-colors">
                    {formData.farmPhoto || formData.farmPhotoFile ? (
                      <div className="relative w-full h-full">
                        <img
                          src={formData.farmPhoto || (formData.farmPhotoFile ? URL.createObjectURL(formData.farmPhotoFile) : '')}
                          alt="Farm"
                          className="w-full h-full object-cover rounded-[12px]"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, farmPhoto: '', farmPhotoFile: null });
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload farm photo</p>
                        <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'farmPhoto')}
                    />
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* 4️⃣ Compliance & Health Metrics Card */}
          <Card className="p-6 rounded-[16px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#F44336]/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#F44336]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Compliance & Health Metrics</h2>
            </div>

            <div className="space-y-6">
              {/* AMU Compliance Score */}
              <div>
                <Label>AMU Compliance Score</Label>
                <div className="mt-4 flex items-center gap-6">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="45"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="45"
                        stroke="#2E7D32"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#2E7D32]">{compliancePercentage}%</p>
                        <p className="text-xs text-gray-500">Compliance</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Your antimicrobial usage compliance score</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#2E7D32]"></div>
                        <span className="text-xs text-gray-600">Within limits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <span className="text-xs text-gray-600">Warning zone</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs text-gray-600">Violation zone</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Violations History */}
              <div>
                <Label>Violations History</Label>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="p-4 bg-green-50 rounded-[12px] border border-green-200 text-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-700">{formData.violationsHistory.safe}</p>
                    <p className="text-xs text-green-600">Safe</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-[12px] border border-yellow-200 text-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-700">{formData.violationsHistory.warning}</p>
                    <p className="text-xs text-yellow-600">Warning</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-[12px] border border-red-200 text-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-700">{formData.violationsHistory.violation}</p>
                    <p className="text-xs text-red-600">Violation</p>
                  </div>
                </div>
              </div>

              {/* KYC Status */}
              <div>
                <Label>KYC Status</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-[12px] border border-gray-200 flex items-center justify-between">
                  <span className="text-gray-700 font-medium">
                    {formData.kycStatus === 'Verified' ? 'Verified' : 'Pending'}
                  </span>
                  {formData.kycStatus === 'Verified' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              </div>

              {/* PashuMitra Assigned */}
              <div>
                <Label>PashuMitra Assigned</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    name="pashuMitraName"
                    value={formData.pashuMitraName}
                    onChange={handleChange}
                    className="rounded-[12px]"
                    placeholder="PashuMitra Name"
                  />
                  <Input
                    name="pashuMitraContact"
                    value={formData.pashuMitraContact}
                    onChange={handleChange}
                    className="rounded-[12px]"
                    placeholder="Contact Number"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Buttons Section */}
        <div className="mt-8 flex flex-wrap gap-4 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="rounded-[12px] px-6"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="rounded-[12px] px-6 border-[#1976D2] text-[#1976D2] hover:bg-[#1976D2]/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Profile PDF
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-[12px] px-6 bg-[#2E7D32] hover:bg-[#1B5E20]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;

