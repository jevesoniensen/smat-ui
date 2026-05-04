import React, { useState, useEffect } from 'react';
import { ParametrosService } from '../../../index';
import { AgenteCausador } from '../../../../types/models';

const AgenteCausadorPage: React.FC = () => {
  const [items, setItems] = useState<AgenteCausador[]>([]);
  // Assuming 3 levels: Vo -> Pai -> Child (the one being edited/created)
  // Or maybe just 2 levels of parents?
  // JSP has `agenteCausadorVo` (Level 1) and `agenteCausadorPai` (Level 2).
  // This implies the item being created is Level 3? Or can be any level?
  // Typically:
  // If Vo=0, Pai=0 -> creating Level 1.
  // If Vo=X, Pai=0 -> creating Level 2 (child of X).
  // If Vo=X, Pai=Y -> creating Level 3 (child of Y).

  const [level1Items, setLevel1Items] = useState<AgenteCausador[]>([]);
  const [level2Items /*, setLevel2Items*/] = useState<AgenteCausador[]>([]);

  const [form, setForm] = useState<Partial<AgenteCausador>>({
    descricao: '', // JSP 'nome'
    // 'descricao' in JSP is confusingly another field.
    // Model 'AgenteCausador' has 'descricao' and 'categoria'?
    // Let's check model.
    // export interface AgenteCausador { id: string; descricao: string; categoria: string; }
    // We might need to map 'nome' -> 'descricao' and 'descricao' -> 'categoria' or 'obs'?
    // Let's assume 'nome' -> 'descricao'.
  });

  // Custom fields not in model yet
  const [voId, setVoId] = useState('');
  const [paiId, setPaiId] = useState('');
  const [obs, setObs] = useState(''); // JSP 'descricao' textarea

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await ParametrosService.getAgentesCausadores();
      setItems(data);
      // Filter logic would be needed here to separate levels.
      // For now, populate Level 1 with all (mock)
      setLevel1Items(data);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoChange = (val: string) => {
      setVoId(val);
      setPaiId('');
      // Filter level 2 items based on Vo
      // setLevel2Items(...)
  };

  const handleSelect = (item: AgenteCausador) => {
    setForm(item);
    // Logic to find and set Vo/Pai IDs based on item hierarchy
  };

  const handleClear = () => {
    setForm({
      id: undefined,
      descricao: '',
    });
    setVoId('');
    setPaiId('');
    setObs('');
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...form, voId, paiId, obs };
      if (form.id) {
        await ParametrosService.updateAgenteCausador(form.id, payload);
        setMessage('Agente causador atualizado com sucesso!');
      } else {
        await ParametrosService.createAgenteCausador(payload);
        setMessage('Agente causador criado com sucesso!');
      }
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao salvar agente causador.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await ParametrosService.deleteAgenteCausador(form.id);
      setMessage('Agente causador excluído com sucesso!');
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao excluir agente causador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Cadastro de Agentes Causadores</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Nível 1</label>
          <select value={voId} onChange={e => handleVoChange(e.target.value)} disabled={!!form.id}>
            <option value="">-- Nível 1 --</option>
            {level1Items.map(p => (
                <option key={p.id} value={p.id}>{p.descricao}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Nível 2</label>
          <select value={paiId} onChange={e => setPaiId(e.target.value)} disabled={!!form.id || !voId}>
            <option value="">-- Nível 2 --</option>
            {level2Items.map(p => (
                <option key={p.id} value={p.id}>{p.descricao}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Agente causador <span style={{color:'red'}}>*</span></label>
          <input
            type="text"
            value={form.descricao}
            onChange={e => setForm({...form, descricao: e.target.value})}
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea
            rows={5}
            value={obs}
            onChange={e => setObs(e.target.value)}
          />
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
            <th>Agente causador</th>
            <th>Tipo de agente causador</th>
            <th>Causa do acidente</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} style={{ cursor: 'pointer' }}>
              <td>{item.descricao}</td>
              <td>{/* Level 2 Name */}</td>
              <td>{/* Level 1 Name */}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgenteCausadorPage;
