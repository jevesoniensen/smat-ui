// Exporting modular service instances as named exports to replace DomainServices.ts
export { acidenteService as AcidenteService } from './acidente/AcidenteService';
export { investigacaoService as InvestigacaoService } from './investigacao/InvestigacaoService';
export { fiscalizacaoService as FiscalizacaoService } from './fiscalizacao/FiscalizacaoService';
export { adminService as AdminService } from './administrador/AdminService';
export { adminService as UsuarioService } from './administrador/AdminService';
export { adminService as GrupoService } from './administrador/AdminService';
export { parametrosService as ParametrosService } from './parametros/ParametrosService';
export { relatorioService as RelatorioService } from './relatorio/RelatorioService';
export { pessoasService as PessoasService } from './pessoas/PessoasService';
export { empregadorService as EmpregadorService } from './empregador/EmpregadorService';
export { empregadorService as TipoEmpregadorService } from './empregador/EmpregadorService';
export { pesquisaService as PesquisaService } from './pesquisa/PesquisaService';
export { monitorService as MonitorService } from './monitor/MonitorService';
export { default as AuthService } from './AuthService';
export { apiClient } from './api';
