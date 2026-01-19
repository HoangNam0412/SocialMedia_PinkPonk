import axios from 'axios';
import { API_URL } from '../config';
import { UserPublicResponse } from './user';

export interface CommentRequest {
  postId: number;
  userId: number;
  content: string;
  parentCommentId?: number | null;
}

export interface CommentResponse {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  replies: CommentResponse[];
  author: UserPublicResponse;
  postId: number;
  parentCommentId?: number | null;
}

const commentService = {
  createComment: async (commentData: CommentRequest) => {
    try {
      const response = await axios.post<CommentResponse>(
        `${API_URL}/comments`,
        commentData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  updateComment: async (commentId: number, content: string) => {
    console.log("Content: ", content)
    try {
      const response = await axios.put<CommentResponse>(
        `${API_URL}/comments/${commentId}`,
        { content }, // gửi object JSON
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );      
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  deleteComment: async (commentId: number) => {
    try {
      const response = await axios.delete<CommentResponse>(
        `${API_URL}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
};

export default commentService; 