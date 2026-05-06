import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { investigacaoService as InvestigacaoService } from '../services/InvestigacaoService';
import { Investigacao } from '../../../types/models';
import '../css/investigacao.css';

const DetalhesInvestigacaoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Check if we navigated here with a specific ID selected
  const initialId = location.state?.investigacaoId;

  const [investigacoes, setInvestigacoes] = useState<Investigacao[]>([]);
  const [selected, setSelected] = useState<Investigacao | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (initialId) {
      handleSelect(initialId);
    }
  }, [initialId]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await InvestigacaoService.listInvestigacoes();
      setInvestigacoes(data);
    } catch (error) {
      setMessage('Erro ao carregar lista de investigações.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id: number) => {
    setLoading(true);
    try {
      const details = await InvestigacaoService.getInvestigacao(id);
      setSelected(details);
    } catch (error) {
      setMessage('Erro ao carregar detalhes da investigação.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    if (selected) {
      navigate('/investigacao/cadastro', { state: { investigacaoId: selected.id } });
    }
  };

  const handleDepoimentos = () => {
    if (selected) {
      navigate('/investigacao/depoimentos', { state: { investigacaoId: selected.id } });
    }
  };

  const handleMedidas = () => {
    if (selected) {
      navigate('/investigacao/medidas', { state: { investigacaoId: selected.id } });
    }
  };

  return (
    <div className="container">
      <h3>Investigações</h3>
      {message && <div className="alert">{message}</div>}
      {loading && <div className="loading">Carregando...</div>}

      {/* Detail View */}
      {selected && !loading && (
        <div className="details-section card">
          <h4>Investigação nº {selected.id}</h4>
          <table className="table-details w-100 mb-20">
            <tbody>
              <tr>
                <td className="w-150px"><strong>Agente responsável:</strong></td>
                <td>{selected.responsavel?.nome}</td>
              </tr>
              <tr>
                <td><strong>Acidente nº:</strong></td>
                <td>{selected.acidente?.id}</td>
              </tr>
              <tr>
                <td><strong>Data de abertura:</strong></td>
                <td>{selected.dataInicio ? new Date(selected.dataInicio).toLocaleDateString() : '-'}</td>
              </tr>
              <tr>
                <td><strong>Data de finalização:</strong></td>
                <td>{selected.dataFim ? new Date(selected.dataFim).toLocaleDateString() : '-'}</td>
              </tr>
              <tr>
                <td><strong>Descrição/Motivo:</strong></td>
                <td>{selected.descricao}</td>
              </tr>
            </tbody>
          </table>

          {/* Depoimentos */}
          <h5>Depoimentos</h5>
          {selected.depoimentos && selected.depoimentos.length > 0 ? (
            <table className="table mb-20">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nome</th>
                  <th>Data</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {selected.depoimentos.map(dep => (
                  <tr key={dep.id}>
                    <td>{dep.tipo}</td>
                    <td>{dep.testemunha?.nome}</td>
                    <td>{new Date(dep.dataDepoimento).toLocaleString()}</td>
                    <td>{dep.relato}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhum depoimento registrado.</p>}

          {/* Medidas Corretivas */}
          <h5>Medidas Corretivas</h5>
          {selected.medidasCorretivasInvestigacao && selected.medidasCorretivasInvestigacao.length > 0 ? (
            <table className="table mb-20">
              <thead>
                <tr>
                  <th>Medida</th>
                  <th>Prazo (dias)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {selected.medidasCorretivasInvestigacao.map(med => (
                  <tr key={med.id}>
                    <td>{med.descricao}</td>
                    <td>{med.dataPrevista ? new Date(med.dataPrevista).toLocaleDateString() : '-'}</td>
                    <td>{med.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhuma medida corretiva registrada.</p>}

          {/* Actions */}
          {!selected.dataFim && (
            <div className="form-actions">
              <button onClick={handleUpdate}>ATUALIZAR DADOS</button>
              <button onClick={handleDepoimentos}>DEPOIMENTOS</button>
              <button onClick={handleMedidas}>MEDIDAS CORRETIVAS</button>
            </div>
          )}
        </div>
      )}

      <br />

      {/* List View */}
      <h4>Lista de Investigações</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Investigação</th>
            <th>Agente Responsável</th>
            <th>Motivo</th>
            <th>Trabalhador</th>
            <th>Data Acidente</th>
            <th>Data Abertura</th>
            <th>Data Finalização</th>
          </tr>
        </thead>
        <tbody>
          {investigacoes.map((inv) => (
            <tr key={inv.id} onClick={() => handleSelect(parseInt(inv.id))} className={`clickable-row ${selected?.id === inv.id ? 'selected-row' : ''}`}>
              <td>{inv.id}</td>
              <td>{inv.responsavel?.nome}</td>
              <td>{inv.descricao}</td>
              <td>{inv.acidente?.trabalhador?.nome}</td>
              <td>{inv.acidente?.dataAcidente ? new Date(inv.acidente.dataAcidente).toLocaleDateString() : '-'}</td>
              <td>{inv.dataInicio ? new Date(inv.dataInicio).toLocaleDateString() : '-'}</td>
              <td>{inv.dataFim ? new Date(inv.dataFim).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetalhesInvestigacaoPage;
