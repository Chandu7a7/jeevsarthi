import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { consultationAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import {
  Bell,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  User,
  MessageCircle,
  Video,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

const VetConsultationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myConsultations, setMyConsultations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Setup Socket.io connection
    setupSocket();

    // Load my consultations
    loadMyConsultations();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const setupSocket = () => {
    const token = localStorage.getItem('token');
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Vet socket connected');
      socketRef.current.emit('join-consultation-room', user?.id);
    });

    socketRef.current.on('consultation-request', (data) => {
      console.log('New consultation request:', data);
      setIncomingRequests((prev) => {
        // Check if request already exists
        const exists = prev.find((req) => req.consultationId === data.consultationId);
        if (exists) return prev;
        return [...prev, data];
      });
      toast.success(`New consultation request from ${data.farmerName} (${data.distance}km away)`);
    });

    socketRef.current.on('consultation-closed', (data) => {
      console.log('Consultation closed:', data);
      setIncomingRequests((prev) =>
        prev.filter((req) => req.consultationId !== data.consultationId)
      );
      toast.info('This consultation has already been accepted by another veterinarian');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Vet socket disconnected');
    });
  };

  const loadMyConsultations = async () => {
    try {
      const response = await consultationAPI.getVetConsultations();
      if (response.data.success) {
        setMyConsultations(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
    }
  };

  const handleAccept = async (consultationId) => {
    setLoading(true);
    try {
      const response = await consultationAPI.acceptConsultation(consultationId);
      if (response.data.success) {
        toast.success('Consultation accepted successfully!');
        setIncomingRequests((prev) =>
          prev.filter((req) => req.consultationId !== consultationId)
        );
        await loadMyConsultations();
        // Navigate to chat
        navigate(`/dashboard/consultation/${consultationId}/chat`);
      } else {
        toast.error(response.data.message || 'Failed to accept consultation');
      }
    } catch (error) {
      console.error('Error accepting consultation:', error);
      toast.error(error.response?.data?.message || 'Failed to accept consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = (consultationId) => {
    setIncomingRequests((prev) =>
      prev.filter((req) => req.consultationId !== consultationId)
    );
    toast.info('Consultation request dismissed');
  };

  const handleStartChat = (consultationId) => {
    navigate(`/dashboard/consultation/${consultationId}/chat`);
  };

  const handleStartVideoCall = (consultationId) => {
    navigate(`/dashboard/consultation/${consultationId}/video`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="p-6 rounded-[16px] mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultation Requests</h1>
          <p className="text-gray-600">Accept and manage consultation requests from farmers</p>
        </Card>

        {/* Incoming Requests */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-6 h-6 text-[#2E7D32]" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Incoming Requests ({incomingRequests.length})
            </h2>
          </div>

          {incomingRequests.length === 0 ? (
            <Card className="p-8 rounded-[16px] text-center bg-gray-50">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No incoming consultation requests</p>
              <p className="text-sm text-gray-500 mt-2">
                You'll receive real-time notifications when farmers request consultations
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {incomingRequests.map((request) => (
                <Card
                  key={request.consultationId}
                  className="p-6 rounded-[16px] border-2 border-blue-200 bg-blue-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-lg font-bold">
                          {request.farmerName?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.farmerName || 'Farmer'}
                          </h3>
                          {request.mobileNumber && (
                            <p className="text-sm text-gray-700 mt-1">
                              📞 {request.mobileNumber}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{request.distance} km away</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(request.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Symptoms:</h4>
                        <p className="text-gray-700">{request.symptom}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => handleAccept(request.consultationId)}
                        disabled={loading}
                        className="bg-[#2E7D32] hover:bg-[#1B5E20] rounded-[12px] min-w-[120px]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(request.consultationId)}
                        variant="outline"
                        className="rounded-[12px] min-w-[120px]"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* My Consultations */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Consultations</h2>

          {myConsultations.length === 0 ? (
            <Card className="p-8 rounded-[16px] text-center bg-gray-50">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No active consultations</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myConsultations.map((consultation) => (
                <Card key={consultation._id} className="p-6 rounded-[16px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-[#1976D2] flex items-center justify-center text-white text-lg font-bold">
                          {consultation.farmerId?.name?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {consultation.farmerId?.name || 'Farmer'}
                          </h3>
                          {consultation.mobileNumber && (
                            <p className="text-sm text-gray-700 mt-1">
                              📞 {consultation.mobileNumber}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                consultation.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : consultation.status === 'closed'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {consultation.status}
                            </span>
                            <span>
                              {new Date(consultation.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Symptoms:</h4>
                        <p className="text-gray-700">{consultation.symptom}</p>
                      </div>
                    </div>

                    {consultation.status === 'active' && (
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
                          Video
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VetConsultationPage;

