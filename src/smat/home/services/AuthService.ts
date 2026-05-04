/**
 * Authentication Service
 * Maps from: LoginAction.java, LogOffAction.java
 * Handles user authentication and session management
 */
import { apiService } from '../../api';
import { Usuario, MenuItem, LoginResponse as ModelsLoginResponse } from '../../../types/models';

// Extend the LoginResponse from models.ts if needed, or use it directly
export interface LoginResponse extends ModelsLoginResponse {}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export class AuthService {
  /**
   * Login user with credentials
   * Maps from: LoginAction.perform()
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>('/api/auth/login', { login: username, senha: password });
      if (response.token) {
        apiService.setToken(response.token);
        localStorage.setItem('authToken', response.token); // Store token
        localStorage.setItem('usuario', JSON.stringify(response.usuario)); // Store user
        if (response.menu) {
          localStorage.setItem('menu', JSON.stringify(response.menu)); // Store menu
        }
      }
      return response;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Falha na autenticação. Verifique suas credenciais.');
    }
  }

  /**
   * Logout current user
   * Maps from: LogOffAction.perform()
   */
  async logout(): Promise<LogoutResponse> {
    try {
      await apiService.post<LogoutResponse>('/api/auth/logout', {});
    } catch (error) {
      console.error('Logout failed on backend:', error);
      // Continue to clear local session even if API call fails
    } finally {
      apiService.clearToken();
      localStorage.removeItem('usuario');
      localStorage.removeItem('menu');
      localStorage.removeItem('authToken');
    }
    return { success: true, message: 'Sessão encerrada' };
  }

  /**
   * Get current user from session via API
   */
  async getCurrentUser(): Promise<Usuario | null> {
    try {
      const response = await apiService.get<Usuario>('/api/auth/current-user');
      if (response) {
        localStorage.setItem('usuario', JSON.stringify(response));
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('usuario'); // Clear stale user data
      return null;
    }
  }

  /**
   * Get menu for current user via API
   */
  async getUserMenu(): Promise<MenuItem[] | null> {
    try {
      const response = await apiService.get<MenuItem[]>('/api/auth/menu');
      if (response) {
        localStorage.setItem('menu', JSON.stringify(response));
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user menu:', error);
      localStorage.removeItem('menu'); // Clear stale menu data
      return null;
    }
  }

  /**
   * Check if user is authenticated (based on token presence)
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export default AuthService;
export const authService = new AuthService();
