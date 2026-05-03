import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiscalizacaoService, PessoasService } from '../../services';
import { Fiscalizacao, AgenteSaude, Empregador } from '../../types/models';

const CadastroFiscalizacao: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [agentesSaude, setAgentesSaude] = useState<AgenteSaude[]>([]);
  const [selectedEmpregador, setSelectedEmpregador] = useState<Empregador | null>(null);

  const [form, setForm] = useState<Partial<Fiscalizacao>>({
    titulo: '',
    obsGerais: '',
    dataFiscalizacao: undefined, // Will handle as string for input
  });
  const [dataAberturaStr, setDataAberturaStr] = useState(''); // Separate state for date input string
  const [agenteSaudeId, setAgenteSaudeId] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check for returned employer from search
  useEffect(() => {
    if (location.state?.selectedEmpregador) {
      setSelectedEmpregador(location.state.selectedEmpregador);
      // Preserve other form state if we navigated away and back?
      // Ideally we should have kept form state in global or location state, but for now simple return
    }
  }, [location.state]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const agentes = await PessoasService.listAgentesSaude();
      setAgentesSaude(agentes);
    } catch (error) {
      setMessage('Erro ao carregar agentes de saúde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchEmpregador = () => {
    // Navigate to employer search, passing current path as return destination
    navigate('/pesquisaempregador', { state: { returnPath: '/fiscalizacao/cadastro' } });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpregador) {
        setMessage('Selecione um empregador.');
        return;
    }
    setLoading(true);
    try {
      // Construct payload
      const payload: any = {
          ...form,
          empregador: selectedEmpregador,
          // fiscal: ... derive from current user or session
          // dataFiscalizacao: parse dataAberturaStr
      };

      if (form.id) {
        await FiscalizacaoService.updateFiscalizacao(form.id, payload);
        setMessage('Fiscalização atualizada com sucesso!');
      } else {
        const created = await FiscalizacaoService.createFiscalizacao(payload);
        setForm(created); // Update form with ID
        setMessage('Fiscalização cadastrada com sucesso!');
      }
    } catch (error) {
      setMessage('Erro ao salvar fiscalização.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await FiscalizacaoService.deleteFiscalizacao(form.id);
      setMessage('Fiscalização excluída com sucesso!');
      handleClear();
    } catch (error) {
      setMessage('Erro ao excluir fiscalização.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
        titulo: '',
        obsGerais: '',
    });
    setDataAberturaStr('');
    setSelectedEmpregador(null);
    setAgenteSaudeId('');
    setMessage('');
  };

  const handleDetails = () => {
      if (form.id) {
          // Navigate to details/items page
          navigate(`/fiscalizacao/${form.id}/detalhes`); // Assuming route structure
      } else {
          setMessage('Salve a fiscalização antes de acessar os detalhes.');
      }
  };

  return (
    <div className="container">
      <h3>Cadastro de Fiscalização de Acidentes</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        {form.id && <input type="hidden" value={form.id} />}

        <div className="form-group">
          <label>Agente de saúde</label>
          <select
            value={agenteSaudeId}
            onChange={e => setAgenteSaudeId(e.target.value)}
          >
            <option value="">-- Agente de Saude --</option>
            {agentesSaude.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </div>

        <div className="form-group">
            <label>Empregador</label>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={selectedEmpregador?.documento || ''}
                    readOnly
                    disabled
                    placeholder="Documento"
                    style={{ width: '150px' }}
                />
                <input
                    type="text"
                    value={selectedEmpregador?.razaoSocial || ''}
                    readOnly
                    disabled
                    placeholder="Razão Social"
                    style={{ flex: 1 }}
                />
                <button type="button" onClick={handleSearchEmpregador}>PESQUISAR</button>
            </div>
            <span style={{color:'red'}}>*</span>
        </div>

        <div className="form-group">
            <label>Data de abertura <span style={{color:'red'}}>*</span></label>
            <input
                type="text"
                value={dataAberturaStr}
                onChange={e => setDataAberturaStr(e.target.value)}
                placeholder="dd/mm/aaaa"
                maxLength={10}
            />
        </div>

        <div className="form-group">
            <label>Titulo <span style={{color:'red'}}>*</span></label>
            <input
                type="text"
                value={form.titulo}
                onChange={e => setForm({...form, titulo: e.target.value})}
                maxLength={100}
            />
        </div>

        <div className="form-group">
            <label>Observações <span style={{color:'red'}}>*</span></label>
            <textarea
                rows={7}
                value={form.obsGerais}
                onChange={e => setForm({...form, obsGerais: e.target.value})}
            />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>GRAVAR</button>
          <button type="button" onClick={handleDetails} disabled={loading || !form.id}>DETALHES</button>
          <button type="button" onClick={handleClear} disabled={loading}>LIMPAR</button>
          <button type="button" onClick={handleDelete} disabled={loading || !form.id}>EXCLUIR</button>
        </div>
      </form>
    </div>
  );
};

export default CadastroFiscalizacao;
