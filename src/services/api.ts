/**
 * Base API Service
 * Handles HTTP communication with backend
 * Maps from various Struts Actions to REST endpoints
 */
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:9090';

interface ApiError {
  status: number;
  message: string;
  data?: any;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  /**
   * Build headers with authentication
   */
  private getHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Handle API errors
   */
  private handleError(response: Response, data?: any): ApiError {
    const error: ApiError = {
      status: response.status,
      message: `HTTP ${response.status}: ${response.statusText}`,
      data,
    };
    console.error('API Error:', error);
    return error;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      let url = `${this.baseUrl}${endpoint}`;
      if (params) {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query.append(key, value.toString());
          }
        });
        const queryString = query.toString();
        if (queryString) {
          url += (url.includes('?') ? '&' : '?') + queryString;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw this.handleError(response, data);
      }
      const json = await response.json();
      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        return json.data as T;
      }
      return json as T;
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        throw this.handleError(response, responseData);
      }
      const json = await response.json();
      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        return json.data as T;
      }
      return json as T;
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        throw this.handleError(response, responseData);
      }
      const json = await response.json();
      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        return json.data as T;
      }
      return json as T;
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw this.handleError(response, data);
      }
      const json = await response.json();
      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        return json.data as T;
      }
      return json as T;
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export const apiClient = apiService;
export type { ApiError };
