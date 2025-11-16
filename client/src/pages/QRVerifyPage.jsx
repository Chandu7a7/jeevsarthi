import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verifyHash } from '../services/api';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiCopy, FiUser, FiCalendar, FiMapPin, FiHeart, FiFileText } from 'react-icons/fi';
import { Card } from '../components/ui/card';

const QRVerifyPage = () => {
  const { hash } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hash) {
      verifyRecord(hash);
    }
  }, [hash]);

  const verifyRecord = async (hashValue) => {
    try {
      const response = await verifyHash(hashValue);
      setVerification(response.data);
    } catch (error) {
      toast.error('Verification failed');
      setVerification({ success: false, message: 'Hash not found' });
    } finally {
      setLoading(false);
    }
  };

  const copyHash = () => {
    navigator.clipboard.writeText(hash);
    toast.success('Hash copied to clipboard');
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

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
          <p>Verifying...</p>
        </div>
      </div>
    );
  }

  const animal = verification?.type === 'animal' ? verification.data : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {verification?.success ? (
          animal ? (
            // Animal Details View
            <div className="space-y-6">
              {/* Header */}
              <Card className="p-6 rounded-[16px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{getSpeciesEmoji(animal.species)}</div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {animal.animalName || 'Unnamed Animal'}
                      </h1>
                      <p className="text-gray-600 mt-1">Pashu Aadhaar ID: {animal.pashuAadhaarId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-lg border-2 border-green-500">
                    <FiCheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-green-800 font-semibold">Verified</span>
                  </div>
                </div>
              </Card>

              {/* Basic Information */}
              <Card className="p-6 rounded-[16px]">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Species</label>
                    <p className="text-gray-900 mt-1">
                      {getSpeciesEmoji(animal.species)} {animal.species?.charAt(0).toUpperCase() + animal.species?.slice(1)}
                    </p>
                  </div>
                  {animal.breed && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Breed</label>
                      <p className="text-gray-900 mt-1">{animal.breed}</p>
                    </div>
                  )}
                  {animal.gender && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gender</label>
                      <p className="text-gray-900 mt-1 capitalize">
                        {animal.gender === 'male' ? '♂️ Male' : animal.gender === 'female' ? '♀️ Female' : '❓ Unknown'}
                      </p>
                    </div>
                  )}
                  {animal.dateOfBirth && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      <p className="text-gray-900 mt-1">{formatDate(animal.dateOfBirth)}</p>
                    </div>
                  )}
                  {animal.age && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Age</label>
                      <p className="text-gray-900 mt-1">
                        {animal.age} {animal.ageUnit || 'years'}
                      </p>
                    </div>
                  )}
                  {animal.weight && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Weight</label>
                      <p className="text-gray-900 mt-1">
                        {animal.weight} {animal.weightUnit || 'kg'}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Health Status</label>
                    <p className="mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          animal.healthStatus === 'healthy'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {animal.healthStatus === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}
                      </span>
                    </p>
                  </div>
                </div>
              </Card>

              {/* Identification Numbers */}
              {(animal.earTagNumber || animal.rfidNumber) && (
                <Card className="p-6 rounded-[16px]">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiFileText className="w-5 h-5" />
                    Identification Numbers
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {animal.earTagNumber && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Ear Tag Number</label>
                        <p className="text-gray-900 mt-1 font-mono">{animal.earTagNumber}</p>
                      </div>
                    )}
                    {animal.rfidNumber && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">RFID Number</label>
                        <p className="text-gray-900 mt-1 font-mono">{animal.rfidNumber}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Farm Details */}
              {(animal.farmName || animal.farmType || animal.stallNumber) && (
                <Card className="p-6 rounded-[16px]">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5" />
                    Farm Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {animal.farmName && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Farm Name</label>
                        <p className="text-gray-900 mt-1">{animal.farmName}</p>
                      </div>
                    )}
                    {animal.farmType && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Farm Type</label>
                        <p className="text-gray-900 mt-1 capitalize">
                          {animal.farmType === 'dairy' ? '🐄 Dairy' : animal.farmType === 'mixed' ? '🏡 Mixed' : animal.farmType}
                        </p>
                      </div>
                    )}
                    {animal.stallNumber && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Stall Number</label>
                        <p className="text-gray-900 mt-1">{animal.stallNumber}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Vaccination & Health Records */}
              {(animal.lastVaccinationDate || animal.vaccinationType || animal.previousIllnesses || animal.ongoingMedications) && (
                <Card className="p-6 rounded-[16px]">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiHeart className="w-5 h-5" />
                    Vaccination & Health Records
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {animal.lastVaccinationDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Last Vaccination Date</label>
                        <p className="text-gray-900 mt-1">{formatDate(animal.lastVaccinationDate)}</p>
                      </div>
                    )}
                    {animal.vaccinationType && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Vaccination Type</label>
                        <p className="text-gray-900 mt-1">{animal.vaccinationType}</p>
                      </div>
                    )}
                    {animal.previousIllnesses && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Previous Illnesses</label>
                        <p className="text-gray-900 mt-1">{animal.previousIllnesses}</p>
                      </div>
                    )}
                    {animal.ongoingMedications && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Ongoing Medications</label>
                        <p className="text-gray-900 mt-1">{animal.ongoingMedications}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Photos */}
              {(animal.frontPhoto || animal.fullBodyPhoto) && (
                <Card className="p-6 rounded-[16px]">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {animal.frontPhoto && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">Front Photo</label>
                        <img
                          src={animal.frontPhoto}
                          alt="Front view"
                          className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}
                    {animal.fullBodyPhoto && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">Full Body Photo</label>
                        <img
                          src={animal.fullBodyPhoto}
                          alt="Full body view"
                          className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Farmer Information */}
              {animal.farmerId && (
                <Card className="p-6 rounded-[16px]">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUser className="w-5 h-5" />
                    Farmer Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Farmer Name</label>
                      <p className="text-gray-900 mt-1">{animal.farmerId?.name || 'Not provided'}</p>
                    </div>
                    {animal.farmerId?.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-gray-900 mt-1">{animal.farmerId.email}</p>
                      </div>
                    )}
                    {animal.farmerId?.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-gray-900 mt-1">{animal.farmerId.phone}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Notes */}
              {animal.notes && (
                <Card className="p-6 rounded-[16px]">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
                  <p className="text-gray-700">{animal.notes}</p>
                </Card>
              )}

              {/* Registration Date */}
              <Card className="p-6 rounded-[16px] bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Registered On</label>
                    <p className="text-gray-900 mt-1">
                      {animal.createdAt ? formatDate(animal.createdAt) : 'Not available'}
                    </p>
                  </div>
                  <button
                    onClick={copyHash}
                    className="text-primary-blue hover:underline flex items-center space-x-1 px-4 py-2 rounded-lg hover:bg-blue-50"
                  >
                    <FiCopy className="w-4 h-4" />
                    <span>Copy ID</span>
                  </button>
                </div>
              </Card>
            </div>
          ) : (
            // Blockchain Verification View (existing)
            <Card className="p-8 rounded-[16px]">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary-green mb-2">
                  Blockchain Verification
                </h1>
                <p className="text-gray-600">Verify the integrity of records</p>
              </div>

              <div className="space-y-6">
                {/* Success Status */}
                <div className="flex items-center justify-center space-x-3 bg-green-50 p-6 rounded-lg border-2 border-green-500">
                  <FiCheckCircle className="w-12 h-12 text-green-500" />
                  <div>
                    <h2 className="text-2xl font-bold text-green-800">Verified</h2>
                    <p className="text-green-600">This record is authentic and verified</p>
                  </div>
                </div>

                {/* Hash Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Blockchain Hash</label>
                    <button
                      onClick={copyHash}
                      className="text-primary-blue hover:underline flex items-center space-x-1"
                    >
                      <FiCopy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="font-mono text-sm text-gray-800 break-all">{hash}</p>
                </div>

                {/* Record Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Record Type
                    </label>
                    <p className="text-gray-800 capitalize">{verification.data?.type || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timestamp
                    </label>
                    <p className="text-gray-800">
                      {verification.data?.timestamp
                        ? new Date(verification.data.timestamp).toLocaleString()
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verified Status
                    </label>
                    <p className="text-green-600 font-semibold">
                      {verification.data?.verified ? '✓ Verified' : '✗ Not Verified'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )
        ) : (
          <Card className="p-8 rounded-[16px]">
            <div className="flex items-center justify-center space-x-3 bg-red-50 p-6 rounded-lg border-2 border-red-500">
              <FiXCircle className="w-12 h-12 text-red-500" />
              <div>
                <h2 className="text-2xl font-bold text-red-800">Verification Failed</h2>
                <p className="text-red-600">
                  {verification?.message || 'Hash not found or invalid'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QRVerifyPage;
