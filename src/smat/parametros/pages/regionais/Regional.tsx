import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParametrosService } from '../../../index';
import { Regional } from '../../../../types/models';

const RegionalPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Regional[]>([]);
  const [form, setForm] = useState<Partial<Regional>>({
    nome: '',
    endereco: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await ParametrosService.getRegionais();
      setItems(data);
    } catch (error) {
      setMessage('Erro ao carregar regionais.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: Regional) => {
    setForm(item);
  };

  const handleClear = () => {
    setForm({
      id: undefined,
      nome: '',
      endereco: '',
    });
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (form.id) {
        await ParametrosService.updateRegional(form.id, form);
        setMessage('Regional atualizada com sucesso!');
      } else {
        await ParametrosService.createRegional(form as Regional);
        setMessage('Regional criada com sucesso!');
      }
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao salvar regional.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await ParametrosService.deleteRegional(form.id);
      setMessage('Regional excluída com sucesso!');
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao excluir regional.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageTelefones = (regionalId: string) => {
      navigate(`/parametros/regionais/telefones?regionalId=${regionalId}`);
  };

  return (
    <div className="container">
      <h3>Cadastro de Regionais</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        {form.id && (
            <div className="form-group">
                <label>ID</label>
                <input type="text" className="form-control" value={form.id} disabled />
            </div>
        )}
        <div className="form-group">
          <label>Nome <span className="required">*</span></label>
          <input
            type="text"
            className="form-control"
            value={form.nome}
            onChange={e => setForm({...form, nome: e.target.value})}
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Endereço</label>
          <input
            type="text"
            className="form-control"
            value={form.endereco}
            onChange={e => setForm({...form, endereco: e.target.value})}
            maxLength={255}
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
            <th>Nome</th>
            <th>Endereço</th>
            <th>Telefones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} className="clickable-row">
              <td>{item.nome}</td>
              <td>{item.endereco}</td>
              <td>
                  <button onClick={(e) => { e.stopPropagation(); handleManageTelefones(item.id); }}>
                      Gerenciar Telefones
                  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RegionalPage;
