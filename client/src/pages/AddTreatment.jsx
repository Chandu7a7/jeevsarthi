import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { treatmentAPI } from '../services/api';
import { animalAPI } from '../services/api';
import { parseQRText } from '../utils/qrParse';
import { storeOfflineScan, syncPendingScans } from '../offline/indexedDbSync';
import { toast } from 'react-hot-toast';
import QRScanner from '../components/QRScanner';
import { Save, X, Camera, Loader2, CheckCircle, QrCode, AlertCircle } from 'lucide-react';
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
import AnimalSelector from '../components/treatment/AnimalSelector';
import MedicineInfoCard from '../components/treatment/MedicineInfoCard';
import DangerWarningCard from '../components/treatment/DangerWarningCard';
import WithdrawalInfoCard from '../components/treatment/WithdrawalInfoCard';

const AddTreatment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchingDrugs, setSearchingDrugs] = useState(false);
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [treatmentResult, setTreatmentResult] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    animalId: '',
    medicine: '',
    dosage: '',
    frequency: 'once',
    duration: '1',
    dateGiven: new Date().toISOString().split('T')[0],
    notes: '',
    symptoms: '',
    images: [],
  });

  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [withdrawalEndDate, setWithdrawalEndDate] = useState(null);
  const [withdrawalPeriod, setWithdrawalPeriod] = useState(null);
  const [medicineError, setMedicineError] = useState('');

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Sync pending scans when coming online
      syncPendingScans(async (scanData) => {
        try {
          await animalAPI.logScanEvent(scanData);
        } catch (error) {
          console.error('Error syncing scan event:', error);
        }
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Debounced drug search - search immediately as user types
  useEffect(() => {
    // Clear suggestions if input is empty
    if (!formData.medicine || formData.medicine.length === 0) {
      setDrugSuggestions([]);
      if (!selectedDrug) {
        setSelectedDrug(null);
      }
      return;
    }

    // Don't search if medicine matches selected drug name
    if (selectedDrug && formData.medicine === selectedDrug.drugName) {
      setDrugSuggestions([]);
      return;
    }

    // Search immediately when user types (reduced debounce for faster response)
    const timeoutId = setTimeout(() => {
      if (formData.medicine.length >= 1) {
        searchDrugs(formData.medicine);
      }
    }, 300); // Reduced from 500ms to 300ms for faster response

    return () => clearTimeout(timeoutId);
  }, [formData.medicine, selectedDrug]);

  // Update withdrawal info when drug is selected
  useEffect(() => {
    if (selectedDrug && selectedAnimal && formData.dateGiven) {
      const isDairyAnimal =
        selectedAnimal.farmType === 'dairy' ||
        selectedAnimal.species === 'cow' ||
        selectedAnimal.species === 'buffalo';
      const withdrawalDays = isDairyAnimal
        ? selectedDrug.withdrawalPeriodMilk
        : selectedDrug.withdrawalPeriodMeat;

      setWithdrawalPeriod(withdrawalDays);

      const treatmentDate = new Date(formData.dateGiven);
      const endDate = new Date(treatmentDate);
      endDate.setDate(endDate.getDate() + withdrawalDays);
      setWithdrawalEndDate(endDate);

      // Check for warnings
      checkWarnings();
    }
  }, [selectedDrug, selectedAnimal, formData.dateGiven, formData.dosage]);

  const searchDrugs = async (query) => {
    try {
      setSearchingDrugs(true);
      const response = await treatmentAPI.searchDrugs(query);
      // Handle both response formats
      const drugs = response.data?.data || response.data || [];
      setDrugSuggestions(Array.isArray(drugs) ? drugs : []);
    } catch (error) {
      console.error('Error searching drugs:', error);
      toast.error('Failed to search medicines. Please try again.');
      setDrugSuggestions([]);
    } finally {
      setSearchingDrugs(false);
    }
  };

  const handleDrugSelect = async (drugName) => {
    try {
      const response = await treatmentAPI.getDrugByName(drugName);
      const drug = response.data?.data || response.data;
      if (drug) {
        setSelectedDrug(drug);
        setFormData((prev) => ({ ...prev, medicine: drugName }));
        setDrugSuggestions([]);
        setMedicineError(''); // Clear any errors
      } else {
        setMedicineError('Medicine not found in database. Please select from the list.');
        toast.error('Medicine information not found');
      }
    } catch (error) {
      setMedicineError('Failed to load medicine. Please select from the dropdown.');
      toast.error('Failed to load drug information');
      console.error(error);
    }
  };

  const checkWarnings = () => {
    const newWarnings = [];

    if (selectedDrug) {
      // Check banned
      if (selectedDrug.banned) {
        newWarnings.push({
          type: 'banned',
          title: 'Banned Drug',
          message: `The drug "${selectedDrug.drugName}" is banned and cannot be used.`,
        });
      }

      // Check overdose
      if (formData.dosage && parseFloat(formData.dosage) > selectedDrug.safeDosageMgKg) {
        newWarnings.push({
          type: 'overdose',
          title: 'Overdose Warning',
          message: `Dosage (${formData.dosage} ${selectedDrug.dosageUnit}) exceeds safe limit (${selectedDrug.safeDosageMgKg} ${selectedDrug.dosageUnit}).`,
        });
      }

      // Check age toxicity
      if (selectedAnimal) {
        const ageInMonths =
          selectedAnimal.ageUnit === 'years'
            ? selectedAnimal.age * 12
            : selectedAnimal.age;
        if (ageInMonths < 6 && selectedDrug.toxicityByAge?.calves === 'unsafe') {
          newWarnings.push({
            type: 'toxicity',
            title: 'Age Toxicity Warning',
            message: 'This drug is unsafe for calves. Please consult a veterinarian.',
          });
        }
      }
    }

    setWarnings(newWarnings);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB

    files.forEach((file) => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAnimal) {
      toast.error('Please select an animal');
      return;
    }

    // Validate medicine - must be selected from dropdown
    if (!selectedDrug) {
      if (formData.medicine && formData.medicine.length > 0) {
        setMedicineError('Please select a medicine from the dropdown list. Typing alone is not enough.');
        toast.error('Please select a valid medicine from the dropdown');
      } else {
        setMedicineError('Please select a medicine');
        toast.error('Please select a medicine');
      }
      return;
    }

    // Ensure medicine name matches selected drug
    if (formData.medicine !== selectedDrug.drugName) {
      setMedicineError('Please select the medicine from the dropdown list');
      toast.error('Please select a valid medicine from the dropdown');
      return;
    }

    if (!formData.dosage) {
      toast.error('Please enter dosage');
      return;
    }

    if (selectedDrug.banned) {
      toast.error('Cannot use banned drug');
      return;
    }

    // Clear any errors before submission
    setMedicineError('');

    try {
      setLoading(true);

      const treatmentData = {
        animalId: selectedAnimal._id,
        medicine: selectedDrug.drugName,
        dosage: parseFloat(formData.dosage),
        frequency: formData.frequency,
        duration: parseInt(formData.duration),
        dateGiven: new Date(formData.dateGiven),
        notes: formData.notes || '',
        symptoms: formData.symptoms || '',
        images: formData.images || [],
      };

      console.log('Submitting treatment:', treatmentData);

      const response = await treatmentAPI.addTreatment(treatmentData);

      console.log('Treatment response:', response.data);

      if (response.data && response.data.success) {
        setTreatmentResult(response.data.data);
        setShowSuccessModal(true);
        toast.success('Treatment added successfully!');
      } else {
        toast.error(response.data?.message || 'Failed to add treatment');
      }
    } catch (error) {
      console.error('Error adding treatment:', error);
      const errorMessage =
        error.response?.data?.message || 
        error.message || 
        'Failed to add treatment. Please check all fields and try again.';
      toast.error(errorMessage);
      
      // Log full error for debugging
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (decodedText) => {
    try {
      const { tagId, token } = parseQRText(decodedText);

      if (!tagId) {
        toast.error('Invalid QR code. Please scan a valid animal tag.');
        return;
      }

      // Check if offline
      if (!navigator.onLine) {
        // Store for offline sync
        await storeOfflineScan({
          tagId,
          token,
          timestamp: Date.now(),
          payload: { tagId, token },
        });
        toast('Saved offline — will sync when online', {
          icon: '📱',
        });
        return;
      }

      // Fetch animal data
      const response = await animalAPI.scanByTag(tagId, token);

      if (response.data.success && response.data.animal) {
        const animal = response.data.animal;
        setSelectedAnimal(animal);
        setFormData((prev) => ({
          ...prev,
          animalId: animal._id,
        }));

        // Log scan event
        try {
          await animalAPI.logScanEvent({
            tagId,
            animalId: animal._id,
            scanType: 'qr',
          });
        } catch (error) {
          console.error('Error logging scan event:', error);
        }

        toast.success(`Animal loaded: ${animal.pashuAadhaarId || animal.tagId}`);
      } else {
        toast.error('Animal not found. Please check the QR code.');
      }
    } catch (error) {
      console.error('Error scanning QR:', error);
      
      if (!navigator.onLine) {
        // Store for offline sync
        const { tagId, token } = parseQRText(decodedText);
        if (tagId) {
          await storeOfflineScan({
            tagId,
            token,
            timestamp: Date.now(),
            payload: { tagId, token },
          });
          toast('Saved offline — will sync when online', {
            icon: '📱',
          });
        }
      } else {
        toast.error('Failed to load animal. Please try again.');
      }
    }
  };

  const handleClear = () => {
    setFormData({
      animalId: '',
      medicine: '',
      dosage: '',
      frequency: 'once',
      duration: '1',
      dateGiven: new Date().toISOString().split('T')[0],
      notes: '',
      symptoms: '',
      images: [],
    });
    setSelectedAnimal(null);
    setSelectedDrug(null);
    setWarnings([]);
    setWithdrawalEndDate(null);
    setWithdrawalPeriod(null);
    setMedicineError('');
    setDrugSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Add Treatment
          </h1>
          <p className="text-gray-600">
            Register treatment for smart monitoring & traceability
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Animal Selection */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Animal Information
                </h2>
                <div className="mb-4">
                  <Button
                    type="button"
                    onClick={() => setShowQRScanner(true)}
                    className="mb-3"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan QR Tag
                  </Button>
                  {isOffline && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        📱 Offline mode — scans will sync when online
                      </p>
                    </div>
                  )}
                </div>
                <AnimalSelector
                  selectedAnimal={selectedAnimal}
                  onAnimalSelect={(animal) => {
                    setSelectedAnimal(animal);
                    setFormData((prev) => ({ ...prev, animalId: animal._id }));
                  }}
                />
              </Card>

              {/* Medicine Selection */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Medicine Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="medicine">Medicine Name *</Label>
                    <div className="relative">
                      <Input
                        id="medicine"
                        type="text"
                        placeholder="Search medicine and select from dropdown..."
                        value={formData.medicine}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            medicine: value,
                          }));
                          // Clear selected drug if user is typing a different name
                          if (selectedDrug && value !== selectedDrug.drugName) {
                            setSelectedDrug(null);
                            setMedicineError('Please select a medicine from the dropdown list');
                          } else {
                            setMedicineError('');
                          }
                        }}
                        onFocus={() => {
                          // Show suggestions immediately if there's any text
                          if (formData.medicine && formData.medicine.length >= 1 && !selectedDrug) {
                            searchDrugs(formData.medicine);
                          }
                        }}
                        onBlur={() => {
                          // Validate on blur if medicine is entered but not selected
                          if (formData.medicine && !selectedDrug) {
                            setMedicineError('Please select a medicine from the dropdown list');
                          }
                        }}
                        className={`pr-10 ${medicineError ? 'border-red-500 focus:ring-red-500' : ''} ${selectedDrug ? 'border-green-500 focus:ring-green-500' : ''}`}
                        autoComplete="off"
                      />
                      {searchingDrugs && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                      )}
                      {selectedDrug && !searchingDrugs && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {medicineError && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {medicineError}
                      </p>
                    )}
                    {!selectedDrug && formData.medicine.length > 0 && !medicineError && (
                      <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Please select a medicine from the dropdown list above
                      </p>
                    )}

                    {/* Drug Suggestions - Show immediately as user types */}
                    {drugSuggestions.length > 0 && (
                      <div className="mt-2 border-2 border-blue-200 rounded-lg bg-white shadow-xl max-h-60 overflow-y-auto z-50 relative">
                        <div className="sticky top-0 bg-blue-50 px-3 py-2 border-b border-blue-200">
                          <p className="text-xs font-semibold text-blue-700">
                            Select a medicine from the list:
                          </p>
                        </div>
                        {drugSuggestions.map((drug) => (
                          <div
                            key={drug._id || drug.drugName}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDrugSelect(drug.drugName);
                            }}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors active:bg-blue-100"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#eff6ff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '';
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-base">
                                  {drug.drugName}
                                </p>
                                <p className="text-sm text-gray-600 capitalize mt-0.5">
                                  {drug.category || 'N/A'}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 ${
                                  drug.riskLevel === 'High' || drug.riskLevel === 'Critical'
                                    ? 'bg-red-100 text-red-700'
                                    : drug.riskLevel === 'Medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {drug.riskLevel || 'Low'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchingDrugs && drugSuggestions.length === 0 && formData.medicine.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500 flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching medicines...
                      </div>
                    )}
                    {!searchingDrugs && drugSuggestions.length === 0 && formData.medicine.length > 0 && !selectedDrug && (
                      <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                        <p className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          No medicines found. Try a different search term or check spelling.
                        </p>
                      </div>
                    )}

                    {selectedDrug && (
                      <div className="mt-4">
                        <MedicineInfoCard drug={selectedDrug} />
                      </div>
                    )}
                  </div>

                  {/* Warnings */}
                  {warnings.length > 0 && (
                    <div className="mt-4">
                      <DangerWarningCard warnings={warnings} />
                    </div>
                  )}

                  {/* Dosage */}
                  <div>
                    <Label htmlFor="dosage">
                      Dosage ({selectedDrug?.dosageUnit || 'mg/kg'}) *
                    </Label>
                    <Input
                      id="dosage"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter dosage"
                      value={formData.dosage}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dosage: e.target.value,
                        }))
                      }
                      required
                    />
                    {selectedDrug && (
                      <p className="text-xs text-gray-500 mt-1">
                        Safe limit: {selectedDrug.safeDosageMgKg}{' '}
                        {selectedDrug.dosageUnit}
                      </p>
                    )}
                  </div>

                  {/* Frequency */}
                  <div>
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, frequency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="twice">Twice Daily</SelectItem>
                        <SelectItem value="thrice">Thrice Daily</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div>
                    <Label htmlFor="duration">Duration (days) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      placeholder="Enter duration"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  {/* Date Given */}
                  <div>
                    <Label htmlFor="dateGiven">Date Given *</Label>
                    <Input
                      id="dateGiven"
                      type="date"
                      value={formData.dateGiven}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dateGiven: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Symptoms & Notes */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Symptoms & Notes
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="symptoms">Symptoms</Label>
                    <textarea
                      id="symptoms"
                      rows="3"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                      placeholder="Describe symptoms..."
                      value={formData.symptoms}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          symptoms: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      rows="3"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                      placeholder="Additional notes..."
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Images */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Attach Images (Optional)
                </h2>
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Images
                  </Button>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Info Cards */}
            <div className="space-y-6">
              {withdrawalEndDate && (
                <WithdrawalInfoCard
                  withdrawalEndDate={withdrawalEndDate}
                  withdrawalPeriod={withdrawalPeriod}
                  medicine={selectedDrug?.drugName}
                />
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear Form
            </Button>
            <Button 
              type="submit" 
              disabled={loading || warnings.some(w => w.type === 'banned') || !selectedDrug || !selectedAnimal}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Treatment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && treatmentResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Treatment Added Successfully!
              </h2>
              <p className="text-gray-600 mb-4">
                Treatment has been recorded and alerts have been generated.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Withdrawal End Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(treatmentResult.withdrawalEndDate).toLocaleDateString(
                    'en-IN',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Risk Score</p>
                <p className="font-semibold text-gray-800">
                  {treatmentResult.riskScore}/100
                </p>
              </div>
              {treatmentResult.alerts && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">
                    Alerts Generated:
                  </p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {treatmentResult.alerts.overdose && (
                      <li>• Overdose detected</li>
                    )}
                    {treatmentResult.alerts.interactions && (
                      <li>• Drug interactions found</li>
                    )}
                    {treatmentResult.alerts.mrlRisk && (
                      <li>• High MRL risk</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowSuccessModal(false);
                  handleClear();
                }}
              >
                Add Another
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/dashboard/farmer');
                }}
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onScan={handleQRScan}
        onClose={() => setShowQRScanner(false)}
      />
    </div>
  );
};

export default AddTreatment;

