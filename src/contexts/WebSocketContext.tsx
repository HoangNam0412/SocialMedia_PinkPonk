import React, { createContext, useContext, useEffect, useState } from 'react';
import webSocketService, { WebSocketMessage } from '../services/websocket';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  connected: boolean;
  supported: boolean;
  connect: () => void;
  disconnect: () => void;
  subscribe: (topic: string, callback: (message: WebSocketMessage) => void) => void;
  unsubscribe: (topic: string) => void;
  sendMessage: (destination: string, message: WebSocketMessage) => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [supported, setSupported] = useState(true);
  const [connectionAttempted, setConnectionAttempted] = useState(false);

  // Kiểm tra xem WebSockets có được hỗ trợ trong trình duyệt này không
  useEffect(() => {
    // Basic feature detection
    if (typeof WebSocket === 'undefined') {
      console.warn('WebSockets are not supported in this browser');
      setSupported(false);
    }
  }, []);

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && supported && !connectionAttempted) {
      setConnectionAttempted(true);
      connect();
      
      // Update connected status when WebSocket connects/disconnects
      webSocketService.onConnect(() => {
        setConnected(true);
        
        // Subscribe to personal messages topic for notifications
        if (user.id) {
          const personalTopic = `/topic/messages/user/${user.id}`;
          webSocketService.subscribeToTopic(personalTopic, () => {
            // Message handling is done in the NotificationContext
            console.log("Received message in user's personal topic");
          });
        }
      });
      
      webSocketService.onError((error) => {
        console.error('WebSocket error from context:', error);
        setConnected(false);
        
        // If we get specific errors about compatibility, mark as unsupported
        if (error.includes('compatibility') || error.includes('initialization failed')) {
          console.warn('WebSockets appear to be unsupported in this environment');
          setSupported(false);
        }
      });
    } else if (!isAuthenticated || !user) {
      disconnect();
      setConnectionAttempted(false);
    }
    
    return () => {
      // Disconnect when component unmounts
      disconnect();
    };
  }, [isAuthenticated, user, supported]);

  const connect = () => {
    if (supported) {
      webSocketService.connect();
    } else {
      console.warn('Attempted to connect WebSocket, but it is not supported in this environment');
    }
  };

  const disconnect = () => {
    webSocketService.disconnect();
    setConnected(false);
  };

  const subscribe = (topic: string, callback: (message: WebSocketMessage) => void) => {
    if (supported) {
      webSocketService.subscribeToTopic(topic, callback);
    }
  };

  const unsubscribe = (topic: string) => {
    if (supported) {
      webSocketService.unsubscribe(topic);
    }
  };

  const sendMessage = (destination: string, message: WebSocketMessage) => {

    if (supported && connected) {
      return webSocketService.sendMessage(destination, message);
    }
    return Promise.reject('WebSocket is not supported or connected');
  };

  const value: WebSocketContextType = {
    connected,
    supported,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketProvider; 