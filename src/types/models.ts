/**
 * Domain Models - Type Definitions
 * 50+ interfaces for type-safe development
 */
// ============================================================================
// ACCIDENT (ACIDENTE) MODELS
// ============================================================================
export interface Acidente {
  id: string;
  dataAcidente: Date;
  trabalhador: Trabalhador;
  descricao: string;
  localAcidente: string;
  localLesao: string;
  agenteCausador: AgenteCausador;
  tipoAcidente: TipoAcidente;
  status: string;
  criadoEm: Date;
  atualizadoEm: Date;
  empregador?: Empregador; // Added missing field
}
export interface Trabalhador {
  id: string;
  nome: string;
  cpf: string;
  matricula: string;
  cargo: string;
  departamento: string;
  dataAdmissao: Date;
}
export interface TipoAcidente {
  id: string;
  nome: string;
}
export interface LocalLesao {
  id: string;
  nome: string;
}
export interface AgenteCausador {
  id: string;
  nome: string;
  descricao: string;
}
export interface LocalAtendimento {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
}
// ============================================================================
// INVESTIGATION (INVESTIGACAO) MODELS
// ============================================================================
export interface Investigacao {
  id: string;
  acidente: Acidente;
  dataInicio: Date;
  dataFim?: Date;
  responsavel: Usuario;
  status: string;
  descricao: string;
  depoimentos: Depoimento[];
  medidasCorretivasInvestigacao: MedidaCorretivaInvestigacao[];
}
export interface Depoimento {
  id: string;
  investigacao: Investigacao;
  testemunha: Testemunha;
  dataDepoimento: Date;
  relato: string;
  tipo: string; // PRESENCIAL, ESCRITO, VIDEO
  tipoDepoimentoId?: string; // Added for Depoimentos.tsx
  pessoaId?: string; // Added for Depoimentos.tsx
  agenteCausadorId?: string; // Added for Depoimentos.tsx
}
export interface TipoDepoimento { // Added for Depoimentos.tsx
  id: string;
  nome: string;
}
export interface Testemunha {
  id: string;
  nome: string;
  cpf: string;
  contato: string;
  funcao: string;
  estadoId: string;
  municipioId: string;
  rua: string;
  bairro: string;
  numero: string;
  complemento?: string;
  cep: string;
  ddd: string;
  telefone: string;
}
export interface MedidaCorretivaInvestigacao {
  id: string;
  investigacao: Investigacao;
  descricao: string;
  responsavel: Usuario;
  dataPrevista: Date;
  status: string;
  tipoId?: string; // Added for MedidasCorretivas.tsx
  prazoDias?: number; // Added for MedidasCorretivas.tsx
  observacao?: string; // Added for MedidasCorretivas.tsx
}
// ============================================================================
// INSPECTION (FISCALIZACAO) MODELS
// ============================================================================
export interface Fiscalizacao {
  id: string;
  titulo: string;
  obsGerais: string;
  dataFiscalizacao: Date;
  dataFim?: Date;
  empregador: Empregador;
  fiscal: Usuario;
  status: string;
  pontoFiscalizacao?: PontoFiscalizacao;
  itensFiscalizacao: ItemFiscalizacao[];
  medidasCorretivasInspecao: MedidaCorretivaFiscalizacao[];
  tramites: TramiteFiscalizacao[];
}
export interface PontoFiscalizacao {
  id: string;
  descricao: string;
  endereco: string;
  telefone: string;
  responsavel: string;
}
export interface ItemFiscalizacao {
  id: string;
  descricao: string;
  normaRelacionada: string;
  grauConformidadeId?: string; // Added for Tramite.tsx
  grauConformidade?: GrauConformidade; // Added for Tramite.tsx
}
export interface MedidaCorretivaFiscalizacao {
  id: string;
  fiscalizacao: Fiscalizacao;
  descricao: string;
  tipo: string;
  dataPrevista: Date;
  responsavel: Usuario;
  status: string;
}
export interface TramiteFiscalizacao {
  id: string;
  fiscalizacao: Fiscalizacao;
  tipo: string; // NOTIFICACAO, MULTA, EMBARGADA
  dataTramite: Date;
  valor?: number;
  status: string;
  statusId?: string; // Added for Tramite.tsx
  roteiroItems?: ItemFiscalizacao[]; // Added for Tramite.tsx
}
export interface TramiteStatus { // Added for Tramite.tsx
  id: string;
  nome: string;
}
export interface GrauConformidade { // Added for Tramite.tsx
  id: string;
  nome: string;
}
export interface TipoMedidaCorretiva { // Added for MedidasCorretivas.tsx
  id: string;
  descricao: string;
}
// ============================================================================
// EMPLOYER (EMPREGADOR) MODELS
// ============================================================================
export interface Empregador {
  id: string;
  ramoAtividade: string;
  estado: string;
  municipio: string;
  tipoEmpregador: TipoEmpregador;
  razaoSocial: string;
  documento: string;
  numero: string;
  rua: string;
  bairro: string;
  cep: string;
  complemento?: string;
}
export interface TelefoneEmpregador {
  id: string;
  empregador: Empregador;
  numero: string;
  tipo: string; // COMERCIAL, CELULAR
  ddd: string; // Added for Telefones.tsx
  descricao: string; // Added for Telefones.tsx
}
export interface TipoEmpregador {
  id: string;
  descricao: string;
  codigo: string;
}
// ============================================================================
// PEOPLE (PESSOAS) MODELS
// ============================================================================
export interface Pessoa {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: Date;
  contato: string;
  tipo: string; // AGENTE_SAUDE, REPRESENTANTE, TESTEMUNHA
}
export interface AgenteSaude {
  id: string;
  nome: string;
  crm?: string;
  especialidade: string;
  contato: string;
  email: string;
  estadoId: string;
  regionalId: string;
}
export interface RepresentanteEmpresa {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  contato: string;
  empresa: Partial<Empregador>; // Changed to Partial to support ID-only links
}
// ============================================================================
// PARAMETERS (PARAMETROS) MODELS
// ============================================================================
export interface RamoAtividade {
  id: string;
  nome: string;
  cnae: string;
  ramoSuperior?: string; // To link to a superior RamoAtividade
}
export interface Estado {
  id: string;
  nome: string;
  sigla: string;
}
export interface Municipio {
  id: string;
  nome: string;
  estadoId: string;
}
export interface Emitente {
  id: string;
  nome: string;
}
export interface EstadoCivil {
  id: string;
  nome: string;
}
export interface VinculoEmpregaticio {
  id: string;
  nome: string;
}
export interface Area {
  id: string;
  nome: string;
}
export interface TipoLocalAcidente {
  id: string;
  nome: string;
}
export interface Diagnostico {
  id: string;
  nome: string;
}
export interface Fonte {
  id: string;
  nome: string;
}
export interface Regional {
  id: string;
  nome: string;
  endereco: string;
  telefones: TelefoneRegional[];
}
export interface TelefoneRegional {
  id: string;
  regional: Regional;
  numero: string;
  ramal?: string;
}
// ============================================================================
// REPORTS (RELATORIO) MODELS
// ============================================================================
export interface Relatorio {
  id: string;
  titulo: string;
  tipo: string; // ACIDENTES, FISCALIZACAO, INVESTIGACAO
  dataGeracao: Date;
  parametros: RelatorioParametros;
  dados: any[];
}
export interface RelatorioParametros {
  dataInicio: Date;
  dataFim: Date;
  regional?: string;
  status?: string;
  filtros: Record<string, any>;
}
export interface RelatorioSalvo {
  id: string;
  usuario: Usuario;
  nomeRelatorio: string;
  tipo: string;
  parametros: RelatorioParametros;
  dataSalvamento: Date;
}
// ============================================================================
// ADMIN (ADMINISTRADOR) MODELS
// ============================================================================
export interface Usuario {
  id: string;
  login: string;
  nome: string;
  email: string;
  senha?: string;
  ativo: boolean;
  grupos: UsuarioGrupo[];
  dataCadastro: Date;
  ultimoAcesso?: Date;
  agenteSaudeId?: string; // Added for Usuarios.tsx
}
export interface UsuarioGrupo {
  id: string;
  usuario: Usuario;
  grupo: Grupo;
}
export interface Grupo {
  id: string;
  nome: string;
  descricao: string;
  permissoes: string[];
}
// ============================================================================
// MONITOR MODELS
// ============================================================================
export interface Monitor {
  monitor: number;
  periodicidade: number;
  campo: number;
  queryCampo: number;
  maxAcidente: number;
  ultimaExecucao?: string;
  nomeCampo?: string;
  nomeRegistro?: string;
  ultimaDataExecucao?: string;
}

