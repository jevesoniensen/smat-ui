/**
 * Authentication Service
 * Maps from: LoginAction.java, LogOffAction.java
 * Handles user authentication and session management
 */
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../api';
import { SessionService } from '../../auth/services/SessionService';
import { Usuario, MenuItem, LoginResponse as ModelsLoginResponse } from '../../../types/models';

export interface LoginResponse extends ModelsLoginResponse {}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private sessionService = inject(SessionService);

  /**
   * Login user with credentials
   * Maps from: LoginAction.perform()
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.apiService.post<LoginResponse>('/api/auth/login', { login: username, senha: password });
      if (response.token) {
        this.apiService.setToken(response.token);
        localStorage.setItem('authToken', response.token);
        
        this.sessionService.setUsuario(response.usuario);
        if (response.menu) {
          this.sessionService.setMenu(response.menu);
        }
        
        // Backup to localStorage for page refreshes
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        if (response.menu) {
          localStorage.setItem('menu', JSON.stringify(response.menu));
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
      await this.apiService.post<LogoutResponse>('/api/auth/logout', {});
    } catch (error) {
      console.error('Logout failed on backend:', error);
    } finally {
      this.apiService.clearToken();
      this.sessionService.clearSession();
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
      const response = await this.apiService.get<Usuario>('/api/auth/current-user');
      if (response) {
        this.sessionService.setUsuario(response);
        localStorage.setItem('usuario', JSON.stringify(response));
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      this.sessionService.setUsuario(null);
      localStorage.removeItem('usuario');
      return null;
    }
  }

  /**
   * Get menu for current user via API
   */
  async getUserMenu(): Promise<MenuItem[] | null> {
    try {
      const response = await this.apiService.get<MenuItem[]>('/api/auth/menu');
      if (response) {
        this.sessionService.setMenu(response);
        localStorage.setItem('menu', JSON.stringify(response));
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user menu:', error);
      this.sessionService.setMenu(null);
      localStorage.removeItem('menu');
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
