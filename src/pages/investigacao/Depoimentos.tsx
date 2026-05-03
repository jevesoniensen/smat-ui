import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InvestigacaoService, ParametrosService } from '../../services';
import { Depoimento, TipoDepoimento, AgenteCausador } from '../../types/models';

const DepoimentosPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { investigacaoId } = location.state || {};

  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [tiposDepoimento, setTiposDepoimento] = useState<TipoDepoimento[]>([]);
  const [agentesCausadores, setAgentesCausadores] = useState<AgenteCausador[]>([]);

  // Local state for form
  const [form, setForm] = useState<Partial<Depoimento>>({
    dataDepoimento: undefined, // Handle as string or Date
    relato: '',
    tipoDepoimentoId: '',
    agenteCausadorId: '',
    // And for display/selection of person:
    // The JSP uses 'nomePessoa' which is readonly, populated by PESQUISAR
    // We need to store the selected person object/ID
    pessoaId: '',
  });
  const [nomePessoa, setNomePessoa] = useState('');
  const [dataHoraStr, setDataHoraStr] = useState(''); // dd/mm/yyyy hh:mm

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle return from person search
  useEffect(() => {
    if (location.state?.selectedPessoa) {
      const p = location.state.selectedPessoa;
      setForm(prev => ({ ...prev, pessoaId: p.id }));
      setNomePessoa(p.nome);
    }
  }, [location.state]);

  useEffect(() => {
    if (!investigacaoId) {
      setMessage('Contexto de investigação não encontrado.');
      return;
    }
    fetchInitialData();
  }, [investigacaoId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [deps, tipos, agentes] = await Promise.all([
        InvestigacaoService.getDepoimentos(investigacaoId),
        ParametrosService.getTiposDepoimento(),
        ParametrosService.getAgentesCausadores(),
      ]);
      setDepoimentos(deps);
      setTiposDepoimento(tipos);
      setAgentesCausadores(agentes);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPerson = () => {
    navigate('/pessoas/pesquisa', { state: { returnPath: '/investigacao/depoimentos', investigacaoId } });
  };

  const handleSelect = (item: Depoimento) => {
    setSelectedId(item.id);
    setForm({
        ...item,
        tipoDepoimentoId: item.tipoDepoimentoId, // Assuming model has it
        agenteCausadorId: item.agenteCausadorId, // Assuming model has it
    });
    setNomePessoa(item.testemunha?.nome || ''); // Assuming testimonha holds name
    setDataHoraStr(new Date(item.dataDepoimento).toLocaleString()); // Simple formatting
    // Would need logic to set cascading dropdowns based on saved ID
  };

  const handleClear = () => {
    setSelectedId(undefined);
    setForm({
        relato: '',
        tipoDepoimentoId: '',
        agenteCausadorId: '',
        pessoaId: '',
    });
    setNomePessoa('');
    setDataHoraStr('');
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Parse date/time string to Date object
      // ... date parsing logic
      const payload: any = {
          ...form,
          // dataDepoimento: parsedDate
      };

      if (selectedId) {
        await InvestigacaoService.updateDepoimento(investigacaoId, selectedId, payload);
        setMessage('Depoimento atualizado com sucesso!');
      } else {
        await InvestigacaoService.addDepoimento(investigacaoId, payload);
        setMessage('Depoimento adicionado com sucesso!');
      }
      handleClear();
      const deps = await InvestigacaoService.getDepoimentos(investigacaoId);
      setDepoimentos(deps);
    } catch (error) {
      setMessage('Erro ao salvar depoimento.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      await InvestigacaoService.deleteDepoimento(investigacaoId, selectedId);
      setMessage('Depoimento excluído com sucesso!');
      handleClear();
      const deps = await InvestigacaoService.getDepoimentos(investigacaoId);
      setDepoimentos(deps);
    } catch (error) {
      setMessage('Erro ao excluir depoimento.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    navigate(-1);
  };

  if (!investigacaoId) {
      return <div className="container"><div className="alert error">{message}</div><button onClick={handleReturn}>Voltar</button></div>;
  }

  return (
    <div className="container">
      <h3>Cadastro de Depoimentos</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
            <label>Data e Hora <span style={{color:'red'}}>*</span></label>
            <input
                type="text"
                value={dataHoraStr}
                onChange={e => setDataHoraStr(e.target.value)}
                placeholder="dd/mm/aaaa hh:mm"
            />
        </div>

        <div className="form-group">
            <label>Tipo de testemunha <span style={{color:'red'}}>*</span></label>
            <select
                value={form.tipoDepoimentoId}
                onChange={e => setForm({...form, tipoDepoimentoId: e.target.value})}
                required
            >
                <option value="">-- Tipo de testemunha --</option>
                {tiposDepoimento.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
        </div>

        <div className="form-group">
            <label>Nome <span style={{color:'red'}}>*</span></label>
            <div style={{display: 'flex', gap: '10px'}}>
                <input type="text" value={nomePessoa} readOnly disabled style={{flex: 1}} />
                <button type="button" onClick={handleSearchPerson}>PESQUISAR</button>
            </div>
        </div>

        <div className="form-group">
            <label>Depoimento</label>
            <textarea
                rows={5}
                value={form.relato}
                onChange={e => setForm({...form, relato: e.target.value})}
            />
        </div>

        {/* Simplified Agente Causador selection for now - ideally cascading */}
        <div className="form-group">
            <label>Agente Causador</label>
            <select
                value={form.agenteCausadorId}
                onChange={e => setForm({...form, agenteCausadorId: e.target.value})}
            >
                <option value="">-- Agente Causador --</option>
                {agentesCausadores.map(a => <option key={a.id} value={a.id}>{a.descricao}</option>)}
            </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleReturn}>RETORNAR</button>
          <button type="submit" disabled={loading}>GRAVAR</button>
          <button type="button" onClick={handleClear} disabled={loading}>LIMPAR</button>
          <button type="button" onClick={handleDelete} disabled={loading || !selectedId}>EXCLUIR</button>
        </div>
      </form>

      <br />

      <table className="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Nome</th>
          </tr>
        </thead>
        <tbody>
          {depoimentos.map((d) => (
            <tr key={d.id} onClick={() => handleSelect(d)} style={{ cursor: 'pointer' }}>
              <td>{new Date(d.dataDepoimento).toLocaleString()}</td>
              <td>{d.tipo}</td>
              <td>{d.testemunha?.nome}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DepoimentosPage;
