import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { consultationAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  MessageCircle,
  Video,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const FarmerConsultationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const response = await consultationAPI.getFarmerConsultations();
      if (response.data.success) {
        setConsultations(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (consultationId) => {
    navigate(`/dashboard/consultation/${consultationId}/chat`);
  };

  const handleStartVideoCall = (consultationId) => {
    navigate(`/dashboard/consultation/${consultationId}/video`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="p-6 rounded-[16px] mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Consultation Requests</h1>
          <p className="text-gray-600">View and manage your consultation requests</p>
        </Card>

        {loading ? (
          <Card className="p-8 rounded-[16px] text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D32]"></div>
              <span className="ml-3 text-gray-600">Loading consultations...</span>
            </div>
          </Card>
        ) : consultations.length === 0 ? (
          <Card className="p-8 rounded-[16px] text-center bg-gray-50">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No consultation requests found</p>
            <p className="text-sm text-gray-500 mt-2">
              Create a new consultation request to get help from veterinarians
            </p>
            <Button
              onClick={() => navigate('/dashboard/consultation/request')}
              className="mt-4 bg-[#2E7D32] hover:bg-[#1B5E20] rounded-[12px]"
            >
              Create New Request
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {consultations.map((consultation) => (
              <Card key={consultation._id} className="p-6 rounded-[16px]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {consultation.vetId ? (
                        consultation.vetId.avatar ? (
                          <img
                            src={consultation.vetId.avatar}
                            alt={consultation.vetId.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-lg font-bold">
                            {consultation.vetId.name?.charAt(0) || 'V'}
                          </div>
                        )
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white text-lg font-bold">
                          <Clock className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {consultation.vetId
                            ? `Dr. ${consultation.vetId.name}`
                            : 'Waiting for veterinarian...'}
                        </h3>
                        {consultation.vetId?.email && (
                          <p className="text-sm text-gray-600">{consultation.vetId.email}</p>
                        )}
                        {consultation.vetId?.phone && (
                          <p className="text-sm text-gray-600">📞 {consultation.vetId.phone}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              consultation.status
                            )}`}
                          >
                            {consultation.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(consultation.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Symptoms:</h4>
                      <p className="text-gray-700">{consultation.symptom}</p>
                    </div>

                    {consultation.animalId && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Animal:</span>{' '}
                          {consultation.animalId.animalName || 'Unnamed'} -{' '}
                          {consultation.animalId.species}
                          {consultation.animalId.pashuAadhaarId && (
                            <span className="ml-2 text-gray-500">
                              (ID: {consultation.animalId.pashuAadhaarId})
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {consultation.status === 'active' && consultation.vetId && (
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => handleStartChat(consultation._id)}
                        className="bg-[#1976D2] hover:bg-[#1565C0] rounded-[12px] min-w-[120px]"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button
                        onClick={() => handleStartVideoCall(consultation._id)}
                        className="bg-[#E91E63] hover:bg-[#C2185B] rounded-[12px] min-w-[120px]"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Video Call
                      </Button>
                    </div>
                  )}

                  {consultation.status === 'pending' && (
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center gap-2 text-yellow-600">
                        <Clock className="w-5 h-5 animate-pulse" />
                        <span className="text-sm font-medium">Waiting...</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerConsultationPage;

