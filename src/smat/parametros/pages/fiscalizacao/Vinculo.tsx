import React, { useState, useEffect } from 'react';
import { ParametrosService } from '../../../index';
import { PontoFiscalizacao, ItemFiscalizacao } from '../../../../types/models';

const VinculoPage: React.FC = () => {
  const [pontos, setPontos] = useState<PontoFiscalizacao[]>([]);
  const [allItems, setAllItems] = useState<ItemFiscalizacao[]>([]);

  const [selectedPontoId, setSelectedPontoId] = useState('');
  const [linkedItemIds, setLinkedItemIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [pts, items] = await Promise.all([
        ParametrosService.getPontosFiscalizacao(),
        ParametrosService.getItensFiscalizacao(),
      ]);
      setPontos(pts);
      setAllItems(items);
    } catch (error) {
      setMessage('Erro ao carregar dados iniciais.');
    } finally {
      setLoading(false);
    }
  };

  const handlePontoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPontoId(val);
    setLinkedItemIds([]);

    if (val) {
      setLoading(true);
      try {
        const linkedItems = await ParametrosService.getVinculosItemPonto(val);
        setLinkedItemIds(linkedItems.map(i => i.id));
      } catch (error) {
        setMessage('Erro ao carregar vínculos.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCheckboxChange = (itemId: string) => {
    setLinkedItemIds(prev => {
        if (prev.includes(itemId)) {
            return prev.filter(id => id !== itemId);
        } else {
            return [...prev, itemId];
        }
    });
  };

  const handleSave = async () => {
    if (!selectedPontoId) return;
    setLoading(true);
    try {
      await ParametrosService.updateVinculoItemPonto(selectedPontoId, linkedItemIds);
      setMessage('Vínculos salvos com sucesso!');
    } catch (error) {
      setMessage('Erro ao salvar vínculos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Vínculo Item de Fiscalização / Ponto de Fiscalização</h3>
      {message && <div className="alert">{message}</div>}

      <div className="form-group">
        <label>Ponto de fiscalização</label>
        <select value={selectedPontoId} onChange={handlePontoChange}>
            <option value="">-- Selecione o Ponto --</option>
            {pontos.map(p => <option key={p.id} value={p.id}>{p.descricao}</option>)}
        </select>
      </div>

      {selectedPontoId && (
          <>
            <div className="form-actions">
                <button onClick={handleSave} disabled={loading}>GRAVAR</button>
            </div>

            <h4>Itens de Fiscalização</h4>
            <table className="table">
                <thead>
                    <tr>
                        <th style={{width: '50px'}}>Selecionar</th>
                        <th>Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    {allItems.map(item => (
                        <tr key={item.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={linkedItemIds.includes(item.id)}
                                    onChange={() => handleCheckboxChange(item.id)}
                                />
                            </td>
                            <td>{item.descricao}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </>
      )}
    </div>
  );
};

export default VinculoPage;
