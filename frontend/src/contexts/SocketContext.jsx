'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext'; // To get the JWT token
import Cookies from 'js-cookie';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only attempt to connect if the user is authenticated
    if (isAuthenticated) {
      const token = Cookies.get('authToken');
      const backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

      // Establish connection with auth token
      const newSocket = io(backendUrl, {
        auth: {
          token: token,
        },
        // Optional: reconnection attempts, etc.
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        // console.log('Socket connected:', newSocket.id);
        setSocket(newSocket);
      });

      newSocket.on('disconnect', (reason) => {
        // console.log('Socket disconnected:', reason);
        setSocket(null);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        // This might happen if token is invalid/expired
        // You might want to trigger a logout here if auth error
      });

      newSocket.on('errorMessage', (error) => {
        console.error('Received error from server:', error.message);
        // Handle server-sent errors, maybe show a toast
      });

      // Cleanup on component unmount or when auth state changes
      return () => {
        if (newSocket.connected) {
          console.log('Disconnecting socket...');
          newSocket.disconnect();
        }
        setSocket(null);
      };
    } else {
      // If user is not authenticated, ensure no socket connection exists
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Rerun effect when authentication state changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