export interface Campo {
  campo: number;
  label: string;
}

export interface AuxCampo {
  registro: number;
  nomeRegistro: string;
}
// ============================================================================
// API RESPONSE MODELS
// ============================================================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
export interface ApiPagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
// ============================================================================
// FORM MODELS
// ============================================================================
export interface FormErrors {
  [key: string]: string[];
}
export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}
// ============================================================================
// AUTHENTICATION MODELS
// ============================================================================
export interface LoginRequest {
  login: string;
  senha: string;
}
export interface LoginResponse {
  token: string;
  usuario: Usuario;
  expiresIn: number;
  menu?: MenuItem[];
}
export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
  order?: number;
}
export interface AuthContext {
  usuario?: Usuario;
  token?: string;
  menu?: MenuItem[];
  isAuthenticated: boolean;
  login: (login: string, senha: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error?: string;
}
// ============================================================================
// SEARCH/FILTER MODELS
// ============================================================================
export interface SearchFilters {
  query?: string;
  dataInicio?: Date;
  dataFim?: Date;
  status?: string;
  [key: string]: any;
}
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}
// ============================================================================
// UTILITY MODELS
// ============================================================================
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}
// ============================================================================
// MISSING TYPES (Added during compatibility check)
// ============================================================================
/**
 * Page information model
 */
export interface Pagina {
  id: string;
  nome: string;
  descricao?: string;
  nomePaginaDefault?: string;
  bgColor?: string;
  fontColor?: string;
  posicaoMenu?: number;
}
/**
 * Accident form object - used in sessions
 */
export interface ObjAcidente {
  id?: string;
  acidenteId?: string;
  dataAcidente?: Date;
  descricao?: string;
  [key: string]: any;
}
/**
 * Fiscalization route/schedule
 */
export interface Roteiro {
  id: string;
  numero?: string;
  dataInicio?: Date;
  dataFim?: Date;
  fiscalizacaoId?: string;
  descricao?: string;
}
/**
 * Occupation/Job Title
 */
export interface Ocupacao {
  id: string;
  nome: string;
  cbo: string;
}
/**
 * Status values for various entities
 */
export interface Status {
  id: string;
  code: string;
  descricao: string;
  ativo?: boolean;
}
/**
 * Monitor field/column definition
 */
export interface CampoMonitor {
  id: string;
  nome: string;
  tipo?: string;
  ordem?: number;
}
/**
 * Monitor record/entry
 */
export interface RegistroMonitor {
  id: string;
  campoId?: string;
  valor?: string;
  dataRegistro?: Date;
}
