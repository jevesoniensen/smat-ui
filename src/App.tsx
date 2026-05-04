/**
 * Main App Component
 * SMAT UI - Migrated from Apache Struts to React TypeScript
 * Sets up routing and context providers
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import * as Pages from './smat/home/pages';
import './App.css';

// Route Guard Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Pages.Login />} />
      <Route path="/accessdenied" element={<Pages.AccessDenied />} />
      <Route path="/error" element={<Pages.Error />} />

      {/* Protected Routes within Main Layout */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Pages.Welcome />} />

        {/* Accident Module */}
        <Route path="/acidentepassoum" element={<Pages.AcidentePassoUm />} />
        <Route path="/acidentepassodois" element={<Pages.AcidentePassoDois />} />
        <Route path="/acidentepassotres" element={<Pages.AcidentePassoTres />} />
        <Route path="/acidentepassoquatro" element={<Pages.AcidentePassoQuatro />} />
        <Route path="/acidentegravar" element={<Pages.AcidenteGravar />} />
        <Route path="/pesquisaacidente" element={<Pages.PesquisaAcidente />} />
        <Route path="/resultadopesquisa" element={<Pages.ResultadoPesquisa />} />
        <Route path="/visualizaacidente" element={<Pages.VisualizaAcidente />} />

        {/* Administrador Module */}
        <Route path="/usuarios" element={<Pages.Usuarios />} />
        <Route path="/grupos" element={<Pages.Grupos />} />

        {/* Empregador Module */}
        <Route path="/empregador" element={<Pages.Empregador />} />
        <Route path="/pesquisaempregador" element={<Pages.PesquisaEmpregador />} />

        {/* Fiscalizacao Module */}
        <Route path="/fiscalizacao/cadastro" element={<Pages.FiscalizacaoCadastro />} />
        <Route path="/fiscalizacoes" element={<Pages.FiscalizacoesPage />} />
        <Route path="/fiscalizacao/roteiro" element={<Pages.CadastroRoteiro />} />
        <Route path="/fiscalizacao/medidas" element={<Pages.MedidasCorretivas />} />
        <Route path="/fiscalizacao/:id/tramite" element={<Pages.Tramite />} />

        {/* Investigacao Module */}
        <Route path="/investigacao/cadastro" element={<Pages.InvestigacaoCadastro />} />
        <Route path="/investigacao/depoimentos" element={<Pages.Depoimentos />} />
        <Route path="/investigacao/:id/detalhes" element={<Pages.DetalhesInvestigacao />} />
        <Route path="/investigacao/medidas" element={<Pages.MedidasInvestigacao />} />

        {/* Parametros Module */}
        <Route path="/parametros/acidente/ramosatividade" element={<Pages.RamosAtividade />} />
        <Route path="/parametros/acidente/locaislesao" element={<Pages.LocaisLesao />} />
        <Route path="/parametros/acidente/localatendimento" element={<Pages.LocalAtendimento />} />
        <Route path="/parametros/acidente/agentecausador" element={<Pages.AgenteCausador />} />

        <Route path="/parametros/fiscalizacao/itens" element={<Pages.ItensFiscalizacao />} />
        <Route path="/parametros/fiscalizacao/pontos" element={<Pages.PontosFiscalizacao />} />
        <Route path="/parametros/fiscalizacao/vinculo" element={<Pages.VinculoItemPonto />} />

        <Route path="/parametros/regionais/regional" element={<Pages.Regional />} />
        <Route path="/parametros/regionais/telefones" element={<Pages.TelefonesRegionais />} />

        {/* Pessoas Module */}
        <Route path="/pessoas/pesquisa" element={<Pages.PessoaPesquisa />} />
        <Route path="/pessoas/agentesaude" element={<Pages.AgenteSaude />} />
        <Route path="/pessoas/cadastrotestemunha" element={<Pages.CadastroTestemunha />} />
        <Route path="/pessoas/cadastrorepresentante" element={<Pages.CadastroRepresentante />} />

        {/* Relatorios Module */}
        <Route path="/parametrosrelatorio" element={<Pages.Relatorio />} /> {/* Input Form */}
        <Route path="/relatorios/relatorio" element={<Pages.RelatorioDisplay />} /> {/* Output */}
        <Route path="/relatorios/salvos" element={<Pages.RelatorioSalvo />} />

        {/* Monitor Module */}
        <Route path="/monitor" element={<Pages.Monitor />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <SessionProvider>
      <Router>
        <AppRoutes />
      </Router>
    </SessionProvider>
  );
};

export default App;
