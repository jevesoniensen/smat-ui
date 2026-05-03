/**
 * Type definitions for SMAT UI application
 */

// User and Access Control
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
}

export interface Pagina {
  id: string;
  nome: string;
  descricao: string;
  ativa: boolean;
}

// Accident related types
export interface ObjAcidente {
  id?: string;
  destinoPermitido?: string;
  [key: string]: any;
}

export interface ObjArea {
  id: string;
  nome: string;
  descricao?: string;
}

export interface ObjDiagnostico {
  id: string;
  nome: string;
  descricao?: string;
}

export interface ObjEmitente {
  id: string;
  nome: string;
  cnpj?: string;
}

export interface ObjEstado {
  id: string;
  nome: string;
  sigla: string;
}

export interface ObjEstadoCivil {
  id: string;
  nome: string;
}

export interface ObjFonte {
  id: string;
  nome: string;
  descricao?: string;
}

export interface ObjLocalAtendimento {
  id: string;
  nome: string;
  endereco?: string;
}

export interface ObjOcupacao {
  id: string;
  nome: string;
  descricao?: string;
}

export interface ObjVinculoEmpregaticio {
  id: string;
  nome: string;
  descricao?: string;
}

// Form data
export interface AcidenteGravarFormData {
  acao: string | null;
  destino: string | null;
  paginaAtual: string | null;
}

// Menu types
export interface MenuItem {
  posicaoMenu: string;
  nome: string;
  nomePaginaDefault?: string;
  filhos: number;
  height: string;
  width: string;
  bgColor: string;
  bgHighColor: string;
  fontColor: string;
  fontHighColor: string;
}

// Session data
export interface SessionData {
  usuario: Usuario | null;
  objAcidente: ObjAcidente | null;
  menu?: MenuItem[];
  vLocalLesaoAcidente?: any;
  vTestemunhas?: any;
  colEmitente?: ObjEmitente[];
  colEstadoCivil?: ObjEstadoCivil[];
  colOcupacao?: ObjOcupacao[];
  colVinculoEmpregaticio?: ObjVinculoEmpregaticio[];
  colArea?: ObjArea[];
  colLocalAtendimento?: ObjLocalAtendimento[];
  colDiagnostico?: ObjDiagnostico[];
  colEstado?: ObjEstado[];
  colFonte?: ObjFonte[];
  permissaoPagina?: Pagina | null;
}

// Action response
export interface ActionResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
  forward?: string;
}

