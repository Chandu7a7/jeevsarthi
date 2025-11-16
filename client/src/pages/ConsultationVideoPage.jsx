import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { consultationAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  ArrowLeft,
  Loader2,
  User,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

const ConsultationVideoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    loadConsultation();
    setupSocket();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [id]);

  const loadConsultation = async () => {
    try {
      setLoading(true);
      const response = await consultationAPI.getConsultation(id);
      if (response.data.success) {
        setConsultation(response.data.data);
        if (response.data.data.status === 'active') {
          startCall();
        }
      } else {
        toast.error('Consultation not found');
        navigate('/dashboard/consultation/request');
      }
    } catch (error) {
      console.error('Error loading consultation:', error);
      toast.error('Failed to load consultation');
      navigate('/dashboard/consultation/request');
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const token = localStorage.getItem('token');
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Video socket connected');
      socketRef.current.emit('join-consultation-video', id);
    });

    socketRef.current.on('video-offer', async (offer) => {
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socketRef.current.emit('video-answer', {
          consultationId: id,
          answer,
        });
      } catch (error) {
        console.error('Error handling video offer:', error);
      }
    });

    socketRef.current.on('video-answer', async (answer) => {
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error('Error handling video answer:', error);
      }
    });

    socketRef.current.on('ice-candidate', async (candidate) => {
      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });
  };

  const startCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Setup peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream tracks
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('ice-candidate', {
            consultationId: id,
            candidate: event.candidate,
          });
        }
      };

      // Create and send offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socketRef.current.emit('video-offer', {
        consultationId: id,
        offer,
      });

      setIsCallActive(true);
      toast.success('Call started');
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start video call. Please check your camera and microphone permissions.');
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    socketRef.current.emit('end-call', { consultationId: id });
    setIsCallActive(false);
    navigate(-1);
  };

  const getOtherUser = () => {
    if (!consultation) return null;
    if (user.role === 'farmer') {
      return consultation.vetId;
    } else {
      return consultation.farmerId;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32] mx-auto mb-4" />
          <p className="text-gray-600">Loading video call...</p>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-gray-700 rounded-[12px]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              {otherUser?.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold">
                  {otherUser?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-white">
                  {user.role === 'farmer'
                    ? `Dr. ${otherUser?.name || 'Veterinarian'}`
                    : otherUser?.name || 'Farmer'}
                </h2>
                <p className="text-sm text-gray-400">
                  {isCallActive ? 'Call in progress' : 'Connecting...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video (Main) */}
        <div className="absolute inset-0 bg-black">
          {isCallActive ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                {otherUser?.avatar ? (
                  <img
                    src={otherUser.avatar}
                    alt={otherUser.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                    {otherUser?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <p className="text-white text-xl">
                  {otherUser?.name || 'Connecting...'}
                </p>
                <p className="text-gray-400 mt-2">Waiting for connection...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Small) */}
        {isCallActive && localStream && (
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
          <Button
            onClick={toggleVideo}
            className={`rounded-full w-14 h-14 ${
              isVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            onClick={toggleAudio}
            className={`rounded-full w-14 h-14 ${
              isAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            onClick={endCall}
            className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 text-white"
          >
            <Phone className="w-6 h-6 rotate-[135deg]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationVideoPage;

