import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiscalizacaoService, ParametrosService } from '../../services';
import { RamoAtividade, PontoFiscalizacao, ItemFiscalizacao } from '../../types/models';

const CadastroRoteiroPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fiscalizacaoId, tramiteId } = location.state || {};

  const [ramoSuperiores, setRamosSuperiores] = useState<RamoAtividade[]>([]);
  const [ramosAtividade, setRamosAtividade] = useState<RamoAtividade[]>([]);
  const [pontosFiscalizacao, setPontosFiscalizacao] = useState<PontoFiscalizacao[]>([]);
  const [availableItems, setAvailableItems] = useState<ItemFiscalizacao[]>([]);
  const [existingItems, setExistingItems] = useState<ItemFiscalizacao[]>([]);

  const [selectedRamoSuperior, setSelectedRamoSuperior] = useState('');
  const [selectedRamoAtividade, setSelectedRamoAtividade] = useState('');
  const [selectedPonto, setSelectedPonto] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // For checkboxes

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!fiscalizacaoId || !tramiteId) {
      setMessage('Contexto de fiscalização/trâmite não encontrado.');
      return;
    }
    fetchInitialData();
    fetchExistingItems();
  }, [fiscalizacaoId, tramiteId]);

  const fetchInitialData = async () => {
    try {
      const ramos = await ParametrosService.getRamosAtividade();
      // Filter logic if needed for superiors
      setRamosSuperiores(ramos);
    } catch (error) {
      console.error('Error fetching ramos', error);
    }
  };

  const fetchExistingItems = async () => {
    try {
      const items = await FiscalizacaoService.getTramiteItems(tramiteId);
      setExistingItems(items);
    } catch (error) {
      console.error('Error fetching existing items', error);
    }
  };

  const handleRamoSuperiorChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedRamoSuperior(value);
    setSelectedRamoAtividade('');
    setSelectedPonto('');
    setAvailableItems([]);

    // Fetch sub-ramos or filter locally
    // For now assuming getRamosAtividade works or we re-fetch
    setRamosAtividade([]); // Placeholder
  };

  const handleRamoAtividadeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedRamoAtividade(value);
    setSelectedPonto('');
    setAvailableItems([]);

    if (value) {
        try {
            const pontos = await ParametrosService.getPontosFiscalizacao();
            // Filter by ramo if API supports it
            setPontosFiscalizacao(pontos);
        } catch (error) {
            console.error(error);
        }
    }
  };

  const handlePontoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPonto(value);

    if (value) {
        setLoading(true);
        try {
            const items = await FiscalizacaoService.getItemsByPonto(value);
            setAvailableItems(items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    } else {
        setAvailableItems([]);
    }
  };

  const handleItemCheck = (itemId: string) => {
    setSelectedItems(prev => {
        if (prev.includes(itemId)) {
            return prev.filter(id => id !== itemId);
        } else {
            return [...prev, itemId];
        }
    });
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
        await Promise.all(selectedItems.map(itemId =>
            FiscalizacaoService.addItemToTramite(tramiteId, itemId)
        ));
        setMessage('Itens adicionados com sucesso!');
        setSelectedItems([]);
        fetchExistingItems();
    } catch (error) {
        setMessage('Erro ao adicionar itens.');
    } finally {
        setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!window.confirm('Confirma remoção?')) return;
    setLoading(true);
    try {
        await FiscalizacaoService.removeItemFromTramite(tramiteId, itemId);
        setMessage('Item removido com sucesso!');
        fetchExistingItems();
    } catch (error) {
        setMessage('Erro ao remover item.');
    } finally {
        setLoading(false);
    }
  };

  const handleReturn = () => {
    navigate(-1);
  };

  if (!fiscalizacaoId || !tramiteId) {
      return <div className="container"><div className="alert error">{message}</div><button onClick={handleReturn}>Voltar</button></div>;
  }

  return (
    <div className="container">
      <h3>Cadastro do Roteiro de Fiscalização</h3>
      {message && <div className="alert">{message}</div>}

      {/* Existing Items Table */}
      {existingItems.length > 0 && (
          <>
            <h4>Roteiro do trâmite atual</h4>
            <table className="table">
                <tbody>
                    {existingItems.map(item => (
                        <tr key={item.id}>
                            <td>{item.descricao}</td>
                            <td><button onClick={() => handleRemove(item.id)}>remover</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <br />
          </>
      )}

      {/* Filters */}
      <div className="form-group">
        <label>Ramo de atividade</label>
        <select value={selectedRamoSuperior} onChange={handleRamoSuperiorChange}>
            <option value="">- nenhum -</option>
            {ramoSuperiores.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>Área de atuação</label>
        <select value={selectedRamoAtividade} onChange={handleRamoAtividadeChange}>
            <option value="">- nenhum -</option>
            {ramosAtividade.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>Ponto de fiscalização</label>
        <select value={selectedPonto} onChange={handlePontoChange}>
            <option value="">- nenhum -</option>
            {pontosFiscalizacao.map(p => <option key={p.id} value={p.id}>{p.descricao}</option>)}
        </select>
      </div>

      {/* Available Items */}
      {availableItems.length > 0 && (
          <>
            <h4>Itens de Fiscalização</h4>
            <table className="table">
                <tbody>
                    {availableItems.map(item => (
                        <tr key={item.id}>
                            <td style={{width: '50px'}}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item.id)}
                                    onChange={() => handleItemCheck(item.id)}
                                />
                            </td>
                            <td>{item.descricao}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={handleAdd} disabled={loading || selectedItems.length === 0} style={{marginTop: '10px'}}>ADICIONAR</button>
          </>
      )}

      <div style={{marginTop: '20px'}}>
        <button onClick={handleReturn}>RETORNAR</button>
      </div>
    </div>
  );
};

export default CadastroRoteiroPage;
