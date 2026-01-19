import axios from 'axios';
import authService from './auth';

const API_URL = import.meta.env.VITE_API_URL;

// Response interface matching the actual backend response
export interface ConversationResponse {
  id: number;
  receiverId: number;
  receiverName: string;
  receiverAvatar: string | null;
  lastMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

const conversationService = {
  // Get all conversations for a user
  getConversations: async (userId: number): Promise<ConversationResponse[]> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<ConversationResponse[]>(
      `${API_URL}/conversations/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Delete a conversation
  deleteConversation: async (conversationId: number): Promise<string> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.delete<string>(
      `${API_URL}/conversations/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};

export default conversationService; 