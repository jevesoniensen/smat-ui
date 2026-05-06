import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PessoasService } from '../../index';
import { RepresentanteEmpresa } from '../../../types/models';

const CadastroRepresentantePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { empregadorId, empregadorNome } = location.state || {}; // Expect context

  const [representantes, setRepresentantes] = useState<RepresentanteEmpresa[]>([]);
  const [form, setForm] = useState<Partial<RepresentanteEmpresa>>({
    nome: '',
    // Empregador link is handled via API context or explicitly
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!empregadorId) {
      setMessage('Contexto de empregador não encontrado.');
      return;
    }
    fetchInitialData();
  }, [empregadorId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const list = await PessoasService.listRepresentantes(empregadorId);
      setRepresentantes(list);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: RepresentanteEmpresa) => {
    setForm(item);
  };

  const handleClear = () => {
    setForm({
        id: undefined,
        nome: '',
    });
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empregadorId) return;
    setLoading(true);
    try {
      const payload = { ...form, empresa: { id: empregadorId } }; // Linking logic
      if (form.id) {
        await PessoasService.updateRepresentante(form.id, payload);
        setMessage('Representante atualizado com sucesso!');
      } else {
        await PessoasService.createRepresentante(payload as RepresentanteEmpresa);
        setMessage('Representante criado com sucesso!');
      }
      handleClear();
      fetchInitialData();
    } catch (error) {
      setMessage('Erro ao salvar representante.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await PessoasService.deleteRepresentante(form.id);
      setMessage('Representante excluído com sucesso!');
      handleClear();
      fetchInitialData();
    } catch (error) {
      setMessage('Erro ao excluir representante.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    navigate(-1);
  };

  if (!empregadorId) {
      return <div className="container"><div className="alert error">{message}</div><button onClick={handleReturn}>Voltar</button></div>;
  }

  return (
    <div className="container">
      <h3>Representantes da Empresa</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Empregador</label>
          <input type="text" className="form-control" value={empregadorNome || 'N/A'} readOnly disabled />
        </div>

        <div className="form-group">
          <label>Nome do representante <span className="required">*</span></label>
          <input
            type="text"
            className="form-control"
            value={form.nome}
            onChange={e => setForm({...form, nome: e.target.value})}
            required
            maxLength={60}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleReturn}>RETORNAR</button>
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
          </tr>
        </thead>
        <tbody>
          {representantes.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} className="clickable-row">
              <td>{item.id}</td>
              <td>{item.nome}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CadastroRepresentantePage;
