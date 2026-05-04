/**
 * Monitor Service
 * Maps from: Java Source/br/smat/web/monitor/MonitorAction.java
 */
import { apiService } from '../../api';
import * as Models from '../../../types/models';

export class MonitorService {
  private readonly BASE_URL = '/api/monitor';

  async getDashboardData(): Promise<any> {
    try {
      return await apiService.get(`${this.BASE_URL}/dashboard`);
    } catch (error) {
      throw new Error(`Failed to get dashboard data: ${error}`);
    }
  }
  async getStatistics(period: string = 'month'): Promise<any> {
    try {
      return await apiService.get(`${this.BASE_URL}/statistics?period=${period}`);
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error}`);
    }
  }
  async getRecentAcidentes(limit: number = 10): Promise<Models.Acidente[]> {
    try {
      return await apiService.get<Models.Acidente[]>(`${this.BASE_URL}/recent-accidents?limit=${limit}`);
    } catch (error) {
      throw new Error(`Failed to get recent accidents: ${error}`);
    }
  }
  async getPendingInspections(): Promise<Models.Fiscalizacao[]> {
    try {
      return await apiService.get<Models.Fiscalizacao[]>(`${this.BASE_URL}/pending-inspections`);
    } catch (error) {
      throw new Error(`Failed to get pending inspections: ${error}`);
    }
  }
  async getAlerts(): Promise<any[]> {
    try {
      return await apiService.get<any[]>(`${this.BASE_URL}/alerts`);
    } catch (error) {
      throw new Error(`Failed to get alerts: ${error}`);
    }
  }

  // Monitor CRUD (from DomainServices)
  async listMonitores(): Promise<Models.Monitor[]> {
    try {
      return await apiService.get<Models.Monitor[]>(`${this.BASE_URL}/list`);
    } catch (error) {
      throw new Error(`Failed to list monitors: ${error}`);
    }
  }
  async getMonitores(): Promise<Models.Monitor[]> {
    return this.listMonitores();
  }
  async createMonitor(data: Partial<Models.Monitor>): Promise<Models.Monitor> {
    try {
      return await apiService.post<Models.Monitor>(`${this.BASE_URL}/create`, data);
    } catch (error) {
      throw new Error(`Failed to create monitor: ${error}`);
    }
  }
  async updateMonitor(id: string | number, data: Partial<Models.Monitor>): Promise<Models.Monitor> {
    try {
      return await apiService.put<Models.Monitor>(`${this.BASE_URL}/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update monitor: ${error}`);
    }
  }
  async deleteMonitor(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete monitor: ${error}`);
    }
  }

  // Field management
  async getCampos(): Promise<any[]> {
    try {
      return await apiService.get<any[]>(`${this.BASE_URL}/campos`);
    } catch (error) {
      throw new Error(`Failed to get fields: ${error}`);
    }
  }
  async getQueryCampos(campoId: string | number): Promise<any[]> {
    try {
      return await apiService.get<any[]>(`${this.BASE_URL}/querycampos?campo=${campoId}`);
    } catch (error) {
      throw new Error(`Failed to get query fields: ${error}`);
    }
  }
}

export const monitorService = new MonitorService();
export default monitorService;
