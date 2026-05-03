/**
 * Parametros Service
 * Maps from: Java Source/br/smat/web/parametros/...Action.java
 * 
 * Handles system parameters and dropdown data
 */
import { apiService } from '../api';
import * as Models from '../../types/models';

export class ParametrosService {
  private readonly BASE_URL = '/api/parametros';
  private readonly BASE_URL_EMPRESAS = '/api/empresas';

  // Ramo de Atividade
  async getRamosAtividade(): Promise<Models.RamoAtividade[]> {
    try {
      return await apiService.get<Models.RamoAtividade[]>(`${this.BASE_URL_EMPRESAS}/ramosatividade`);
    } catch (error) {
      throw new Error(`Failed to get activity types: ${error}`);
    }
  }
  async createRamoAtividade(data: Partial<Models.RamoAtividade>): Promise<Models.RamoAtividade> {
    try {
      return await apiService.post<Models.RamoAtividade>(`${this.BASE_URL_EMPRESAS}/ramosatividade`, data);
    } catch (error) {
      throw new Error(`Failed to create activity type: ${error}`);
    }
  }
  async updateRamoAtividade(id: string | number, data: Partial<Models.RamoAtividade>): Promise<Models.RamoAtividade> {
    try {
      return await apiService.put<Models.RamoAtividade>(`${this.BASE_URL_EMPRESAS}/ramosatividade/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update activity type: ${error}`);
    }
  }
  async deleteRamoAtividade(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL_EMPRESAS}/ramosatividade/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete activity type: ${error}`);
    }
  }

  // Agente Causador
  async getAgentesCausadores(): Promise<Models.AgenteCausador[]> {
    try {
      return await apiService.get<Models.AgenteCausador[]>(`${this.BASE_URL}/agentes-causadores`);
    } catch (error) {
      throw new Error(`Failed to get causing agents: ${error}`);
    }
  }
  async createAgenteCausador(data: Partial<Models.AgenteCausador>): Promise<Models.AgenteCausador> {
    try {
      return await apiService.post<Models.AgenteCausador>(`${this.BASE_URL}/agentes-causadores`, data);
    } catch (error) {
      throw new Error(`Failed to create causing agent: ${error}`);
    }
  }
  async updateAgenteCausador(id: string | number, data: Partial<Models.AgenteCausador>): Promise<Models.AgenteCausador> {
    try {
      return await apiService.put<Models.AgenteCausador>(`${this.BASE_URL}/agentes-causadores/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update causing agent: ${error}`);
    }
  }
  async deleteAgenteCausador(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/agentes-causadores/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete causing agent: ${error}`);
    }
  }

  // Locais de Lesão
  async getLocaisLesao(): Promise<Models.LocalLesao[]> {
    try {
      return await apiService.get<Models.LocalLesao[]>(`${this.BASE_URL}/locais-lesao`);
    } catch (error) {
      throw new Error(`Failed to get injury locations: ${error}`);
    }
  }
  async createLocalLesao(data: Partial<Models.LocalLesao>): Promise<Models.LocalLesao> {
    try {
      return await apiService.post<Models.LocalLesao>(`${this.BASE_URL}/locais-lesao`, data);
    } catch (error) {
      throw new Error(`Failed to create injury location: ${error}`);
    }
  }
  async updateLocalLesao(id: string | number, data: Partial<Models.LocalLesao>): Promise<Models.LocalLesao> {
    try {
      return await apiService.put<Models.LocalLesao>(`${this.BASE_URL}/locais-lesao/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update injury location: ${error}`);
    }
  }
  async deleteLocalLesao(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/locais-lesao/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete injury location: ${error}`);
    }
  }

  // Local de Atendimento
  async getLocaisAtendimento(): Promise<Models.LocalAtendimento[]> {
    try {
      return await apiService.get<Models.LocalAtendimento[]>(`${this.BASE_URL}/locais-atendimento`);
    } catch (error) {
      throw new Error(`Failed to get care locations: ${error}`);
    }
  }
  async createLocalAtendimento(data: Partial<Models.LocalAtendimento>): Promise<Models.LocalAtendimento> {
    try {
      return await apiService.post<Models.LocalAtendimento>(`${this.BASE_URL}/locais-atendimento`, data);
    } catch (error) {
      throw new Error(`Failed to create care location: ${error}`);
    }
  }
  async updateLocalAtendimento(id: string | number, data: Partial<Models.LocalAtendimento>): Promise<Models.LocalAtendimento> {
    try {
      return await apiService.put<Models.LocalAtendimento>(`${this.BASE_URL}/locais-atendimento/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update care location: ${error}`);
    }
  }
  async deleteLocalAtendimento(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/locais-atendimento/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete care location: ${error}`);
    }
  }

  // Itens de Fiscalização
  async getItensFiscalizacao(): Promise<Models.ItemFiscalizacao[]> {
    try {
      return await apiService.get<Models.ItemFiscalizacao[]>(`${this.BASE_URL}/itens-fiscalizacao`);
    } catch (error) {
      throw new Error(`Failed to get inspection items: ${error}`);
    }
  }
  async createItemFiscalizacao(data: Partial<Models.ItemFiscalizacao>): Promise<Models.ItemFiscalizacao> {
    try {
      return await apiService.post<Models.ItemFiscalizacao>(`${this.BASE_URL}/itens-fiscalizacao`, data);
    } catch (error) {
      throw new Error(`Failed to create inspection item: ${error}`);
    }
  }
  async updateItemFiscalizacao(id: string | number, data: Partial<Models.ItemFiscalizacao>): Promise<Models.ItemFiscalizacao> {
    try {
      return await apiService.put<Models.ItemFiscalizacao>(`${this.BASE_URL}/itens-fiscalizacao/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update inspection item: ${error}`);
    }
  }
  async deleteItemFiscalizacao(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/itens-fiscalizacao/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete inspection item: ${error}`);
    }
  }

  // Pontos de Fiscalização
  async getPontosFiscalizacao(): Promise<Models.PontoFiscalizacao[]> {
    try {
      return await apiService.get<Models.PontoFiscalizacao[]>(`${this.BASE_URL}/pontos-fiscalizacao`);
    } catch (error) {
      throw new Error(`Failed to get inspection points: ${error}`);
    }
  }
  async createPontoFiscalizacao(data: Partial<Models.PontoFiscalizacao>): Promise<Models.PontoFiscalizacao> {
    try {
      return await apiService.post<Models.PontoFiscalizacao>(`${this.BASE_URL}/pontos-fiscalizacao`, data);
    } catch (error) {
      throw new Error(`Failed to create inspection point: ${error}`);
    }
  }
  async updatePontoFiscalizacao(id: string | number, data: Partial<Models.PontoFiscalizacao>): Promise<Models.PontoFiscalizacao> {
    try {
      return await apiService.put<Models.PontoFiscalizacao>(`${this.BASE_URL}/pontos-fiscalizacao/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update inspection point: ${error}`);
    }
  }
  async deletePontoFiscalizacao(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/pontos-fiscalizacao/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete inspection point: ${error}`);
    }
  }

  // Vínculo Item x Ponto
  async getVinculosItemPonto(pontoId: string | number): Promise<Models.ItemFiscalizacao[]> {
    try {
      return await apiService.get<Models.ItemFiscalizacao[]>(`${this.BASE_URL}/pontos-fiscalizacao/${pontoId}/items`);
    } catch (error) {
      throw new Error(`Failed to get item-point links: ${error}`);
    }
  }
  async updateVinculoItemPonto(pontoId: string | number, itemIds: (string | number)[]): Promise<any> {
    try {
      return await apiService.post(`${this.BASE_URL}/pontos-fiscalizacao/${pontoId}/items`, { itemIds });
    } catch (error) {
      throw new Error(`Failed to update item-point links: ${error}`);
    }
  }

  // Regionais
  async getRegionais(): Promise<Models.Regional[]> {
    try {
      return await apiService.get<Models.Regional[]>(`${this.BASE_URL}/regionais`);
    } catch (error) {
      throw new Error(`Failed to get regions: ${error}`);
    }
  }
  async createRegional(data: Partial<Models.Regional>): Promise<Models.Regional> {
    try {
      return await apiService.post<Models.Regional>(`${this.BASE_URL}/regionais`, data);
    } catch (error) {
      throw new Error(`Failed to create region: ${error}`);
    }
  }
  async updateRegional(id: string | number, data: Partial<Models.Regional>): Promise<Models.Regional> {
    try {
      return await apiService.put<Models.Regional>(`${this.BASE_URL}/regionais/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update region: ${error}`);
    }
  }
  async deleteRegional(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/regionais/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete region: ${error}`);
    }
  }

  // Telefones Regionais
  async getTelefonesRegional(regionalId: string | number): Promise<Models.TelefoneRegional[]> {
    try {
      return await apiService.get<Models.TelefoneRegional[]>(`${this.BASE_URL}/regionais/${regionalId}/telefones`);
    } catch (error) {
      throw new Error(`Failed to get regional phones: ${error}`);
    }
  }
  async addTelefoneRegional(regionalId: string | number, data: Partial<Models.TelefoneRegional>): Promise<Models.TelefoneRegional> {
    try {
      return await apiService.post<Models.TelefoneRegional>(`${this.BASE_URL}/regionais/${regionalId}/telefones`, data);
    } catch (error) {
      throw new Error(`Failed to add regional phone: ${error}`);
    }
  }
  async deleteTelefoneRegional(regionalId: string | number, telefoneId: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/regionais/${regionalId}/telefones/${telefoneId}`);
    } catch (error) {
      throw new Error(`Failed to delete regional phone: ${error}`);
    }
  }

  // Helpers for dropdowns and reference data
  async getTiposAcidente(): Promise<Models.TipoAcidente[]> {
    return apiService.get<Models.TipoAcidente[]>(`${this.BASE_URL}/tipos-acidente`, { _: Date.now() });
  }
  async getTiposEmpregador(): Promise<Models.TipoEmpregador[]> {
    return apiService.get<Models.TipoEmpregador[]>(`${this.BASE_URL_EMPRESAS}/tiposempregadores`, { _: Date.now() });
  }
  async getTiposDepoimento(): Promise<Models.TipoDepoimento[]> {
    return apiService.get<Models.TipoDepoimento[]>(`${this.BASE_URL}/tipos-depoimento`, { _: Date.now() });
  }
  async getEstados(): Promise<Models.Estado[]> {
    return apiService.get<Models.Estado[]>(`${this.BASE_URL}/estados`, { _: Date.now() });
  }
  async getMunicipios(estadoId?: string | number): Promise<Models.Municipio[]> {
    const params: any = { _: Date.now() };
    if (estadoId) params.estadoId = estadoId;
    return apiService.get<Models.Municipio[]>(`${this.BASE_URL}/municipios`, params);
  }
  async getOcupacoes(): Promise<Models.Ocupacao[]> {
    return apiService.get<Models.Ocupacao[]>(`${this.BASE_URL}/ocupacoes`, { _: Date.now() });
  }
  async getStatus(): Promise<Models.Status[]> {
    return apiService.get<Models.Status[]>(`${this.BASE_URL}/status`, { _: Date.now() });
  }
  async getTiposMedidaCorretiva(): Promise<Models.TipoMedidaCorretiva[]> {
    return apiService.get<Models.TipoMedidaCorretiva[]>(`${this.BASE_URL}/tipos-medida-corretiva`, { _: Date.now() });
  }
  async getRegionaisByEstado(estadoId: string | number): Promise<Models.Regional[]> {
    return apiService.get<Models.Regional[]>(`${this.BASE_URL}/regionais`, { estado: estadoId, _: Date.now() });
  }
}

export const parametrosService = new ParametrosService();
export default parametrosService;
