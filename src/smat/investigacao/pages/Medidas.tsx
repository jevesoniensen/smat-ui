import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { investigacaoService as InvestigacaoService } from '../services/InvestigacaoService';
import { ParametrosService } from '../../index';
import { MedidaCorretivaInvestigacao, TipoMedidaCorretiva } from '../../../types/models';
import '../css/investigacao.css';

const MedidasInvestigacaoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { investigacaoId } = location.state || {};

  const [medidas, setMedidas] = useState<MedidaCorretivaInvestigacao[]>([]);
  const [tiposMedida, setTiposMedida] = useState<TipoMedidaCorretiva[]>([]);

  // Local state for form fields matching JSP
  const [tipoMedidaVal, setTipoMedidaVal] = useState('');
  const [prazoDias, setPrazoDias] = useState('');
  const [observacao, setObservacao] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!investigacaoId) {
      setMessage('Contexto de investigação não encontrado.');
      return;
    }
    fetchData();
  }, [investigacaoId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medidasData, tiposData] = await Promise.all([
        InvestigacaoService.getMedidasCorretivas(investigacaoId),
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

  const handleSelect = (item: MedidaCorretivaInvestigacao) => {
    setSelectedId(item.id);
    // Map fields
    // Assuming item structure matches what we need
    // item.descricao -> observacao
    // item.responsavel? item.dataPrevista?
    // The JSP used 'tipoMedidaCorretiva' ID and displayed name.
    // We'll need to adapt based on actual API response structure.
    setObservacao(item.descricao);
    // setTipoMedidaVal(item.tipoId);
    // setPrazoDias(item.prazo);
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
          // tipoId: tipoMedidaVal,
          descricao: observacao,
          // prazoDias: parseInt(prazoDias),
      };

      if (selectedId) {
        await InvestigacaoService.updateMedidaCorretiva(investigacaoId, selectedId, payload);
        setMessage('Medida corretiva atualizada com sucesso!');
      } else {
        await InvestigacaoService.addMedidaCorretiva(investigacaoId, payload);
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
      await InvestigacaoService.deleteMedidaCorretiva(investigacaoId, selectedId);
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

  if (!investigacaoId) {
      return <div className="container"><div className="alert error">{message}</div><button onClick={handleReturn}>Voltar</button></div>;
  }

  return (
    <div className="container">
      <h3>Medidas corretivas (Investigação)</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Medida corretiva <span className="required">*</span></label>
          <select value={tipoMedidaVal} onChange={e => setTipoMedidaVal(e.target.value)} required>
            <option value="">-- Tipo de medida corretiva --</option>
            {tiposMedida.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Prazo para cumprimento <span className="required">*</span></label>
          <input
            type="number"
            value={prazoDias}
            onChange={e => setPrazoDias(e.target.value)}
            required
            maxLength={6}
          />
        </div>

        <div className="form-group">
          <label>Observações <span className="required">*</span></label>
          <textarea
            rows={5}
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleReturn}>RETORNAR</button>
          <button type="submit" disabled={loading}>GRAVAR</button>
          <button type="button" onClick={handleClear} disabled={loading}>LIMPAR</button>
          <button type="button" onClick={handleDelete} disabled={loading || !selectedId}>EXCLUIR</button>
        </div>
      </form>

      <br />

      <table className="table">
        <thead>
          <tr>
            <th>Medida corretiva</th>
            <th>Prazo para cumprimento</th>
          </tr>
        </thead>
        <tbody>
          {medidas.map((item) => (
            <tr key={item.id} onClick={() => handleSelect(item)} className="clickable-row">
              <td>{item.descricao}</td>
              {/* Using description as placeholder if type name isn't directly available or mapped */}
              <td>{item.dataPrevista ? new Date(item.dataPrevista).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MedidasInvestigacaoPage;


