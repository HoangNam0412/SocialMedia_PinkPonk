import axios from 'axios';
import authService from './auth';

const API_URL = import.meta.env.VITE_API_URL;

export interface UserResponse {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  bio: string;
  coverPhoto: string;
  age: number;
  location: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface UserPublicResponse {
  id: number;
  fullName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  coverPhoto?: string;
  friendshipId?: number;
  friendshipStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REQUESTED' | 'NOT_FRIEND';
}

export interface UserRequest {
  id?: number;
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  bio?: string;
  avatarUrl?: string;
  coverPhoto?: string;
  age?: number;
  location?: string;
  role?: string;
  status?: string;
}

export interface FriendResponse {
  id: number;
  fullName: string;
  avatarUrl: string;
}

const userService = {
  // Get current user profile
  getCurrentUserProfile: async (): Promise<UserResponse> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const user = authService.getCurrentUser();
    console.log(user);
    
    if (!user || !user.id) {
      throw new Error('User information not found');
    }

    const response = await axios.get<UserResponse>(`${API_URL}/users/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Get user profile by ID
  getUserById: async (id: number): Promise<UserResponse | UserPublicResponse> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<UserResponse | UserPublicResponse>(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Get user public profile by ID (includes friendship status)
  getUserPublicById: async (id: number): Promise<UserPublicResponse> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<UserPublicResponse>(`${API_URL}/users/${id}/public`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Get user's friends
  getUserFriends: async (userId: number): Promise<FriendResponse[]> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<FriendResponse[]>(`${API_URL}/users/${userId}/friends`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Get all users (admin only)
  getAllUsers: async (): Promise<UserResponse[]> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<UserResponse[]>(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Get all users public data with friendship status
  getAllUsersPublic: async (keyword = ''): Promise<UserPublicResponse[]> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<UserPublicResponse[]>(`${API_URL}/users/public`, {
      params: { keyword },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (id: number, profileData: UserRequest): Promise<string> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.put<string>(`${API_URL}/users/${id}`, 
      { ...profileData, id },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Create new user (admin only)
  createUser: async (userData: UserRequest): Promise<string> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post<string>(`${API_URL}/users`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<string> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.delete<string>(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default userService; 