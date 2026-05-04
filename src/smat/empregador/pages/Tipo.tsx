import React, { useState, useEffect } from 'react';
import { empregadorService as TipoEmpregadorService } from '../services/EmpregadorService';
import { TipoEmpregador } from '../../../types/models';

const TipoEmpregadorPage: React.FC = () => {
  const [tipos, setTipos] = useState<TipoEmpregador[]>([]);
  const [form, setForm] = useState<Partial<TipoEmpregador>>({
    descricao: '',
    codigo: '', // Maps to 'docIdentificador' in JSP
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await TipoEmpregadorService.listTiposEmpregador();
      setTipos(data);
    } catch (error) {
      setMessage('Erro ao carregar tipos de empregador.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: TipoEmpregador) => {
    setForm(item);
  };

  const handleClear = () => {
    setForm({
      id: undefined,
      descricao: '',
      codigo: '',
    });
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (form.id) {
        await TipoEmpregadorService.updateTipoEmpregador(form.id, form);
        setMessage('Tipo de empregador atualizado com sucesso!');
      } else {
        await TipoEmpregadorService.createTipoEmpregador(form as TipoEmpregador);
        setMessage('Tipo de empregador criado com sucesso!');
      }
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao salvar tipo de empregador.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await TipoEmpregadorService.deleteTipoEmpregador(form.id);
      setMessage('Tipo de empregador excluído com sucesso!');
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao excluir tipo de empregador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Tipos de Empregadores</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        {form.id && (
            <div className="form-group">
                <label>ID</label>
                <input type="text" value={form.id} disabled />
            </div>
        )}
        <div className="form-group">
          <label>Nome (Descrição)</label>
          <input
            type="text"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Documento Identificador</label>
          <input
            type="text"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
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
            <th>Nº</th>
            <th>Nome</th>
            <th>Documento Identificador</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} style={{ cursor: 'pointer' }}>
              <td>{item.id}</td>
              <td>{item.descricao}</td>
              <td>{item.codigo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TipoEmpregadorPage;
