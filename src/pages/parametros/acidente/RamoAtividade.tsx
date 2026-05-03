import React, { useState, useEffect } from 'react';
import { ParametrosService } from '../../../services';
import { RamoAtividade } from '../../../types/models';

const RamoAtividadePage: React.FC = () => {
  const [items, setItems] = useState<RamoAtividade[]>([]);
  const [parentItems, setParentItems] = useState<RamoAtividade[]>([]);
  const [form, setForm] = useState<Partial<RamoAtividade>>({
    nome: '', // JSP 'nome'
    cnae: '', // JSP 'cnae'
  });
  const [parentId, setParentId] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await ParametrosService.getRamosAtividade();
      setItems(data);
      // Filter for potential parents (e.g., those without a parent or specific level logic)
      // For now, assuming all can be parents or filtering client-side
      setParentItems(data);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: RamoAtividade) => {
    setForm(item);
    setParentId(item.ramoSuperior || '');
  };

  const handleClear = () => {
    setForm({
      id: undefined,
      nome: '',
      cnae: '',
    });
    setParentId('');
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...form, superiorId: parentId };
      if (form.id) {
        await ParametrosService.updateRamoAtividade(form.id, payload);
        setMessage('Ramo de atividade atualizado com sucesso!');
      } else {
        await ParametrosService.createRamoAtividade(payload);
        setMessage('Ramo de atividade criado com sucesso!');
      }
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao salvar ramo de atividade.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await ParametrosService.deleteRamoAtividade(form.id);
      setMessage('Ramo de atividade excluído com sucesso!');
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao excluir ramo de atividade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Cadastro de Ramos de atividade</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Nível</label>
          <select value={parentId} onChange={e => setParentId(e.target.value)} disabled={!!form.id}>
            <option value="">-- Nível 1 --</option>
            {parentItems.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Nome <span style={{color:'red'}}>*</span></label>
          <input
            type="text"
            value={form.nome}
            onChange={e => setForm({...form, nome: e.target.value})}
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>CNAE</label>
          <input
            type="text"
            value={form.cnae}
            onChange={e => setForm({...form, cnae: e.target.value})}
            maxLength={5}
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
            <th>Área de atuação</th>
            <th>Ramo de atividade</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} style={{ cursor: 'pointer' }}>
              <td>{item.nome}</td>
              {/* Display parent name. Need to lookup in parentItems */}
              <td>{parentItems.find(p => p.id === item.ramoSuperior)?.nome || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RamoAtividadePage;
