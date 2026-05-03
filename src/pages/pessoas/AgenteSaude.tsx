import React, { useState, useEffect } from 'react';
import { PessoasService, ParametrosService } from '../../services';
import { AgenteSaude, Estado, Regional } from '../../types/models';

const AgenteSaudePage: React.FC = () => {
  const [agentes, setAgentes] = useState<AgenteSaude[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [regionais, setRegionais] = useState<Regional[]>([]);

  const [form, setForm] = useState<Partial<AgenteSaude>>({
    nome: '',
    email: '',
    estadoId: '',
    regionalId: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [agentesList, estadosList] = await Promise.all([
        PessoasService.listAgentesSaude(),
        ParametrosService.getEstados(),
      ]);
      setAgentes(agentesList);
      setEstados(estadosList);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm({ ...form, estadoId: value, regionalId: '' });

    if (value) {
      setLoading(true);
      try {
        const regionalList = await ParametrosService.getRegionaisByEstado(value);
        setRegionais(regionalList);
      } catch (error) {
        console.error('Error fetching regionais', error);
      } finally {
        setLoading(false);
      }
    } else {
      setRegionais([]);
    }
  };

  const handleSelect = (item: AgenteSaude) => {
    setForm({
        ...item,
        estadoId: item.estadoId,
        regionalId: item.regionalId
    });
    // Trigger regional load if needed, or pre-load
    if (item.estadoId) {
        ParametrosService.getRegionaisByEstado(item.estadoId).then(setRegionais);
    }
  };

  const handleClear = () => {
    setForm({
        id: undefined,
        nome: '',
        email: '',
        estadoId: '',
        regionalId: '',
    });
    setRegionais([]);
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (form.id) {
        await PessoasService.updateAgenteSaude(form.id, form);
        setMessage('Agente de saúde atualizado com sucesso!');
      } else {
        await PessoasService.createAgenteSaude(form as AgenteSaude);
        setMessage('Agente de saúde criado com sucesso!');
      }
      handleClear();
      const list = await PessoasService.listAgentesSaude();
      setAgentes(list);
    } catch (error) {
      setMessage('Erro ao salvar agente de saúde.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await PessoasService.deleteAgenteSaude(form.id);
      setMessage('Agente de saúde excluído com sucesso!');
      handleClear();
      const list = await PessoasService.listAgentesSaude();
      setAgentes(list);
    } catch (error) {
      setMessage('Erro ao excluir agente de saúde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Cadastro de Agentes de Saúde</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Nome <span style={{color:'red'}}>*</span></label>
          <input
            type="text"
            value={form.nome}
            onChange={e => setForm({...form, nome: e.target.value})}
            required
            maxLength={60}
          />
        </div>

        <div className="form-group">
          <label>E-mail <span style={{color:'red'}}>*</span></label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            required
            maxLength={40}
          />
        </div>

        <div className="form-group">
          <label>Estado <span style={{color:'red'}}>*</span></label>
          <select value={form.estadoId} onChange={handleEstadoChange} required>
            <option value="">-- Estados --</option>
            {estados.map(e => <option key={e.id} value={e.id}>{e.sigla}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Regional <span style={{color:'red'}}>*</span></label>
          <select value={form.regionalId} onChange={e => setForm({...form, regionalId: e.target.value})} required>
            <option value="">-- Regionais --</option>
            {regionais.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>GRAVAR</button>
          <button type="button" onClick={handleClear} disabled={loading}>LIMPAR</button>
          <button type="button" onClick={handleDelete} disabled={loading || !form.id}>EXCLUIR</button>
        </div>
      </form>

      <br />

      <table className="table">
        <thead>
          <tr>
            <th>Nº</th>
            <th>Nome</th>
            <th>E-mail</th>
          </tr>
        </thead>
        <tbody>
          {agentes.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} style={{ cursor: 'pointer' }}>
              <td>{item.id}</td>
              <td>{item.nome}</td>
              <td>{item.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgenteSaudePage;
