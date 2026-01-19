import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import messageService, { MessageRequest } from '../../services/message';
import { FriendResponse } from '../../services/user';
import Avatar from '../atoms/Avatar';

interface NewMessageComponentProps {
  friend: FriendResponse;
  onClose: () => void;
}

const NewMessageComponent: React.FC<NewMessageComponentProps> = ({ friend, onClose }) => {
  const { user } = useAuth();
  const { sendMessage: sendWebSocketMessage } = useWebSocket();
  const [chatMessage, setChatMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const chatPopupRef = useRef<HTMLDivElement>(null);

  // Auto-close after showing success message
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (success) {
      timeoutId = setTimeout(() => {
        onClose();
      }, 1500); // Close after 1.5 seconds
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [success, onClose]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatMessage.trim() || !user?.id) return;
    
    setSending(true);
    setError(null);
    
    try {
      const messageRequest: MessageRequest = {
        senderId: Number(user.id),
        receiverId: friend.id,
        content: chatMessage,
      };

      // Try to send via WebSocket first
      try {
        if (sendWebSocketMessage) {
          await sendWebSocketMessage('/app/sendMessage', {
            ...messageRequest,
            timestamp: new Date().toISOString()
          });
        } else {
          // Fall back to REST API if WebSocket is not available
          throw new Error('WebSocket not available');
        }
      } catch (wsError) {
        console.log('WebSocket send failed, falling back to REST API');
        // Send message using REST API
        await messageService.sendMessage(messageRequest);
      }
      
      // Clear input and show success
      setChatMessage('');
      setSuccess(true);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-[9999]">
      <div 
        ref={chatPopupRef}
        className="w-96 rounded-lg border border-pink-400 bg-white shadow-lg dark:bg-gray-800"
      >
        <div className="flex items-center justify-between bg-pink-500 p-3 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Avatar 
              src={friend?.avatarUrl || ''} 
              alt={friend?.fullName || 'Friend'} 
              size="sm" 
            />
            <p className="text-sm font-medium text-white">
              {friend?.fullName}
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              className="text-white hover:text-pink-200"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div className="flex h-80 flex-col justify-between">
          {success ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="rounded-md bg-green-100 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-center">
                <div className="mb-2 flex justify-center">
                  <i className="fas fa-check-circle text-3xl"></i>
                </div>
                <p>Tin nhắn đã được gửi thành công!</p>
                <p className="text-xs mt-2">Đang đóng...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-3">
                {/* Empty chat for now */}
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <i className="fas fa-comment-dots text-2xl mb-2"></i>
                  <p className="text-xs">Gửi tin nhắn mới tới {friend?.fullName}</p>
                  {error && (
                    <p className="mt-2 text-xs text-red-500">{error}</p>
                  )}
                </div>
              </div>
              
              <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3">
                <div className="flex rounded-full bg-gray-100 dark:bg-gray-700">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Aa..."
                    className="w-full bg-transparent py-2 px-4 outline-none text-sm"
                    autoFocus
                    disabled={sending}
                  />
                  <button 
                    type="submit"
                    className="px-4 text-pink-500"
                    disabled={!chatMessage.trim() || sending}
                  >
                    {sending ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewMessageComponent; 