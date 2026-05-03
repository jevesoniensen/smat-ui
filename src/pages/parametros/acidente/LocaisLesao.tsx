import React, { useState, useEffect } from 'react';
import { ParametrosService } from '../../../services';
import { LocalLesao } from '../../../types/models';

const LocaisLesaoPage: React.FC = () => {
  const [items, setItems] = useState<LocalLesao[]>([]);
  const [parentItems, setParentItems] = useState<LocalLesao[]>([]);
  const [form, setForm] = useState<Partial<LocalLesao>>({
    nome: '',
    // nome in JSP = descricao in Model (assuming mapping)
    // localLesaoPai in JSP = parentId?
  });
  // Custom field for parent selection not in basic model yet
  const [parentId, setParentId] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await ParametrosService.getLocaisLesao();
      setItems(data);
      // Assuming root items have no parent or specific flag?
      // For now, let's assume all can be parents or filter client side if structure known.
      // JSP suggests Level 1 items.
      setParentItems(data); // In reality, filter for level 1
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: LocalLesao) => {
    setForm(item);
    // Logic to set parentId if item has one
    setParentId(''); // Placeholder
  };

  const handleClear = () => {
    setForm({
      id: undefined,
      nome: '',
    });
    setParentId('');
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...form, parentId }; // Assuming API handles parentId
      if (form.id) {
        await ParametrosService.updateLocalLesao(form.id, payload);
        setMessage('Local de lesão atualizado com sucesso!');
      } else {
        await ParametrosService.createLocalLesao(payload);
        setMessage('Local de lesão criado com sucesso!');
      }
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao salvar local de lesão.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await ParametrosService.deleteLocalLesao(form.id);
      setMessage('Local de lesão excluído com sucesso!');
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao excluir local de lesão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Cadastro de locais de lesão</h3>
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
          <label>Nome</label>
          <input
            type="text"
            value={form.nome}
            onChange={e => setForm({...form, nome: e.target.value})}
            required
            maxLength={100}
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
            <th>Local da lesão</th>
            <th>Principal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} style={{ cursor: 'pointer' }}>
              <td>{item.nome}</td>
              <td>{/* Display parent name logic */}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LocaisLesaoPage;
