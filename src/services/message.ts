import axios from 'axios';
import authService from './auth';

const API_URL = import.meta.env.VITE_API_URL;

// Message request interface
export interface MessageRequest {
  senderId: number;
  receiverId: number;
  content: string;
  conversationId?: number;
}

// Message response interface updated to match the backend DTO
export interface MessageResponse {
  id: number;
  senderId: number;
  content: string;
  mediaUrls: string[];
}

const messageService = {
  // Send a message
  sendMessage: async (request: MessageRequest): Promise<MessageResponse> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post<MessageResponse>(
      `${API_URL}/messages`,
      request,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Get messages between two users
  getMessagesBetweenUsers: async (user1Id: number, user2Id: number): Promise<MessageResponse[]> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<MessageResponse[]>(
      `${API_URL}/messages/between`,
      {
        params: { user1Id, user2Id },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Get messages by conversation ID
  getMessagesByConversation: async (conversationId: number): Promise<MessageResponse[]> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<MessageResponse[]>(
      `${API_URL}/messages/conversation/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId: number): Promise<string> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.delete<string>(
      `${API_URL}/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};

export default messageService; 