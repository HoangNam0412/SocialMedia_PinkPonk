import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface ILoginCredentials {
  email: string;
  password: string;
}
export interface IResetPasswordData {
  resetToken: string;
  password: string;
  confirmPassword: string;
}
export interface IRegisterData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

export interface IAuthResponse {
  accessToken: string;
  expiresIn: number;
  user: IUserResponse;
}

export interface IUserResponse {
  id: number;
  email: string;
  fullName: string;
  username: string;
  phoneNumber?: string;
  avatarUrl?: string;
  coverPhoto?: string;
  bio?: string;
  age?: number;
  location?: string;
  role?: string;
  createdAt?: string;
  status?: string;
}

// Create a custom event for token expiration
export const TOKEN_EXPIRED_EVENT = 'auth:token_expired';

// Function to trigger token expiration event
const triggerTokenExpiredEvent = () => {
  const event = new CustomEvent(TOKEN_EXPIRED_EVENT);
  window.dispatchEvent(event);
};

// Function to check if token is expired
const isTokenExpired = (): boolean => {
  const loginTime = localStorage.getItem('loginTime');
  const expiresIn = localStorage.getItem('expiresIn');
  
  if (!loginTime || !expiresIn) return false;
  
  const elapsedTime = Date.now() - parseInt(loginTime);
  return elapsedTime > parseInt(expiresIn);
};

// Function to handle token expiration
const handleTokenExpiration = () => {
  console.log('Token expired, logging out...');
  authService.logout();
  triggerTokenExpiredEvent();
  window.location.href = '/login?expired=true';
};

// Set up axios interceptors for token handling
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Create axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_URL
});

// Request interceptor - add token to all requests
axiosInstance.interceptors.request.use(
  config => {
    const token = authService.getToken();
    if (token) {
      // Check if token is expired before making any request
      if (isTokenExpired()) {
        // Token is expired, trigger logout
        setTimeout(() => handleTokenExpiration(), 0);
        // We need to throw a regular Error, not reject a Promise
        throw new Error('Auth token has expired');
      }
      
      // Ensure headers object exists
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, add this request to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Handle unauthorized by logging out and redirecting
      handleTokenExpiration();
      
      // Process any queued requests
      processQueue(new Error('Auth token expired'));
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

const authService = {
  login: async (credentials: ILoginCredentials) => {
    const response = await axiosInstance.post<IAuthResponse>(
      `/auth/login`,
      credentials,
    );
    
    // Store login time and expiration duration
    if (response.data.expiresIn) {
      localStorage.setItem('loginTime', Date.now().toString());
      localStorage.setItem('expiresIn', response.data.expiresIn.toString());
    }
    
    return response.data;
  },

  register: async (data: IRegisterData) => {
    const response = await axiosInstance.post<IAuthResponse>(
      `/auth/register`,
      data,
    );
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post<IAuthResponse>(
      `/auth/forgot-password?email=${email}`,
    );
    return response.data;
  },
  
  resetPassword: async (data: IResetPasswordData) => {
    const response = await axiosInstance.post<IAuthResponse>(
      `/auth/reset-password`,
      data,
    );
    return response.data;
  },

  getCurrentUser(): IAuthResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired
    if (isTokenExpired()) {
      this.logout();
      return false;
    }
    
    return true;
  },
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('expiresIn');
    // Additional cleanup if needed
  },
  
  // Check if token is about to expire (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const loginTime = localStorage.getItem('loginTime');
    const expiresIn = localStorage.getItem('expiresIn');
    
    if (!loginTime || !expiresIn) return false;
    
    const elapsedTime = Date.now() - parseInt(loginTime);
    const timeToExpire = parseInt(expiresIn) - elapsedTime;
    
    // If less than 5 minutes (300000 ms) remaining
    return timeToExpire < 300000 && timeToExpire > 0;
  },
};

// Export the axios instance to be used in other services
export const apiClient = axiosInstance;

export default authService;
