import React, { useState, useEffect } from 'react';
import { ParametrosService } from '../../../index';
import { PontoFiscalizacao } from '../../../../types/models';

const PontosFiscalizacaoPage: React.FC = () => {
  const [items, setItems] = useState<PontoFiscalizacao[]>([]);
  const [form, setForm] = useState<Partial<PontoFiscalizacao>>({
    descricao: '',
    endereco: '',
    telefone: '',
    responsavel: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await ParametrosService.getPontosFiscalizacao();
      setItems(data);
    } catch (error) {
      setMessage('Erro ao carregar pontos de fiscalização.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: PontoFiscalizacao) => {
    setForm(item);
  };

  const handleClear = () => {
    setForm({
      id: undefined,
      descricao: '',
      endereco: '',
      telefone: '',
      responsavel: '',
    });
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (form.id) {
        await ParametrosService.updatePontoFiscalizacao(form.id, form);
        setMessage('Ponto atualizado com sucesso!');
      } else {
        await ParametrosService.createPontoFiscalizacao(form as PontoFiscalizacao);
        setMessage('Ponto criado com sucesso!');
      }
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao salvar ponto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await ParametrosService.deletePontoFiscalizacao(form.id);
      setMessage('Ponto excluído com sucesso!');
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao excluir ponto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Cadastro de Pontos de Fiscalização</h3>
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
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Endereço</label>
          <input
            type="text"
            value={form.endereco}
            onChange={e => setForm({...form, endereco: e.target.value})}
            maxLength={255}
          />
        </div>

        <div className="form-group">
          <label>Telefone</label>
          <input
            type="text"
            value={form.telefone}
            onChange={e => setForm({...form, telefone: e.target.value})}
            maxLength={20}
          />
        </div>

        <div className="form-group">
          <label>Responsável</label>
          <input
            type="text"
            value={form.responsavel}
            onChange={e => setForm({...form, responsavel: e.target.value})}
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
            <th>Responsável</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} style={{ cursor: 'pointer' }}>
              <td>{item.descricao}</td>
              <td>{item.responsavel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PontosFiscalizacaoPage;
