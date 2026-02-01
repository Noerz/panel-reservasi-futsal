import axiosInstance from '@/lib/axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    id: string;
    name: string;
    role: string;
    access_token: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

class AuthService {
  /**
   * Login user
   * @param credentials - User email and password
   * @returns Login response with user data and token
   */
  
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(
      '/admin/auth/login',
      credentials
    );
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/admin/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await axiosInstance.get<{ data: User }>('/admin/auth/profile');
    return response.data.data;
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<{ token: string }> {
    const response = await axiosInstance.post<{ data: { token: string } }>(
      '/admin/auth/refresh'
    );
    return response.data.data;
  }
}

export const authService = new AuthService();
