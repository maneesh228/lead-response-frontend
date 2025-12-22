import React, { createContext, useContext, useState, useEffect } from 'react';
import socketService from './services/socketService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    console.log('NotificationContext: Setting up socket listeners');

    // Connect to socket
    socketService.connect(token);

    // Listen for new Facebook messages
    const handleFacebookMessage = (data) => {
      console.log('NotificationContext: New Facebook message received:', data);
      const notification = {
        id: `notif_${Date.now()}_${Math.random()}`,
        channel: 'Facebook',
        message: typeof data.message === 'string' ? data.message : (data.message?.text || data.message?.message || ''),
        leadName: data.lead?.name || 'Unknown',
        timestamp: new Date().toISOString()
      };
      console.log('NotificationContext: Adding notification:', notification);
      setNotifications(prev => {
        const updated = [...prev, notification];
        console.log('NotificationContext: Total notifications:', updated.length);
        return updated;
      });
    };

    // Listen for new Instagram messages
    const handleInstagramMessage = (data) => {
      console.log('NotificationContext: New Instagram message received:', data);
      const notification = {
        id: `notif_${Date.now()}_${Math.random()}`,
        channel: 'Instagram',
        message: typeof data.message === 'string' ? data.message : (data.message?.text || data.message?.message || ''),
        leadName: data.lead?.name || 'Unknown',
        timestamp: new Date().toISOString()
      };
      console.log('NotificationContext: Adding notification:', notification);
      setNotifications(prev => {
        const updated = [...prev, notification];
        console.log('NotificationContext: Total notifications:', updated.length);
        return updated;
      });
    };

    socketService.onFacebookMessage(handleFacebookMessage);
    socketService.onInstagramMessage(handleInstagramMessage);

    console.log('NotificationContext: Socket listeners registered');

    // Cleanup on unmount
    return () => {
      console.log('NotificationContext: Cleaning up socket listeners');
      socketService.off('facebook:new_message');
      socketService.off('instagram:new_message');
    };
  }, [token]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const value = {
    notifications,
    clearNotifications,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
