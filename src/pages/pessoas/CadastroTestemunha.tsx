import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PessoasService, ParametrosService } from '../../services';
import { Testemunha, Estado, Municipio } from '../../types/models';

const CadastroTestemunhaPage: React.FC = () => {
  const navigate = useNavigate();

  const [testemunhas, setTestemunhas] = useState<Testemunha[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  const [form, setForm] = useState<Partial<Testemunha>>({
    nome: '',
    estadoId: '',
    municipioId: '',
    rua: '',
    bairro: '',
    numero: '',
    complemento: '',
    cep: '',
    ddd: '',
    telefone: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [list, estadosList] = await Promise.all([
        PessoasService.listTestemunhas(),
        ParametrosService.getEstados(),
      ]);
      setTestemunhas(list);
      setEstados(estadosList);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm({ ...form, estadoId: value, municipioId: '' });

    if (value) {
      setLoading(true);
      try {
        const muns = await ParametrosService.getMunicipios(value);
        setMunicipios(muns);
      } catch (error) {
        console.error('Error fetching municipios', error);
      } finally {
        setLoading(false);
      }
    } else {
      setMunicipios([]);
    }
  };

  const handleSelect = (item: Testemunha) => {
    setForm(item);
    // Load municipalities if needed
    if (item.estadoId) {
      ParametrosService.getMunicipios(item.estadoId).then(setMunicipios);
    }
  };

  const handleClear = () => {
    setForm({
        id: undefined,
        nome: '',
        estadoId: '',
        municipioId: '',
        rua: '',
        bairro: '',
        numero: '',
        complemento: '',
        cep: '',
        ddd: '',
        telefone: '',
    });
    setMunicipios([]);
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (form.id) {
        await PessoasService.updateTestemunha(form.id, form);
        setMessage('Testemunha atualizada com sucesso!');
      } else {
        await PessoasService.createTestemunha(form as Testemunha);
        setMessage('Testemunha criada com sucesso!');
      }
      handleClear();
      const list = await PessoasService.listTestemunhas();
      setTestemunhas(list);
    } catch (error) {
      setMessage('Erro ao salvar testemunha.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await PessoasService.deleteTestemunha(form.id);
      setMessage('Testemunha excluída com sucesso!');
      handleClear();
      const list = await PessoasService.listTestemunhas();
      setTestemunhas(list);
    } catch (error) {
      setMessage('Erro ao excluir testemunha.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    navigate(-1);
  };

  return (
    <div className="container">
      <h3>Cadastro de Testemunhas</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Nome <span style={{color:'red'}}>*</span></label>
          <input
            type="text"
            value={form.nome}
            onChange={e => setForm({...form, nome: e.target.value})}
            required
            maxLength={60}
          />
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Estado</label>
                <select value={form.estadoId} onChange={handleEstadoChange}>
                    <option value="">-- Estado --</option>
                    {estados.map(e => <option key={e.id} value={e.id}>{e.sigla}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label>Município</label>
                <select value={form.municipioId} onChange={e => setForm({...form, municipioId: e.target.value})}>
                    <option value="">-- Municipio --</option>
                    {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
            </div>
        </div>

        <div className="form-group">
            <label>Rua</label>
            <input type="text" value={form.rua} onChange={e => setForm({...form, rua: e.target.value})} maxLength={80} />
        </div>

        <div className="form-group">
            <label>Bairro</label>
            <input type="text" value={form.bairro} onChange={e => setForm({...form, bairro: e.target.value})} maxLength={60} />
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Número</label>
                <input type="text" value={form.numero} onChange={e => setForm({...form, numero: e.target.value})} maxLength={5} />
            </div>
            <div className="form-group">
                <label>Complemento</label>
                <input type="text" value={form.complemento} onChange={e => setForm({...form, complemento: e.target.value})} maxLength={10} />
            </div>
            <div className="form-group">
                <label>CEP</label>
                <input type="text" value={form.cep} onChange={e => setForm({...form, cep: e.target.value})} maxLength={8} />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Telefone</label>
                <div style={{display: 'flex', gap: '5px'}}>
                    <input
                        type="text"
                        value={form.ddd}
                        onChange={e => setForm({...form, ddd: e.target.value})}
                        maxLength={2}
                        style={{width: '50px'}}
                        placeholder="DDD"
                    />
                    <input
                        type="text"
                        value={form.telefone}
                        onChange={e => setForm({...form, telefone: e.target.value})}
                        maxLength={8}
                        placeholder="Número"
                    />
                </div>
            </div>
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
          {testemunhas.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} style={{ cursor: 'pointer' }}>
              <td>{item.id}</td>
              <td>{item.nome}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CadastroTestemunhaPage;
