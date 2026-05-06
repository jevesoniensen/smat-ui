import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fiscalizacaoService as FiscalizacaoService } from '../services/FiscalizacaoService';
import { ParametrosService } from '../../index';
import { TramiteFiscalizacao, Status, ItemFiscalizacao } from '../../../types/models';
import '../css/fiscalizacao.css';

const TramitePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fiscalizacaoId } = location.state || {}; // fiscalizacaoId might be string from URL in real app, assuming number/string here

  const [tramites, setTramites] = useState<TramiteFiscalizacao[]>([]);
  const [selectedTramite, setSelectedTramite] = useState<TramiteFiscalizacao | null>(null);
  const [itemsRoteiro, setItemsRoteiro] = useState<ItemFiscalizacao[]>([]);
  const [statusOptions, setStatusOptions] = useState<Status[]>([]);
  const [newStatus, setNewStatus] = useState('');

  // Evaluation state: { itemId: 'conformidadeId' } or similar
  // The JSP implies compliance might be a dropdown or radio.
  // Assuming 'grauConformidadeId' on items.
  const [evaluations, setEvaluations] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!fiscalizacaoId) {
      setMessage('Contexto de fiscalização não encontrado.');
      return;
    }
    fetchInitialData();
  }, [fiscalizacaoId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [list, statusList] = await Promise.all([
        FiscalizacaoService.listTramites(fiscalizacaoId),
        ParametrosService.getStatus(),
      ]);
      setTramites(list);
      setStatusOptions(statusList);
    } catch (error) {
      setMessage('Erro ao carregar trâmites.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (tramite: TramiteFiscalizacao) => {
    setLoading(true);
    try {
      const details = await FiscalizacaoService.getTramite(tramite.id); // assuming id exists
      setSelectedTramite(details);
      setNewStatus(details.statusId || ''); // Assuming statusId exists
      if (details.roteiroItems) {
          setItemsRoteiro(details.roteiroItems);
          // Initialize evaluations
          const initEval: Record<string, string> = {};
          details.roteiroItems.forEach(item => {
              if (item.grauConformidadeId) {
                  initEval[item.id] = item.grauConformidadeId;
              }
          });
          setEvaluations(initEval);
      }
    } catch (error) {
      setMessage('Erro ao carregar detalhes do trâmite.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationChange = (itemId: string, val: string) => {
      setEvaluations(prev => ({ ...prev, [itemId]: val }));
  };

  const handleRoteiro = () => {
      if (selectedTramite) {
          navigate('/fiscalizacao/roteiro', {
              state: { fiscalizacaoId, tramiteId: selectedTramite.id }
          });
      }
  };

  const handleMedidas = () => {
      // Assuming measures are per fiscalizacao, but context suggests per tramite or linked
      // JSP sends tramiteFiscalizacao. Let's send both.
      navigate('/fiscalizacao/medidas', {
          state: { fiscalizacaoId, tramiteId: selectedTramite?.id }
      });
  };

  const handleSave = async () => {
      if (!selectedTramite) return;
      setLoading(true);
      try {
          // Construct array of { itemId, evaluation }
          const evalList = Object.keys(evaluations).map(key => ({
              itemId: key,
              grauConformidadeId: evaluations[key]
          }));
          await FiscalizacaoService.saveTramiteEvaluation(selectedTramite.id, evalList);
          setMessage('Avaliação salva com sucesso!');
      } catch (error) {
          setMessage('Erro ao salvar avaliação.');
      } finally {
          setLoading(false);
      }
  };

  const handleUpdateStatus = async () => {
      if (!selectedTramite || !newStatus) return;
      setLoading(true);
      try {
          await FiscalizacaoService.updateTramiteStatus(selectedTramite.id, newStatus);
          setMessage('Status atualizado com sucesso!');
          // Refresh
          fetchInitialData();
          handleSelect({ ...selectedTramite, statusId: newStatus } as any);
      } catch (error) {
          setMessage('Erro ao atualizar status.');
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

  // Helper to determine if editable. JSP checks 'status' != 1
  // We'll assume '1' or specific code means closed. Let's assume 'CONCLUIDO' code or similar.
  // For now, simple check exists.
  const isEditable = selectedTramite && selectedTramite.status !== 'CONCLUIDO'; // Adjust logic as needed

  return (
    <div className="container">
      <h3>Trâmite da fiscalização</h3>
      {message && <div className="alert">{message}</div>}
      {loading && <div className="loading">Carregando...</div>}

      {selectedTramite && !loading && (
          <div className="details-section">
              <h4>Detalhes do trâmite</h4>

              {/* Roteiro Items / Evaluation */}
              {itemsRoteiro.length > 0 ? (
                  <table className="table">
                      <thead>
                          <tr>
                              <th>Item</th>
                              <th>Avaliação</th>
                          </tr>
                      </thead>
                      <tbody>
                          {itemsRoteiro.map(item => (
                              <tr key={item.id}>
                                  <td>{item.descricao}</td>
                                  <td>
                                      {isEditable ? (
                                          // Placeholder for evaluation input (e.g. checkbox or radio)
                                          // JSP showed "checked" property. Let's assume binary or simple
                                          <input
                                            type="checkbox"
                                            checked={evaluations[item.id] === 'true'}
                                            onChange={e => handleEvaluationChange(item.id, e.target.checked ? 'true' : 'false')}
                                          />
                                      ) : (
                                          <span>{item.grauConformidade?.nome || 'Não avaliado'}</span>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              ) : (
                  <p>Nenhum item no roteiro.</p>
              )}

              {/* Actions */}
              <div className="form-actions mt-10">
                  {isEditable && (
                      <>
                        <button onClick={handleRoteiro}>ROTEIRO</button>
                        {itemsRoteiro.length > 0 && <button onClick={handleSave}>GRAVAR</button>}
                      </>
                  )}
                  <button onClick={handleMedidas}>MEDIDAS CORRETIVAS</button>
              </div>

              {/* Status Change */}
              <div className="status-section status-box mt-20">
                  {isEditable ? (
                      <>
                        <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="form-control">
                            <option value="">-- Status do trâmite --</option>
                            {statusOptions.map(s => <option key={s.id} value={s.id}>{s.descricao}</option>)}
                        </select>
                        <button onClick={handleUpdateStatus} disabled={!newStatus}>ALTERAR STATUS</button>
                      </>
                  ) : (
                      <p><strong>Status:</strong> {selectedTramite.status}</p>
                  )}
              </div>
          </div>
      )}

      <br />

      {/* List of Tramites */}
      <h4>Trâmites da Fiscalização</h4>
      {tramites.length > 0 ? (
          <table className="table">
              <thead>
                  <tr>
                      <th>Nº</th>
                      <th>Data</th>
                      <th>Status</th>
                  </tr>
              </thead>
              <tbody>
                  {tramites.map(t => (
                      <tr key={t.id} onClick={() => handleSelect(t)} className={`clickable-row ${selectedTramite?.id === t.id ? 'selected-row' : ''}`}>
                          <td>{t.id}</td>
                          <td>{new Date(t.dataTramite).toLocaleDateString()}</td>
                          <td>{t.status}</td>
                      </tr>
                  ))}
              </tbody>
          </table>
      ) : (
          <p>Não há nenhum trâmite cadastrado!</p>
      )}

      <div className="mt-20">
        <button onClick={handleReturn}>RETORNAR</button>
      </div>
    </div>
  );
};

export default TramitePage;
