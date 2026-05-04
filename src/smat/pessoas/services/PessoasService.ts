/**
 * Pessoas Service
 * Maps from: Java Source/br/smat/web/pessoas/...Action.java
 * 
 * Handles people management (workers, agents, witnesses, representatives)
 */
import { apiService } from '../../api';
import * as Models from '../../../types/models';

export class PessoasService {
  private readonly BASE_URL = '/api/pessoas';

  // Trabalhadores
  async createTrabalhador(data: Partial<Models.Trabalhador>): Promise<Models.Trabalhador> {
    try {
      return await apiService.post<Models.Trabalhador>(`${this.BASE_URL}/trabalhadores`, data);
    } catch (error) {
      throw new Error(`Failed to create worker: ${error}`);
    }
  }
  async updateTrabalhador(id: string, data: Partial<Models.Trabalhador>): Promise<Models.Trabalhador> {
    try {
      return await apiService.put<Models.Trabalhador>(`${this.BASE_URL}/trabalhadores/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update worker: ${error}`);
    }
  }
  async getTrabalhador(id: string | number): Promise<Models.Trabalhador> {
    try {
      return await apiService.get<Models.Trabalhador>(`${this.BASE_URL}/trabalhadores/${id}`);
    } catch (error) {
      throw new Error(`Failed to get worker: ${error}`);
    }
  }
  async listTrabalhadores(): Promise<Models.Trabalhador[]> {
    try {
      return await apiService.get<Models.Trabalhador[]>(`${this.BASE_URL}/trabalhadores`);
    } catch (error) {
      throw new Error(`Failed to list workers: ${error}`);
    }
  }
  async deleteTrabalhador(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/trabalhadores/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete worker: ${error}`);
    }
  }

  // Testemunhas
  async createTestemunha(data: Partial<Models.Testemunha>): Promise<Models.Testemunha> {
    try {
      return await apiService.post<Models.Testemunha>(`${this.BASE_URL}/testemunhas`, data);
    } catch (error) {
      throw new Error(`Failed to create witness: ${error}`);
    }
  }
  async updateTestemunha(id: string, data: Partial<Models.Testemunha>): Promise<Models.Testemunha> {
    try {
      return await apiService.put<Models.Testemunha>(`${this.BASE_URL}/testemunhas/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update witness: ${error}`);
    }
  }
  async getTestemunha(id: string | number): Promise<Models.Testemunha> {
    try {
      return await apiService.get<Models.Testemunha>(`${this.BASE_URL}/testemunhas/${id}`);
    } catch (error) {
      throw new Error(`Failed to get witness: ${error}`);
    }
  }
  async listTestemunhas(): Promise<Models.Testemunha[]> {
    try {
      return await apiService.get<Models.Testemunha[]>(`${this.BASE_URL}/testemunhas`);
    } catch (error) {
      throw new Error(`Failed to list witnesses: ${error}`);
    }
  }
  async deleteTestemunha(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/testemunhas/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete witness: ${error}`);
    }
  }

  // Agentes de Saúde
  async createAgenteSaude(data: Partial<Models.AgenteSaude>): Promise<Models.AgenteSaude> {
    try {
      return await apiService.post<Models.AgenteSaude>(`${this.BASE_URL}/agentes-saude`, data);
    } catch (error) {
      throw new Error(`Failed to create health agent: ${error}`);
    }
  }
  async updateAgenteSaude(id: string, data: Partial<Models.AgenteSaude>): Promise<Models.AgenteSaude> {
    try {
      return await apiService.put<Models.AgenteSaude>(`${this.BASE_URL}/agentes-saude/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update health agent: ${error}`);
    }
  }
  async getAgenteSaude(id: string | number): Promise<Models.AgenteSaude> {
    try {
      return await apiService.get<Models.AgenteSaude>(`${this.BASE_URL}/agentes-saude/${id}`);
    } catch (error) {
      throw new Error(`Failed to get health agent: ${error}`);
    }
  }
  async listAgentesSaude(): Promise<Models.AgenteSaude[]> {
    try {
      return await apiService.get<Models.AgenteSaude[]>(`${this.BASE_URL}/agentes-saude`);
    } catch (error) {
      throw new Error(`Failed to list health agents: ${error}`);
    }
  }
  async deleteAgenteSaude(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/agentes-saude/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete health agent: ${error}`);
    }
  }

  // Representantes
  async createRepresentante(data: Partial<Models.RepresentanteEmpresa>): Promise<Models.RepresentanteEmpresa> {
    try {
      return await apiService.post<Models.RepresentanteEmpresa>(`${this.BASE_URL}/representantes`, data);
    } catch (error) {
      throw new Error(`Failed to create representative: ${error}`);
    }
  }
  async updateRepresentante(id: string, data: Partial<Models.RepresentanteEmpresa>): Promise<Models.RepresentanteEmpresa> {
    try {
      return await apiService.put<Models.RepresentanteEmpresa>(`${this.BASE_URL}/representantes/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update representative: ${error}`);
    }
  }
  async listRepresentantes(empregadorId?: string): Promise<Models.RepresentanteEmpresa[]> {
    try {
      const query = empregadorId ? `?empregador=${empregadorId}` : '';
      return await apiService.get<Models.RepresentanteEmpresa[]>(`${this.BASE_URL}/representantes${query}`);
    } catch (error) {
      throw new Error(`Failed to list representatives: ${error}`);
    }
  }
  async deleteRepresentante(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/representantes/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete representative: ${error}`);
    }
  }

  // Search
  async searchPessoas(term: string, tipoDepoimentoId?: string): Promise<Models.Pessoa[]> {
    try {
      const queryStr = `?q=${encodeURIComponent(term)}${tipoDepoimentoId ? `&tipo=${tipoDepoimentoId}` : ''}`;
      return await apiService.get<Models.Pessoa[]>(`${this.BASE_URL}/search${queryStr}`);
    } catch (error) {
      throw new Error(`Failed to search people: ${error}`);
    }
  }
}

export const pessoasService = new PessoasService();
export default pessoasService;
