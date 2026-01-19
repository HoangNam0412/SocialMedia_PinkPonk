import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { AnimatePresence, motion } from "framer-motion";
import { Image, Send, Smile, Trash2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Avatar from "../../components/atoms/Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import mediaService from "../../services/media";
import messageService, { MessageResponse } from "../../services/message";
import { WebSocketMessage } from "../../services/websocket";

interface MessageEditorProps {
  onClose: () => void;
  chatName: string;
  conversationId?: number;
  receiverId?: number;
}

// Enhanced message interface for UI with timestamp
interface UIMessage extends MessageResponse {
  timestamp: string; // Add timestamp for UI
}

const MessageEditor: React.FC<MessageEditorProps> = ({ 
  onClose, 
  chatName, 
  conversationId, 
  receiverId 
}) => {
  const { user } = useAuth();
  const { subscribe, unsubscribe, sendMessage, connected, supported } = useWebSocket();
  const { increaseUnreadMessages, setMessageEditorOpen } = useNotification();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingWebSocket, setUsingWebSocket] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Check if WebSockets are available
  useEffect(() => {
    setUsingWebSocket(supported && connected);
  }, [supported, connected]);

  // Initialize WebSocket subscriptions if supported
  useEffect(() => {
    if (!supported || !connected || !user?.id) {
      console.log('WebSocket not ready for subscription');
      return;
    }
    
    console.log('Setting up WebSocket subscriptions');
    
    // Subscribe to messages
    const topics: string[] = [];
    
    if (conversationId) {
      // Subscribe to specific conversation topic
      topics.push(`/topic/messages/${conversationId}`);
    } else if (receiverId) {
      // Subscribe to direct messages between users
      topics.push(`/topic/messages/direct/${user.id}/${receiverId}`);
      topics.push(`/topic/messages/direct/${receiverId}/${user.id}`);
    }
    
    // Log subscription info
    console.log('Subscribing to topics:', topics);
    
    // Subscribe to all relevant topics
    topics.forEach(topic => {
      subscribe(topic, handleWebSocketMessage);
    });
    
    return () => {
      // Clean up subscriptions on unmount
      console.log('Cleaning up WebSocket subscriptions');
      topics.forEach(topic => {
        unsubscribe(topic);
      });
    };
  }, [user, conversationId, receiverId, subscribe, unsubscribe, supported, connected]);
  
  // Set message editor as open when component mounts
  useEffect(() => {
    setMessageEditorOpen(true);
    
    // Set message editor as closed when component unmounts
    return () => {
      setMessageEditorOpen(false);
    };
  }, [setMessageEditorOpen]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);
    
    // Check if this message is already in our list
    const exists = messages.some((msg) => {
      // Check by ID first if available
      if (message.id && msg.id === message.id) return true;
      
      // Then check by content, sender and approximate time
      return (msg.content === message.content && 
              msg.senderId === message.senderId && 
              (!message.timestamp || Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000));
    });
    
    if (!exists) {
      // Convert WebSocketMessage to UIMessage
      const uiMessage: UIMessage = {
        id: message.id || 0,
        senderId: message.senderId,
        content: message.content,
        mediaUrls: message.mediaUrls || [], // Support media URLs from WebSocket
        timestamp: message.timestamp || new Date().toISOString()
      };
      
      console.log('Adding new message to state:', uiMessage);
      setMessages((prevMessages) => [...prevMessages, uiMessage]);
      
      // No need to increase unread messages here since the editor is open
      // and the user is looking at the conversation
    }
  };

  // Fetch messages when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        let messagesData: MessageResponse[] = [];
        
        if (conversationId) {
          // If we have a conversation ID, fetch messages by conversation
          messagesData = await messageService.getMessagesByConversation(conversationId);
        } else if (receiverId) {
          // If we have a receiver ID, fetch messages between users
          messagesData = await messageService.getMessagesBetweenUsers(
            Number(user.id), 
            receiverId
          );
        }
        
        // Add timestamp to messages for UI (using current time as a fallback)
        const uiMessages: UIMessage[] = messagesData.map(msg => ({
          ...msg,
          timestamp: new Date().toISOString() // Use current time as fallback
        }));
        
        setMessages(uiMessages);
        setError(null);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Không thể tải tin nhắn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, conversationId, receiverId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle file selection for image uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Filter only image files
      const images = filesArray.filter(file => file.type.startsWith('image/'));
      
      if (images.length > 0) {
        setSelectedImages(prevImages => [...prevImages, ...images]);
        
        // Create temporary preview URLs
        images.forEach(image => {
          const url = URL.createObjectURL(image);
          setImageUrls(prev => [...prev, url]);
        });
      }
    }
  };

  // Handle removing image before sending
  const handleRemoveImage = (index: number) => {
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Open file browser
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Upload images and return URLs
  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];
    
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    
    try {
      // Upload each image
      for (const image of selectedImages) {
        const result = await mediaService.uploadMedia(image);
        if (Array.isArray(result)) {
          uploadedUrls.push(...result);
        } else if (typeof result === 'string') {
          uploadedUrls.push(result);
        }
      }
      
      // Clear temporary URLs and selected images
      imageUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImageUrls([]);
      
      return uploadedUrls;
    } catch (err) {
      console.error("Error uploading images:", err);
      throw new Error("Không thể tải lên hình ảnh.");
    } finally {
      setUploadingImages(false);
    }
  };

  const sendMessageHandler = async () => {
    
    if ((newMessage.trim() === "" && selectedImages.length === 0) || !user?.id || (!conversationId && !receiverId)) return;
  
    setSending(true);
    try {
      // First upload any images
      let mediaUrls: string[] = [];
      if (selectedImages.length > 0) {
        try {
          mediaUrls = await uploadImages();
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          setError("Không thể tải lên hình ảnh. Vui lòng thử lại sau.");
          setSending(false);
          return;
        }
      }

      const messageRequest = {
        senderId: Number(user.id),
        receiverId: receiverId ? receiverId : 0,
        content: newMessage,
        conversationId: conversationId,
        mediaUrls: mediaUrls,
        timestamp: new Date().toISOString()
      };
  
      if (usingWebSocket) {
        
        try {
          // Gửi bằng WebSocket, không cần thêm vào UI
          await sendMessage("/app/sendMessage", messageRequest);
          // UI sẽ nhận qua WebSocket callback
        } catch (wsError) {
          console.error("WebSocket send failed, falling back to REST:", wsError);
          const sentMessage = await messageService.sendMessage(messageRequest);
          const uiMessage: UIMessage = {
            ...sentMessage,
            timestamp: messageRequest.timestamp
          };
          setMessages((prevMessages) => [...prevMessages, uiMessage]);
        }
      } else {
        // Gửi qua REST nếu không có WebSocket
        const sentMessage = await messageService.sendMessage(messageRequest);
        const uiMessage: UIMessage = {
          ...sentMessage,
          timestamp: messageRequest.timestamp
        };
        setMessages((prevMessages) => [...prevMessages, uiMessage]);
      }
  
      setNewMessage("");
      setError(null);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
    } finally {
      setSending(false);
    }
  };
  

  // Handle message deletion
  const handleDeleteMessage = async (messageId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này không?")) {
      try {
        await messageService.deleteMessage(messageId);
        // Remove the message from local state
        setMessages(messages.filter(msg => msg.id !== messageId));
      } catch (err) {
        console.error("Error deleting message:", err);
        alert("Không thể xóa tin nhắn. Vui lòng thử lại sau.");
      }
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  // Format date for message groups
  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: {[key: string]: UIMessage[]} = {};
    
    messages.forEach(message => {
      const date = formatMessageDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups);
  };

  const messageGroups = groupMessagesByDate();

  // Add emoji picker outside click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle emoji picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const input = messageInputRef.current;
    
    if (input) {
      const startPos = input.selectionStart || 0;
      const endPos = input.selectionEnd || 0;
      
      // Construct the new message with the emoji inserted
      const newValue = 
        newMessage.substring(0, startPos) + 
        emoji + 
        newMessage.substring(endPos);
        
      setNewMessage(newValue);
      
      // Focus and set cursor position after the inserted emoji
      setTimeout(() => {
        if (input) {
          input.focus();
          const newCursorPos = startPos + emoji.length;
          input.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 10);
    } else {
      // If no selection/focus, simply append to the end
      setNewMessage(prevMessage => prevMessage + emoji);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className=" max-w-[500px] fixed bottom-4 right-4 h-[34rem] bg-gradient-to-br from-pink-100/90 to-pink-200/90 text-gray-900 shadow-2xl rounded-3xl border border-pink-300/40 z-50 flex flex-col overflow-hidden backdrop-blur-md"
      style={{
        boxShadow: "0 10px 25px -5px rgba(236, 72, 153, 0.3), 0 8px 10px -6px rgba(236, 72, 153, 0.2)"
      }}
    >
      {/* Header with glass morphism effect */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-300/80 to-pink-400/80 backdrop-filter backdrop-blur-md rounded-t-3xl border-b border-pink-300/30">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar 
              src={null}
              alt={chatName}
              size="md"
              className="border-2 border-pink-300/80 shadow-md"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white"></div>
          </div>
          <div>
            <span className="font-semibold text-lg text-pink-800">{chatName}</span>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
              <span className="text-xs text-pink-600">Đang hoạt động</span>
            </div>
          </div>
        </div>
        <motion.button 
          onClick={onClose} 
          className="text-pink-700 hover:text-pink-900 hover:bg-pink-200/50 p-2 rounded-full transition-colors"
          whileHover={{ rotate: 90, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <X size={20} />
        </motion.button>
      </div>

      {/* Message Area with subtle pattern background */}
      <div 
        className="flex-1 p-4 overflow-y-auto overflow-x-hidden space-y-4 bg-gradient-to-br from-pink-50/90 to-pink-100/90 backdrop-filter backdrop-blur-sm"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ec4899' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E')"
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-pink-500"></div>
              <p className="text-pink-500 mt-3 text-sm">Đang tải tin nhắn...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-6 mt-4 bg-pink-50/70 backdrop-blur-sm rounded-xl border border-pink-100 shadow-md">
            <div className="text-3xl mb-3">😕</div>
            <p className="font-medium text-pink-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 text-white bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg transform hover:translate-y-[-1px]"
            >
              Thử lại
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-pink-500 flex-col">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-lg font-medium mb-2">Hãy bắt đầu cuộc trò chuyện</p>
            <p className="text-sm text-pink-400">Tin nhắn của bạn sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <>
            {messageGroups.map(([date, groupMessages]) => (
              <div key={date} className="space-y-2">
                <div className="flex justify-center my-4">
                  <div className="bg-pink-200/70 px-4 py-1 rounded-full text-xs text-pink-700 font-medium shadow-sm backdrop-blur-sm">
                    {date}
                  </div>
                </div>
                
                {groupMessages.map((msg, index) => (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex group ${msg.senderId === Number(user?.id) ? "justify-end" : "justify-start"} mb-3`}
                  >
                    {msg.senderId !== Number(user?.id) && (
                      <div className="mr-2 flex-shrink-0 self-end mb-1">
                        <Avatar 
                          src={null}
                          alt="Sender"
                          size="sm"
                          className="border border-pink-200"
                        />
                      </div>
                    )}
                    <div className="flex flex-col max-w-[75%] overflow-hidden">
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm ${
                          msg.senderId === Number(user?.id) 
                            ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-md" 
                            : "bg-white/90 text-gray-800 shadow-sm border border-pink-100/50"
                        } group-hover:shadow-lg transition-all duration-200 relative`}
                        style={{
                          borderTopRightRadius: msg.senderId === Number(user?.id) ? (index === 0 || groupMessages[index-1].senderId !== msg.senderId ? '1rem' : '0.25rem') : '1rem',
                          borderTopLeftRadius: msg.senderId !== Number(user?.id) ? (index === 0 || groupMessages[index-1].senderId !== msg.senderId ? '1rem' : '0.25rem') : '1rem',
                          borderBottomRightRadius: msg.senderId === Number(user?.id) ? (index === groupMessages.length-1 || groupMessages[index+1]?.senderId !== msg.senderId ? '1rem' : '0.25rem') : '1rem',
                          borderBottomLeftRadius: msg.senderId !== Number(user?.id) ? (index === groupMessages.length-1 || groupMessages[index+1]?.senderId !== msg.senderId ? '1rem' : '0.25rem') : '1rem',
                        }}
                      >
                        {/* Message text content */}
                        {msg.content && (
                          <p className="mb-2 break-words leading-relaxed">{msg.content}</p>
                        )}
                        
                        {/* Media content if present */}
                        {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                          <div className={`mt-2 ${msg.mediaUrls.length > 1 ? 'grid grid-cols-2 gap-2' : ''} max-w-full`}>
                            {msg.mediaUrls.map((url, idx) => (
                              <div key={idx} className="relative overflow-hidden rounded-lg border border-white/20 shadow-sm hover:shadow-md transition-shadow">
                                <motion.img 
                                  src={url} 
                                  alt={`Media ${idx}`} 
                                  className="w-full h-auto object-cover hover:opacity-90 cursor-pointer"
                                  onClick={() => window.open(url, '_blank')}
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Delete button */}
                        {msg.senderId === Number(user?.id) && (
                          <motion.button 
                            initial={{ opacity: 0, x: 10 }}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="absolute opacity-0 group-hover:opacity-100 -right-8 top-1/2 transform -translate-y-1/2 text-pink-300 hover:text-pink-500 transition-all"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        )}
                      </div>
                      <span className={`text-xs text-pink-500/70 mt-1 px-2 ${
                        msg.senderId === Number(user?.id) ? "text-right" : "text-left"
                      }`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    {msg.senderId === Number(user?.id) && (
                      <div className="ml-2 flex-shrink-0 self-end mb-1">
                        <Avatar 
                          src={user?.avatarUrl || null}
                          alt="You"
                          size="sm"
                          className="border border-pink-200"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Image preview area with animated transition */}
      <AnimatePresence>
        {imageUrls.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3 border-t border-pink-300/30 bg-pink-100/80 backdrop-filter backdrop-blur-sm flex flex-wrap gap-2"
          >
            {imageUrls.map((url, index) => (
              <motion.div 
                key={index} 
                className="relative w-16 h-16 group"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <img 
                  src={url} 
                  alt={`Preview ${index}`} 
                  className="w-full h-full object-cover rounded-lg shadow-sm border border-pink-200"
                />
                <motion.button 
                  whileHover={{ scale: 1.2 }}
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X size={12} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area with glass morphism effect */}
      <div className="p-4 border-t border-pink-300/30 bg-gradient-to-r from-pink-200/80 to-pink-300/80 flex items-center space-x-3 rounded-b-3xl backdrop-filter backdrop-blur-sm">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          multiple 
          onChange={handleFileChange}
        />
        <motion.button 
          className="text-pink-600 hover:text-pink-800 bg-white/70 p-2.5 rounded-full hover:bg-white/90 transition-colors shadow-sm hover:shadow"
          onClick={handleImageClick}
          disabled={uploadingImages || sending}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Image size={20} />
        </motion.button>
        
        {/* Emoji Picker Button */}
        <div className="relative">
          <motion.button 
            className={`text-pink-600 hover:text-pink-800 bg-white/70 p-2.5 rounded-full hover:bg-white/90 transition-colors shadow-sm hover:shadow ${
              showEmojiPicker ? 'bg-pink-100 text-pink-500' : ''
            }`}
            onClick={toggleEmojiPicker}
            disabled={sending}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Smile size={20} />
          </motion.button>
          
          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-14 left-0 z-20 shadow-xl rounded-lg overflow-hidden"
            >
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    searchDisabled={false}
                    skinTonesDisabled
                    width={280}
                    height={400}
                    theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
        
        <div className="flex-1 bg-white/80 backdrop-filter backdrop-blur-sm text-gray-900 rounded-full px-4 py-0 shadow-sm border border-pink-200/50 flex items-center hover:shadow-md transition-shadow">
          <input
            ref={messageInputRef}
            type="text"
            className="w-full bg-transparent py-3 focus:outline-none text-sm"
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !sending && !uploadingImages && sendMessageHandler()}
            disabled={sending || uploadingImages}
          />
        </div>
        <motion.button 
          className={`bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white p-3 rounded-full shadow-md ${(sending || uploadingImages) ? 'opacity-70' : ''}`} 
          onClick={sendMessageHandler}
          disabled={sending || uploadingImages}
          whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(236, 72, 153, 0.4)" }}
          whileTap={{ scale: 0.95 }}
        >
          {sending || uploadingImages ? (
            <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
          ) : (
            <Send size={20} />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MessageEditor;
