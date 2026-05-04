import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ParametrosService } from '../../../index';
import { TelefoneRegional } from '../../../../types/models';

const TelefonesRegionaisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const regionalId = searchParams.get('regionalId');

  const [telefones, setTelefones] = useState<TelefoneRegional[]>([]);
  const [form, setForm] = useState<Partial<TelefoneRegional>>({
    numero: '',
    ramal: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (regionalId) {
      fetchData(regionalId);
    } else {
      setMessage('Regional não especificada.');
    }
  }, [regionalId]);

  const fetchData = async (id: string | number) => {
    setLoading(true);
    try {
      const data = await ParametrosService.getTelefonesRegional(id);
      setTelefones(data);
    } catch (error) {
      setMessage('Erro ao carregar telefones.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: TelefoneRegional) => {
    setForm(item);
  };

  const handleClear = () => {
    setForm({
      id: undefined,
      numero: '',
      ramal: '',
    });
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionalId) return;
    setLoading(true);
    try {
      if (form.id) {
        // Assuming update exists or add handles update logic (JSP only had ADD/DELETE usually for sub-tables)
        // DomainServices has delete and add. Let's assume re-add or specific update logic.
        // For now, let's treat as add new if no ID, or warn.
        // Actually I didn't add updateTelefoneRegional to DomainServices, only add/delete.
        // This implies immutable or delete-to-update pattern often used in older apps.
        setMessage('Atualização não suportada, exclua e adicione novamente.');
      } else {
        await ParametrosService.addTelefoneRegional(regionalId, form as TelefoneRegional);
        setMessage('Telefone adicionado com sucesso!');
        handleClear();
        fetchData(regionalId);
      }
    } catch (error) {
      setMessage('Erro ao salvar telefone.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id || !regionalId) return;
    setLoading(true);
    try {
      await ParametrosService.deleteTelefoneRegional(regionalId, form.id);
      setMessage('Telefone excluído com sucesso!');
      handleClear();
      fetchData(regionalId);
    } catch (error) {
      setMessage('Erro ao excluir telefone.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!regionalId) {
      return <div className="container"><div className="alert error">Regional não especificada.</div><button onClick={handleBack}>Voltar</button></div>;
  }

  return (
    <div className="container">
      <h3>Telefones da Regional</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Número <span style={{color:'red'}}>*</span></label>
          <input
            type="text"
            value={form.numero}
            onChange={e => setForm({...form, numero: e.target.value})}
            required
            maxLength={20}
          />
        </div>

        <div className="form-group">
          <label>Ramal</label>
          <input
            type="text"
            value={form.ramal}
            onChange={e => setForm({...form, ramal: e.target.value})}
            maxLength={10}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleBack}>VOLTAR</button>
          <button type="submit" disabled={loading}>GRAVAR</button>
          <button type="button" onClick={handleClear} disabled={loading}>LIMPAR</button>
          <button type="button" onClick={handleDelete} disabled={loading || !form.id}>EXCLUIR</button>
        </div>
      </form>

      <br />

      <table className="table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Ramal</th>
          </tr>
        </thead>
        <tbody>
          {telefones.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} style={{ cursor: 'pointer' }}>
              <td>{item.numero}</td>
              <td>{item.ramal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TelefonesRegionaisPage;
