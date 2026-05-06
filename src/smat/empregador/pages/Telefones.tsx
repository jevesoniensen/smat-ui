import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { empregadorService as EmpregadorService } from '../services/EmpregadorService';
import { TelefoneEmpregador, Empregador } from '../../../types/models';
import '../css/empregador.css';

const TelefonesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const empregadorId = searchParams.get('empregador');

  const [empregador, setEmpregador] = useState<Empregador | null>(null);
  const [telefones, setTelefones] = useState<TelefoneEmpregador[]>([]);
  const [form, setForm] = useState<Partial<TelefoneEmpregador>>({
    ddd: '',
    numero: '',
    descricao: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (empregadorId) {
      fetchData(empregadorId);
    } else {
      setMessage('Empregador não especificado.');
    }
  }, [empregadorId]);

  const fetchData = async (id: string | number) => {
    setLoading(true);
    try {
      const [emp, tels] = await Promise.all([
        EmpregadorService.getEmpregador(id),
        EmpregadorService.getTelefones(id),
      ]);
      setEmpregador(emp);
      setTelefones(tels);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (tel: TelefoneEmpregador) => {
    setForm(tel);
  };

  const handleClear = () => {
    setForm({
      id: undefined,
      ddd: '',
      numero: '',
      descricao: '',
    });
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empregadorId) return;
    setLoading(true);
    try {
      if (form.id) {
        await EmpregadorService.updateTelefone(empregadorId, form.id, form);
        setMessage('Telefone atualizado com sucesso!');
      } else {
        await EmpregadorService.addTelefone(empregadorId, form as TelefoneEmpregador);
        setMessage('Telefone adicionado com sucesso!');
      }
      handleClear();
      fetchData(empregadorId);
    } catch (error) {
      setMessage('Erro ao salvar telefone.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id || !empregadorId) return;
    setLoading(true);
    try {
      await EmpregadorService.deleteTelefone(empregadorId, form.id);
      setMessage('Telefone excluído com sucesso!');
      handleClear();
      fetchData(empregadorId);
    } catch (error) {
      setMessage('Erro ao excluir telefone.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!empregadorId) {
    return <div className="container"><div className="alert error">Empregador não especificado.</div></div>;
  }

  return (
    <div className="container">
      <h3>Telefones - {empregador?.razaoSocial || 'Carregando...'}</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-row">
            <div className="form-group">
            <label>DDD <span className="required">*</span></label>
            <input
                type="text"
                value={form.ddd}
                onChange={(e) => setForm({ ...form, ddd: e.target.value })}
                maxLength={2}
                className="form-control ddd-input"
                required
            />
            </div>
            <div className="form-group">
            <label>Número <span className="required">*</span></label>
            <input
                type="text"
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                maxLength={9}
                className="form-control"
                required
            />
            </div>
        </div>
        <div className="form-group">
          <label>Descrição <span className="required">*</span></label>
          <input
            type="text"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>GRAVAR</button>
          <button type="button" onClick={handleClear} disabled={loading}>LIMPAR</button>
          <button type="button" onClick={handleDelete} disabled={loading || !form.id}>EXCLUIR</button>
          <button type="button" onClick={handleBack} disabled={loading}>VOLTAR</button>
        </div>
      </form>

      <br />

      <table className="table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>DDD</th>
            <th>Número</th>
          </tr>
        </thead>
        <tbody>
          {telefones.map((tel) => (
            <tr key={tel.id} onClick={() => handleSelect(tel)} className="clickable-row">
              <td>{tel.descricao}</td>
              <td>{tel.ddd}</td>
              <td>{tel.numero}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TelefonesPage;
