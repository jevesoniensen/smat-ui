// Exporting modular service instances as named exports to replace DomainServices.ts
export { acidenteService as AcidenteService } from '../smat/acidente/services/AcidenteService';
export { investigacaoService as InvestigacaoService } from '../smat/investigacao/services/InvestigacaoService';
export { fiscalizacaoService as FiscalizacaoService } from '../smat/fiscalizacao/services/FiscalizacaoService';
export { adminService as AdminService } from '../smat/administrador/services/AdminService';
export { adminService as UsuarioService } from '../smat/administrador/services/AdminService';
export { adminService as GrupoService } from '../smat/administrador/services/AdminService';
export { parametrosService as ParametrosService } from '../smat/parametros/services/ParametrosService';
export { relatorioService as RelatorioService } from '../smat/relatorios/services/RelatorioService';
export { pessoasService as PessoasService } from '../smat/pessoas/services/PessoasService';
export { empregadorService as EmpregadorService } from '../smat/empregador/services/EmpregadorService';
export { empregadorService as TipoEmpregadorService } from '../smat/empregador/services/EmpregadorService';
export { monitorService as MonitorService } from '../smat/monitor/services/MonitorService';
export { default as AuthService } from '../smat/home/services/AuthService';
export { apiClient } from './api';
