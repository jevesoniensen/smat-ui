import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RelatorioService } from '../../services';
import { RelatorioSalvo } from '../../types/models';

const RelatorioSalvoPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<RelatorioSalvo[]>([]);
  const [selectedReport, setSelectedReport] = useState<RelatorioSalvo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await RelatorioService.getSavedReports();
      setReports(data);
    } catch (error) {
      setMessage('Erro ao carregar relatórios salvos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (report: RelatorioSalvo) => {
    setSelectedReport(report);
  };

  const handleGenerate = () => {
    if (selectedReport) {
      // Navigate to Relatorio display page with the saved report data
      // Note: The saved report might store the parameters or the full data.
      // If it stores parameters, we might need to re-generate.
      // JSP implies `relSalvo` has data.
      // We pass the full object to the Relatorio page.
      navigate('/relatorios/relatorio', { state: { relatorio: selectedReport } });
    }
  };

  const handleDelete = async () => {
    if (!selectedReport) return;
    if (!window.confirm('Confirma a exclusão deste relatório?')) return;

    setLoading(true);
    try {
      await RelatorioService.deleteSavedReport(selectedReport.id);
      setMessage('Relatório excluído com sucesso!');
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      setMessage('Erro ao excluir relatório.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Relatórios salvos</h3>
      {message && <div className="alert">{message}</div>}

      {/* Detail View */}
      {selectedReport ? (
        <div className="card" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
          <h4>Detalhes do Relatório</h4>
          <p><strong>Título:</strong> {selectedReport.nomeRelatorio}</p>
          <p><strong>Data de criação:</strong> {new Date(selectedReport.dataSalvamento).toLocaleString()}</p>
          <p><strong>Período:</strong> {new Date(selectedReport.parametros.dataInicio).toLocaleDateString()} à {new Date(selectedReport.parametros.dataFim).toLocaleDateString()}</p>
          {/* <p><strong>Texto:</strong> {selectedReport.texto}</p> */}

          <div className="form-actions">
            <button onClick={handleGenerate}>GERAR</button>
            <button onClick={handleDelete} disabled={loading}>EXCLUIR</button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', margin: '20px' }}>
          <h4>Selecione um relatório salvo na lista abaixo</h4>
        </div>
      )}

      {/* List View */}
      <table className="table">
        <thead>
          <tr>
            <th>Relatório</th>
            <th>Data de criação</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((rep) => (
            <tr key={rep.id} onClick={() => handleSelect(rep)} style={{ cursor: 'pointer', backgroundColor: selectedReport?.id === rep.id ? '#f0f0f0' : 'inherit' }}>
              <td>{rep.nomeRelatorio}</td>
              <td>Salvo em: {new Date(rep.dataSalvamento).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RelatorioSalvoPage;
