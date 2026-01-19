import { apiClient } from './auth';
const API_URL = import.meta.env.VITE_API_URL;

const mediaService = {
  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append('files', file);
    const response = await apiClient.post('/upload/images', formData);
    return response.data;
  },
};

export default mediaService;
