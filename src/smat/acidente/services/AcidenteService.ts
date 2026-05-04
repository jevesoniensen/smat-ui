/**
 * Acidente Service
 * Handles all accident registration and management operations
 */
import { apiService } from '../../api';
import { 
  Acidente, 
  LocalLesao,
  TipoAcidente,
  Status,
  Emitente,
  EstadoCivil,
  Ocupacao,
  VinculoEmpregaticio,
  Area,
  Estado,
  TipoLocalAcidente,
  Municipio,
  AgenteCausador,
  LocalAtendimento,
  Diagnostico,
  Fonte
} from '../../../types/models';

/**
 * Acidente Service - Complete accident management
 */
export class AcidenteService {
  private readonly BASE_URL = '/api/acidentes';
  private readonly BASE_URL_PARAMS = '/api/params';

  async createAcidente(data: Partial<Acidente>): Promise<Acidente> {
    try {
      return await apiService.post<Acidente>(`${this.BASE_URL}`, data);
    } catch (error) {
      throw new Error(`Failed to create accident: ${error}`);
    }
  }

  async createAcidenteStepOne(data: Partial<Acidente>): Promise<Acidente> {
    try {
      return await apiService.post<Acidente>(`${this.BASE_URL}/step-one`, data);
    } catch (error) {
      throw new Error(`Failed to create accident (step 1): ${error}`);
    }
  }

  async updateAcidente(id: string | number, data: Partial<Acidente>): Promise<Acidente> {
    try {
      return await apiService.put<Acidente>(`${this.BASE_URL}/${id}`, data);
    } catch (error) {
      throw new Error(`Failed to update accident: ${error}`);
    }
  }

  async updateAcidenteStepTwo(acidenteId: string | number, data: Partial<Acidente>): Promise<Acidente> {
    try {
      return await apiService.put<Acidente>(`${this.BASE_URL}/${acidenteId}/step-two`, data);
    } catch (error) {
      throw new Error(`Failed to update accident (step 2): ${error}`);
    }
  }

  async updateAcidenteStepThree(acidenteId: string | number, data: Partial<Acidente>): Promise<Acidente> {
    try {
      return await apiService.put<Acidente>(`${this.BASE_URL}/${acidenteId}/step-three`, data);
    } catch (error) {
      throw new Error(`Failed to update accident (step 3): ${error}`);
    }
  }

  async updateAcidenteStepFour(acidenteId: string | number, data: Partial<Acidente>): Promise<Acidente> {
    try {
      return await apiService.put<Acidente>(`${this.BASE_URL}/${acidenteId}/step-four`, data);
    } catch (error) {
      throw new Error(`Failed to update accident (step 4): ${error}`);
    }
  }

  async saveAcidente(acidenteId: string | number): Promise<Acidente> {
    try {
      return await apiService.post<Acidente>(`${this.BASE_URL}/${acidenteId}`, {});
    } catch (error) {
      throw new Error(`Failed to save accident: ${error}`);
    }
  }

  async getAcidente(acidenteId: string | number): Promise<Acidente> {
    try {
      return await apiService.get<Acidente>(`${this.BASE_URL}/${acidenteId}`);
    } catch (error) {
      throw new Error(`Failed to get accident: ${error}`);
    }
  }

  /**
   * Overloaded list method to handle both legacy (filters) and paginated requests
   */
  async listAcidentes(pageOrFilters?: number | Record<string, any>, limit: number = 10): Promise<any> {
    try {
      if (typeof pageOrFilters === 'number') {
        return await apiService.get<any>(`${this.BASE_URL}?page=${pageOrFilters}&limit=${limit}`);
      } else {
        const query = pageOrFilters ? `?${new URLSearchParams(pageOrFilters)}` : '';
        return await apiService.get<Acidente[]>(`${this.BASE_URL}${query}`);
      }
    } catch (error) {
      throw new Error(`Failed to list accidents: ${error}`);
    }
  }

  /**
   * Alias for legacy list method
   */
  async listAllAcidentes(filters?: Record<string, any>): Promise<Acidente[]> {
    return this.listAcidentes(filters);
  }

