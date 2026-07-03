import { Routes } from '@angular/router';
import { LoginComponent } from './smat/home/pages/Login';
import { LayoutComponent } from './smat/home/pages/Layout';
import { WelcomeComponent } from './smat/home/pages/Welcome';
import { AccessDeniedComponent } from './smat/home/pages/AccessDenied';
import { ErrorComponent } from './smat/home/pages/Error';
import { AcidentePassoUmComponent } from './smat/acidente/pages/AcidentePassoUm';
import { AcidentePassoDoisComponent } from './smat/acidente/pages/AcidentePassoDois';
import { AcidentePassoTresComponent } from './smat/acidente/pages/AcidentePassoTres';
import { AcidentePassoQuatroComponent } from './smat/acidente/pages/AcidentePassoQuatro';
import { AcidenteGravarComponent } from './smat/acidente/pages/AcidenteGravar';
import { PesquisaAcidenteComponent } from './smat/acidente/pages/PesquisaAcidente';
import { ResultadoPesquisaComponent } from './smat/acidente/pages/ResultadoPesquisa';
import { VisualizaAcidenteComponent } from './smat/acidente/pages/VisualizaAcidente';
import { UsuariosComponent } from './smat/administrador/pages/Usuarios';
import { GruposComponent } from './smat/administrador/pages/Grupos';
import { FiscalizacoesComponent } from './smat/fiscalizacao/pages/Fiscalizacoes';
import { CadastroFiscalizacaoComponent } from './smat/fiscalizacao/pages/Cadastro';
import { CadastroRoteiroComponent } from './smat/fiscalizacao/pages/CadastroRoteiro';
import { MedidasCorretivasComponent } from './smat/fiscalizacao/pages/MedidasCorretivas';
import { TramiteComponent } from './smat/fiscalizacao/pages/Tramite';
import { CadastroInvestigacaoComponent } from './smat/investigacao/pages/Cadastro';
import { PesquisaEmpregadorComponent } from './smat/empregador/pages/PesquisaEmpregador';
import { EmpregadorComponent } from './smat/empregador/pages/Empregador';
import { TelefonesEmpregadorComponent } from './smat/empregador/pages/Telefones';
import { TipoEmpregadorComponent } from './smat/empregador/pages/Tipo';
import { DepoimentosComponent } from './smat/investigacao/pages/Depoimentos';
import { DetalhesInvestigacaoComponent } from './smat/investigacao/pages/Detalhes';
import { MedidasCorretivasInvestigacaoComponent } from './smat/investigacao/pages/MedidasCorretivas';
import { PesquisaPessoaComponent } from './smat/pessoas/pages/Pesquisa';
import { CadastroTestemunhaComponent } from './smat/pessoas/pages/CadastroTestemunha';
import { CadastroRepresentanteComponent } from './smat/pessoas/pages/CadastroRepresentante';
import { RelatorioViewComponent } from './smat/relatorios/pages/Relatorio';
import { ParametrosRelatorioComponent } from './smat/relatorios/pages/Parametros';
import { RelatorioSalvoComponent } from './smat/relatorios/pages/RelatorioSalvo';
import { AgenteSaudeComponent } from './smat/pessoas/pages/AgenteSaude';
import { MonitorComponent } from './smat/monitor/pages/Monitor';
import { AgenteCausadorComponent } from './smat/parametros/pages/acidente/AgenteCausador';
import { PontosFiscalizacaoComponent } from './smat/parametros/pages/fiscalizacao/Pontos';
import { ItensFiscalizacaoComponent } from './smat/parametros/pages/fiscalizacao/Itens';
import { VinculoFiscalizacaoComponent } from './smat/parametros/pages/fiscalizacao/Vinculo';
import { RegionalComponent } from './smat/parametros/pages/regionais/Regional';
import { TelefonesRegionalComponent } from './smat/parametros/pages/regionais/Telefones';
import { LocaisLesaoComponent } from './smat/parametros/pages/acidente/LocaisLesao';
import { LocalAtendimentoComponent } from './smat/parametros/pages/acidente/LocalAtendimento';
import { RamoAtividadeComponent } from './smat/parametros/pages/acidente/RamoAtividade';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'accessdenied', component: AccessDeniedComponent },
  { path: 'error', component: ErrorComponent },
  
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },
      { path: 'welcome', component: WelcomeComponent },

      // Accident Module
      { path: 'acidentepassoum', component: AcidentePassoUmComponent },
      { path: 'acidentepassodois', component: AcidentePassoDoisComponent },
      { path: 'acidentepassotres', component: AcidentePassoTresComponent },
      { path: 'acidentepassoquatro', component: AcidentePassoQuatroComponent },
      { path: 'acidentegravar', component: AcidenteGravarComponent },
      { path: 'pesquisaacidente', component: PesquisaAcidenteComponent },
      { path: 'resultadopesquisa', component: ResultadoPesquisaComponent },
      { path: 'visualizaacidente', component: VisualizaAcidenteComponent },

      // Administrador Module
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'grupos', component: GruposComponent },

      // Empregador Module
      { path: 'empregador', component: EmpregadorComponent },
      { path: 'pesquisaempregador', component: PesquisaEmpregadorComponent },
      { path: 'telefonesempregador', component: TelefonesEmpregadorComponent },
      { path: 'tipoempregador', component: TipoEmpregadorComponent },

      // Fiscalizacao Module
      { path: 'fiscalizacao/cadastro', component: CadastroFiscalizacaoComponent },
      { path: 'fiscalizacoes', component: FiscalizacoesComponent },
      { path: 'fiscalizacao/roteiro', component: CadastroRoteiroComponent },
      { path: 'fiscalizacao/medidas', component: MedidasCorretivasComponent },
      { path: 'fiscalizacao/:id/tramite', component: TramiteComponent },

      // Investigacao Module
      { path: 'investigacao/cadastro', component: CadastroInvestigacaoComponent },
      { path: 'investigacao/depoimentos', component: DepoimentosComponent },
      { path: 'investigacao/:id/detalhes', component: DetalhesInvestigacaoComponent },
      { path: 'investigacao/medidas', component: MedidasCorretivasInvestigacaoComponent },

      // Parametros Module
      { path: 'parametros/acidente/ramosatividade', component: RamoAtividadeComponent },
      { path: 'parametros/acidente/locaislesao', component: LocaisLesaoComponent },
      { path: 'parametros/acidente/localatendimento', component: LocalAtendimentoComponent },
      { path: 'parametros/acidente/agentecausador', component: AgenteCausadorComponent },

      { path: 'parametros/fiscalizacao/itens', component: ItensFiscalizacaoComponent },
      { path: 'parametros/fiscalizacao/pontos', component: PontosFiscalizacaoComponent },
      { path: 'parametros/fiscalizacao/vinculo', component: VinculoFiscalizacaoComponent },

      { path: 'parametros/regionais/regional', component: RegionalComponent },
      { path: 'parametros/regionais/telefones', component: TelefonesRegionalComponent },

      // Pessoas Module
      { path: 'pessoas/pesquisa', component: PesquisaPessoaComponent },
      { path: 'pessoas/agentesaude', component: AgenteSaudeComponent },
      { path: 'pessoas/cadastrotestemunha', component: CadastroTestemunhaComponent },
      { path: 'pessoas/cadastrorepresentante', component: CadastroRepresentanteComponent },

      // Relatorios Module
      { path: 'parametrosrelatorio', component: ParametrosRelatorioComponent },
      { path: 'relatorios/relatorio', component: RelatorioViewComponent },
      { path: 'relatorios/salvos', component: RelatorioSalvoComponent },

      // Monitor Module
      { path: 'monitor', component: MonitorComponent }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
