'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { getChatHistory } from '../../lib/services/tripService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import { Send } from 'lucide-react';

const ChatBox = ({ tripId }) => {
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null); // To auto-scroll to the bottom

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleNewMessage = useCallback((message) => {
    // Avoid adding duplicate messages if component re-renders
    setMessages(prevMessages => {
      if (prevMessages.find(m => m.id === message.id)) {
        return prevMessages;
      }
      return [...prevMessages, message];
    });
  }, []);

  useEffect(() => {
    if (socket && tripId) {
      // Listen for incoming messages
      socket.on('newChatMessage', handleNewMessage);

      // Cleanup
      return () => {
        socket.off('newChatMessage', handleNewMessage);
      };
    }
  }, [socket, tripId, handleNewMessage]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!tripId) return;
      setIsLoadingHistory(true);
      setError('');
      try {
        const history = await getChatHistory(tripId);
        setMessages(history);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
        setError("خطا در بارگذاری تاریخچه پیام‌ها.");
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [tripId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && socket.connected) {
      socket.emit('newChatMessage', {
        tripId: tripId,
        messageText: newMessage.trim(),
      });
      setNewMessage('');
    } else {
      // Handle case where socket is not connected
      setError("اتصال با سرور برقرار نیست. لطفاً صفحه را رفرش کنید.");
    }
  };

  const getSenderName = (message) => {
    if (message.sender_id === user?.id) return "شما";
    return `${message.sender.first_name || ''} ${message.sender.last_name || `کاربر ${message.sender_id}`}`.trim();
  };


  return (
    <div className="flex flex-col h-[500px] border rounded-lg shadow-md bg-white">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">چت سفر</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-full"><Spinner /></div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">هنوز پیامی ارسال نشده است.</div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                    msg.sender_id === user?.id
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-xs font-semibold mb-1 opacity-80">{getSenderName(msg)}</p>
                  <p className="text-sm">{msg.message_text}</p>
                  <p className="text-right text-xs mt-1 opacity-60">
                    {new Date(msg.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="پیام خود را بنویسید..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            disabled={!socket || !socket.connected}
          />
          <Button type="submit" disabled={!newMessage.trim() || !socket || !socket.connected} className="px-4">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
