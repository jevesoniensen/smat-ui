/**
 * Fiscalizacao Service
 * Maps from: Java Source/br/smat/web/fiscalizacao/...Action.java
 * 
 * Handles inspection/audit management
 */
import { apiService } from '../api';
import * as Models from '../../types/models';

export class FiscalizacaoService {
  private readonly BASE_URL = '/api/fiscalizacoes';

  async createFiscalizacao(data: Partial<Models.Fiscalizacao>): Promise<Models.Fiscalizacao> {
    try {
      return await apiService.post<Models.Fiscalizacao>(`${this.BASE_URL}`, data);
    } catch (error) {
      throw new Error(`Failed to create inspection: ${error}`);
    }
  }
  async updateFiscalizacao(id: string | number, data: Partial<Models.Fiscalizacao>): Promise<Models.Fiscalizacao> {
    try {
      return await apiService.put<Models.Fiscalizacao>(`${this.BASE_URL}/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update inspection: ${error}`);
    }
  }
  async getFiscalizacao(id: string | number): Promise<Models.Fiscalizacao> {
    try {
      return await apiService.get<Models.Fiscalizacao>(`${this.BASE_URL}/${id}`);
    } catch (error) {
      throw new Error(`Failed to get inspection: ${error}`);
    }
  }
  async listFiscalizacoes(): Promise<Models.Fiscalizacao[]> {
    try {
      return await apiService.get<Models.Fiscalizacao[]>(`${this.BASE_URL}`);
    } catch (error) {
      throw new Error(`Failed to list inspections: ${error}`);
    }
  }
  async deleteFiscalizacao(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete inspection: ${error}`);
    }
  }
  async finalizeFiscalizacao(id: string | number): Promise<Models.Fiscalizacao> {
    try {
      return await apiService.post<Models.Fiscalizacao>(`${this.BASE_URL}/${id}/finalize`, {});
    } catch (error) {
      throw new Error(`Failed to finalize inspection: ${error}`);
    }
  }

  // Roteiros
  async createRoteiro(data: Partial<Models.Roteiro>): Promise<Models.Roteiro> {
    try {
      return await apiService.post<Models.Roteiro>('/api/roteiros', data);
    } catch (error) {
      throw new Error(`Failed to create route: ${error}`);
    }
  }
  async getRoteiros(): Promise<Models.Roteiro[]> {
    try {
      return await apiService.get<Models.Roteiro[]>('/api/roteiros');
    } catch (error) {
      throw new Error(`Failed to get routes: ${error}`);
    }
  }

  // Tramites
  async listTramites(fiscalizacaoId: string | number): Promise<Models.TramiteFiscalizacao[]> {
    try {
      return await apiService.get<Models.TramiteFiscalizacao[]>(`${this.BASE_URL}/${fiscalizacaoId}/tramites`);
    } catch (error) {
      throw new Error(`Failed to list tramites: ${error}`);
    }
  }
  async getTramite(tramiteId: string | number): Promise<Models.TramiteFiscalizacao> {
    try {
      return await apiService.get<Models.TramiteFiscalizacao>(`/api/tramites/${tramiteId}`);
    } catch (error) {
      throw new Error(`Failed to get tramite: ${error}`);
    }
  }
  async createTramite(fiscalizacaoId: string | number): Promise<Models.TramiteFiscalizacao> {
    try {
      return await apiService.post<Models.TramiteFiscalizacao>(`${this.BASE_URL}/${fiscalizacaoId}/tramites`, {});
    } catch (error) {
      throw new Error(`Failed to create tramite: ${error}`);
    }
  }
  async updateTramiteStatus(tramiteId: string | number, statusId: string): Promise<Models.TramiteFiscalizacao> {
    try {
      return await apiService.put<Models.TramiteFiscalizacao>(`/api/tramites/${tramiteId}/status`, { statusId });
    } catch (error) {
      throw new Error(`Failed to update tramite status: ${error}`);
    }
  }
  async saveTramiteEvaluation(tramiteId: string | number, evaluations: any[]): Promise<any> {
    try {
      return await apiService.post(`/api/tramites/${tramiteId}/evaluate`, { evaluations });
    } catch (error) {
      throw new Error(`Failed to save tramite evaluation: ${error}`);
    }
  }

  // Tramite Items logic
  async addItemToTramite(tramiteId: string | number, itemId: string | number): Promise<any> {
    try {
      return await apiService.post(`/api/tramites/${tramiteId}/items`, { itemId });
    } catch (error) {
      throw new Error(`Failed to add item to tramite: ${error}`);
    }
  }
  async removeItemFromTramite(tramiteId: string | number, itemId: string | number): Promise<any> {
    try {
      await apiService.delete(`/api/tramites/${tramiteId}/items/${itemId}`);
    } catch (error) {
      throw new Error(`Failed to remove item from tramite: ${error}`);
    }
  }
  async getTramiteItems(tramiteId: string | number): Promise<Models.ItemFiscalizacao[]> {
    try {
      return await apiService.get<Models.ItemFiscalizacao[]>(`/api/tramites/${tramiteId}/items`);
    } catch (error) {
      throw new Error(`Failed to get tramite items: ${error}`);
    }
  }
  async getItemsByPonto(pontoId: string | number): Promise<Models.ItemFiscalizacao[]> {
    try {
      return await apiService.get<Models.ItemFiscalizacao[]>(`/api/parametros/itens-fiscalizacao?pontoId=${pontoId}`);
    } catch (error) {
      throw new Error(`Failed to get items by point: ${error}`);
    }
  }

  // Medidas Corretivas
  async addMedidaCorretiva(fiscalizacaoId: string | number, medida: Partial<Models.MedidaCorretivaFiscalizacao>): Promise<Models.MedidaCorretivaFiscalizacao> {
    try {
      return await apiService.post<Models.MedidaCorretivaFiscalizacao>(
        `${this.BASE_URL}/${fiscalizacaoId}/medidas`,
        medida
      );
    } catch (error) {
      throw new Error(`Failed to add corrective measure: ${error}`);
    }
  }
  async updateMedidaCorretiva(fiscalizacaoId: string | number, medidaId: string | number, medida: Partial<Models.MedidaCorretivaFiscalizacao>): Promise<Models.MedidaCorretivaFiscalizacao> {
    try {
      return await apiService.put<Models.MedidaCorretivaFiscalizacao>(
        `${this.BASE_URL}/${fiscalizacaoId}/medidas/${medidaId}`,
        medida
      );
    } catch (error) {
      throw new Error(`Failed to update corrective measure: ${error}`);
    }
  }
  async deleteMedidaCorretiva(fiscalizacaoId: string | number, medidaId: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/${fiscalizacaoId}/medidas/${medidaId}`);
    } catch (error) {
      throw new Error(`Failed to delete corrective measure: ${error}`);
    }
  }
  async getMedidasCorretivas(fiscalizacaoId: string | number): Promise<Models.MedidaCorretivaFiscalizacao[]> {
    try {
      return await apiService.get<Models.MedidaCorretivaFiscalizacao[]>(
        `${this.BASE_URL}/${fiscalizacaoId}/medidas`
      );
    } catch (error) {
      throw new Error(`Failed to get corrective measures: ${error}`);
    }
  }

  // Alias/Legacy compatibility
  async addMedidaCorretivaFiscalizacao(fiscalizacaoId: string | number, medida: any): Promise<any> {
    return this.addMedidaCorretiva(fiscalizacaoId, medida);
  }
  async updateTramiteFiscalizacao(_fiscalizacaoId: string | number, tramite: Partial<Models.TramiteFiscalizacao>): Promise<Models.TramiteFiscalizacao> {
    if (tramite.id) {
        return this.updateTramiteStatus(tramite.id, tramite.statusId || '');
    }
    throw new Error("Tramite ID is required for update");
  }
}

export const fiscalizacaoService = new FiscalizacaoService();
export default fiscalizacaoService;
