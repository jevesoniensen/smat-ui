/**
 * Relatorio Service
 * Maps from: Java Source/br/smat/web/relatorio/...Action.java
 * 
 * Handles report generation and management
 */
import { apiService } from '../../api';
import * as Models from '../../../types/models';

export class RelatorioService {
  private readonly BASE_URL = '/api/relatorios';

  async generateReport(parameters: any): Promise<any> {
    try {
      return await apiService.post(`${this.BASE_URL}/generate`, parameters);
    } catch (error) {
      throw new Error(`Failed to generate report: ${error}`);
    }
  }
  // Alias for backward compatibility
  async generateRelatorio(parameters: any): Promise<any> {
    return this.generateReport(parameters);
  }

  async saveReport(data: Models.RelatorioSalvo): Promise<Models.RelatorioSalvo> {
    try {
      return await apiService.post<Models.RelatorioSalvo>(`${this.BASE_URL}/save`, data);
    } catch (error) {
      throw new Error(`Failed to save report: ${error}`);
    }
  }
  // Alias for backward compatibility
  async saveRelatorio(data: any): Promise<any> {
    return this.saveReport(data);
  }

  async getReportParameters(): Promise<any> {
    try {
      return await apiService.get(`${this.BASE_URL}/parameters`);
    } catch (error) {
      throw new Error(`Failed to get report parameters: ${error}`);
    }
  }
  // Alias for backward compatibility
  async getRelatorioParametros(): Promise<any> {
    return this.getReportParameters();
  }

  async getSavedReports(): Promise<Models.RelatorioSalvo[]> {
    try {
      return await apiService.get<Models.RelatorioSalvo[]>(`${this.BASE_URL}/salvos`);
    } catch (error) {
      throw new Error(`Failed to get saved reports: ${error}`);
    }
  }
  // Alias for backward compatibility
  async getRelatoriosSalvos(): Promise<any[]> {
    return this.getSavedReports();
  }

  async getSavedReport(id: string | number): Promise<Models.RelatorioSalvo> {
    try {
      return await apiService.get<Models.RelatorioSalvo>(`${this.BASE_URL}/saved/${id}`);
    } catch (error) {
      throw new Error(`Failed to get saved report: ${error}`);
    }
  }

  async deleteSavedReport(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/saved/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete saved report: ${error}`);
    }
  }
  // Alias for backward compatibility
  async deleteRelatorioSalvo(id: string): Promise<void> {
    return this.deleteSavedReport(id);
  }

  async exportRelatorio(id: string | number, format: 'pdf' | 'excel'): Promise<Blob> {
    try {
      return await apiService.get(`${this.BASE_URL}/${id}/export?format=${format}`);
    } catch (error) {
      throw new Error(`Failed to export report: ${error}`);
    }
  }

  // Helpers for dropdowns and reference data (often used in reports)
  async getEstados(): Promise<Models.Estado[]> {
    try {
      return await apiService.get<Models.Estado[]>('/api/parametros/estados');
    } catch (error) {
      throw new Error(`Failed to get states: ${error}`);
    }
  }

  async getRegionaisByEstado(estadoId: string | number): Promise<Models.Regional[]> {
    try {
      return await apiService.get<Models.Regional[]>(`/api/parametros/regionais?estado=${estadoId}`);
    } catch (error) {
      throw new Error(`Failed to get regions: ${error}`);
    }
  }

  async getMunicipiosByEstado(estadoId: string | number): Promise<Models.Municipio[]> {
    try {
      return await apiService.get<Models.Municipio[]>(`/api/parametros/municipios?estadoId=${estadoId}`);
    } catch (error) {
      throw new Error(`Failed to get municipalities: ${error}`);
    }
  }
}

export const relatorioService = new RelatorioService();
export default relatorioService;
