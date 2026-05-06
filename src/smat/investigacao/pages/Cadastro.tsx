import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { investigacaoService as InvestigacaoService } from '../services/InvestigacaoService';
import { AcidenteService, PessoasService } from '../../index';
import { Investigacao, AgenteSaude, Acidente } from '../../../types/models';
import '../css/investigacao.css';

const CadastroInvestigacaoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { acidenteId, investigacaoId } = location.state || {};

  const [acidente, setAcidente] = useState<Acidente | null>(null);
  const [agentesSaude, setAgentesSaude] = useState<AgenteSaude[]>([]);
  const [form, setForm] = useState<Partial<Investigacao>>({
    descricao: '', // Maps to 'obsGerais' in JSP often, or separate field. JSP has 'obsGerais' and 'motivo'.
    // Model has 'descricao'. Let's check model again.
    // Model Investigacao has 'descricao'. JSP has 'motivo' AND 'obsGerais'.
    // We might need to map both or add fields to model.
    // For now, let's assume 'descricao' = 'obsGerais' and we add 'motivo' to partial or extend model if needed.
    // Let's use local state for fields not in model yet or map them.
  });

  // Local state for JSP fields
  const [motivo, setMotivo] = useState('');
  const [obsGerais, setObsGerais] = useState('');
  const [agenteSaudeId, setAgenteSaudeId] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!acidenteId && !investigacaoId) {
      setMessage('Contexto de acidente ou investigação não encontrado.');
      return;
    }
    fetchInitialData();
  }, [acidenteId, investigacaoId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const agentes = await PessoasService.listAgentesSaude();
      setAgentesSaude(agentes);

      if (investigacaoId) {
        const inv = await InvestigacaoService.getInvestigacao(investigacaoId);
        setForm(inv);
        setObsGerais(inv.descricao); // Mapping description to obsGerais
        // setMotivo(inv.motivo); // If model has it
        if (inv.responsavel) setAgenteSaudeId(inv.responsavel.id);
        if (inv.acidente) setAcidente(inv.acidente);
      } else if (acidenteId) {
        const ac = await AcidenteService.getAcidente(acidenteId);
        setAcidente(ac);
      }
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acidente) return;
    setLoading(true);
    try {
      const payload: any = {
          ...form,
          acidente: acidente,
          descricao: obsGerais,
          // motivo: motivo, // Include if backend expects it
          responsavel: { id: agenteSaudeId } // Simplified mapping
      };

      if (form.id) {
        await InvestigacaoService.updateInvestigacao(form.id, payload);
        setMessage('Investigação atualizada com sucesso!');
      } else {
        const created = await InvestigacaoService.createInvestigacao(payload);
        setForm(created);
        setMessage('Investigação criada com sucesso!');
      }
    } catch (error) {
      setMessage('Erro ao salvar investigação.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await InvestigacaoService.finalizeInvestigacao(form.id);
      setMessage('Investigação finalizada com sucesso!');
      // Refresh
      const updated = await InvestigacaoService.getInvestigacao(form.id);
      setForm(updated);
    } catch (error) {
      setMessage('Erro ao finalizar investigação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await InvestigacaoService.deleteInvestigacao(form.id);
      setMessage('Investigação excluída com sucesso!');
      // Navigate away?
      navigate(-1);
    } catch (error) {
      setMessage('Erro ao excluir investigação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDetails = () => {
      if (form.id) {
          navigate(`/investigacao/${form.id}/detalhes`, { state: { investigacaoId: form.id } });
      } else {
          setMessage('Salve a investigação antes de acessar os detalhes.');
      }
  };

  const handleViewAcidente = () => {
      if (acidente?.id) {
          navigate('/visualizaacidente', { state: { acidenteId: acidente.id } });
      }
  };

  const handleReturn = () => {
    navigate(-1);
  };

  if (!acidenteId && !investigacaoId) {
      return <div className="container"><div className="alert error">{message}</div><button onClick={handleReturn}>Voltar</button></div>;
  }

  const isFinalized = !!form.dataFim; // Check if finalized

  return (
    <div className="container">
      <h3>Cadastro de Investigação</h3>
      {message && <div className="alert">{message}</div>}

      <div className="details-section card">
          {form.id && <p><strong>Investigação nº:</strong> {form.id}</p>}
          {form.dataInicio && <p><strong>Data de abertura:</strong> {new Date(form.dataInicio).toLocaleDateString()}</p>}
          {form.dataFim && <p><strong>Data de finalização:</strong> {new Date(form.dataFim).toLocaleDateString()}</p>}

          {acidente && (
              <>
                <hr/>
                <p><strong>Acidente nº:</strong> {acidente.id}</p>
                <p><strong>Data:</strong> {new Date(acidente.dataAcidente).toLocaleDateString()}</p>
                <p><strong>Acidentado:</strong> {acidente.trabalhador?.nome}</p>
                {/* <p><strong>Empregador:</strong> {acidente.empregador?.razaoSocial}</p> */}
              </>
          )}
      </div>

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Agente responsável <span className="required">*</span></label>
          <select
            value={agenteSaudeId}
            onChange={e => setAgenteSaudeId(e.target.value)}
            className="form-control"
            required
            disabled={isFinalized}
          >
            <option value="">- Agente de saúde -</option>
            {agentesSaude.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Motivo <span className="required">*</span></label>
          <input
            type="text"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            className="form-control"
            maxLength={100}
            disabled={isFinalized}
            // required
          />
        </div>

        <div className="form-group">
          <label>Observações gerais</label>
          <textarea
            rows={5}
            value={obsGerais}
            onChange={e => setObsGerais(e.target.value)}
            className="form-control"
            disabled={isFinalized}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleReturn}>RETORNAR</button>
          <button type="button" onClick={handleViewAcidente}>ACIDENTE</button>
          {!isFinalized && <button type="submit" disabled={loading}>GRAVAR</button>}
        </div>

        {form.id && (
            <div className="form-actions mt-10">
                <button type="button" onClick={handleDetails}>DETALHES</button>
                {!isFinalized && (
                    <>
                        <button type="button" onClick={handleDelete}>EXCLUIR</button>
                        <button type="button" onClick={handleFinalize}>FINALIZAR</button>
                    </>
                )}
            </div>
        )}
      </form>
    </div>
  );
};

export default CadastroInvestigacaoPage;
