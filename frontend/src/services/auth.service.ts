import { apiPost, apiGet, apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { AuthResponse, ApiResponse, User, LoginPayload, RegisterPayload } from '../types';

class AuthService {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiPost<AuthResponse>(ENDPOINTS.AUTH.LOGIN, payload);
    if (!response.data) throw new Error('Login failed');
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    return response.data;
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiPost<AuthResponse>(ENDPOINTS.AUTH.REGISTER, payload);
    if (!response.data) throw new Error('Registration failed');
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await apiGet<User>(ENDPOINTS.AUTH.PROFILE);
    if (!response.data) throw new Error('Failed to fetch profile');
    return response.data;
  }

  async getUsers(page = 1, limit = 20): Promise<ApiResponse<User[]>> {
    return apiGet<User[]>(ENDPOINTS.AUTH.USERS, { page, limit });
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  }

  getStoredUser(): { id: string; name: string; email: string; role: string } | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

export const authService = new AuthService();
