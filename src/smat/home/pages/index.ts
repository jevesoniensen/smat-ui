// Root pages
export { default as Login } from './Login';
export { default as Error } from './Error';
export { default as AccessDenied } from './AccessDenied';
export { default as Welcome } from './Welcome';

// Acidente pages
export { default as AcidentePassoUm } from '../../acidente/pages/AcidentePassoUm';
export { default as AcidentePassoDois } from '../../acidente/pages/AcidentePassoDois';
export { default as AcidentePassoTres } from '../../acidente/pages/AcidentePassoTres';
export { default as AcidentePassoQuatro } from '../../acidente/pages/AcidentePassoQuatro';
export { default as AcidenteGravar } from '../../acidente/pages/AcidenteGravar';
export { default as PesquisaAcidente } from '../../acidente/pages/PesquisaAcidente';
export { default as ResultadoPesquisa } from '../../acidente/pages/ResultadoPesquisa';
export { default as VisualizaAcidente } from '../../acidente/pages/VisualizaAcidente';

// Administrador pages
export { default as Usuarios } from '../../administrador/pages/Usuarios';
export { default as Grupos } from '../../administrador/pages/Grupos';

// Empregador pages
export { default as Empregador } from '../../empregador/pages/Empregador';
export { default as PesquisaEmpregador } from '../../empregador/pages/PesquisaEmpregador';
export { default as Telefones } from '../../empregador/pages/Telefones';
export { default as Tipo } from '../../empregador/pages/Tipo';

// Fiscalizacao pages
export { default as FiscalizacaoCadastro } from '../../fiscalizacao/pages/Cadastro';
export { default as FiscalizacoesPage } from '../../fiscalizacao/pages/Fiscalizacoes';
export { default as CadastroRoteiro } from '../../fiscalizacao/pages/CadastroRoteiro';
export { default as MedidasCorretivas } from '../../fiscalizacao/pages/MedidasCorretivas';
export { default as Tramite } from '../../fiscalizacao/pages/Tramite';

// Investigacao pages
export { default as InvestigacaoCadastro } from '../../investigacao/pages/Cadastro';
export { default as Depoimentos } from '../../investigacao/pages/Depoimentos';
export { default as DetalhesInvestigacao } from '../../investigacao/pages/Detalhes';
export { default as MedidasInvestigacao } from '../../investigacao/pages/Medidas';

// Parametros pages
// - Acidente
export { default as RamosAtividade } from '../../parametros/pages/acidente/RamoAtividade';
export { default as LocaisLesao } from '../../parametros/pages/acidente/LocaisLesao';
export { default as LocalAtendimento } from '../../parametros/pages/acidente/LocalAtendimento';
export { default as AgenteCausador } from '../../parametros/pages/acidente/AgenteCausador';
// - Fiscalizacao
export { default as ItensFiscalizacao } from '../../parametros/pages/fiscalizacao/Itens';
export { default as PontosFiscalizacao } from '../../parametros/pages/fiscalizacao/Pontos';
export { default as VinculoItemPonto } from '../../parametros/pages/fiscalizacao/Vinculo';
// - Regionais
export { default as Regional } from '../../parametros/pages/regionais/Regional';
export { default as TelefonesRegionais } from '../../parametros/pages/regionais/Telefones';

// Pessoas pages
export { default as PessoaPesquisa } from '../../pessoas/pages/Pesquisa';
export { default as AgenteSaude } from '../../pessoas/pages/AgenteSaude';
export { default as CadastroTestemunha } from '../../pessoas/pages/CadastroTestemunha';
export { default as CadastroRepresentante } from '../../pessoas/pages/CadastroRepresentante';

// Relatorio pages
export { default as Relatorio } from '../../relatorios/pages/Parametros'; // Exporting Parametros page as main entry or Relatorio display?
// The App.tsx routes '/parametrosrelatorio' to Pages.Relatorio.
// Previously `src/pages/relatorios/Relatorio.tsx` was the display page.
// `src/pages/relatorios/Parametros.tsx` is the form.
// Let's verify App.tsx usage.
// App.tsx: <Route path="/parametrosrelatorio" element={<Pages.Relatorio />} />
// This suggests Pages.Relatorio should point to the parameters form.
// But we also have a route for the report display?
// Let's check App.tsx again.
export { default as RelatorioDisplay } from '../../relatorios/pages/Relatorio'; // Renamed to avoid conflict if needed
export { default as RelatorioSalvo } from '../../relatorios/pages/RelatorioSalvo';
export { default as RelatorioParametros } from '../../relatorios/pages/Parametros';

// Monitor page
export { default as Monitor } from '../../monitor/pages/Monitor';
