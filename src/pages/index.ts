// Root pages
export { default as Login } from './Login';
export { default as Error } from './Error';
export { default as AccessDenied } from './AccessDenied';
export { default as Welcome } from './Welcome';

// Acidente pages
export { default as AcidentePassoUm } from './acidente/AcidentePassoUm';
export { default as AcidentePassoDois } from './acidente/AcidentePassoDois';
export { default as AcidentePassoTres } from './acidente/AcidentePassoTres';
export { default as AcidentePassoQuatro } from './acidente/AcidentePassoQuatro';
export { default as AcidenteGravar } from './acidente/AcidenteGravar';
export { default as PesquisaAcidente } from './acidente/PesquisaAcidente';
export { default as ResultadoPesquisa } from './acidente/ResultadoPesquisa';
export { default as VisualizaAcidente } from './acidente/VisualizaAcidente';

// Administrador pages
export { default as Usuarios } from './administrador/Usuarios';
export { default as Grupos } from './administrador/Grupos';

// Empregador pages
export { default as Empregador } from './empregador/Empregador';
export { default as PesquisaEmpregador } from './empregador/PesquisaEmpregador';

// Fiscalizacao pages
export { default as FiscalizacaoCadastro } from './fiscalizacao/Cadastro';
export { default as FiscalizacoesPage } from './fiscalizacao/Fiscalizacoes';
export { default as CadastroRoteiro } from './fiscalizacao/CadastroRoteiro';
export { default as MedidasCorretivas } from './fiscalizacao/MedidasCorretivas';
export { default as Tramite } from './fiscalizacao/Tramite';

// Investigacao pages
export { default as InvestigacaoCadastro } from './investigacao/Cadastro';
export { default as Depoimentos } from './investigacao/Depoimentos';
export { default as DetalhesInvestigacao } from './investigacao/Detalhes';
export { default as MedidasInvestigacao } from './investigacao/Medidas';

// Parametros pages
// - Acidente
export { default as RamosAtividade } from './parametros/acidente/RamoAtividade';
export { default as LocaisLesao } from './parametros/acidente/LocaisLesao';
export { default as LocalAtendimento } from './parametros/acidente/LocalAtendimento';
export { default as AgenteCausador } from './parametros/acidente/AgenteCausador';
// - Fiscalizacao
export { default as ItensFiscalizacao } from './parametros/fiscalizacao/Itens';
export { default as PontosFiscalizacao } from './parametros/fiscalizacao/Pontos';
export { default as VinculoItemPonto } from './parametros/fiscalizacao/Vinculo';
// - Regionais
export { default as Regional } from './parametros/regionais/Regional';
export { default as TelefonesRegionais } from './parametros/regionais/Telefones';

// Pessoas pages
export { default as PessoaPesquisa } from './pessoas/Pesquisa';
export { default as AgenteSaude } from './pessoas/AgenteSaude';
export { default as CadastroTestemunha } from './pessoas/CadastroTestemunha';
export { default as CadastroRepresentante } from './pessoas/CadastroRepresentante';

// Relatorio pages
export { default as Relatorio } from './relatorios/Parametros'; // Exporting Parametros page as main entry or Relatorio display?
// The App.tsx routes '/parametrosrelatorio' to Pages.Relatorio.
// Previously `src/pages/relatorios/Relatorio.tsx` was the display page.
// `src/pages/relatorios/Parametros.tsx` is the form.
// Let's verify App.tsx usage.
// App.tsx: <Route path="/parametrosrelatorio" element={<Pages.Relatorio />} />
// This suggests Pages.Relatorio should point to the parameters form.
// But we also have a route for the report display?
// Let's check App.tsx again.
export { default as RelatorioDisplay } from './relatorios/Relatorio'; // Renamed to avoid conflict if needed
export { default as RelatorioSalvo } from './relatorios/RelatorioSalvo';
export { default as RelatorioParametros } from './relatorios/Parametros';

// Monitor page
export { default as Monitor } from './monitor/Monitor';
