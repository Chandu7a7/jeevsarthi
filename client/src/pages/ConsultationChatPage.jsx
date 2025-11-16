import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { consultationAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import {
  Send,
  ArrowLeft,
  MessageCircle,
  Video,
  User,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

const ConsultationChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadConsultation();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConsultation = async () => {
    try {
      setLoading(true);
      const response = await consultationAPI.getConsultation(id);
      if (response.data.success) {
        setConsultation(response.data.data);
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
      console.log('Chat socket connected');
      socketRef.current.emit('join-consultation-chat', id);
    });

    socketRef.current.on('chat-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on('chat-history', (history) => {
      setMessages(history || []);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const message = {
      consultationId: id,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      text: messageText,
      timestamp: new Date(),
    };

    // Optimistically add message
    setMessages((prev) => [...prev, message]);

    try {
      socketRef.current.emit('send-message', {
        consultationId: id,
        message: messageText,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.timestamp !== message.timestamp));
    } finally {
      setSending(false);
    }
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
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="rounded-[12px]"
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
                <h2 className="font-semibold text-gray-900">
                  {user.role === 'farmer'
                    ? `Dr. ${otherUser?.name || 'Veterinarian'}`
                    : otherUser?.name || 'Farmer'}
                </h2>
                <p className="text-sm text-gray-600">
                  {consultation?.status === 'active' ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
          {consultation?.status === 'active' && (
            <Button
              onClick={() => navigate(`/dashboard/consultation/${id}/video`)}
              className="bg-[#E91E63] hover:bg-[#C2185B] rounded-[12px]"
            >
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </Button>
          )}
        </div>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.senderId === user.id;
              return (
                <div
                  key={index}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-[16px] ${
                      isOwnMessage
                        ? 'bg-[#2E7D32] text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs font-semibold mb-1 opacity-80">
                        {message.senderName}
                      </p>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {consultation?.status === 'active' && (
        <Card className="rounded-none border-x-0 border-b-0 p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="rounded-[12px] flex-1"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-[#2E7D32] hover:bg-[#1B5E20] rounded-[12px] px-6"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ConsultationChatPage;

