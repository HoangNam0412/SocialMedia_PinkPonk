import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebSocketMessage } from '../services/websocket';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';

interface NotificationContextType {
  unreadMessages: number;
  increaseUnreadMessages: () => void;
  resetUnreadMessages: () => void;
  isMessageEditorOpen: boolean;
  setMessageEditorOpen: (isOpen: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [isMessageEditorOpen, setIsMessageEditorOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const { subscribe, unsubscribe } = useWebSocket();

  // Setup websocket subscription for user's messages
  useEffect(() => {
    if (!user?.id) return;
    
    // Topic for user's personal messages
    const topic = `/topic/messages/user/${user.id}`;
    
    // Handle incoming message notifications
    const handleMessage = (message: WebSocketMessage) => {
      // Only increase unread count if:
      // 1. The message is not from the current user
      // 2. The message editor is not currently open
      if (message.senderId !== user.id && !isMessageEditorOpen) {
        increaseUnreadMessages();
      }
    };
    
    // Subscribe to topic
    subscribe(topic, handleMessage);
    
    return () => {
      unsubscribe(topic);
    };
  }, [user, subscribe, unsubscribe, isMessageEditorOpen]);

  const increaseUnreadMessages = () => {
    setUnreadMessages(prev => prev + 1);
  };

  const resetUnreadMessages = () => {
    setUnreadMessages(0);
  };
  
  const setMessageEditorOpen = (isOpen: boolean) => {
    setIsMessageEditorOpen(isOpen);
    // Reset notifications when opening the editor
    if (isOpen) {
      resetUnreadMessages();
    }
  };

  const value = {
    unreadMessages,
    increaseUnreadMessages,
    resetUnreadMessages,
    isMessageEditorOpen,
    setMessageEditorOpen
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 