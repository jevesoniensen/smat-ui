/**
 * Investigacao Service
 * Maps from: Java Source/br/smat/web/investigacao/...Action.java
 * 
 * Handles investigation and deposition management
 */
import { apiService } from '../api';
import * as Models from '../../types/models';

export class InvestigacaoService {
  private readonly BASE_URL = '/api/investigacoes';

  async createInvestigacao(data: Partial<Models.Investigacao>): Promise<Models.Investigacao> {
    try {
      return await apiService.post<Models.Investigacao>(`${this.BASE_URL}`, data);
    } catch (error) {
      throw new Error(`Failed to create investigation: ${error}`);
    }
  }
  async updateInvestigacao(id: string | number, data: Partial<Models.Investigacao>): Promise<Models.Investigacao> {
    try {
      return await apiService.put<Models.Investigacao>(`${this.BASE_URL}/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update investigation: ${error}`);
    }
  }
  async getInvestigacao(id: string | number): Promise<Models.Investigacao> {
    try {
      return await apiService.get<Models.Investigacao>(`${this.BASE_URL}/${id}`);
    } catch (error) {
      throw new Error(`Failed to get investigation: ${error}`);
    }
  }
  async listInvestigacoes(): Promise<Models.Investigacao[]> {
    try {
      return await apiService.get<Models.Investigacao[]>(`${this.BASE_URL}`);
    } catch (error) {
      throw new Error(`Failed to list investigations: ${error}`);
    }
  }
  async deleteInvestigacao(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete investigation: ${error}`);
    }
  }
  async finalizeInvestigacao(id: string | number): Promise<Models.Investigacao> {
    try {
      return await apiService.post<Models.Investigacao>(`${this.BASE_URL}/${id}/finalize`, {});
    } catch (error) {
      throw new Error(`Failed to finalize investigation: ${error}`);
    }
  }

  // Depoimentos
  async addDepoimento(investigacaoId: string | number, depoimento: Partial<Models.Depoimento>): Promise<Models.Depoimento> {
    try {
      return await apiService.post<Models.Depoimento>(
        `${this.BASE_URL}/${investigacaoId}/depoimentos`,
        depoimento
      );
    } catch (error) {
      throw new Error(`Failed to add deposition: ${error}`);
    }
  }
  async updateDepoimento(investigacaoId: string | number, depoimentoId: string | number, depoimento: Partial<Models.Depoimento>): Promise<Models.Depoimento> {
    try {
      return await apiService.put<Models.Depoimento>(
        `${this.BASE_URL}/${investigacaoId}/depoimentos/${depoimentoId}`,
        depoimento
      );
    } catch (error) {
      throw new Error(`Failed to update deposition: ${error}`);
    }
  }
  async deleteDepoimento(investigacaoId: string | number, depoimentoId: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/${investigacaoId}/depoimentos/${depoimentoId}`);
    } catch (error) {
      throw new Error(`Failed to delete deposition: ${error}`);
    }
  }
  async listDepoimentos(investigacaoId: string | number): Promise<Models.Depoimento[]> {
    try {
      return await apiService.get<Models.Depoimento[]>(
        `${this.BASE_URL}/${investigacaoId}/depoimentos`
      );
    } catch (error) {
      throw new Error(`Failed to list depositions: ${error}`);
    }
  }
  // Alias for DomainServices compatibility
  async getDepoimentos(investigacaoId: string | number): Promise<Models.Depoimento[]> {
    return this.listDepoimentos(investigacaoId);
  }

  // Medidas Corretivas
  async addMedidaCorretiva(investigacaoId: string | number, medida: Partial<Models.MedidaCorretivaInvestigacao>): Promise<Models.MedidaCorretivaInvestigacao> {
    try {
      return await apiService.post<Models.MedidaCorretivaInvestigacao>(
        `${this.BASE_URL}/${investigacaoId}/medidas`,
        medida
      );
    } catch (error) {
      throw new Error(`Failed to add corrective measure: ${error}`);
    }
  }
  async updateMedidaCorretiva(investigacaoId: string | number, medidaId: string | number, medida: Partial<Models.MedidaCorretivaInvestigacao>): Promise<Models.MedidaCorretivaInvestigacao> {
    try {
      return await apiService.put<Models.MedidaCorretivaInvestigacao>(
        `${this.BASE_URL}/${investigacaoId}/medidas/${medidaId}`,
        medida
      );
    } catch (error) {
      throw new Error(`Failed to update corrective measure: ${error}`);
    }
  }
  async deleteMedidaCorretiva(investigacaoId: string | number, medidaId: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/${investigacaoId}/medidas/${medidaId}`);
    } catch (error) {
      throw new Error(`Failed to delete corrective measure: ${error}`);
    }
  }
  async getMedidasCorretivas(investigacaoId: string | number): Promise<Models.MedidaCorretivaInvestigacao[]> {
    try {
      return await apiService.get<Models.MedidaCorretivaInvestigacao[]>(
        `${this.BASE_URL}/${investigacaoId}/medidas`
      );
    } catch (error) {
      throw new Error(`Failed to get corrective measures: ${error}`);
    }
  }

  // Legacy/Specific methods
  async getDetalhesinvestigacao(investigacaoId: string | number): Promise<Models.Investigacao> {
    return this.getInvestigacao(investigacaoId);
  }
  async addMedidaCausCorretivaInvestigacao(investigacaoId: string | number, medida: any): Promise<any> {
    return this.addMedidaCorretiva(investigacaoId, medida);
  }
}

export const investigacaoService = new InvestigacaoService();
export default investigacaoService;
