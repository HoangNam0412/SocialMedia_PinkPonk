import axios from 'axios';
import { API_URL } from '../config';

const reactionService = {
  toggleReaction: async (userId: number, postId: number): Promise<void> => {
    try {
      await axios.post(
        `${API_URL}/reactions`,
        { userId, postId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
    } catch (error) {
      console.error('Error toggling reaction:', error);
      throw error;
    }
  },
};

export default reactionService; 