import React, { useState, useEffect } from 'react';
import { ParametrosService } from '../../../index';
import { ItemFiscalizacao } from '../../../../types/models';

const ItensFiscalizacaoPage: React.FC = () => {
  const [items, setItems] = useState<ItemFiscalizacao[]>([]);
  const [form, setForm] = useState<Partial<ItemFiscalizacao>>({
    descricao: '',
    normaRelacionada: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await ParametrosService.getItensFiscalizacao();
      setItems(data);
    } catch (error) {
      setMessage('Erro ao carregar itens de fiscalização.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: ItemFiscalizacao) => {
    setForm(item);
  };

  const handleClear = () => {
    setForm({
      id: undefined,
      descricao: '',
      normaRelacionada: '',
    });
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (form.id) {
        await ParametrosService.updateItemFiscalizacao(form.id, form);
        setMessage('Item atualizado com sucesso!');
      } else {
        await ParametrosService.createItemFiscalizacao(form as ItemFiscalizacao);
        setMessage('Item criado com sucesso!');
      }
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao salvar item.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await ParametrosService.deleteItemFiscalizacao(form.id);
      setMessage('Item excluído com sucesso!');
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao excluir item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Cadastro de Itens de Fiscalização</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        {form.id && (
            <div className="form-group">
                <label>ID</label>
                <input type="text" value={form.id} disabled />
            </div>
        )}
        <div className="form-group">
          <label>Descrição <span style={{color:'red'}}>*</span></label>
          <input
            type="text"
            value={form.descricao}
            onChange={e => setForm({...form, descricao: e.target.value})}
            required
            maxLength={255}
          />
        </div>

        <div className="form-group">
          <label>Norma Relacionada</label>
          <input
            type="text"
            value={form.normaRelacionada}
            onChange={e => setForm({...form, normaRelacionada: e.target.value})}
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
            <th>Descrição</th>
            <th>Norma Relacionada</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} style={{ cursor: 'pointer' }}>
              <td>{item.descricao}</td>
              <td>{item.normaRelacionada}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItensFiscalizacaoPage;
