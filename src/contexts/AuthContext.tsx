import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService, { ILoginCredentials, IUserResponse, TOKEN_EXPIRED_EVENT } from '../services/auth';
import userService from '../services/user';

interface AuthContextType {
  user: IUserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<IUserResponse | null>>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Khoảng thời gian kiểm tra mã thông báo (kiểm tra sau mỗi 60 giây)
const TOKEN_CHECK_INTERVAL = 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Ghi nhớ hàm đăng xuất để tránh phải tạo lại nó ở mỗi lần kết xuất
  const logout = useCallback(() => {
    removeAuthData();
    // Điều hướng đến trang đăng nhập nếu chúng ta chưa ở đó
    if (location.pathname !== '/login') {
      navigate('/login');
    }
  }, [navigate, location.pathname]);

  // Chức năng xóa dữ liệu xác thực
  const removeAuthData = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('expiresIn');
    setToken(null);
    setUser(null);
  }, []);

  // Chức năng kiểm tra thời hạn hết hạn của mã thông báo và đăng xuất nếu cần thiết
  const checkTokenExpiration = useCallback(() => {
    const loginTime = localStorage.getItem('loginTime');
    const expiresIn = localStorage.getItem('expiresIn');
    const currentToken = localStorage.getItem('token');
    
    // Nếu mã thông báo tồn tại và đã hết hạn, hãy đăng xuất
    if (currentToken && loginTime && expiresIn) {
      const elapsedTime = Date.now() - parseInt(loginTime);
      if (elapsedTime > parseInt(expiresIn)) {
        console.log('Token expired, logging out...');
        logout();
        navigate('/login?expired=true', { replace: true });
        return true;
      }
    }
    return false;
  }, [logout, navigate]);

  // Check for expired token query param
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('expired') === 'true' && location.pathname === '/login') {
      // Show expired session message
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      // Clean URL
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  // Initial token check on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      // Check if token is expired
      const isExpired = checkTokenExpiration();
      
      // If not expired, set the user and token
      if (!isExpired) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    }

    setLoading(false);
  }, [checkTokenExpiration]);

  // Set up periodic token check
  useEffect(() => {
    // Only run this if we're authenticated
    if (!token) return;
    
    console.log('Setting up token expiration checker');
    
    // Check token expiration periodically
    const intervalId = setInterval(() => {
      checkTokenExpiration();
    }, TOKEN_CHECK_INTERVAL);
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [token, checkTokenExpiration]);

  // Listen for token expiration events from auth service
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Received token expired event');
      removeAuthData();
      navigate('/login?expired=true', { replace: true });
    };

    // Add event listener
    window.addEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired);

    // Clean up
    return () => {
      window.removeEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired);
    };
  }, [navigate, removeAuthData]);

  const setAuthData = (token: string, user: IUserResponse, expiresIn?: number) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set login time and expiration if provided
    if (expiresIn) {
      localStorage.setItem('loginTime', Date.now().toString());
      localStorage.setItem('expiresIn', expiresIn.toString());
    }
    
    setToken(token);
    setUser(user);
  };

  const login = async (credentials: ILoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      if (!response) throw new Error('Login failed');
      setAuthData(response.accessToken, response.user, response.expiresIn);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authService.register(data);
      if (!response) throw new Error('Registration failed');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  };

  const convertToIUserResponse = (user: any): IUserResponse => ({
    id: user.id.toString(),
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    coverPhoto: user.coverPhoto,
    bio: user.bio,
    age: user.age,
    location: user.location,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  });
  
  const refreshUser = async () => {
    try {
      // Check if token is expired before attempting to refresh
      if (checkTokenExpiration()) return;
      
      const updatedUser = await userService.getCurrentUserProfile();
      setUser(convertToIUserResponse(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      console.error('Failed to refresh user info:', error);
      // If we get a 401, logout
      if (error.response?.status === 401) {
        logout();
        navigate('/login?expired=true', { replace: true });
      }
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, login, register, logout, setUser, refreshUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
