import axios from 'axios';
import { API_URL } from '../config';
import { UserPublicResponse } from './user';

export interface CreatePostRequest {
  userId: string;
  content: string;
  mediaUrls: string[];
  privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  status?: 'ACTIVE' | 'REPORTED' | 'HIDDEN';
}

export interface CommentResponse {
  id: number;
  content: string;
  userId: number;
  postId: number;
  createdAt: string;
  updatedAt: string;
  author: UserPublicResponse;
}

export interface PostResponse {
  id: number;
  author: UserPublicResponse;
  content: string;
  mediaUrls: string[];
  privacy: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  likedByUser: boolean;
  commentResponses: CommentResponse[];
  createdAt: string;
  updatedAt: string;
  originalPost: PostResponse | null;
  status?: 'ACTIVE' | 'REPORTED' | 'HIDDEN';
}

export interface SharePostRequest {
  originalPostId: number;
  content: string;
  mediaUrls?: string[];
  privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
}

const postService = {
  createPost: async (postData: CreatePostRequest): Promise<PostResponse> => {
    try {
      const response = await axios.post<PostResponse>(
        `${API_URL}/posts`,
        postData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  getPosts: async (): Promise<PostResponse[]> => {
    try {
      const response = await axios.get<PostResponse[]>(`${API_URL}/posts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  getUserPosts: async (userId: number): Promise<PostResponse[]> => {
    try {
      const response = await axios.get<PostResponse[]>(
        `${API_URL}/posts/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  updatePost: async (
    postId: number,
    postData: Partial<CreatePostRequest>,
  ): Promise<PostResponse> => {
    try {
      const response = await axios.put<PostResponse>(
        `${API_URL}/posts/${postId}`,
        postData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  updatePostStatus: async (
    postId: number, 
    status: 'ACTIVE' | 'REPORTED' | 'HIDDEN'
  ): Promise<PostResponse> => {
    try {
      const response = await axios.put<PostResponse>(
        `${API_URL}/posts/${postId}/status`,
        { status },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error updating post status:', error);
      throw error;
    }
  },

  deletePost: async (postId: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  sharePost: async (
    userId: number,
    data: SharePostRequest,
  ): Promise<PostResponse> => {
    try {
      const response = await axios.post<PostResponse>(
        `${API_URL}/posts/share`,
        {
          userId,
          ...data,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error('Error sharing post:', error);
      throw error;
    }
  },
};

export default postService;
