'use client';

import { useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-toastify';
import { Bell, MessageSquare, MapPin } from 'lucide-react'; // Icons for notifications

const NotificationHandler = () => {
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      // General purpose notification listener
      const handleGeneralNotification = ({ title = 'اعلان جدید', message, type = 'info' }) => {
        toast[type](
          <div className="flex items-start">
            <Bell size={20} className="ml-3" />
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm">{message}</p>
            </div>
          </div>
        );
      };

      // Specific listener for new chat messages to show a notification
      const handleChatMessageNotification = (messagePayload) => {
        // Avoid notifying the user about their own messages
        // This requires knowing the current user's ID, which we don't have here directly.
        // This logic is better handled in the component that knows the user context (e.g., ChatBox itself)
        // or by passing user ID here. For now, we'll notify for all.
        toast.info(
          <div className="flex items-start">
            <MessageSquare size={20} className="ml-3" />
            <div>
              <p className="font-semibold">پیام جدید از {`${messagePayload.sender.first_name || ''} ${messagePayload.sender.last_name || ''}`.trim()}</p>
              <p className="text-sm truncate">{messagePayload.message_text}</p>
            </div>
          </div>
        );
      };

      // Specific listener for trip status updates
      const handleTripStatusUpdate = ({ tripId, status, message }) => {
        toast.warn(
           <div className="flex items-start">
            <MapPin size={20} className="ml-3" />
            <div>
              <p className="font-semibold">بروزرسانی وضعیت سفر #{tripId}</p>
              <p className="text-sm">{message || `وضعیت سفر به "${status}" تغییر کرد.`}</p>
            </div>
          </div>
        );
      };


      socket.on('generalNotification', handleGeneralNotification);
      // We can also listen to 'newChatMessage' here to show a global notification,
      // but only if the user is not actively looking at the chat window.
      // socket.on('newChatMessage', handleChatMessageNotification);
      socket.on('tripStatusUpdate', handleTripStatusUpdate);


      // Cleanup
      return () => {
        socket.off('generalNotification', handleGeneralNotification);
        // socket.off('newChatMessage', handleChatMessageNotification);
        socket.off('tripStatusUpdate', handleTripStatusUpdate);
      };
    }
  }, [socket]);

  // This component does not render anything
  return null;
};

export default NotificationHandler;
