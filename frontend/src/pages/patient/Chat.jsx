import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Paperclip, Video, Phone, ArrowLeft, Clock, Lock } from 'lucide-react';
import api from '../../services/api';
import socketService from '../../services/socket';
import useAuthStore from '../../store/authStore';
import { formatDate, formatTime } from '../../lib/utils';

const Chat = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [appointment, setAppointment] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchAppointmentAndMessages();
        setupSocketListeners();

        return () => {
            // Cleanup
            socketService.leaveChat(appointmentId);
            socketService.offMessage();
        };
    }, [appointmentId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchAppointmentAndMessages = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch appointment details
            const appointmentData = await api.get(`/appointments/${appointmentId}`);
            setAppointment(appointmentData.appointment);

            // Check if chat is unlocked
            if (!appointmentData.appointment.is_chat_unlocked) {
                setError('Chat is locked until appointment day');
                setLoading(false);
                return;
            }

            // Fetch messages
            const messagesData = await api.get(`/chat/${appointmentId}/messages`);
            setMessages(messagesData.messages || []);

            // Join chat room via Socket.IO
            socketService.joinChat(appointmentId);

        } catch (err) {
            setError(err.message || 'Failed to load chat');
        } finally {
            setLoading(false);
        }
    };

    const setupSocketListeners = () => {
        // Listen for new messages
        socketService.onMessage((data) => {
            setMessages(prev => [...prev, data.message]);
        });

        // Listen for message history
        socketService.onMessageHistory((data) => {
            setMessages(data.messages || []);
        });

        // Listen for joined confirmation
        socketService.onJoinedChat((data) => {
            console.log('Joined chat room:', data.room);
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || sending) return;

        try {
            setSending(true);

            // Send via Socket.IO for real-time delivery
            socketService.sendMessage({
                appointment_id: parseInt(appointmentId),
                message_text: newMessage.trim(),
                file_type: 'text'
            });

            setNewMessage('');
            inputRef.current?.focus();

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spin h-12 w-12 mx-auto mb-4 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-600">Loading chat...</p>
                </div>
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="card p-8 text-center">
                    <Lock className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat Unavailable</h3>
                    <p className="text-gray-600 mb-4">{error || 'Appointment not found'}</p>
                    {appointment && !appointment.is_chat_unlocked && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
                            <p className="text-sm text-yellow-800">
                                <Clock className="h-4 w-4 inline mr-1" />
                                Chat will unlock at midnight on {formatDate(appointment.appointment_date)}
                            </p>
                        </div>
                    )}
                    <button onClick={() => navigate('/patient/appointments')} className="btn-primary">
                        Back to Appointments
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/patient/appointments')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Dr. {appointment.doctor_name}
                            </h2>
                            <p className="text-sm text-gray-600">{appointment.doctor_specialization}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {appointment.is_video_unlocked && appointment.zoom_join_url && (
                            <a
                                href={appointment.zoom_join_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                            >
                                <Video className="h-4 w-4 mr-2 inline" />
                                Join Video Call
                            </a>
                        )}
                        {appointment.type === 'emergency' && appointment.doctor_phone && (
                            <a
                                href={`tel:${appointment.doctor_phone}`}
                                className="btn-secondary"
                            >
                                <Phone className="h-4 w-4 mr-2 inline" />
                                Call
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Appointment Info Banner */}
            <div className="bg-primary-50 border-b border-primary-200 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700">
                            <strong>Date:</strong> {formatDate(appointment.appointment_date)}
                        </span>
                        <span className="text-gray-700">
                            <strong>Time:</strong> {formatTime(appointment.appointment_time)}
                        </span>
                        <span className={`badge ${appointment.type === 'emergency' ? 'badge-danger' : 'badge-info'}`}>
                            {appointment.type}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-white rounded-lg p-6 inline-block">
                                <p className="text-gray-600">No messages yet. Start the conversation!</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isOwnMessage = message.sender_id === user.id;

                            return (
                                <div
                                    key={message.id || index}
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-md px-4 py-3 rounded-lg ${isOwnMessage
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-white text-gray-900 border border-gray-200'
                                            }`}
                                    >
                                        {message.file_type === 'prescription' && (
                                            <div className="mb-2 pb-2 border-b border-primary-400">
                                                <p className="text-sm font-semibold">📄 Prescription Shared</p>
                                            </div>
                                        )}

                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {message.message_text}
                                        </p>

                                        {message.file_url && message.file_type !== 'text' && (
                                            <a
                                                href={message.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`text-sm mt-2 inline-block underline ${isOwnMessage ? 'text-primary-100' : 'text-primary-600'
                                                    }`}
                                            >
                                                View Attachment
                                            </a>
                                        )}

                                        <p
                                            className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                                                }`}
                                        >
                                            {formatMessageTime(message.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 px-4 py-4">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                    <div className="flex items-end space-x-2">
                        <button
                            type="button"
                            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Attach file (coming soon)"
                        >
                            <Paperclip className="h-5 w-5 text-gray-600" />
                        </button>

                        <div className="flex-1">
                            <textarea
                                ref={inputRef}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                placeholder="Type your message..."
                                className="input w-full resize-none"
                                rows="1"
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                                disabled={sending}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="btn-primary px-6 py-3"
                        >
                            {sending ? (
                                <span className="spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                            ) : (
                                <>
                                    <Send className="h-5 w-5 mr-2 inline" />
                                    Send
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Chat;
