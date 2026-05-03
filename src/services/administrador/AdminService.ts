/**
 * Administrador Service
 * Maps from: Java Source/br/smat/web/administrador/...Action.java
 * 
 * Handles user and group administration
 */
import { apiService } from '../api';
import * as Models from '../../types/models';

export class AdminService {
  private readonly BASE_URL = '/api/admin';

  // Usuarios
  async createUsuario(data: Partial<Models.Usuario>): Promise<Models.Usuario> {
    try {
      return await apiService.post<Models.Usuario>(`${this.BASE_URL}/usuarios`, data);
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }
  async updateUsuario(id: string | number, data: Partial<Models.Usuario>): Promise<Models.Usuario> {
    try {
      return await apiService.put<Models.Usuario>(`${this.BASE_URL}/usuarios/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }
  async getUsuario(id: string | number): Promise<Models.Usuario> {
    try {
      return await apiService.get<Models.Usuario>(`${this.BASE_URL}/usuarios/${id}`);
    } catch (error) {
      throw new Error(`Failed to get user: ${error}`);
    }
  }
  async listUsuarios(): Promise<Models.Usuario[]> {
    try {
      return await apiService.get<Models.Usuario[]>(`${this.BASE_URL}/usuarios`);
    } catch (error) {
      throw new Error(`Failed to list users: ${error}`);
    }
  }
  async deleteUsuario(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/usuarios/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  // Grupos
  async createGrupo(data: Partial<Models.Grupo>): Promise<Models.Grupo> {
    try {
      return await apiService.post<Models.Grupo>(`${this.BASE_URL}/grupos`, data);
    } catch (error) {
      throw new Error(`Failed to create group: ${error}`);
    }
  }
  async updateGrupo(id: string | number, data: Partial<Models.Grupo>): Promise<Models.Grupo> {
    try {
      return await apiService.put<Models.Grupo>(`${this.BASE_URL}/grupos/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update group: ${error}`);
    }
  }
  async getGrupo(id: string | number): Promise<Models.Grupo> {
    try {
      return await apiService.get<Models.Grupo>(`${this.BASE_URL}/grupos/${id}`);
    } catch (error) {
      throw new Error(`Failed to get group: ${error}`);
    }
  }
  async listGrupos(): Promise<Models.Grupo[]> {
    try {
      return await apiService.get<Models.Grupo[]>(`${this.BASE_URL}/grupos`);
    } catch (error) {
      throw new Error(`Failed to list groups: ${error}`);
    }
  }
  async deleteGrupo(id: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/grupos/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete group: ${error}`);
    }
  }

  // Usuario-Grupo Relationships
  async addToGroup(usuarioId: string | number, grupoId: string | number): Promise<Models.UsuarioGrupo> {
    try {
      return await apiService.post<Models.UsuarioGrupo>(
        `${this.BASE_URL}/usuario-grupo`,
        { usuarioId, grupoId }
      );
    } catch (error) {
      throw new Error(`Failed to add user to group: ${error}`);
    }
  }
  // Alias for backward compatibility
  async addUsuarioToGrupo(usuarioId: string | number, grupoId: string | number): Promise<Models.UsuarioGrupo> {
    return this.addToGroup(usuarioId, grupoId);
  }

  async removeFromGroup(usuarioId: string | number, grupoId: string | number): Promise<void> {
    try {
      await apiService.delete(
        `${this.BASE_URL}/usuario-grupo/${usuarioId}/${grupoId}`
      );
    } catch (error) {
      throw new Error(`Failed to remove user from group: ${error}`);
    }
  }
  // Alias for backward compatibility
  async removeUsuarioFromGrupo(usuarioId: string | number, grupoId: string | number): Promise<void> {
    return this.removeFromGroup(usuarioId, grupoId);
  }

  async getUserGroups(usuarioId: string | number): Promise<Models.Grupo[]> {
    try {
      return await apiService.get<Models.Grupo[]>(`${this.BASE_URL}/usuarios/${usuarioId}/grupos`);
    } catch (error) {
      throw new Error(`Failed to get user groups: ${error}`);
    }
  }

  async getAllUsuarioGrupos(): Promise<Models.UsuarioGrupo[]> {
    try {
      return await apiService.get<Models.UsuarioGrupo[]>(`${this.BASE_URL}/usuario-grupos`);
    } catch (error) {
      throw new Error(`Failed to get all user-group assignments: ${error}`);
    }
  }
}

export const adminService = new AdminService();
export default adminService;
