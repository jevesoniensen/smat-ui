import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { investigacaoService as InvestigacaoService } from '../services/InvestigacaoService';
import { ParametrosService } from '../../index';
import { MedidaCorretivaInvestigacao, TipoMedidaCorretiva } from '../../../types/models';
import '../css/investigacao.css';
import { removeNonDigits } from '../../common/formatting';

const MedidasCorretivasInvestigacaoPage: React.FC = () => {
  const { investigacaoId } = useParams<{ investigacaoId: string }>();
  const navigate = useNavigate();

  const [medidasCorretivas, setMedidasCorretivas] = useState<MedidaCorretivaInvestigacao[]>([]);
  const [tiposMedidaCorretiva, setTiposMedidaCorretiva] = useState<TipoMedidaCorretiva[]>([]);
  const [selectedMedida, setSelectedMedida] = useState<Partial<MedidaCorretivaInvestigacao>>({
    id: '',
    tipoId: '',
    prazoDias: undefined,
    observacao: '',
  });

  const [prazoDiasStr, setPrazoDiasStr] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!investigacaoId) return;
    setLoading(true);
    try {
      const [medidas, tipos] = await Promise.all([
        InvestigacaoService.getMedidasCorretivas(investigacaoId),
        ParametrosService.getTiposMedidaCorretiva(),
      ]);
      setMedidasCorretivas(medidas);
      setTiposMedidaCorretiva(tipos);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [investigacaoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedMedida(prev => ({ ...prev, [name]: value }));
  };

  const handlePrazoDiasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = removeNonDigits(e.target.value);
    setPrazoDiasStr(value);
    setSelectedMedida(prev => ({ ...prev, prazoDias: parseInt(value, 10) || 0 }));
  };

  const handleClearForm = () => {
    setSelectedMedida({ id: '', tipoId: '', prazoDias: undefined, observacao: '' });
    setPrazoDiasStr('');
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigacaoId) return;
    setLoading(true);
    try {
      if (selectedMedida.id) {
        await InvestigacaoService.updateMedidaCorretiva(investigacaoId, selectedMedida.id, selectedMedida);
        setMessage('Medida corretiva atualizada com sucesso!');
      } else {
        await InvestigacaoService.addMedidaCorretiva(investigacaoId, selectedMedida);
        setMessage('Medida corretiva salva com sucesso!');
      }
      handleClearForm();
      fetchData();
    } catch (error) {
      setMessage('Erro ao salvar medida corretiva.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!investigacaoId || !selectedMedida.id || !window.confirm('Tem certeza que deseja excluir esta medida corretiva?')) return;
    setLoading(true);
    try {
      await InvestigacaoService.deleteMedidaCorretiva(investigacaoId, selectedMedida.id);
      setMessage('Medida corretiva excluída com sucesso!');
      handleClearForm();
      fetchData();
    } catch (error) {
      setMessage('Erro ao excluir medida corretiva.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedida = (medida: MedidaCorretivaInvestigacao) => {
    setSelectedMedida({
      ...medida,
      tipoId: medida.tipoId,
      prazoDias: medida.prazoDias,
    });
    setPrazoDiasStr(medida.prazoDias?.toString() || '');
    setMessage('');
  };

  return (
    <div className="container">
      <h3>Medidas Corretivas da Investigação</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Medida Corretiva</label>
          <select
            name="tipoId"
            value={selectedMedida.tipoId || ''}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            <option value="">-- Tipo de medida corretiva --</option>
            {tiposMedidaCorretiva.map(tipo => (
              <option key={tipo.id} value={tipo.id}>{tipo.descricao}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Prazo para Cumprimento (dias)</label>
          <input
            type="text"
            name="prazoDias"
            value={prazoDiasStr}
            onChange={handlePrazoDiasChange}
            maxLength={6}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Observações</label>
          <textarea
            name="observacao"
            rows={5}
            value={selectedMedida.observacao || ''}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Gravar'}</button>
          <button type="button" onClick={handleClearForm} disabled={loading}>Limpar</button>
          <button type="button" onClick={handleDelete} disabled={loading || !selectedMedida.id}>Excluir</button>
          <button type="button" onClick={() => navigate(-1)}>RETORNAR</button>
        </div>
      </form>

      <br />

      <h4>Medidas Corretivas Cadastradas</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Medida Corretiva</th>
            <th>Prazo para Cumprimento</th>
          </tr>
        </thead>
        <tbody>
          {medidasCorretivas.map((medida) => (
            <tr key={medida.id} onClick={() => handleSelectMedida(medida)} className="clickable-row">
              <td>
                {tiposMedidaCorretiva.find(t => t.id === medida.tipoId)?.descricao || medida.tipoId}
              </td>
              <td>
                {medida.prazoDias} dias
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MedidasCorretivasInvestigacaoPage;
