import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { consultationAPI, farmerAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import {
  MapPin,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  MessageCircle,
  Video,
  Clock,
  AlertCircle,
  User,
  Phone,
  Mail,
  Navigation,
  Star,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

const ConsultationRequestPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState(null);
  const [symptom, setSymptom] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [nearbyVetsCount, setNearbyVetsCount] = useState(0);
  const [consultation, setConsultation] = useState(null);
  const [acceptedVet, setAcceptedVet] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [radius] = useState(25000); // Fixed at 25 km in meters
  const [nearbyVets, setNearbyVets] = useState([]);
  const [loadingVets, setLoadingVets] = useState(false);
  const [selectedVets, setSelectedVets] = useState([]);

  useEffect(() => {
    // Load animals
    loadAnimals();

    // Setup Socket.io connection
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const loadAnimals = async () => {
    try {
      const response = await farmerAPI.getAnimals();
      if (response.data.success) {
        setAnimals(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading animals:', error);
    }
  };

  const setupSocket = () => {
    const token = localStorage.getItem('token');
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      socketRef.current.emit('join-consultation-room', user?.id);
    });

    socketRef.current.on('consultation-accepted', (data) => {
      console.log('Consultation accepted:', data);
      setAcceptedVet(data);
      setSearching(false);
      toast.success(`Dr. ${data.vetName} has accepted your consultation request!`);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationError(null);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);
        setLoading(false);
        toast.success('Location detected successfully');
        // Load nearby vets when location is detected
        loadNearbyVets(newLocation.lat, newLocation.lng);
      },
      (error) => {
        setLocationError('Unable to get your location. Please enable location services.');
        setLoading(false);
        toast.error('Location access denied');
      }
    );
  };

  const loadNearbyVets = async (lat, lng) => {
    try {
      setLoadingVets(true);
      console.log('Loading nearby vets for location:', lat, lng);
      const response = await consultationAPI.findNearbyVets(lat, lng, radius);
      console.log('Nearby vets response:', response.data);
      
      if (response.data.success) {
        const vets = response.data.data || [];
        setNearbyVets(vets);
        setNearbyVetsCount(response.data.count || 0);
        
        if (vets.length === 0) {
          toast.info('No veterinarians found within 25km radius. Make sure vets have their location set.', {
            duration: 5000,
          });
        } else {
          toast.success(`Found ${vets.length} veterinarian${vets.length > 1 ? 's' : ''} nearby`);
        }
      } else {
        console.error('Failed to load vets:', response.data);
        toast.error(response.data.message || 'Failed to load nearby veterinarians');
      }
    } catch (error) {
      console.error('Error loading nearby vets:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load nearby veterinarians');
    } finally {
      setLoadingVets(false);
    }
  };

  const toggleVetSelection = (vetId) => {
    setSelectedVets((prev) => {
      if (prev.includes(vetId)) {
        return prev.filter((id) => id !== vetId);
      } else {
        return [...prev, vetId];
      }
    });
  };

  const selectAllVets = () => {
    setSelectedVets(nearbyVets.map((vet) => vet._id));
  };

  const deselectAllVets = () => {
    setSelectedVets([]);
  };

  const handleRequestConsultation = async () => {
    if (!symptom.trim()) {
      toast.error('Please describe the symptoms');
      return;
    }

    if (!mobileNumber.trim()) {
      toast.error('Please enter your mobile number');
      return;
    }

    // Validate mobile number (10 digits)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber.trim())) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!location.lat || !location.lng) {
      toast.error('Please allow location access');
      getCurrentLocation();
      return;
    }

    // Check if vets are selected or available
    if (nearbyVets.length === 0) {
      toast.error('No veterinarians available nearby. Please try again later.');
      return;
    }

    // Use selected vets or all vets if none selected
    const vetsToSend = selectedVets.length > 0 ? selectedVets : nearbyVets.map((v) => v._id);

    setSearching(true);
    setAcceptedVet(null);
    setShowAIAssistant(false);

    try {
      const response = await consultationAPI.createConsultation({
        symptom,
        mobileNumber: mobileNumber.trim(),
        location,
        animalId: selectedAnimal || null,
        radius,
        selectedVetIds: vetsToSend, // Send to selected vets or all
      });

      if (response.data.success) {
        setConsultation(response.data.data);
        setNearbyVetsCount(response.data.nearbyVetsCount || 0);
        toast.success(
          `Request sent to ${vetsToSend.length} veterinarian${vetsToSend.length > 1 ? 's' : ''}`
        );
      } else {
        toast.error(response.data.message || 'Failed to create consultation request');
        setSearching(false);
      }
    } catch (error) {
      console.error('Error creating consultation:', error);
      toast.error(error.response?.data?.message || 'Failed to create consultation request');
      setSearching(false);
    }
  };

  // Radius is fixed at 25km - no expansion needed

  const handleStartChat = () => {
    if (consultation && acceptedVet) {
      navigate(`/dashboard/consultation/${consultation._id}/chat`);
    }
  };

  const handleStartVideoCall = () => {
    if (consultation && acceptedVet) {
      navigate(`/dashboard/consultation/${consultation._id}/video`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 rounded-[16px] mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Consultation</h1>
          <p className="text-gray-600">Get help from nearby veterinarians for your livestock</p>
        </Card>

        {/* Location Section */}
        <Card className="p-6 rounded-[16px] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-[#2E7D32]" />
            <h2 className="text-xl font-semibold text-gray-900">Your Location</h2>
          </div>

          {location.lat && location.lng ? (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span>Location detected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={getCurrentLocation}
                disabled={loading}
                className="bg-[#2E7D32] hover:bg-[#1B5E20] rounded-[12px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 mr-2" />
                    Get My Location
                  </>
                )}
              </Button>
              {locationError && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="w-5 h-5" />
                    <span>{locationError}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Nearby Veterinarians */}
        {location.lat && location.lng && (
          <Card className="p-6 rounded-[16px] mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Nearby Veterinarians (25km radius)
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {loadingVets
                    ? 'Loading veterinarians...'
                    : nearbyVets.length > 0
                    ? `${nearbyVets.length} veterinarian${nearbyVets.length > 1 ? 's' : ''} found`
                    : 'No veterinarians found nearby'}
                </p>
              </div>
              {nearbyVets.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadNearbyVets(location.lat, location.lng)}
                    className="rounded-lg"
                    disabled={loadingVets}
                  >
                    <Search className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllVets}
                    className="rounded-lg"
                  >
                    <CheckSquare className="w-4 h-4 mr-1" />
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllVets}
                    className="rounded-lg"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Deselect
                  </Button>
                </div>
              )}
            </div>

            {loadingVets ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32]" />
              </div>
            ) : nearbyVets.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <User className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-2">No veterinarians found within 25km</p>
                <p className="text-sm text-gray-500">
                  Try expanding your search or contact a veterinarian directly
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyVets.map((vet) => {
                  const isSelected = selectedVets.includes(vet._id);
                  return (
                    <Card
                      key={vet._id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#2E7D32] bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-[#1976D2] hover:shadow-md'
                      }`}
                      onClick={() => toggleVetSelection(vet._id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          {vet.avatar ? (
                            <img
                              src={vet.avatar}
                              alt={vet.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1976D2] flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200">
                              {vet.name?.charAt(0) || 'V'}
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#2E7D32] rounded-full flex items-center justify-center border-2 border-white">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            Dr. {vet.name}
                          </h3>
                          <div className="space-y-1 text-sm">
                            {vet.phone && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Phone className="w-3 h-3" />
                                <span className="truncate">{vet.phone}</span>
                              </div>
                            )}
                            {vet.email && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{vet.email}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-[#1976D2] font-medium mt-2">
                              <Navigation className="w-3 h-3" />
                              <span>
                                {vet.distanceKm !== undefined
                                  ? `${vet.distanceKm.toFixed(1)} km`
                                  : vet.distance !== undefined
                                  ? `${(vet.distance / 1000).toFixed(1)} km`
                                  : 'N/A'}{' '}
                                away
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="flex items-center gap-2 text-sm text-[#2E7D32]">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">Selected for consultation</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* Consultation Form */}
        {location.lat && location.lng && (
          <Card className="p-6 rounded-[16px] mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Consultation Details</h2>

            <div className="space-y-4">
              {/* Mobile Number */}
              <div>
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only numbers
                    if (value.length <= 10) {
                      setMobileNumber(value);
                    }
                  }}
                  placeholder="Enter your 10-digit mobile number"
                  className="rounded-[12px] mt-1"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Veterinarian will contact you on this number
                </p>
              </div>

              {/* Animal Selection */}
              <div>
                <Label htmlFor="animal">Select Animal (Optional)</Label>
                <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
                  <SelectTrigger id="animal" className="rounded-[12px] mt-1">
                    <SelectValue placeholder="Select an animal" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[12px]">
                    <SelectItem value="">None</SelectItem>
                    {animals.map((animal) => (
                      <SelectItem key={animal._id} value={animal._id}>
                        {animal.animalName || 'Unnamed'} - {animal.species} ({animal.pashuAadhaarId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Symptoms */}
              <div>
                <Label htmlFor="symptom">Describe Symptoms *</Label>
                <Textarea
                  id="symptom"
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  placeholder="e.g., Cow has high fever, not eating, showing signs of distress..."
                  className="rounded-[12px] mt-1 min-h-[120px]"
                  rows={5}
                  required
                />
              </div>

              {/* Request Button */}
              <Button
                onClick={handleRequestConsultation}
                disabled={
                  searching ||
                  !symptom.trim() ||
                  !mobileNumber.trim() ||
                  nearbyVets.length === 0 ||
                  loadingVets
                }
                className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] rounded-[12px] py-6 text-lg"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {selectedVets.length > 0
                      ? `Send Request to ${selectedVets.length} Selected Vet${selectedVets.length > 1 ? 's' : ''}`
                      : nearbyVets.length > 0
                      ? `Send Request to All ${nearbyVets.length} Veterinarian${nearbyVets.length > 1 ? 's' : ''}`
                      : 'No Veterinarians Available'}
                  </>
                )}
              </Button>
              {selectedVets.length > 0 && (
                <p className="text-sm text-center text-gray-600 mt-2">
                  {selectedVets.length} veterinarian{selectedVets.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Searching Status */}
        {searching && (
          <Card className="p-6 rounded-[16px] mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <h3 className="text-lg font-semibold text-blue-900">Searching for Veterinarians</h3>
            </div>
            <p className="text-blue-800 mb-2">
              Request sent to <span className="font-bold">{nearbyVetsCount}</span> nearby veterinarians within {radius / 1000}km radius
            </p>
            <p className="text-sm text-blue-600">Waiting for a veterinarian to accept your request...</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
              <Clock className="w-4 h-4" />
              <span>Request sent to all veterinarians within 25km radius</span>
            </div>
          </Card>
        )}

        {/* Accepted Vet Card */}
        {acceptedVet && (
          <Card className="p-6 rounded-[16px] mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Consultation Accepted!</h3>
            </div>

            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="flex items-center gap-4">
                {acceptedVet.vetAvatar ? (
                  <img
                    src={acceptedVet.vetAvatar}
                    alt={acceptedVet.vetName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-xl font-bold">
                    {acceptedVet.vetName?.charAt(0) || 'V'}
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Dr. {acceptedVet.vetName}</h4>
                  <p className="text-gray-600">{acceptedVet.vetEmail}</p>
                  {acceptedVet.vetPhone && (
                    <p className="text-gray-600">{acceptedVet.vetPhone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleStartChat}
                className="flex-1 bg-[#1976D2] hover:bg-[#1565C0] rounded-[12px]"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chat
              </Button>
              <Button
                onClick={handleStartVideoCall}
                className="flex-1 bg-[#E91E63] hover:bg-[#C2185B] rounded-[12px]"
              >
                <Video className="w-5 h-5 mr-2" />
                Video Call
              </Button>
            </div>
          </Card>
        )}

        {/* AI Assistant Fallback */}
        {showAIAssistant && (
          <Card className="p-6 rounded-[16px] mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-900">No Veterinarians Available</h3>
            </div>
            <p className="text-yellow-800 mb-4">
              We couldn't find any available veterinarians in your area. Would you like to:
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => setShowAIAssistant(false)}
                className="w-full bg-yellow-600 hover:bg-yellow-700 rounded-[12px]"
              >
                Try AI Assistant
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-[12px]"
                onClick={() => toast.info('SMS feature coming soon')}
              >
                Send SMS to Government Vet
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConsultationRequestPage;

