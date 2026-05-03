/**
 * Pesquisa Service
 * Maps from: Java Source/br/smat/web/pesquisaacidente/...Action.java
 * Maps from: Java Source/br/smat/web/pesquisaempregador/...Action.java
 */
import { apiService } from '../api';
export class PesquisaService {
  private readonly BASE_URL = '/api/pesquisa';
  // Pesquisa Acidente
  async searchAcidentes(filters: any): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      return await apiService.get(`${this.BASE_URL}/acidentes?${params}`);
    } catch (error) {
      throw new Error(`Failed to search accidents: ${error}`);
    }
  }
  async getResultadoPesquisaAcidente(acidenteId: string): Promise<any> {
    try {
      return await apiService.get(`${this.BASE_URL}/acidentes/${acidenteId}`);
    } catch (error) {
      throw new Error(`Failed to get accident search results: ${error}`);
    }
  }
  // Pesquisa Empregador
  async searchEmpregadores(filters: any): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      return await apiService.get(`${this.BASE_URL}/empregadores?${params}`);
    } catch (error) {
      throw new Error(`Failed to search employers: ${error}`);
    }
  }
}
export default PesquisaService;
export const pesquisaService = new PesquisaService();
