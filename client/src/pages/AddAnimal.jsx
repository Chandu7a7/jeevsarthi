import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { farmerAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  User,
  Camera,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  QrCode,
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

const AddAnimal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showVaccinationSection, setShowVaccinationSection] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [savedAnimal, setSavedAnimal] = useState(null);

  // Check for pre-filled data from QR scan
  useEffect(() => {
    const prefillData = sessionStorage.getItem('prefillAnimalData');
    if (prefillData) {
      try {
        const data = JSON.parse(prefillData);
        setFormData((prev) => ({
          ...prev,
          ...data,
        }));
        sessionStorage.removeItem('prefillAnimalData');
        toast.success('Animal data loaded from QR scan');
      } catch (error) {
        console.error('Error parsing prefill data:', error);
      }
    }
  }, []);

  // Common breeds for Cow and Buffalo
  const cowBreeds = [
    'Holstein', 'Jersey', 'Sahiwal', 'Gir', 'Red Sindhi', 'Tharparkar',
    'Kankrej', 'Ongole', 'Hariana', 'Rathi', 'Deoni', 'Amritmahal',
    'Khillar', 'Bargur', 'Kangayam', 'Punganur', 'Vechur', 'Other'
  ];
  
  const buffaloBreeds = [
    'Murrah', 'Nili-Ravi', 'Jaffarabadi', 'Surti', 'Mehsana', 'Bhadawari',
    'Pandharpuri', 'Nagpuri', 'Toda', 'Kalahandi', 'Manda', 'Other'
  ];

  const [breedSuggestions, setBreedSuggestions] = useState([]);
  const [showBreedSuggestions, setShowBreedSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    // Animal Information
    animalName: '',
    species: '',
    breed: '',
    gender: 'unknown',
    dateOfBirth: '',
    age: '',
    ageUnit: 'years',
    healthStatus: 'healthy',
    
    // Unique Identification
    pashuAadhaarId: '',
    earTagNumber: '',
    rfidNumber: '',
    
    // Animal Images
    frontPhoto: '',
    fullBodyPhoto: '',
    
    // Farm Details
    farmName: '',
    farmType: '',
    stallNumber: '',
    notes: '',
    
    // Vaccination & Records
    lastVaccinationDate: '',
    vaccinationType: '',
    previousIllnesses: '',
    ongoingMedications: '',
  });

  // Calculate age from date of birth
  useEffect(() => {
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const totalMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                          (today.getMonth() - birthDate.getMonth());
      
      if (totalMonths < 12) {
        setFormData(prev => ({
          ...prev,
          age: totalMonths.toString(),
          ageUnit: 'months',
        }));
      } else {
        const years = Math.floor(totalMonths / 12);
        setFormData(prev => ({
          ...prev,
          age: years.toString(),
          ageUnit: 'years',
        }));
      }
    }
  }, [formData.dateOfBirth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle breed autocomplete
    if (name === 'breed') {
      const breeds = formData.species === 'cow' ? cowBreeds : 
                     formData.species === 'buffalo' ? buffaloBreeds : [];
      
      if (value.length > 0 && breeds.length > 0) {
        const filtered = breeds.filter(breed =>
          breed.toLowerCase().includes(value.toLowerCase())
        );
        setBreedSuggestions(filtered);
        setShowBreedSuggestions(true);
      } else {
        setBreedSuggestions([]);
        setShowBreedSuggestions(false);
      }
    }
  };

  const handleBreedSelect = (breed) => {
    setFormData((prev) => ({
      ...prev,
      breed: breed,
    }));
    setShowBreedSuggestions(false);
    setBreedSuggestions([]);
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      
      // Clear breed when species changes
      if (name === 'species') {
        newData.breed = '';
        setBreedSuggestions([]);
        setShowBreedSuggestions(false);
      }
      
      return newData;
    });
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({
          ...prev,
          [type]: base64String,
        }));
        toast.success('Photo uploaded successfully');
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
      // Prepare data for API
      const dataToSend = {
        ...formData,
        // Convert date strings to Date objects
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        lastVaccinationDate: formData.lastVaccinationDate ? new Date(formData.lastVaccinationDate) : undefined,
        // Convert age to number
        age: formData.age ? parseFloat(formData.age) : undefined,
        // Remove empty strings
        ...Object.fromEntries(
          Object.entries(formData).filter(([_, v]) => v !== '')
        ),
      };

      console.log('Saving animal data:', dataToSend);

      const response = await farmerAPI.registerAnimal(dataToSend);
      
      if (response.data.success) {
        toast.success('Animal registered successfully!');
        setSavedAnimal(response.data.data);
        setShowQRModal(true);
        // Navigate to animals page after 2 seconds
        setTimeout(() => {
          navigate('/dashboard/farmer/animals');
        }, 2000);
      } else {
        toast.error('Failed to register animal');
      }
    } catch (error) {
      console.error('Failed to save animal:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to register animal. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      animalName: '',
      species: '',
      breed: '',
      gender: 'unknown',
      dateOfBirth: '',
      age: '',
      ageUnit: 'years',
      healthStatus: 'healthy',
      pashuAadhaarId: '',
      earTagNumber: '',
      rfidNumber: '',
      frontPhoto: '',
      fullBodyPhoto: '',
      farmName: '',
      farmType: '',
      stallNumber: '',
      notes: '',
      lastVaccinationDate: '',
      vaccinationType: '',
      previousIllnesses: '',
      ongoingMedications: '',
    });
    toast.success('Form cleared');
  };

  const handleDownloadQR = () => {
    toast.info('QR Code download feature coming soon');
    // TODO: Implement QR code download
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Animal</h1>
          <p className="text-gray-600">Register your animal for smart monitoring & traceability.</p>
        </div>

        {/* Main Form Card */}
        <Card className="p-6 rounded-[16px] mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Animal Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#2E7D32]" />
                  Animal Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="animalName">Animal Name (Optional)</Label>
                    <Input
                      id="animalName"
                      name="animalName"
                      value={formData.animalName}
                      onChange={handleChange}
                      className="rounded-[12px] mt-1"
                      placeholder="e.g., Gauri, Moti"
                    />
                  </div>

                  <div>
                    <Label htmlFor="species">Animal Species *</Label>
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectChange('species', 'cow')}
                        className={`flex-1 px-4 py-3 rounded-[12px] font-medium transition-colors ${
                          formData.species === 'cow'
                            ? 'bg-[#2E7D32] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        🐄 Cow
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectChange('species', 'buffalo')}
                        className={`flex-1 px-4 py-3 rounded-[12px] font-medium transition-colors ${
                          formData.species === 'buffalo'
                            ? 'bg-[#2E7D32] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        🐃 Buffalo
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      onFocus={() => {
                        if (formData.breed.length > 0) {
                          const breeds = formData.species === 'cow' ? cowBreeds : 
                                         formData.species === 'buffalo' ? buffaloBreeds : [];
                          const filtered = breeds.filter(breed =>
                            breed.toLowerCase().includes(formData.breed.toLowerCase())
                          );
                          setBreedSuggestions(filtered);
                          setShowBreedSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowBreedSuggestions(false), 200);
                      }}
                      className="rounded-[12px] mt-1"
                      placeholder={formData.species ? `Type to search ${formData.species} breed` : "Select species first"}
                      autoComplete="off"
                      disabled={!formData.species}
                    />
                    {showBreedSuggestions && breedSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[12px] shadow-lg max-h-60 overflow-y-auto">
                        {breedSuggestions.map((breed, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleBreedSelect(breed)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors first:rounded-t-[12px] last:rounded-b-[12px]"
                          >
                            {breed}
                          </button>
                        ))}
                      </div>
                    )}
                    {showBreedSuggestions && formData.breed.length > 0 && breedSuggestions.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[12px] shadow-lg p-4">
                        <p className="text-sm text-gray-500">No breed found</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectChange('gender', 'male')}
                        className={`flex-1 px-4 py-3 rounded-[12px] font-medium transition-colors ${
                          formData.gender === 'male'
                            ? 'bg-[#1976D2] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ♂️ Male
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectChange('gender', 'female')}
                        className={`flex-1 px-4 py-3 rounded-[12px] font-medium transition-colors ${
                          formData.gender === 'female'
                            ? 'bg-[#E91E63] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ♀️ Female
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectChange('gender', 'unknown')}
                        className={`flex-1 px-4 py-3 rounded-[12px] font-medium transition-colors ${
                          formData.gender === 'unknown'
                            ? 'bg-gray-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ❓ Unknown
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="rounded-[12px] mt-1"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        className="rounded-[12px] mt-1"
                        placeholder="0"
                        min="0"
                        readOnly={!!formData.dateOfBirth}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ageUnit">Unit</Label>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectChange('ageUnit', 'years')}
                          disabled={!!formData.dateOfBirth}
                          className={`flex-1 px-3 py-2 rounded-[12px] font-medium transition-colors ${
                            formData.ageUnit === 'years'
                              ? 'bg-[#2E7D32] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Years
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectChange('ageUnit', 'months')}
                          disabled={!!formData.dateOfBirth}
                          className={`flex-1 px-3 py-2 rounded-[12px] font-medium transition-colors ${
                            formData.ageUnit === 'months'
                              ? 'bg-[#2E7D32] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Months
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="healthStatus">Health Status</Label>
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectChange('healthStatus', 'healthy')}
                        className={`flex-1 px-4 py-3 rounded-[12px] font-medium transition-colors ${
                          formData.healthStatus === 'healthy'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ✅ Healthy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectChange('healthStatus', 'unhealthy')}
                        className={`flex-1 px-4 py-3 rounded-[12px] font-medium transition-colors ${
                          formData.healthStatus === 'unhealthy'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ❌ Unhealthy
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unique Identification */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#1976D2]" />
                  Unique Identification
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pashuAadhaarId">Pashu Aadhaar ID</Label>
                    <Input
                      id="pashuAadhaarId"
                      name="pashuAadhaarId"
                      value={formData.pashuAadhaarId}
                      onChange={handleChange}
                      className="rounded-[12px] mt-1"
                      placeholder="Auto-generated if empty"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
                  </div>

                  <div>
                    <Label htmlFor="earTagNumber">Ear Tag Number (Optional)</Label>
                    <Input
                      id="earTagNumber"
                      name="earTagNumber"
                      value={formData.earTagNumber}
                      onChange={handleChange}
                      className="rounded-[12px] mt-1"
                      placeholder="Enter ear tag number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rfidNumber">RFID Number (Optional)</Label>
                    <Input
                      id="rfidNumber"
                      name="rfidNumber"
                      value={formData.rfidNumber}
                      onChange={handleChange}
                      className="rounded-[12px] mt-1"
                      placeholder="Enter RFID number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Animal Images */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#FF9800]" />
                  Animal Images
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label>Upload Animal Photo (Front Face)</Label>
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-[12px] cursor-pointer hover:bg-gray-50 transition-colors">
                        {formData.frontPhoto ? (
                          <div className="relative w-full h-full">
                            <img
                              src={formData.frontPhoto}
                              alt="Front"
                              className="w-full h-full object-cover rounded-[12px]"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({ ...formData, frontPhoto: '' });
                              }}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Camera className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Click to upload front photo</p>
                            <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'frontPhoto')}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label>Upload Full Body Photo</Label>
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-[12px] cursor-pointer hover:bg-gray-50 transition-colors">
                        {formData.fullBodyPhoto ? (
                          <div className="relative w-full h-full">
                            <img
                              src={formData.fullBodyPhoto}
                              alt="Full Body"
                              className="w-full h-full object-cover rounded-[12px]"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({ ...formData, fullBodyPhoto: '' });
                              }}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Camera className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Click to upload full body photo</p>
                            <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'fullBodyPhoto')}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Farm Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Farm Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input
                      id="farmName"
                      name="farmName"
                      value={formData.farmName}
                      onChange={handleChange}
                      className="rounded-[12px] mt-1"
                      placeholder="Enter farm name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="farmType">Farm Type</Label>
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectChange('farmType', 'dairy')}
                        className={`flex-1 px-4 py-3 rounded-[12px] font-medium transition-colors ${
                          formData.farmType === 'dairy'
                            ? 'bg-[#2E7D32] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        🐄 Dairy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectChange('farmType', 'mixed')}
                        className={`flex-1 px-4 py-3 rounded-[12px] font-medium transition-colors ${
                          formData.farmType === 'mixed'
                            ? 'bg-[#2E7D32] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        🏡 Mixed
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stallNumber">Stall Number / Shed Number (Optional)</Label>
                    <Input
                      id="stallNumber"
                      name="stallNumber"
                      value={formData.stallNumber}
                      onChange={handleChange}
                      className="rounded-[12px] mt-1"
                      placeholder="Enter stall/shed number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes / Special Conditions</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                      placeholder="Enter any special notes or conditions..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vaccination & Previous Records (Accordion) */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => setShowVaccinationSection(!showVaccinationSection)}
              className="w-full flex items-center justify-between text-xl font-semibold text-gray-900 mb-4"
            >
              <span>Vaccination & Previous Records</span>
              {showVaccinationSection ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {showVaccinationSection && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lastVaccinationDate">Last Vaccination Date</Label>
                  <Input
                    id="lastVaccinationDate"
                    name="lastVaccinationDate"
                    type="date"
                    value={formData.lastVaccinationDate}
                    onChange={handleChange}
                    className="rounded-[12px] mt-1"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="vaccinationType">Type of Vaccination</Label>
                  <Input
                    id="vaccinationType"
                    name="vaccinationType"
                    value={formData.vaccinationType}
                    onChange={handleChange}
                    className="rounded-[12px] mt-1"
                    placeholder="e.g., FMD, Brucellosis"
                  />
                </div>

                <div>
                  <Label htmlFor="previousIllnesses">Previous Illnesses</Label>
                  <textarea
                    id="previousIllnesses"
                    name="previousIllnesses"
                    value={formData.previousIllnesses}
                    onChange={handleChange}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    placeholder="List any previous illnesses..."
                  />
                </div>

                <div>
                  <Label htmlFor="ongoingMedications">Ongoing Medications</Label>
                  <textarea
                    id="ongoingMedications"
                    name="ongoingMedications"
                    value={formData.ongoingMedications}
                    onChange={handleChange}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    placeholder="List any ongoing medications..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Buttons Section */}
          <div className="mt-8 flex flex-wrap gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="rounded-[12px]"
              disabled={loading}
            >
              Clear Form
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-[#2E7D32] hover:bg-[#1B5E20] rounded-[12px]"
              disabled={loading || !formData.species}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Animal'}
            </Button>
          </div>
        </Card>
      </main>

      {/* QR Code Modal */}
      {showQRModal && savedAnimal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 rounded-[16px] max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Animal Registered!</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Animal Name</p>
                <p className="text-lg font-semibold">{savedAnimal.animalName || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Pashu Aadhaar ID</p>
                <p className="text-lg font-semibold text-[#1976D2]">{savedAnimal.pashuAadhaarId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Animal Species</p>
                <p className="text-lg font-semibold capitalize">{savedAnimal.species}</p>
              </div>

              <div className="flex justify-center my-6">
                <div className="w-48 h-48 bg-gray-100 rounded-[12px] flex items-center justify-center border-2 border-dashed border-gray-300">
                  {savedAnimal.qrCode ? (
                    <img
                      src={savedAnimal.qrCode}
                      alt="QR Code"
                      className="w-full h-full object-contain rounded-[12px]"
                    />
                  ) : (
                    <div className="text-center">
                      <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">QR Code</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 rounded-[12px]"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={handleDownloadQR}
                  className="flex-1 bg-[#1976D2] hover:bg-[#1565C0] rounded-[12px]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AddAnimal;

