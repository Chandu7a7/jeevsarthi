import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { treatmentAPI, animalAPI, farmerAPI } from '../services/api';
import { parseQRText } from '../utils/qrParse';
import { toast } from 'react-hot-toast';
import QRScanner from '../components/QRScanner';
import {
  QrCode,
  Search,
  Loader2,
  Save,
  Calendar,
  Pill,
  Syringe,
  Upload,
  X,
  Clock,
  AlertCircle,
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
import AIRecommendationSidebar from '../components/treatment/AIRecommendationSidebar';

const VetPrescriptionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchingDrugs, setSearchingDrugs] = useState(false);
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    animalId: '',
    medicine: '',
    dosage: '',
    frequency: 'once',
    startDate: new Date().toISOString().split('T')[0],
    duration: '1',
    prescriptionFile: null,
  });

  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [withdrawalEndDate, setWithdrawalEndDate] = useState(null);
  const [withdrawalPeriod, setWithdrawalPeriod] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);

  // Fetch animals on mount
  useEffect(() => {
    fetchAnimals();
  }, []);

  // Debounced drug search
  useEffect(() => {
    if (!formData.medicine || formData.medicine.length < 2) {
      setDrugSuggestions([]);
      setSelectedDrug(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchDrugs(formData.medicine);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.medicine]);

  // Calculate withdrawal period and AI recommendations
  useEffect(() => {
    if (selectedDrug && selectedAnimal && formData.startDate) {
      const isDairyAnimal =
        selectedAnimal.farmType === 'dairy' ||
        selectedAnimal.species === 'cow' ||
        selectedAnimal.species === 'buffalo';
      const withdrawalDays = isDairyAnimal
        ? selectedDrug.withdrawalPeriodMilk
        : selectedDrug.withdrawalPeriodMeat;

      setWithdrawalPeriod(withdrawalDays);

      const treatmentDate = new Date(formData.startDate);
      const endDate = new Date(treatmentDate);
      endDate.setDate(endDate.getDate() + withdrawalDays);
      setWithdrawalEndDate(endDate);

      // Generate AI recommendations
      generateAIRecommendations();
    }
  }, [selectedDrug, selectedAnimal, formData.startDate, formData.dosage]);

  const fetchAnimals = async () => {
    try {
      setLoadingAnimals(true);
      // For vet, try to fetch animals from consultations or use farmer API if accessible
      // In production, this should be a vet-specific endpoint
      try {
        const response = await farmerAPI.getAnimals();
        const animalsData = response.data?.data || response.data || [];
        setAnimals(Array.isArray(animalsData) ? animalsData : []);
      } catch (err) {
        // If farmer API doesn't work, animals can still be added via QR scan
        console.log('Animals will be loaded via QR scan');
        setAnimals([]);
      }
    } catch (error) {
      console.error('Error fetching animals:', error);
      setAnimals([]);
    } finally {
      setLoadingAnimals(false);
    }
  };

  const searchDrugs = async (query) => {
    try {
      setSearchingDrugs(true);
      const response = await treatmentAPI.searchDrugs(query);
      setDrugSuggestions(response.data.data || []);
    } catch (error) {
      console.error('Error searching drugs:', error);
    } finally {
      setSearchingDrugs(false);
    }
  };

  const handleDrugSelect = async (drugName) => {
    try {
      const response = await treatmentAPI.getDrugByName(drugName);
      setSelectedDrug(response.data.data);
      setFormData((prev) => ({ ...prev, medicine: drugName }));
      setDrugSuggestions([]);
    } catch (error) {
      toast.error('Failed to load drug information');
      console.error(error);
    }
  };

  const generateAIRecommendations = () => {
    if (!selectedDrug || !selectedAnimal) return;

    const recommendations = {
      riskScore: calculateRiskScore(),
      predictedWithdrawal: withdrawalPeriod,
      alternativeMedicines: getAlternativeMedicines(),
      overdoseAlert: checkOverdose(),
    };

    setAiRecommendations(recommendations);
  };

  const calculateRiskScore = () => {
    let score = 50; // Base score

    if (selectedDrug) {
      // Adjust based on risk level
      switch (selectedDrug.riskLevel) {
        case 'Low':
          score -= 20;
          break;
        case 'Medium':
          score += 10;
          break;
        case 'High':
          score += 30;
          break;
        case 'Critical':
          score += 50;
          break;
      }

      // Adjust based on dosage
      if (formData.dosage && selectedDrug.safeDosageMgKg) {
        const dosageRatio = parseFloat(formData.dosage) / selectedDrug.safeDosageMgKg;
        if (dosageRatio > 1.2) {
          score += 25; // Overdose
        } else if (dosageRatio > 1.0) {
          score += 10; // Near limit
        }
      }

      // Adjust based on age
      if (selectedAnimal) {
        const ageInMonths =
          selectedAnimal.ageUnit === 'years'
            ? selectedAnimal.age * 12
            : selectedAnimal.age;
        if (ageInMonths < 6 && selectedDrug.toxicityByAge?.calves === 'unsafe') {
          score += 30; // Unsafe for calves
        }
      }
    }

    return Math.min(100, Math.max(0, score));
  };

  const getAlternativeMedicines = () => {
    // In a real implementation, this would call an AI service
    // For now, return mock alternatives
    if (!selectedDrug) return [];
    return [
      { name: 'Alternative Medicine A', riskLevel: 'Low' },
      { name: 'Alternative Medicine B', riskLevel: 'Medium' },
    ];
  };

  const checkOverdose = () => {
    if (!selectedDrug || !formData.dosage) return null;
    const dosage = parseFloat(formData.dosage);
    const safeLimit = selectedDrug.safeDosageMgKg;

    if (dosage > safeLimit) {
      return {
        alert: true,
        message: `Dosage exceeds safe limit by ${((dosage / safeLimit - 1) * 100).toFixed(1)}%`,
      };
    }

    if (dosage > safeLimit * 0.9) {
      return {
        alert: true,
        message: 'Dosage is near safe limit. Please review.',
        warning: true,
      };
    }

    return null;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFormData((prev) => ({ ...prev, prescriptionFile: file }));
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, prescriptionFile: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleQRScan = async (decodedText) => {
    try {
      const { tagId, token } = parseQRText(decodedText);

      if (!tagId) {
        toast.error('Invalid QR code. Please scan a valid animal tag.');
        return;
      }

      const response = await animalAPI.scanByTag(tagId, token);

      if (response.data.success && response.data.animal) {
        const animal = response.data.animal;
        setSelectedAnimal(animal);
        setFormData((prev) => ({
          ...prev,
          animalId: animal._id,
        }));
        toast.success(`Animal loaded: ${animal.pashuAadhaarId || animal.tagId}`);
      } else {
        toast.error('Animal not found. Please check the QR code.');
      }
    } catch (error) {
      console.error('Error scanning QR:', error);
      toast.error('Failed to load animal. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAnimal) {
      toast.error('Please select an animal');
      return;
    }

    if (!selectedDrug) {
      toast.error('Please select a valid medicine');
      return;
    }

    if (!formData.dosage) {
      toast.error('Please enter dosage');
      return;
    }

    try {
      setLoading(true);

      const treatmentData = {
        animalId: selectedAnimal._id,
        medicine: selectedDrug.drugName,
        dosage: parseFloat(formData.dosage),
        frequency: formData.frequency,
        duration: parseInt(formData.duration),
        dateGiven: new Date(formData.startDate),
        notes: 'Prescription from veterinarian',
      };

      // Handle file upload if present
      if (formData.prescriptionFile) {
        // In a real implementation, upload file to server
        // For now, we'll include it in the notes
        treatmentData.notes += ` | Prescription file: ${formData.prescriptionFile.name}`;
      }

      const response = await treatmentAPI.addTreatment(treatmentData);

      if (response.data.success) {
        toast.success('Prescription added successfully!');
        // Reset form
        setFormData({
          animalId: '',
          medicine: '',
          dosage: '',
          frequency: 'once',
          startDate: new Date().toISOString().split('T')[0],
          duration: '1',
          prescriptionFile: null,
        });
        setSelectedAnimal(null);
        setSelectedDrug(null);
        setWithdrawalEndDate(null);
        setWithdrawalPeriod(null);
        setAiRecommendations(null);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to add prescription';
      toast.error(errorMessage);
      console.error('Error adding prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Veterinarian Prescription
          </h1>
          <p className="text-gray-600 text-lg">
            JEEVSARTHI — AI + Blockchain Livestock Health Portal
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Animal Selection Box */}
            <Card className="p-6 rounded-2xl border-2 border-gray-200 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <QrCode className="w-6 h-6 text-[#1976D2]" />
                Animal Selection
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setShowQRScanner(true)}
                    className="bg-[#1976D2] hover:bg-[#1565C0] text-white rounded-xl px-6 py-3 flex items-center gap-2 font-semibold"
                  >
                    <QrCode className="w-5 h-5" />
                    Scan QR
                  </Button>
                  <div className="flex-1">
                    <Label htmlFor="animal-select" className="text-gray-700 font-medium mb-2 block">
                      Select Animal
                    </Label>
                    <Select
                      value={selectedAnimal?._id || ''}
                      onValueChange={(value) => {
                        const animal = animals.find((a) => a._id === value);
                        if (animal) {
                          setSelectedAnimal(animal);
                          setFormData((prev) => ({ ...prev, animalId: animal._id }));
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Select an animal" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingAnimals ? (
                          <div className="p-4 text-center">
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          </div>
                        ) : animals.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No animals found
                          </div>
                        ) : (
                          animals.map((animal) => (
                            <SelectItem key={animal._id} value={animal._id}>
                              {animal.animalName || 'Unnamed'} - {animal.pashuAadhaarId || animal.tagId} ({animal.species})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Animal Info Display */}
                {selectedAnimal && (
                  <div className="bg-gradient-to-r from-[#1976D2]/10 to-[#2E7D32]/10 p-4 rounded-xl border-2 border-[#1976D2]/20">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Animal ID</p>
                        <p className="font-semibold text-gray-800">
                          {selectedAnimal.pashuAadhaarId || selectedAnimal.tagId || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Species</p>
                        <p className="font-semibold text-gray-800 capitalize">
                          {selectedAnimal.species || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Age</p>
                        <p className="font-semibold text-gray-800">
                          {selectedAnimal.age || 'N/A'} {selectedAnimal.ageUnit || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Add Prescription Form */}
            <Card className="p-6 rounded-2xl border-2 border-gray-200 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Pill className="w-6 h-6 text-[#2E7D32]" />
                Prescription Details
              </h2>
              <div className="space-y-5">
                {/* Medicine Name */}
                <div>
                  <Label htmlFor="medicine" className="text-gray-700 font-medium mb-2 block">
                    Medicine Name *
                  </Label>
                  <div className="relative">
                    <Pill className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="medicine"
                      type="text"
                      placeholder="Search medicine..."
                      value={formData.medicine}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          medicine: e.target.value,
                        }))
                      }
                      className="pl-10 rounded-xl h-12 border-2"
                    />
                    {searchingDrugs && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
                    )}
                  </div>

                  {/* Drug Suggestions */}
                  {drugSuggestions.length > 0 && (
                    <div className="mt-2 border-2 border-gray-200 rounded-xl bg-white shadow-xl max-h-60 overflow-y-auto z-50">
                      {drugSuggestions.map((drug) => (
                        <div
                          key={drug._id}
                          onClick={() => handleDrugSelect(drug.drugName)}
                          className="p-4 hover:bg-[#2E7D32]/10 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">{drug.drugName}</p>
                              <p className="text-sm text-gray-600 capitalize">{drug.category}</p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                drug.riskLevel === 'High' || drug.riskLevel === 'Critical'
                                  ? 'bg-red-100 text-red-700'
                                  : drug.riskLevel === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {drug.riskLevel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dosage */}
                <div>
                  <Label htmlFor="dosage" className="text-gray-700 font-medium mb-2 block">
                    Dosage ({selectedDrug?.dosageUnit || 'mg/kg'}) *
                  </Label>
                  <div className="relative">
                    <Syringe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                      className="pl-10 rounded-xl h-12 border-2"
                      required
                    />
                  </div>
                  {selectedDrug && (
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                      Safe limit: {selectedDrug.safeDosageMgKg} {selectedDrug.dosageUnit}
                    </p>
                  )}
                </div>

                {/* Frequency */}
                <div>
                  <Label htmlFor="frequency" className="text-gray-700 font-medium mb-2 block">
                    Frequency *
                  </Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger className="rounded-xl h-12 border-2">
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

                {/* Start Date */}
                <div>
                  <Label htmlFor="startDate" className="text-gray-700 font-medium mb-2 block">
                    Start Date *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="pl-10 rounded-xl h-12 border-2"
                      required
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <Label htmlFor="duration" className="text-gray-700 font-medium mb-2 block">
                    Duration (days) *
                  </Label>
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
                    className="rounded-xl h-12 border-2"
                    required
                  />
                </div>

                {/* Upload Prescription File */}
                <div>
                  <Label htmlFor="prescriptionFile" className="text-gray-700 font-medium mb-2 block">
                    Upload Prescription File
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border-2 h-12 px-6"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Choose File
                    </Button>
                    {formData.prescriptionFile && (
                      <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border-2 border-gray-200">
                        <span className="text-sm text-gray-700">
                          {formData.prescriptionFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Auto-calculated Section */}
            {(withdrawalPeriod || withdrawalEndDate) && (
              <Card className="p-6 rounded-2xl border-2 border-[#2E7D32] bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-[#2E7D32]" />
                  Withdrawal Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Withdrawal Period</p>
                    <p className="text-2xl font-bold text-[#2E7D32]">
                      {withdrawalPeriod} days
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Withdrawal End Date
                    </p>
                    <p className="text-2xl font-bold text-[#2E7D32]">
                      {withdrawalEndDate
                        ? new Date(withdrawalEndDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !selectedAnimal || !selectedDrug}
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Submit Prescription
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - AI Recommendation Sidebar */}
          <div className="space-y-6">
            <AIRecommendationSidebar
              recommendations={aiRecommendations}
              selectedDrug={selectedDrug}
              selectedAnimal={selectedAnimal}
            />
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onScan={handleQRScan}
        onClose={() => setShowQRScanner(false)}
      />
    </div>
  );
};

export default VetPrescriptionPage;

