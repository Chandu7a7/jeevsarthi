import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { farmerAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

// Get QR code URL - use network IP if on localhost for mobile scanning
const getQRCodeURL = () => {
  const origin = window.location.origin;
  const hostname = window.location.hostname;
  
  // If not localhost, use the origin as-is
  if (!hostname.includes('localhost') && hostname !== '127.0.0.1') {
    return origin;
  }

  // For localhost, try to get the network IP from environment
  const networkIP = import.meta.env.VITE_NETWORK_IP;
  if (networkIP) {
    return `http://${networkIP}:3000`;
  }

  // If accessing via network IP but origin shows localhost, extract from URL
  // This handles cases where user manually typed IP address
  const urlParams = new URLSearchParams(window.location.search);
  const ipParam = urlParams.get('ip');
  if (ipParam) {
    return `http://${ipParam}:3000`;
  }

  // Fallback: use origin (will work if scanning from same device)
  // In development, user should set VITE_NETWORK_IP in .env
  console.warn('⚠️ QR Code may not work from mobile. Set VITE_NETWORK_IP in .env file');
  return origin;
};

const AnimalsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await farmerAPI.getAnimals();
      if (response.data.success) {
        setAnimals(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching animals:', err);
      setError('Failed to load animals. Please try again.');
      toast.error('Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const getSpeciesEmoji = (species) => {
    const emojis = {
      cow: '🐄',
      buffalo: '🐃',
      goat: '🐐',
      sheep: '🐑',
      poultry: '🐔',
      other: '🐾',
    };
    return emojis[species] || '🐾';
  };

  const getSpeciesLabel = (species) => {
    return species ? species.charAt(0).toUpperCase() + species.slice(1) : 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32] mx-auto mb-4" />
            <p className="text-gray-600">Loading animals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Animals</h1>
            <p className="text-gray-600">
              Total Animals: <span className="font-semibold text-[#2E7D32]">{animals.length}</span>
            </p>
          </div>
          <Button
            onClick={() => navigate('/dashboard/farmer/animals/add')}
            className="bg-[#2E7D32] hover:bg-[#1B5E20] rounded-[12px]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Animal
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-6 rounded-[16px] border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </Card>
        )}

        {/* Animals Grid */}
        {animals.length === 0 ? (
          <Card className="p-12 rounded-[16px] text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🐄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Animals Yet</h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first animal to track its health and compliance.
              </p>
              <Button
                onClick={() => navigate('/dashboard/farmer/animals/add')}
                className="bg-[#2E7D32] hover:bg-[#1B5E20] rounded-[12px]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Animal
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map((animal) => (
              <Card
                key={animal._id}
                className="p-6 rounded-[16px] hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Left Side - Animal Details */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getSpeciesEmoji(animal.species)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {animal.animalName || 'Unnamed Animal'}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mb-1">
                        ID: {animal.pashuAadhaarId}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-medium">Farmer:</span>
                        <span className="text-gray-900">
                          {animal.farmerId?.name || user?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-medium">Species:</span>
                        <span className="text-gray-900">
                          {getSpeciesEmoji(animal.species)} {getSpeciesLabel(animal.species)}
                        </span>
                      </div>
                      {animal.breed && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 font-medium">Breed:</span>
                          <span className="text-gray-900">{animal.breed}</span>
                        </div>
                      )}
                      {animal.healthStatus && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 font-medium">Status:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              animal.healthStatus === 'healthy'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {animal.healthStatus === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - QR Code */}
                  <div className="flex-shrink-0">
                    <div className="bg-white p-3 rounded-[12px] border-2 border-gray-200">
                      {animal.pashuAadhaarId ? (
                        <QRCode
                          value={`${getQRCodeURL()}/verify/${animal.pashuAadhaarId}`}
                          size={120}
                          level="H"
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                      ) : (
                        <div className="w-[120px] h-[120px] bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400">No QR</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">Scan QR Code</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnimalsPage;

