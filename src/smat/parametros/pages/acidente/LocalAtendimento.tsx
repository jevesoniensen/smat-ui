import React, { useState, useEffect } from 'react';
import { ParametrosService } from '../../../index';
import { LocalAtendimento, Estado, Municipio } from '../../../../types/models';

const LocalAtendimentoPage: React.FC = () => {
  const [items, setItems] = useState<LocalAtendimento[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  const [form, setForm] = useState<Partial<LocalAtendimento>>({
    nome: '',
  });
  const [estadoId, setEstadoId] = useState('');
  const [municipioId, setMunicipioId] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [list, ufs] = await Promise.all([
        ParametrosService.getLocaisAtendimento(),
        ParametrosService.getEstados(),
      ]);
      setItems(list);
      setEstados(ufs);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setEstadoId(val);
    setMunicipioId('');
    if (val) {
      setLoading(true);
      try {
        const muns = await ParametrosService.getMunicipios(val);
        setMunicipios(muns);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      setMunicipios([]);
    }
  };

  const handleSelect = (item: LocalAtendimento) => {
    setForm(item);
  };

  const handleClear = () => {
    setForm({
      id: undefined,
      nome: '',
    });
    setEstadoId('');
    setMunicipioId('');
    setMunicipios([]);
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...form, municipioId };
      if (form.id) {
        await ParametrosService.updateLocalAtendimento(form.id, payload);
        setMessage('Local de atendimento atualizado com sucesso!');
      } else {
        await ParametrosService.createLocalAtendimento(payload);
        setMessage('Local de atendimento criado com sucesso!');
      }
      handleClear();
      const list = await ParametrosService.getLocaisAtendimento();
      setItems(list);
    } catch (error) {
      setMessage('Erro ao salvar local de atendimento.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await ParametrosService.deleteLocalAtendimento(form.id);
      setMessage('Local de atendimento excluído com sucesso!');
      handleClear();
      const list = await ParametrosService.getLocaisAtendimento();
      setItems(list);
    } catch (error) {
      setMessage('Erro ao excluir local de atendimento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Cadastro de Locais de atendimento</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Nome <span className="required">*</span></label>
          <input
            type="text"
            className="form-control"
            value={form.nome}
            onChange={e => setForm({...form, nome: e.target.value})}
            required
            maxLength={80}
          />
        </div>

        <div className="form-group">
          <label>Estado <span className="required">*</span></label>
          <select className="form-control" value={estadoId} onChange={handleEstadoChange} required>
            <option value="">-- Estado --</option>
            {estados.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Município <span className="required">*</span></label>
          <select className="form-control" value={municipioId} onChange={e => setMunicipioId(e.target.value)} required>
            <option value="">-- Municipio --</option>
            {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
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
            <th>Local de atendimento</th>
            <th>Município</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} className="clickable-row">
              <td>{item.nome}</td>
              <td>{/* Display municipio name */}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LocalAtendimentoPage;
