import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Routers from './routes/Router';

const App: React.FC = () => {
  return (
      <AuthProvider>
        <WebSocketProvider>
          <NotificationProvider>
            <Routers />
          </NotificationProvider>
        </WebSocketProvider>
      </AuthProvider>
  );
};

export default App;
