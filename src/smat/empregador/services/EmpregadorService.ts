/**
 * Empregador Service
 * Maps from: Java Source/br/smat/web/empregador/...Action.java
 * Maps from: Java Source/br/smat/web/telefoneempregador/...Action.java
 * Maps from: Java Source/br/smat/web/tipoempregador/...Action.java
 */
import { ApiService } from '../../api';
import { Empregador, TelefoneEmpregador, TipoEmpregador } from '../../../types/models';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmpregadorService {
  private apiService = inject(ApiService);
  private readonly BASE_URL = '/api/empresas/empregadores';
  private readonly BASE_URL_EMPRESAS = '/api/empresas';

  // Empregadores
  async createEmpregador(data: Partial<Empregador>): Promise<Empregador> {
    try {
      return await this.apiService.post<Empregador>(`${this.BASE_URL}`, data);
    } catch (error) {
      throw new Error(`Failed to create employer: ${error}`);
    }
  }
  async updateEmpregador(id: string | number, data: Partial<Empregador>): Promise<Empregador> {
    try {
      return await this.apiService.put<Empregador>(`${this.BASE_URL}/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update employer: ${error}`);
    }
  }
  async getEmpregador(id: string | number): Promise<Empregador> {
    try {
      return await this.apiService.get<Empregador>(`${this.BASE_URL}/${id}`);
    } catch (error) {
      throw new Error(`Failed to get employer: ${error}`);
    }
  }
  async listEmpregadores(): Promise<Empregador[]> {
    try {
      return await this.apiService.get<Empregador[]>(`${this.BASE_URL}`);
    } catch (error) {
      throw new Error(`Failed to list employers: ${error}`);
    }
  }
  async searchEmpregadores(term: string): Promise<Empregador[]> {
    try {
      return await this.apiService.get<Empregador[]>(`${this.BASE_URL_EMPRESAS}/search/empregadores?razaoSocial=${encodeURIComponent(term)}`);
    } catch (error) {
      throw new Error(`Failed to search employers: ${error}`);
    }
  }
  async deleteEmpregador(id: string | number): Promise<void> {
    try {
      await this.apiService.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete employer: ${error}`);
    }
  }

  // Telefones
  async addTelefone(empregadorId: string | number, data: Partial<TelefoneEmpregador>): Promise<TelefoneEmpregador> {
    try {
      return await this.apiService.post<TelefoneEmpregador>(
        `${this.BASE_URL}/${empregadorId}/telefones`,
        data
      );
    } catch (error) {
      throw new Error(`Failed to add phone: ${error}`);
    }
  }
  async updateTelefone(empregadorId: string | number, telefoneId: string | number, data: Partial<TelefoneEmpregador>): Promise<TelefoneEmpregador> {
    try {
      return await this.apiService.put<TelefoneEmpregador>(
        `${this.BASE_URL}/${empregadorId}/telefones/${telefoneId}`,
        data
      );
    } catch (error) {
      throw new Error(`Failed to update phone: ${error}`);
    }
  }
  async listTelefones(empregadorId: string | number): Promise<TelefoneEmpregador[]> {
    try {
      return await this.apiService.get<TelefoneEmpregador[]>(
        `${this.BASE_URL}/${empregadorId}/telefones`
      );
    } catch (error) {
      throw new Error(`Failed to list phones: ${error}`);
    }
  }
  // Aliases for DomainServices compatibility
  async getTelefones(empregadorId: string | number): Promise<TelefoneEmpregador[]> {
    return this.listTelefones(empregadorId);
  }
  async removeTelefone(empregadorId: string | number, telefoneId: string | number): Promise<void> {
    try {
      await this.apiService.delete(`${this.BASE_URL}/${empregadorId}/telefones/${telefoneId}`);
    } catch (error) {
      throw new Error(`Failed to remove phone: ${error}`);
    }
  }
  async deleteTelefone(empregadorId: string | number, telefoneId: string | number): Promise<void> {
    return this.removeTelefone(empregadorId, telefoneId);
  }

  // Tipos
  async getTiposEmpregador(): Promise<TipoEmpregador[]> {
    try {
      return await this.apiService.get<TipoEmpregador[]>(`${this.BASE_URL}/tipos`);
    } catch (error) {
      throw new Error(`Failed to get employer types: ${error}`);
    }
  }
  // Alias for DomainServices compatibility
  async listTiposEmpregador(): Promise<TipoEmpregador[]> {
    return this.getTiposEmpregador();
  }
  async getTipoEmpregador(id: string | number): Promise<TipoEmpregador> {
    try {
      return await this.apiService.get<TipoEmpregador>(`${this.BASE_URL}/tipos/${id}`);
    } catch (error) {
      throw new Error(`Failed to get employer type: ${error}`);
    }
  }
  async createTipoEmpregador(data: Partial<TipoEmpregador>): Promise<TipoEmpregador> {
    try {
      return await this.apiService.post<TipoEmpregador>(`${this.BASE_URL}/tipos`, data);
    } catch (error) {
      throw new Error(`Failed to create employer type: ${error}`);
    }
  }
  async updateTipoEmpregador(id: string | number, data: Partial<TipoEmpregador>): Promise<TipoEmpregador> {
    try {
      return await this.apiService.put<TipoEmpregador>(`${this.BASE_URL}/tipos/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update employer type: ${error}`);
    }
  }
  async deleteTipoEmpregador(id: string | number): Promise<void> {
    try {
      await this.apiService.delete(`${this.BASE_URL}/tipos/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete employer type: ${error}`);
    }
  }
}
