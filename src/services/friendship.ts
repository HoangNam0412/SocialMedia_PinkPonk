import axios from 'axios';
import authService from './auth';

const API_URL = import.meta.env.VITE_API_URL;

export interface FriendshipResponse {
  id: number;
  status: string;
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    username: string;
    avatarUrl: string;
    bio: string;
  };
  friend: {
    id: number;
    fullName: string;
    username: string;
    avatarUrl: string;
    bio: string;
  };
}

const friendshipService = {
  // Send friend request
  sendFriendRequest: async (userId: number, friendId: number): Promise<string> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post<string>(
      `${API_URL}/friendships/send`, 
      null,
      {
        params: { userId, friendId },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Accept friend request
  acceptFriendRequest: async (friendshipId: number): Promise<string> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post<string>(
      `${API_URL}/friendships/accept/${friendshipId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Reject friend request
  rejectFriendRequest: async (friendshipId: number): Promise<string> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post<string>(
      `${API_URL}/friendships/reject/${friendshipId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Delete friend request
  deleteFriendRequest: async (friendshipId: number): Promise<string> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.delete<string>(
      `${API_URL}/friendships/delete/${friendshipId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Block friend
  blockFriend: async (userId: number, friendId: number): Promise<string> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post<string>(
      `${API_URL}/friendships/block`,
      null,
      {
        params: { userId, friendId },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Get pending friend requests
  getPendingRequests: async (userId: number): Promise<FriendshipResponse[]> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<FriendshipResponse[]>(
      `${API_URL}/friendships/pending/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },
};

export default friendshipService; 