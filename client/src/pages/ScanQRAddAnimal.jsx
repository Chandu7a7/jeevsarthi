import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { animalAPI, farmerAPI } from '../services/api';
import { parseQRText } from '../utils/qrParse';
import { storeOfflineScan, syncPendingScans } from '../offline/indexedDbSync';
import { toast } from 'react-hot-toast';
import QRScanner from '../components/QRScanner';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, User, Calendar, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const ScanQRAddAnimal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showQRScanner, setShowQRScanner] = useState(true);
  const [loading, setLoading] = useState(false);
  const [scannedAnimal, setScannedAnimal] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [error, setError] = useState(null);

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

  const handleQRScan = async (decodedText) => {
    try {
      setLoading(true);
      setError(null);
      const { tagId, token } = parseQRText(decodedText);

      if (!tagId) {
        toast.error('Invalid QR code. Please scan a valid animal tag.');
        setError('Invalid QR code format');
        return;
      }

      // Check if offline
      if (!navigator.onLine) {
        // Store for offline sync
        await storeOfflineScan({
          tagId,
          token,
          timestamp: Date.now(),
          payload: { tagId, token, action: 'addAnimal' },
        });
        toast('Saved offline — will sync when online', {
          icon: '📱',
        });
        setError('Offline mode: Scan saved locally. Will sync when online.');
        return;
      }

      // Fetch animal data
      console.log('Scanning QR with tagId:', tagId, 'token:', token);
      const response = await animalAPI.scanByTag(tagId, token);
      console.log('API Response:', response.data);

      if (response.data && response.data.success && response.data.animal) {
        const animal = response.data.animal;
        console.log('Animal data received:', animal);
        setScannedAnimal(animal);
        setShowQRScanner(false);

        // Log scan event
        try {
          await animalAPI.logScanEvent({
            tagId,
            animalId: animal._id,
            scanType: 'qr',
            action: 'addAnimal',
          });
        } catch (error) {
          console.error('Error logging scan event:', error);
        }

        toast.success('Animal data loaded successfully!');
      } else {
        const errorMsg = response.data?.message || 'Animal not found in database';
        console.error('Animal not found. Response:', response.data);
        toast.error(errorMsg || 'Animal not found. This animal may not be registered yet.');
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Error scanning QR:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        isNetworkError: error.isNetworkError,
      });
      
      // Handle network errors
      if (error.isNetworkError || !error.response) {
        const { tagId, token } = parseQRText(decodedText);
        if (tagId && !navigator.onLine) {
          // Store for offline sync
          await storeOfflineScan({
            tagId,
            token,
            timestamp: Date.now(),
            payload: { tagId, token, action: 'addAnimal' },
          });
          toast('Saved offline — will sync when online', {
            icon: '📱',
          });
          setError('Offline mode: Scan saved locally.');
        } else {
          const errorMsg = error.message || 'Network error. Please check your connection.';
          toast.error(errorMsg);
          setError(errorMsg);
        }
      } else {
        // Handle API errors (404, 400, etc.)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load animal data';
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMyAnimals = async () => {
    if (!scannedAnimal) return;

    try {
      setLoading(true);
      
      // Check if animal already belongs to this farmer
      if (scannedAnimal.farmerId?._id === user?.id) {
        toast.info('This animal is already in your account');
        navigate('/dashboard/farmer/animals');
        return;
      }

      // Navigate to Add Animal page with pre-filled data
      const animalData = {
        pashuAadhaarId: scannedAnimal.pashuAadhaarId || scannedAnimal.tagId,
        tagId: scannedAnimal.tagId || scannedAnimal.pashuAadhaarId,
        animalName: scannedAnimal.animalName || '',
        species: scannedAnimal.species,
        breed: scannedAnimal.breed || '',
        gender: scannedAnimal.gender || 'unknown',
        dateOfBirth: scannedAnimal.dateOfBirth ? new Date(scannedAnimal.dateOfBirth).toISOString().split('T')[0] : '',
        age: scannedAnimal.age || '',
        ageUnit: scannedAnimal.ageUnit || 'years',
        healthStatus: scannedAnimal.healthStatus || 'healthy',
        earTagNumber: scannedAnimal.earTagNumber || '',
        rfidNumber: scannedAnimal.rfidNumber || '',
        farmName: scannedAnimal.farmName || '',
        farmType: scannedAnimal.farmType || '',
        stallNumber: scannedAnimal.stallNumber || '',
        notes: scannedAnimal.notes || '',
        frontPhoto: scannedAnimal.frontPhoto || '',
        fullBodyPhoto: scannedAnimal.fullBodyPhoto || '',
      };

      // Store in sessionStorage to pre-fill form
      sessionStorage.setItem('prefillAnimalData', JSON.stringify(animalData));
      navigate('/dashboard/farmer/animals/add');
    } catch (error) {
      console.error('Error adding animal:', error);
      toast.error('Failed to add animal');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (scannedAnimal) {
      navigate(`/verify/${scannedAnimal.pashuAadhaarId || scannedAnimal.tagId}`);
    }
  };

  const handleScanAgain = () => {
    setScannedAnimal(null);
    setError(null);
    setShowQRScanner(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Scan QR → Add Animal</h1>
            <p className="text-gray-600 mt-2">Scan animal QR tag to add to your account</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/farmer')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Offline Indicator */}
        {isOffline && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                📱 Offline mode — scans will sync when online
              </p>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </Card>
        )}

        {/* QR Scanner */}
        {showQRScanner && !scannedAnimal && (
          <Card className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Scan Animal QR Code
              </h2>
              <p className="text-gray-600">
                Point your camera at the animal's QR tag
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => setShowQRScanner(true)}
                className="mb-4"
                size="lg"
              >
                Open QR Scanner
              </Button>
            </div>
          </Card>
        )}

        {/* Scanned Animal Details */}
        {scannedAnimal && !showQRScanner && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Animal Details
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleScanAgain}
                >
                  Scan Another
                </Button>
                <Button
                  onClick={handleViewDetails}
                  variant="outline"
                >
                  View Full Details
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Animal Name</p>
                    <p className="font-semibold text-gray-800">
                      {scannedAnimal.animalName || 'Unnamed'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Pashu Aadhaar ID</p>
                    <p className="font-semibold text-gray-800">
                      {scannedAnimal.pashuAadhaarId || scannedAnimal.tagId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Species</p>
                    <p className="font-semibold text-gray-800 capitalize">
                      {scannedAnimal.species}
                    </p>
                  </div>
                </div>

                {scannedAnimal.breed && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Breed</p>
                      <p className="font-semibold text-gray-800">
                        {scannedAnimal.breed}
                      </p>
                    </div>
                  </div>
                )}

                {scannedAnimal.age && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-semibold text-gray-800">
                        {scannedAnimal.age} {scannedAnimal.ageUnit || 'years'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Health Status</p>
                    <p className={`font-semibold capitalize ${
                      scannedAnimal.healthStatus === 'healthy' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {scannedAnimal.healthStatus || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {scannedAnimal.farmerId && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">Current Owner</p>
                    <p className="font-semibold text-gray-800">
                      {scannedAnimal.farmerId.name || 'Unknown'}
                    </p>
                    {scannedAnimal.farmerId.email && (
                      <p className="text-sm text-gray-600">
                        {scannedAnimal.farmerId.email}
                      </p>
                    )}
                  </div>
                )}

                {scannedAnimal.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-800">
                        {[
                          scannedAnimal.location.village,
                          scannedAnimal.location.district,
                          scannedAnimal.location.state,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {scannedAnimal.latestTreatment && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-600 mb-1">Latest Treatment</p>
                    <p className="font-semibold text-gray-800">
                      {scannedAnimal.latestTreatment.medicine}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Date: {new Date(scannedAnimal.latestTreatment.dateGiven).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4">
              <Button
                onClick={handleAddToMyAnimals}
                disabled={loading}
                className="flex-1"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add to My Animals
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/farmer/animals')}
                className="flex-1"
                size="lg"
              >
                View All Animals
              </Button>
            </div>

            {/* Info Message */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Adding this animal will pre-fill the registration form with the scanned data. 
                You can review and modify the information before saving.
              </p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && !scannedAnimal && (
          <Card className="p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-green" />
              <p className="ml-3 text-gray-600">Loading animal data...</p>
            </div>
          </Card>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onScan={handleQRScan}
        onClose={() => {
          setShowQRScanner(false);
          if (!scannedAnimal) {
            navigate('/dashboard/farmer');
          }
        }}
      />
    </div>
  );
};

export default ScanQRAddAnimal;