  async searchAcidentes(queryOrFilters: string | Record<string, any>): Promise<Acidente[]> {
    try {
      let query = '';
      if (typeof queryOrFilters === 'string') {
        query = `?q=${encodeURIComponent(queryOrFilters)}`;
      } else {
        const params = new URLSearchParams();
        Object.entries(queryOrFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        query = `?${params.toString()}`;
      }
      return await apiService.get<Acidente[]>(`${this.BASE_URL}/search${query}`);
    } catch (error) {
      throw new Error(`Failed to search accidents: ${error}`);
    }
  }

  async deleteAcidente(acidenteId: string | number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/${acidenteId}`);
    } catch (error) {
      throw new Error(`Failed to delete accident: ${error}`);
    }
  }

  async getAcidenteTemplate(): Promise<Partial<Acidente>> {
    try {
      return await apiService.get<Partial<Acidente>>(`${this.BASE_URL}/template`);
    } catch (error) {
      throw new Error(`Failed to get accident template: ${error}`);
    }
  }

  async validateAcidente(data: Partial<Acidente>): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    try {
      return await apiService.post<any>(`${this.BASE_URL}/validate`, data);
    } catch (error) {
      throw new Error(`Failed to validate accident: ${error}`);
    }
  }

  async getStatusOptions(): Promise<Status[]> {
    try {
      return await apiService.get<Status[]>(`${this.BASE_URL}/status-options`);
    } catch (error) {
      throw new Error(`Failed to get status options: ${error}`);
    }
  }

  async updateAcidenteStatus(acidenteId: string | number, status: string): Promise<Acidente> {
    try {
      return await apiService.put<Acidente>(`${this.BASE_URL}/${acidenteId}/status`, { status });
    } catch (error) {
      throw new Error(`Failed to update accident status: ${error}`);
    }
  }

  // ============ Collections ============

  async getAllEmitentes(): Promise<Emitente[]> {
    try {
      return await apiService.get<Emitente[]>(`${this.BASE_URL_PARAMS}/emitentes`);
    } catch (error) {
      throw new Error(`Failed to get emitters: ${error}`);
    }
  }

  async getAllEstadosCivis(): Promise<EstadoCivil[]> {
    try {
      return await apiService.get<EstadoCivil[]>(`${this.BASE_URL_PARAMS}/estadoscivis`);
    } catch (error) {
      throw new Error(`Failed to get marital statuses: ${error}`);
    }
  }

  async getAllOcupacoes(): Promise<Ocupacao[]> {
    try {
      return await apiService.get<Ocupacao[]>(`${this.BASE_URL_PARAMS}/ocupacoes`);
    } catch (error) {
      throw new Error(`Failed to get occupations: ${error}`);
    }
  }

  async getAllVinculosEmpregaticios(): Promise<VinculoEmpregaticio[]> {
    try {
      return await apiService.get<VinculoEmpregaticio[]>(`${this.BASE_URL_PARAMS}/vinculosempregaticios`);
    } catch (error) {
      throw new Error(`Failed to get employment types: ${error}`);
    }
  }

  async getAllAreas(): Promise<Area[]> {
    try {
      return await apiService.get<Area[]>(`${this.BASE_URL_PARAMS}/areas`);
    } catch (error) {
      throw new Error(`Failed to get areas: ${error}`);
    }
  }

  async getAllEstados(): Promise<Estado[]> {
    try {
      return await apiService.get<Estado[]>(`${this.BASE_URL_PARAMS}/estados`);
    } catch (error) {
      throw new Error(`Failed to get states: ${error}`);
    }
  }

  async getTiposAcidente(): Promise<TipoAcidente[]> {
    try {
      return await apiService.get<TipoAcidente[]>(`${this.BASE_URL_PARAMS}/tiposacidente`);
    } catch (error) {
      throw new Error(`Failed to get accident types: ${error}`);
    }
  }

  async getTiposLocalAcidente(): Promise<TipoLocalAcidente[]> {
    try {
      return await apiService.get<TipoLocalAcidente[]>(`${this.BASE_URL_PARAMS}/tiposlocalacidente`);
    } catch (error) {
      throw new Error(`Failed to get accident location types: ${error}`);
    }
  }

  async getMunicipios(estadoSigla: string): Promise<Municipio[]> {
    try {
      return await apiService.get<Municipio[]>(`${this.BASE_URL_PARAMS}/search/municipios?sigla=${estadoSigla}`);
    } catch (error) {
      throw new Error(`Failed to get municipalities: ${error}`);
    }
  }

  async getLocaisLesaoPai(): Promise<LocalLesao[]> {
    try {
      let url = `${this.BASE_URL_PARAMS}/locaislesao`;
      return await apiService.get<LocalLesao[]>(url);
    } catch (error) {
      throw new Error(`Failed to get injury locations: ${error}`);
    }
  }

  async getLocaisLesao(paiId?: string | number): Promise<LocalLesao[]> {
    try {
      let url = `${this.BASE_URL_PARAMS}/search/locaislesao?paiId=${paiId}`;
      return await apiService.get<LocalLesao[]>(url);
    } catch (error) {
      throw new Error(`Failed to get injury locations: ${error}`);
    }
  }

  async getAgentesCausadoresVo(): Promise<AgenteCausador[]> {
    try {
      let url = `${this.BASE_URL_PARAMS}/agentescausadores`;
      return await apiService.get<AgenteCausador[]>(url);
    } catch (error) {
      throw new Error(`Failed to get causing agents: ${error}`);
    }
  }

  async getAgentesCausadores(paiId?: string | number): Promise<AgenteCausador[]> {
    try {
      let url = `${this.BASE_URL_PARAMS}/search/agentescausadores?paiId=${paiId}`;
      return await apiService.get<AgenteCausador[]>(url);
    } catch (error) {
      throw new Error(`Failed to get causing agents: ${error}`);
    }
  }

  async getAllLocaisAtendimento(): Promise<LocalAtendimento[]> {
    try {
      return await apiService.get<LocalAtendimento[]>(`${this.BASE_URL_PARAMS}/locaisatendimento`);
    } catch (error) {
      throw new Error(`Failed to get care locations: ${error}`);
    }
  }

  async getAllDiagnosticos(): Promise<Diagnostico[]> {
    try {
      return await apiService.get<Diagnostico[]>(`${this.BASE_URL_PARAMS}/diagnosticos`);
    } catch (error) {
      throw new Error(`Failed to get diagnostics: ${error}`);
    }
  }

  async getAllFontes(): Promise<Fonte[]> {
    try {
      return await apiService.get<Fonte[]>(`${this.BASE_URL_PARAMS}/fontes`);
    } catch (error) {
      throw new Error(`Failed to get sources: ${error}`);
    }
  }

}

export const acidenteService = new AcidenteService();
export default acidenteService;
