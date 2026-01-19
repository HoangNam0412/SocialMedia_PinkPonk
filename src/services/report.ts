import axios from 'axios';
import authService from './auth';
import { PostResponse } from './post';
import { UserPublicResponse } from './user';

const API_URL = import.meta.env.VITE_API_URL;

export interface ReportRequest {
  id?: number;
  userId: number;
  reportedUserId?: number;
  reportedPostId?: number;
  reason: string;
}

export interface ReportResponse {
  id: number;
  userId: number;
  reportedUserId?: number;
  reportedPostId?: number;
  reason: string;
  status: string;
  createdAt: string;
  reporterId?: string | number;
  reportedUser?: UserPublicResponse;
  reportedPost?: PostResponse;
}

const reportService = {
  // Create a new report
  createReport: async (reportData: ReportRequest): Promise<ReportResponse> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post<ReportResponse>(
      `${API_URL}/reports`,
      reportData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Get all reports (optionally filtered by status)
  getReports: async (status?: string): Promise<ReportResponse[]> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = status 
      ? `${API_URL}/reports?status=${status}`
      : `${API_URL}/reports`;

    const response = await axios.get<ReportResponse[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Update report status
  updateReportStatus: async (id: number, status: string): Promise<ReportResponse> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.put<ReportResponse>(
      `${API_URL}/reports/${id}/status?status=${status}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};

export default reportService; 