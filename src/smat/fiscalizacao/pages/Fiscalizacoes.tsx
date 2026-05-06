import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fiscalizacaoService as FiscalizacaoService } from '../services/FiscalizacaoService';
import { Fiscalizacao } from '../../../types/models';
import '../css/fiscalizacao.css';

const FiscalizacoesPage: React.FC = () => {
  const navigate = useNavigate();
  const [fiscalizacoes, setFiscalizacoes] = useState<Fiscalizacao[]>([]);
  const [selected, setSelected] = useState<Fiscalizacao | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await FiscalizacaoService.listFiscalizacoes();
      setFiscalizacoes(data);
    } catch (error) {
      setMessage('Erro ao carregar fiscalizações.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id: string | number) => {
    setLoading(true);
    try {
      const data = await FiscalizacaoService.getFiscalizacao(id);
      setSelected(data);
    } catch (error) {
      setMessage('Erro ao carregar detalhes da fiscalização.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!selected?.id) return;
    setLoading(true);
    try {
      await FiscalizacaoService.finalizeFiscalizacao(selected.id);
      setMessage('Fiscalização finalizada com sucesso!');
      // Refresh data
      const updated = await FiscalizacaoService.getFiscalizacao(selected.id);
      setSelected(updated);
      fetchData();
    } catch (error) {
      setMessage('Erro ao finalizar fiscalização.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (selected) {
      navigate('/fiscalizacao/cadastro', { state: { fiscalizacaoToEdit: selected } });
    }
  };

  const handleTramite = () => {
    if (selected) {
      navigate(`/fiscalizacao/${selected.id}/tramite`);
    }
  };

  return (
    <div className="container">
      <h3>Fiscalizações Cadastradas</h3>
      {message && <div className="alert">{message}</div>}

      {selected && (
        <div className="details-section card">
          <h4>Detalhes da Fiscalização Nº {selected.id}</h4>
          <p><strong>Agente de Saúde:</strong> {selected.fiscal?.nome}</p>
          <p><strong>Empregador:</strong> {selected.empregador?.razaoSocial}</p>
          <p><strong>Data da Abertura:</strong> {new Date(selected.dataFiscalizacao).toLocaleDateString()}</p>
          {selected.dataFim && <p><strong>Data da Finalização:</strong> {new Date(selected.dataFim).toLocaleDateString()}</p>}
          <p><strong>Título:</strong> {selected.titulo}</p>
          <p><strong>Observações Gerais:</strong> {selected.obsGerais}</p>

          <div className="form-actions">
            {selected.status === 'ABERTO' && (
              <button onClick={handleEdit}>ATUALIZAR DADOS</button>
            )}
            <button onClick={handleTramite}>TRÂMITE(S)</button>
            {selected.status === 'ABERTO' && (
              <button onClick={handleFinalize} disabled={loading}>FINALIZAR</button>
            )}
          </div>
        </div>
      )}

      <br />

      <table className="table">
        <thead>
          <tr>
            <th>Nº</th>
            <th>Título</th>
            <th>Empregador</th>
            <th>Data Abertura</th>
          </tr>
        </thead>
        <tbody>
          {fiscalizacoes.map((f) => (
            <tr key={f.id} onClick={() => handleSelect(f.id)} className="clickable-row">
              <td>{f.id}</td>
              <td>{f.titulo}</td>
              <td>{f.empregador?.razaoSocial}</td>
              <td>{new Date(f.dataFiscalizacao).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FiscalizacoesPage;
