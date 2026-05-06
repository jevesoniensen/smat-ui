import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fiscalizacaoService as FiscalizacaoService } from '../services/FiscalizacaoService';
import { ParametrosService } from '../../index';
import { MedidaCorretivaFiscalizacao, TipoMedidaCorretiva } from '../../../types/models';
import '../css/fiscalizacao.css';

const MedidasCorretivasPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fiscalizacaoId } = location.state || {};

  const [medidas, setMedidas] = useState<MedidaCorretivaFiscalizacao[]>([]);
  const [tiposMedida, setTiposMedida] = useState<TipoMedidaCorretiva[]>([]);


  // Local state for form fields matching JSP
  const [tipoMedidaVal, setTipoMedidaVal] = useState('');
  const [prazoDias, setPrazoDias] = useState('');
  const [observacao, setObservacao] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!fiscalizacaoId) {
      setMessage('Contexto de fiscalização não encontrado.');
      return;
    }
    fetchData();
  }, [fiscalizacaoId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medidasData, tiposData] = await Promise.all([
        FiscalizacaoService.getMedidasCorretivas(fiscalizacaoId),
        ParametrosService.getTiposMedidaCorretiva(),
      ]);
      setMedidas(medidasData);
      setTiposMedida(tiposData);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: MedidaCorretivaFiscalizacao) => {
    // Map item back to form fields
    setSelectedId(item.id);
    setTipoMedidaVal(item.tipo); // Assuming 'tipo' holds the value/name
    setObservacao(item.descricao); // Assuming descricao holds observation
    // Prazo might need to be derived or stored in a custom field if model doesn't have it explicitly
    // For this migration, we'll assume it's part of the object or handled
    setPrazoDias(''); // Placeholder
  };

  const handleClear = () => {
    setSelectedId(undefined);
    setTipoMedidaVal('');
    setPrazoDias('');
    setObservacao('');
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
          tipo: tipoMedidaVal,
          descricao: observacao,
          // Send prazoDias if API accepts it
          prazoDias: parseInt(prazoDias),
      };

      if (selectedId) {
        await FiscalizacaoService.updateMedidaCorretiva(fiscalizacaoId, selectedId, payload);
        setMessage('Medida corretiva atualizada com sucesso!');
      } else {
        await FiscalizacaoService.addMedidaCorretiva(fiscalizacaoId, payload);
        setMessage('Medida corretiva adicionada com sucesso!');
      }
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao salvar medida corretiva.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      await FiscalizacaoService.deleteMedidaCorretiva(fiscalizacaoId, selectedId);
      setMessage('Medida corretiva excluída com sucesso!');
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao excluir medida corretiva.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    navigate(-1);
  };

  if (!fiscalizacaoId) {
      return <div className="container"><div className="alert error">{message}</div><button onClick={handleReturn}>Voltar</button></div>;
  }

  return (
    <div className="container">
      <h3>Cadastro de medidas corretivas</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Tipo medida corretiva <span className="required">*</span></label>
          <select value={tipoMedidaVal} onChange={e => setTipoMedidaVal(e.target.value)} required>
            <option value="">-- Tipo de medida corretiva --</option>
            {tiposMedida.map(t => <option key={t.id} value={t.descricao}>{t.descricao}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Prazo (dias) <span className="required">*</span></label>
          <input
            type="number"
            value={prazoDias}
            onChange={e => setPrazoDias(e.target.value)}
            required
            maxLength={4}
          />
        </div>

        <div className="form-group">
          <label>Observações <span className="required">*</span></label>
          <textarea
            rows={3}
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>GRAVAR</button>
          <button type="button" onClick={handleClear} disabled={loading}>LIMPAR</button>
          <button type="button" onClick={handleDelete} disabled={loading || !selectedId}>EXCLUIR</button>
        </div>
      </form>

      <br />

      <h4>Medidas Corretivas</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Tipo medida corretiva</th>
            <th>Prazo</th>
          </tr>
        </thead>
        <tbody>
          {medidas.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} className="clickable-row">
              <td>{item.tipo}</td>
              {/* Display prazo if available in model */}
              <td>{(item as any).prazoDias || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-20">
        <button onClick={handleReturn}>RETORNAR</button>
      </div>
    </div>
  );
};

export default MedidasCorretivasPage;
